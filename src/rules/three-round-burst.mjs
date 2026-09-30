// LEG10203 §6.3 Three Round Burst. "To find the burst's Odds of Hitting, cross-index the 3RB
// with the shot's Effective Accuracy Level (EAL) on the Three Round Burst Hit Chance Table
// (9B). This results in one to three numbers. Make a single 00-99 roll. If the roll is greater
// than the first (top) number, the burst misses. If less than or equal to the first number is
// rolled, one round hits. If less than or equal to the second number is rolled, two rounds
// hit. If less than or equal to the third number is rolled, all three rounds hit."
//
// The EAL is the single shot's: the burst is aimed and fired like one, at one man. Each round
// that hits is its own Table 6A impact with its own location and armour dice, the way a burst's
// rounds are.
//
// Readings:
//   - a range between the weapon's printed columns reads the shorter one, and a range past its
//     last column is refused (the standing rule for ambiguous range headings, 25 September);
//   - a 3RB value between Table 9B's rows reads the next HIGHER row, the one with more
//     scatter. That is the book's own example: Donovan's M16A2 has a 3RB of -5 at 10 hexes and
//     EAL 20, and §6.3 reads "78 and 27", which is the -4 row (the -6 row would give 78, 39 and
//     3). A value below -11 reads the -11 row and one above 16 the 16 row.
// Table 9B stops at EAL 3. Below it, §6.3's own description governs - at the extremes the
// burst "is little better than ... a single shot" - so the burst hits with one round at the
// Table 4G Single Shot odds and never with more (reading, 28 September 2026).
import { table9B, table9BEal, threeRoundBurstSource } from '../data/three-round-burst.mjs';
import { legacyFirearm as t } from '../data/legacy-firearm.mjs';
import { previewFirearm, resolveImpact, InputError, attackSource } from './attacks.mjs';
import { distanceInFeet } from './units.mjs';

const step = (label, value) => ({ label, value });

export function threeRoundBurstValue({ weapon, modeId, distance }) {
  const rows = Object.values(weapon?.system?.firearmModes?.[modeId]?.threeRoundBurst ?? {});
  if (!rows.length) throw new InputError('threeRoundBurst', 'This weapon prints no 3RB row, so it fires no three-round burst. Its Rate of Fire is not `**`.');
  const feet = distanceInFeet(distance);
  const sorted = [...rows].sort((a, b) => a.distanceFeet - b.distanceFeet);
  if (feet > sorted.at(-1).distanceFeet) throw new InputError('range', 'Beyond this weapon’s printed 3RB row; no long-range extrapolation.');
  return (sorted.filter(r => r.distanceFeet <= feet).at(-1) ?? sorted[0]).value;
}

export function table9BRow(value) {
  if (!Number.isFinite(value)) throw new InputError('threeRoundBurst', 'A 3RB value is a number.');
  return table9B.find(row => row.value >= value) ?? table9B.at(-1);
}

// The one to three numbers for this 3RB value and EAL; null where the page is blank.
export function threeRoundBurstChances(value, eal) {
  const row = table9BRow(value);
  const column = table9BEal.indexOf(eal);
  if (column < 0) {
    if (eal > table9BEal[0]) throw new InputError('eal', `EAL ${eal} is above Table 9B.`);
    const single = t.oddsOfHitting_4G.find(r => r.EAL === eal)?.['Single Shot'];
    if (single == null) throw new InputError('eal', `Table 4G has no line for EAL ${eal}.`);
    return { row: row.value, chances: [single], belowTable: true };
  }
  return { row: row.value, chances: row.lines.map(line => line[column]).filter(n => n !== null), belowTable: false };
}

export function previewThreeRoundBurst(input) {
  const shot = previewFirearm(input);
  const value = threeRoundBurstValue(input);
  const read = threeRoundBurstChances(value, shot.eal);
  return {
    ...shot, kind: 'three-round-burst', threeRoundBurst: value, table9BRow: read.row, chances: read.chances,
    threshold: read.chances[0], roundsFired: 3,
    source: `${attackSource} ${threeRoundBurstSource.rule}; ${threeRoundBurstSource.table}.`,
    trace: [...shot.trace,
      step('3RB at this range', value),
      step(`Table 9B (row ${read.row}${read.belowTable ? ', below EAL 3: one round at the Single Shot odds' : ''})`, read.chances.join(' / '))]
  };
}

// `rolls.hit` is the one 00-99 roll; `rolls.rounds` the location and armour dice for up to
// three rounds, and `input.roundArmorPF` the protection confirmed at each round's location.
export function resolveThreeRoundBurst(input, rolls) {
  const preview = previewThreeRoundBurst(input);
  const hit = rolls.hit;
  if (!Number.isSafeInteger(hit) || hit < 0 || hit > 99) throw new InputError('hit', 'Hit roll: supply an integer from 0 to 99.');
  const rounds = preview.chances.filter(chance => hit <= chance).length;
  const dice = rolls.rounds ?? [];
  if (dice.length < rounds) throw new InputError('rounds', `${rounds} round${rounds === 1 ? '' : 's'} hit and ${dice.length} location roll${dice.length === 1 ? ' was' : 's were'} supplied.`);
  const impacts = dice.slice(0, rounds).map((roll, i) => resolveImpact(
    { band: preview.band, cover: preview.cover, armorPF: input.roundArmorPF?.[i] ?? input.armorPF }, roll));
  const target = {
    id: input.targetId ?? 'target', rounds, hit: rounds > 0, impacts,
    physicalDamage: impacts.reduce((sum, i) => sum + i.physicalDamage, 0),
    shockPhysicalDamage: impacts.reduce((sum, i) => sum + i.shockPhysicalDamage, 0),
    disabled: impacts.some(i => i.disabled),
    detail: rounds ? `Rolled ${hit} against ${preview.chances.join(' / ')}: ${rounds} round${rounds === 1 ? '' : 's'} hit.` : `Rolled ${hit} against ${preview.chances[0]}: missed.`
  };
  return {
    ...preview, hit: rounds > 0, rounds, targets: [target], rolls: structuredClone(rolls),
    trace: [...preview.trace, step('Hit roll', hit), step('Rounds hitting', rounds),
      ...impacts.map((impact, n) => step(`  round ${n + 1}`, `${impact.location} · ${impact.physicalDamage} PD${impact.disabled ? ' · disabling' : ''}`))]
  };
}
