// A burst from an automatic grenade launcher: the AGS-17 (`ROF *1`), M174 and M19 (`*3`),
// LEG10200 PDF 87–88.
//
// The book prints the burst size, SAB and Minimum Arc for these weapons and never says how
// the burst lands. §3.4 is written for bullets and §3.6 for one explosive round, whose
// "detonation site ... must be determined, even if the round missed". User ruling
// (28 September 2026), joining the two:
//
//   1. ONE ELEVATION ROLL for the burst, on Table 4G's Burst Elevation column. The EAL is the
//      §3.6 launcher chain - the weapon's aim row, a hex target size of +12 (+15 from a
//      highly elevated position), range, motion, visibility and situation - and a succeeding
//      burst from the same weapon is the preceding burst's EAL minus its SAB (§3.4).
//   2. THE ARC is swept across hexes at one range and is at least the weapon's Minimum Arc
//      there. On a hit the burst's rounds land evenly across the arc's hexes, the way Figure 2
//      puts bullets into each hex: round k of N lands in the hex (k + ½)·L/N along a sweep of
//      L hexes. An arc narrower than a hex puts every round in its one hex.
//   3. ON A MISS every round is displaced by the same Table 5C scatter, measured on the Burst
//      Elevation column the way §3.6 measures a single round on Single Shot: one Long/Short
//      roll for the burst for a miss of more than one hex, one 1–6 neighbour for a miss of one.
//      Each round travels along its own line from the shooter.
//   4. EACH LANDING HEX EXPLODES as a §3.6 detonation. A man reached by several takes each of
//      them: every piece of shrapnel is its own impact and the concussions add.
//
// Table 5A is not read: nothing here is a bullet striking a man.
import { minimumArc, arcRow, sustainedElevation, lookupBurstElevation } from './automatic-fire.mjs';
import { explosivePreviewInput, loadExplosiveAmmo, scatterGap, detonationHex, resolveDetonation, explosiveRulesSource } from './explosive.mjs';
import { rangeALM } from './range.mjs';
import { InputError, EAL_FLOOR } from './attacks.mjs';
import { asCube } from './hex-cube.mjs';

export const grenadeBurstSource = 'LEG10200 §3.4 PDF 30–31 and §3.6 PDF 33–36; Explosive Weapons PDF 87–88; user ruling 28 September 2026';
const step = (label, value) => ({ label, value });
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function loadBurstRound(input) {
  const loaded = loadExplosiveAmmo(input);
  const { mode, ammo } = loaded;
  if (ammo.fusePhases != null) throw new InputError('fuse', 'A launcher round detonates on impact. A timed fuse belongs on a thrown grenade.');
  if (!mode.fireTypes?.includes('automatic') || !Number.isSafeInteger(mode.burstRounds) || mode.burstRounds < 1) {
    throw new InputError('burstRounds', 'This launcher prints no `*N` Rate of Fire, so it fires no burst.');
  }
  const aim = mode.aimModifiers?.[input.aimActions];
  if (typeof aim !== 'number' || !Number.isFinite(aim)) throw new InputError('aim', 'Choose a supported whole-action aim time from this launcher.');
  return loaded;
}

export function previewGrenadeBurst(input) {
  const { mode } = loadBurstRound(input);
  const { sal, hexes, size, visibility, movement, situations } = explosivePreviewInput(input);
  const aim = mode.aimModifiers[input.aimActions];
  const range = rangeALM(hexes);
  const rawEal = sal + aim + range + size + visibility + movement + situations;
  const sustained = sustainedElevation({ precedingEal: input.precedingEal ?? null, sab: mode.sustainedBurstPenalty });
  const rawWithSab = sustained.eal === null ? rawEal : sustained.eal;
  const eal = clamp(rawWithSab, EAL_FLOOR, 28);
  const elevationThreshold = lookupBurstElevation(eal);
  const ma = minimumArc({ weapon: input.weapon, modeId: input.modeId, distance: { value: hexes * 6, unit: 'ft' } });
  const arcHexes = input.arcHexes;
  if (typeof arcHexes !== 'number') throw new InputError('arc', 'State the width of the Arc of Fire in 2-yard hexes.');
  if (arcHexes < ma) throw new InputError('arc', `§3.4: recoil forces this burst over at least ${ma} hexes at this range; ${arcHexes} is narrower than the weapon's Minimum Arc.`);
  arcRow(arcHexes);
  const burstRounds = mode.burstRounds;
  return {
    kind: 'grenade-burst', eal, rawEal: rawWithSab, elevationThreshold, arcHexes, minimumArc: ma,
    burstRounds, sustained, roundsFired: burstRounds,
    source: `${explosiveRulesSource} ${grenadeBurstSource}.`,
    trace: [
      step('SAL', sal), step('Range ALM', range), step('Aim (weapon)', aim),
      step('Target size (hex)', size), step('Visibility', visibility), step('Movement', movement),
      step('Situation', situations),
      ...(sustained.eal === null ? [] : [step('Preceding burst EAL (§3.4)', input.precedingEal), step('SAB', -sustained.spent)]),
      step('Raw elevation EAL', rawWithSab), step('Elevation EAL', eal),
      step('Burst elevation threshold (inclusive, d00–99)', elevationThreshold),
      step('Rounds in the burst', burstRounds),
      step('Minimum Arc at this range', ma), step('Arc of Fire', arcHexes)
    ]
  };
}

// Where each round of an on-target burst lands: spread evenly along the swept hexes.
export function burstLandings(swept, burstRounds) {
  if (!Array.isArray(swept) || !swept.length) throw new InputError('arc', 'Designate the hexes the burst is swept across.');
  if (!Number.isSafeInteger(burstRounds) || burstRounds < 1) throw new InputError('burstRounds', 'A burst fires at least one round.');
  const hexes = swept.map(asCube);
  return Array.from({ length: burstRounds }, (_, k) => hexes[Math.min(hexes.length - 1, Math.floor((k + 0.5) * hexes.length / burstRounds))]);
}

// Where each round went off, given the elevation roll and, for a miss, the scatter dice.
export function grenadeBurstPlacement(input, preview, rolls) {
  const gap = scatterGap(preview.eal, rolls.elevation, 'Burst Elevation');
  const aimed = burstLandings(input.arc?.swept, preview.burstRounds);
  const landings = aimed.map(hex => detonationHex({
    shooter: input.shooterCube, target: hex, hexes: gap.hexes,
    direction: rolls.direction ?? null, neighbor: rolls.neighbor ?? null
  }));
  return { gap, aimed, landings };
}

const key = hex => `${hex.q},${hex.r},${hex.s}`;

export function resolveGrenadeBurst(input, rolls) {
  const preview = previewGrenadeBurst(input);
  const { ammo } = loadBurstRound(input);
  const { gap, landings } = grenadeBurstPlacement(input, preview, rolls);
  const per = rolls.detonations ?? [];
  if (per.length !== landings.length) throw new InputError('shrapnel', `The burst detonated ${landings.length} round${landings.length === 1 ? '' : 's'} and ${per.length} set${per.length === 1 ? ' of shrapnel rolls was' : 's of shrapnel rolls were'} supplied.`);
  const detonations = landings.map((detonation, i) => {
    const one = resolveDetonation(input, detonation, { occupants: per[i].occupants ?? [] }, { preview, gap, ammo });
    return { detonation, targets: one.targets };
  });
  // One entry per man, whatever number of rounds reached him.
  const byId = new Map();
  for (const { targets } of detonations) for (const target of targets) {
    const seen = byId.get(target.id);
    if (!seen) { byId.set(target.id, { ...target, rounds: 1, blasts: [target.distanceHexes] }); continue; }
    seen.rounds++; seen.blasts.push(target.distanceHexes);
    seen.shrapnel += target.shrapnel; seen.hit = seen.hit || target.hit;
    seen.impacts = [...seen.impacts, ...target.impacts];
    seen.concussion += target.concussion;
    seen.physicalDamage += target.physicalDamage;
    seen.shockPhysicalDamage += target.shockPhysicalDamage;
    seen.distanceHexes = Math.min(seen.distanceHexes, target.distanceHexes);
    seen.detail = `${seen.blasts.length} blasts reached him, ${seen.blasts.join(', ')} hexes away.`;
  }
  const targets = [...byId.values()];
  const counted = new Map();
  for (const hex of landings) counted.set(key(hex), (counted.get(key(hex)) ?? 0) + 1);
  const where = [...counted].map(([hex, n]) => n > 1 ? `${hex} ×${n}` : hex).join('; ');
  return {
    ...preview, onTarget: gap.hit, hit: gap.hit, scatter: gap, landings, detonations, targets,
    rolls: structuredClone(rolls),
    trace: [...preview.trace,
      step('Elevation roll', rolls.elevation),
      step('Placement', gap.hit ? 'at the arc’s elevation: rounds spread across the swept hexes' : `off by ${gap.hexes} hex${gap.hexes === 1 ? '' : 'es'} (EAL difference ${gap.difference})`),
      step('Detonations', where),
      ...targets.map(target => step(target.name, `${target.detail} ${target.shrapnel} shrapnel, ${target.concussion} concussion PD.`))]
  };
}
