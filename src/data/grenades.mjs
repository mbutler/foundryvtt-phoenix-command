// Grenades and explosives, LEG10200 PDF 90 / printed 85, "Grenades and Explosives / Tech
// Level 13". Every row on that page is transcribed, read off renders of the page at 1500px
// per half-column. The sibling library's explosive objects were not copied.
//
// The page prints seven explosion columns — C, 0, 1, 2, 3, 5 and 10 hexes from the burst —
// and leaves cells blank where the value runs out. Each row below is written left to right
// from the C column with `_` standing for a blank cell, so the arrays line up with the page
// and a blank can be told from a zero. Those are different things: Type 82 prints a BSHC of
// 0 at 5 hexes, which §3.7 can still shift upward, where a blank prints no chance at all.
//
// A blast grenade prints a PEN and a DC in the contact column and no BSHC anywhere. §3.6
// makes the BSHC "the chance of hitting with shrapnel", so a column without one throws no
// shrapnel and does concussion only (D47). The contact PEN is stored as printed; nothing
// reads it yet, because the armour case it belongs to (§3.6's "detonates on the armor's
// surface") is a vehicle rule.
//
// Printed suffixes are the Physical Damage ones (PDF 28): H is x100, K is x1,000, T is
// x10,000, X is x100,000 and M is x1,000,000, so *3h is 300 pieces, 13k is 13,000 PD and
// 59t is 590,000 PD. They are expanded here.
//
// Fuse Length "I" is an impact fuse and is stored as null. A demolition charge prints "V"
// for both Arm Time and Fuse Length — they are whatever it is rigged for — and both are
// stored as null, so a throw is refused until a GM states them (D48).
//
// Arm Time is in Combat Actions and the throw Range is in 2-yard hexes from a kneeling
// stance, as §3.6 defines them.

import { grenadeAim_4H } from './explosive-tables.mjs';

const burstColumns = ['C', 0, 1, 2, 3, 5, 10];
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

export const grenadeSource = Object.freeze({
  book: 'LEG10200', pdfPage: 90, printedPage: 85, table: 'Grenades and Explosives', verification: 'visual'
});

// id, name, country, L (in), W (lb), AT (AC), FL (phases), R (hexes), then the four printed rows.
const printed = [
  ['hg78', 'Austrian HG 78 Frag Grenade', 'Austria', 'frag', 4.5, 1.2, 3, 2, 14,
    [2.6, 1.4, 1.2, 0.8, 0.6, 0.3, _],
    [10, 1, 1, 1, 1, 1, _],
    ['*2000', '*23', '*6', '*1', 64, 22, _],
    [6000, 414, 114, 35, 18, 8, 3]],
  ['of-hg78', 'Austrian OF HG 78 Blast Grenade', 'Austria', 'blast', 4.5, 0.5, 3, 2, 21,
    [2.6, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [6000, 414, 114, 35, 18, 8, 3]],
  ['hg80', 'Austrian HG 80 Mini Grenade', 'Austria', 'frag', 3.0, 0.4, 3, 2, 25,
    [1.6, 1.4, 1.2, 0.8, 0.6, 0.3, _],
    [10, 1, 1, 1, 1, 1, _],
    ['*300', '*4', '*1', 25, 11, 3, _],
    [1400, 158, 49, 16, 8, 4, 1]],
  ['nr423', 'Belgian NR 423 Frag Grenade', 'Belgium', 'frag', 3.2, 0.5, 3, 2, 21,
    [2.5, 1.8, 1.6, 1.2, 1.0, 0.6, _],
    [10, 2, 2, 1, 1, 1, _],
    ['*300', '*4', 94, 23, 10, 3, _],
    [5200, 376, 105, 33, 17, 7, 2]],
  ['nr446', 'Belgian NR 446 Blast Grenade', 'Belgium', 'blast', 3.2, 0.6, 3, 2, 20,
    [2.8, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [7300, 468, 126, 39, 20, 9, 3]],
  ['type59', 'Chinese Type 59 Frag Grenade', 'China', 'frag', 4.5, 0.7, 3, 2, 18,
    [3.1, 2.9, 2.7, 2.3, 2.0, 1.4, 0.7],
    [10, 3, 3, 2, 2, 2, 1],
    ['*200', '*3', 69, 16, 7, 2, -1],
    [9400, 554, 145, 44, 22, 10, 3]],
  ['type82', 'Chinese Type 82 Frag Grenade', 'China', 'frag', 3.3, 0.6, 5, 2, 20,
    [3.3, 3.2, 2.9, 2.5, 2.2, 1.6, 0.8],
    [10, 3, 3, 3, 2, 2, 1],
    ['*90', '*1', 31, 7, 3, 0, -4],
    [5300, 383, 107, 33, 17, 7, 2]],
  ['df37', 'French DF 37 Frag Grenade', 'France', 'frag', 3.9, 1.2, 3, 2, 14,
    [2.4, 1.9, 1.9, 1.7, 1.6, 1.4, 1.0],
    [10, 3, 3, 3, 3, 3, 2],
    ['*30', 41, 10, 2, 0, -3, -8],
    [4900, 360, 101, 32, 16, 7, 2]],
  ['of37', 'French OF 37 Blast Grenade', 'France', 'blast', 3.7, 0.3, 3, 2, 27,
    [2.8, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [7700, 485, 130, 40, 20, 9, 3]],
  ['mdn21', 'West German MDN 21 Frag Grenade', 'W Germany', 'frag', 3.3, 0.5, 3, 2, 21,
    [2.2, 1.4, 1.2, 0.8, 0.6, 0.3, _],
    [10, 1, 1, 1, 1, 1, _],
    ['*700', '*9', '*2', 57, 25, 8, _],
    [4000, 316, 91, 28, 15, 6, 2]],
  ['dm51', 'West German DM 51 Frag Grenade', 'W Germany', 'frag', 3.9, 1.0, 3, 2, 15,
    [2.7, 1.4, 1.1, 0.8, 0.5, _, _],
    [10, 1, 1, 1, 1, _, _],
    ['*2000', '*27', '*7', '*2', 75, _, _],
    [6900, 453, 123, 38, 19, 8, 3]],
  ['m26a2-israel', 'Israeli M26 A2 Frag Grenade', 'Israel', 'frag', 4.2, 0.9, 3, 2, 15,
    [3.3, 2.4, 2.2, 1.8, 1.5, 1.0, 0.4],
    [10, 2, 2, 2, 2, 1, 1],
    ['*300', '*4', '*1', 25, 11, 3, 0],
    [13000, 684, 171, 51, 26, 11, 4]],
  ['no14', 'Israeli #14 Blast Grenade', 'Israel', 'blast', 5.3, 0.7, 3, 2, 18,
    [3.7, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [17000, 840, 202, 59, 30, 13, 4]],
  ['mu50', 'Italian MU 50 Frag Grenade', 'Italy', 'frag', 2.8, 0.4, 3, 2, 23,
    [2.2, 1.4, 1.2, 0.8, 0.6, 0.3, _],
    [10, 1, 1, 1, 1, 1, _],
    ['*400', '*6', '*1', 36, 15, 5, _],
    [3600, 295, 85, 27, 14, 6, 2]],
  ['rgd5', 'Soviet RGD 5 Frag Grenade', 'USSR', 'frag', 4.5, 0.7, 3, 2, 18,
    [3.1, 2.9, 2.7, 2.3, 2.0, 1.4, 0.7],
    [10, 3, 3, 2, 2, 2, 1],
    ['*200', '*3', 69, 16, 7, 2, -1],
    [9400, 554, 145, 44, 22, 10, 3]],
  ['rkg3m', 'Soviet RKG 3M Anti-Tank Grenade', 'USSR', 'antitank', 14.3, 2.4, 3, null, 10,
    [2800, 10, 9.7, 9.2, 8.7, 7.8, 6.0],
    [10, 8, 8, 8, 7, 7, 6],
    ['*9', 12, 2, -1, -4, -7, -12],
    [54000, 1900, 379, 102, 50, 22, 7]],
  ['l2a2', 'British L2 A2 Frag Grenade', 'UK', 'frag', 3.3, 0.9, 3, 2, 16,
    [3.5, 2.4, 2.2, 1.8, 1.5, 1.0, 0.4],
    [10, 2, 2, 2, 2, 1, 1],
    ['*200', '*3', 77, 19, 8, 2, -1],
    [15000, 747, 184, 55, 28, 12, 4]],
  ['m67', 'US M67 Frag Grenade', 'USA', 'frag', 3.5, 0.9, 3, 2, 16,
    [5.0, 4.9, 4.8, 4.5, 4.2, 3.7, 2.6],
    [10, 6, 6, 5, 5, 5, 4],
    ['*23', 31, 7, 1, 0, -4, -9],
    [16000, 779, 190, 56, 29, 12, 4]],
  ['m68', 'US M68 Frag Grenade', 'USA', 'frag', 3.5, 0.9, 3, null, 16,
    [5.1, 5.0, 4.8, 4.5, 4.2, 3.7, 2.7],
    [10, 6, 6, 5, 5, 5, 4],
    ['*21', 28, 6, 1, -1, -4, -9],
    [16000, 791, 192, 57, 29, 12, 4]],
  ['m61', 'US M61 Frag Grenade', 'USA', 'frag', 3.8, 1.0, 3, 2, 15,
    [3.4, 2.4, 2.2, 1.8, 1.5, 1.0, 0.4],
    [10, 2, 2, 2, 2, 1, 1],
    ['*200', '*3', 84, 20, 8, 2, -1],
    [13000, 704, 176, 52, 27, 12, 4]],
  ['m26a2', 'US M26A2 Frag Grenade', 'USA', 'frag', 3.9, 1.0, 3, null, 15,
    [3.4, 2.4, 2.2, 1.8, 1.5, 1.0, 0.4],
    [10, 2, 2, 2, 2, 1, 1],
    ['*300', '*4', '*1', 25, 11, 3, 0],
    [13000, 704, 176, 52, 27, 12, 4]],
  ['mka3', 'US Mk A3 Blast Grenade', 'USA', 'blast', 5.3, 1.0, 3, 2, 15,
    [3.8, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [20000, 928, 218, 63, 32, 14, 4]],
  ['tnt-2lb', '2 lb TNT Charge', 'USA', 'demolition', 3.8, 2.0, null, null, 11,
    [6.1, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [92000, 2900, 520, 131, 64, 27, 9]],
  ['tnt-10lb', '10 lb TNT Charge', 'USA', 'demolition', 6.5, 10.0, null, null, 5,
    [10, _, _, _, _, _, _],
    [10, _, _, _, _, _, _],
    [_, _, _, _, _, _, _],
    [590000, 15000, 1900, 347, 153, 61, 19]]
];

export const grenades = Object.freeze(printed.map(
  ([id, name, country, ammoKey, lengthIn, weightLb, armTime, fusePhases, throwRangeHexes, pens, dcs, chances, concussions]) =>
    Object.freeze({
      id, name, country, ammoKey, lengthIn, weightLb, armTime, fusePhases, throwRangeHexes,
      burst: burst(pens, dcs, chances, concussions)
    })
));

export const grenadesById = Object.fromEntries(grenades.map(grenade => [grenade.id, grenade]));

export function grenadeItem(id, options = {}) {
  const grenade = grenadesById[id];
  if (!grenade) throw new Error(`No grenade is transcribed under "${id}".`);
  return grenadeItemFor(grenade, options);
}

// Any grenade entry of this shape, core or supplement; `source` is its table.
const sourceFor = (grenade, source) => ({ bookId: source.book === 'LEG10200' ? '' : source.book, table: source.table, section: '3.6',
  pdfPage: grenade.pdfPage ?? source.pdfPage, verification: 'visual', note: '' });
export function grenadeItemFor(grenade, { loadedRounds = 1, ammunitionItemId = null, source = grenadeSource } = {}) {
  return {
    name: grenade.name, type: 'weapon',
    system: {
      schemaVersion: 1, catalogId: grenade.id, catalogRevision: '', weightLb: grenade.weightLb,
      quantity: 1, carried: true, equipped: true, attachedToId: null, weightNote: '', notes: '',
      source: sourceFor(grenade, source),
      selectedModeId: 'throw',
      firearmModes: {
        throw: {
          skill: 'gun', fireTypes: ['single'],
          aimModifiers: Object.fromEntries(grenadeAim_4H.map(row => [row.actions, row.alm])),
          rateOfFire: null, burstRounds: null, sustainedBurstPenalty: null, minimumArc: {},
          // A grenade does not chamber. Self-loading leaves the chamber field unread.
          feed: 'self-loading', capacity: null, reloadTimeActions: null,
          armTimeActions: grenade.armTime,
          throwRangeHexes: grenade.throwRangeHexes,
          ammunition: {
            [grenade.ammoKey]: {
              pelletNumber: null, fusePhases: grenade.fusePhases, ranges: {},
              burst: structuredClone(grenade.burst)
            }
          }
        }
      },
      meleeModes: {},
      loaded: { ammunitionItemId, rounds: loadedRounds, chamber: 'unknown' }
    }
  };
}

export function grenadeAmmunitionItem(id, options = {}) {
  const grenade = grenadesById[id];
  if (!grenade) throw new Error(`No grenade is transcribed under "${id}".`);
  return grenadeAmmunitionItemFor(grenade, options);
}

export function grenadeAmmunitionItemFor(grenade, { quantity = 1, source = grenadeSource } = {}) {
  return {
    name: `${grenade.name} charge`, type: 'ammunition',
    system: {
      schemaVersion: 1, catalogId: `${grenade.id}-${grenade.ammoKey}`, catalogRevision: '', weightLb: grenade.weightLb,
      quantity, carried: true, equipped: false, attachedToId: null, weightNote: '', notes: '',
      ammunitionKey: grenade.ammoKey, compatibleCatalogIds: [grenade.id],
      source: sourceFor(grenade, source)
    }
  };
}
