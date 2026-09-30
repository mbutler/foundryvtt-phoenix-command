// A strike, read off Token documents. The hit and the damage are in attacks.mjs.
// How many sets the blow was thrown after is read off the paid plan, because §3.1 charges
// for them (D61); the review states the parry column, the damage bonus and whether his feet
// stayed planted.
// On a 2-foot map the range is the hexes between the two centres. On a 6-foot map
// those 2-foot positions are not on the grid, so the review states the range and a
// range closer than the hexes allow is refused.
import { cubeOf } from './burst-scene.mjs';
import { cubeDistance } from '../rules/hex-cube.mjs';
import { hexGeometry } from './hex-scene.mjs';
import { closestMeleeHexes } from '../rules/melee-strike.mjs';
import { previewMelee } from '../rules/attacks.mjs';
import { allocateParries, defenceParryColumn } from '../rules/melee-parry.mjs';
import { activeMeleeDefence } from '../rules/timing.mjs';
import { shieldsById } from '../data/shields.mjs';
import { snapshotActor } from './context.mjs';
import { derivedDamageBonus } from './encounter-allowance.mjs';
import { meleeOptionalRules } from './optional-rules.mjs';

const center = token => token.getCenterPoint({ x: token.x, y: token.y });

export function strikeHandoffInput(combat, shot, choices = shot.adjudication?.choices) {
  if (!choices) throw new Error('The GM must review this strike before it can be rolled.');
  const targetCombatant = combat.combatants.find(c => c.token?.uuid === shot.plan.targetUuid);
  const timedDefence = activeMeleeDefence(combat.timing, targetCombatant?.id);
  // §3.2's column is frozen from the defender's equipped loadout and impulse ledger during
  // review. Older saved strikes may still carry the catalog shield id used before Item-based
  // derivation; keep that fallback so an in-progress encounter can finish.
  const shield = choices.defenderShieldId ? shieldsById[choices.defenderShieldId] : null;
  if (choices.defenderShieldId && !shield) throw new Error(`No shield is transcribed under "${choices.defenderShieldId}".`);
  const ordinaryParry = () => choices.adjudicatedParryColumn ?? allocateParries({
    loadout: choices.defenderLoadout ?? 'one-weapon',
    hands: choices.defenderHands ?? 1,
    shieldPartialParry: choices.defenderShieldPartialParry ?? (shield ? shield.partialParry : null),
    offHandHands: choices.defenderOffHandHands ?? 1,
    bothWeaponsCommitted: choices.defenderBothWeaponsCommitted === true,
    parryActions: choices.defenderParryActions ?? 0,
    recoverActions: choices.defenderRecoverActions ?? 0,
    setActions: choices.defenderSetActions ?? 0,
    // The defender's own allocation at the reaction window (§3.2), never the GM's review.
    strikes: [{ id: 'incoming', fullParry: combat.timing.reactions?.parries?.[targetCombatant?.id]?.includes(shot.id) === true,
      outsideFieldOfAttack: choices.outsideFieldOfAttack === true }]
  }).strikes[0].column;
  const parryColumn = timedDefence
    ? timedDefence.kind === 'coverUp'
      ? defenceParryColumn({ defence: 'coverUp', shieldPartialParry: timedDefence.shieldPartialParry,
        outsideFieldOfAttack: choices.outsideFieldOfAttack === true }).column
      : timedDefence.parryColumn
    : ordinaryParry();
  // The sets come from the PLAN, not from the review. §3.1 charges for them, so how many
  // were thrown after is settled when the blow is paid for; asking again here would let a
  // long stroke be claimed for the price of a short one (D61).
  const sets = shot.plan.sets;
  if (!Number.isSafeInteger(parryColumn) || parryColumn < 1 || parryColumn > 9) throw new Error('State the defender\'s parry column, 1 through 9.');
  if (!Number.isSafeInteger(sets) || sets < 0 || sets > 2) throw new Error('This blow was paid for without recording how many sets it was thrown after.');
  if (choices.sets !== undefined && choices.sets !== sets) throw new Error(`This blow was paid for after ${sets} set${sets === 1 ? '' : 's'}; the review cannot change that to ${choices.sets}.`);
  // LEG10204 §1.2 Step 7: the Damage Bonus is derived from Table 2D; a review may state another.
  const damageBonus = typeof choices.damageBonus === 'number' && Number.isFinite(choices.damageBonus)
    ? choices.damageBonus : derivedDamageBonus(combat.combatants.get(shot.combatantId)?.actor);
  if (damageBonus === null) throw new Error('The striker\'s Damage Bonus cannot be derived from Table 2D (record Hand-to-Hand skill, characteristics and carried weight), so state it in the review.');
  if (typeof choices.stationary !== 'boolean') throw new Error('State whether he kept his feet planted for the second set and the blow.');
  if (!canvas.ready || canvas.scene.id !== combat.scene?.id) throw new Error('The coordinator must view the encounter scene.');
  const attackerCombatant = combat.combatants.get(shot.combatantId);
  const attackerToken = attackerCombatant?.token;
  const targetToken = targetCombatant?.token;
  if (!attackerToken || !targetToken || !attackerToken.object || !targetToken.object) throw new Error('The strike\'s tokens are no longer available.');
  const grid = combat.scene.grid;
  const geometry = hexGeometry(combat.scene);
  const hexes = cubeDistance(cubeOf(grid, center(attackerToken)), cubeOf(grid, center(targetToken)));
  let rangeHexes;
  if (geometry.feetPerHex === 2) {
    if (hexes < 1) throw new Error('A range of 0 hexes is not a printed weapon range.');
    rangeHexes = hexes;
  } else {
    rangeHexes = choices.rangeHexes;
    if (!Number.isSafeInteger(rangeHexes) || rangeHexes < 1) throw new Error('State the range in 2-foot hexes. This map is 6 feet to the hex.');
    const closest = closestMeleeHexes(hexes);
    if (rangeHexes < closest) throw new Error(`These hexes cannot be closer than ${closest} two-foot hexes.`);
  }
  const attacker = snapshotActor(attackerToken.object.actor, { token: attackerToken.object });
  const target = snapshotActor(targetToken.object.actor, { token: targetToken.object });
  const weapon = attacker.items.find(item => item.id === shot.plan.weaponId);
  // §5.7: a continued cut carries the Cutting Power of the cut before it, and only on the very
  // next impulse; later than that the saw has been dislodged.
  let continuedCuttingPower = null;
  if (shot.plan.continueCut) {
    const cut = attackerToken.object.actor.items.get(shot.plan.weaponId)?.flags?.['phoenix-command']?.chainsawCut;
    const now = shot.timing ?? {};
    const next = cut && (cut.impulse === 4 ? { phase: cut.phase + 1, impulse: 1 } : { phase: cut.phase, impulse: cut.impulse + 1 });
    if (!cut || !(cut.cuttingPower > 0) || cut.combatUuid !== combat.uuid || cut.targetUuid !== shot.plan.targetUuid
      || now.phase !== next.phase || now.impulse !== next.impulse) throw new Error('The chainsaw\'s cut can only be continued on the next impulse, into the same target; the saw has been dislodged.');
    continuedCuttingPower = cut.cuttingPower;
  }
  const input = {
    weapon, modeId: shot.plan.modeId, attackId: shot.plan.attackId,
    optionalRules: meleeOptionalRules(),
    ...(Array.isArray(choices.damageModifiers) && choices.damageModifiers.length ? { damageModifiers: [...choices.damageModifiers] } : {}),
    ...(Number.isSafeInteger(choices.chargeWeaponClass) ? { chargeWeaponClass: choices.chargeWeaponClass } : {}),
    ...(continuedCuttingPower !== null ? { continuedCuttingPower } : {}),
    skill: attacker.system.skills.melee, defenderSkill: target.system.skills.melee,
    parryColumn, sets, damageBonus, stationary: choices.stationary,
    distance: { value: rangeHexes * 2, unit: 'ft' },
    ...(choices.armorClass ? { armorClass: choices.armorClass } : {})
  };
  previewMelee(input);
  return input;
}

export function strikeApplyContext(combat, shot) {
  const attacker = combat.combatants.get(shot.combatantId);
  const target = combat.combatants.find(c => c.token?.uuid === shot.plan.targetUuid);
  if (!attacker?.token?.object || !target?.actor || !target.token) throw new Error('View the encounter scene before applying this strike.');
  return {
    attacker: snapshotActor(attacker.actor, { token: attacker.token.object }),
    target: { id: target.id, name: target.name, actorUuid: target.actor.uuid, tokenUuid: target.token.uuid },
    input: shot.input, applicationId: shot.applicationId, timing: shot.timing, timedShotId: shot.id
  };
}
