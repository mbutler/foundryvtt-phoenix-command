import {targetSizeRow} from '../rules/cover.mjs';
import {situationLabel} from './situation.mjs';
// Per-client session choices; never reuse rolls or derived target protection.
const drafts=new Map();
const key=c=>JSON.stringify([c.scene,c.attacker.tokenUuid??c.attacker.actorUuid,c.target.tokenUuid??c.target.actorUuid,c.weapon.id,c.modeId,c.attackId]);
const stamp=c=>JSON.stringify({positions:c.positions,target:c.target,attackerCondition:c.attacker.system.condition,attackerInjuries:c.attacker.system.injuries,environment:c.environment});
export function rememberAttackDraft(context,draft){
  if(!context||context.timedShot)return;
  drafts.set(key(context),{stamp:stamp(context),draft:structuredClone(draft)});
  if(drafts.size>100)drafts.delete(drafts.keys().next().value);
}
export function recallAttackDraft(context){
  const saved=drafts.get(key(context));
  return saved?.stamp===stamp(context)?structuredClone(saved.draft):{};
}
export function firearmReadiness(context,ammunitionKey){
  const loaded=context.weapon.system.loaded;
  const ammo=context.attacker.items.find(i=>i.id===loaded?.ammunitionItemId&&i.type==='ammunition');
  if(!ammo||!(loaded?.rounds>0))return 'This gun is unloaded. Add ammunition to the character and load the gun before rolling. Choosing FMJ or another type here only selects its ballistic data.';
  if(!ammo.system.carried||!(ammo.system.quantity>0))return 'The loaded ammunition has no carried stock available. Check its Carried setting and quantity.';
  if(ammunitionKey&&ammo.system.ammunitionKey!==ammunitionKey)return `The gun is loaded with ${ammo.system.ammunitionKey.toUpperCase()}, not ${ammunitionKey.toUpperCase()}. Select the loaded type or reload the gun.`;
  if(ammo.system.compatibleCatalogIds?.length&&!ammo.system.compatibleCatalogIds.includes(context.weapon.system.catalogId))return 'The loaded ammunition is not compatible with this gun.';
  return null;
}

// Posture supplies the exposed target row; cover remains a sightline adjudication.
export function recordedShotDefaults(attacker,target){
  const defaults={situation:situationLabel(attacker?.system.condition)??undefined};
  try{defaults.exposure=targetSizeRow({behindCover:false,targetPosture:target?.system.condition?.posture}).row;}catch{/* Unknown posture stays explicit. */}
  return defaults;
}
