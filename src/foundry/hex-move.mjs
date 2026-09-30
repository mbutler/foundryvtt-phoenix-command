import {hexGeometry} from './hex-scene.mjs';

// Placing a paid hex of movement on the map. Table 7A charges by the direction of travel
// relative to the mover's facing, and section 2.3 leaves facing a free angle - "Facing may
// be in any direction and is not limited by the hex grid. Hexes are only used to regulate
// movement distance." So the direction cannot be read off a hexside; it comes from the
// angle between where the token faces and where it is going.
//
// System convention, not a printed rule: a Token's `rotation` 0 faces scene north and
// increases clockwise. Foundry states no facing semantics of its own, so this is recorded
// here rather than assumed silently elsewhere.
export const moveSource='Small Arms §2.3, PDF 11-12; Movement Table 7A, PDF 67';

// The book names four directions - Table 7A's Forward, Backward, Oblique and Sideways, the
// same four aspects the damage supplement calls front, oblique, side and rear. Their exact
// angular bands are NOT printed. Ruled at this table: sixty-degree sectors centred on the
// named directions, giving each of the four an equal share of the circle. An explicit
// direction on the command still overrides the reading.
const bands=[[30,'forward'],[90,'oblique'],[150,'sideways'],[180,'backward']];
export function proposeMoveDirection(bearingDegrees,facingDegrees){
  for(const value of [bearingDegrees,facingDegrees])
    if(!Number.isFinite(value))throw new Error('Bearing and facing must be finite angles in degrees.');
  const delta=((bearingDegrees-facingDegrees)%360+360)%360;
  const off=delta>180?360-delta:delta;
  // A hair of tolerance at the band edges: a facing aimed down a line of hexes puts each
  // zigzag hex exactly 30 degrees off, and floating-point bearings land either side of it.
  const direction=bands.find(([limit])=>off<=limit+1e-6)[1];
  return {direction,offAxisDegrees:Math.round(off*100)/100,basis:'ruled',
    detail:`Travel lies ${Math.round(off)} degrees off the mover's facing. Table 7A prints no angular bands; 60-degree sectors are the ruling in force. Supply an explicit direction to override it.`,
    source:moveSource};
}

// Bearing from one point to another with scene north as zero, clockwise, matching the
// Token rotation convention above.
export function bearingBetween(from,to){
  for(const point of [from,to])
    if(!Number.isFinite(point?.x)||!Number.isFinite(point?.y))throw new Error('Both points need finite x and y.');
  if(from.x===to.x&&from.y===to.y)throw new Error('A hex of movement needs two distinct points.');
  return (Math.atan2(to.x-from.x,from.y-to.y)*180/Math.PI+360)%360;
}

// Table 7A's movement stances do not match the three stored postures, and the ruling in
// force is that the stance sets the posture: a character who crawls a hex is prone when he
// gets there. The stance is already paid for in the hex, so this costs nothing further.
export const postureForStance=Object.freeze({standing:'standing','low-crouch':'standing',
  'hands-and-knees':'kneeling','belly-crawl':'prone'});

// A wall is not expensive, it is impassable. Table 7A prices ground - slope, brush, water,
// wire - and prints nothing for a brick wall, because you do not walk through one. Foundry
// knows where the walls are, so a hex behind one is refused when it is declared rather than
// paid for and then quietly not entered.
//
// This became reachable the moment maps started carrying walls for cover. Without it a paid
// hex across a wall writes a receipt saying the Token is somewhere it is not, and the next
// shot bound to that movement refuses with "a Token is not where its paid movement left it".
export function assertHexReachable({from,to,testCollision}){
  if(typeof testCollision!=='function')return {checked:false,
    detail:'No movement collision test was supplied, so walls were not consulted.'};
  if(testCollision(from,to))throw new Error('A wall stands between this hex and the next one. Table 7A prices ground, not walls: go round it, or have the GM move this combatant directly.');
  return {checked:true,detail:'No wall stands between the two hexes.'};
}

// One hex, adjacent, at the same elevation. Distance is counted in hexes by the native
// measurement, exactly as range is - never in pixels and never diagonally.
// `pivot` is the Token's own centre offset, because a Token's x/y is its top-left corner and
// the grid measures from centres. The resulting position is ROUNDED, because Foundry stores
// Token coordinates as integers - verified on 14.368, Math.round in both axes. Recording the
// unrounded float would leave the receipt disagreeing with the document by a fraction of a
// pixel, and a shot bound across the hex would then refuse to be where its movement left it.
export function planHexMove({scene,from,to,rotation=0,elevation=0,destinationElevation=0,pivot=null,measurePath,testCollision=null}){
  const geometry=hexGeometry(scene);
  if(elevation!==destinationElevation)throw new Error('Movement between elevations is not supported; both hexes must be at the same elevation.');
  const spaces=measurePath([from,to])?.spaces;
  if(!Number.isSafeInteger(spaces))throw new Error('Native hex measurement is unavailable.');
  if(spaces!==1)throw new Error(`Movement is charged one hex at a time; that destination is ${spaces} hexes away.`);
  const reachable=assertHexReachable({from,to,testCollision});
  const proposal=proposeMoveDirection(bearingBetween(from,to),rotation);
  if(pivot&&(!Number.isFinite(pivot.x)||!Number.isFinite(pivot.y)))throw new Error('A Token pivot needs finite x and y.');
  return {...proposal,geometry,from:{...from},to:{...to},feet:geometry.feetPerHex,reachable,
    ...(pivot?{position:{x:Math.round(to.x-pivot.x),y:Math.round(to.y-pivot.y)}}:{})};
}

// A route is a chain of adjacent hexes, each priced like a single declaration. The mover
// commits to the path up front; the ledger still enters one hex at a time.
export function planHexRoute({scene,from,destinations,rotation=0,elevation=0,pivot=null,measurePath,testCollision=null}){
  if(!destinations?.length)throw new Error('Choose at least one hex for a movement route.');
  const legs=[],points=[from];
  for(const to of destinations){
    const plan=planHexMove({scene,from:points.at(-1),to,rotation,elevation,destinationElevation:elevation,
      pivot:points.length===1?pivot:null,measurePath,testCollision});
    legs.push(plan);
    points.push(to);
  }
  return {legs,destinations:[...destinations],hexes:legs.length};
}

// Every completed hex carries a character effect, including unchanged posture:
// standing movement must still end firing stance and bracing.
export function movementPosture(actor,posture){
  return {actorUuid:actor.uuid,before:actor.system.condition.posture,after:posture};
}

// Applying the hex to the map, with the same recovery shape as a posture change: persist
// the pending effect first, write the Token and its receipt together, and never move a
// Token that has since been moved by something else.
export function validateTokenMove(effect,token){
  if(token?.uuid!==effect.tokenUuid)throw new Error('The moving Token changed.');
  if(token.x!==effect.before.x||token.y!==effect.before.y||token.elevation!==effect.before.elevation)
    throw new Error('The Token moved since this hex was paid for; reconcile the encounter before applying it.');
}
export async function finishTokenMove(pending,{readToken,writeToken,readActor,writeActor,acknowledge}){
  const token=await readToken(pending.tokenUuid);
  if(!token)throw new Error('The moving Token no longer exists.');
  const receipt=token.receipts?.[pending.id];
  if(receipt){
    if(Object.keys(receipt).length!==Object.keys(pending).length||Object.keys(pending).some(key=>JSON.stringify(receipt[key])!==JSON.stringify(pending[key])))
      throw new Error('Movement receipt conflicts with the pending effect.');
  }else{
    validateTokenMove(pending,token);
    await writeToken(pending.tokenUuid,{x:pending.after.x,y:pending.after.y,
      ...(pending.after.rotation===undefined?{}:{rotation:pending.after.rotation}),
      [`flags.phoenix-command.movementReceipts.${pending.id}`]:pending});
    // Verify rather than assume. Foundry treats a Token position update as movement and can
    // constrain it - against a wall, for instance - WITHOUT throwing, which would leave a
    // receipt claiming a position the document does not hold. Caught natively; see
    // docs/runtime-verification.md.
    const placed=await readToken(pending.tokenUuid);
    if(placed&&(placed.x!==pending.after.x||placed.y!==pending.after.y))
      throw new Error(`The Token was written to ${pending.after.x},${pending.after.y} but came to rest at ${placed.x},${placed.y}. Something constrained the move - most often a wall. Reconcile the encounter before continuing.`);
  }
  // The posture the stance implies is a second document and so a second receipt. Unlike a
  // Table 7B posture change this carries no injury guard: Table 7A prices injured movement
  // explicitly (+2 above the waist, +12 below), so an injured character can still crawl.
  if(pending.posture)await finishMovePosture(pending,{readActor,writeActor});
  await acknowledge();
}
async function finishMovePosture(pending,{readActor,writeActor}){
  const actor=await readActor(pending.posture.actorUuid);
  if(!actor)throw new Error('The moving Actor no longer exists.');
  const receipt=actor.receipts?.[pending.id];
  if(receipt){
    if(JSON.stringify(receipt)!==JSON.stringify(pending.posture))throw new Error('Movement posture receipt conflicts with the pending effect.');
    return;
  }
  if(actor.system.condition.consciousness!=='conscious')throw new Error('An unconscious combatant cannot complete a change of movement stance.');
  if(actor.system.condition.posture!==pending.posture.before)
    throw new Error('Posture changed since this hex was paid for; reconcile the encounter before applying it.');
  await writeActor(pending.posture.actorUuid,{'system.condition.posture':pending.posture.after,'system.condition.firingStance':false,'system.condition.braced':false,'system.condition.looking':false,
    [`flags.phoenix-command.movementReceipts.${pending.id}`]:pending.posture});
}

// Whether a Token's present position is explained by movement it actually paid for.
//
// A timed shot used to bind both Tokens to the pixel: any change invalidated it, which was
// the honest thing to do while nothing could move legally. Now movement is charged, and the
// distinction that matters is not whether a Token moved but whether the rules moved it. So
// the plan records the movement receipts each Token carried when it was made, and this
// walks the receipts written since, linking each hex's `before` to the last one's `after`.
// A Token that ends where its paid hexes left it is bound; one that was dragged is not, and
// neither is one whose paid hexes do not chain from where the shot was planned.
export function accountedMovement({planned,current,receipts={},knownIds=[]}){
  if(!planned||!current)throw new Error('Both the planned and current positions are required.');
  const known=new Set(knownIds);
  const remaining=Object.values(receipts).filter(receipt=>!known.has(receipt.id));
  // New spatial effects retain ledger order, including turns that return to a prior
  // facing before a move. Position alone cannot order a cycle unambiguously.
  if(remaining.every(receipt=>Number.isSafeInteger(receipt.revision)))remaining.sort((a,b)=>a.revision-b.revision);
  const at=point=>({x:point.x,y:point.y,rotation:point.rotation??0,elevation:point.elevation??0});
  const same=(a,b)=>a.x===b.x&&a.y===b.y&&a.rotation===b.rotation&&a.elevation===b.elevation;
  let position=at(planned);
  const chain=[];
  while(remaining.length){
    const index=remaining.findIndex(receipt=>same(at(receipt.before),position));
    if(index<0)return {accounted:false,hexes:chain.length,
      reason:'Paid movement does not link to the position this shot was planned from.'};
    const [step]=remaining.splice(index,1);
    // Movement never changes elevation, so the hex carries the elevation it started at.
    position=at({x:step.after.x,y:step.after.y,
      rotation:step.after.rotation??step.before.rotation,elevation:step.before.elevation});
    chain.push(step.id);
  }
  if(!same(position,at(current)))return {accounted:false,hexes:chain.length,
    reason:chain.length?'A Token is not where its paid movement left it.'
      :'A Token moved with no paid movement to account for it.'};
  return {accounted:true,hexes:chain.length,chain};
}
