import {ammunitionWeightDefaults} from '../rules/ammunition-weight.mjs';
import {ammunitionWeights} from '../data/ammunition-weights.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {quickOrders} from './quick-orders.mjs';

const inCombat=actor=>game.combats.some(c=>c.started&&c.combatants.some(b=>b.actor?.uuid===actor.uuid));
function combatReloadMessage(actor){
  const where='During combat, use Reload on the token action bar. It spends the weapon’s reload time.';
  try{
    const snapshot={uuid:actor.uuid,type:actor.type,system:actor.system.toObject(),items:Array.from(actor.items,i=>({id:i.id,name:i.name,type:i.type,system:i.system.toObject()}))};
    const blocked=quickOrders(snapshot).reloadBlocked;
    return blocked.length?`${where} ${blocked.join(' ')}`:where;
  }catch{return where;}
}
export function availableRounds(items,ammoId,weaponId){
  const ammo=items.find(i=>i.id===ammoId);
  return (ammo?.system.quantity??0)-items.filter(i=>i.id!==weaponId&&i.system.loaded?.ammunitionItemId===ammoId).reduce((sum,i)=>sum+i.system.loaded.rounds,0);
}
export async function loadGun(actor,weaponId,modeId){
  if(!actor.isOwner)throw new Error('You must own this character to load a gun.');
  if(inCombat(actor))throw new Error(combatReloadMessage(actor));
  const weapon=actor.items.get(weaponId),mode=weapon?.system.firearmModes?.[modeId];
  if(!mode||!Number.isInteger(mode.capacity))throw new Error('Record this weapon’s magazine capacity before loading it.');
  const weightProfile=ammunitionWeights[weapon.system.catalogId];
  const items=Array.from(actor.items);
  const compatible=items.filter(i=>i.type==='ammunition'&&i.system.carried&&mode.ammunition[i.system.ammunitionKey]&&(!i.system.compatibleCatalogIds?.length||i.system.compatibleCatalogIds.includes(weapon.system.catalogId)));
  const answer=await foundry.applications.api.DialogV2.prompt({
    window:{title:`Load ${weapon.name}`},position:{width:520},
    content:`<div class="pc-dialog pc-load-gun"><p>Capacity: <strong>${mode.capacity} rounds</strong>. Loading sets the magazine and chambers a round, ready to fire.</p>
      <label>Ammunition stock<select name="stock">${compatible.map(i=>`<option value="${e(i.id)}">${e(i.name)} · ${availableRounds(items,i.id,weaponId)} available</option>`).join('')}<option value="new">Add new ammunition stock</option></select></label>
      <fieldset class="pc-new-stock"><legend>New ammunition</legend>
      <label>Type<select name="ammoKey">${Object.keys(mode.ammunition).map(key=>`<option value="${e(key)}">${e(key.toUpperCase())}</option>`).join('')}</select></label>
      <label>Total rounds owned (including rounds you load)<input name="quantity" type="number" min="1" step="1" value="${mode.capacity}"></label>
      ${weightProfile?`<input name="weight" type="hidden" value=""><p>Book loadout weight: ${weightProfile.weightLb} lb per ${e(weightProfile.unit)}${weightProfile.unit!=='round'?` (${weightProfile.capacity} rounds)`:""}. Filled automatically. The loaded device is included in weapon weight; only spares add weight. Carried magazines retain this loadout weight after firing; remove discarded magazines from the ammunition item’s package count.</p>`:`<label>Weight per round · lb<input name="weight" type="number" min="0" step="any"></label><p>This custom ammunition needs a recorded weight.</p>`}</fieldset>
      <label>Rounds to load<input name="rounds" type="number" min="1" max="${mode.capacity}" step="1" value="${mode.capacity}" required></label>
      <p>Existing loaded rounds return to stock. Loading reserves rounds from your total; it does not spend them. A fight can reload only when spare rounds remain.</p></div>`,
    ok:{label:'Load gun',callback:(_event,_button,dialog)=>Object.fromEntries(['stock','ammoKey','quantity','weight','rounds'].map(key=>[key,dialog.element.querySelector(`[name="${key}"]`).value]))},rejectClose:false
  });
  if(!answer)return false;
  if(inCombat(actor))throw new Error(combatReloadMessage(actor));
  const rounds=Number(answer.rounds),capacity=weapon.system.firearmModes[modeId].capacity;
  if(!Number.isInteger(rounds)||rounds<1||rounds>capacity)throw new Error(`Load between 1 and ${capacity} whole rounds.`);
  let ammo;
  if(answer.stock==='new'){
    const quantity=Number(answer.quantity),weight=answer.weight===''?null:Number(answer.weight);
    if(!mode.ammunition[answer.ammoKey]||!Number.isInteger(quantity)||quantity<rounds||weight!==null&&(!Number.isFinite(weight)||weight<0))throw new Error('Choose a supported ammunition type, enough total rounds, and a nonnegative weight.');
    [ammo]=await actor.createEmbeddedDocuments('Item',[{name:`${weapon.name} · ${answer.ammoKey.toUpperCase()}`,type:'ammunition',system:{ammunitionKey:answer.ammoKey,compatibleCatalogIds:weapon.system.catalogId?[weapon.system.catalogId]:[],quantity,weightLb:weight,...(ammunitionWeightDefaults(weapon.system.catalogId,quantity)??{}),carried:true}}]);
    if(!ammo)throw new Error('Ammunition could not be added.');
  }else{
    ammo=actor.items.get(answer.stock);
    if(!ammo||!compatible.some(i=>i.id===ammo.id)||!ammo.system.carried||availableRounds(Array.from(actor.items),ammo.id,weaponId)<rounds)throw new Error('There are not enough compatible, carried rounds available. Reduce rounds to load or add stock.');
  }
  await weapon.update({'system.loaded':{ammunitionItemId:ammo.id,rounds,chamber:'ready'}});
  ui.notifications.info(`${weapon.name}: ${rounds} rounds of ${ammo.system.ammunitionKey.toUpperCase()} loaded.`);
  return true;
}
