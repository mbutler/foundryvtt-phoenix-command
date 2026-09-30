import {movementRangeColumn} from './movement.mjs';
import {rangeALM} from './range.mjs';
// §3.6 Explosive Weapons and Grenades (LEG10200 PDF 33–36 / printed 28–31).
//
// A thrown grenade's EAL is Range ALM + SAL + the Grenade Aim Time Table (4H) + target
// size + visibility + motion. A launched round uses the weapon's own aim-time row instead
// of Table 4H. Both aim at a hex (+12 from level ground, +15 from a highly elevated
// position). The odds are Table 4G Single Shot. A miss is measured by the EAL whose odds
// are just greater than the roll, and Table 5C turns that gap into hexes.
//
// Where it detonates, each person is one burst column of the weapon. A starred BSHC is that
// many pieces with no roll; a percentage is one piece on 00–99 at or under it; below 0 with
// §3.7 off is nothing; and a column that prints no BSHC at all does concussion only (D47),
// which is every column of a blast grenade and the outer rings of many frag grenades. Which
// columns a round prints is its own business: the Grenades table prints a contact column and
// the Explosive Weapons table does not (D49). A throw is capped at the grenade's printed
// Range (D50). §3.7's shift, when it is on, moves by that person's Target Size ALM,
// not by Auto WTH. Each piece is its own Table 6A impact. The book's other method — one
// location, Physical Damage times the piece count — is named and refused. Concussion is
// Base Concussion times the Table 5B modifiers, rounded to the nearest PD. Behind Solid
// Cover is no shrapnel, and the table's modifier there is 0.
//
// A fuse printed as a number of phases schedules detonation at currentPhase + fusePhases.
// Positions are read again when the fuse expires. §2.11's basic scatter (Table 2A, and the
// cap at one third of the range) and Table 3D are not this path. phoenix-functions
// `explosiveFire` rolls a separate blast at every radius and is not used.

import { legacyFirearm as t } from '../data/legacy-firearm.mjs';
import { autoHitChance_5A } from '../data/automatic.mjs';
import { grenadeAim_4H, blastModifiers_5B, shotScatter_5C, explosiveTableSource } from '../data/explosive-tables.mjs';
import { grenadeSource } from '../data/grenades.mjs';
import { launcherSource } from '../data/launchers.mjs';
import { movementSpeedRow, resolveImpact, InputError, EAL_FLOOR, attackSource } from './attacks.mjs';
import { coverSituation } from './cover.mjs';
import { firearmLocationRow } from './called-shot.mjs';
import { asCube, cube, cubeDistance, cubeRound } from './hex-cube.mjs';

const step = (label, value) => ({ label, value });
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
const BURST_RANGES = Object.freeze([0, 1, 2, 3, 5, 10]);
const NEIGHBORS = Object.freeze([[1, -1, 0], [1, 0, -1], [0, 1, -1], [-1, 1, 0], [-1, 0, 1], [0, -1, 1]]);

export const explosiveRulesSource = `${attackSource} ${explosiveTableSource.book} Tables ${explosiveTableSource.tables.join(', ')} PDF ${explosiveTableSource.pdfPages.join(', ')}. ${grenadeSource.table} PDF ${grenadeSource.pdfPage}. ${launcherSource.table} PDF ${launcherSource.pdfPages.join(', ')}.`;

function numeric(value, name, min = -Infinity, max = Infinity, integer = false) {
  if (typeof value !== 'number' || !Number.isFinite(value) || (integer && !Number.isSafeInteger(value)) || value < min || value > max) {
    throw new InputError(name, `${name} is out of range.`);
  }
  return value;
}

function singleShotOdds(eal) {
  const row = t.oddsOfHitting_4G.find(r => r.EAL === eal);
  if (!row) throw new InputError('eal', `Table 4G has no line for EAL ${eal}.`);
  return row['Single Shot'];
}

function rangeAlm(hexes) {
  numeric(hexes, 'Range', Number.MIN_VALUE, 1500);
  return rangeALM(hexes);
}

function motion(hexes, shooterSpeed, targetSpeed) {
  const column = movementRangeColumn(hexes);
  const one = speed => {
    numeric(speed, 'Speed in PCCS hexes per phase', 0);
    return speed === 0 ? 0 : movementSpeedRow(speed, t.movementModifiers_4D)[column];
  };
  return clamp(one(shooterSpeed) + one(targetSpeed), -10, 0);
}

function visibilityMod(names) {
  if (!Array.isArray(names) || !names.length) throw new InputError('visibility', 'Choose visibility.');
  return names.reduce((sum, name) => {
    const row = t.visibilityModifiers_4C.find(entry => entry.Visibility === name);
    if (!row) throw new InputError('visibility', `Table 4C has no row "${name}".`);
    return sum + row.ALM;
  }, 0);
}

function situationMod(names) {
  const situations = names ?? [];
  if (!Array.isArray(situations)) throw new InputError('situations', 'Supply the situational modifiers (an empty list means none).');
  return situations.reduce((sum, name) => {
    const row = t.situationAndStanceModifiers_4B.find(entry => entry.Situation === name);
    if (!row) throw new InputError('situations', `Table 4B has no row "${name}".`);
    return sum + row.ALM;
  }, 0);
}

export function explosivePreviewInput(input) {
  if (input.shrapnelCombined !== false) {
    throw new InputError('shrapnel', 'The section also lets every piece of shrapnel share one location and multiply its Physical Damage. That shortcut is not the play path. Pass shrapnelCombined: false so each piece is its own impact.');
  }
  if (typeof input.applyTargetSize !== 'boolean') throw new InputError('applyTargetSize', 'Say whether §3.7 adjusts the Base Shrapnel Hit Chance. It is optional, and leaving it unstated is not a choice.');
  const skill = numeric(input.skill, 'Gun skill', 0, 20, true);
  const sal = t.skillAccuracy_1C.find(row => row['Skill Level'] === skill)?.SAL;
  if (sal == null) throw new InputError('skill', `Table 1C has no SAL for skill ${skill}.`);
  const hexes = numeric(input.distanceHexes, 'Range', 1, 1500, true);
  const size = targetSizeAlm(input.targetSize);
  const visibility = visibilityMod(input.visibility);
  const movement = motion(hexes, input.shooterSpeed ?? 0, input.targetSpeed ?? 0);
  const situations = situationMod(input.situations);
  return { sal, hexes, size, visibility, movement, situations };
}

export function loadExplosiveAmmo(input) {
  const mode = input.weapon?.system?.firearmModes?.[input.modeId];
  const ammo = mode?.ammunition?.[input.ammunitionKey];
  if (!ammo?.burst || !Object.keys(ammo.burst).length) throw new InputError('ammunition', 'This ammunition has no explosion columns.');
  return { mode, ammo };
}

function loadThrownGrenade(input) {
  const loaded = loadExplosiveAmmo(input);
  if (!Number.isSafeInteger(loaded.mode.armTimeActions) || loaded.mode.armTimeActions < 1) {
    throw new InputError('arm', 'A grenade needs its printed Arm Time. A demolition charge prints "V" for its Arm Time; state the one this rigging uses before throwing it.');
  }
  return loaded;
}

// §3.6's Range is how far the grenade goes, in 2-yard hexes, from a kneeling stance. The
// book prints no figure for any other stance, so a throw past the printed Range is refused
// rather than priced (D50). A grenade whose Range was never recorded is refused by name.
export function throwRange(mode, hexes) {
  numeric(hexes, 'Throw range', 1, 1500, true);
  const range = mode.throwRangeHexes;
  if (!Number.isSafeInteger(range) || range < 1) {
    throw new InputError('range', 'This grenade has no printed throw Range recorded, so how far it can be thrown is unknown.');
  }
  if (hexes > range) {
    throw new InputError('range', `This grenade is thrown ${range} hexes and the target hex is ${hexes} away.`);
  }
  return range;
}

function loadLaunchedRound(input) {
  const loaded = loadExplosiveAmmo(input);
  if (loaded.ammo.fusePhases != null) {
    throw new InputError('fuse', 'A launcher round detonates on impact. A timed fuse belongs on a thrown grenade.');
  }
  const aim = loaded.mode.aimModifiers?.[input.aimActions];
  if (typeof aim !== 'number' || !Number.isFinite(aim)) {
    throw new InputError('aim', 'Choose a supported whole-action aim time from this launcher.');
  }
  return loaded;
}

export function grenadeAimAlm(actions) {
  const row = grenadeAim_4H.find(entry => entry.actions === actions);
  if (!row) throw new InputError('aim', 'Grenade aim is 1, 2, 3, 4, 6 or 8 actions. Other amounts are not on Table 4H.');
  return row.alm;
}

export function targetSizeAlm(which) {
  if (which === 'hex') return 12;
  if (which === 'elevated-hex') return 15;
  throw new InputError('targetSize', 'An explosive round is aimed at a hex (+12), or at a hex from a highly elevated position (+15).');
}

export function previewThrownGrenade(input) {
  const { mode } = loadThrownGrenade(input);
  const { sal, hexes, size, visibility, movement, situations } = explosivePreviewInput(input);
  const range = throwRange(mode, hexes);
  const aim = grenadeAimAlm(input.aimActions);
  const rawEal = sal + aim + rangeAlm(hexes) + size + visibility + movement + situations;
  const eal = clamp(rawEal, EAL_FLOOR, 28);
  const threshold = singleShotOdds(eal);
  return {
    kind: 'grenade', eal, rawEal, threshold, armTime: mode.armTimeActions, throwRangeHexes: range, roundsFired: 1,
    source: explosiveRulesSource,
    trace: [
      step('SAL', sal), step('Range ALM', rangeAlm(hexes)), step('Aim (Table 4H)', aim),
      step('Throw range', `${hexes} of ${range} hexes`),
      step('Target size', size), step('Visibility', visibility), step('Movement', movement),
      step('Situation', situations),
      step('Raw EAL', rawEal), step('EAL', eal),
      step('Hit threshold (Single Shot, inclusive)', threshold)
    ]
  };
}

export function previewLaunchedGrenade(input) {
  const { mode } = loadLaunchedRound(input);
  const { sal, hexes, size, visibility, movement, situations } = explosivePreviewInput(input);
  const aim = mode.aimModifiers[input.aimActions];
  const rawEal = sal + aim + rangeAlm(hexes) + size + visibility + movement + situations;
  const eal = clamp(rawEal, EAL_FLOOR, 28);
  const threshold = singleShotOdds(eal);
  return {
    kind: 'launcher', eal, rawEal, threshold, armTime: null, roundsFired: 1,
    source: explosiveRulesSource,
    trace: [
      step('SAL', sal), step('Range ALM', rangeAlm(hexes)), step('Aim (weapon)', aim),
      step('Target size', size), step('Visibility', visibility), step('Movement', movement),
      step('Situation', situations),
      step('Raw EAL', rawEal), step('EAL', eal),
      step('Hit threshold (Single Shot, inclusive)', threshold)
    ]
  };
}

// `column` is the Table 4G column the roll was made on. A single round reads Single Shot; a
// burst of grenades reads Burst Elevation and measures its miss the same way (D-ruling in
// grenade-burst.mjs).
export function scatterGap(eal, hitRoll, column = 'Single Shot') {
  numeric(hitRoll, 'Hit roll', 0, 99, true);
  const line = t.oddsOfHitting_4G.find(r => r.EAL === eal);
  if (!line) throw new InputError('eal', `Table 4G has no line for EAL ${eal}.`);
  const odds = line[column];
  if (hitRoll <= odds) return { hit: true, difference: 0, hexes: 0 };
  const higher = t.oddsOfHitting_4G
    .filter(row => row[column] > hitRoll)
    .sort((a, b) => a[column] - b[column] || a.EAL - b.EAL);
  const row = higher[0] ?? t.oddsOfHitting_4G.reduce((best, candidate) => candidate[column] > best[column] ? candidate : best);
  if (row[column] < hitRoll) throw new InputError('scatter', `No Table 4G odds are greater than ${hitRoll}.`);
  const difference = row.EAL - eal;
  // Table 5C's last printed line is a difference of 28 (25 hexes). A larger one, which only a
  // very low EAL can produce, reads that line (reading, 28 September 2026).
  const band = shotScatter_5C.find(entry => difference >= entry.from && difference <= entry.to)
    ?? (difference > shotScatter_5C.at(-1).to ? shotScatter_5C.at(-1) : null);
  if (!band) throw new InputError('scatter', `Table 5C has no row for an EAL difference of ${difference}.`);
  return { hit: false, difference, hexes: band.hexes, odds: row[column], comparedEal: row.EAL };
}

export function detonationHex({ shooter, target, hexes, direction = null, neighbor = null }) {
  const from = asCube(shooter), via = asCube(target);
  if (hexes === 0) return via;
  if (cubeDistance(from, via) < 1) throw new InputError('scatter', 'The round was aimed at the shooter\'s own hex, so a miss has no line to travel.');
  if (hexes === 1) {
    numeric(neighbor, 'Neighbour', 1, 6, true);
    const [q, r, s] = NEIGHBORS[neighbor - 1];
    return cube(via.q + q, via.r + r, via.s + s);
  }
  numeric(direction, 'Long or short', 0, 9, true);
  const signed = direction <= 4 ? -hexes : hexes;
  const n = cubeDistance(from, via);
  const scale = (n + signed) / n;
  return cubeRound({
    q: from.q + (via.q - from.q) * scale,
    r: from.r + (via.r - from.r) * scale,
    s: from.s + (via.s - from.s) * scale
  });
}

// The distance columns a round prints: LEG10200's are 0, 1, 2, 3, 5 and 10 hexes; the WWII
// supplement's grenades print 0-8, 10, 12, 14, 16, 20, 25, 30 and 40. Read from the round.
export function burstRanges(ammo) {
  const printed = Object.keys(ammo?.burst ?? {}).filter(key => key !== 'C').map(Number).filter(Number.isFinite).sort((a, b) => a - b);
  return printed.length ? printed : BURST_RANGES;
}

export function burstColumn(distanceHexes, contact = false, ammo = null) {
  numeric(distanceHexes, 'Distance from the blast', 0, 10000, true);
  if (contact) {
    if (distanceHexes !== 0) throw new InputError('contact', 'Contact is the round touching the person, which is his own hex.');
    return 'C';
  }
  const ranges = burstRanges(ammo);
  if (distanceHexes > ranges.at(-1)) return null;
  return [...ranges].reverse().find(range => range <= distanceHexes);
}

// The Grenades table prints a contact column and the Explosive Weapons table does not (D49),
// so which columns exist is a property of the round, not of the section. Every path that
// reads one goes through here, so a round that has no column for a range is refused by name
// rather than reaching the shrapnel rules as `undefined`.
export function burstCell(ammo, columnKey) {
  const cell = ammo?.burst?.[String(columnKey)];
  if (!cell) {
    throw new InputError('burst', columnKey === 'C'
      ? 'This round has no column for C. The Explosive Weapons table prints no contact column, so a launched round touching a man cannot be resolved against one.'
      : `This round has no column for ${columnKey}.`);
  }
  return cell;
}

// §3.6 makes the BSHC the chance of being hit by shrapnel, so a column that prints none
// throws none: a blast grenade at any range, and a frag grenade at the ranges past where
// its pieces still carry. That is a blank cell, and a blank is not a zero - a printed 0 is
// still hit on a roll of 00 and §3.7 can still shift it (D47).
function printedShrapnel(column) {
  if (column.shrapnelRounds != null && column.shrapnelChance != null) throw new InputError('bshc', 'A burst column prints a shrapnel count or a percentage, not both.');
  if (column.shrapnelRounds != null) return { starred: true, rounds: column.shrapnelRounds };
  if (column.shrapnelChance != null) return { starred: false, chance: column.shrapnelChance };
  return null;
}

function shrapnelLabel(printed) {
  return printed.starred ? `*${printed.rounds}` : String(printed.chance);
}

export function shrapnelHitCount({ column, applyTargetSize, targetSizeAlm: size = null }) {
  const printed = printedShrapnel(column);
  if (typeof applyTargetSize !== 'boolean') throw new InputError('applyTargetSize', 'Say whether §3.7 adjusts the Base Shrapnel Hit Chance.');
  if (printed === null) {
    return { kind: 'none', rounds: 0, detail: 'The page prints no Base Shrapnel Hit Chance here, so the explosion does concussion only.' };
  }
  if (!applyTargetSize) {
    if (printed.starred) return { kind: 'rounds', rounds: printed.rounds, detail: `BSHC *${printed.rounds}: ${printed.rounds} piece${printed.rounds === 1 ? '' : 's'} hit, no roll.` };
    if (printed.chance < 0) return { kind: 'none', rounds: 0, detail: 'The BSHC is below 0 and §3.7 is off, so no shrapnel can hit.' };
    return { kind: 'chance', chance: printed.chance, detail: `BSHC ${printed.chance}: one piece on a 00–99 roll of ${printed.chance} or less.` };
  }
  if (!Number.isSafeInteger(size)) throw new InputError('targetSize', '§3.7 needs this person\'s Target Size ALM.');
  const start = autoHitChance_5A.find(row => printed.starred
    ? row.pellet?.rounds === printed.rounds && row.pellet.chance === undefined
    : row.pellet?.chance === printed.chance && row.pellet.rounds === undefined);
  if (!start) throw new InputError('bshc', `§3.7 cannot shift a BSHC of ${shrapnelLabel(printed)}, because Table 5A's shrapnel column does not print it. Leave the shift off to use the weapon's own number.`);
  const row = autoHitChance_5A.find(entry => entry.index === start.index + size);
  if (!row) throw new InputError('targetSize', `Table 5A has no shrapnel line at index ${start.index + size}.`);
  if (row.pellet == null) return { kind: 'none', rounds: 0, detail: `Target Size ALM ${size}. The shifted shrapnel cell is blank, so nothing hits.` };
  if (row.pellet.rounds !== undefined) return { kind: 'rounds', rounds: row.pellet.rounds, detail: `Target Size ALM ${size}. BSHC ${shrapnelLabel(printed)} shifts to *${row.pellet.rounds}.` };
  return { kind: 'chance', chance: row.pellet.chance, detail: `Target Size ALM ${size}. BSHC ${shrapnelLabel(printed)} shifts to ${row.pellet.chance}.` };
}

function modifierProduct(names) {
  if (!Array.isArray(names) || !names.length) throw new InputError('blast', 'Name the Table 5B condition. In the Open is a choice, and leaving it unstated is not one.');
  const factors = names.map(name => {
    const row = blastModifiers_5B.find(entry => entry.name === name);
    if (!row) throw new InputError('blast', `Table 5B has no row "${name}".`);
    return row;
  });
  return { product: factors.reduce((product, row) => product * row.modifier, 1), names: factors.map(row => row.name) };
}

// Shrapnel strikes a man on the open Hit Location column, as resolveDetonation reads it.
export function shrapnelLocationName(roll) {
  return firearmLocationRow(coverSituation({ penetration: 0, cover: null }), roll).row['Hit Location'];
}

export function concussionPd(base, names) {
  const { product } = modifierProduct(names);
  return Math.round(base * product);
}

function peopleInBlast(input, detonation, ammo = null) {
  if (!Array.isArray(input.people)) throw new InputError('people', 'Name the people who might be in the blast.');
  return input.people.map(person => {
    const hex = asCube(person.cube);
    return { ...person, distanceHexes: cubeDistance(detonation, hex) };
  }).filter(person => burstColumn(person.distanceHexes, person.contact === true, ammo) !== null);
}

function personRolls(person, supplied) {
  const found = (supplied ?? []).find(row => row.id === person.id);
  if (!found) throw new InputError('shrapnel', `${person.name ?? person.id} is in the blast and has no shrapnel roll.`);
  return found;
}

export function resolveDetonation(input, detonation, rolls, { preview, gap, ammo }) {
  const inside = peopleInBlast(input, detonation, ammo);
  const targets = inside.map(person => {
    const columnKey = burstColumn(person.distanceHexes, person.contact === true, ammo);
    const column = burstCell(ammo, columnKey);
    const solid = (person.blastModifiers ?? []).includes('Behind Solid Cover');
    const { product, names } = modifierProduct(person.blastModifiers);
    const concussion = Math.round(column.baseConcussion * product);
    if (solid) {
      return {
        id: person.id, name: person.name ?? person.id, distanceHexes: person.distanceHexes, column: columnKey,
        shrapnel: 0, hit: false, impacts: [], concussion, blastModifier: product, blastNames: names,
        physicalDamage: concussion, shockPhysicalDamage: 0,
        detail: 'Behind solid cover: no shrapnel.'
      };
    }
    const chance = shrapnelHitCount({ column, applyTargetSize: input.applyTargetSize, targetSizeAlm: person.targetSizeAlm ?? null });
    const recorded = personRolls(person, rolls.occupants);
    let pieces = 0;
    if (chance.kind === 'rounds') pieces = chance.rounds;
    else if (chance.kind === 'chance') {
      numeric(recorded.shrapnel, 'Shrapnel roll', 0, 99, true);
      pieces = recorded.shrapnel <= chance.chance ? 1 : 0;
    }
    const locations = recorded.locations ?? [];
    if (locations.length !== pieces) throw new InputError('shrapnel', `${person.name ?? person.id} is hit by ${pieces} piece${pieces === 1 ? '' : 's'} and ${locations.length} location roll${locations.length === 1 ? ' was' : 's were'} supplied.`);
    const cover = coverSituation({ penetration: column.penetration, cover: null });
    const impacts = locations.map(roll => resolveImpact({
      band: { penetration: column.penetration, damageClass: column.damageClass },
      cover, armorPF: roll.armorPF
    }, roll));
    const shrapnelPd = impacts.reduce((sum, impact) => sum + impact.physicalDamage, 0);
    const shock = impacts.reduce((sum, impact) => sum + impact.shockPhysicalDamage, 0);
    return {
      id: person.id, name: person.name ?? person.id, distanceHexes: person.distanceHexes, column: columnKey,
      shrapnel: pieces, hit: pieces > 0, impacts, concussion, blastModifier: product, blastNames: names,
      physicalDamage: shrapnelPd + concussion, shockPhysicalDamage: shock, detail: chance.detail
    };
  });
  return {
    ...preview, hit: gap.hit, scatter: gap, detonation, roundsFired: 1, targets,
    rolls: structuredClone(rolls),
    trace: [...preview.trace,
      step('Placement', gap.hit ? 'hit the aimed hex' : `missed by ${gap.hexes} hex${gap.hexes === 1 ? '' : 'es'} (EAL difference ${gap.difference})`),
      step('Detonation', `${detonation.q},${detonation.r},${detonation.s}`),
      ...targets.map(target => step(target.name, `${target.detail} Concussion ${target.concussion} PD (${target.blastNames.join(' × ')}).`))]
  };
}

function resolveExplosivePlacement(input, preview, rolls, ammo, { allowSchedule = false } = {}) {
  const gap = scatterGap(preview.eal, rolls.hit);
  const detonation = detonationHex({
    shooter: input.shooterCube, target: input.targetCube, hexes: gap.hexes,
    direction: rolls.direction ?? null, neighbor: rolls.neighbor ?? null
  });
  if (allowSchedule && ammo.fusePhases != null) {
    const currentPhase = numeric(input.currentPhase, 'Current phase', 1, 100000, true);
    const duePhase = currentPhase + ammo.fusePhases;
    return {
      ...preview, hit: gap.hit, scatter: gap, detonation, scheduled: true,
      fusePhases: ammo.fusePhases, duePhase,
      roundsFired: 1, targets: [],
      rolls: structuredClone(rolls),
      trace: [...preview.trace,
        step('Throw', gap.hit ? 'hit the aimed hex' : `missed by ${gap.hexes} hex${gap.hexes === 1 ? '' : 'es'} (EAL difference ${gap.difference})`),
        step('Fuse', `${ammo.fusePhases} phase${ammo.fusePhases === 1 ? '' : 's'} — detonation scheduled for phase ${duePhase}`),
        step('Landing hex', `${detonation.q},${detonation.r},${detonation.s}`)]
    };
  }
  return resolveDetonation(input, detonation, rolls, { preview, gap, ammo });
}

export function resolveThrownGrenade(input, rolls) {
  const preview = previewThrownGrenade(input);
  const { ammo } = loadThrownGrenade(input);
  return resolveExplosivePlacement(input, preview, rolls, ammo, { allowSchedule: true });
}

export function resolveLaunchedGrenade(input, rolls) {
  const preview = previewLaunchedGrenade(input);
  const { ammo } = loadLaunchedRound(input);
  return resolveExplosivePlacement(input, preview, rolls, ammo);
}

// A timed fuse expiring. The landing hex and hit roll come from the throw; the input is
// the situation read when the fuse expires, carrying the thrown grenade's frozen profile.
export function resolveDueDetonation(input, detonation, rolls) {
  const preview = previewThrownGrenade(input);
  const { ammo } = loadThrownGrenade(input);
  if (ammo.fusePhases == null) throw new InputError('fuse', 'An impact-fused grenade detonates when it lands, not later.');
  const gap = scatterGap(preview.eal, rolls.hit);
  return { ...resolveDetonation(input, detonation, rolls, { preview, gap, ammo }), kind: 'detonation' };
}

export function duePhase(currentPhase, fusePhases) {
  numeric(currentPhase, 'Current phase', 1, 100000, true);
  numeric(fusePhases, 'Fuse length', 1, 1000, true);
  return currentPhase + fusePhases;
}
