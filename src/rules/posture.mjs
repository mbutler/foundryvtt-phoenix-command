// Table 7B posture rows. Cost remains sourced by quoteActivity; these are effects.
import {disabledLocations} from './disabling-effects.mjs';
const changes=Object.freeze({
  'stand-kneel':['standing','kneeling'],'stand-prone':['standing','prone'],
  'kneel-stand':['kneeling','standing'],
  'kneel-prone':['kneeling','prone'],'prone-kneel':['prone','kneeling'],
  'prone-stand':['prone','standing']
});
// §2.7 names two consequences of a disabling injury - a leg stops movement, an arm or
// shoulder stops firing with it - and says nothing about changing posture. Rather than
// invent a rule either way, a paid Table 7B posture change stays a GM adjudication, and the
// message says that it is unprinted rather than unimplemented.
function assertUnrestricted(actor,woundThisImpulse){
  const disabled=disabledLocations(actor.system.injuries,woundThisImpulse);
  if(disabled.length)throw new Error(`No source rule states what a disabling injury (${disabled.join(', ')}) does to a change of posture; §2.7 covers movement and firing only. Rule on it and record the change directly.`);
}
// Table 7B cover rows (user rulings, 26 Sep 2026). Looking over or around cover exposes him
// as a looker (Key 6B's look-over column) and needs no firing stance - a firing stance already
// shows him. Ducking from a firing stance or from looking puts him wholly behind the cover again
// and clears looking, the firing stance and the brace, whose weapon rested on the cover he left.
const coverFields=['looking','firingStance','braced'];
const coverState=actor=>Object.fromEntries(coverFields.map(field=>[field,actor.system.condition[field]??false]));
function coverEffect(catalogId,actor){
  if(!actor?.uuid||actor.type!=='character')throw new Error('A character is required for a cover activity.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm the character is conscious before looking or ducking.');
  const before=coverState(actor);
  if(catalogId==='look-cover'){
    if(before.looking)throw new Error('He is already looking over or around the cover.');
    if(before.firingStance)throw new Error('A firing stance already shows him over the cover; duck first to only look.');
    return {kind:'posture',actorUuid:actor.uuid,field:'looking',before:false,after:true};
  }
  if(!before.looking&&!before.firingStance)throw new Error('Ducking needs him to be looking or in a firing stance over the cover.');
  return {kind:'posture',actorUuid:actor.uuid,field:'cover',before,after:{looking:false,firingStance:false,braced:false}};
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const current=(actor,field)=>field==='cover'?coverState(actor):actor.system.condition[field]??false;

export function postureEffect(catalogId,actor,{woundThisImpulse=null}={}){
  if(catalogId==='look-cover'||catalogId==='duck-cover')return coverEffect(catalogId,actor);
  const preparation={'firing-stance':['firingStance',true],'hip-stance':['firingStance',false],brace:['braced',true]}[catalogId];
  const transition=changes[catalogId];if(!transition&&!preparation)return null;
  if(!actor?.uuid||actor.type!=='character')throw new Error('A character is required for a posture activity.');
  const field=preparation?.[0]??'posture';
  const [before,after]=transition??[actor.system.condition[field]??false,preparation[1]];
  if(preparation&&before===after)throw new Error('This preparation is already recorded.');
  if((actor.system.condition[field]??false)!==before)throw new Error(`This activity requires ${before} posture.`);
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm the character is conscious before performing a posture activity.');
  assertUnrestricted(actor,woundThisImpulse);
  return {kind:'posture',actorUuid:actor.uuid,before,after,...(preparation?{field}:{})};
}
export function validatePosture(effect,actor,{woundThisImpulse=null}={}){
  const field=effect.field??'posture';
  if(!['posture','braced','firingStance','looking','cover'].includes(field))throw new Error('Unsupported preparation field.');
  if(actor?.uuid!==effect.actorUuid||!same(current(actor,field),effect.before)||actor.system.condition.consciousness!=='conscious')
    throw new Error('Posture or consciousness changed; reconcile or cancel this activity before continuing.');
  // Looking and ducking are not posture changes, so §2.7's unprinted case does not arise.
  if(!['looking','cover'].includes(field))assertUnrestricted(actor,woundThisImpulse);
}

// Persist the pending effect on Combat BEFORE calling this. Actor receipt and
// posture are one document update. Recovery after a lost acknowledgement reads
// the receipt, never charges actions again, and never overwrites later posture.
export async function finishPosture(pending,{readActor,writeActor,acknowledge}){
  const actor=await readActor(pending.actorUuid);
  if(!actor)throw new Error('The activity Actor no longer exists.');
  const receipt=actor.receipts?.[pending.id];
  if(receipt){
    if(Object.keys(receipt).length!==Object.keys(pending).length||Object.keys(pending).some(key=>!same(receipt[key],pending[key])))throw new Error('Activity receipt conflicts with the pending effect.');
  }else{
    validatePosture(pending,actor);
    const changes=pending.field==='cover'
      ?Object.fromEntries(Object.entries(pending.after).map(([field,value])=>[`system.condition.${field}`,value]))
      :{[`system.condition.${pending.field??'posture'}`]:pending.after};
    await writeActor(pending.actorUuid,{...changes,[`flags.phoenix-command.activityReceipts.${pending.id}`]:pending});
  }
  await acknowledge();
}

// D19: a movement stance overrides Table 7B's posture rows. A paid 7B posture change that a
// hex has just contradicted can no longer run - its starting posture is gone, and its
// destination is either already reached or no longer wanted. Voiding it here keeps it from
// failing validation later with an opaque reconciliation message. Actions already spent on
// it are not refunded, as everywhere else in this system.
export function supersedePostureActivity(state,pending){
  const entry=state.entries?.[pending.combatantId],activity=entry?.activity;
  if(activity?.effect?.kind!=='posture'||activity.effect.before===pending.posture.after)return false;
  entry.history.push({kind:'supersededPosture',activityId:activity.id,label:activity.label,
    progress:activity.progress,cost:activity.cost,phase:pending.phase,impulse:pending.impulse,
    detail:`A ${pending.posture.after} movement stance overrode this posture change (D19).`});
  entry.activity=null;
  return true;
}
