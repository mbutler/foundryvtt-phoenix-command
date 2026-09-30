import {movementRangeColumn} from './movement.mjs';
import {calledShotCover,firearmLocationRow} from './called-shot.mjs';
import {rangeALM} from './range.mjs';
import {aimRowKey} from './second-shot.mjs';
import { legacyFirearm as t } from '../data/legacy-firearm.mjs';
import { cuttingThresholds, cuttingLocations, meleeSource } from '../data/melee-cutting.mjs';
import { defenseCharts } from '../data/melee-odds.mjs';
import { stabbingLocations, stabbingThresholds, stabbingSource } from '../data/melee-stabbing.mjs';
import { flangeLocations, flangeThresholds, flangeSource } from '../data/melee-flange.mjs';
import { bluntLocations, bluntThresholds, bluntSource } from '../data/melee-blunt.mjs';
import { disablingThresholds, shockPoints, disablingSource } from '../data/disabling.mjs';
import { convertDistance, distanceInFeet } from './units.mjs';
import { coverSituation, coverAppliesToLocation, effectivePenetration as coverEpen, coverTargetSizeRows } from './cover.mjs';

export class InputError extends Error {
  constructor(field, message) { super(message); this.field = field; }
}
function numeric(value, field, min = -Infinity, max = Infinity, integer = false) {
  if (!Number.isFinite(value) || value < min || value > max || (integer && !Number.isInteger(value))) {
    throw new InputError(field, `${field}: supply ${integer ? 'an integer' : 'a number'} from ${min} to ${max}.`);
  }
  return value;
}
function roll(value, name, max = 99) { return numeric(value, name, 0, max, true); }
function lookup(table, key, column, value) {
  const row = table?.find(row => Array.isArray(row[key])
    ? value >= row[key][0] && value < row[key][1] : row[key] === value);
  if (!row || row[column] === undefined) throw new InputError(key, `No supported ${key} entry for ${value}.`);
  return row[column];
}
// User ruling, 2026-09-25: round ambiguous headings down; retain the first
// heading below the table minimum. Printed exceptions (such as 4A) stay separate.
function lowerHeading(value, list) {
  const sorted = [...list].sort((a,b) => a-b);
  return sorted.filter(n => n <= value).at(-1) ?? sorted[0];
}
const clamp = (n, min, max) => Math.max(min, Math.min(max, n));
// Table 4G's lowest printed line (PDF 63). Below -2 no single shot can hit, and a burst's
// elevation odds reach 00 at -17 and are blank at -22.
export const EAL_FLOOR = -22;

// Table 4D's speed rows are .5, 1, 2, 3, 4, 10, 20 … 120, and a real speed usually falls
// between two of them - a running man is 5 or 6 hexes per phase. Ruled at this table: read
// the FIRST row equal to or greater than the actual speed, which is the convention §2.4
// states for this table's range axis. So speed 5 reads row 10, not row 4.
//
// A speed past the last printed row is out of the table's domain and is refused, not read as
// 120. The legacy port used to round down and to clamp anything above 110.
export function movementSpeedRow(speed, rows) {
  numeric(speed, 'Speed in PCCS hexes per phase', Number.MIN_VALUE);
  const row = rows.find(row => speed <= row['Speed HPI']);
  if (!row) throw new InputError('speed', `Speed ${speed} is past Table 4D's last printed row of ${rows.at(-1)['Speed HPI']}; the table is not extrapolated.`);
  return row;
}
const step = (label, value) => ({ label, value });

// The ballistic band a shot will use. Exported because §3.8 makes the round's PEN decide
// the target size, so a caller deriving a situation needs the band before it can build the
// input the preview would itself have read the band from.
export function firearmBand({ weapon, modeId, ammunitionKey, distance }, fireType = 'single') {
  const mode = weapon?.system?.firearmModes?.[modeId];
  if (!mode?.fireTypes.includes(fireType)) throw new InputError('mode', `Select a supported ${fireType === 'automatic' ? 'fully automatic' : 'single-shot'} firearm mode.`);
  const bands = Object.values(mode.ammunition[ammunitionKey]?.ranges ?? {});
  if (!bands.length) throw new InputError('ammunition', 'No data for this weapon and ammunition.');
  const feet = distanceInFeet(distance);
  if (feet > Math.max(...bands.map(b => b.distanceFeet))) throw new InputError('range', 'Beyond this weapon’s available ballistic data; no long-range extrapolation.');
  const band = bands.find(b => b.distanceFeet === lowerHeading(feet, bands.map(b => b.distanceFeet)));
  numeric(band.penetration, 'PEN', 0); numeric(band.damageClass, 'DC', 1, 10, true);
  return band;
}

// The ALM chain both a single shot and a burst are built from. §3.4 says an "Automatic weapon
// EAL is identical to an EAL for single shot fire except the Automatic Elevation Target Size
// Modifier (Auto ELE) is used instead of the normal Target Size ALM", so the two differ in
// exactly one column of Table 4E and nothing else. `sizeColumn` is that column.
export function accuracyChain(input, { fireType = 'single', sizeColumn = 'Target Size' } = {}) {
  const { weapon, modeId, aimActions, targetSize, visibility, situations } = input;
  const mode = weapon?.system?.firearmModes?.[modeId];
  if (!mode?.fireTypes.includes(fireType)) throw new InputError('mode', `Select a supported ${fireType === 'automatic' ? 'fully automatic' : 'single-shot'} firearm mode.`);
  const skill = numeric(input.skill, 'Gun skill', 0, 20, true);
  const sal = lookup(t.skillAccuracy_1C, 'Skill Level', 'SAL', skill);
  const range = convertDistance(input.distance, 'pccsHex');
  // Scene shots require positive distance.
  numeric(range, 'Range', Number.MIN_VALUE, 1500);
  // §5.8 and §5.9 (optional): a second shot into the same hex, or one into a pinned hex, reads
  // the aim row an action further each.
  const aimBonuses = [input.secondShotAim ? 'second shot, §5.8' : null, input.pinnedAim ? 'pinned hex, §5.9' : null].filter(Boolean);
  const aimKey = aimRowKey(mode.aimModifiers, aimActions, (input.secondShotAim ?? 0) + (input.pinnedAim ?? 0));
  const aim = mode.aimModifiers[aimKey];
  numeric(aim, 'Weapon aim modifier');
  const rangeMod = rangeALM(range);
  const movementRange = movementRangeColumn(range);
  const movement = speed => {
    numeric(speed, 'Speed in PCCS hexes per phase', 0);
    return speed === 0 ? 0 : movementSpeedRow(speed, t.movementModifiers_4D)[movementRange];
  };
  const movementMod = clamp(movement(input.shooterSpeed) + movement(input.targetSpeed), -10, 0);
  // The ballistic band is read before the target size, because §3.8 decides both the target
  // size and the hit-location column from the round's PEN against the cover's PF, and the
  // PEN is a property of the band.
  const band = firearmBand(input, fireType);
  let cover;
  try { cover = coverSituation({ penetration: band.penetration, cover: input.cover }); }
  catch (error) { throw new InputError('cover', error.message); }
  // §3.8: cover the round goes straight through does not shrink the target - "the entire
  // target area, both visible and hidden, is used for the Target Size ALM". So the two
  // cover rows of Table 4E are refused rather than quietly swapped, because the caller may
  // have chosen the cover, the stance or the ammunition in error and only he knows which.
  if (!input.coverFire && coverTargetSizeRows.includes(targetSize)) {
    if (!cover.behindCover) throw new InputError('targetSize', `Target size "${targetSize}" describes a man behind cover, but no cover was stated.`);
    if (!cover.blocking) throw new InputError('targetSize', `\u00a73.8: PEN ${band.penetration} goes through this cover (PF ${cover.coverPF}), so the whole target area is used for the Target Size ALM, not "${targetSize}".`);
  }
  // §5.10 Cover Fire (optional): "Cover Fire is aimed at a hex, or hexes, and assumes a Target
  // Size of +10", whoever is or is not standing there.
  const sizeMod = input.coverFire ? 10 : lookup(t.standardTargetSizeModifiers_4E, 'Position', sizeColumn, targetSize);
  if (!Array.isArray(visibility) || !visibility.length) throw new InputError('visibility', 'Choose visibility.');
  if (!Array.isArray(situations)) throw new InputError('situations', 'Supply the situational modifiers (an empty list means none).');
  const visibilityMod = visibility.reduce((sum, name) => sum + lookup(t.visibilityModifiers_4C, 'Visibility', 'ALM', name), 0);
  const situationMod = situations.reduce((sum, name) => sum + lookup(t.situationAndStanceModifiers_4B, 'Situation', 'ALM', name), 0);
  const reaction=input.reactions;
  if(reaction&&(typeof reaction.shooterDucking!=='boolean'||typeof reaction.targetDucking!=='boolean'))throw new InputError('reactions','Ducking states must be explicit booleans.');
  const duckShooter=reaction?.shooterDucking?-10:0,duckTarget=reaction?.targetDucking?-5:0;
  const rawEal = duckShooter + duckTarget + sal + aim + rangeMod + movementMod + sizeMod + visibilityMod + situationMod;
  return { mode, band, cover, rawEal, eal: clamp(rawEal, EAL_FLOOR, 28), sizeMod,
    trace: [step('SAL',sal),step(aimKey!==aimActions?`Aim (${aimActions} AC + ${aimBonuses.map(b=>`1 ${b}`).join(' + ')})`:'Aim',aim),step('Range ALM',rangeMod),step('Movement',movementMod),
      ...(reaction?[step('Ducking shooter (§2.5)',duckShooter),step('Ducking target (§2.5)',duckTarget)]:[]),
      step(input.coverFire ? 'Target size (cover fire at a hex, §5.10)' : sizeColumn === 'Auto Elev' ? 'Target size (Auto ELE, §3.4)' : 'Target size',sizeMod),
      step('Visibility',visibilityMod),step('Situation',situationMod)] };
}

export const attackSource = `LEG10200 Table 4A and Table 4G, PDF 63. Disabling injury shading from ${disablingSource.book} Table 6A, PDF ${disablingSource.pdfPages.join(' and ')}.`;

export function previewFirearm(input) {
  // SAB is the weapon's Sustained Automatic Burst value. §3.4 uses it in exactly one place -
  // the elevation EAL of a burst that FOLLOWS another burst - and nothing in the book applies
  // it to a single shot. It used to be an adjudicated field subtracted from every shot's EAL,
  // which let an unprinted modifier depress the commonest shot in the game. A stored shot
  // that carries one is refused rather than resolved without it, because the odds it was
  // rolled against are not the odds this code would now produce.
  if (input.sab) throw new InputError('sab', '§3.4 applies SAB only to a sustained burst, never to a single shot. This shot was planned against an EAL reduced by SAB; replan it.');
  const chain = accuracyChain(input);
  const { band, rawEal, eal } = chain;
  const cover = calledShotCover(chain.cover,input.targetSize);
  const threshold = lookup(t.oddsOfHitting_4G, 'EAL', 'Single Shot', eal);
  return {
    kind: 'firearm', eal, threshold, band: structuredClone(band), cover, source: attackSource,
    trace: [...chain.trace,
      step('Raw EAL',rawEal),step('EAL',eal),step('Hit threshold (inclusive, d00–99)',threshold),step('Ballistic band (feet)',band.distanceFeet),
      ...(cover.behindCover?[step(`Cover (${cover.coverLabel ?? 'unnamed'}) PF`,cover.coverPF),step('Cover blocks this round',cover.blocking?'yes':'no · §3.8 nonblocking')]:[])]
  };
}

// A shooter's own estimate before he commits. He sees how much of the man shows, but not
// what the cover is made of, so the target size he perceives replaces the one §3.8 would
// read from the cover's Protection Factor. Everything else is the ordinary chain, read with
// the target in the open and its size swapped. Resolution still uses the true inputs.
export function estimateSingleShot(input, perceivedTargetSize) {
  const chain = accuracyChain({ ...input, cover: null });
  const perceived = lookup(t.standardTargetSizeModifiers_4E, 'Position', 'Target Size', perceivedTargetSize);
  const eal = clamp(chain.rawEal - chain.sizeMod + perceived, EAL_FLOOR, 28);
  const threshold = lookup(t.oddsOfHitting_4G, 'EAL', 'Single Shot', eal);
  return { eal, threshold, chance: threshold + 1 };
}

// What one round that has already hit does: where it struck, what the armour and the cover
// took out of it, and what Table 6A prints in the resulting cell. Split out of
// `resolveFirearm` because a burst puts several rounds into the same man and each of them is
// this same question asked again with its own dice. `armorPF` is the confirmed Protection
// Factor at whatever location comes up, so it is supplied per round rather than per attack.
export function resolveImpact({ band, cover, armorPF }, rolls) {
  // Key 6B shortens the die for a man who is only looking over cover: 00-22 on the Fire
  // column is his head and nothing else. Rolling 00-99 for him and reading it as usual
  // would put rounds in an elbow he is not showing, so the roll is checked, not clamped.
  const locationRoll = roll(rolls.location, 'Location roll', cover.rollMax);
  const column = cover.column;
  const {row:locationRow,specificLocation} = firearmLocationRow(cover,locationRoll);
  if (!locationRow) throw new InputError('location', `No Table 6A ${column} entry for ${locationRoll}.`);
  const location = locationRow['Hit Location'];
  const pf = numeric(armorPF, 'Armor PF at struck location', 0, 200);
  // Confirmed PF applies to the rolled location; no automatic coverage assumption.
  const armorRoll = roll(rolls.armor, 'Armor roll', 9);
  const snappedPF = lowerHeading(pf, t.effectiveArmorProtectionFactor_6D.map(row => row.PF));
  const epf = lookup(t.effectiveArmorProtectionFactor_6D, 'PF', String(armorRoll), snappedPF);
  // §3.8: EPEN = weapon PEN - cover PF - EPF, and the cover term is there only when the
  // round actually came through the cover. A location in the top part of Table 6A is one he
  // exposes over it, so that round never touched the cover at all.
  const throughCover = coverAppliesToLocation({ behindCover: cover.behindCover, row: locationRow });
  const penetrationParts = coverEpen({ penetration: band.penetration, coverPF: cover.coverPF, epf, throughCover });
  const effectivePenetration = penetrationParts.epen;
  let dc = band.damageClass;
  if (effectivePenetration > 0 && effectivePenetration < epf) dc = 1;
  let damage = 0, epenColumn = null;
  if (effectivePenetration > 0) {
    const columns = dc === 1 ? [0.5,1,1.5,2,3,5,10] : dc <= 3 ? [1,1.5,2,2.5,3,5,10]
      : dc === 4 ? [1,2,2.5,3,5,10] : dc <= 7 ? [1,2,3,5,10] : [1,3,5,10];
    // §3.2 reads the greatest EPEN column not exceeding the hit's penetration.
    // Never round across a vital-organ or disabling threshold. Preserve the existing
    // minimum-column behavior for positive sub-table penetration (user ruling, 2026-09-25).
    epenColumn = columns.filter(value => value <= effectivePenetration).at(-1) ?? columns[0];
    damage = t.hitLocationDamage_6A[`DC ${dc}`].find(row=>row['Hit Location']===location)[epenColumn];
  }
  // §3.3, PDF 24: the wound disables when "the damage enters a shaded portion of Table 6A",
  // so the question is asked of the very cell the damage came from - not of the raw
  // penetration, which may have been snapped to a neighbouring column.
  const threshold = disablingThresholds[location]?.[dc] ?? null;
  const disabled = damage > 0 && threshold !== null && epenColumn >= threshold;
  // Table 6C: shock counts toward the Knockout Roll only, never the PD Total, and only in
  // the impulse it is inflicted.
  const shock = disabled ? shockPoints[location] ?? 0 : 0;
  return { location, physicalDamage: damage, disabled, shockPhysicalDamage: shock, dc,
    armorPF: pf, epf, effectivePenetration, epenColumn, throughCover, threshold,
    trace: [step('Hit location',location),...(specificLocation?[step('Table 5D location',specificLocation)]:[]),
      ...(cover.behindCover?[step('Struck through the cover',throughCover?`yes · cover PF ${cover.coverPF} subtracted`:'no · an exposed location, so the cover was not in the way')]:[]),
      step('Armor PF',pf),step('EPF',epf),step('Effective PEN',effectivePenetration),step('Damage class',dc),
      step('EPEN column read',epenColumn ?? 'no penetration'),step('Physical damage',damage),
      step('Disabling injury',disabled ? `yes · shaded from EPEN ${threshold} at DC ${dc}` : threshold === null ? 'this location is shaded nowhere' : `no · shaded from EPEN ${threshold} at DC ${dc}`),
      ...(shock ? [step('Shock PD (knockout only, this impulse)',shock)] : [])] };
}

export function resolveFirearm(input, rolls) {
  const result = previewFirearm(input);
  const hit = roll(rolls.hit, 'Hit roll') <= result.threshold;
  if (!hit) return { ...result, hit, physicalDamage: 0, disabled: false, shockPhysicalDamage: 0, rolls: { hit: rolls.hit } };
  const impact = resolveImpact({ band: result.band, cover: result.cover, armorPF: input.armorPF }, rolls);
  return { ...result, hit, location: impact.location, physicalDamage: impact.physicalDamage,
    disabled: impact.disabled, shockPhysicalDamage: impact.shockPhysicalDamage,
    rolls: structuredClone(rolls), trace: [...result.trace, ...impact.trace] };
}

export function playsMelee(attack) {
  try { return Boolean(meleeFamily(attack)); }
  catch (error) { if (error instanceof InputError) return false; throw error; }
}

export function meleeArmorFromCoverage(attack, coverage) {
  const family = attack ? meleeFamily(attack) : 'cutting';
  if (coverage?.meleeClass === 'I') {
    const bluntProtectionFactor = Number(coverage.bpf);
    if (!(bluntProtectionFactor >= 1)) throw new InputError('bluntProtectionFactor', 'Impenetrable armor needs its BPF.');
    return { armorClass: 'I', bluntProtectionFactor };
  }
  if (family === 'flange' || family === 'blunt') {
    if (coverage?.bpf == null || coverage.bpf === '') {
      if (!coverage || coverage.meleeClass === 'NO') return { armorClass: '0' };
      throw new InputError('armorClass', 'This armor has no BPF, which a flange or blunt blow reads.');
    }
    return { armorClass: String(coverage.bpf) };
  }
  // A recorded piece of armor with no melee Armor Class is not unarmored: LEG10204 §1.4 gives
  // every armor one, and reading NO would let a cut through a vest as if it were bare skin.
  if (coverage && coverage.meleeClass == null) throw new InputError('armorClass', `${coverage.material || 'This armor'} has no melee Armor Class recorded. Set it from LEG10204 §1.4 / Table 3A on the armor's coverage.`);
  return { armorClass: coverage?.meleeClass ?? 'NO' };
}

// §1.3 (PDF 11): the small points' special damage. Any other trait is still refused.
const meleeTraits = {
  'impact-x4': { impactModifier: 4, label: 'Damage modifier ×4 (Ice Pick, §1.3)' },
  'pd-quarter': { pdFraction: 4, label: '1/4 normal PD (Scissors, §1.3)' },
  'pd-tenth': { pdFraction: 10, label: '1/10 normal PD (§1.3)' },
  // Optional rules, each behind its world setting (input.optionalRules).
  chainsaw: { optional: 'chainsaws', label: '§5.7 Chainsaws' },
  whip: { optional: 'whips', label: '§5.9 Whips' },
  // Lance at Charge and the spears' Mounted Charge lines print no WS or WC: the GM states the
  // WC for each charge (user ruling, 26 Sep 2026).
  charge: { label: 'Charge' }
};
// §3.5 (PDF 23): the situational Damage Modifiers, multiplied into the ID with the stroke and the
// Damage Bonus. "Striking From Knees" and "Striking While Prone" each include Striking Up; the
// Closing Speed rows are one choice by hexes per impulse.
export const damageModifierTable = Object.freeze({
  strikingDown: { factor: 1.5, label: 'Striking down (from horseback, or at a kneeling or prone target)' },
  strikingUp: { factor: 0.8, label: 'Striking up (at a rider from foot, or to a higher elevation)' },
  fromKnees: { factor: 0.6, label: 'Striking from knees (includes striking up)' },
  prone: { factor: 0.4, label: 'Striking while prone (includes striking up)' },
  braced: { factor: 2.0, label: 'Solidly braced target' },
  grasp: { factor: 0.5, label: "Striking while in an opponent's grasp" },
  closing3: { factor: 1.5, label: 'Closing speed 3 hexes per impulse', closing: true },
  closing4to6: { factor: 2.0, label: 'Closing speed 4 to 6 hexes per impulse', closing: true },
  closing7to9: { factor: 3.0, label: 'Closing speed 7 to 9 hexes per impulse', closing: true },
  closing10to12: { factor: 4.0, label: 'Closing speed 10 to 12 hexes per impulse', closing: true },
  closing13to15: { factor: 5.0, label: 'Closing speed 13 to 15 hexes per impulse', closing: true }
});
function damageModifiers(ids, charge) {
  if (ids == null) return [];
  if (!Array.isArray(ids) || new Set(ids).size !== ids.length || ids.some(id => !Object.hasOwn(damageModifierTable, id))) throw new InputError('damageModifiers', 'Choose §3.5 damage modifiers from the printed list, each once.');
  const has = id => ids.includes(id);
  const level = ['strikingDown', 'strikingUp', 'fromKnees', 'prone'].filter(has);
  if (level.length > 1) throw new InputError('damageModifiers', 'Choose one of striking down, striking up, from the knees or prone: from the knees and prone already include striking up.');
  if (ids.filter(id => damageModifierTable[id].closing).length > 1) throw new InputError('damageModifiers', 'Choose one closing speed.');
  if (charge && ids.some(id => damageModifierTable[id].closing)) throw new InputError('damageModifiers', 'A charge line already includes the Closing Speed modifier (§3.5).');
  return ids.map(id => ({ id, ...damageModifierTable[id] }));
}

// The modifiers a strike's postures imply, as the review's starting choice (user ruling, 26 Sep
// 2026): an attacker prone or kneeling strikes from there; a standing attacker strikes down at
// a kneeling or prone target. Elevation, horseback, bracing, grasps and speed are the GM's.
export function postureDamageModifiers({ attackerPosture, targetPosture }) {
  if (attackerPosture === 'prone') return ['prone'];
  if (attackerPosture === 'kneeling') return ['fromKnees'];
  if (attackerPosture === 'standing' && (targetPosture === 'kneeling' || targetPosture === 'prone')) return ['strikingDown'];
  return [];
}

// §5.7: the Armor Adjustment a Chainsaw's Cutting Power loses; impenetrable armor cannot be cut.
export const chainsawArmorAdjustment = { NO: 0, LT: 4, ML: 8, BR: 10, PL: 12, I: Infinity };
// §5.8: a Surface Cut enters its table with the Damage Bonus less this; impenetrable is immune.
export const surfaceCutArmorAdjustment = { NO: 0, LT: 1, ML: 2, BR: 3, PL: 4, I: Infinity };

function meleeFamily(attack) {
  const unknown = (attack.traits ?? []).filter(trait => !Object.hasOwn(meleeTraits, trait));
  if (unknown.length) throw new InputError('attack', `Exceptional weapon traits are not transcribed: ${unknown.join(', ')}.`);
  if (attack.damageFamily === 'cutting' && attack.motion === 'slash') return 'cutting';
  if (attack.damageFamily === 'stabbing' && attack.motion === 'thrust') return 'stabbing';
  if (attack.damageFamily === 'flange' && (attack.motion === 'slash' || attack.motion === 'thrust')) return 'flange';
  if (attack.damageFamily === 'blunt' && (attack.motion === 'slash' || attack.motion === 'thrust')) return 'blunt';
  throw new InputError('attack', 'This attack is not a transcribed cutting slash, stab, flange blow or blunt blow.');
}

const meleeSources = { cutting: meleeSource, stabbing: stabbingSource, flange: flangeSource, blunt: bluntSource };
const meleeTables = { cutting: cuttingLocations, stabbing: stabbingLocations, flange: flangeLocations, blunt: bluntLocations };

// An ID equal to a repeated heading reads the left column. Blunt BPF 1 prints 3 twice.
function columnIndex(thresholds, impact) {
  let index = -1;
  for (let i = 0; i < thresholds.length; i++) {
    if (thresholds[i] < impact) index = i;
    else if (thresholds[i] === impact) return i;
    else break;
  }
  return index;
}

function struckRow(family, locationRoll) {
  const row = meleeTables[family].find(candidate => [candidate.left, candidate.right].some(range => range && locationRoll >= range[0] && locationRoll <= range[1]));
  if (!row) throw new InputError('location', family === 'blunt'
    ? `Location roll ${locationRoll} is not on the blunt table. Rolls 96–99 are not printed there.`
    : `No location for roll ${locationRoll}.`);
  return row;
}

export function previewMelee(input) {
  const mode = input.weapon?.system?.meleeModes?.[input.modeId];
  const attack = mode?.attacks?.[input.attackId];
  if (!mode || !attack) throw new InputError('mode', 'Select a melee attack.');
  const family = meleeFamily(attack);
  const skill = numeric(input.skill, 'Melee skill', 0, 20, true);
  // Table 3B gives each unarmed blow its own Weapon Class - a fist is +2 and a head butt -2 -
  // where a weapon has one for the whole mode, so an attack's own value wins when it has one.
  const traitNames = attack.traits ?? [];
  for (const name of traitNames) {
    const optional = meleeTraits[name].optional;
    if (optional && input.optionalRules?.[optional] !== true) throw new InputError('optionalRule', `${meleeTraits[name].label} is an optional rule; enable it in the world settings to strike with this weapon.`);
  }
  const charge = traitNames.includes('charge');
  if (charge && (attack.weaponClass ?? mode.weaponClass) === null && !Number.isSafeInteger(input.chargeWeaponClass)) throw new InputError('chargeWeaponClass', 'A charge prints no Weapon Class. State the WC for this charge.');
  const wc = numeric(charge && (attack.weaponClass ?? mode.weaponClass) === null ? input.chargeWeaponClass : attack.weaponClass ?? mode.weaponClass, 'Weapon class');
  const al = skill + wc;
  const chart = defenseCharts[input.defenderSkill];
  if (!chart) throw new InputError('defenderSkill', 'Defensive skill must be 0 through 20.');
  const parry = numeric(input.parryColumn, 'Parry column', 1, 9, true);
  const threshold = chart[al]?.[parry];
  if (threshold === undefined) throw new InputError('attackLevel', 'Attack level is outside the transcribed table.');
  const feet = distanceInFeet(input.distance);
  numeric(mode.reachMinFeet, 'Minimum reach', 0); numeric(mode.reachMaxFeet, 'Maximum reach', 0);
  // §1.2 Step 9: a "+" range can Tip Hit one hex beyond it (tipReachFeet), where a cutting blow
  // loses the constant from its Impact Damage. Thrusts and impact-head strikes lose nothing; no
  // transcribed weapon with a "+" range has an impact head, so every slash there is a cut.
  const tipHit = feet > mode.reachMaxFeet && mode.tipReachFeet != null && feet <= mode.tipReachFeet;
  if (feet < mode.reachMinFeet || (feet > mode.reachMaxFeet && !tipHit)) throw new InputError('reach', `Outside this weapon's reach (${mode.reachMinFeet}–${mode.reachMaxFeet} ft${mode.tipReachFeet != null ? `, Tip Hit at ${mode.tipReachFeet} ft` : ''}).`);
  const tipPenalty = tipHit && attack.motion === 'slash';
  const sets = numeric(input.sets, 'Completed sets', 0, 2, true);
  // The charge line's ID already carries the closing speed (§3.5), so no stroke is built on it.
  if (charge && sets !== 0) throw new InputError('sets', 'A charge is not thrown after sets; its ID already includes the closing speed.');
  // §5.7: a continued cut replaces recovery — the blade is still in contact. A charge is not an
  // ordinary stroke either. Ordinary recovery is still owed for every other blow.
  if (mode.preparation?.recoveryRequired && input.continuedCuttingPower == null && !charge) {
    throw new InputError('recovery', 'Recover before taking another ordinary strike.');
  }
  if (sets === 2 && input.stationary !== true) throw new InputError('stationary', 'A long stroke requires no movement during the second set or strike.');
  const bonus = numeric(input.damageBonus, 'Damage bonus', Number.MIN_VALUE);
  // Table 3B prints an unarmed impact as a RANGE, "0 - 1", which is stored as a die offset to
  // that range - so the constant can be negative here where a weapon's never is (D66).
  // "1d10 x 3" is Lance at Charge's "(10) x (3)": the die times three.
  const formula = /^(\d+)d(\d+)(?:\s*([+-])\s*(\d+))?(?:\s*x\s*(\d+))?$/.exec(attack.impactFormula);
  if (!formula || Number(formula[1]) !== 1 || Number(formula[2]) < 2) throw new InputError('formula', 'This slice supports one impact die plus an optional constant or multiple.');
  const dieMultiplier = formula[5] === undefined ? 1 : Number(formula[5]);
  const printedBonus = formula[4] === undefined ? 0 : Number(formula[4]) * (formula[3] === '-' ? -1 : 1);
  const dieBonus = tipPenalty ? 0 : printedBonus;
  const traits = (attack.traits ?? []).map(trait => meleeTraits[trait]);
  const situational = damageModifiers(input.damageModifiers, charge);
  const situationalFactor = situational.reduce((product, modifier) => product * modifier.factor, 1);
  const impactModifier = traits.reduce((product, trait) => product * (trait.impactModifier ?? 1), 1);
  const pdFraction = traits.find(trait => trait.pdFraction)?.pdFraction ?? 1;
  const special = traitNames.includes('chainsaw') ? 'chainsaw' : traitNames.includes('whip') ? 'whip' : null;
  // Neither a charge nor a continued cut is a short stroke: the charge line's ID carries its
  // closing speed and the continued cut rolls a new, normal ID (§5.7).
  const continuing = special === 'chainsaw' && input.continuedCuttingPower != null;
  if (continuing && sets !== 0) throw new InputError('sets', 'A continued cut is thrown after no sets; the blade is already in contact.');
  const stroke = charge || continuing ? 1 : [0.5,1,2][sets];
  if (special === 'chainsaw' && input.continuedCuttingPower != null && !(Number.isFinite(input.continuedCuttingPower) && input.continuedCuttingPower > 0)) throw new InputError('continuedCuttingPower', 'A continued cut needs the positive Cutting Power of the cut before it.');
  return { kind: 'melee', family, attackLevel: al, threshold, dieSides: Number(formula[2]), dieBonus, dieMultiplier, tipHit, pdFraction, special,
    ...(special === 'whip' ? { surfaceCutBonus: bonus } : {}),
    ...(special === 'chainsaw' && input.continuedCuttingPower != null ? { continuedCuttingPower: input.continuedCuttingPower } : {}),
    multiplier: stroke * bonus * impactModifier * situationalFactor, source: meleeSources[special === 'whip' ? 'blunt' : family],
    trace: [step('Attack level',al),step('Defender skill',input.defenderSkill),step('Parry column',parry),step('Hit threshold',threshold),
      ...(tipHit ? [step('Tip hit', tipPenalty && printedBonus ? `a cut at ${feet} ft: the die alone, without + ${printedBonus}` : `at ${feet} ft, no penalty`)] : []),
      ...(charge ? [step('Charge', `WC ${wc}${mode.weaponClass === null ? ' stated for this charge' : ''}; the ID includes the closing speed`)] : []),
      ...(special ? [step('Optional rule', meleeTraits[special].label)] : []),
      step('Stroke multiplier', charge ? '1 (a charge)' : continuing ? '1 (a continued cut)' : stroke),step('Damage bonus',bonus),
      ...traits.filter(trait => trait.impactModifier).map(trait => step('Damage modifier', trait.label)),
      ...situational.map(modifier => step('Damage modifier', `×${modifier.factor} ${modifier.label} (§3.5)`))] };
}

export function resolveMelee(input, rolls) {
  const result = resolveMeleeTable(input, rolls);
  if (!result.hit || result.pdFraction === 1) return result;
  // The table's PD, then the fraction; the shading still reads the table's column.
  const physicalDamage = result.physicalDamage / result.pdFraction;
  return { ...result, tablePhysicalDamage: result.physicalDamage, physicalDamage,
    trace: [...result.trace, step('Small point', `${result.physicalDamage} PD / ${result.pdFraction} = ${physicalDamage} PD`)] };
}

function resolveMeleeTable(input, rolls) {
  const result = previewMelee(input);
  roll(rolls.hit, 'Hit roll');
  const hit = result.threshold === 'hit' || (result.threshold !== 'miss' && rolls.hit <= result.threshold);
  if (!hit) return { ...result, hit, physicalDamage: 0, rolls: { hit: rolls.hit } };
  const impactDie = numeric(rolls.impact, 'Impact die', 1, result.dieSides, true);
  if (result.special === 'whip') return surfaceCut(result, input, rolls, impactDie);
  const impact = (impactDie + result.dieBonus) * result.dieMultiplier * result.multiplier;
  const locationRoll = roll(rolls.location, 'Location roll');
  if (result.special === 'chainsaw') return chainsawCut(result, input, rolls, impact, locationRoll);
  const location = struckRow(result.family, locationRoll);
  const side = location.right ? (locationRoll >= location.right[0] ? 'right' : 'left') : 'center';
  const named = `${side === 'center' ? '' : side + ' '}${location.label}`;
  if (input.armorClass === 'I' || result.family === 'flange' || result.family === 'blunt') {
    return crushDamage(result, location, named, impact, input, rolls);
  }
  if (result.family === 'stabbing' && !location.damage) throw new InputError('location', `${location.label} is on the stabbing table, and its damage is not transcribed.`);
  const stabbing = result.family === 'stabbing';
  const thresholds = stabbing ? stabbingThresholds[input.armorClass] : cuttingThresholds[input.armorClass];
  if (!thresholds) throw new InputError('armorClass', 'Choose NO, LT, ML, BR or PL; impenetrable armor requires the blunt table.');
  // §3.7: an ID between headings reads the lower one, and past the last heading the last column;
  // a row that stops printing keeps its last PD, on both tables.
  const index = stabbing ? columnIndex(thresholds, impact) : thresholds.findLastIndex(value => value <= impact);
  const pd = index < 0 ? 0 : location.damage[Math.min(index, location.damage.length-1)];
  const disabled = pd > 0 && location.disablingAt !== null && index >= location.disablingAt;
  return { ...result, hit, impact, location: named,
    region: location.region, side, physicalDamage: pd, disabled, terminal: index >= location.damage.length,
    rolls: structuredClone(rolls), trace: [...result.trace,step('Impact damage',impact),step('Hit location',location.label),
      step('Armor class at location',input.armorClass),
      // Both halves, because the heading VALUE collides across armor lines while the column
      // does not: 3 ID is heading 3 on the unarmored, light and medium stabbing lines, and
      // they are columns 3, 2 and 1 of the same damage row.
      step('ID column',index < 0 ? 'below the first heading on this armor line' : `column ${index + 1}, heading ${thresholds[index]}`),step('Physical damage',pd),
      step('Disabling injury', location.disablingAt === null ? 'this location is shaded nowhere' : disabled ? `yes \u00b7 shaded from column ${location.disablingAt + 1}` : `no \u00b7 shaded from column ${location.disablingAt + 1}`)] };
}

const sideOf = (location, locationRoll) => location.right ? (locationRoll >= location.right[0] ? 'right' : 'left') : 'center';
const shading = (row, index, pd) => ({ disabled: pd > 0 && row.disablingAt !== null && index >= row.disablingAt,
  note: row.disablingAt === null ? 'this location is shaded nowhere' : `${pd > 0 && index >= row.disablingAt ? 'yes' : 'no'} \u00b7 shaded from column ${row.disablingAt + 1}` });

// §5.7 (PDF 32-33). Cutting Power = the ID less the Armor Adjustment; entered as ID on the NO line
// of the Cutting table for a cut, the Stabbing table for a thrust, for the Base PD, times 6. A cut
// continued on the next impulse subtracts half the adjustment and adds the new Cutting Power to
// the old. At 0 or less the blade is not penetrating.
function chainsawCut(result, input, rolls, impact, locationRoll) {
  const adjustment = chainsawArmorAdjustment[input.armorClass];
  if (adjustment === undefined) throw new InputError('armorClass', 'Choose NO, LT, ML, BR, PL or I for a chainsaw.');
  const continued = result.continuedCuttingPower != null;
  const loss = continued ? adjustment / 2 : adjustment;
  const cuttingPower = loss === Infinity ? 0 : (continued ? result.continuedCuttingPower : 0) + impact - loss;
  const location = struckRow(result.family, locationRoll);
  const side = sideOf(location, locationRoll);
  const named = `${side === 'center' ? '' : side + ' '}${location.label}`;
  if (!location.damage) throw new InputError('location', `${location.label} is on the ${result.family} table, and its damage is not transcribed.`);
  const thresholds = (result.family === 'stabbing' ? stabbingThresholds : cuttingThresholds).NO;
  const index = cuttingPower > 0 ? (result.family === 'stabbing' ? columnIndex(thresholds, cuttingPower) : thresholds.findLastIndex(value => value <= cuttingPower)) : -1;
  const basePD = index < 0 ? 0 : location.damage[Math.min(index, location.damage.length - 1)];
  const pd = basePD * 6;
  const shade = shading(location, index, pd);
  return { ...result, hit: true, impact, location: named, region: location.region, side, physicalDamage: pd, disabled: shade.disabled,
    terminal: index >= location.damage.length, cuttingPower, basePhysicalDamage: basePD, rolls: structuredClone(rolls),
    trace: [...result.trace, step('Impact damage', impact), step('Hit location', location.label), step('Armor class at location', input.armorClass),
      step('Cutting power', `${continued ? `${result.continuedCuttingPower} + ` : ''}${impact} ID − ${loss === Infinity ? 'impenetrable' : loss} = ${loss === Infinity ? 'none' : cuttingPower}${continued ? ' (continued cut, half the adjustment)' : ''}`),
      step('ID column', index < 0 ? 'the blade is not penetrating' : `NO line column ${index + 1}, heading ${thresholds[index]}`),
      step('Physical damage', `${basePD} Base PD × 6 = ${pd}`), step('Disabling injury', shade.note)] };
}

// §5.8/§5.9 (PDF 33). A whip's Surface Cut enters the Blunt table's unarmored line with the
// Damage Bonus less the armor's adjustment, for the Base PD; the weapon's ID die times that is
// the PD. The die is the cut's length and the Damage Bonus its depth.
function surfaceCut(result, input, rolls, impactDie) {
  const adjustment = surfaceCutArmorAdjustment[input.armorClass];
  if (adjustment === undefined) throw new InputError('armorClass', 'Choose NO, LT, ML, BR, PL or I for a surface cut.');
  const locationRoll = roll(rolls.location, 'Location roll');
  const location = struckRow('blunt', locationRoll);
  const side = sideOf(location, locationRoll);
  const named = `${side === 'center' ? '' : side + ' '}${location.label}`;
  const depth = adjustment === Infinity ? 0 : result.surfaceCutBonus - adjustment;
  const thresholds = bluntThresholds['0'];
  const index = depth > 0 ? columnIndex(thresholds, depth) : -1;
  const basePD = index < 0 || !location.damage ? 0 : location.damage[Math.min(index, location.damage.length - 1)];
  const length = impactDie + result.dieBonus;
  const pd = basePD > 0 ? length * basePD : 0;
  const shade = shading(location, index, pd);
  return { ...result, hit: true, impact: length, location: named, region: location.region, side, physicalDamage: pd, disabled: shade.disabled,
    terminal: false, basePhysicalDamage: basePD, rolls: structuredClone(rolls),
    trace: [...result.trace, step('Hit location', `${location.label} (Blunt table)`), step('Armor class at location', input.armorClass),
      step('Surface cut depth', `DB ${result.surfaceCutBonus} − ${adjustment === Infinity ? 'impenetrable' : adjustment} = ${adjustment === Infinity ? 'immune' : depth}`),
      step('ID column', index < 0 ? 'no depth: no damage' : `BPF 0 line column ${index + 1}, heading ${thresholds[index]}`),
      step('Physical damage', basePD > 0 ? `${length} ID × ${basePD} Base PD = ${pd}` : 'Base PD 0: the strike does no damage'), step('Disabling injury', shade.note)] };
}

function crushDamage(result, location, named, impact, input, rolls) {
  const impenetrable = input.armorClass === 'I';
  let tableImpact = impact;
  let line = input.armorClass;
  const conversion = [];
  if (impenetrable) {
    if (!Number.isFinite(input.bluntProtectionFactor) || input.bluntProtectionFactor < 1) {
      throw new InputError('bluntProtectionFactor', 'Impenetrable armor is read on the blunt table after the ID is divided by its BPF.');
    }
    const bpf = input.bluntProtectionFactor;
    tableImpact = impact / bpf;
    line = bpf > 3 ? '3+' : String(bpf);
    conversion.push(step('Impenetrable armor', `${impact} ID ÷ BPF ${bpf} = ${tableImpact}`), step('Blunt line', line));
  }
  const row = impenetrable ? bluntLocations.find(candidate => candidate.label === location.label) : location;
  if (!row) throw new InputError('location', `${location.label} has no row on the blunt table, which is where impenetrable armor is read.`);
  const family = impenetrable ? 'blunt' : result.family;
  if (!row.damage) throw new InputError('location', `${row.label} is on the ${family} table, and its damage is not transcribed.`);
  const thresholds = (family === 'blunt' ? bluntThresholds : flangeThresholds)[line];
  if (!thresholds) throw new InputError('armorClass', 'Choose BPF 0, 1, 2, 3 or 3+.');
  const index = columnIndex(thresholds, tableImpact);
  const pd = index < 0 ? 0 : row.damage[Math.min(index, row.damage.length - 1)];
  // The shading is read on the row the damage came off, which for impenetrable armour is the
  // blunt row rather than the flange one the blow started on.
  const disabled = pd > 0 && row.disablingAt !== null && index >= row.disablingAt;
  return { ...result, hit: true, impact, location: named, region: location.region,
    side: named.startsWith('left ') ? 'left' : named.startsWith('right ') ? 'right' : 'center',
    physicalDamage: pd, disabled, terminal: index >= row.damage.length,
    source: impenetrable ? `${result.source}; ${bluntSource}` : result.source,
    rolls: structuredClone(rolls), trace: [...result.trace, step('Impact damage', impact), step('Hit location', location.label),
      ...conversion, step(impenetrable ? 'BPF line' : 'BPF line at location', line),
      step('ID column', index < 0 ? 'below the first heading on this BPF line' : `column ${index + 1}, heading ${thresholds[index]}`), step('Physical damage', pd),
      step('Disabling injury', row.disablingAt === null ? 'this location is shaded nowhere'
        : `${disabled ? 'yes' : 'no'} \u00b7 shaded from column ${row.disablingAt + 1}`)] };
}

// Expose the actual struck location before asking for armor; never simulate unarmored damage.
export function locateHit(kind, input, rolls) {
  if (kind === 'firearm') {
    // The column and the die's range both come from the cover, so the preview has to make
    // the same §3.8 decision the resolution will: a man looking over a wall is read on a
    // 00-22 roll here too, or the two would disagree about where he was hit.
    const { cover } = previewFirearm(input);
    const value = roll(rolls.location, 'Location roll', cover.rollMax);
    return {location:firearmLocationRow(cover,value).row['Hit Location']};
  }
  const value = roll(rolls.location, 'Location roll');
  if (kind !== 'melee') throw new InputError('kind','Unknown attack kind.');
  const attack = input.weapon?.system?.meleeModes?.[input.modeId]?.attacks?.[input.attackId];
  const family = attack ? meleeFamily(attack) : 'cutting';
  const row = struckRow(family, value);
  const side = row.right ? (value >= row.right[0] ? 'right' : 'left') : 'center';
  return { location: `${side === 'center' ? '' : side + ' '}${row.label}`, region: row.region, side, family };
}

export function inspectAttack(kind, input) {
  try { return { ready: true, preview: kind === 'firearm' ? previewFirearm(input) : kind === 'melee' ? previewMelee(input) : (() => { throw new InputError('kind','Unknown attack kind.'); })() }; }
  catch (error) { if (error instanceof InputError) return { ready: false, missing: [{ field: error.field, message: error.message }] }; throw error; }
}

export const firearmOptions = {
  targetSizes: t.standardTargetSizeModifiers_4E.map(row => row.Position),
  visibility: t.visibilityModifiers_4C.map(row => row.Visibility),
  situations: t.situationAndStanceModifiers_4B.map(row => row.Situation)
};
