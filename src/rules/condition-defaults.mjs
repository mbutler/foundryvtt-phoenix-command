// Normalize old unset conditions without changing recorded tactical state.
//
// Only a value actually stored as null or 'unknown' is replaced. Foundry runs a model's
// migration on partial data too - an unlinked token's actor delta and ordinary updates - and a
// key that is absent there is simply not being changed. Creating one here wrote "conscious"
// into every such update, so editing a wound on a knocked-out man's token woke him (found
// natively, 28 September 2026). A new character gets standing, conscious and speed 0 from the
// schema's initial values.
const has=(object,key)=>Object.hasOwn(object,key);
export function defaultCharacterConditions(source){
  const condition=source?.condition;
  if(!condition||typeof condition!=='object')return source;
  if(has(condition,'posture')&&(condition.posture==null||condition.posture==='unknown'))condition.posture='standing';
  if(has(condition,'consciousness')&&(condition.consciousness==null||condition.consciousness==='unknown'))
    condition.consciousness=source.recovery?.outcome==='died'?'incapacitated':'conscious';
  if(has(condition,'speedFeetPerSecond')&&condition.speedFeetPerSecond==null)condition.speedFeetPerSecond=0;
  return source;
}
