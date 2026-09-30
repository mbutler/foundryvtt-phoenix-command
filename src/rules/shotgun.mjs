// §3.5 Shotguns (LEG10200 PDF 32–33 / printed 27–28) and the shotgun half of §3.7 (PDF 36).
//
// A buckshot blast is a single-shot EAL with one substitution: the target-size term is the
// larger of Table 4E's Target Size ALM and the weapon's SALM. The odds are Table 4G's
// Single Shot column. That roll is the pattern. If it misses, nobody is hit. If it hits,
// the Base Pellet Hit Chance — printed under the SALM — decides the pellets, and everyone
// within the Pattern Radius of the intended target is checked with that same chance.
//
// Two things this does not do. The book's other damage method, one location whose Physical
// Damage is multiplied by the pellet count, collapses locations and changes what disables
// and what shocks, so each pellet is its own Table 6A impact. "Distributed evenly" across
// the Hit Location Spacing is the other printed grouping method and is refused by name
// rather than silently chosen; random rolls inside the spacing are the one implemented.
// phoenix-functions `shotgunFire` rolls once and treats a non-shot load as an automatic hit,
// and `shotgunMultipleHit` is a fitted curve. Neither is used.

import { legacyFirearm as t } from '../data/legacy-firearm.mjs';
import { shotgunMultipleHit, shotgunHitSource } from '../data/shotgun-hit.mjs';
import { shotgunSource } from '../data/shotguns.mjs';
import { autoHitChance_5A, automaticSource } from '../data/automatic.mjs';
import { accuracyChain, firearmBand, resolveImpact, InputError, attackSource, EAL_FLOOR } from './attacks.mjs';
import { autoWidthModifier, burstHitChance, lookupBurstElevation, minimumArc, sustainedElevation } from './automatic-fire.mjs';

const step = (label, value) => ({ label, value });
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));

function singleShotOdds(eal) {
  const row = t.oddsOfHitting_4G.find(r => r.EAL === eal);
  if (!row) throw new InputError('eal', `Table 4G has no line for EAL ${eal}.`);
  return row['Single Shot'];
}

function roll100(value, name) {
  if (!Number.isSafeInteger(value) || value < 0 || value > 99) throw new InputError(name, `${name}: supply an integer from 0 to 99.`);
  return value;
}

export const shotgunRulesSource = `${attackSource} ${shotgunHitSource.table} PDF ${shotgunHitSource.pdfPage}. Weapons ${shotgunSource.book} PDF ${shotgunSource.pdfPage}. Table 5A pellet column ${automaticSource.markers}.`;

// Greatest printed numeric SALM at or below the weapon's, which is how the example reads
// SALM 7 on the SALM 6 row. Below −12 is the open row. −12 and −11 are printed nowhere.
export function hitLocationSpacing(salm) {
  if (!Number.isSafeInteger(salm)) throw new InputError('salm', 'Hit Location Spacing is entered with the weapon\'s SALM, a whole number.');
  if (salm < -12) return shotgunMultipleHit[0].hls;
  if (salm === -12 || salm === -11) {
    throw new InputError('salm', `SALM ${salm} sits between the open "< −12" row and the −10 row of the Shotgun Multiple Hit Table, and no weapon prints it. The table is not interpolated.`);
  }
  const row = shotgunMultipleHit.filter(entry => entry.salm !== null && entry.salm <= salm).at(-1);
  if (!row) throw new InputError('salm', `The Shotgun Multiple Hit Table has no row at or below SALM ${salm}.`);
  return row.hls;
}

export function groupingWindow(location, spacing, rollMax = 99) {
  return { low: Math.max(0, location - spacing), high: Math.min(rollMax, location + spacing) };
}

function groupingChoice(value) {
  if (value === false || value === 'random') return value;
  if (value === 'even') throw new InputError('pelletGrouping', 'The table also lets the extra pellets be distributed evenly across the spacing. That method is not implemented. Choose random rolls inside the spacing, or leave grouping off so each pellet is rolled on its own.');
  throw new InputError('pelletGrouping', 'Pellet grouping is optional. Pass false, or \'random\' to keep later pellets within the Hit Location Spacing of the first.');
}

// People the pattern can reach. Distance is hexes from the intended target, and a printed
// radius below 1 therefore contains only his own hex. Someone in that radius at another
// elevation is named and refused.
export function peopleInPattern({ intendedId, patternRadiusHexes, people }) {
  if (!Array.isArray(people) || !people.length) throw new InputError('occupants', 'Name the intended target.');
  const intended = people.find(person => person.id === intendedId);
  if (!intended) throw new InputError('occupants', 'The intended target is not among the people listed.');
  if (patternRadiusHexes == null) return [intended];
  if (!Number.isFinite(patternRadiusHexes) || patternRadiusHexes < 0) throw new InputError('patternRadius', 'Pattern radius is a number of 2-yard hexes.');
  const inside = people.filter(person => {
    if (!Number.isFinite(person.distanceHexes) || person.distanceHexes < 0) throw new InputError('occupants', `${person.name ?? person.id} needs a hex distance from the intended target.`);
    return person.distanceHexes <= patternRadiusHexes;
  });
  const elevated = inside.filter(person => person.elevation !== intended.elevation);
  if (elevated.length) {
    const names = elevated.map(person => person.name ?? person.id).join(', ');
    throw new InputError('elevation', `${names} ${elevated.length === 1 ? 'is' : 'are'} inside the pattern at another elevation. A shotgun blast is not resolved across elevations.`);
  }
  return inside;
}

function printedChance(band) {
  if (band.pelletRounds != null && band.pelletChance != null) throw new InputError('bphc', 'A range column prints either a pellet count or a percentage, not both.');
  if (band.pelletRounds != null) return { starred: true, rounds: band.pelletRounds };
  if (band.pelletChance != null) return { starred: false, chance: band.pelletChance };
  return null;
}

function pelletLabel(printed) {
  return printed.starred ? `*${printed.rounds}` : String(printed.chance);
}

// The pellet step. With §3.7 off, the weapon's own BPHC is used, and a value below 0 hits
// nothing. With it on, the value has to be a cell of Table 5A's pellet column — most printed
// shotgun BPHCs are not — and the shift uses Auto WTH. Either way the result cannot exceed
// the Pellet Number printed beside the shot type.
export function pelletHitCount({ band, pelletNumber, applyTargetWidth, autoWidth }) {
  const printed = printedChance(band);
  if (!printed) throw new InputError('bphc', 'This range column prints no Base Pellet Hit Chance.');
  if (!Number.isSafeInteger(pelletNumber) || pelletNumber < 1) throw new InputError('pelletNumber', 'Buckshot needs the Pellet Number printed beside the shot type.');
  if (typeof applyTargetWidth !== 'boolean') throw new InputError('applyTargetWidth', 'Say whether §3.7 adjusts the Base Pellet Hit Chance. It is optional, and leaving it unstated is not a choice.');
  let outcome;
  if (applyTargetWidth && (autoWidth === null || autoWidth === undefined)) throw new InputError('autoWidth', '§3.7 needs the target\'s Auto WTH, from a Table 4E position or a width in feet.');
  if (!applyTargetWidth) {
    if (printed.starred) outcome = { kind: 'rounds', rounds: printed.rounds, detail: `BPHC *${printed.rounds}: ${printed.rounds} pellet${printed.rounds === 1 ? '' : 's'} hit, no roll.` };
    else if (printed.chance < 0) outcome = { kind: 'none', rounds: 0, detail: 'The BPHC is below 0 and §3.7 is off, so no pellet can hit.' };
    else outcome = { kind: 'chance', chance: printed.chance, detail: `BPHC ${printed.chance}: one pellet on a 00–99 roll of ${printed.chance} or less.` };
  } else {
    const width = autoWidthModifier(autoWidth);
    const base = printed.starred ? printed.rounds : printed.chance;
    const start = autoHitChance_5A.find(row => printed.starred
      ? row.pellet?.rounds === base && row.pellet.chance === undefined
      : row.pellet?.chance === base && row.pellet.rounds === undefined);
    if (!start) throw new InputError('bphc', `§3.7 cannot shift a BPHC of ${pelletLabel(printed)}, because Table 5A's pellet column does not print it. Leave the shift off to use the weapon's own number.`);
    const row = autoHitChance_5A.find(entry => entry.index === start.index + width.alm);
    if (!row) throw new InputError('autoWidth', `Table 5A has no pellet line at index ${start.index + width.alm}.`);
    if (row.pellet == null) outcome = { kind: 'none', rounds: 0, width, detail: `${width.label}. The shifted pellet cell is blank, so no pellet hits.` };
    else if (row.pellet.rounds !== undefined) outcome = { kind: 'rounds', rounds: row.pellet.rounds, width, detail: `${width.label}. BPHC ${pelletLabel(printed)} shifts to *${row.pellet.rounds}.` };
    else outcome = { kind: 'chance', chance: row.pellet.chance, width, detail: `${width.label}. BPHC ${pelletLabel(printed)} shifts to ${row.pellet.chance}.` };
  }
  if (outcome.kind === 'rounds' && outcome.rounds > pelletNumber) {
    return { ...outcome, rounds: pelletNumber, capped: true, detail: `${outcome.detail} Capped at the load's Pellet Number of ${pelletNumber}.` };
  }
  return { ...outcome, capped: false };
}

function requireBlastChoices(input) {
  groupingChoice(input.pelletGrouping);
  if (typeof input.applyPelletWidth !== 'boolean') throw new InputError('applyTargetWidth', 'Say whether §3.7 adjusts the Base Pellet Hit Chance. It is optional, and leaving it unstated is not a choice.');
}

function chainWithSalm(chain, salm) {
  const used = Math.max(chain.sizeMod, salm);
  const rawEal = chain.rawEal - chain.sizeMod + used;
  const eal = clamp(rawEal, EAL_FLOOR, 28);
  return { used, rawEal, eal, salmWon: salm > chain.sizeMod, tied: salm === chain.sizeMod };
}

export function previewShotgun(input) {
  requireBlastChoices(input);
  const loaded = firearmBand(input);
  if (loaded.salm == null) throw new InputError('ammunition', 'This ammunition prints no SALM, so it is a single shot rather than a shotgun pattern.');
  const chain = accuracyChain(input);
  const { band, cover } = chain;
  const pelletNumber = chain.mode.ammunition[input.ammunitionKey]?.pelletNumber;
  const printed = printedChance(band);
  if (!printed) {
    const threshold = singleShotOdds(chain.eal);
    return {
      kind: 'shotgun', mass: true, eal: chain.eal, rawEal: chain.rawEal, threshold,
      salm: band.salm, band: structuredClone(band), cover, pelletNumber: pelletNumber ?? null,
      source: shotgunRulesSource,
      trace: [...chain.trace,
        step('Shotgun ALM (not used)', band.salm),
        step('One mass', 'This column prints no Base Pellet Hit Chance, so the shot has not spread and is one projectile at this column\'s PEN and DC.'),
        step('Raw EAL', chain.rawEal), step('EAL', chain.eal),
        step('Hit threshold (inclusive, d00–99)', threshold), step('Ballistic band (feet)', band.distanceFeet)]
    };
  }
  const size = chainWithSalm(chain, band.salm);
  const threshold = singleShotOdds(size.eal);
  const chance = pelletHitCount({ band, pelletNumber, applyTargetWidth: input.applyPelletWidth, autoWidth: input.autoWidth ?? null });
  return {
    kind: 'shotgun', mass: false, eal: size.eal, rawEal: size.rawEal, threshold,
    salm: band.salm, patternRadiusHexes: band.patternRadiusHexes, pelletNumber, chance,
    band: structuredClone(band), cover, source: shotgunRulesSource,
    trace: [...chain.trace.filter(entry => entry.label !== 'Target size'),
      step('Target Size ALM', chain.sizeMod), step('Shotgun ALM', band.salm),
      step('Target size used', `${size.used}${size.salmWon ? ' · the SALM, which is larger' : size.tied ? ' · the two are equal' : ' · the Target Size ALM, which is larger'}`),
      step('Raw EAL', size.rawEal), step('EAL', size.eal),
      step('Pattern threshold (Single Shot, inclusive)', threshold),
      step('Pattern radius (hexes)', band.patternRadiusHexes),
      step('Pellets', chance.detail),
      step('Ballistic band (feet)', band.distanceFeet)]
  };
}

function locatePellets(count, supplied, preview, grouping, salm) {
  const rolls = supplied ?? [];
  if (rolls.length !== count) throw new InputError('impacts', `${count} pellet${count === 1 ? '' : 's'} hit and each needs a location and an armour roll; ${rolls.length} supplied.`);
  if (grouping === 'random' && count > 1) {
    const spacing = hitLocationSpacing(salm);
    const window = groupingWindow(rolls[0].location, spacing, preview.cover.rollMax ?? 99);
    for (const extra of rolls.slice(1)) {
      if (!Number.isSafeInteger(extra.location) || extra.location < window.low || extra.location > window.high) {
        throw new InputError('location', `Grouping keeps later pellets between ${window.low} and ${window.high} around the first; ${extra.location} is outside that spacing.`);
      }
    }
  }
  return rolls.map(roll => resolveImpact({ band: preview.band, cover: preview.cover, armorPF: roll.armorPF }, roll));
}

function personResult(person, pellets, impacts) {
  return {
    id: person.id, name: person.name ?? person.id, pellets, hit: pellets > 0, impacts,
    physicalDamage: impacts.reduce((sum, impact) => sum + impact.physicalDamage, 0),
    shockPhysicalDamage: impacts.reduce((sum, impact) => sum + impact.shockPhysicalDamage, 0),
    disabled: impacts.some(impact => impact.disabled)
  };
}

export function resolveShotgun(input, rolls) {
  const preview = previewShotgun(input);
  const pattern = roll100(rolls?.pattern, preview.mass ? 'Hit roll' : 'Pattern roll');
  const hit = pattern <= preview.threshold;
  if (!hit) {
    return { ...preview, patternHit: false, roundsFired: 1, rolls: structuredClone(rolls),
      targets: (input.people ?? []).filter(person => person.id === input.intendedId).map(person => personResult(person, 0, [])),
      trace: [...preview.trace, step(preview.mass ? 'Hit roll' : 'Pattern roll', pattern), step(preview.mass ? 'Hit' : 'Pattern hit', 'no')] };
  }
  if (preview.mass) {
    const person = (input.people ?? []).find(candidate => candidate.id === input.intendedId) ?? { id: input.intendedId, name: input.intendedId };
    const impacts = locatePellets(1, rolls.occupants?.[0]?.locations, preview, false, preview.salm);
    const target = personResult(person, 1, impacts);
    return { ...preview, patternHit: true, roundsFired: 1, rolls: structuredClone(rolls), targets: [target],
      trace: [...preview.trace, step('Hit roll', pattern), step('Hit', 'yes · one projectile'),
        step('Location', `${impacts[0].location} · ${impacts[0].physicalDamage} PD`)] };
  }
  const inside = peopleInPattern({ intendedId: input.intendedId, patternRadiusHexes: preview.patternRadiusHexes, people: input.people });
  const supplied = rolls.occupants ?? [];
  if (supplied.length !== inside.length) throw new InputError('occupants', `The pattern covers ${inside.length} ${inside.length === 1 ? 'person' : 'people'} and the rolls cover ${supplied.length}.`);
  const targets = inside.map((person, index) => {
    const chance = pelletHitCount({
      band: preview.band, pelletNumber: preview.pelletNumber,
      applyTargetWidth: input.applyPelletWidth, autoWidth: person.autoWidth ?? null
    });
    let pellets = 0;
    let pelletRoll = null;
    if (chance.kind === 'rounds') pellets = chance.rounds;
    else if (chance.kind === 'chance') {
      pelletRoll = roll100(supplied[index].pellet, `Pellet roll for ${person.name ?? person.id}`);
      pellets = pelletRoll <= chance.chance ? 1 : 0;
    }
    const impacts = pellets ? locatePellets(pellets, supplied[index].locations, preview, input.pelletGrouping, preview.salm) : [];
    return { ...personResult(person, pellets, impacts), pelletRoll, detail: chance.detail };
  });
  return { ...preview, patternHit: true, roundsFired: 1, rolls: structuredClone(rolls), targets,
    trace: [...preview.trace, step('Pattern roll', pattern), step('Pattern hit', 'yes'),
      ...targets.flatMap(target => [step(`${target.name}`, target.pellets ? `${target.pellets} pellet${target.pellets === 1 ? '' : 's'}` : 'no pellet'),
        ...target.impacts.map((impact, n) => step(`  pellet ${n + 1}`, `${impact.location} · ${impact.physicalDamage} PD${impact.disabled ? ' · disabling' : ''}`))])] };
}

// A fully automatic shotgun is the burst rules with two substitutions: the elevation's
// target-size term is the larger of Auto ELE and the SALM, and each pattern that Table 5A
// puts on a man is then a buckshot blast's pellet step. The arc, not the Pattern Radius,
// decides who is in it.
export function previewAutomaticShotgun(input) {
  requireBlastChoices(input);
  const chain = accuracyChain(input, { fireType: 'automatic', sizeColumn: 'Auto Elev' });
  const { mode, band, cover } = chain;
  if (band.salm == null) throw new InputError('ammunition', 'This ammunition prints no SALM. A slug from an automatic shotgun is an ordinary burst.');
  const pelletNumber = mode.ammunition[input.ammunitionKey]?.pelletNumber;
  if (printedChance(band) == null) throw new InputError('bphc', 'This range column prints no Base Pellet Hit Chance, so an automatic burst of it is not a pattern.');
  const burstRounds = mode.burstRounds;
  if (!Number.isSafeInteger(burstRounds) || burstRounds < 1) throw new InputError('burstRounds', 'This mode has no printed automatic Rate of Fire, so it fires no burst.');
  const size = chainWithSalm(chain, band.salm);
  const sustained = sustainedElevation({ precedingEal: input.precedingEal ?? null, sab: mode.sustainedBurstPenalty });
  // A succeeding burst's elevation EAL is the preceding burst's EAL minus SAB. It replaces
  // the chain, which has already had the SALM substituted into it for a first burst.
  const elevationRaw = sustained.eal === null ? size.rawEal : sustained.eal;
  const eal = clamp(elevationRaw, EAL_FLOOR, 28);
  const elevationThreshold = lookupBurstElevation(eal);
  const ma = minimumArc(input);
  const arcHexes = input.arcHexes;
  if (typeof arcHexes !== 'number') throw new InputError('arc', 'State the width of the Arc of Fire in 2-yard hexes.');
  if (arcHexes < ma) throw new InputError('arc', `Recoil forces this burst over at least ${ma} hexes at this range; ${arcHexes} is narrower.`);
  const chance = pelletHitCount({ band, pelletNumber, applyTargetWidth: input.applyPelletWidth, autoWidth: input.autoWidth ?? null });
  return {
    kind: 'automatic-shotgun', eal, rawEal: elevationRaw, elevationThreshold, arcHexes, minimumArc: ma,
    burstRounds, sustained, salm: band.salm, pelletNumber, chance,
    band: structuredClone(band), cover, source: shotgunRulesSource,
    trace: [...chain.trace.filter(entry => !entry.label.startsWith('Target size')),
      step('Auto ELE', chain.sizeMod), step('Shotgun ALM', band.salm),
      step('Target size used', `${size.used}${size.salmWon ? ' · the SALM, which is larger' : size.tied ? ' · the two are equal' : ' · Auto ELE, which is larger'}`),
      ...(sustained.eal === null ? [] : [step('Preceding burst EAL', input.precedingEal), step('SAB', -sustained.spent)]),
      step('Elevation EAL', eal), step('Burst elevation threshold (inclusive)', elevationThreshold),
      step('Rate of Fire (patterns in the burst)', burstRounds),
      step('Pellets per pattern', chance.detail)]
  };
}

export function resolveAutomaticShotgun(input, rolls) {
  const preview = previewAutomaticShotgun(input);
  const elevation = roll100(rolls?.elevation, 'Elevation roll');
  const targets = Array.isArray(input.targets) ? input.targets : null;
  if (!targets?.length) throw new InputError('targets', 'List the targets standing in the Arc of Fire.');
  const onTarget = elevation <= preview.elevationThreshold;
  if (!onTarget) {
    return { ...preview, onTarget, roundsFired: preview.burstRounds, rolls: structuredClone(rolls),
      targets: targets.map(target => personResult(target, 0, [])),
      trace: [...preview.trace, step('Elevation roll', elevation), step('Patterns at the targets\' elevation', 'no · the whole arc missed')] };
  }
  const suppliedTargets = rolls.targets ?? [];
  const resolved = targets.map((target, index) => {
    const patterns = burstHitChance({ arcHexes: preview.arcHexes, burstRounds: preview.burstRounds, autoWidth: target.autoWidth ?? null });
    let count = 0;
    let patternRoll = null;
    if (patterns.kind === 'rounds') count = patterns.rounds;
    else if (patterns.kind === 'chance') {
      patternRoll = roll100(suppliedTargets[index], `Pattern roll for ${target.id ?? index}`);
      count = patternRoll <= patterns.chance ? 1 : 0;
    }
    const groups = rolls.patterns?.[index] ?? [];
    if (groups.length !== count) throw new InputError('patterns', `${target.id ?? index} is covered by ${count} pattern${count === 1 ? '' : 's'} and ${groups.length} pellet groups were supplied.`);
    const impacts = [];
    for (let n = 0; n < count; n++) {
      const chance = pelletHitCount({
        band: preview.band, pelletNumber: preview.pelletNumber,
        applyTargetWidth: input.applyPelletWidth, autoWidth: target.autoWidth ?? null
      });
      let pellets = 0;
      if (chance.kind === 'rounds') pellets = chance.rounds;
      else if (chance.kind === 'chance') {
        const pelletRoll = roll100(groups[n].pellet, `Pellet roll ${n + 1} for ${target.id ?? index}`);
        pellets = pelletRoll <= chance.chance ? 1 : 0;
      }
      if (pellets) impacts.push(...locatePellets(pellets, groups[n].locations, preview, input.pelletGrouping, preview.salm));
    }
    return { ...personResult(target, impacts.length, impacts), patterns: count, patternRoll };
  });
  return { ...preview, onTarget, roundsFired: preview.burstRounds, rolls: structuredClone(rolls), targets: resolved,
    trace: [...preview.trace, step('Elevation roll', elevation), step('Patterns at the targets\' elevation', 'yes'),
      ...resolved.map(target => step(target.id, `${target.patterns} pattern${target.patterns === 1 ? '' : 's'}, ${target.pellets} pellet${target.pellets === 1 ? '' : 's'}`))] };
}
