// §2.5, PDF 18 / printed 13. "When using Automatic Fire, only one burst may be fired per
// Impulse, and therefore a maximum of four bursts may be fired per Phase."
//
// A burst counts once the aim has been completed and the shot is waiting, rolled or
// applied. Abandoning the aim spends the actions and does not squeeze the trigger, so it
// does not count. Undoing an application puts the rounds back and stops counting, so a
// correction is not a second burst on top of the one it reversed.

const COUNTED = new Set(['ready', 'rolled', 'applied']);

export const burstCapSource = 'LEG10200 §2.5 PDF 18 / printed 13';

export function countedBursts(shots, { combatantId, phase, impulse = null, weaponId = null } = {}) {
  return Object.values(shots ?? {}).filter(shot =>
    shot?.plan?.kind === 'burst' &&
    shot.combatantId === combatantId &&
    shot.timing?.phase === phase &&
    (impulse === null || shot.timing.impulse === impulse) &&
    (weaponId === null || shot.plan.weaponId === weaponId) &&
    COUNTED.has(shot.status));
}

export function assertBurstCap(shots, { combatantId, phase, impulse }) {
  if (!Number.isInteger(phase) || phase < 1 || !Number.isInteger(impulse) || impulse < 1 || impulse > 4) {
    throw new Error('A burst is capped inside a real phase and impulse.');
  }
  if (countedBursts(shots, { combatantId, phase, impulse }).length >= 1) {
    throw new Error('§2.5: only one burst may be fired per impulse.');
  }
  if (countedBursts(shots, { combatantId, phase }).length >= 4) {
    throw new Error('§2.5: a maximum of four bursts may be fired per phase.');
  }
}

export function previousImpulse(phase, impulse) {
  if (impulse > 1) return { phase, impulse: impulse - 1 };
  if (phase > 1) return { phase: phase - 1, impulse: 4 };
  return null;
}

// The elevation EAL a succeeding burst subtracts SAB from.
//
// INFERENCE. §3.4 says the shooter "is capable of continuous burst of automatic fire" and
// that "the Elevation EAL for each succeeding burst is the preceding burst's EAL minus the
// weapon's SAB value." The worked example fires the second burst immediately. The page does
// not say what ends the string. The reading here: the burst fired from this weapon in the
// immediately previous impulse is the preceding one, and a gap impulse, a different weapon
// or an abandoned burst starts a new string. Movement alongside the burst does not break it
// — Trent is rushing in the example that applies SAB.
export function precedingElevation(shots, { combatantId, weaponId, phase, impulse }) {
  const previous = previousImpulse(phase, impulse);
  if (!previous) return null;
  const found = countedBursts(shots, { combatantId, weaponId, ...previous });
  if (!found.length) return null;
  if (found.length > 1) throw new Error('Two bursts are recorded in the previous impulse, which §2.5 does not allow. Reconcile them before firing another.');
  const shot = found[0];
  if (!Number.isFinite(shot.eal)) {
    throw new Error('The burst in the previous impulse has no elevation EAL yet. Roll it before firing the next one; SAB is taken from that EAL, not guessed.');
  }
  return shot.eal;
}
