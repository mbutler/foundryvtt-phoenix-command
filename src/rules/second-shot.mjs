// LEG10200 §5.8 Second Shot Accuracy (optional), PDF 56 / printed 51, read from the page:
// "A shooter who fires a second shot at a target in the same hex in which the first shot was
// fired receives a +1 AC bonus to his second shot's aim time. To receive this bonus, the
// shooter must remain stationary and may not have broken firing stance." The book's example:
// 2 AC of aim fired as a second shot is read as 3.
//
// Readings (27–28 September 2026): "the first shot" is the shooter's previous shot in this
// encounter; "stationary" is no hex entered since it and the same hex; firing stance not
// broken is the same posture and firing stance at both shots (a man who fired from the hip
// and still is has broken nothing). The bonus is +1 however many shots follow, and it is read
// on the weapon's own aim row, so it cannot pass the longest aim the row prints.
export const secondShotSource='LEG10200 §5.8, PDF 56 · visual check';
const same=(a,b)=>a&&b&&a.i===b.i&&a.j===b.j;

// previous/current: {shooterHex:{i,j}, targetHex:{i,j}, posture, firingStance}.
export function secondShotBonus({previous,current,movedSince=false}){
  if(!previous)return {bonus:0,reason:'No earlier shot this encounter.'};
  if(!same(previous.targetHex,current.targetHex))return {bonus:0,reason:'The target is not in the hex of the previous shot.'};
  if(movedSince||!same(previous.shooterHex,current.shooterHex))return {bonus:0,reason:'The shooter has moved since his previous shot.'};
  if(previous.posture!==current.posture||Boolean(previous.firingStance)!==Boolean(current.firingStance))return {bonus:0,reason:'The shooter changed posture or firing stance since his previous shot.'};
  return {bonus:1,reason:'Second shot into the same hex, stationary, firing stance kept: +1 AC of aim (§5.8).'};
}

// The aim row entry a shot reads: the aim paid, plus the bonus, no further than the row goes.
export function aimRowKey(aimModifiers,aimActions,bonus=0){
  if(!bonus)return aimActions;
  const longest=Math.max(...Object.keys(aimModifiers??{}).map(Number).filter(Number.isFinite));
  return Math.min(aimActions+bonus,longest);
}
