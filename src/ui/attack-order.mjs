import {equippedModes,supportsOrder,needsTarget} from './weapon-order-options.mjs';

// The token bar's Attack chooses a starting order from what is equipped; the order dialog
// still lets the player change it. Ranged kinds are listed most common first.
const rangedKinds=['shot','shotgun','burst','launcher','grenade'];
const feetPerUnit={ft:1,feet:1,foot:1,yd:3,yds:3,yard:3,yards:3};

export function attackFamilies(items){
  const rows=equippedModes(items);
  return {melee:rows.some(r=>supportsOrder(r,'strike')),ranged:rows.some(r=>rangedKinds.some(k=>supportsOrder(r,k)))};
}

// Adjacent is always in reach; longer weapons use their printed reach when the scene
// measures in feet or yards.
export function withinMeleeReach(items,{spaces,distance=null,units=''}={}){
  if(Number.isFinite(spaces)&&spaces<=1)return true;
  const perUnit=feetPerUnit[String(units).trim().toLowerCase()];
  if(!perUnit||!Number.isFinite(distance))return false;
  const reach=Math.max(0,...equippedModes(items).filter(r=>r.melee).map(r=>r.mode.reachMaxFeet??0));
  return distance*perUnit<=reach;
}

export function defaultAttackOrder(items,{targetInReach=false}={}){
  const options=[];
  for(const row of equippedModes(items))
    for(const kind of [...rangedKinds,'strike'])if(supportsOrder(row,kind))options.push({row,kind});
  if(!options.length)throw new Error('Equip a weapon that can attack.');
  const melee=options.filter(o=>o.kind==='strike'),ranged=options.filter(o=>o.kind!=='strike');
  const pool=!ranged.length?melee:!melee.length?ranged:targetInReach?melee:ranged;
  // The weapon's selected mode (its fire selector) comes first.
  const selected=pool.filter(o=>o.row.weapon.system.selectedModeId===o.row.modeId);
  const rank=o=>[...rangedKinds,'strike'].indexOf(o.kind);
  const pick=[...(selected.length?selected:pool)].sort((a,b)=>rank(a)-rank(b))[0];
  return {kind:pick.kind,itemId:pick.row.weapon.id,modeId:pick.row.modeId,needsTarget:needsTarget(pick.kind)};
}
