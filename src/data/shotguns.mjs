// Shotguns, LEG10200 PDF 86 / printed 81, "Shotguns / Tech Level 13".
//
// Transcribed from renders of that page on 21 September 2026, with each ballistic number
// placed on a range column by its position on the page. The sibling library's two shotgun
// objects were not copied: its SPAS 12 stores Rate of Fire 1 where the page prints a bare
// `*`, Ballistic Accuracy 61 at one hex where the page prints 71, and a Shot BPHC of 19 at
// 80 hexes where the page prints 5.
//
// The first range column prints a Shotgun ALM and a Pattern Radius and no Base Pellet Hit
// Chance, on every weapon. That blank is stored as null, not as the Pellet Number printed
// beside the shot type — those are different cells, and the Pellet Number is `pelletNumber`.
//
// Ballistic Accuracy and Time of Flight are on the page and unused, the same as the automatic
// catalogue. Minimum Arc is stored only for the Atchisson, which is the one weapon here that
// prints it, because it is the one that fires a burst.

const ranges = [1, 2, 4, 6, 8, 10, 15, 20, 30, 40, 80];
const feet = hexes => hexes * 6;

function bphc(token) {
  if (token == null) return { pelletChance: null, pelletRounds: null };
  if (typeof token === 'string') return { pelletChance: null, pelletRounds: Number(token.slice(1)) };
  return { pelletChance: token, pelletRounds: null };
}

function columns(pens, dcs, salms, chances, radii) {
  return Object.fromEntries(ranges.map((hexes, i) => [`r${hexes}`, {
    distanceFeet: feet(hexes), penetration: pens[i], damageClass: dcs[i],
    salm: salms ? salms[i] : null,
    ...(chances ? bphc(chances[i]) : { pelletChance: null, pelletRounds: null }),
    patternRadiusHexes: radii ? radii[i] : null
  }]));
}

const slug = (pens, dcs) => columns(pens, dcs, null, null, null);

const spasSalm = [-13, -8, -3, 0, 2, 4, 7, 9, 12, 14, 19];
const pumpSalm = [-14, -9, -4, -1, 1, 2, 5, 7, 10, 12, 17];
const cawsSalm = [-13, -8, -3, 0, 2, 4, 7, 9, 11, 14, 19];
const tightRadius = [0, 0, 0, 0.1, 0.1, 0.1, 0.2, 0.2, 0.3, 0.4, 0.9];
const pumpRadius = [0, 0, 0, 0.1, 0.1, 0.1, 0.1, 0.2, 0.3, 0.4, 0.7];
const spasShotPen = [5.3, 1.6, 1.5, 1.5, 1.4, 1.4, 1.3, 1.2, 1.1, 0.9, 0.5];
const spasShotDc = [8, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1];
const pumpShotDc = [8, 3, 3, 3, 3, 3, 2, 2, 2, 2, 1];
const closeShotDc = [8, 3, 3, 2, 2, 2, 2, 2, 2, 2, 1];
const spasBphc = [null, '*11', '*10', '*9', '*5', '*4', '*2', 94, 42, 24, 5];
const pumpBphc = [null, '*11', '*10', '*9', '*7', '*5', '*2', '*1', 62, 35, 8];
const cawsBphc = [null, '*7', '*7', '*6', '*4', '*2', '*1', 66, 30, 16, 3];
const closeBphc = [null, '*11', '*10', '*9', '*5', '*3', '*2', 93, 42, 23, 5];
const rifleSlugPen = [7.0, 7.0, 6.9, 6.9, 6.8, 6.7, 6.6, 6.5, 6.3, 6.0, 5.2];
const rifleSlugDc = [10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 8];

const source = (note) => ({
  bookId: 'LEG10200', table: 'Shotguns', section: 'weapon data', pdfPage: 86,
  verification: 'visual', note
});

export const shotgunSource = Object.freeze({
  book: 'LEG10200', pdfPage: 86, printedPage: 81,
  status: 'transcribed-from-the-page',
  blankFirstBphc: 'The 1-hex column prints SALM and PR and no BPHC. The number beside the shot type is the Pellet Number, not that cell.'
});

export const shotguns = Object.freeze([
  {
    id: 'spas-12', name: 'Franchi SPAS 12', gauge: '12', country: 'Italy',
    description: 'Special Purpose Automatic Shotgun for police and military. The APS entry is for a special Armor Piercing Slug.',
    weightLb: 10.1, lengthIn: '28/37', reloadTimeActions: 30, capacity: 7,
    feedDevice: 'Rnd', knockDown: 23, sab: 10,
    aimModifiers: { 1: -23, 2: -13, 3: -9, 4: -7, 5: -6, 6: -4, 7: -3, 8: -2, 9: -1 },
    feed: 'self-loading', fireTypes: ['single'],
    ammunition: {
      aps: { pelletNumber: null, ranges: slug([21, 21, 21, 21, 21, 21, 21, 20, 20, 19, 18], [9, 9, 9, 9, 9, 9, 9, 9, 9, 9, 8]) },
      shot: { pelletNumber: 12, ranges: columns(spasShotPen, spasShotDc, spasSalm, spasBphc, tightRadius) }
    }
  },
  {
    id: 'caws', name: 'Olin-Heckler & Koch CAWS', gauge: '12', country: 'USA',
    description: 'Close Assault Weapon System uses a belted brass cartridge.',
    weightLb: 11.6, lengthIn: '30', reloadTimeActions: 8, capacity: 10,
    feedDevice: 'Mag', knockDown: 23, sab: 10,
    aimModifiers: { 1: -24, 2: -14, 3: -9, 4: -7, 5: -5, 6: -4, 7: -3, 8: -2, 9: -1, 10: 0, 12: 2 },
    feed: 'self-loading', fireTypes: ['single'],
    ammunition: {
      slug: { pelletNumber: null, ranges: slug([7.0, 7.0, 6.9, 6.9, 6.8, 6.7, 6.6, 6.5, 6.3, 6.0, 5.2], [10, 10, 10, 10, 10, 10, 9, 9, 9, 9, 8]) },
      shot: { pelletNumber: 8, ranges: columns([5.6, 2.4, 2.4, 2.3, 2.3, 2.2, 2.1, 2.0, 1.7, 1.5, 0.9], [8, 4, 4, 4, 4, 4, 3, 3, 3, 3, 2], cawsSalm, cawsBphc, tightRadius) }
    }
  },
  {
    id: 'mossberg-bullpup-12', name: 'Mossberg Bullpup 12', gauge: '12', country: 'USA',
    description: 'Mossberg 500 action in a military style stock. This weapon is designed for military and law enforcement use.',
    weightLb: 9.4, lengthIn: '31', reloadTimeActions: 34, capacity: 8,
    feedDevice: 'Rnd', knockDown: 24, sab: 11,
    aimModifiers: { 1: -23, 2: -12, 3: -9, 4: -7, 5: -6, 6: -5, 7: -4, 8: -3, 9: -2, 10: -1 },
    feed: 'manual', rateOfFire: 2, fireTypes: ['single'],
    ammunition: {
      slug: { pelletNumber: null, ranges: slug([7.5, 7.4, 7.4, 7.3, 7.3, 7.2, 7.1, 7.0, 6.7, 6.5, 5.6], [10, 10, 10, 10, 10, 10, 10, 10, 9, 9, 9]) },
      shot: { pelletNumber: 12, ranges: columns([5.4, 1.7, 1.6, 1.6, 1.6, 1.5, 1.4, 1.3, 1.1, 1.0, 0.6], pumpShotDc, pumpSalm, pumpBphc, pumpRadius) }
    }
  },
  {
    id: 'remington-m870', name: 'Remington M870', gauge: '12', country: 'USA',
    description: 'US Marine Corps version of the Remington Model 870. It was adopted in 1966 and has a standard M7 bayonet mounting lug.',
    weightLb: 8.8, lengthIn: '42', reloadTimeActions: 30, capacity: 7,
    feedDevice: 'Rnd', knockDown: 25, sab: 12,
    aimModifiers: { 1: -23, 2: -12, 3: -9, 4: -7, 5: -6, 6: -4, 7: -3, 8: -2 },
    feed: 'manual', rateOfFire: 2, fireTypes: ['single'],
    ammunition: {
      slug: { pelletNumber: null, ranges: slug([7.7, 7.7, 7.6, 7.5, 7.5, 7.4, 7.3, 7.2, 6.9, 6.7, 5.7], [10, 10, 10, 10, 10, 10, 10, 10, 10, 9, 9]) },
      shot: { pelletNumber: 12, ranges: columns([5.4, 1.7, 1.7, 1.6, 1.6, 1.6, 1.4, 1.4, 1.2, 1.0, 0.6], pumpShotDc, pumpSalm, pumpBphc, pumpRadius) }
    }
  },
  {
    id: 'high-standard-m10b', name: 'High Standard M10B', gauge: '12', country: 'USA',
    description: 'Compact shotgun for police tactical teams.',
    weightLb: 9.5, lengthIn: '27', reloadTimeActions: 22, capacity: 5,
    feedDevice: 'Rnd', knockDown: 23, sab: 10,
    aimModifiers: { 1: -23, 2: -12, 3: -9, 4: -7, 5: -6, 6: -4, 7: -3, 8: -2 },
    feed: 'self-loading', fireTypes: ['single'],
    ammunition: {
      slug: { pelletNumber: null, ranges: slug(rifleSlugPen, rifleSlugDc) },
      shot: { pelletNumber: 12, ranges: columns(spasShotPen, closeShotDc, spasSalm, closeBphc, tightRadius) }
    }
  },
  {
    id: 'atchisson-assault-12', name: 'Atchisson Assault 12', gauge: '12', country: 'USA',
    description: 'Fully automatic, high capacity, drum fed shotgun. Very few were produced and it has not been adopted by any military.',
    weightLb: 16.1, lengthIn: '39', reloadTimeActions: 14, capacity: 20,
    feedDevice: 'Drm', knockDown: 23, sab: 8, burstRounds: 4,
    aimModifiers: { 1: -26, 2: -16, 3: -10, 4: -8, 5: -7, 6: -5, 7: -4, 8: -3, 9: -2, 10: -1, 12: 0 },
    feed: 'self-loading', fireTypes: ['single', 'automatic'],
    minimumArc: [0.1, 0.2, 0.3, 0.5, 0.7, 0.8, 1, 2, 2, 3, 7],
    ammunition: {
      slug: { pelletNumber: null, ranges: slug(rifleSlugPen, rifleSlugDc) },
      shot: { pelletNumber: 12, ranges: columns(spasShotPen, closeShotDc, spasSalm, closeBphc, tightRadius) }
    }
  }
].map(weapon => Object.freeze({ ...weapon, aimModifiers: Object.freeze(weapon.aimModifiers) })));

export const shotgunsById = Object.freeze(Object.fromEntries(shotguns.map(weapon => [weapon.id, weapon])));

// The shape a Foundry weapon Item stores. Catalog notes that the item schema has no field
// for (knockdown, length, the feed device) stay on the catalogue entry above.
export function shotgunItem(id, options = {}) {
  const weapon = shotgunsById[id];
  if (!weapon) throw new Error(`No transcribed shotgun "${id}".`);
  return shotgunItemFor(weapon, options);
}

// Any shotgun entry of this shape, core or supplement. `source` overrides LEG10200 PDF 86.
export { ranges as shotgunRanges, columns as shotgunColumns, slug as shotgunSlug };
export function shotgunItemFor(weapon, { loadedRounds = null, ammunitionItemId = null, chamber = 'ready', source: book = null } = {}) {
  const minimumArc = weapon.minimumArc
    ? Object.fromEntries(ranges.map((hexes, i) => [`r${hexes}`, { distanceFeet: feet(hexes), arcHexes: weapon.minimumArc[i] }]))
    : {};
  const aimModifiers = Object.fromEntries(Object.entries(weapon.aimModifiers).map(([actions, alm]) => [actions, alm]));
  return {
    id: weapon.id, name: weapon.name, type: 'weapon',
    system: {
      weightLb: weapon.weightLb, quantity: 1, carried: true, equipped: true, catalogId: weapon.id,
      source: book ?? source(`PDF 86, ${weapon.name}. ${weapon.description}`),
      selectedModeId: 'shotgun',
      firearmModes: {
        shotgun: {
          skill: 'gun', fireTypes: [...weapon.fireTypes], aimModifiers,
          rateOfFire: weapon.rateOfFire ?? null,
          burstRounds: weapon.burstRounds ?? null,
          sustainedBurstPenalty: weapon.sab,
          minimumArc, feed: weapon.feed,
          capacity: weapon.capacity, reloadTimeActions: weapon.reloadTimeActions,
          ammunition: structuredClone(weapon.ammunition)
        }
      },
      loaded: {
        ammunitionItemId,
        rounds: loadedRounds ?? weapon.capacity,
        chamber: weapon.feed === 'self-loading' ? 'ready' : chamber
      },
      notes: weapon.description
    }
  };
}
