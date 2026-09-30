// Thrown grenades and launcher rounds, read off Token documents. The rules are in
// explosive.mjs. This only turns centres into cubes and states the choices the review made.
import { cubeOf } from './burst-scene.mjs';
import { cubeDistance } from '../rules/hex-cube.mjs';
import { burstColumn, previewLaunchedGrenade, previewThrownGrenade, throwRange } from '../rules/explosive.mjs';
import { previewGrenadeBurst } from '../rules/grenade-burst.mjs';
import { precedingElevation } from '../rules/burst-ledger.mjs';
import { sameHex } from '../rules/hex-cube.mjs';
import { plannedAim } from '../rules/weapon-timing.mjs';
import { hexesInPhase } from '../rules/timing.mjs';
import {blastSituation} from '../rules/blast-situation.mjs';
import { snapshotActor } from './context.mjs';
import { sceneCover } from './cover-scene.mjs';

const center = token => token.getCenterPoint({ x: token.x, y: token.y });

// Reject an impossible throw before committing an order or spending any actions.
// Resolution still checks again, since tokens can move during preparation.
export function validateThrowPlanRange(combat, combatantId, plan) {
  if (plan.kind !== 'grenade') return;
  const shooter = combat.combatants.get(combatantId)?.token;
  const target = combat.combatants.find(c => c.token?.uuid === plan.targetUuid)?.token;
  if (!shooter || !target) throw new Error('Choose a target token in this encounter.');
  const grid = combat.scene.grid;
  return throwRange(plan.weaponBefore.firearmModes[plan.modeId],
    cubeDistance(cubeOf(grid, center(shooter)), cubeOf(grid, center(target))));
}

function explosiveReview(choices, kind) {
  if (!choices) throw new Error('The GM must review this shot before it can be rolled.');
  if (typeof choices.applyShrapnelSize !== 'boolean') throw new Error('Say whether §3.7 adjusts the shrapnel hit chance. It is optional, and leaving it unstated is not a choice.');
  if (choices.shrapnelCombined !== false) throw new Error('Each piece of shrapnel is its own impact. The shared-location shortcut is not the play path.');
  if (!Array.isArray(choices.visibility) || !choices.visibility.length) throw new Error('Choose visibility.');
  if (kind === 'launcher' && choices.elevatedHex === true) {
    // allowed — same +15 hex target size
  }
}

export function grenadeHandoffInput(combat, shot, choices = shot.adjudication?.choices) {
  return explosiveHandoffInput(combat, shot, choices);
}

// Everyone on the map, as the blast would find them. Posture is live; the Table 5B
// surroundings and shrapnel size are the GM's answers after landing (`surroundings`),
// falling back to an older review that stated them before the throw.
function blastPeople(combat, choices, surroundings, applyTargetSize) {
  const grid = combat.scene.grid;
  const legacySolid = new Set(choices.solidCoverIds ?? []);
  return combat.combatants.filter(c => c.token).map(c => ({
    id: c.id, name: c.name,
    cube: cubeOf(grid, center(c.token)),
    elevation: c.token.elevation,
    ...blastSituation({posture:c.actor?.system.condition.posture,
      modifiers:surroundings?.blastModifiersById?.[c.id]??choices.blastModifiersById?.[c.id],
      solidCover:legacySolid.has(c.id),
      targetSize:surroundings?.targetSizeById?.[c.id]??choices.targetSizeById?.[c.id]??null,applyTargetSize})
  }));
}

const mergedBlastChoices = (choices, surroundings) => structuredClone({
  blastModifiersById: { ...(choices.blastModifiersById ?? {}), ...(surroundings?.blastModifiersById ?? {}) },
  solidCoverIds: choices.solidCoverIds ?? [],
  targetSizeById: { ...(choices.targetSizeById ?? {}), ...(surroundings?.targetSizeById ?? {}) }
});

export function explosiveHandoffInput(combat, shot, choices = shot.adjudication?.choices, surroundings = null) {
  explosiveReview(choices, shot.plan.kind);
  if (!canvas.ready || canvas.scene.id !== combat.scene?.id) throw new Error('The coordinator must view the encounter scene.');
  const shooterCombatant = combat.combatants.get(shot.combatantId);
  const targetCombatant = combat.combatants.find(c => c.token?.uuid === shot.plan.targetUuid);
  const shooter = shooterCombatant?.token;
  const target = targetCombatant?.token;
  if (!shooter || !target || !shooter.object) throw new Error('The shot\'s tokens are no longer available.');
  const grid = combat.scene.grid;
  const shooterCube = cubeOf(grid, center(shooter));
  const targetCube = cubeOf(grid, center(target));
  const distanceHexes = cubeDistance(shooterCube, targetCube);
  if (distanceHexes < 1) throw new Error('Aim the round at another hex.');
  const attacker = snapshotActor(shooter.object.actor, { token: shooter.object });
  const weapon = attacker.items.find(item => item.id === shot.plan.weaponId);
  const people = blastPeople(combat, choices, surroundings, choices.applyShrapnelSize);
  const input = {
    weapon, modeId: shot.plan.modeId, ammunitionKey: shot.plan.ammunitionKey,
    skill: attacker.system.skills.gun, aimActions: plannedAim(shot.plan),
    distanceHexes, targetSize: choices.elevatedHex === true ? 'elevated-hex' : 'hex',
    visibility: choices.visibility, situations: choices.situations ?? [],
    shooterSpeed: hexesInPhase(combat.timing, shot.combatantId),
    targetSpeed: hexesInPhase(combat.timing, targetCombatant.id),
    applyTargetSize: choices.applyShrapnelSize, shrapnelCombined: false,
    blastChoices: mergedBlastChoices(choices, surroundings),
    shooterCube, targetCube, people,
    currentPhase: combat.timing.phase
  };
  if (shot.plan.kind === 'launcher') previewLaunchedGrenade(input);
  else previewThrownGrenade(input);
  return input;
}

// A burst of grenades (grenade-burst.mjs): the arc's hexes are the aim, at the arc's range.
export function grenadeBurstHandoffInput(combat, shot, choices = shot.adjudication?.choices, surroundings = null) {
  explosiveReview(choices, 'launcher');
  if (!canvas.ready || canvas.scene.id !== combat.scene?.id) throw new Error('The coordinator must view the encounter scene.');
  if (!shot.arc) throw new Error('Designate the arc before reviewing this burst.');
  const shooter = combat.combatants.get(shot.combatantId)?.token;
  if (!shooter?.object) throw new Error('View the encounter scene before resolving this burst.');
  const grid = combat.scene.grid;
  const shooterCube = cubeOf(grid, center(shooter));
  if (!sameHex(shooterCube, shot.arc.shooter)) throw new Error('The shooter has left the hex the arc was designated from. Designate it again.');
  const attacker = snapshotActor(shooter.object.actor, { token: shooter.object });
  const weapon = attacker.items.find(item => item.id === shot.plan.weaponId);
  const input = {
    weapon, modeId: shot.plan.modeId, ammunitionKey: shot.plan.ammunitionKey,
    skill: attacker.system.skills.gun, aimActions: plannedAim(shot.plan),
    // The arc is at one range; a 6-foot hex is one 2-yard hex.
    distanceHexes: Math.round(shot.arc.rangeHexes * shot.arc.feetPerHex / 6),
    targetSize: choices.elevatedHex === true ? 'elevated-hex' : 'hex',
    visibility: choices.visibility, situations: choices.situations ?? [],
    shooterSpeed: hexesInPhase(combat.timing, shot.combatantId), targetSpeed: 0,
    applyTargetSize: choices.applyShrapnelSize, shrapnelCombined: false,
    blastChoices: mergedBlastChoices(choices, surroundings),
    arcHexes: shot.arc.arcHexes, arc: shot.arc, shooterCube,
    precedingEal: precedingElevation(combat.getFlag('phoenix-command', 'shots'), {
      combatantId: shot.combatantId, weaponId: shot.plan.weaponId, phase: shot.timing.phase, impulse: shot.timing.impulse }),
    people: blastPeople(combat, choices, surroundings, choices.applyShrapnelSize)
  };
  previewGrenadeBurst(input);
  return input;
}

// The people any of several detonations reaches, each at his nearest one.
export function burstSurroundingRows(combat, input, landings) {
  const rows = new Map();
  for (const hex of landings) for (const row of blastSurroundingRows(combat, input, hex)) {
    const seen = rows.get(row.id);
    if (!seen || row.distanceHexes < seen.distanceHexes) rows.set(row.id, row);
  }
  return [...rows.values()];
}

export function grenadeApplyContext(combat, shot) {
  return explosiveApplyContext(combat, shot);
}

export function explosiveApplyContext(combat, shot) {
  const shooter = combat.combatants.get(shot.combatantId);
  if (!shooter?.token?.object) throw new Error('View the encounter scene before applying this blast.');
  const ids = shot.result?.scheduled
    ? []
    : [...new Set((shot.result?.targets ?? []).map(target => target.id))];
  return {
    attacker: snapshotActor(shooter.actor, { token: shooter.token.object }),
    targets: ids.map(id => {
      const combatant = combat.combatants.get(id);
      if (!combatant?.actor || !combatant.token) throw new Error('Someone the blast reached left the encounter.');
      return { id, name: combatant.name, actorUuid: combatant.actor.uuid, tokenUuid: combatant.token.uuid };
    }),
    input: shot.input, applicationId: shot.applicationId, timing: shot.timing, timedShotId: shot.id
  };
}

// The detonation is its own application, separate from the throw that already spent the
// grenade, and belongs to the impulse the fuse expired in (record.resolution.timing).
export const detonationApplicationId = record => `${record.applicationId}-det`;

export function detonationApplyContext(combat, record, result) {
  const frozen = record.resolution;
  if (!frozen?.input || !frozen.timing) throw new Error('This detonation has no saved expiry situation.');
  // The grenade goes off whether or not its thrower is still in the encounter.
  const shooter = combat.combatants.find(c => c.actor?.uuid === record.attackerUuid);
  const attacker = shooter?.token?.object
    ? snapshotActor(shooter.actor, { token: shooter.token.object })
    : { id: null, name: frozen.input.weapon?.name ?? 'Grenade', actorUuid: record.attackerUuid, tokenUuid: null };
  const ids = [...new Set((result.targets ?? []).map(target => target.id))];
  return {
    attacker,
    targets: ids.map(id => {
      const combatant = combat.combatants.get(id);
      if (!combatant?.actor || !combatant.token) throw new Error('Someone the blast reached left the encounter.');
      return { id, name: combatant.name, actorUuid: combatant.actor.uuid, tokenUuid: combatant.token.uuid };
    }),
    input: frozen.input, applicationId: detonationApplicationId(record), timing: frozen.timing, timedShotId: null
  };
}

export function rebuildDetonationInput(combat, record, surroundings = null) {
  if (!canvas.ready || canvas.scene.id !== combat.scene?.id) throw new Error('The coordinator must view the encounter scene.');
  // Reviews made before the landing-first flow saved each person's conditions on the throw.
  const blastById = Object.fromEntries((record.input.people ?? []).map(person => [person.id, person.blastModifiers]));
  const saved = record.input.blastChoices ?? {};
  const choices = { ...saved, blastModifiersById: { ...blastById, ...(saved.blastModifiersById ?? {}) } };
  const people = blastPeople(combat, choices, surroundings, record.input.applyTargetSize);
  return { ...record.input, people, blastChoices: mergedBlastChoices(choices, surroundings), currentPhase: combat.timing.phase };
}

// The people a detonation at `detonation` reaches, for the GM to state their surroundings
// once the landing hex is known. The map is shown as a hint: which recorded barriers lie
// between the blast and the man, and which recorded areas he is standing in. It decides
// nothing; Table 5B's conditions are the GM's call.
export function blastSurroundingRows(combat, input, detonation) {
  const grid = combat.scene.grid;
  const landing = grid.getCenterPoint(detonation);
  return input.people.map(person => ({ person, distanceHexes: cubeDistance(detonation, person.cube) }))
    .filter(({ person, distanceHexes }) => burstColumn(distanceHexes, person.contact === true,
      input.weapon?.system?.firearmModes?.[input.modeId]?.ammunition?.[input.ammunitionKey]) !== null)
    .map(({ person, distanceHexes }) => {
      const combatant = combat.combatants.get(person.id);
      const saved = input.blastChoices?.blastModifiersById?.[person.id];
      return {
        id: person.id, name: person.name ?? combatant?.name ?? person.id,
        posture: combatant?.actor?.system.condition.posture ?? 'unknown',
        distanceHexes,
        selected: (saved ?? person.blastModifiers).filter(name => name !== 'Prone'),
        targetSize: input.blastChoices?.targetSizeById?.[person.id] ?? null,
        mapHint: combatant?.token ? blastMapHint(combat.scene, landing, center(combatant.token)) : null
      };
    });
}

function blastMapHint(scene, from, to) {
  let reading;
  try { reading = sceneCover(scene, from, to); } catch (error) { return `Map could not be read: ${error.message}`; }
  if (!reading.mapped) return 'Map not marked for cover.';
  if (reading.ambiguous && !reading.candidates?.length) return reading.detail;
  const between = (reading.candidates ?? []).filter(c => c.kind === 'barrier').map(c => `${c.label} (PF ${c.pf})`);
  const inside = (reading.candidates ?? []).filter(c => c.kind === 'area').map(c => c.label);
  const parts = [];
  if (between.length) parts.push(`between the blast and him: ${between.join(', ')}`);
  if (inside.length) parts.push(`he is in ${inside.join(', ')}`);
  return parts.length ? `Map: ${parts.join('; ')}.` : 'Map: no recorded cover between the blast and him.';
}
