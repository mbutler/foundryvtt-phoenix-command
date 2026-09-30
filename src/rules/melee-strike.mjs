// What a melee activity costs, and how a 6-foot map relates to a 2-foot range.
//
// §3.1's Weapon Action Costs table (PDF 18) prices all four activities against the
// Weapon Speed, not just the strike. It is transcribed in full here (D61):
//
//   WS            Parry  Set  Strike  Recover
//   1.0 to 1.1      3     3      1       3
//   1.2 to 1.4      2     2      1       2
//   1.5 to 1.7      1     2      1       2
//   1.8 to 2.2      1     2      1       1
//   2.3 to 3.0      1     1      1       1
//   3.1 or greater  1     1     .5      .5
//
// The cycle §3.1 prints is Recover - Strike for a short stroke at half damage,
// Recover - Set - Strike for a normal one, and Recover - Set - Set - Strike for a long
// stroke at double. So a blow's cost is its sets plus the strike, and the recover it
// owes afterwards is a separate activity the clock charges separately - the book's own
// examples have a man strike in one impulse and recover in the next, or be caught
// before he has.
//
// THE HALF-ACTION ROW PAIRS RATHER THAN FRACTIONS (D65). At 3.1 or more the Strike and
// Recover rows are .5 each, and the reason is printed right there: "This means that a single
// Action allows the Character to both Strike and Recover; both activities must be performed
// using the same Action." So the two halves are never spent apart. A fast weapon's blow costs
// its sets plus ONE action, that action throws the blow and recovers the weapon together, and
// the allocator stays whole - which is why this needed no half-action units after all.
//
// A standalone Recover with such a weapon is refused: there is nothing to recover from,
// because the blow recovered itself. A Parry is still a whole action, as the table prints.
//
// NO WEAPON THE BOOK PRINTS REACHES 3.1. The Archaic table's fastest is the Dagger at 2.8 and
// the Modern table's are the Pocket knife, Switch Blade and Screwdriver at 2.9; the K-Bar is
// 2.8, the club 2.2 and the mace 2.1. The row is implemented against a supplement weapon that
// may reach it, not against anything currently catalogued.
//
// A PARRY COUNTS AS A RECOVER - "a Parry with a weapon can always be used in place of a
// Recover move" - and parrying with a weapon that is set loses the set: "he must begin to
// Set all over again... Note that he does not have to Recover, since a Parry counts as a
// Recover." Both are implemented against the Parry activity (D62). Which column an incoming
// blow is then read on is §3.2, in melee-parry.mjs.
//
// §2.1 and Figure 2: seven 2-foot hexes make one 6-foot hex, so centre to centre is
// three 2-foot hexes per 6-foot hex. Each man can stand one 2-foot hex in from that
// centre. Two men in the same 6-foot hex can still be one 2-foot hex apart.

export const strikeCostSource = 'LEG10204 §3.1 Weapon Action Costs, PDF 18; §2.1 and Figure 2, PDF 14';

// Each row is [low, high, parry, set, strike, recover], read off PDF 18.
const weaponActionCosts = Object.freeze([
  [1.0, 1.1, 3, 3, 1, 3],
  [1.2, 1.4, 2, 2, 1, 2],
  [1.5, 1.7, 1, 2, 1, 2],
  [1.8, 2.2, 1, 2, 1, 1],
  [2.3, 3.0, 1, 1, 1, 1],
  [3.1, Infinity, 1, 1, 0.5, 0.5]
].map(row => Object.freeze(row)));

export function weaponActionCost(weaponSpeed) {
  if (typeof weaponSpeed !== 'number' || !Number.isFinite(weaponSpeed)) throw new Error('Weapon Speed is required.');
  const row = weaponActionCosts.find(([low, high]) => weaponSpeed >= low && weaponSpeed <= high);
  if (!row) throw new Error('This Weapon Speed is not on the action-cost table.');
  const [, , parry, set, strike, recover] = row;
  // The .5 row is the one place the table is fractional, and the halves always pair.
  return { parry, set, strike, recover, pairedStrikeRecover: strike + recover === 1 && strike < 1 };
}

export function strikeActions(weaponSpeed) {
  return weaponActionCost(weaponSpeed).strike;
}

export function recoverActions(weaponSpeed) {
  const cost = weaponActionCost(weaponSpeed);
  if (cost.pairedStrikeRecover) {
    throw new Error('This weapon Strikes and Recovers for half an action each, and §3.1 has both performed in the same Action, so there is no recovery left to pay for on its own.');
  }
  return cost.recover;
}

export function parryActions(weaponSpeed) {
  return weaponActionCost(weaponSpeed).parry;
}

// §3.1: no set is a short stroke at half damage, one set is normal, two is a long stroke
// at double. The cost is the sets plus the strike; the recover is charged on its own.
// An attack that carries its own Set/Strike/Recover costs is priced on those instead of on the
// Weapon Speed table - Table 3B does that for every unarmed blow (D66).
export function attackActionCost(attack) {
  const costs = attack?.actionCosts;
  if (!costs) return null;
  const { set, strike, recover } = costs;
  if (![set, strike, recover].every(value => Number.isFinite(value) && value >= 0)) return null;
  return { parry: null, set, strike, recover, pairedStrikeRecover: strike + recover === 1 && strike < 1 };
}

export function strokeCost(weaponSpeed, sets, attack = null) {
  if (!Number.isSafeInteger(sets) || sets < 0 || sets > 2) throw new Error('A blow is thrown after no set, one set or two.');
  const cost = attackActionCost(attack) ?? weaponActionCost(weaponSpeed);
  // A fast weapon buys the strike and the recovery together in one whole action, so the blow
  // leaves nothing owed and the clock never has to hold half of anything.
  const blowActions = cost.pairedStrikeRecover ? cost.strike + cost.recover : cost.strike;
  return { sets, setActions: cost.set * sets,
    strikeActions: cost.strike, blowActions,
    total: cost.set * sets + blowActions,
    recoverActions: cost.pairedStrikeRecover ? 0 : cost.recover,
    pairedRecovery: cost.pairedStrikeRecover,
    stroke: ['short', 'normal', 'long'][sets], multiplier: [0.5, 1, 2][sets] };
}

// The nearest 2-foot range two men on a 6-foot map can have. A stated range closer
// than this is refused. Range 0 is not a printed weapon range on either scale.
export function closestMeleeHexes(smallArmsHexes) {
  if (!Number.isSafeInteger(smallArmsHexes) || smallArmsHexes < 0) throw new Error('Hex distance must be a whole number.');
  if (smallArmsHexes === 0) return 1;
  return 3 * smallArmsHexes - 2;
}
