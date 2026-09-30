// Table 7B rows that ready, stow, don, remove, pick up, throw or reset one of the character's
// items (LEG10200 PDF 67).
// Cost comes from the catalog; this module binds the chosen item and applies the result to
// what the system already models. Carried + equipped is ready to use or worn (attacks need
// both; armor protects only when both); carried alone is stowed, holstered, slung or taken
// off; not carried is not on the character.
//
// Equipment In/Out (user ruling, 26 Sep 2026): In = the item goes into place, Out = it comes
// out. Both quick-release rows are far faster Out, which only reads as taking them off. Worn
// gear In = put on; scabbard Out = drawn; sling In = slung. Attachments (bayonet to weapon,
// bipod, folding stock, scope, pistol stock, silencer, tripod) change no modeled rule and
// stay cost-only.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
const firearm=item=>Object.keys(item.system.firearmModes??{}).length>0;
const melee=item=>Object.keys(item.system.meleeModes??{}).length>0;
const READY={carried:true,equipped:true},STOWED={carried:true,equipped:false};
const draw={types:['weapon'],fits:firearm,noun:'a pistol',ready:true};
const worn=types=>({types,fits:()=>true,direction:{in:READY,out:STOWED}});
const ROWS=Object.freeze({
  'draw-shoulder':draw,'draw-belt':draw,'draw-police':draw,'draw-old-west':draw,'draw-modern':draw,
  'grab-slung':{types:['weapon'],fits:()=>true,ready:true},
  'pick-set-weapon':{types:['weapon'],fits:()=>true,handling:{'pick-up':{from:{carried:false},to:READY},'set-down':{from:{carried:true},to:{carried:false,equipped:false}}}},
  'equipment-armor':worn(['armor']),
  'equipment-backpack':worn(['equipment']),'equipment-bandolier':worn(['equipment']),'equipment-harness':worn(['equipment']),
  'equipment-mask':worn(['equipment']),'equipment-parachute':worn(['equipment']),
  'equipment-scabbard':{types:['weapon'],fits:melee,noun:'a knife or bayonet',direction:{in:STOWED,out:READY}},
  'equipment-sling':{types:['weapon'],fits:()=>true,direction:{in:STOWED,out:READY}},
  // A small object is equipment, ammunition or a grenade; a picked-up one is in hand, and a
  // thrown one leaves the character. Grenade attacks keep their own workflow, so throwing is
  // for objects rather than grenades.
  'pick-object':{types:['equipment','ammunition','weapon'],fits:item=>item.type!=='weapon'||!!item.system.firearmModes?.throw,noun:'a grenade or small object',
    fixed:{from:{carried:false},to:READY}},
  'throw-object':{types:['equipment','ammunition'],fits:()=>true,noun:'a small object',fixed:{from:{carried:true},to:{carried:false,equipped:false}}},
  // Operate a safety or fire selector: the carried weapon's selected firearm mode changes.
  'selector':{types:['weapon'],fits:item=>Object.keys(item.system.firearmModes??{}).length>1,noun:'a weapon with more than one fire mode',
    fields:['selectedModeId'],mode:true}
});
export const itemHandlingIds=Object.freeze(Object.keys(ROWS));
export const weaponHandlingChoices=Object.freeze(['pick-up','set-down']);

const HELD=['carried','equipped'];
const read={carried:item=>item.system.carried===true,equipped:item=>item.system.equipped===true,selectedModeId:item=>item.system.selectedModeId??''};
const state=(item,fields=HELD)=>Object.fromEntries(fields.map(field=>[field,read[field](item)]));

// What this activity leaves the item as, or null when it cannot act on it.
export function itemHandlingTarget(id,choice,item){
  const row=ROWS[id];
  if(!row||!row.types.includes(item?.type)||!row.fits(item))return null;
  const now=state(item);
  if(row.mode)return now.carried&&Object.hasOwn(item.system.firearmModes??{},choice??'')&&state(item,row.fields).selectedModeId!==choice?{selectedModeId:choice}:null;
  if(row.fixed)return now.carried===row.fixed.from.carried?row.fixed.to:null;
  if(row.ready)return now.carried&&!now.equipped?READY:null;
  if(row.handling){
    const pick=row.handling[choice];
    return pick&&now.carried===pick.from.carried?pick.to:null;
  }
  const to=row.direction[choice];
  // Only a carried item can be put on or taken off, and only when it changes something.
  return to&&now.carried&&now.equipped!==to.equipped?to:null;
}

// The choice a row needs from the player: the printed In/Out column, or pick up / set down.
export const itemHandlingChoice=(id,catalog)=>id==='pick-set-weapon'?catalog.handling:id==='selector'?catalog.modeId:ROWS[id]?.direction?catalog.parameters?.direction:undefined;

export function itemHandlingEffect(catalog,actor){
  const row=ROWS[catalog?.id];
  if(!row)return null;
  if(!actor?.uuid||actor.type!=='character')throw new Error('A character is required to handle equipment.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm the character is conscious before handling equipment.');
  const choice=itemHandlingChoice(catalog.id,catalog);
  if(row.handling&&!weaponHandlingChoices.includes(choice))throw new Error('Choose whether the weapon is picked up or set down.');
  const item=Array.from(actor.items??[]).find(candidate=>candidate.id===catalog.itemId);
  if(!item||!row.types.includes(item.type))throw new Error('Choose the item.');
  if(!row.fits(item))throw new Error(`${item.name} is not ${row.noun}.`);
  const after=itemHandlingTarget(catalog.id,choice,item);
  if(!after){
    if(row.mode)throw new Error(!item.system.carried?`${item.name} is not carried.`:`Choose one of ${item.name}'s other fire modes.`);
    if(row.fixed)throw new Error(row.fixed.from.carried?`${item.name} is not carried.`:`${item.name} is already carried.`);
    if(row.handling)throw new Error(choice==='pick-up'?`${item.name} is already carried.`:`${item.name} is not carried.`);
    if(!item.system.carried)throw new Error(`${item.name} is not carried.`);
    throw new Error(row.ready||row.direction?.[choice]?.equipped?`${item.name} is already ready or worn.`:`${item.name} is already stowed or taken off.`);
  }
  return {kind:'item-handling',activityId:catalog.id,actorUuid:actor.uuid,itemId:item.id,
    ...(choice===undefined?{}:{choice}),before:state(item,row.fields??HELD),after};
}

export function validateItemHandling(effect,actor){
  if(effect?.kind!=='item-handling')throw new Error('Unsupported item handling effect.');
  if(actor?.uuid!==effect.actorUuid)throw new Error('Item handling Actor changed; cancel and replan.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Consciousness changed; reconcile or cancel this activity before continuing.');
  const item=Array.from(actor.items??[]).find(candidate=>candidate.id===effect.itemId);
  if(!item)throw new Error('The item no longer exists; cancel this activity.');
  if(!same(state(item,Object.keys(effect.before)),effect.before))throw new Error(`${item.name} was moved, readied or put on another way; cancel this activity.`);
}

// Persist the pending effect on Combat BEFORE calling this. The item's state and its receipt
// are one document update, so a lost acknowledgement never applies it twice.
export async function finishItemHandling(pending,{readActor,writeItem,acknowledge}){
  const actor=await readActor(pending.actorUuid);
  if(!actor)throw new Error('The activity Actor no longer exists.');
  const item=actor.items?.find(candidate=>candidate.id===pending.itemId);
  if(!item)throw new Error('The item no longer exists.');
  const receipt=item.receipts?.[pending.id];
  if(receipt){
    if(Object.keys(receipt).length!==Object.keys(pending).length||Object.keys(pending).some(key=>!same(receipt[key],pending[key])))
      throw new Error('Item handling receipt conflicts with the pending effect.');
  }else{
    validateItemHandling(pending,actor);
    await writeItem(item.uuid,{...Object.fromEntries(Object.entries(pending.after).map(([field,value])=>[`system.${field}`,value])),
      [`flags.phoenix-command.handlingReceipts.${pending.id}`]:pending});
  }
  await acknowledge();
}
