// Unarmed Hand-to-Hand Combat, LEG10204 §3.9 and Table 3B, PDF 45 / printed 41.
//
// §3.9 is four lines and settles almost everything: "The entries and information on the
// Unarmed Hand-to-Hand Combat Table (3B) should be used when it is necessary to simulate an
// unarmed combat. Action costs and combat rules are the same as for normal armed combat, with
// damage resolved on the Blunt Damage Table (5D)." And: "this is not intended to represent the
// use of advanced Martial Arts, but is a general system for combatants without sophisticated
// training."
//
// So an unarmed blow is an ordinary blow - the same Recover-Set-Set-Strike cycle, the same
// odds, the same hit locations - with two differences. Its action costs come from Table 3B
// PER ATTACK rather than from §3.1's Weapon Speed table, because a kick is slower than a jab
// and there is no weapon to have a speed; and its damage is always read on the blunt table,
// whose shading came in with D60, so an unarmed blow can disable a limb.
//
// Table 3B, as printed:
//
//   Strike      ID     Cost  WC        Recover  Cost     Set        Cost
//   Fist        0 - 1    1    +2       Fist       1      Fist         1
//   Elbow       0 - 1    1     0       Elbow      1      Elbow        2
//   Knee        0 - 1    2     0       Knee       2      Knee         2
//   Kick        0 - 2    2     0       Kick       2      Kick         3
//   Head Butt   0 - 1    1    -2       Head       2      Head Butt    2
//
//   Block  1 action      Dodge  4 impulses      Cover Up  1 impulse
//
// THE ID IS A RANGE, AND THE ARMED TABLE'S IS NOT. The Archaic and Modern weapon tables print
// an impact as a die and a bonus, "(3) + 2"; Table 3B prints "0 - 1" and "0 - 2". Read as the
// inclusive range of Impact Damage the blow does, rolled flat, which is how it is stored here:
// a 0-1 entry is a two-sided roll offset to 0 and 1. A blow that rolls 0 does no damage at all
// before any multiplier, which is what a punch that lands badly should do (D66).
//
// BLOCK, DODGE AND COVER UP. Block is the unarmed Parry and costs one action, so it buys a
// full parry the way a weapon parry does, and §3.2's Column 3 is "Partial Parry when fighting
// Unarmed" - that is the excess column. Dodge and Cover Up are priced in IMPULSES rather than
// actions and appear again on Table 3C as parry devices worth MS - 1 and PP + 1. Both are
// impulse-duration defences in timing.mjs (D68); 2-foot Free Movement remains unavailable.

export const unarmedSource = Object.freeze({
  book: 'LEG10204', table: '3B', section: '3.9', pdfPage: 45, printedPage: 41, verification: 'visual'
});

// §3.2's Column 3. The partial parry an unarmed defender falls back to.
export const UNARMED_PARTIAL_PARRY = 3;

// Priced in impulses, not actions.
export const unarmedDefences = Object.freeze({
  block: Object.freeze({ actionCost: 1 }),
  dodge: Object.freeze({ impulseCost: 4, parryNote: 'Table 3C gives Dodge a Partial Parry of MS - 1.' }),
  coverUp: Object.freeze({ impulseCost: 1, parryNote: 'Table 3C gives Cover Up a Partial Parry of PP + 1.' })
});

// id, label, [low ID, high ID], strike cost, recover cost, set cost, weapon class
const printed = [
  ['fist', 'Fist', [0, 1], 1, 1, 1, 2],
  ['elbow', 'Elbow', [0, 1], 1, 1, 2, 0],
  ['knee', 'Knee', [0, 1], 2, 2, 2, 0],
  ['kick', 'Kick', [0, 2], 2, 2, 3, 0],
  ['headButt', 'Head Butt', [0, 1], 1, 2, 2, -2]
];

export const unarmedAttacks = Object.freeze(printed.map(([id, label, [low, high], strike, recover, set, weaponClass]) =>
  Object.freeze({
    id, label, impactLow: low, impactHigh: high, weaponClass,
    // The resolver rolls a die and adds a bonus, so the printed range is expressed that way:
    // a die of (high - low + 1) sides offset by (low - 1) covers low through high inclusive.
    dieSides: high - low + 1, dieBonus: low - 1,
    actionCosts: Object.freeze({ set, strike, recover })
  })));

export const unarmedAttacksById = Object.freeze(Object.fromEntries(unarmedAttacks.map(a => [a.id, a])));

// Unarmed is not a possession, but it flows through the same strike path as a weapon, so it is
// built in the same shape. There is no Weapon Speed: every cost is the attack's own.
export function unarmedItem() {
  return {
    id: 'unarmed', name: 'Unarmed', type: 'weapon',
    system: {
      schemaVersion: 1, catalogId: 'unarmed', catalogRevision: '', weightLb: 0,
      quantity: 1, carried: true, equipped: true, attachedToId: null, weightNote: '', notes: '',
      source: { bookId: unarmedSource.book, table: unarmedSource.table, section: unarmedSource.section,
        pdfPage: unarmedSource.pdfPage, verification: unarmedSource.verification, note: '' },
      selectedModeId: 'unarmed', heldIn: 'unstated', firearmModes: {},
      meleeModes: {
        unarmed: {
          grip: 'unarmed', skill: 'unarmed', hands: 1,
          weaponSpeed: null, weaponClass: null,
          // Table 3B prints no reach for an unarmed blow, so this is an adjudication rather
          // than a reading: you can hit what you can touch, and 2 feet is the finest the melee
          // map resolves to, being one 2-foot hex.
          reachMinFeet: 0, reachMaxFeet: 2, tipReachFeet: null,
          attacks: Object.fromEntries(unarmedAttacks.map(attack => [attack.id, {
            motion: 'slash', damageFamily: 'blunt',
            impactFormula: `1d${attack.dieSides}${attack.dieBonus === 0 ? '' : ` ${attack.dieBonus < 0 ? '-' : '+'} ${Math.abs(attack.dieBonus)}`}`,
            weaponClass: attack.weaponClass,
            actionCosts: { ...attack.actionCosts },
            traits: []
          }])),
          preparation: { sets: 0, progressActions: 0, recoveryRequired: false }
        }
      },
      loaded: { ammunitionItemId: null, rounds: 0, chamber: 'unknown' }
    }
  };
}
