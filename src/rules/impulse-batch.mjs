// Basic-game impulse resolution: steps 7 to 9 of the contract in
// docs/basic-impulse-contract.md.
//
//   "Each Phase is divided into a series of 4 Impulses, in which all movement and
//    fire are executed simultaneously."          - section 2.1, PDF 15 / printed 10
//   "In the basic game, play advances on an Impulse by Impulse basis and all fire
//    is resolved at the end of each Impulse."     - section 5.7, PDF 55 / printed 50
//
// So the basic game has no ordering within an impulse. Every shot due this impulse is
// resolved against the state at the START of the impulse, damage is then totalled per
// target, and each combatant who took one or more wounds makes exactly one knockout
// check against cumulative total damage - not one per hit (section 2.7, PDF 21).
//
// Submission order, document write order and initiative play no part here. The optional
// Master Phasing Count of section 5.7 is a different resolution model and is not
// implemented; a batch tagged for it is refused rather than silently resolved as basic.
import { knockoutTable } from '../data/character-tables.mjs';

export const impulseBatchSource = 'Small Arms §2.1 PDF 15, §2.7 PDF 21, §5.7 PDF 55 · visual check';

// Section 2.7: compare total Physical Damage with the Knockout Value, read across for
// the Incapacitation Chance, then roll 00-99. A roll strictly less than the chance
// takes the combatant out of the fight. The "under KV/10" row prints 00, which with a
// strict comparison correctly means no check is needed.
export function incapacitationChance(totalPhysicalDamage, knockoutValue) {
  if (!Number.isFinite(totalPhysicalDamage) || totalPhysicalDamage < 0) throw new RangeError('Total physical damage must be a nonnegative number.');
  if (!Number.isFinite(knockoutValue) || knockoutValue < 0) throw new RangeError('Knockout Value must be a nonnegative number.');
  for (const row of knockoutTable) {
    if (totalPhysicalDamage > knockoutValue * row.overKnockoutValueMultiple) return row;
  }
  return knockoutTable.at(-1);
}

function requireId(id, label) {
  if (typeof id !== 'string' || !id) throw new RangeError(`${label} must be a non-empty identifier.`);
  return id;
}

/**
 * Resolve one impulse's fire as a single batch.
 *
 * shots        each already-resolved shot due this impulse, with its physical damage.
 *              Damage must have been computed against start-of-impulse state; this
 *              function never lets one shot see another's effect.
 * combatants   per-target knockout value and the damage carried before this impulse.
 * knockoutRolls one 00-99 roll per target that takes a wound this impulse.
 *
 * Returns the per-target totals and knockout outcomes, plus anything still unresolved.
 * A batch with unresolved entries must not be applied and must block the clock.
 */
export function resolveImpulseBatch({ shots = [], combatants = {}, knockoutRolls = {}, timingMode = 'basic' } = {}) {
  if (timingMode !== 'basic') {
    throw new RangeError(`Only basic impulse resolution is implemented; got timing mode "${timingMode}". The optional Master Phasing Count orders shots within the impulse and needs its own resolver.`);
  }

  const byTarget = new Map();
  for (const shot of shots) {
    requireId(shot.id, 'Shot id');
    requireId(shot.attackerId, 'Attacker id');
    const targetId = requireId(shot.targetId, 'Target id');
    const damage = shot.physicalDamage ?? 0;
    if (!Number.isFinite(damage) || damage < 0) throw new RangeError(`Shot ${shot.id} has invalid physical damage.`);
    const shock = shot.shockPhysicalDamage ?? 0;
    if (!Number.isFinite(shock) || shock < 0) throw new RangeError(`Shot ${shot.id} has invalid shock damage.`);
    if (!byTarget.has(targetId)) byTarget.set(targetId, []);
    byTarget.get(targetId).push(shot);
  }

  const seen = new Set();
  for (const shot of shots) {
    if (seen.has(shot.id)) throw new RangeError(`Shot ${shot.id} appears twice in the same impulse batch.`);
    seen.add(shot.id);
  }

  const unresolved = [];
  const damageByTarget = {};
  const knockout = {};

  // Sorting is for stable reporting only. It carries no rules meaning: in the basic
  // game these shots are simultaneous, so any order must give the same result.
  for (const targetId of [...byTarget.keys()].sort()) {
    const targetShots = [...byTarget.get(targetId)].sort((a, b) => a.id.localeCompare(b.id));
    const combatant = combatants[targetId];
    if (!combatant) {
      unresolved.push({ targetId, reason: 'unknown-target', detail: `No combatant state was supplied for ${targetId}.` });
      continue;
    }
    const before = combatant.physicalDamageBefore ?? 0;
    if (!Number.isFinite(before) || before < 0) throw new RangeError(`Combatant ${targetId} has invalid carried damage.`);

    // A zero-damage hit records no wound and triggers no check.
    const wounding = targetShots.filter(s => (s.physicalDamage ?? 0) > 0);
    const inflicted = wounding.reduce((sum, s) => sum + s.physicalDamage, 0);
    const after = before + inflicted;
    // Table 6C, PDF 65: shock from a disabling injury is "added to the PD of wounds in the
    // shaded portions of the table when making the Knockout Roll", and is "not added to the
    // PD Total". §3.3 adds that it counts only in the impulse it is inflicted. So it enters
    // the knockout figure here and is kept out of `after`, which is the carried total.
    const shock = wounding.reduce((sum, s) => sum + (s.shockPhysicalDamage ?? 0), 0);
    const knockoutDamage = after + shock;
    damageByTarget[targetId] = {
      before,
      inflicted,
      after,
      shockPhysicalDamage: shock,
      knockoutPhysicalDamage: knockoutDamage,
      shotIds: targetShots.map(s => s.id),
      woundingShotIds: wounding.map(s => s.id)
    };

    if (!wounding.length) continue;

    const knockoutValue = combatant.knockoutValue;
    if (!Number.isFinite(knockoutValue)) {
      unresolved.push({ targetId, reason: 'missing-knockout-value', detail: `${targetId} took ${inflicted} damage but has no Knockout Value; it derives from Will and gun skill.` });
      continue;
    }
    const row = incapacitationChance(knockoutDamage, knockoutValue);
    if (row.incapacitationChance === 0) {
      knockout[targetId] = { totalPhysicalDamage: after, shockPhysicalDamage: shock, knockoutPhysicalDamage: knockoutDamage, knockoutValue, threshold: row, roll: null, incapacitated: false, checked: false };
      continue;
    }
    const roll = knockoutRolls[targetId];
    if (roll === undefined || roll === null) {
      unresolved.push({ targetId, reason: 'knockout-roll-required', detail: `${targetId} reached ${after} total damage${shock ? ` plus ${shock} Shock PD` : ''} against Knockout Value ${knockoutValue}, needing one ${row.label} check at ${row.incapacitationChance}.` });
      continue;
    }
    if (!Number.isInteger(roll) || roll < 0 || roll > 99) throw new RangeError(`Knockout roll for ${targetId} must be a whole number from 0 to 99.`);
    knockout[targetId] = {
      totalPhysicalDamage: after,
      shockPhysicalDamage: shock,
      knockoutPhysicalDamage: knockoutDamage,
      knockoutValue,
      threshold: row,
      roll,
      incapacitated: roll < row.incapacitationChance,
      checked: true
    };
  }

  return {
    complete: unresolved.length === 0,
    timingMode,
    source: impulseBatchSource,
    damageByTarget,
    knockout,
    unresolved,
    // One check per wounded combatant per impulse, never one per hit.
    knockoutChecksMade: Object.values(knockout).filter(k => k.checked).length
  };
}
