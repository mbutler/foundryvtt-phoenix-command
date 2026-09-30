// During a started encounter a player's inventory changes go through the timed workflow; the
// GM remains free to adjudicate (the coordinator's own receipted writes run as the GM). This
// is client-side workflow enforcement, not a hostile-client security boundary.
export const inStartedEncounter=(actor,combats)=>!!actor&&Array.from(combats??[]).some(c=>c.started&&c.combatants.some(b=>b.actor?.uuid===actor.uuid));

// `changes` is the flattened update; `current` the item's system data. Returns the reason a
// player's edit is refused, or null.
export function lockedItemChange(changes,current){
  const paths=Object.keys(changes);
  if(paths.some(p=>p==='system.quantity'||p.startsWith('system.loaded')||p.startsWith('system.firearmModes')))
    return 'Combat weapon and ammunition changes require the timed workflow or GM adjudication.';
  // Table 7B prices drawing, slinging, putting on and taking off equipment (PDF 67).
  if(['carried','equipped'].some(key=>Object.hasOwn(changes,`system.${key}`)&&changes[`system.${key}`]!==current?.[key]))
    return 'During an encounter, draw, stow, pick up, put on or take off equipment with Other actions, which spends the time Table 7B prices.';
  return null;
}
