// §3.2 Parrying, LEG10204 PDF 19–20 / printed 15–16.
//
// The Odds of Hitting tables have nine Parry Columns, and which one an incoming blow is
// read on depends on what the DEFENDER was doing when it arrived. Until now the column was
// simply stated in the strike review; this derives it (D62).
//
// The column table is transcribed as printed, including "Scutem Shield", which is how PDF 19
// spells it.
//
// WHAT A DEFENDER GETS. §3.2: "Whenever a combatant with a weapon chooses to Parry, he
// receives a Column 9 Parry against any one incoming Strike. For each additional Action used
// by the combatant in an Impulse for Parrying, he can use a Column 9 Parry against an
// additional Strike." Blows beyond that number are read on the Partial Parry of his primary
// parrying device. "The defender may choose which Strike or Strikes he wishes to use his Full
// Parries against. These decisions are made before the opponents roll to hit" - which is the
// reaction window this system already opens before any attack is rolled.
//
// A blow from outside the Field of Attack is Column 1 whatever he was doing, because he never
// saw it coming.
//
// ALL THREE LOADOUTS ARE DERIVED. §3.2 gives weapon-and-shield, two weapons and one weapon;
// shields came in with D63 and the off-hand weapon with D64.
//
// What separates them is what buys a full parry. With a SHIELD, §3.2 says "a combatant
// receives one Column 9 Parry with his Shield for each Action used to Recover or Set during a
// given Impulse" - setting buys parries too, because the shield is free while the weapon is
// out of position - and "he receives only a Partial Parry with his Shield while Striking",
// which is his shield's PP rather than the base parry.
//
// TWO WEAPONS works the same way, with the off-hand weapon in the shield's place: "the weapon
// in the Off-Hand takes the place of a Shield and is normally used as the primary Parrying
// device", and it gives its own partial parry, 4 in one hand or 5 in two. It has two cases a
// shield does not, because an off-hand weapon can be busy: "If for any reason the combatant
// decides to Set with both of his weapons, neither can be used for Parries and any blow
// arriving Strikes against a Column 2 Parry", and "If by some chance a combatant with two
// weapons Strikes with both of them in an Impulse and does not Parry, he receives only a
// Column 2 Parry". Both are `bothWeaponsCommitted`.
//
// For ONE weapon §3.2 says: "A combatant with a single weapon receives a Column 2 Parry when he uses
// all his CA in an Impulse for Striking or Setting. When the combatant is using his weapon to
// Parry, he receives a Full Parry against one blow for each Action spent Parrying. He gets a
// Column 4 Partial Parry for a One-Handed Weapon, or a Column 5 Partial Parry for a Two-Handed
// Weapon, against any excess blows which land during an Impulse in which he takes at least one
// Parry. As with normal combat, a Recover action is treated as a Parry."

export const parrySource = 'LEG10204 §3.2, PDF 19–20';

// §3.2's Column 3, "Partial Parry when fighting Unarmed". A Block is the unarmed Parry and
// costs one action on Table 3B, so it buys a full parry the way a weapon parry does (D66).
import { UNARMED_PARTIAL_PARRY } from '../data/unarmed.mjs';

// Printed as the page prints it, Column 1 first.
export const parryColumns = Object.freeze([
  { column: 1, description: 'No Parry; Attacker outside the Field of Attack' },
  { column: 2, description: 'Base Parry; Attacker within the Field of Attack' },
  { column: 3, description: 'Partial Parry when fighting Unarmed' },
  { column: 4, description: 'Partial Parry with Buckler or 1-Handed Weapon' },
  { column: 5, description: 'Partial Parry with Round Shield or 2-Handed Weapon' },
  { column: 6, description: 'Partial Parry with Heater Shield' },
  { column: 7, description: 'Partial Parry with Kite Shield' },
  { column: 8, description: 'Partial Parry with Scutem Shield' },
  { column: 9, description: 'Full Parry, with any Weapon or Shield' }
].map(row => Object.freeze(row)));

export const FULL_PARRY = 9;
export const BASE_PARRY = 2;
export const NO_PARRY = 1;

const asItems = actor => Array.from(actor?.items ?? []);
const meleeModes = item => Object.entries(item?.system?.meleeModes ?? {});
const heldMode = item => item?.system?.meleeModes?.[item.system.selectedModeId] ?? meleeModes(item)[0]?.[1] ?? null;

// Convert Foundry's clockwise token rotation and screen coordinates into a signed relative
// bearing. Phoenix Command's facing arc is the forward 180 degrees: an attacker exactly on
// either flank is inside, while any point behind that line is outside.
export function fieldOfAttack({ defender, attacker, facing, arcDegrees = 180 } = {}) {
  for (const [name, point] of [['Defender', defender], ['Attacker', attacker]]) {
    if (!Number.isFinite(point?.x) || !Number.isFinite(point?.y)) throw new Error(`${name} position is unavailable.`);
  }
  if (!Number.isFinite(facing)) throw new Error('Defender facing is unavailable.');
  if (!(arcDegrees > 0 && arcDegrees <= 360)) throw new Error('Field of Attack must be between 0 and 360 degrees.');
  const bearing = (Math.atan2(attacker.x - defender.x, defender.y - attacker.y) * 180 / Math.PI + 360) % 360;
  const difference = Math.abs(((bearing - facing + 540) % 360) - 180);
  return { bearing, facing: ((facing % 360) + 360) % 360, difference,
    arcDegrees, outside: difference > arcDegrees / 2 };
}

// Read the defender's ordinary §3.2 loadout once from equipped Items. Ambiguous hand
// assignments remain explicit instead of silently choosing the stronger interpretation.
export function deriveParryLoadout(actor) {
  const items = asItems(actor);
  const weapons = items.filter(item => item.type === 'weapon' && item.system?.carried && item.system?.equipped && meleeModes(item).length);
  const shields = items.filter(item => item.type === 'shield' && item.system?.carried && item.system?.equipped && item.system?.strapped);
  if (shields.length > 1) return { resolved: false, reason: 'More than one equipped, strapped shield is recorded.' };
  const unarmed = weapons.find(item => heldMode(item)?.grip === 'unarmed');
  const armed = weapons.filter(item => heldMode(item)?.grip !== 'unarmed');
  if (!armed.length) {
    if (unarmed) return { resolved: true, loadout: 'unarmed', hands: 1, label: 'Unarmed' };
    // User ruling, 27 September 2026: a combatant with no melee weapon ready parries unarmed.
    return { resolved: true, loadout: 'unarmed', hands: 1, label: 'Unarmed (no melee weapon ready)' };
  }
  const primary = armed.find(item => item.system.heldIn === 'primary') ?? (armed.length === 1 ? armed[0] : null);
  const offHand = armed.find(item => item.system.heldIn === 'off') ?? null;
  if (!primary) return { resolved: false, reason: 'Assign the equipped melee weapons to primary and off hands.' };
  const hands = heldMode(primary)?.hands;
  if (hands !== 1 && hands !== 2) return { resolved: false, reason: `${primary.name} does not record a one- or two-handed melee mode.` };
  if (shields.length) {
    const shield = shields[0], partial = Number(shield.system.partialParry);
    if (!Number.isSafeInteger(partial) || partial < 1 || partial > 9) return { resolved: false, reason: `${shield.name} has no valid Partial Parry.` };
    return { resolved: true, loadout: 'weapon-and-shield', hands, shieldItemId: shield.id,
      shieldName: shield.name, shieldPartialParry: partial, label: `${primary.name} + ${shield.name}` };
  }
  if (offHand) {
    const offHandHands = heldMode(offHand)?.hands;
    if (offHandHands !== 1 && offHandHands !== 2) return { resolved: false, reason: `${offHand.name} does not record how many hands hold it.` };
    return { resolved: true, loadout: 'two-weapons', hands, offHandHands,
      primaryWeaponId: primary.id, offHandWeaponId: offHand.id, label: `${primary.name} + ${offHand.name}` };
  }
  if (armed.length > 1) return { resolved: false, reason: 'Multiple equipped melee weapons are recorded without an off-hand assignment.' };
  return { resolved: true, loadout: 'one-weapon', hands, primaryWeaponId: primary.id, label: primary.name };
}

// The active activity and its work records identify what the defender spent this impulse
// doing. This deliberately derives only the current activity; the timing model permits one
// activity slot, so it cannot claim simultaneous work that the ledger cannot represent.
export function deriveParryActivity(entry, { phase, impulse } = {}) {
  const activity = entry?.activity, plan = activity?.weaponPlan;
  const spent = (entry?.history ?? []).filter(record => record.kind === 'work' && record.status === 'active'
      && record.activityId === activity?.id && record.phase === phase && record.impulse === impulse)
    .reduce((total, record) => total + Math.max(0, Number(record.after) - Number(record.before)), 0);
  const result = { parryActions: 0, recoverActions: 0, setActions: 0, bothWeaponsCommitted: false, spent };
  if (!plan || !spent) return result;
  if (plan.kind === 'parry') result.parryActions = spent;
  else if (plan.kind === 'recover') result.recoverActions = spent;
  else if (plan.kind === 'strike') result.setActions = Math.min(spent, plan.preparationActions ?? plan.sets ?? 0);
  return result;
}

// §3.4 and Table 3C compute these two columns instead of looking up a fixed device row.
// The book can produce MS − 1 outside Table 4's columns 1–9; the user ruled that value
// clamped to the printed table on 21 Sep 2026.
export function defenceParryColumn({ defence, maximumSpeed = null, shieldPartialParry = null,
  outsideFieldOfAttack = false } = {}) {
  if (defence === 'dodge') {
    if (!Number.isSafeInteger(maximumSpeed) || maximumSpeed < 1 || maximumSpeed > 13) {
      throw new Error('Dodge needs Maximum Speed 1 through 13 from the character chain.');
    }
    const computed = maximumSpeed - 1;
    const column = Math.max(NO_PARRY, Math.min(FULL_PARRY, computed));
    return { defence, column, computed, clamped: column !== computed,
      reason: `Dodge: Maximum Speed ${maximumSpeed} − 1 = ${computed}, read on Column ${column}${column !== computed ? ' after clamping to Table 4' : ''}.`,
      source: 'LEG10204 §3.4, PDF 18; Table 3C, PDF 45; bounds user-ruled 21 Sep 2026' };
  }
  if (defence === 'coverUp') {
    if (outsideFieldOfAttack === true) {
      return { defence, column: NO_PARRY, computed: null, clamped: false,
        reason: 'Cover Up applies only within the Field of Attack; this blow is outside it.',
        source: 'LEG10204 §3.4, PDF 18; Table 3C, PDF 45' };
    }
    if (!Number.isSafeInteger(shieldPartialParry) || shieldPartialParry < 5 || shieldPartialParry > 8) {
      throw new Error('Cover Up requires a Round-or-larger shield with Partial Parry 5 through 8.');
    }
    return { defence, column: shieldPartialParry + 1, computed: shieldPartialParry + 1, clamped: false,
      reason: `Cover Up: shield Partial Parry ${shieldPartialParry} + 1.`,
      source: 'LEG10204 §3.4, PDF 18; Table 3C, PDF 45' };
  }
  throw new Error('Choose Dodge or Cover Up.');
}

// The Partial Parry a weapon itself gives. Table 3C prints One Handed Weapon 4 and Two Handed
// Weapon 5, the same numbers the column table gives.
export function partialParryColumn(hands) {
  if (hands !== 1 && hands !== 2) throw new Error('A weapon is held in one hand or two.');
  return hands === 1 ? 4 : 5;
}

// §3.1 and §3.2 both say it: "a Recover action is treated as a Parry", and "a Parry with a
// weapon can always be used in place of a Recover move". So actions spent recovering buy
// full parries exactly as actions spent parrying do.
export function fullParriesAvailable({ parryActions = 0, recoverActions = 0 } = {}) {
  for (const [name, value] of [['Parry actions', parryActions], ['Recover actions', recoverActions]]) {
    if (!Number.isSafeInteger(value) || value < 0) throw new Error(`${name} must be a whole number of actions.`);
  }
  return parryActions + recoverActions;
}

// Which column each incoming blow is read on. `strikes` is the blows arriving this impulse,
// in the order the defender wants them considered; `fullParry` is his allocation, which
// §3.2 has him make before anyone rolls. `outsideFieldOfAttack` is a blow he never saw.
export function allocateParries({ loadout = 'one-weapon', hands, shieldPartialParry = null,
  offHandHands = null, bothWeaponsCommitted = false,
  parryActions = 0, recoverActions = 0, setActions = 0, strikes } = {}) {
  if (!['one-weapon', 'weapon-and-shield', 'two-weapons', 'unarmed'].includes(loadout)) {
    throw new Error('§3.2 gives three loadouts: one weapon, weapon and shield, or two weapons. Unarmed is the fourth case, on Column 3.');
  }
  if (!Array.isArray(strikes) || !strikes.length) throw new Error('Name the blows arriving this impulse.');
  const shielded = loadout === 'weapon-and-shield';
  const twoWeapons = loadout === 'two-weapons';
  const unarmed = loadout === 'unarmed';
  if (shielded && (!Number.isSafeInteger(shieldPartialParry) || shieldPartialParry < 1 || shieldPartialParry > 9)) {
    throw new Error('A shielded defender needs his shield\'s Partial Parry from Table 3C.');
  }
  if (!unarmed && !shielded && !twoWeapons && hands !== 1 && hands !== 2) {
    throw new Error('A weapon is held in one hand or two.');
  }
  if (twoWeapons && offHandHands !== 1 && offHandHands !== 2) {
    throw new Error('A two-weapon defender parries with his off-hand weapon; say whether it is held in one hand or two.');
  }
  // A second device - shield or off-hand weapon - is the primary parrying device, so the
  // excess falls to ITS partial parry and a set buys a full parry with it. Two weapons both
  // committed is the one case where the second device is not free.
  const hasSecondDevice = (shielded || twoWeapons) && !(twoWeapons && bothWeaponsCommitted === true);
  const partial = shielded ? shieldPartialParry
    : twoWeapons ? partialParryColumn(offHandHands)
    : unarmed ? UNARMED_PARTIAL_PARRY
    : partialParryColumn(hands);
  const available = bothWeaponsCommitted === true && twoWeapons ? 0
    : fullParriesAvailable({ parryActions, recoverActions })
      + (hasSecondDevice ? fullParriesAvailable({ parryActions: setActions }) : 0);
  const chosen = strikes.filter(strike => strike.fullParry === true && strike.outsideFieldOfAttack !== true).length;
  if (chosen > available) {
    throw new Error(`He has ${available} full parr${available === 1 ? 'y' : 'ies'} this impulse and ${chosen} blow${chosen === 1 ? ' was' : 's were'} allocated one.`);
  }
  const results = strikes.map(strike => {
    if (strike.outsideFieldOfAttack === true) {
      return { ...strike, column: NO_PARRY, reason: 'Outside the Field of Attack: he never saw it, so no parry is possible.' };
    }
    if (strike.fullParry === true) {
      return { ...strike, column: FULL_PARRY, reason: 'Full parry: one action spent parrying or recovering was allocated to this blow.' };
    }
    if (twoWeapons && bothWeaponsCommitted === true) {
      // "neither can be used for Parries and any blow arriving Strikes against a Column 2 Parry"
      return { ...strike, column: BASE_PARRY, reason: 'Both his weapons were committed, so neither could parry.' };
    }
    if (hasSecondDevice) {
      // "He receives only a Partial Parry with his Shield while Striking" - never the base
      // parry, because the second device is free whatever his primary weapon is doing.
      const device = shielded ? 'shield' : 'off-hand weapon';
      return { ...strike, column: partial, reason: available === 0
        ? `He spent the impulse striking, so his ${device} gives only its partial parry.`
        : `Excess blow beyond his full parries: his ${device}'s partial parry.` };
    }
    if (available === 0) {
      // "receives a Column 2 Parry when he uses all his CA in an Impulse for Striking or Setting"
      return { ...strike, column: BASE_PARRY, reason: 'He spent the impulse striking or setting, so this is the base parry.' };
    }
    return { ...strike, column: partial, reason: unarmed
      ? 'Excess blow in an impulse he blocked in: §3.2\'s partial parry for fighting unarmed.'
      : `Excess blow in an impulse he parried in: the partial parry of a ${hands === 1 ? 'one' : 'two'}-handed weapon.` };
  });
  return { loadout, available, allocated: chosen, partial, strikes: results, source: parrySource };
}
