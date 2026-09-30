import {applicationStatusLabel} from './status-label.mjs';
import {executeTransaction,equal} from './transaction.mjs';
import {resolveFirearm,resolveMelee} from '../rules/attacks.mjs';
import {resolveBurst} from '../rules/automatic-fire.mjs';
import {resolveShotgun,resolveAutomaticShotgun} from '../rules/shotgun.mjs';
import {resolveDueDetonation,resolveThrownGrenade,resolveLaunchedGrenade} from '../rules/explosive.mjs';
import {resolveGrenadeBurst} from '../rules/grenade-burst.mjs';
import {resolveThreeRoundBurst} from '../rules/three-round-burst.mjs';
import {inspectLoadout} from '../rules/summary.mjs';
import {weaponActionCost,attackActionCost} from '../rules/melee-strike.mjs';
import {assertFireResolvedTogether} from '../rules/impulse-completion.mjs';
import {resultChatData} from '../foundry/context.mjs';
import {smallArmsOptionalRules} from '../foundry/optional-rules.mjs';
import {knockDownByCatalogId} from '../data/knock-down.mjs';
import {projectileKnockDownResult,explosiveKnockDownResult,worstKnockDown} from '../rules/knock-down.mjs';
const scope='phoenix-command';
import {serialized,requireCoordinator} from './coordinator.mjs';
export {requireCoordinator} from './coordinator.mjs';
async function resolveDocument(uuid){const doc=await fromUuid(uuid);if(!doc)throw new Error('An application document no longer exists.');if(!doc.testUserPermission(game.user,'OWNER'))throw new Error('Owner permission is required on every affected document.');return doc;}
async function actor(identity){
  const doc=await resolveDocument(identity.tokenUuid??identity.actorUuid);
  const a=identity.tokenUuid?doc.actor:doc;
  if(!a||a.type!=='character'||!a.testUserPermission(game.user,'OWNER'))throw new Error('A participating character is unavailable.');
  if(a.uuid!==identity.actorUuid)throw new Error('The original token Actor has changed.');return a;
}
const logFor=id=>game.messages.find(m=>m.getFlag(scope,'application')?.id===id);
async function makePlan(result,context){
  requireCoordinator();
  const timing=context.timing;
  if(timing&&(!Number.isSafeInteger(timing.phase)||timing.phase<1||!Number.isInteger(timing.impulse)||timing.impulse<1||timing.impulse>4||typeof timing.combatUuid!=='string'))throw new Error('Invalid frozen combat timing.');
  const id=context.applicationId;
  if(!/^[A-Za-z0-9-]{16,64}$/.test(id??''))throw new Error('This result has no supported application identity. Resolve it from a character sheet.');
  const multi=result.kind==='burst'||result.kind==='grenade-burst'||result.kind==='three-round-burst'||result.kind==='shotgun'||result.kind==='automatic-shotgun'||result.kind==='grenade'||result.kind==='launcher'||result.kind==='detonation';
  const scheduledGrenade=result.kind==='grenade'&&result.scheduled===true;
  const calculated=(result.kind==='burst'?resolveBurst:result.kind==='three-round-burst'?resolveThreeRoundBurst:result.kind==='grenade-burst'?resolveGrenadeBurst:result.kind==='shotgun'?resolveShotgun:result.kind==='automatic-shotgun'?resolveAutomaticShotgun:result.kind==='detonation'?(input=>resolveDueDetonation(input,result.detonation,result.rolls)):result.kind==='grenade'?resolveThrownGrenade:result.kind==='launcher'?resolveLaunchedGrenade:result.kind==='firearm'?resolveFirearm:resolveMelee)(context.input,result.rolls);
  if(!equal(calculated,result))throw new Error('The saved result does not match its frozen inputs.');
  // An expiring fuse is already out of the thrower's hands: the throw spent the round and
  // its shot authorization, so the detonation writes injuries only.
  const detonation=result.kind==='detonation';
  if(detonation&&(context.timedShotId||!timing))throw new Error('A detonation belongs to the impulse its fuse expires in and is not a timed shot.');
  const attacker=detonation?null:await actor(context.attacker),target=multi?null:await actor(context.target);
  const weapon=detonation?null:attacker.items.get(context.input.weapon.id);
  if(!detonation&&(!weapon||!equal(weapon.system.toObject(),context.input.weapon.system)))throw new Error('Weapon state has changed since resolution. Resolve again with current equipment.');
  if(!detonation&&(!weapon.system.carried||!weapon.system.equipped))throw new Error('The weapon must be carried and equipped.');
  const steps=[];
  const participantCombats=detonation?[]:game.combats.filter(c=>c.started&&c.combatants.some(b=>b.actor?.uuid===attacker.uuid));
  const timed=result.kind==='firearm'||result.kind==='melee'||multi;
  if(timed&&context.timedShotId&&(timing||participantCombats.length)){
    const combat=timing?await resolveDocument(timing.combatUuid):null;
    const shot=combat?.getFlag(scope,`shots.${context.timedShotId}`);
    if(shot?.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
    const sameRoll=shot?(result.kind==='burst'?resolveBurst(context.input,shot.rolls):result.kind==='three-round-burst'?resolveThreeRoundBurst(context.input,shot.rolls):result.kind==='grenade-burst'?resolveGrenadeBurst(context.input,shot.rolls):result.kind==='shotgun'?resolveShotgun(context.input,shot.rolls):result.kind==='automatic-shotgun'?resolveAutomaticShotgun(context.input,shot.rolls):result.kind==='grenade'?resolveThrownGrenade(context.input,shot.rolls):result.kind==='launcher'?resolveLaunchedGrenade(context.input,shot.rolls):result.kind==='melee'?resolveMelee(context.input,shot.rolls):resolveFirearm(context.input,shot.rolls)):null;
    const sameTarget=result.kind==='three-round-burst'?shot?.plan.targetUuid===context.targets?.[0]?.tokenUuid:multi?true:shot?.plan.targetUuid===context.target.tokenUuid;
    if(!shot||shot.status!=='rolled'||shot.applicationId!==id||!equal(shot.timing,timing)||shot.plan.actorUuid!==attacker.uuid||!sameTarget||!equal(sameRoll,result))throw new Error('A timed shot must finish its paid activity and use its saved dice before application.');
    if(Object.entries(shot.input).some(([key,value])=>!equal(context.input[key],value)))throw new Error('Timed shot inputs changed after rolling.');
    // Nothing from this impulse may be written while another due shot is still unrolled.
    if(combat)assertFireResolvedTogether(combat.getFlag(scope,'shots'),timing,combat.uuid,context.timedShotId);
    const path=`flags.phoenix-command.shots.${context.timedShotId}.status`;
    steps.push({uuid:combat.uuid,key:'timedShot',label:'Timed shot authorization',before:{[path]:'rolled'},after:{[path]:'applied'},undo:{[path]:'undone'}});
  }
  if(result.kind==='melee'&&context.timedShotId){
    // §3.1: "After Striking, a Character must Recover in order to bring his weapon back into
    // position." The blow has now been thrown, hit or miss, so the weapon owes a recovery and
    // cannot strike again until it is paid (D61). Undo puts the weapon back as it was.
    const modeId=context.input.modeId;
    // A weapon fast enough to strike and recover in the same action recovers itself, so it
    // owes nothing afterwards (D65) and no debt is written.
    const speed=weapon.system.meleeModes?.[modeId]?.weaponSpeed;
    // A charge prints no recovery: it strikes for its one action and owes nothing afterwards.
    const attackCosts=attackActionCost(weapon.system.meleeModes?.[modeId]?.attacks?.[context.input.attackId]);
    const paired=attackCosts?(attackCosts.pairedStrikeRecover||attackCosts.recover===0):Number.isFinite(speed)&&weaponActionCost(speed).pairedStrikeRecover;
    if(result.special==='chainsaw'){
      // §5.7: a cut that penetrated can be continued on the next impulse; a miss or a blade not
      // penetrating ends it. The recovery owed below stands either way.
      const path='flags.phoenix-command.chainsawCut';
      const before={[path]:weapon.flags?.['phoenix-command']?.chainsawCut??null};
      const after={[path]:result.hit&&result.cuttingPower>0?{cuttingPower:result.cuttingPower,targetUuid:context.target.tokenUuid,
        combatUuid:timing?.combatUuid??null,phase:timing?.phase??null,impulse:timing?.impulse??null}:null};
      if(!equal(before,after))steps.push({uuid:weapon.uuid,key:'chainsawCut',label:'Chainsaw cut in progress',before,after,undo:before});
    }
    if(!paired){
      const path=`system.meleeModes.${modeId}.preparation.recoveryRequired`;
      const before={[path]:weapon.system.meleeModes?.[modeId]?.preparation?.recoveryRequired===true};
      steps.push({uuid:weapon.uuid,key:'recovery',label:'Weapon out of position after the blow',
        before,after:{[path]:true},undo:before});
    }
  }
  if(result.kind==='firearm'||(multi&&!detonation)){
    const spent=result.kind==='firearm'?1:result.roundsFired;
    if(!Number.isSafeInteger(spent)||spent<1)throw new Error('This attack does not say how many rounds it fired.');
    const ammo=attacker.items.get(weapon.system.loaded.ammunitionItemId);
    if(!ammo||ammo.type!=='ammunition'||!ammo.system.carried||ammo.system.ammunitionKey!==context.input.ammunitionKey||weapon.system.loaded.rounds<spent||ammo.system.quantity<spent)throw new Error(`Load at least ${spent} round${spent===1?'':'s'} of the selected ammunition before applying this attack.`);
    if(inspectLoadout(Array.from(attacker.items,i=>({id:i.id,type:i.type,system:i.system.toObject()}))).some(i=>i.code==='ammunitionOverReserved'))throw new Error('Loaded reservations exceed ammunition stock. Correct the loadout first.');
    for(const [doc,path,label,key]of [[weapon,'system.loaded.rounds','Loaded rounds','loaded'],[ammo,'system.quantity','Ammunition stock','stock']]){
      const value=key==='loaded'?weapon.system.loaded.rounds:ammo.system.quantity;
      const last=doc.getFlag(scope,'lastResourceApplication')??null;
      const before={[path]:value,'flags.phoenix-command.lastResourceApplication':last};
      const after={[path]:value-spent,'flags.phoenix-command.lastResourceApplication':id};
      if(key==='stock'){before['system.ammunitionKey']=ammo.system.ammunitionKey;after['system.ammunitionKey']=ammo.system.ammunitionKey;}
      if(key==='loaded'){
        before['system.loaded.ammunitionItemId']=ammo.id;after['system.loaded.ammunitionItemId']=ammo.id;
        // Firing empties the chamber of any weapon that chambers by hand, so the next shot
        // pays its Rate of Fire (§5.11). A self-loading weapon's chamber is never read, so
        // its recorded value is carried through untouched rather than given a meaning.
        const feed=weapon.system.firearmModes?.[context.input.modeId]?.feed;
        const chamber=weapon.system.loaded.chamber;
        before['system.loaded.chamber']=chamber;
        after['system.loaded.chamber']=feed==='self-loading'?chamber:'empty';
      }
      steps.push({uuid:doc.uuid,key,label,before,after,undo:before});
    }
  }
  if(scheduledGrenade&&timing){
    const combat=await resolveDocument(timing.combatUuid);
    const pendingId=`${id}-fuse`;
    const path=`flags.phoenix-command.pendingDetonations.${pendingId}`;
    const record={id:pendingId,applicationId:id,duePhase:result.duePhase,fusePhases:result.fusePhases,detonation:result.detonation,
      input:structuredClone(context.input),rolls:structuredClone(result.rolls),timing,
      attackerUuid:context.attacker.actorUuid,timedShotId:context.timedShotId??null};
    steps.push({uuid:combat.uuid,key:'pending-detonation',label:'Scheduled detonation',before:{[path]:null},after:{[path]:record},undo:{[path]:null}});
  }
  if(multi&&!scheduledGrenade){
    let n=0;
    for(const struck of result.targets){
      const who=context.targets.find(candidate=>candidate.id===struck.id);
      if(!who)throw new Error('A burst target is missing from the application.');
      const wounded=await actor(who);
      for(const impact of struck.impacts){
        if(!(impact.physicalDamage>0))continue;
        const injuryId=`${id}-r${n++}`;
        const injury={resolutionId:id,attackId:context.input.attackId??'',location:impact.location,side:'center',physicalDamage:impact.physicalDamage,
          disabledRegions:impact.disabled?[impact.location]:[],combatUuid:context.timing?.combatUuid??'',phase:context.timing?.phase??null,impulse:context.timing?.impulse??null,worldTime:game.time?.worldTime??null,status:'active',
          shockPhysicalDamage:impact.shockPhysicalDamage??0,
          notes:'Applied from a frozen attack. Each pellet or round is its own wound; impulse knockout is recorded in the encounter.'};
        const path=`system.injuries.${injuryId}`;
        if(wounded.system.injuries[injuryId])throw new Error('An injury already uses this application identity.');
        steps.push({uuid:wounded.uuid,key:`injury-${n}`,label:`Injury · ${who.name}`,before:{[path]:null},after:{[path]:injury},undo:{[path]:{...injury,status:'reversed'}}});
      }
      if(struck.concussion>0){
        const injuryId=`${id}-c${n++}`;
        const injury={resolutionId:id,attackId:context.input.attackId??'',location:'Concussion',side:'center',physicalDamage:struck.concussion,
          disabledRegions:[],combatUuid:context.timing?.combatUuid??'',phase:context.timing?.phase??null,impulse:context.timing?.impulse??null,worldTime:game.time?.worldTime??null,status:'active',
          shockPhysicalDamage:0,
          notes:'Concussion from a blast. It has no hit location, so it does not disable a limb. It counts toward the PD total.'};
        const path=`system.injuries.${injuryId}`;
        if(wounded.system.injuries[injuryId])throw new Error('An injury already uses this application identity.');
        steps.push({uuid:wounded.uuid,key:`injury-${n}`,label:`Concussion · ${who.name}`,before:{[path]:null},after:{[path]:injury},undo:{[path]:{...injury,status:'reversed'}}});
      }
    }
  }else if(result.hit&&result.physicalDamage>0){
    const injury={resolutionId:id,attackId:context.input.attackId??'',location:result.location,side:result.side??'center',physicalDamage:result.physicalDamage,
      disabledRegions:result.disabled?[result.location]:[],combatUuid:context.timing?.combatUuid??'',phase:context.timing?.phase??null,impulse:context.timing?.impulse??null,worldTime:game.time?.worldTime??null,status:'active',
      // Table 6C shock counts toward the Knockout Roll in this impulse only and never joins
      // the PD Total, so it rides on the record rather than in physicalDamage.
      shockPhysicalDamage:result.shockPhysicalDamage??0,
      notes:`Applied from a frozen combat resolution; impulse knockout is recorded in the encounter; recovery requires adjudication.${result.disabled?` Disabling injury${result.shockPhysicalDamage?` · ${result.shockPhysicalDamage} Shock PD counts toward this impulse\u2019s knockout roll only and is not part of the PD Total`:''}.`:''}`};
    const path=`system.injuries.${id}`;
    if(target.system.injuries[id])throw new Error('An injury already uses this application identity.');
    steps.push({uuid:target.uuid,key:'injury',label:'Applied injury',before:{[path]:null},after:{[path]:injury},undo:{[path]:{...injury,status:'reversed'}}});
  }
  // §5.12 Knock Down (optional): each man this attack struck carries the worst Knock Down
  // it did him, for this impulse's totalling to charge. It rides in the same transaction as
  // the injuries, so Undo takes it away with them. A hit armor stopped still counts.
  if(timing&&!scheduledGrenade&&smallArmsOptionalRules().knockDown){
    const knockDown=detonation?null:knockDownByCatalogId[context.input.weapon?.system?.catalogId]??null;
    const explosive=['grenade','launcher','detonation','grenade-burst'].includes(result.kind);
    const struckList=multi?result.targets.map(t=>({who:context.targets.find(c=>c.id===t.id),
      results:explosive?[explosiveKnockDownResult(t.concussion)]:(t.impacts??[]).map(i=>projectileKnockDownResult(knockDown,i.location))}))
      :result.kind==='firearm'&&result.hit?[{who:context.target,results:[projectileKnockDownResult(knockDown,result.location)]}]:[];
    for(const {who,results} of struckList){
      const worst=worstKnockDown(results);if(!worst||!who)continue;
      const struck=await actor(who),path=`flags.phoenix-command.knockDowns.${id}`;
      steps.push({uuid:struck.uuid,key:`knockdown-${who.id}`,label:`Knock Down · ${who.name}`,before:{[path]:null},
        after:{[path]:{level:worst.level,detail:worst.detail,combatUuid:timing.combatUuid,phase:timing.phase,impulse:timing.impulse}},undo:{[path]:null}});
    }
  }
  for(const step of steps)for(const key of ['before','after','undo'])step[key]=Object.entries(step[key]);
  return {id,version:1,status:'prepared',direction:null,createdBy:game.user.id,steps};
}
async function run(message,direction){
  requireCoordinator();
  const plan=structuredClone(message.getFlag(scope,'application'));
  if(!plan||plan.version!==1||plan.status==='cancelled'||plan.steps.some(s=>!Array.isArray(s.before)))throw new Error('No supported application log.');
  const timing=message.getFlag(scope,'resolution')?.context?.timing;
  if(timing&&!(plan.status==='undone'||(plan.status==='applied'&&direction==='apply'))){
    const combat=await resolveDocument(timing.combatUuid),state=combat.timing;
    if(combat.getFlag(scope,`impulseBatches.${timing.phase}-${timing.impulse}`)||(state.phase===timing.phase&&state.impulse===timing.impulse&&state.batch))throw new Error('This impulse has begun knockout resolution. Its attacks cannot be applied or undone independently; GM reconciliation is required.');
    if(direction==='apply'&&(state.phase!==timing.phase||state.impulse!==timing.impulse))throw new Error('The attack no longer belongs to the open impulse.');
  }
  // Unfinished transactions touching the same documents must be recovered first.
  const blocked=game.messages.find(m=>{const other=m.getFlag(scope,'application');return other&&other.id!==plan.id&&['applying','undoing'].includes(other.status)&&other.steps.some(a=>plan.steps.some(b=>a.uuid===b.uuid));});
  if(blocked)throw new Error('Recover the earlier unfinished application in GM chat first.');
  try { return await executeTransaction(plan,direction,{
    authorize:requireCoordinator,read:async uuid=>(await resolveDocument(uuid)).toObject(),
    write:async(uuid,patch)=>(await resolveDocument(uuid)).update(patch),
    save:async data=>message.setFlag(scope,'application',structuredClone(data))
  }); } finally {
    const status=message.getFlag(scope,'application')?.status;
    for(const related of game.messages.filter(m=>m.id!==message.id&&m.getFlag(scope,'resolution')?.context?.applicationId===plan.id)){
      try { await related.setFlag(scope,'applicationStatus',status); }
      catch { ui.notifications.warn('The application log is current, but a shared chat status could not be updated.'); }
    }
  }
}
export const applyResult=(result,context)=>serialized(()=>_applyResult(result,context));
// Unqueued entry for coordinator code already running inside the serialized queue
// (awaiting the public applyResult there would wait on itself).
export async function _applyResult(result,context){
  requireCoordinator();let message=logFor(context.applicationId);
  if(!message){
    const plan=await makePlan(result,context);
    const data=resultChatData(result,{...context,systemVersion:game.system.version});
    data.flags[scope].application=plan;
    data.whisper=game.users.filter(u=>u.isGM).map(u=>u.id);
    message=await foundry.documents.ChatMessage.create(data);
  }
  const saved=message.getFlag(scope,'resolution');
  if(!equal(saved.result,result)||!equal(saved.context.input,context.input))throw new Error('This application identity belongs to a different resolution.');
  return run(message,'apply');
}
export const undoResult=id=>serialized(async()=>{const message=logFor(id);if(!message)throw new Error('Application log not found.');return run(message,'undo');});
export function registerApplicationChat(){
  Hooks.on('createChatMessage',async message=>{
    const id=message.getFlag(scope,'resolution')?.context?.applicationId;
    if(!id||message.getFlag(scope,'application'))return;
    try { requireCoordinator(); } catch { return; }
    const status=logFor(id)?.getFlag(scope,'application')?.status;
    if(status)await message.setFlag(scope,'applicationStatus',status);
  });
  Hooks.on('renderChatMessageHTML',(message,html)=>{
    const plan=message.getFlag(scope,'application');
    const applicationId=message.getFlag(scope,'resolution')?.context?.applicationId;
    const currentPlan=plan??(applicationId?logFor(applicationId)?.getFlag(scope,'application'):null);
    const currentStatus=currentPlan?.status??message.getFlag(scope,'applicationStatus');
    for(const badge of html.querySelectorAll('.pc-chip')){
      if(badge.textContent.trim()!=='APPLY PENDING')continue;
      badge.textContent=applicationStatusLabel(currentStatus);
      badge.dataset.tone=currentStatus==='applied'?'good':'warn';
    }
    if(plan){
      // The card's status chip already says applied, undone or incomplete; only an error adds a line.
      const card=html.querySelector('.phoenix-command')??html;
      if(plan.error){const detail=documentCreate('p',plan.error);detail.className='pc-help';card.append(detail);}
      if(!game.user.isGM||['undone','cancelled'].includes(plan.status))return;
      const direction=plan.status==='applied'||plan.direction==='undo'?'undo':'apply';
      const button=documentCreate('button',direction==='undo'?'Undo':'Apply');button.type='button';
      const actions=document.createElement('div');actions.className='pc-card-actions';actions.append(button);card.append(actions);
      button.addEventListener('click',async()=>{button.disabled=true;try{await serialized(()=>run(message,direction));}catch(err){ui.notifications.error(err.message);}finally{button.disabled=false;}});
    }else if(game.user.isGM){
      const resolution=message.getFlag(scope,'resolution');if(!resolution?.context?.applicationId)return;
      const card=html.querySelector('.phoenix-command')??html;
      if(['applied','undone','cancelled'].includes(currentStatus))return;
      const button=documentCreate('button','Apply');button.type='button';
      const actions=document.createElement('div');actions.className='pc-card-actions';actions.append(button);card.append(actions);
      button.addEventListener('click',async()=>{button.disabled=true;try{await applyResult(resolution.result,resolution.context);}catch(err){ui.notifications.error(err.message);}finally{button.disabled=false;}});
    }
  });
}
function documentCreate(tag,text){const el=document.createElement(tag);el.textContent=text;return el;}
