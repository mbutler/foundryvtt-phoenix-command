// Table 7B "RT — Unload a Weapon". Cost comes from characterActivity / the mode's
// Reload Time; this module only binds and applies the equipment consequence.
// Ammunition quantity is total stock. Loaded rounds are a reservation, so unload
// clears the weapon without adding rounds back to quantity.
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);

function loadedSnapshot(loaded={}){
  return {
    ammunitionItemId:loaded.ammunitionItemId??null,
    rounds:loaded.rounds??0,
    chamber:loaded.chamber??'unknown'
  };
}

export function unloadEffect(catalog,actor){
  if(catalog?.id!=='unload-weapon')return null;
  if(!actor?.uuid||actor.type!=='character')throw new Error('A character is required to unload a weapon.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm the character is conscious before unloading.');
  const weapon=Array.from(actor.items??[]).find(item=>item.id===catalog.weaponId&&item.type==='weapon');
  const mode=weapon?.system.firearmModes?.[catalog.modeId];
  if(!weapon?.system.carried||!mode)throw new Error('Choose a carried weapon to unload.');
  if(!Number.isSafeInteger(mode.reloadTimeActions)||mode.reloadTimeActions<=0)
    throw new Error('This weapon mode needs a printed whole-action Reload Time before it can be unloaded.');
  const loaded=loadedSnapshot(weapon.system.loaded);
  if(!(loaded.rounds>0)&&loaded.chamber!=='ready')throw new Error('This weapon is already unloaded.');
  return {
    kind:'unload',
    actorUuid:actor.uuid,
    weaponId:weapon.id,
    modeId:catalog.modeId,
    reloadTimeActions:mode.reloadTimeActions,
    loadedBefore:loaded,
    loadedAfter:{ammunitionItemId:null,rounds:0,chamber:'empty'}
  };
}

export function validateUnload(effect,actor){
  if(effect?.kind!=='unload')throw new Error('Unsupported unload effect.');
  if(actor?.uuid!==effect.actorUuid)throw new Error('Unload Actor changed; cancel and replan.');
  if(actor.system.condition.consciousness!=='conscious')
    throw new Error('Consciousness changed; reconcile or cancel this unload before continuing.');
  const weapon=Array.from(actor.items??[]).find(item=>item.id===effect.weaponId&&item.type==='weapon');
  const mode=weapon?.system.firearmModes?.[effect.modeId];
  if(!weapon)throw new Error('Unload weapon no longer exists; cancel this activity.');
  if(!weapon.system.carried)throw new Error('Unload weapon is no longer carried; cancel this activity.');
  if(!mode)throw new Error('Unload weapon mode no longer exists; cancel this activity.');
  if(mode.reloadTimeActions!==effect.reloadTimeActions)
    throw new Error('Weapon Reload Time changed; cancel and replan before investing more actions.');
  if(!same(loadedSnapshot(weapon.system.loaded),effect.loadedBefore))
    throw new Error('Weapon load changed; cancel and replan before investing more actions.');
}

// Persist the pending effect on Combat BEFORE calling this. Weapon receipt and
// loaded state are one document update. Recovery after a lost acknowledgement
// reads the receipt and never clears a later load, and never invents stock.
export async function finishUnload(pending,{readActor,writeWeapon,acknowledge}){
  const actor=await readActor(pending.actorUuid);
  if(!actor)throw new Error('The activity Actor no longer exists.');
  const weapon=actor.items?.find(item=>item.id===pending.weaponId);
  if(!weapon)throw new Error('Unload weapon no longer exists.');
  const receipt=weapon.receipts?.[pending.id];
  if(receipt){
    if(Object.keys(receipt).length!==Object.keys(pending).length||Object.keys(pending).some(key=>!same(receipt[key],pending[key])))
      throw new Error('Unload receipt conflicts with the pending effect.');
  }else{
    validateUnload(pending,actor);
    await writeWeapon(weapon.uuid,{
      'system.loaded':pending.loadedAfter,
      'flags.phoenix-command.lastResourceApplication':`unload-${pending.id}`,
      [`flags.phoenix-command.unloadReceipts.${pending.id}`]:pending
    });
  }
  await acknowledge();
}
