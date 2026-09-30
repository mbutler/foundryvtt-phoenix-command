// Small Arms Combat System (LEG10200) character generation tables, PDF 60 / printed 55.
// Read from rendered page images on 2026-09-20; the OCR text layer loses column
// alignment on every one of these tables and must not be used for them.
// See docs/basic-impulse-contract.md for the derivation chain and worked check.

export const characterTableSource = Object.freeze({
  book: 'Phoenix Command Small Arms Combat System',
  code: 'LEG10200',
  page: { pdf: 60, printed: 55 },
  status: 'visual-transcription',
  checkedOn: '2026-09-20'
});

// Table 1A columns are Encumbrance in pounds; rows are STR.
// A null is a printed blank: that combination has no Base Speed at all.
// It means "cannot", and must never be read as zero.
export const encumbranceColumnsLb = Object.freeze([10, 15, 20, 25, 30, 35, 40, 45, 50, 55, 60, 70, 80, 90, 100, 125, 150, 200]);

const baseSpeedByStrength = Object.freeze({
  21: [4.5, 4.5, 4, 4, 4, 3.5, 3.5, 3.5, 3.5, 3.5, 3, 3, 3, 3, 3, 2.5, 2.5, 2],
  20: [4.5, 4, 4, 3.5, 3.5, 3.5, 3.5, 3.5, 3, 3, 3, 3, 3, 2.5, 2.5, 2.5, 2.5, 2],
  19: [4, 4, 3.5, 3.5, 3, 3, 3, 3, 3, 2.5, 2.5, 2.5, 2.5, 2.5, 2, 2, 2, 1.5],
  18: [4, 3.5, 3.5, 3, 3, 3, 2.5, 2.5, 2.5, 2.5, 2.5, 2, 2, 2, 2, 1.5, 1.5, 1.5],
  17: [3.5, 3, 3, 3, 2.5, 2.5, 2.5, 2.5, 2, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1],
  16: [3.5, 3, 2.5, 2.5, 2.5, 2.5, 2, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1, 1, 1],
  15: [3, 3, 2.5, 2.5, 2, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, null],
  14: [3, 2.5, 2.5, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null],
  13: [3, 2.5, 2.5, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null],
  12: [3, 2.5, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null],
  11: [3, 2.5, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null],
  10: [3, 2.5, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null],
  9: [3, 2.5, 2, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null],
  8: [3, 2.5, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null],
  7: [2.5, 2.5, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null],
  6: [2.5, 2.5, 2, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1, null, null, null],
  5: [2.5, 2.5, 2, 2, 1.5, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1, null, null, null, null],
  4: [2.5, 2, 2, 1.5, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1, null, null, null, null, null, null],
  3: [2.5, 2, 1.5, 1.5, 1.5, 1, 1, 1, 1, 1, 1, null, null, null, null, null, null, null],
  2: [2, 1.5, 1.5, 1.5, 1, 1, 1, 1, null, null, null, null, null, null, null, null, null, null],
  1: [1.5, 1.5, 1, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null]
});
export const baseSpeedTable = baseSpeedByStrength;

// Table 1B columns are Base Speed; rows are AGI. No blanks are printed.
export const baseSpeedColumns = Object.freeze([1, 1.5, 2, 2.5, 3, 3.5, 4, 4.5]);

export const maximumSpeedTable = Object.freeze({
  21: [2, 4, 5, 7, 9, 10, 12, 13],
  20: [2, 4, 5, 7, 8, 10, 11, 13],
  19: [2, 4, 5, 7, 8, 10, 11, 12],
  18: [2, 4, 5, 6, 8, 9, 11, 12],
  17: [2, 3, 5, 6, 8, 9, 10, 12],
  16: [2, 3, 5, 6, 8, 9, 10, 11],
  15: [2, 3, 5, 6, 7, 9, 10, 11],
  14: [2, 3, 4, 6, 7, 8, 9, 11],
  13: [2, 3, 4, 6, 7, 8, 9, 10],
  12: [2, 3, 4, 5, 7, 8, 9, 10],
  11: [2, 3, 4, 5, 6, 7, 8, 9],
  10: [2, 3, 4, 5, 6, 7, 8, 9],
  9: [2, 3, 4, 5, 6, 7, 8, 9],
  8: [2, 3, 4, 4, 5, 6, 7, 8],
  7: [2, 3, 3, 4, 5, 6, 7, 8],
  6: [2, 2, 3, 4, 5, 5, 6, 7],
  5: [1, 2, 3, 4, 4, 5, 6, 6],
  4: [1, 2, 3, 3, 4, 4, 5, 6],
  3: [1, 2, 2, 3, 3, 4, 4, 5],
  2: [1, 1, 2, 2, 3, 3, 4, 4],
  1: [1, 1, 1, 2, 2, 2, 3, 3]
});

// Table 1C: Gun Combat Skill Level to Skill Accuracy Level. Index is the skill level.
export const skillAccuracyLevels = Object.freeze([0, 5, 7, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26]);

// Table 1D columns are ISF; rows are Maximum Speed. ISF = INT + SAL.
export const isfColumns = Object.freeze([7, 9, 11, 13, 15, 17, 19, 21, 23, 25, 27, 29, 31, 33, 35, 37, 39]);

export const combatActionTable = Object.freeze({
  1: [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2],
  2: [1, 1, 1, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 4, 4],
  3: [1, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 5, 5, 5, 5, 6],
  4: [2, 2, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 7],
  5: [2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 7, 8, 8, 8, 9, 9],
  6: [3, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11],
  7: [3, 4, 5, 5, 6, 7, 7, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13],
  8: [3, 4, 5, 6, 7, 8, 9, 9, 10, 11, 11, 12, 12, 13, 14, 14, 15],
  9: [4, 5, 6, 7, 8, 9, 10, 10, 11, 12, 13, 13, 14, 15, 15, 16, 17],
  10: [4, 6, 7, 8, 9, 10, 11, 12, 12, 13, 14, 15, 16, 16, 17, 18, 18],
  11: [5, 6, 7, 9, 10, 11, 12, 13, 14, 15, 15, 16, 17, 18, 19, 19, 20],
  12: [5, 7, 8, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 21, 22],
  13: [6, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24]
});

// Knockout Table, printed on the Status Sheet (PDF 69 / printed 64) and described
// in section 2.7 (PDF 21 / printed 16). Thresholds are multiples of the Knockout
// Value; the chance is compared with a strict less-than against a 00-99 roll, so
// the 00 row correctly means "no check".
export const knockoutTable = Object.freeze([
  Object.freeze({ overKnockoutValueMultiple: 3, incapacitationChance: 98, label: 'over 3 x KV' }),
  Object.freeze({ overKnockoutValueMultiple: 2, incapacitationChance: 75, label: 'over 2 x KV' }),
  Object.freeze({ overKnockoutValueMultiple: 1, incapacitationChance: 25, label: 'over KV' }),
  Object.freeze({ overKnockoutValueMultiple: 0.1, incapacitationChance: 10, label: 'over KV/10' }),
  Object.freeze({ overKnockoutValueMultiple: 0, incapacitationChance: 0, label: 'under KV/10' })
]);
