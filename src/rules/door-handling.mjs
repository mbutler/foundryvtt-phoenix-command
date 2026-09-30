// Table 7B "Open a Door" (3) and "Kick Open a Door" (2), LEG10200 PDF 67, bound to a door on
// the map. User ruling (26 Sep 2026): opening needs a closed, unlocked door; a kick also forces
// a locked one; either leaves it open. The door must be next to the character: a door segment
// within one hex of his token's centre. Walls are plain snapshots {id, door, ds, c}, with
// Foundry's door types (0 none) and states (0 closed, 1 open, 2 locked).
const CLOSED=0,OPEN=1,LOCKED=2;
export const doorIds=Object.freeze(['open-door','kick-door']);
const opens={'open-door':[CLOSED],'kick-door':[CLOSED,LOCKED]};

export function distanceToSegment(p,a,b){
  const dx=b.x-a.x,dy=b.y-a.y,length=dx*dx+dy*dy;
  const t=length?Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/length)):0;
  return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));
}
const distance=(wall,center)=>distanceToSegment(center,{x:wall.c[0],y:wall.c[1]},{x:wall.c[2],y:wall.c[3]});

export function doorTarget(id,wall){
  if(!opens[id]||!(wall?.door>0))return null;
  return opens[id].includes(wall.ds)?{ds:OPEN}:null;
}

// The doors this row can act on from where the token stands, nearest first.
export function doorsInReach(id,walls,center,reach){
  return (walls??[]).filter(wall=>wall.door>0&&doorTarget(id,wall)&&distance(wall,center)<=reach)
    .map(wall=>({...wall,distance:distance(wall,center),state:wall.ds===LOCKED?'locked':'closed'}))
    .sort((a,b)=>a.distance-b.distance);
}

export function doorEffect(catalog,{actor,token,center,walls,reach}){
  if(!doorIds.includes(catalog?.id))return null;
  if(!actor?.uuid||actor.type!=='character')throw new Error('A character is required to open a door.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm the character is conscious before opening a door.');
  if(!token?.uuid)throw new Error('The character needs a token on the encounter scene to open a door.');
  const wall=(walls??[]).find(candidate=>candidate.id===catalog.wallId);
  if(!(wall?.door>0))throw new Error('Choose a door on the map.');
  if(distance(wall,center)>reach)throw new Error('That door is not next to the character.');
  const after=doorTarget(catalog.id,wall);
  if(!after)throw new Error(wall.ds===OPEN?'That door is already open.':'That door is locked. Kick it open, or ask the GM.');
  return {kind:'door',activityId:catalog.id,actorUuid:actor.uuid,tokenUuid:token.uuid,wallId:wall.id,before:{ds:wall.ds},after};
}

export function validateDoor(effect,{actor,token,center,walls,reach}){
  if(effect?.kind!=='door')throw new Error('Unsupported door effect.');
  if(actor?.uuid!==effect.actorUuid||token?.uuid!==effect.tokenUuid)throw new Error('The character or token changed; cancel and replan.');
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Consciousness changed; reconcile or cancel this activity before continuing.');
  const wall=(walls??[]).find(candidate=>candidate.id===effect.wallId);
  if(!wall)throw new Error('The door is no longer on the map; cancel this activity.');
  if(wall.ds!==effect.before.ds)throw new Error('The door was opened, closed or locked another way; cancel this activity.');
  if(distance(wall,center)>reach)throw new Error('The character is no longer next to the door; cancel this activity.');
}

// Persist the pending effect on Combat BEFORE calling this. The door state and its receipt are
// one wall update, so a lost acknowledgement never opens it twice or overrides a later change.
export async function finishDoor(pending,{readWall,writeWall,acknowledge}){
  const wall=await readWall(pending.wallId);
  if(!wall)throw new Error('The door is no longer on the map.');
  const receipt=wall.receipts?.[pending.id];
  if(receipt){
    if(Object.keys(receipt).length!==Object.keys(pending).length||Object.keys(pending).some(key=>JSON.stringify(receipt[key])!==JSON.stringify(pending[key])))
      throw new Error('Door receipt conflicts with the pending effect.');
  }else{
    if(wall.ds!==pending.before.ds)throw new Error('The door was opened, closed or locked another way.');
    await writeWall(pending.wallId,{ds:pending.after.ds,[`flags.phoenix-command.doorReceipts.${pending.id}`]:pending});
  }
  await acknowledge();
}
