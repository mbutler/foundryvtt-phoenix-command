import {applyResult} from './foundry.mjs';
import {previewFirearm,locateHit,resolveFirearm} from '../rules/attacks.mjs';
import {automaticBallisticProtection} from '../rules/automatic-protection.mjs';
import {snapshotActor} from '../foundry/context.mjs';
import {reusableShotConditions} from '../foundry/shot-conditions.mjs';
import {confirmImpactArmor,armorOptions} from '../ui/burst-review.mjs';
import {previewThreeRoundBurst,resolveThreeRoundBurst} from '../rules/three-round-burst.mjs';

export function reviewBlockers(combat,shot){
  if(shot.status!=='ready')return null;
  const name=combat.combatants.get(shot.combatantId)?.name??shot.id;
  if(shot.plan.kind==='shot')return shot.adjudication||reusableShotConditions(combat,shot)?null:`${name}: sightline review`;
  if(shot.plan.kind==='burst'){
    if(!shot.arc)return `${name}: arc designation`;
    if(!shot.adjudication)return `${name}: burst review`;
    return null;
  }
  return shot.adjudication?null:`${name}: ${shot.plan.kind} review`;
}

export async function buildSavedShotApplication(combat,shot,{assertClock=()=>{}}={}){
  if(shot.contextConflict)throw new Error(`Saved dice require GM reconciliation: ${shot.contextConflict}`);
  if(shot.status!=='rolled')throw new Error('The attack is not ready for application.');
  const kind=shot.plan.kind;
  if(kind==='shot'){
    const attacker=combat.combatants.get(shot.combatantId),target=combat.targetFor(shot.plan);
    if(!attacker?.token?.object||!target?.token?.object)throw new Error('View the encounter scene before resolving fire.');
    const defender=snapshotActor(target.actor,{token:target.token.object});
    const armorStamp=JSON.stringify(defender.items.filter(i=>i.type==='armor'));
    let resolution=shot.rifleResolution;
    if(resolution&&resolution.armorStamp!==armorStamp)throw new Error('Armor changed after resolution. GM reconciliation is required; saved dice are retained.');
    if(shot.plan.threeRoundBurst){
      if(!resolution){
        // LEG10203 §6.3: each round that hits takes the protection at its own location.
        const input={...structuredClone(shot.input),targetId:target.id},preview=previewThreeRoundBurst(input);
        const rounds=preview.chances.filter(chance=>shot.rolls.hit<=chance).length;
        const located=shot.rolls.rounds.slice(0,rounds).map(round=>locateHit('firearm',input,round));
        const protections=located.map(location=>automaticBallisticProtection(defender.items,location));
        const pending=protections.map((protection,i)=>protection.resolved?null:{targetName:target.name,location:`${located[i].location} — ${protection.reason}`,options:armorOptions(target.actor)});
        let answers=[];
        if(pending.some(Boolean)){
          answers=await confirmImpactArmor(pending.filter(Boolean));
          if(!answers)throw new Error('Protection needs GM confirmation. Dice are saved; retry will not reroll.');
        }
        let asked=0;
        input.roundArmorPF=protections.map(protection=>protection.resolved?protection.ballisticPF:answers[asked++]);
        assertClock();
        if(armorStamp!==JSON.stringify(snapshotActor(target.actor,{token:target.token.object}).items.filter(i=>i.type==='armor')))
          throw new Error('Armor changed during confirmation. Retry with the saved dice.');
        resolution={input,result:resolveThreeRoundBurst(input,shot.rolls),armorStamp};
        await combat.setFlag('phoenix-command',`shots.${shot.id}.rifleResolution`,resolution);
      }
      return {result:resolution.result,context:{attacker:snapshotActor(attacker.actor,{token:attacker.token.object}),
        targets:[{id:target.id,name:target.name,actorUuid:target.actor.uuid,tokenUuid:target.token.uuid}],
        input:resolution.input,applicationId:shot.applicationId,timedShotId:shot.id,timing:shot.timing}};
    }
    if(!resolution){
      const input=structuredClone(shot.input),preview=previewFirearm(input);
      if(shot.rolls.hit<=preview.threshold){
        const location=locateHit('firearm',input,shot.rolls);
        const protection=automaticBallisticProtection(defender.items,location);
        let pf=protection.ballisticPF;
        if(!protection.resolved){
          const answer=await confirmImpactArmor([{targetName:target.name,location:`${location.location} — ${protection.reason}`,options:armorOptions(target.actor)}]);
          if(!answer)throw new Error('Protection needs GM confirmation. Dice are saved; retry will not reroll.');
          pf=answer[0];
        }
        input.armorPF=pf;input.protection={...protection,ballisticPF:pf,basis:protection.resolved?protection.basis:'GM adjudication'};
      }
      assertClock();
      if(armorStamp!==JSON.stringify(snapshotActor(target.actor,{token:target.token.object}).items.filter(i=>i.type==='armor')))
        throw new Error('Armor changed during confirmation. Retry with the saved dice.');
      resolution={input,result:resolveFirearm(input,shot.rolls),armorStamp};
      await combat.setFlag('phoenix-command',`shots.${shot.id}.rifleResolution`,resolution);
    }
    return {result:resolution.result,context:{attacker:snapshotActor(attacker.actor,{token:attacker.token.object}),target:defender,
      input:resolution.input,applicationId:shot.applicationId,timedShotId:shot.id,timing:shot.timing}};
  }
  if(kind==='strike'){
    const {strikeApplyContext}=await import('../foundry/strike-scene.mjs');
    const {resolveMelee}=await import('../rules/attacks.mjs');
    return {result:resolveMelee(shot.input,shot.rolls),context:strikeApplyContext(combat,shot)};
  }
  if(kind==='grenade'||kind==='launcher'){
    const {explosiveApplyContext}=await import('../foundry/grenade-scene.mjs');
    const {resolveLaunchedGrenade,resolveThrownGrenade}=await import('../rules/explosive.mjs');
    const resolved=kind==='launcher'?resolveLaunchedGrenade(shot.input,shot.rolls):resolveThrownGrenade(shot.input,shot.rolls);
    return {result:resolved,context:explosiveApplyContext(combat,shot)};
  }
  if(kind==='shotgun'){
    const {shotgunApplyContext}=await import('../foundry/shotgun-scene.mjs');
    const {resolveShotgun}=await import('../rules/shotgun.mjs');
    return {result:resolveShotgun(shot.input,shot.rolls),context:shotgunApplyContext(combat,shot)};
  }
  if(kind==='burst'&&shot.plan.explosive){
    const {explosiveApplyContext}=await import('../foundry/grenade-scene.mjs');
    const {resolveGrenadeBurst}=await import('../rules/grenade-burst.mjs');
    return {result:resolveGrenadeBurst(shot.input,shot.rolls),context:explosiveApplyContext(combat,shot)};
  }
  if(kind==='burst'){
    const {burstApplyContext}=await import('../foundry/burst-handoff.mjs');
    const buckshot=shot.result?.kind==='automatic-shotgun';
    const {resolveBurst}=await import('../rules/automatic-fire.mjs');
    const resolved=buckshot?(await import('../rules/shotgun.mjs')).resolveAutomaticShotgun(shot.input,shot.rolls):resolveBurst(shot.input,shot.rolls);
    return {result:resolved,context:burstApplyContext(combat,shot)};
  }
  throw new Error(`Unsupported attack family: ${kind}.`);
}

export async function applySavedShotApplication(prepared){
  await applyResult(prepared.result,prepared.context);
}
