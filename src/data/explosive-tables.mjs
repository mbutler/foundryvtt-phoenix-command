// Explosive tables from LEG10200, read from the page on 21 September 2026.
//
// Table 4H is printed in §3.6 (PDF 34) and again on PDF 63. The throw example uses the
// 4-action row, −12, which is what both printings give.
//
// Table 5B is PDF 64. The worked example multiplies a man "behind solid cover" by .01 and
// gets .12, which it calls 0 PD. The table prints .01 on In Power Armor and 0 on Behind
// Solid Cover. The table is what a lookup uses. The basic rule (§2.11) also gives a man
// completely behind solid cover no explosive damage. Both readings give that example 0 PD.
//
// Table 5C is PDF 64. Its "Difference in SA" column is the EAL gap §3.6 describes, despite
// the heading. Table 3D (PDF 62) is the basic game's concussion table. §3.6 does not read
// it; a blast uses the weapon's own Base Concussion. The two are not the same numbers:
// 3D's frag grenade in the open is 180 PD at 1 hex, and the M26A2's own column is 176.
//
// The H/K suffixes are the weapon-table key (PDF 29): H ×100, K ×1,000. Table 5D is
// transcribed and is not the play path. §3.6 sends shrapnel hit location "the normal way",
// which is Table 6A, and never names 5D.

export const explosiveTableSource = Object.freeze({
  book: 'LEG10200', pdfPages: Object.freeze([34, 62, 63, 64]),
  printedPages: Object.freeze([29, 57, 58, 59]), tables: Object.freeze(['3D', '4H', '5B', '5C', '5D'])
});

// Grenade Aim Time Table (4H). Actions that are not printed are not interpolated.
export const grenadeAim_4H = Object.freeze([
  Object.freeze({ actions: 1, alm: -26 }),
  Object.freeze({ actions: 2, alm: -18 }),
  Object.freeze({ actions: 3, alm: -14 }),
  Object.freeze({ actions: 4, alm: -12 }),
  Object.freeze({ actions: 6, alm: -11 }),
  Object.freeze({ actions: 8, alm: -10 })
]);

// Blast Modifiers (5B). One row is a multiplier on Base Concussion.
export const blastModifiers_5B = Object.freeze([
  Object.freeze({ name: 'Underwater', modifier: 10 }),
  Object.freeze({ name: 'In Small Room (10\')', modifier: 5 }),
  Object.freeze({ name: 'In Open Trench', modifier: 3 }),
  Object.freeze({ name: 'In the Open', modifier: 1 }),
  Object.freeze({ name: 'Prone', modifier: 0.75 }),
  Object.freeze({ name: 'Under Partial Cover', modifier: 0.5 }),
  Object.freeze({ name: 'In Combat Suit', modifier: 0.25 }),
  Object.freeze({ name: 'In Power Armor', modifier: 0.01 }),
  Object.freeze({ name: 'Behind Solid Cover', modifier: 0 })
]);

// Shot Scatter (5C). Inclusive difference, then hexes.
export const shotScatter_5C = Object.freeze([
  Object.freeze({ from: 1, to: 7, hexes: 1 }),
  Object.freeze({ from: 8, to: 11, hexes: 2 }),
  Object.freeze({ from: 12, to: 13, hexes: 3 }),
  Object.freeze({ from: 14, to: 15, hexes: 4 }),
  Object.freeze({ from: 16, to: 17, hexes: 5 }),
  Object.freeze({ from: 18, to: 19, hexes: 6 }),
  Object.freeze({ from: 20, to: 21, hexes: 8 }),
  Object.freeze({ from: 22, to: 22, hexes: 10 }),
  Object.freeze({ from: 23, to: 23, hexes: 12 }),
  Object.freeze({ from: 24, to: 24, hexes: 14 }),
  Object.freeze({ from: 25, to: 25, hexes: 16 }),
  Object.freeze({ from: 26, to: 26, hexes: 19 }),
  Object.freeze({ from: 27, to: 27, hexes: 21 }),
  Object.freeze({ from: 28, to: 28, hexes: 25 })
]);

const columns = ['C', 0, 1, 2, 3, 5, 10];

function concussionRows(rows) {
  return Object.freeze(rows.map(values => Object.freeze(Object.fromEntries(columns.map((column, i) => [column, values[i]])))));
}

// Explosive Concussion (3D), basic game. Not read by §3.6.
export const explosiveConcussion_3D = Object.freeze({
  'Frag Grenade': Object.freeze({
    'In Open': concussionRows([[13000, 700, 180, 50, 30, 12, 4]])[0],
    'Partial Cover': concussionRows([[600, 350, 90, 25, 15, 6, 2]])[0],
    'Prone': concussionRows([[1000, 525, 135, 38, 22, 9, 3]])[0]
  }),
  'Blast Grenade': Object.freeze({
    'In Open': concussionRows([[20000, 900, 220, 60, 32, 14, 4]])[0],
    'Partial Cover': concussionRows([[10000, 450, 110, 30, 16, 7, 2]])[0],
    'Prone': concussionRows([[15000, 675, 165, 45, 24, 10, 3]])[0]
  }),
  '40mm Grenade': Object.freeze({
    'In Open': concussionRows([[3200, 273, 80, 25, 13, 6, 1]])[0],
    'Partial Cover': concussionRows([[1600, 136, 40, 12, 6, 3, 1]])[0],
    'Prone': concussionRows([[2400, 205, 60, 19, 10, 4, 1]])[0]
  })
});

// Body Hit Locations (5D). A star marks a location the footnote says body armor covers.
export const bodyHitLocations_5D = Object.freeze([
  Object.freeze({ from: 0, to: 3, location: 'Shoulder Glance', armored: false }),
  Object.freeze({ from: 4, to: 5, location: 'Shoulder Socket', armored: false }),
  Object.freeze({ from: 6, to: 7, location: 'Shoulder', armored: true }),
  Object.freeze({ from: 8, to: 13, location: 'Torso Glance', armored: true }),
  Object.freeze({ from: 14, to: 17, location: 'Base of Neck', armored: true }),
  Object.freeze({ from: 18, to: 19, location: 'Lung - Rib', armored: true }),
  Object.freeze({ from: 20, to: 23, location: 'Lung', armored: true }),
  Object.freeze({ from: 24, to: 25, location: 'Heart', armored: true }),
  Object.freeze({ from: 26, to: 27, location: 'Liver - Rib', armored: true }),
  Object.freeze({ from: 28, to: 29, location: 'Liver', armored: true }),
  Object.freeze({ from: 30, to: 31, location: 'Stomach - Rib', armored: true }),
  Object.freeze({ from: 32, to: 33, location: 'Stomach', armored: true }),
  Object.freeze({ from: 34, to: 35, location: 'Stomach - Kidney', armored: true }),
  Object.freeze({ from: 36, to: 37, location: 'Stomach - Spleen', armored: true }),
  Object.freeze({ from: 38, to: 41, location: 'Liver - Kidney', armored: true }),
  Object.freeze({ from: 42, to: 46, location: 'Liver - Spine', armored: true }),
  Object.freeze({ from: 47, to: 54, location: 'Intestines', armored: true }),
  Object.freeze({ from: 55, to: 60, location: 'Spine', armored: true }),
  Object.freeze({ from: 61, to: 82, location: 'Pelvis', armored: false }),
  Object.freeze({ from: 83, to: 99, location: 'Hip Socket', armored: false })
]);
