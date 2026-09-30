// Explosive Weapons, LEG10200 "Explosive Weapons / Tech Level 13".
// PDF 87 / printed 82, PDF 88 / printed 83, and PDF 89 / printed 84. Fifteen rows.
//
// The Explosive Weapons table is not laid out like the Grenades table. Its explosion
// columns are 0, 1, 2, 3, 5 and 10 hexes and there is **no contact column** — a launched
// round has no printed C (D49). The first transcription of this file invented one by
// copying the 0-hex column, and invented a 10-hex PEN, DC and BSHC where the page prints
// only a Base Concussion. Both are corrected here: the columns below are what the page
// prints, with `_` for a blank cell. A round in contact with a man now has no column and
// is refused by name rather than resolved against a fabricated one.
//
// The M79 and M203 print identical explosion rows for both rounds, so those two rounds are
// shared. The H&K 69A1 prints the same HEAT line and a **different HE line** (D46), so its
// HE burst is stored separately rather than generalised as "40mm". The H&K 79 prints that
// same pair of explosion rows, so it shares them; its length, weight, reload and aim differ.
//
// Ballistic PEN, time of flight and the anti-armour side of the table are not stored. A
// HEAT round's printed PEN of 288 is an armour figure and armour is a vehicle rule; what
// the play path reads after detonation is the explosion columns, and those are here.
//
// `printedRateOfFire` is the cell, and it decides the feed (D56, D57). `-` has no magazine:
// preparing a shot costs the Reload Time. A bare `*` is self-loading and still one round.
// `*N` is a burst of N; those rows also print a Minimum Arc, stored in feet at six feet to
// the hex, the same way the automatic catalogue stores one. Those launchers fire a burst of
// grenades as well as a single round (src/rules/grenade-burst.mjs).
//
// H and K on a concussion are the Physical Damage suffixes (PDF 28): h ×100, k ×1,000.
// The ballistic HEAT PEN (288, 89h, 17k, and the rest) is an armour figure and is not stored.

const burstColumns = [0, 1, 2, 3, 5, 10];
const _ = null;

function chance(token) {
  if (token === _) return { shrapnelChance: null, shrapnelRounds: null };
  if (typeof token === 'string') return { shrapnelChance: null, shrapnelRounds: Number(token.slice(1)) };
  return { shrapnelChance: token, shrapnelRounds: null };
}

function burst(pens, dcs, chances, concussions) {
  for (const row of [pens, dcs, chances, concussions]) {
    if (row.length !== burstColumns.length) throw new Error('A burst row must carry one cell per printed column, blanks included.');
  }
  return Object.freeze(Object.fromEntries(burstColumns.map((column, i) => {
    const cell = { penetration: pens[i], damageClass: dcs[i], ...chance(chances[i]), baseConcussion: concussions[i] };
    if ((cell.shrapnelChance != null || cell.shrapnelRounds != null) && (cell.penetration == null || cell.damageClass == null)) {
      throw new Error(`Column ${column} prints a Base Shrapnel Hit Chance with no PEN or DC to resolve the piece with.`);
    }
    return [String(column), Object.freeze(cell)];
  })));
}

// Shared M79/M203 rounds, PDF 88's right-hand columns. HEAT is also the H&K 69A1 HEAT line.
const heat40mm = burst(
  [1.6, 1.4, 1.0, 0.7, 0.4, _],
  [1, 1, 1, 1, 1, _],
  ['*2', 47, 11, 4, 1, _],
  [241, 71, 23, 12, 5, 1]
);

const m79M203Rounds = Object.freeze({
  he: burst(
    [1.6, 1.4, 1.0, 0.7, 0.4, _],
    [1, 1, 1, 1, 1, _],
    ['*3', 62, 15, 6, 2, _],
    [273, 80, 25, 13, 6, 1]
  ),
  heat: heat40mm
});

// H&K 69A1 HE, PDF 87 — different BSHC/PEN/BC from the M79 HE line; HEAT matches above.
const hk69a1Rounds = Object.freeze({
  he: burst(
    [1.4, 1.2, 0.8, 0.6, 0.3, _],
    [1, 1, 1, 1, 1, _],
    ['*3', 73, 17, 7, 2, _],
    [250, 74, 23, 12, 5, 1]
  ),
  heat: heat40mm
});

// 30mm HE, PDF 87. The AK 74 launcher and the AGS-17 print the same explosion row.
const he30mm = burst(
  [2.4, 2.2, 1.8, 1.5, 1.0, 0.4],
  [2, 2, 2, 2, 1, 1],
  ['*2', 58, 14, 6, 1, -2],
  [250, 74, 23, 12, 5, 1]
);

// PZF 44 and Armbrust HEAT. 11h at contact is 1,100.
const pzfHeat = burst(
  [5.2, 5.1, 4.8, 4.6, 4.2, 3.4],
  [7, 7, 7, 7, 6, 6],
  [15, 3, 0, -3, -7, -12],
  [1100, 252, 72, 36, 16, 5]
);

const hexFeet = hexes => hexes * 6;
function arc(rows) {
  return Object.freeze(Object.fromEntries(rows.map(([hexes, arcHexes]) =>
    [`r${hexes}`, Object.freeze({ distanceFeet: hexFeet(hexes), arcHexes })])));
}

export const launcherSource = Object.freeze({
  book: 'LEG10200', table: 'Explosive Weapons', pdfPages: Object.freeze([87, 88, 89]), verification: 'visual'
});

export const launchers = Object.freeze([
  Object.freeze({
    id: 'm79',
    name: 'US M79 Grenade Launcher',
    country: 'USA',
    lengthIn: 29,
    weightLb: 6.5,
    reloadTimeActions: 10,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    aimModifiers: Object.freeze({ 1: -21, 2: -11, 3: -8, 4: -7, 5: -5, 6: -4, 7: -3 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: m79M203Rounds,
    pdfPage: 88,
    printedPage: 83
  }),
  Object.freeze({
    id: 'm203',
    name: 'US M203 Grenade Launcher',
    country: 'USA',
    lengthIn: 39,
    weightLb: 11.6,
    reloadTimeActions: 12,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    aimModifiers: Object.freeze({ 1: -24, 2: -14, 3: -9, 4: -7, 5: -6, 6: -4 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: m79M203Rounds,
    pdfPage: 88,
    printedPage: 83
  }),
  Object.freeze({
    id: 'hk-69a1',
    name: 'H&K 69A1 Grenade Launcher',
    country: 'W Germany',
    lengthIn: '18/27',
    weightLb: 4.1,
    reloadTimeActions: 10,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    aimModifiers: Object.freeze({ 1: -19, 2: -10, 3: -8, 4: -6, 5: -5, 6: -4, 7: -3 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: hk69a1Rounds,
    pdfPage: 87,
    printedPage: 82
  }),
  Object.freeze({
    id: 'hk-79',
    name: 'H&K 79 Grenade Launcher',
    country: 'W Germany',
    lengthIn: 40,
    weightLb: 14.9,
    reloadTimeActions: 12,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    aimModifiers: Object.freeze({ 1: -26, 2: -16, 3: -10, 4: -7, 5: -6, 6: -4 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: hk69a1Rounds,
    pdfPage: 87,
    printedPage: 82
  }),
  Object.freeze({
    id: 'armscor-6',
    name: 'Armscor 6 Grenade Launcher',
    country: 'South Africa',
    category: 'Grenade launcher',
    lengthIn: '22/31',
    weightLb: 15.0,
    reloadTimeActions: 24,
    rateOfFire: null,
    printedRateOfFire: '*',
    capacity: 6,
    ammunitionWeightLb: 0.51,
    aimModifiers: Object.freeze({ 1: -26, 2: -16, 3: -10, 4: -8, 5: -6, 6: -5, 7: -3 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: m79M203Rounds,
    pdfPage: 87,
    printedPage: 82
  }),
  Object.freeze({
    id: 'ak-74-gl',
    name: 'AK 74 Grenade Launcher',
    country: 'USSR',
    category: 'Grenade launcher',
    lengthIn: 37,
    weightLb: 10.1,
    reloadTimeActions: 12,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: 0.56,
    aimModifiers: Object.freeze({ 1: -23, 2: -13, 3: -9, 4: -7, 5: -5 }),
    rounds: Object.freeze(['he']),
    bursts: Object.freeze({ he: he30mm }),
    pdfPage: 87,
    printedPage: 82
  }),
  Object.freeze({
    id: 'ags-17',
    name: 'AGS-17 Plamya Grenade Launcher',
    country: 'USSR',
    category: 'Grenade launcher',
    lengthIn: 33,
    weightLb: 140.5,
    reloadTimeActions: 12,
    rateOfFire: null,
    printedRateOfFire: '*1',
    capacity: 29,
    ammunitionWeightLb: 24,
    ammunitionUnit: 'drum',
    sustainedBurstPenalty: 1,
    aimModifiers: Object.freeze({ 1: -38, 2: -28, 3: -22, 4: -18, 5: -15, 6: -10, 7: -8, 8: -6, 9: -5, 10: -4, 11: -3, 12: -2, 13: -1 }),
    minimumArc: arc([[40, 0.2], [100, 0.4], [200, 0.8], [400, 2]]),
    rounds: Object.freeze(['he']),
    bursts: Object.freeze({ he: he30mm }),
    pdfPage: 87,
    printedPage: 82
  }),
  Object.freeze({
    id: 'm174',
    name: 'US M174 Grenade Launcher',
    country: 'USA',
    category: 'Grenade launcher',
    lengthIn: 28,
    weightLb: 40.8,
    reloadTimeActions: 14,
    rateOfFire: null,
    printedRateOfFire: '*3',
    capacity: 12,
    ammunitionWeightLb: 9.9,
    ammunitionUnit: 'drum',
    sustainedBurstPenalty: 4,
    aimModifiers: Object.freeze({ 1: -32, 2: -22, 3: -16, 4: -11, 5: -8, 6: -7, 7: -5, 8: -4, 9: -3, 10: -2, 11: -1 }),
    minimumArc: arc([[40, 0.7], [100, 2], [200, 4]]),
    rounds: Object.freeze(['he', 'heat']),
    bursts: m79M203Rounds,
    pdfPage: 88,
    printedPage: 83
  }),
  Object.freeze({
    id: 'm19',
    name: 'US M19 Grenade Launcher',
    country: 'USA',
    category: 'Grenade launcher',
    lengthIn: 41,
    weightLb: 137.2,
    reloadTimeActions: 14,
    rateOfFire: null,
    printedRateOfFire: '*3',
    capacity: 50,
    ammunitionWeightLb: 45.2,
    ammunitionUnit: 'belt',
    sustainedBurstPenalty: 4,
    aimModifiers: Object.freeze({ 1: -40, 2: -30, 3: -25, 4: -21, 5: -17, 6: -15, 7: -10, 8: -8, 9: -6, 10: -5, 11: -3 }),
    minimumArc: arc([[40, 0.8], [100, 2], [200, 4], [400, 8]]),
    rounds: Object.freeze(['he', 'heat']),
    bursts: Object.freeze({
      he: burst(
        [2.5, 2.4, 2.2, 2.0, 1.6, 1.0],
        [3, 3, 3, 3, 2, 1],
        [6, 1, -3, -6, -9, -15],
        [353, 100, 31, 16, 7, 2]
      ),
      heat: heat40mm
    }),
    pdfPage: 88,
    printedPage: 83
  }),
  Object.freeze({
    id: 'pzf-44',
    name: 'PZF 44 2A1 Lanze',
    country: 'W Germany',
    category: 'Anti-tank rocket',
    lengthIn: '35/46',
    weightLb: 22.7,
    reloadTimeActions: 28,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: 5.5,
    aimModifiers: Object.freeze({ 1: -28, 2: -18, 3: -11, 4: -9, 5: -7, 6: -6, 7: -4, 8: -3, 9: -2, 10: -1 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: Object.freeze({
      he: burst(
        [6.0, 5.9, 5.6, 5.4, 4.9, 3.9],
        [7, 7, 7, 7, 7, 6],
        [15, 3, 0, -3, -7, -12],
        [1300, 287, 81, 40, 17, 6]
      ),
      heat: pzfHeat
    }),
    pdfPage: 88,
    printedPage: 83
  }),
  Object.freeze({
    id: 'armbrust',
    name: 'Armbrust Anti-Tank Rocket',
    country: 'W Germany',
    category: 'Anti-tank rocket',
    lengthIn: 34,
    weightLb: 16.0,
    reloadTimeActions: 14,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: null,
    aimModifiers: Object.freeze({ 1: -26, 2: -16, 3: -10, 4: -8, 5: -6, 6: -5, 7: -4, 8: -3, 9: -2, 10: -1 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: Object.freeze({
      he: burst(
        [1.4, 1.2, 0.8, 0.6, 0.3, _],
        [1, 1, 1, 1, 1, _],
        ['*6', '*2', 38, 16, 5, _],
        [1100, 252, 72, 36, 16, 5]
      ),
      heat: pzfHeat
    }),
    pdfPage: 89,
    printedPage: 84
  }),
  Object.freeze({
    id: 'rpg-18',
    name: 'RPG 18 Anti-Tank Rocket',
    country: 'USSR',
    category: 'Anti-tank rocket',
    lengthIn: '28/39',
    weightLb: 14.3,
    reloadTimeActions: 20,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: null,
    aimModifiers: Object.freeze({ 1: -25, 2: -15, 3: -10, 4: -8, 5: -6, 6: -5, 7: -4, 8: -2 }),
    rounds: Object.freeze(['heat']),
    bursts: Object.freeze({
      heat: burst(
        [4.8, 4.7, 4.5, 4.3, 3.9, 3.1],
        [7, 7, 6, 6, 6, 5],
        [15, 3, 0, -3, -6, -12],
        [1000, 232, 67, 34, 15, 5]
      )
    }),
    pdfPage: 89,
    printedPage: 84
  }),
  Object.freeze({
    id: 'rpg-7v',
    name: 'RPG 7V Rocket Propelled Grenade',
    country: 'USSR',
    category: 'Anti-tank rocket',
    lengthIn: '39/54',
    weightLb: 20.4,
    reloadTimeActions: 15,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: 5,
    aimModifiers: Object.freeze({ 1: -28, 2: -18, 3: -11, 4: -9, 5: -7, 6: -6, 7: -5, 8: -4, 9: -3, 10: -2, 11: -1, 12: 0 }),
    rounds: Object.freeze(['he', 'heat']),
    bursts: Object.freeze({
      he: burst(
        [8.1, 8.0, 7.7, 7.5, 7.0, 5.9],
        [9, 9, 9, 8, 8, 8],
        [11, 2, -1, -4, -8, -13],
        [2400, 441, 115, 57, 24, 8]
      ),
      heat: burst(
        [7.2, 7.1, 6.9, 6.7, 6.2, 5.2],
        [8, 8, 8, 8, 8, 7],
        [11, 2, -1, -4, -8, -13],
        [2000, 393, 105, 52, 22, 7]
      )
    }),
    pdfPage: 89,
    printedPage: 84
  }),
  Object.freeze({
    id: 'law-80',
    name: 'LAW 80 Anti-Tank Rocket',
    country: 'UK',
    category: 'Anti-tank rocket',
    lengthIn: '39/59',
    weightLb: 21.2,
    reloadTimeActions: 20,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: null,
    aimModifiers: Object.freeze({ 1: -28, 2: -18, 3: -11, 4: -9, 5: -7, 6: -5, 7: -4, 8: -3, 9: -2, 10: -1 }),
    rounds: Object.freeze(['heat']),
    bursts: Object.freeze({
      heat: burst(
        [8.3, 8.2, 8.0, 7.7, 7.3, 6.2],
        [9, 9, 9, 9, 9, 8],
        [10, 2, -1, -4, -8, -13],
        [2600, 480, 123, 60, 26, 9]
      )
    }),
    pdfPage: 89,
    printedPage: 84
  }),
  Object.freeze({
    id: 'm72-a2',
    name: 'M72 A2 LAW',
    country: 'USA',
    category: 'Anti-tank rocket',
    lengthIn: '26/35',
    weightLb: 5.2,
    reloadTimeActions: 14,
    rateOfFire: null,
    printedRateOfFire: '-',
    capacity: 1,
    ammunitionWeightLb: null,
    aimModifiers: Object.freeze({ 1: -20, 2: -11, 3: -8, 4: -6, 5: -5, 6: -4, 7: -3, 8: -2 }),
    rounds: Object.freeze(['heat']),
    bursts: Object.freeze({
      heat: burst(
        [5.0, 4.9, 4.7, 4.5, 4.1, 3.3],
        [7, 7, 7, 7, 6, 5],
        [15, 3, 0, -3, -7, -12],
        [1100, 245, 70, 36, 15, 5]
      )
    }),
    pdfPage: 89,
    printedPage: 84
  })
]);

// Flat burst tables for structural catalogue checks (unique id-round keys).
export const launcherRounds = Object.freeze(Object.fromEntries(
  launchers.flatMap(launcher => launcher.rounds.map(key => [`${launcher.id}-${key}`, launcher.bursts[key]]))
));

export const launchersById = Object.fromEntries(launchers.map(launcher => [launcher.id, launcher]));

function burstSize(printed) {
  const match = /^\*(\d+)$/.exec(printed ?? '');
  return match ? Number(match[1]) : null;
}

export function launcherItem(id, options = {}) {
  const launcher = launchersById[id];
  if (!launcher) throw new Error(`No launcher is transcribed under "${id}".`);
  return launcherItemFor(launcher, options);
}

// The Item for any launcher entry of this shape, core or supplement. `source` is the table.
export function launcherItemFor(launcher, { loadedRounds = 1, ammunitionItemId = null, chamber = 'ready', source = launcherSource } = {}) {
  const printed = launcher.printedRateOfFire ?? '-';
  return {
    name: launcher.name, type: 'weapon',
    system: {
      schemaVersion: 1, catalogId: launcher.id, catalogRevision: '', weightLb: launcher.weightLb,
      quantity: 1, carried: true, equipped: true, attachedToId: null, weightNote: '', notes: '',
      source: {
        bookId: source.book === 'LEG10200' ? '' : source.book, table: source.table, section: '3.6',
        pdfPage: launcher.pdfPage, verification: 'visual', note: ''
      },
      selectedModeId: 'fire',
      firearmModes: {
        fire: {
          // `*N` fires a burst of grenades (grenade-burst.mjs) as well as a single round.
          // A bare `*` chambers itself; `-` pays Reload Time.
          skill: 'gun', fireTypes: burstSize(printed) ? ['single', 'automatic'] : ['single'],
          aimModifiers: { ...launcher.aimModifiers },
          rateOfFire: launcher.rateOfFire, burstRounds: burstSize(printed),
          sustainedBurstPenalty: launcher.sustainedBurstPenalty ?? null,
          minimumArc: launcher.minimumArc ? structuredClone(launcher.minimumArc) : {},
          feed: printed === '-' ? 'single-load' : 'self-loading',
          capacity: launcher.capacity, reloadTimeActions: launcher.reloadTimeActions,
          armTimeActions: null, throwRangeHexes: null,
          ammunition: Object.fromEntries(launcher.rounds.map(key => [key, {
            pelletNumber: null, fusePhases: launcher.fusePhasesByRound?.[key] ?? null, ranges: {}, burst: structuredClone(launcher.bursts[key])
          }]))
        }
      },
      meleeModes: {},
      loaded: { ammunitionItemId, rounds: loadedRounds, chamber }
    }
  };
}

export function launcherAmmunitionItem(launcherId, options = {}) {
  const launcher = launchersById[launcherId];
  if (!launcher) throw new Error(`No launcher is transcribed under "${launcherId}".`);
  return launcherAmmunitionItemFor(launcher, options);
}

export function launcherAmmunitionItemFor(launcher, { quantity = 4, roundKey = null, source = launcherSource } = {}) {
  const key = roundKey ?? launcher.rounds[0];
  if (!launcher.rounds.includes(key)) throw new Error(`The ${launcher.name} prints no "${key}" round.`);
  const packaged = launcher.ammunitionUnit && launcher.ammunitionUnit !== 'round';
  // A weight printed per round type (the Sturmpistole prints HC 1.3 and HE .9) wins.
  const perRound = launcher.ammunitionWeightByRound && Object.hasOwn(launcher.ammunitionWeightByRound, key);
  const stated = perRound || Object.hasOwn(launcher, 'ammunitionWeightLb');
  const weight = perRound ? launcher.ammunitionWeightByRound[key] : launcher.ammunitionWeightLb;
  return {
    name: `${launcher.name} ${key.toUpperCase()}`, type: 'ammunition',
    system: {
      schemaVersion: 1, catalogId: `${launcher.id}-${key}`, catalogRevision: '',
      weightLb: stated ? weight : 0.5,
      quantity, carried: true, equipped: false, attachedToId: null,
      weightNote: stated && weight == null ? 'The page prints no AW for this round.' : '',
      notes: '',
      ammunitionKey: key, compatibleCatalogIds: [launcher.id],
      ...(packaged ? {
        packageCapacity: launcher.capacity,
        packageCount: Math.ceil(quantity / launcher.capacity),
        packageUnit: launcher.ammunitionUnit
      } : {}),
      source: {
        bookId: source.book === 'LEG10200' ? '' : source.book, table: source.table, section: '3.6',
        pdfPage: launcher.pdfPage, verification: 'visual', note: ''
      }
    }
  };
}
