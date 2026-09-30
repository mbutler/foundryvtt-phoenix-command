import {fieldOfFire} from './facing.mjs';
// The Foundry side of an Arc of Fire. The rule is in `arc-geometry.mjs`; this only turns
// Token documents and clicked points into the cubes that rule reads. Centres come from the
// Token document, never from its sprite.
import { hexGeometry } from './hex-scene.mjs';
import { personnelInArc } from '../rules/arc-geometry.mjs';

export function cubeOf(grid, point) {
  const center = grid.getCenterPoint(grid.getOffset(point));
  const cube = grid.getCube(center);
  if (![cube?.q, cube?.r, cube?.s].every(Number.isSafeInteger) || cube.q + cube.r + cube.s !== 0) {
    throw new Error('This hex map did not return a cube coordinate.');
  }
  return { q: cube.q, r: cube.r, s: cube.s };
}

export function burstArcFromPoints(scene, shooterToken, points, arcHexes) {
  const geometry = hexGeometry(scene);
  const grid = scene.grid;
  if (!Array.isArray(points) || !points.length) throw new Error('Designate the hexes the burst is swept across.');
  const shooter = cubeOf(grid, shooterToken.getCenterPoint({ x: shooterToken.x, y: shooterToken.y }));
  const swept = points.map(point => cubeOf(grid, point));
  assertBurstFacing(scene,shooterToken,swept);
  return {
    geometry,
    arc: { shooter, swept, arcHexes, feetPerHex: geometry.feetPerHex }
  };
}

export function assertBurstFacing(scene,token,swept){
  const from=token.getCenterPoint({x:token.x,y:token.y});
  for(const hex of swept){
    if(!fieldOfFire(from,scene.grid.getCenterPoint(hex),token.rotation).allowed)
      throw new Error('The burst extends outside the 60° Field of Fire. Sweep hexes ahead of the token, or abandon this burst and Turn before aiming again.');
  }
}

// Who the arc covers right now. Men in the depth at another range are named and refused:
// §3.4 gives the burst one elevation, and that elevation is a property of one range.
export function arcOccupants(combat, combatantId, arc) {
  const shooter = combat.combatants.get(combatantId)?.token;
  if (!shooter) throw new Error('The shooter has no scene token.');
  assertBurstFacing(combat.scene,shooter,arc.swept);
  const grid = combat.scene.grid;
  const others = combat.combatants.filter(c => c.id !== combatantId && c.token).map(c => ({
    id: c.id, name: c.name, token: c.token,
    hex: cubeOf(grid, c.token.getCenterPoint({ x: c.token.x, y: c.token.y })),
    elevation: c.token.elevation
  }));
  const volume = personnelInArc({ ...arc, tokens: others });
  const named = man => others.find(person => person.id === man.id);
  if (volume.inDepth.length) {
    const names = volume.inDepth.map(man => named(man)?.name ?? man.id);
    throw new Error(`§3.4's depth includes ${names.join(', ')} at a different range from the swept hexes. A burst has one elevation, so sweep their hexes as a separate burst.`);
  }
  const atRange = volume.atRange.map(man => ({ ...man, ...named(man) }));
  const elevated = atRange.filter(man => man.elevation !== shooter.elevation);
  if (elevated.length) throw new Error(`${elevated.map(man => man.name).join(', ')} stand at another elevation. Automatic fire is not resolved across elevations.`);
  return { volume, atRange };
}

// A burst of grenades is aimed at the swept hexes, not at the men in them, so it has no
// elevation target and no depth: who stands in those hexes is shown, and nobody need be.
export function sweptOccupants(combat, combatantId, arc) {
  const shooter = combat.combatants.get(combatantId)?.token;
  if (!shooter) throw new Error('The shooter has no scene token.');
  assertBurstFacing(combat.scene, shooter, arc.swept);
  const grid = combat.scene.grid;
  const swept = new Set(arc.swept.map(h => `${h.q},${h.r},${h.s}`));
  return combat.combatants.filter(c => c.id !== combatantId && c.token).filter(c => {
    const hex = cubeOf(grid, c.token.getCenterPoint({ x: c.token.x, y: c.token.y }));
    return swept.has(`${hex.q},${hex.r},${hex.s}`);
  }).map(c => ({ id: c.id, name: c.name, token: c.token }));
}
