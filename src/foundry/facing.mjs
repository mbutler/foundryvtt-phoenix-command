import {bearingBetween} from './hex-move.mjs';
import {facingChangeCost} from '../rules/movement.mjs';

export const normalizeFacing=value=>((value%360)+360)%360;
export function facingDifference(a,b){
  if(!Number.isFinite(a)||!Number.isFinite(b))throw new Error('Facing must be a finite angle.');
  return Math.abs(((a-b)%360+540)%360-180);
}
// LEG10200 §2.3: 60-degree Field of Fire, centered on facing. Foundry rotation
// follows the system's existing convention: zero is scene north, clockwise positive.
export function fieldOfFire(from,to,facing){
  const bearing=bearingBetween(from,to),difference=facingDifference(bearing,facing);
  return {allowed:difference<=30+1e-9,bearing,difference};
}
export function assertFireFacing(shooter,target){
  const from=shooter.getCenterPoint({x:shooter.x,y:shooter.y});
  const to=target.getCenterPoint({x:target.x,y:target.y});
  if(!fieldOfFire(from,to,shooter.rotation).allowed)
    throw new Error('Target is outside the 60° Field of Fire. Turn toward the target before aiming; in an encounter, use the Turn control.');
}
export function planTurn(token,actor,facing){
  if(!token?.uuid||!actor?.uuid)throw new Error('Turning requires a scene token and character.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Only a conscious character can turn.');
  const degrees=facingDifference(token.rotation,facing);
  if(degrees<1e-9)throw new Error('Already facing that direction.');
  const firingStance=actor.system.condition.firingStance??false;
  const cost=facingChangeCost({hexsides:Math.ceil((degrees-1e-9)/60),movingThisHex:false,firingStance}).actions;
  return {cost,label:`Turn to ${Math.round(normalizeFacing(facing))}°`,effect:{kind:'turn',tokenUuid:token.uuid,actorUuid:actor.uuid,
    before:{x:token.x,y:token.y,elevation:token.elevation,rotation:token.rotation},
    after:{x:token.x,y:token.y,rotation:normalizeFacing(facing)},firingStance}};
}
export function validateTurn(effect,token,actor){
  if(token?.uuid!==effect.tokenUuid||actor?.uuid!==effect.actorUuid||
    ['x','y','elevation','rotation'].some(key=>token[key]!==effect.before[key])||
    actor.system.condition.consciousness!=='conscious'||(actor.system.condition.firingStance??false)!==effect.firingStance)
    throw new Error('Position, facing or firing stance changed. Cancel and plan the turn again.');
}
export async function finishTurn(pending,{readToken,readActor,writeToken,acknowledge}){
  const token=await readToken(pending.tokenUuid),receipt=token?.receipts?.[pending.id];
  if(receipt){
    if(JSON.stringify(receipt)!==JSON.stringify(pending))throw new Error('Turn receipt conflicts with the pending effect.');
  }else{
    validateTurn(pending,token,await readActor(pending.actorUuid));
    await writeToken(pending.tokenUuid,{rotation:pending.after.rotation,[`flags.phoenix-command.turnReceipts.${pending.id}`]:pending});
    const updated=await readToken(pending.tokenUuid);
    if(updated?.rotation!==pending.after.rotation)throw new Error('Token rotation did not reach the paid facing. Reconcile the turn before continuing.');
  }
  await acknowledge();
}
