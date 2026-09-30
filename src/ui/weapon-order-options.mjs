// Presentation choices only. weaponActivity remains authoritative for legality and cost.
export const weaponOrderKinds = Object.freeze({shot:'Fire single shot',threeRound:'Fire three-round burst',shotgun:'Fire shotgun',burst:'Fire burst',grenade:'Throw grenade',launcher:'Fire launcher',strike:'Strike',reload:'Reload',parry:'Parry',recover:'Recover weapon'});
export const isMeleeOrder = kind => ['strike','parry','recover'].includes(kind);
export const needsTarget = kind => ['shot','threeRound','shotgun','grenade','launcher','strike'].includes(kind);
export function equippedModes(items) {
  return items.filter(w=>w.type==='weapon'&&w.system.carried&&w.system.equipped).flatMap(weapon=>[
    ...Object.entries(weapon.system.firearmModes??{}).map(([modeId,mode])=>({weapon,modeId,mode,melee:false})),
    ...Object.entries(weapon.system.meleeModes??{}).map(([modeId,mode])=>({weapon,modeId,mode,melee:true}))
  ]);
}
export function supportsOrder(row,kind) {
  if(isMeleeOrder(kind))return row.melee;
  if(row.melee)return false;
  const m=row.mode,loads=Object.values(m.ammunition??{});
  const explosive=loads.some(a=>Object.keys(a.burst??{}).length);
  const thrown=m.throwRangeHexes!=null||m.armTimeActions!=null;
  const pellets=a=>a.pelletNumber!=null||Object.values(a.ranges??{}).some(r=>r.salm!=null);
  // A thrown weapon's reload is readying the next grenade from the carried stack.
  if(kind==='reload')return !thrown||explosive;
  if(kind==='grenade')return explosive&&thrown;
  if(kind==='launcher')return explosive&&!thrown;
  if(kind==='burst')return m.fireTypes?.includes('automatic')&&m.burstRounds>0;
  if(kind==='threeRound')return !explosive&&m.fireTypes?.includes('single')&&Object.keys(m.threeRoundBurst??{}).length>0&&loads.some(a=>!pellets(a));
  if(kind==='shotgun')return !explosive&&m.fireTypes?.includes('single')&&loads.some(pellets);
  return kind==='shot'&&!explosive&&m.fireTypes?.includes('single')&&loads.some(a=>!pellets(a));
}
export function compatibleAmmunition(items,row) {
  if(!row||row.melee)return [];
  return items.filter(i=>i.type==='ammunition'&&i.system.carried&&row.mode.ammunition?.[i.system.ammunitionKey]
    &&(!i.system.compatibleCatalogIds?.length||i.system.compatibleCatalogIds.includes(row.weapon.system.catalogId)));
}
export function preferredMode(rows,selection={}) {
  if(selection.itemId){
    const index=rows.findIndex(r=>r.weapon.id===selection.itemId&&(!selection.modeId||r.modeId===selection.modeId));
    if(index<0)throw new Error('The selected weapon cannot perform this order.');
    return index;
  }
  const preferred=rows.findIndex(r=>r.weapon.system.selectedModeId===r.modeId);
  return preferred>=0?preferred:0;
}
