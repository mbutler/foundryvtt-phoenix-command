// Reuse only an explicit GM approval for this unchanged weapon and sightline.
// Dice, movement modifiers, range and cover readings are always rebuilt separately.
export function conditionKey(combat,shot){
  const target=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid);
  return target?`${shot.combatantId}-${target.id}`:null;
}
export function conditionStamp(combat,shot){
  const shooter=combat.combatants.get(shot.combatantId),target=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid);
  if(!shooter?.token||!target?.token)return null;
  const token=c=>{
    // v14 animates prepared Token fields after update resolves. Approval belongs
    // to persisted geometry, so an in-flight turn must invalidate it immediately.
    const data=c.token.toObject?.()??c.token;
    return {uuid:c.token.uuid,x:data.x,y:data.y,elevation:data.elevation,rotation:data.rotation,
      modified:data._stats?.modifiedTime,orderEpoch:combat.getFlag?.('phoenix-command',`shotConditionEpochs.${c.id}`)??null,posture:c.actor?.system.condition.posture,braced:c.actor?.system.condition.braced,firingStance:c.actor?.system.condition.firingStance,looking:c.actor?.system.condition.looking};
  };
  const scene=combat.scene;
  const documents=collection=>Array.from(collection??[],d=>d.toObject?d.toObject():d);
  const weapon=shooter.actor?.items?.get?.(shot.plan.weaponId);
  return JSON.stringify({shooter:token(shooter),target:token(target),weapon:shot.plan.weaponId,mode:shot.plan.modeId,
    equipped:weapon?.system.equipped,heldIn:weapon?.system.heldIn,scene:scene?.id,environment:scene?.environment,
    darkness:scene?.darkness,flags:scene?.flags?.['phoenix-command'],walls:documents(scene?.walls),regions:documents(scene?.regions),lights:documents(scene?.lights)});
}
export function reusableShotConditions(combat,shot){
  if(shot.plan.kind!=='shot')return null;
  const key=conditionKey(combat,shot),saved=key&&combat.getFlag('phoenix-command',`shotConditions.${key}`);
  return saved?.stamp&&saved.stamp===conditionStamp(combat,shot)?structuredClone(saved.choices):null;
}
