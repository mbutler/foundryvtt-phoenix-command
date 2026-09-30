// §3.4 Fully Automatic Weapon Fire (LEG10200 PDF 30-31 / printed 25-26) and §3.7 Hit Chance
// and Target Size (PDF 36 / printed 31).
//
// A burst is one impulse - half a second - of fire swept across an Arc of Fire, and it
// resolves in two stages that are easy to conflate and must not be:
//
//   1. ELEVATION. One roll for the whole burst. The burst either sits at the targets' height
//      or it goes over their heads or into the ground, and if it misses, it misses everyone
//      in the arc at once. This is an ordinary EAL chain read on Table 4G's `Burst Elevation`
//      column instead of `Single Shot`, and it differs from a single shot's EAL in exactly
//      one term: §3.4 substitutes Table 4E's Auto ELE column for the Target Size ALM.
//   2. HIT CHANCE, per target. Table 5A cross-indexes the weapon's Rate of Fire against the
//      width of the arc. Spreading the same rounds over more hexes thins them out, so a wide
//      arc covers more men and hits each of them less often.
//
// The two stages ask different questions of the same target. The elevation asks how TALL he
// is (Auto ELE); the hit chance asks how WIDE he is (Auto WTH). A man lying prone is a poor
// elevation target and a fine width one, and the table is entered by two different columns
// for that reason.
import { autoHitChance_5A, rofColumns, targetSizeModifiers_4F, automaticSource } from '../data/automatic.mjs';
import { legacyFirearm as t } from '../data/legacy-firearm.mjs';
import { accuracyChain, resolveImpact, InputError, EAL_FLOOR, attackSource } from './attacks.mjs';
import { distanceInFeet } from './units.mjs';
import { coverSituation } from './cover.mjs';

const step = (label, value) => ({ label, value });
const arcRows = autoHitChance_5A.filter(row => row.arc !== null);
export const printedArcs = Object.freeze(arcRows.map(row => row.arc));

// Table 5A's Arc of Fire axis is discrete and the unlabelled lines between its printed arcs
// exist only so §3.7's target-size shift has somewhere to land. An arc the page does not
// print is refused rather than snapped to a neighbour: the shooter chooses his arc, so he can
// choose a printed one, and guessing which way to round would change how many men he covers.
export function arcRow(arcHexes) {
  const row = arcRows.find(row => row.arc === arcHexes);
  if (!row) throw new InputError('arc', `Arc of Fire ${arcHexes} is not a printed Table 5A row. Printed arcs: ${printedArcs.join(', ')}.`);
  return row;
}

// The weapon's Minimum Arc at this range - how far recoil forces the burst to be tracked.
// It is printed per range on the weapon's own data line, so it is read like a ballistic band
// rather than asked for.
export function minimumArc({ weapon, modeId, distance }) {
  const mode = weapon?.system?.firearmModes?.[modeId];
  const rows = Object.values(mode?.minimumArc ?? {});
  if (!rows.length) throw new InputError('minimumArc', 'This weapon has no printed Minimum Arc, so its burst cannot be tracked. Automatic fire needs the MA row from the weapon data table.');
  const feet = distanceInFeet(distance);
  if (feet > Math.max(...rows.map(r => r.distanceFeet))) throw new InputError('range', 'Beyond this weapon’s printed Minimum Arc data; no long-range extrapolation.');
  // The MA row shares the ballistic table's range axis, and a range between two printed
  // columns reads the first column at or beyond it - the same convention the ballistic bands
  // use, and the one that does not understate the recoil.
  return rows.filter(r => r.distanceFeet >= feet).sort((a, b) => a.distanceFeet - b.distanceFeet)[0].arcHexes;
}

// §3.4: "The Elevation EAL for each succeeding burst is the preceding burst's EAL minus the
// weapon's Sustained Automatic Burst (SAB) value." `precedingEal` is null for the first burst
// of a continuous string and the preceding burst's elevation EAL for every one after it.
export function sustainedElevation({ precedingEal, sab }) {
  if (precedingEal === null || precedingEal === undefined) return { eal: null, spent: 0 };
  if (!Number.isFinite(sab) || sab < 0) throw new InputError('sab', 'A sustained burst needs the weapon’s printed SAB value.');
  return { eal: precedingEal - sab, spent: sab };
}

// §3.7's target-size correction. The Hit Chance printed on Table 5A assumes a Target Size
// ALM of 0 - that is why the page calls them Base values - and a real target moves the
// reading up or down the table by its own ALM. `autoWidth` is null when the correction is
// deliberately not applied, which is a stated answer and not the same as leaving it out.
export function autoWidthModifier(autoWidth) {
  if (autoWidth === null) return { alm: 0, applied: false, label: '§3.7 not applied · Table 5A base value' };
  if (typeof autoWidth === 'number') {
    // A nonstandard target, read off Table 4F opposite its width in feet.
    const rows = targetSizeModifiers_4F.filter(r => r.sizeFeet <= autoWidth);
    if (!rows.length) throw new InputError('autoWidth', `A target ${autoWidth} feet wide is below Table 4F's smallest printed size of ${targetSizeModifiers_4F[0].sizeFeet} feet.`);
    const row = rows.at(-1);
    return { alm: row.alm, applied: true, label: `Table 4F · ${autoWidth} ft wide reads the ${row.sizeFeet} ft line` };
  }
  const row = t.standardTargetSizeModifiers_4E.find(r => r.Position === autoWidth);
  if (!row) throw new InputError('autoWidth', `"${autoWidth}" is not a Table 4E position.`);
  return { alm: row['Auto Width'], applied: true, label: `Table 4E Auto WTH · ${autoWidth}` };
}

// Table 5A, entered at the arc's line and shifted by §3.7's Auto WTH. Returns either a
// percentage to roll against or a number of rounds that hit without a roll - §3.4 makes the
// asterisk the difference, and the two are printed adjacent in the same column.
export function burstHitChance({ arcHexes, burstRounds, autoWidth }) {
  if (!rofColumns.includes(burstRounds)) throw new InputError('burstRounds', `Table 5A has no Rate of Fire column for ${burstRounds}. Printed columns: ${rofColumns.join(', ')}.`);
  const base = arcRow(arcHexes);
  const width = autoWidthModifier(autoWidth);
  const index = base.index + width.alm;
  const row = autoHitChance_5A.find(r => r.index === index);
  if (!row) throw new InputError('autoWidth', `Table 5A has no line at index ${index}; its printed index runs ${autoHitChance_5A.at(-1).index} to ${autoHitChance_5A[0].index}.`);
  const cell = row.chances[burstRounds];
  if (cell === null) return { kind: 'none', rounds: 0, index, baseIndex: base.index, width,
    detail: 'Table 5A leaves this cell blank: no round from this burst can reach this target.' };
  if (cell.rounds !== undefined) {
    // "Note that the maximum number of bullets hitting is limited by the weapon's Rate of
    // Fire." The table's own column can print more rounds than the burst contains, because
    // the same line is read for several arcs.
    const rounds = Math.min(cell.rounds, burstRounds);
    return { kind: 'rounds', rounds, printed: cell.rounds, index, baseIndex: base.index, width,
      cappedByRateOfFire: cell.rounds > burstRounds };
  }
  return { kind: 'chance', chance: cell.chance, index, baseIndex: base.index, width };
}

// §3.7 applies the same index shift to Table 5A's other column, which carries the shotgun
// Base Pellet Hit Chance and the explosive Base Shrapnel Hit Chance together. Shotgun play
// does not call this: a starred pellet count and a percentage are different cells, and this
// lookup treats `*2` and a chance of 2 as the same base. `pelletHitCount` in shotgun.mjs and
// `shrapnelHitCount` in explosive.mjs are the shifts play uses. The lookup stays because
// §3.7's two printed pellet and shrapnel examples check the column on its own.
export function pelletOrShrapnelHitChance({ base, targetSizeAlm }) {
  if (!Number.isFinite(base)) throw new InputError('base', 'Supply the weapon’s Base Pellet or Base Shrapnel Hit Chance.');
  if (!Number.isSafeInteger(targetSizeAlm)) throw new InputError('targetSizeAlm', 'Supply the target size ALM as an integer (0 leaves the base value alone).');
  const start = autoHitChance_5A.find(row => row.pellet?.chance === base || row.pellet?.rounds === base);
  if (!start) throw new InputError('base', `No Table 5A line carries a Base Hit Chance of ${base}.`);
  const row = autoHitChance_5A.find(r => r.index === start.index + targetSizeAlm);
  if (!row) throw new InputError('targetSizeAlm', `Table 5A has no line at index ${start.index + targetSizeAlm}.`);
  if (row.pellet === null) return { kind: 'none', rounds: 0, index: row.index, baseIndex: start.index };
  return row.pellet.rounds !== undefined
    ? { kind: 'rounds', rounds: row.pellet.rounds, index: row.index, baseIndex: start.index }
    : { kind: 'chance', chance: row.pellet.chance, index: row.index, baseIndex: start.index };
}

// The burst itself: one elevation question, then one hit chance per target in the arc.
//
// The elevation EAL is computed against a nominated target, because range, motion and Auto
// ELE are all properties of a particular man and §3.4 gives a burst one elevation. Targets at
// materially different ranges are outside what this reproduces; the book's own example has
// both opponents at the same range.
export function previewBurst(input) {
  const chain = accuracyChain(input, { fireType: 'automatic', sizeColumn: 'Auto Elev' });
  const { mode, band, cover, rawEal } = chain;
  const burstRounds = mode.burstRounds;
  if (!Number.isSafeInteger(burstRounds) || burstRounds < 1) throw new InputError('burstRounds', 'This mode has no printed automatic Rate of Fire (the `*N` form), so it fires no burst.');
  const sustained = sustainedElevation({ precedingEal: input.precedingEal ?? null, sab: mode.sustainedBurstPenalty });
  const rawWithSab = sustained.eal === null ? rawEal : sustained.eal;
  const eal = Math.max(EAL_FLOOR, Math.min(28, rawWithSab));
  const elevationThreshold = lookupBurstElevation(eal);
  const ma = minimumArc(input);
  const arcHexes = input.arcHexes;
  if (typeof arcHexes !== 'number') throw new InputError('arc', 'State the width of the Arc of Fire in 2-yard hexes.');
  if (arcHexes < ma) throw new InputError('arc', `§3.4: recoil forces this burst over at least ${ma} hexes at this range; ${arcHexes} is narrower than the weapon's Minimum Arc.`);
  arcRow(arcHexes);
  return {
    kind: 'burst', eal, rawEal: rawWithSab, elevationThreshold, arcHexes, minimumArc: ma,
    burstRounds, sustained, band: structuredClone(band), cover,
    source: `${attackSource} Table 5A markers ${automaticSource.markers}.`,
    trace: [...chain.trace,
      ...(sustained.eal === null ? [] : [step('Preceding burst EAL (§3.4)', input.precedingEal), step('SAB', -sustained.spent)]),
      step('Raw elevation EAL', rawWithSab), step('Elevation EAL', eal),
      step('Burst elevation threshold (inclusive, d00–99)', elevationThreshold),
      step('Rate of Fire (rounds in the burst)', burstRounds),
      step('Minimum Arc at this range', ma), step('Arc of Fire', arcHexes),
      step('Ballistic band (feet)', band.distanceFeet)]
  };
}

// Table 4G's `Burst Elevation` column. Kept in one place because its lower half is the one
// piece of this chain the source and the ported table disagree about - see the open question
// in `docs/decisions.md`.
export function lookupBurstElevation(eal) {
  const row = t.oddsOfHitting_4G.find(r => r.EAL === eal);
  if (!row) throw new InputError('eal', `Table 4G has no line for EAL ${eal}.`);
  return row['Burst Elevation'];
}

// Resolve the burst. `rolls.elevation` is the one roll for the whole burst; `rolls.targets`
// carries a roll per target, in the order the targets were given, for the targets whose hit
// chance is a percentage rather than a printed number of rounds.
export function resolveBurst(input, rolls) {
  const preview = previewBurst(input);
  const elevation = rolls.elevation;
  if (!Number.isSafeInteger(elevation) || elevation < 0 || elevation > 99) throw new InputError('elevation', 'Elevation roll: supply an integer from 0 to 99.');
  const onTarget = elevation <= preview.elevationThreshold;
  const targets = Array.isArray(input.targets) ? input.targets : null;
  // §5.10: cover fire is aimed at the hexes, so an arc nobody shows himself in is still fired.
  if (!targets?.length && !(input.coverFire && Array.isArray(targets))) throw new InputError('targets', 'List the targets standing in the Arc of Fire.');
  if (!onTarget) {
    // §3.4: "If the result is a miss, the burst was either too high or too low and misses."
    // It misses every man in the arc, which is why this is not asked per target.
    return { ...preview, onTarget, rolls: structuredClone(rolls), roundsFired: preview.burstRounds,
      targets: targets.map(target => ({ id: target.id, rounds: 0, hit: false,
        impacts: [], physicalDamage: 0, shockPhysicalDamage: 0, disabled: false,
        detail: 'The burst was not at the targets’ elevation, so it passed over or under the whole arc.' })),
      trace: [...preview.trace, step('Elevation roll', elevation), step('Burst at the targets’ elevation', 'no · the whole arc missed')] };
  }
  const targetRolls = rolls.targets ?? [];
  const resolved = targets.map((target, i) => {
    const chance = burstHitChance({ arcHexes: preview.arcHexes, burstRounds: preview.burstRounds, autoWidth: target.autoWidth });
    if (chance.kind === 'none') return { id: target.id, rounds: 0, hit: false, chance, detail: chance.detail };
    if (chance.kind === 'rounds') return { id: target.id, rounds: chance.rounds, hit: true, chance,
      detail: `Table 5A prints *${chance.printed}: ${chance.rounds} round${chance.rounds === 1 ? '' : 's'} hit without a roll${chance.cappedByRateOfFire ? `, capped at the Rate of Fire of ${preview.burstRounds}` : ''}.` };
    const value = targetRolls[i];
    if (!Number.isSafeInteger(value) || value < 0 || value > 99) throw new InputError('targets', `Target ${target.id ?? i}: supply a 00-99 hit roll.`);
    const hit = value <= chance.chance;
    return { id: target.id, rounds: hit ? 1 : 0, hit, chance, roll: value,
      detail: hit ? `Rolled ${value} against ${chance.chance}: hit by one round.` : `Rolled ${value} against ${chance.chance}: missed.` };
  }).map((outcome, i) => withImpacts(outcome, targets[i], preview, rolls.impacts?.[i]));
  return { ...preview, onTarget, targets: resolved, rolls: structuredClone(rolls),
    // A burst spends its whole Rate of Fire whether or not anything is hit; the rounds that
    // miss still left the weapon. Ammunition is the caller's to apply.
    roundsFired: preview.burstRounds,
    trace: [...preview.trace, step('Elevation roll', elevation), step('Burst at the targets’ elevation', 'yes'),
      ...resolved.flatMap(r => [step(`Target ${r.id ?? '?'}`, r.detail),
        ...r.impacts.map((impact, n) => step(`  round ${n + 1}`, `${impact.location} · ${impact.physicalDamage} PD${impact.disabled ? ' · disabling' : ''}`))])] };
}

// Each round that hits is its own Table 6A question, asked with its own dice. §2.1 makes the
// whole burst simultaneous, so the rounds are not ordered and none of them is restricted by a
// wound another one of them inflicted; they are simply totalled.
//
// The cover is the burst's, not each man's: §3.4 gives an arc one elevation and this code
// gives it one cover situation with it. An arc sweeping men behind different cover is outside
// what this reproduces and has to be resolved as separate bursts.
function withImpacts(outcome, target, preview, impactRolls) {
  if (!outcome.rounds) return { ...outcome, impacts: [], physicalDamage: 0, shockPhysicalDamage: 0, disabled: false };
  const rolls = impactRolls ?? [];
  if (rolls.length !== outcome.rounds) {
    throw new InputError('impacts', `Target ${target.id ?? '?'} was hit by ${outcome.rounds} round${outcome.rounds === 1 ? '' : 's'} and needs a location and armour roll for each; ${rolls.length} supplied.`);
  }
  // A round's armour is the protection at the location it struck. `roll.armorPF` is that
  // confirmation; `target.armorPF` remains for a caller that already knows one value for
  // every round. Leaving both unset is refused by the impact, not treated as unarmoured.
  // §5.10 cover fire: each man attacked keeps his own cover for where the round lands.
  const cover = target.cover !== undefined ? coverSituation({ penetration: preview.band.penetration, cover: target.cover }) : preview.cover;
  const impacts = rolls.map(roll => resolveImpact(
    { band: preview.band, cover, armorPF: roll.armorPF ?? target.armorPF }, roll));
  return { ...outcome, impacts,
    physicalDamage: impacts.reduce((sum, i) => sum + i.physicalDamage, 0),
    // Table 6C shock still counts toward the knockout roll only, and a man shot twice in the
    // same impulse takes the shock of both wounds.
    shockPhysicalDamage: impacts.reduce((sum, i) => sum + i.shockPhysicalDamage, 0),
    disabled: impacts.some(i => i.disabled) };
}
