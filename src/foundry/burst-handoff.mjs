// Rebuilds a burst's resolver input from the paid plan, the map and the GM's review.
// Nothing in here is taken from a player's payload.
import { deriveShotSituation, playerRollable, preparationDefaults } from '../rules/shot-situation.mjs';
import { firearmBand } from '../rules/attacks.mjs';
import { plannedAim } from '../rules/weapon-timing.mjs';
import { hexesInPhase, movedThisPhase } from '../rules/timing.mjs';
import { precedingElevation } from '../rules/burst-ledger.mjs';
import { sharedArcTargets } from '../rules/arc-geometry.mjs';
import { previewBurst } from '../rules/automatic-fire.mjs';
import { previewAutomaticShotgun } from '../rules/shotgun.mjs';
import { snapshotActor } from './context.mjs';
import { sceneCover } from './cover-scene.mjs';
import { arcOccupants, cubeOf } from './burst-scene.mjs';
import { sameHex } from '../rules/hex-cube.mjs';
import { sightline } from '../rules/impulse-decisions.mjs';
import { coverSituation } from '../rules/cover.mjs';

function statedCover(reading, choices) {
  const stance = choices.coverStance ?? choices.cover?.stance ?? 'firing-over';
  const read = reading.cover ? { ...reading.cover, stance } : reading.mapped && !reading.ambiguous ? null : undefined;
  const override = choices.coverOverride === true;
  if (override && choices.cover === undefined) throw new Error('An override has to say what the cover is instead.');
  return { cover: override || read === undefined ? choices.cover : read, reading, override, stance };
}

// §5.10 Cover Fire (optional). The burst is aimed at the hexes at Target Size +10, so the men
// in them need not share a size, speed or cover; each is attacked by Table 5A if he is
// "appearing" there - by the user's reading (28 September 2026), exposed to the shooter: not
// concealed from him, and not ducked behind cover that stops the round. Each keeps his own
// cover for where a round lands on him.
function coverFireInput({ combat, shot, choices, men, weapon, attacker, distance, band, shooterHexes, shooterMoving, preparation }) {
  const exposed = men.filter(man => {
    if (sightline(combat.timing, shot.combatantId, man.id)?.status === 'concealed') return false;
    const situation = coverSituation({ penetration: band.penetration, cover: man.cover });
    return !(man.ducking && situation.behindCover && situation.blocking);
  });
  const own = deriveShotSituation({ shooterPosture: attacker.system.condition.posture, targetPosture: 'standing', cover: null,
    penetration: band.penetration, firingStance: choices.firingStance ?? preparation.firingStance,
    braced: choices.braced ?? preparation.braced, visibility: choices.visibility, shooterMoving });
  const input = {
    weapon, modeId: shot.plan.modeId, skill: attacker.system.skills.gun,
    distance, ammunitionKey: shot.plan.ammunitionKey, aimActions: plannedAim(shot.plan),
    coverFire: true, targetSize: 'Standing Exposed', visibility: own.derived.visibility, situations: own.derived.situations,
    cover: null, shooterSpeed: shooterHexes, targetSpeed: 0,
    arcHexes: shot.arc.arcHexes, arc: shot.arc,
    precedingEal: precedingElevation(combat.getFlag('phoenix-command', 'shots'), {
      combatantId: shot.combatantId, weaponId: shot.plan.weaponId, phase: shot.timing.phase, impulse: shot.timing.impulse }),
    targets: exposed.map(man => ({ id: man.id, autoWidth: man.autoWidth, armorPF: 0, cover: man.cover ?? null }))
  };
  previewBurst(input);
  return { input, men: exposed, attacker };
}

export function burstHandoffInput(combat, shot, choices = shot.adjudication?.choices) {
  if (!choices) throw new Error('The GM must review this burst’s cover, visibility and target width before it can be rolled.');
  if (typeof choices.applyTargetWidth !== 'boolean') throw new Error('Say whether §3.7’s target width applies to this burst. It is optional, and leaving it unstated is not a choice.');
  if (!canvas?.ready || canvas.scene?.id !== combat.scene?.id) throw new Error('The coordinator must view the encounter scene.');
  const shooterCombatant = combat.combatants.get(shot.combatantId);
  const shooterDoc = shooterCombatant?.token;
  if (!shooterDoc?.object) throw new Error('View the encounter scene before resolving this burst.');
  if (!shot.arc) throw new Error('Designate the arc before reviewing this burst.');
  const from = shooterDoc.getCenterPoint({ x: shooterDoc.x, y: shooterDoc.y });
  if (!sameHex(cubeOf(combat.scene.grid, from), shot.arc.shooter)) throw new Error('The shooter has left the hex the arc was designated from. Designate it again.');
  const { atRange } = arcOccupants(combat, shot.combatantId, shot.arc);
  // §5.10 Cover Fire (optional) is aimed at the hexes, so an empty arc is still fired.
  const coverFire = shot.plan.coverFire === true;
  if (!atRange.length && !coverFire) throw new Error('Nobody at the swept hexes’ range stands in the arc, so the burst has no elevation target.');
  const attacker = snapshotActor(shooterDoc.actor, { token: shooterDoc.object });
  const weapon = attacker.items.find(item => item.id === shot.plan.weaponId);
  const distance = { value: shot.arc.rangeHexes * shot.arc.feetPerHex, unit: 'ft' };
  const band = firearmBand({ weapon, modeId: shot.plan.modeId, ammunitionKey: shot.plan.ammunitionKey, distance });
  const shooterHexes = hexesInPhase(combat.timing, shot.combatantId);
  const shooterMoving = movedThisPhase(combat.timing, shot.combatantId);
  const preparation = preparationDefaults(attacker.system.condition, shooterMoving);
  const men = atRange.map(man => {
    if (!man.token.object) throw new Error('View the encounter scene before resolving this burst.');
    const to = man.token.getCenterPoint({ x: man.token.x, y: man.token.y });
    const reading = sceneCover(combat.scene, from, to);
    const stated = statedCover(reading, choices);
    const defender = snapshotActor(man.token.actor, { token: man.token.object });
    const situation = deriveShotSituation({
      shooterPosture: attacker.system.condition.posture,
      targetPosture: defender.system.condition.posture,
      cover: stated.cover, penetration: band.penetration,
      firingStance: choices.firingStance??preparation.firingStance, braced: choices.braced??preparation.braced,
      visibility: choices.visibility, shooterMoving
    });
    const allowed = playerRollable(situation);
    if (!allowed.allowed) throw new Error(allowed.reason);
    return {
      id: man.id, name: man.name, tokenUuid: man.token.uuid, actorUuid: man.token.actor.uuid,
      targetSize: situation.derived.targetSize,
      targetSpeed: hexesInPhase(combat.timing, man.id),
      cover: situation.derived.cover ?? null,
      coverKey: JSON.stringify(situation.derived.cover ?? null),
      ducking: combat.timing.reactions?.choices?.[man.id] === 'duck',
      autoWidth: choices.applyTargetWidth ? situation.derived.targetSize : null,
      situations: situation.derived.situations,
      visibility: situation.derived.visibility,
      assumed: situation.assumed
    };
  });
  if (coverFire) return coverFireInput({ combat, shot, choices, men, weapon, attacker, distance, band, shooterHexes, shooterMoving, preparation });
  const shared = sharedArcTargets(men);
  const shooterDucking = combat.timing.reactions?.choices?.[shot.combatantId] === 'duck';
  const input = {
    weapon, modeId: shot.plan.modeId, skill: attacker.system.skills.gun,
    distance, ammunitionKey: shot.plan.ammunitionKey, aimActions: plannedAim(shot.plan),
    targetSize: shared.targetSize, visibility: men[0].visibility, situations: men[0].situations,
    cover: shared.cover, shooterSpeed: shooterHexes, targetSpeed: shared.targetSpeed,
    arcHexes: shot.arc.arcHexes, arc: shot.arc,
    precedingEal: precedingElevation(combat.getFlag('phoenix-command', 'shots'), {
      combatantId: shot.combatantId, weaponId: shot.plan.weaponId,
      phase: shot.timing.phase, impulse: shot.timing.impulse
    }),
    ...(shooterDucking || shared.ducking ? { reactions: { shooterDucking, targetDucking: shared.ducking } } : {}),
    targets: men.map(man => ({ id: man.id, autoWidth: man.autoWidth, armorPF: 0 }))
  };
  if (band.salm != null) {
    if (choices.pelletGrouping !== false && choices.pelletGrouping !== 'random') throw new Error('Say whether later pellets are grouped. Leave it off, or choose random rolls inside the spacing.');
    input.pelletGrouping = choices.pelletGrouping;
    input.applyPelletWidth = choices.applyTargetWidth;
    input.autoWidth = choices.applyTargetWidth ? shared.targetSize : null;
    previewAutomaticShotgun(input);
  } else previewBurst(input);
  if (choices.coverProvenance) input.sceneCover = {
    overridden: choices.coverOverride === true,
    basis: choices.coverProvenance.basis,
    readings: choices.coverProvenance.readings ?? []
  };
  return { input, men, attacker };
}

export function burstApplyContext(combat, shot) {
  const shooter = combat.combatants.get(shot.combatantId);
  if (!shooter?.token?.object) throw new Error('View the encounter scene before applying this burst.');
  return {
    attacker: snapshotActor(shooter.actor, { token: shooter.token.object }),
    targets: shot.input.targets.map(target => {
      const combatant = combat.combatants.get(target.id);
      if (!combatant?.actor || !combatant.token) throw new Error('A burst target left the encounter.');
      return { id: target.id, name: combatant.name, actorUuid: combatant.actor.uuid, tokenUuid: combatant.token.uuid };
    }),
    input: shot.input, applicationId: shot.applicationId, timing: shot.timing, timedShotId: shot.id
  };
}
