// Targeting a public encounter token never grants access to its actor sheet.
// Canvas visibility is checked on the requesting client; the coordinator checks
// document identity and GM-hidden state, and adjudicates actual sightlines.
export function publicEncounterTarget(combatant){
  return !!(combatant?.token&&!combatant.hidden&&!combatant.token.hidden&&combatant.actor?.type==='character');
}
export function visibleEncounterTarget(combatant,user){
  return !!(combatant?.token?.object?.visible&&combatant.actor?.type==='character'
    &&(user.isGM||publicEncounterTarget(combatant)));
}
