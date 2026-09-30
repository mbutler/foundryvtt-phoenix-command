import {resolveImpulseBatch} from './impulse-batch.mjs';
import {knockoutValue} from './allowance.mjs';
import {incapacitationEffect,incapacitationEffectTime} from './incapacitation-effects.mjs';
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export const woundInImpulse=(injury,timing,combatUuid)=>injury.status==='active'&&injury.combatUuid===combatUuid&&injury.phase===timing.phase&&injury.impulse===timing.impulse;

// Encounter identity is necessary: phase/impulse numbers repeat in other combats.
// Unscoped legacy wounds remain carried damage, never guessed to be new wounds.
export function impulseInputs(participants,timing,combatUuid){
  const shots=[],combatants={},actors={},wounds=[],knockDowns={};
  const seen=new Set();
  for(const participant of [...participants].sort((a,b)=>a.id.localeCompare(b.id))){
    const {id,uuid,system}=participant;
    if(seen.has(uuid))throw new Error('Multiple combatants share an Actor. Use independent token Actors before totalling injuries.');
    seen.add(uuid);let carried=0;
    actors[id]={uuid,condition:system.condition.consciousness};
    // §5.12 (optional): this impulse's Knock Down records, worst first; the batch keeps the worst.
    const knocks=Object.values(participant.knockDowns??{}).filter(k=>k&&k.combatUuid===combatUuid&&k.phase===timing.phase&&k.impulse===timing.impulse);
    const rank=l=>l==='down'?4:[1,2,4].indexOf(l)+1;
    const worst=knocks.sort((a,b)=>rank(b.level)-rank(a.level))[0];
    if(worst)knockDowns[id]={level:worst.level,detail:worst.detail};
    for(const [key,injury] of Object.entries(system.injuries??{}).sort(([a],[b])=>a.localeCompare(b))){
      if(injury.status!=='active')continue;
      wounds.push({actorUuid:uuid,key,injury:structuredClone(injury)});
      // Shock rides with the wound only while it is this impulse's: §3.3 makes it effective
      // "only on the Impulse it is inflicted", so a carried wound contributes none.
      if(woundInImpulse(injury,timing,combatUuid))shots.push({id:`${id}:${key}`,attackerId:injury.attackId||injury.resolutionId||'adjudicated',targetId:id,physicalDamage:injury.physicalDamage,shockPhysicalDamage:injury.shockPhysicalDamage??0});
      else carried+=injury.physicalDamage;
    }
    const kv=knockoutValue({will:system.attributes.will,gunCombatSkill:system.skills.gun,handToHandSkill:system.skills.melee,unarmedSkill:system.skills.unarmed});
    combatants[id]={physicalDamageBefore:carried,...(kv.resolved?{knockoutValue:kv.value}:{})};
  }
  return {shots,combatants,actors,wounds,knockDowns};
}
// Step 7 of the impulse sequence: "Every shot due this impulse resolves now, as one batch,
// with no ordering among them. Submission order, document write order and initiative play no
// part." §2.1, PDF 15, is the source: in an impulse "all movement and fire are executed
// simultaneously", and §5.7, PDF 55, adds that "all fire is resolved at the end of each
// Impulse".
//
// The dice are already per-shot and frozen, so no ordering can change a number. What order
// could change is what a later step *reads*: applying one shot writes an injury, spends
// ammunition and can disable a limb before another due shot has even been rolled. Requiring
// every due shot to have its dice before any of them is applied makes the batch real - after
// that point every input is frozen and application order provably cannot matter.
//
// A shot planned and paid for after another has been applied is not "due" alongside it and
// does not retroactively block anything.
export const dueThisImpulse=(shots,timing,combatUuid)=>Object.values(shots??{})
  .filter(shot=>shot.timing?.combatUuid===combatUuid&&shot.timing.phase===timing.phase&&shot.timing.impulse===timing.impulse);

export function assertFireResolvedTogether(shots,timing,combatUuid,applyingShotId=null){
  const waiting=dueThisImpulse(shots,timing,combatUuid)
    .filter(shot=>shot.id!==applyingShotId&&shot.status==='ready');
  if(!waiting.length)return;
  throw new Error(`All fire due in an impulse is resolved together (§2.1). ${waiting.length} shot${waiting.length===1?'' :'s'} in Phase ${timing.phase} / Impulse ${timing.impulse} still ${waiting.length===1?'awaits its dice':'await their dice'}; roll or abandon ${waiting.length===1?'it':'them'} before applying any result from this impulse.`);
}

export function assertBatchUnchanged(batch,current){
  if(!batch.inputs)return; // Historical version-2 batches predate frozen input records.
  const identities=inputs=>Object.entries(inputs.actors).map(([id,a])=>[id,a.uuid]);
  if(!same(batch.inputs.wounds,current.wounds)||!same(identities(batch.inputs),identities(current)))throw new Error('Impulse participants or injuries changed after totalling began. GM reconciliation is required.');
  for(const id of Object.keys(batch.rolls??{}))if(!same(batch.inputs.combatants[id],current.combatants[id]))throw new Error('A rolled knockout check changed inputs. GM reconciliation is required.');
}

// Save each roll before any Actor write; effect + receipt share an Actor update.
// A retry may fill missing characteristics, but cannot change a check already rolled.
export async function finishImpulseBatch(previous,current,{id,save,roll,applyCondition,applyKnockDown=null,incapacitationEffects=false,roll10=null}){
  if(previous)assertBatchUnchanged(previous,current);
  if(previous?.complete)return previous;
  let batch=previous?structuredClone(previous):{id,inputs:structuredClone(current),rolls:{},complete:false};
  const actors=batch.inputs.actors;
  batch.inputs={...structuredClone(current),actors};
  const evaluate=()=>resolveImpulseBatch({shots:batch.inputs.shots,combatants:batch.inputs.combatants,knockoutRolls:batch.rolls});
  const persist=async()=>save(structuredClone(batch));
  let result=evaluate();
  Object.assign(batch,result,{complete:false});await persist();
  if(result.unresolved.some(entry=>entry.reason!=='knockout-roll-required'))return batch;
  for(const entry of result.unresolved){
    batch.rolls[entry.targetId]=await roll(entry.targetId);
    result=evaluate();Object.assign(batch,result,{complete:false});await persist();
  }
  if(!result.complete)return batch;
  // §5.13 (optional): what the failed check means, and for how long. The 0-9 roll is saved
  // before any Actor is touched, like the knockout roll.
  if(incapacitationEffects){
    batch.incapacitationRolls??={};batch.incapacitation??={};
    for(const [targetId,outcome] of Object.entries(result.knockout)){
      if(!outcome.incapacitated||batch.incapacitation[targetId])continue;
      const {effect,detail}=incapacitationEffect({row:outcome.threshold.label,knockoutPhysicalDamage:outcome.knockoutPhysicalDamage,roll:outcome.roll});
      if(!Number.isInteger(batch.incapacitationRolls[targetId])){batch.incapacitationRolls[targetId]=await roll10(targetId);await persist();}
      const time=incapacitationEffectTime({effect,physicalDamage:outcome.totalPhysicalDamage,roll:batch.incapacitationRolls[targetId]});
      batch.incapacitation[targetId]={effect,seconds:time.seconds,printed:time.printed,detail:`${detail} ${time.detail}`};
      await persist();
    }
  }
  for(const [targetId,outcome] of Object.entries(result.knockout)){
    if(outcome.incapacitated)await applyCondition(batch.id,targetId,batch.inputs.actors[targetId],batch.incapacitation?.[targetId]?.effect??'knockedOut');
  }
  // §5.12: a man knocked down goes to the ground; the actions it costs are charged when the
  // clock advances (timing.mjs). One knocked out, stunned or dazed is already down.
  batch.knockDowns=structuredClone(batch.inputs.knockDowns??{});
  for(const [targetId,knock] of Object.entries(batch.knockDowns)){
    const onTheGround=result.knockout[targetId]?.incapacitated&&(batch.incapacitation?.[targetId]?.effect??'knockedOut')!=='disoriented';
    if(knock.level==='down'&&!onTheGround&&applyKnockDown)await applyKnockDown(batch.id,targetId,batch.inputs.actors[targetId]);
  }
  batch.complete=true;await persist();return batch;
}
