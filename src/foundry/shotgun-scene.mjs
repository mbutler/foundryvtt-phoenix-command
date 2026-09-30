// Who a buckshot pattern can reach, read off the Token documents. The rule is
// `peopleInPattern`; this only turns centres into hex distances from the intended target.
import { cubeOf } from './burst-scene.mjs';
import { cubeDistance } from '../rules/hex-cube.mjs';
import { peopleInPattern } from '../rules/shotgun.mjs';
import { snapshotActor } from './context.mjs';

const center = token => token.getCenterPoint({ x: token.x, y: token.y });

export function blastPeople(combat, shot, patternRadiusHexes) {
  const intended = combat.targetFor(shot.plan);
  if (!intended?.token) throw new Error('The intended target has no token.');
  const grid = combat.scene.grid;
  const intendedHex = cubeOf(grid, center(intended.token));
  const people = combat.combatants.filter(c => c.id !== shot.combatantId && c.token).map(c => ({
    id: c.id, name: c.name,
    distanceHexes: cubeDistance(intendedHex, cubeOf(grid, center(c.token))),
    elevation: c.token.elevation
  }));
  return peopleInPattern({ intendedId: intended.id, patternRadiusHexes, people });
}

export function shotgunApplyContext(combat, shot) {
  const shooter = combat.combatants.get(shot.combatantId);
  if (!shooter?.token?.object) throw new Error('View the encounter scene before applying this blast.');
  const ids = [...new Set((shot.input.people ?? []).map(person => person.id))];
  return {
    attacker: snapshotActor(shooter.actor, { token: shooter.token.object }),
    targets: ids.map(id => {
      const combatant = combat.combatants.get(id);
      if (!combatant?.actor || !combatant.token) throw new Error('Someone the pattern covered left the encounter.');
      return { id, name: combatant.name, actorUuid: combatant.actor.uuid, tokenUuid: combatant.token.uuid };
    }),
    input: shot.input, applicationId: shot.applicationId, timing: shot.timing, timedShotId: shot.id
  };
}
