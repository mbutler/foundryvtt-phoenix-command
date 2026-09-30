// LEG10203 §6.3 Three Round Burst (PDF 6) and Table 9B (PDF 30), with each `**` weapon's 3RB
// row from LEG10200's Weapon Data Tables. All read from renders at 3–4x on 28 September 2026.
//
// "Weapons with Three Round Burst capability are marked by a double asterisk (**) in their
// Rate of Fire entry. Weapons with a ** followed by a number are capable of both Three Round
// Burst and fully automatic fire." The 3RB value is printed per range on the weapon's own
// line, "just below the PEN and DC values", and "measures the burst's width of scatter".
//
// Table 9B is entered with the 3RB value and the shot's EAL and gives one to three numbers.
// One 00-99 roll: at or under the first is one round, the second two, the third three. A
// blank means that many rounds cannot hit at that EAL (the -6 row's third number stops at EAL
// 12 and the -2 row's second at EAL 5); a printed 0 still hits on 00.
export const threeRoundBurstSource = Object.freeze({
  rule: 'LEG10203 §6.3, PDF 6', table: 'LEG10203 Table 9B, PDF 30',
  rows: 'LEG10200 Weapon Data Tables, PDF 72, 75, 77, 78, 80, 81, 82, 83'
});

export const table9BEal = Object.freeze([28, 27, 26, 25, 24, 23, 22, 21, 20, 19, 18, 17, 16, 15, 14, 13, 12, 11, 10, 9, 8, 7, 6, 5, 4, 3]);
const _ = null;
const pad = row => [...row, ...Array(table9BEal.length - row.length).fill(_)];
// Each 3RB row: its one-, two- and three-round lines, by EAL from 28 down to 3.
export const table9B = Object.freeze([
  { value: -11, lines: [
    [99, 99, 98, 96, 93, 90, 86, 80, 74, 68, 61, 54, 47, 40, 34, 29, 24, 19, 16, 13, 10, 8, 6, 5, 4, 3],
    [97, 95, 91, 87, 82, 76, 69, 62, 55, 48, 41, 35, 29, 24, 19, 16, 13, 10, 8, 6, 5, 4, 3, 2, 2, 1],
    [89, 85, 79, 73, 66, 59, 52, 45, 38, 32, 26, 21, 17, 14, 11, 8, 6, 5, 4, 3, 2, 1, 1, 0, 0, 0]] },
  { value: -6, lines: [
    [99, 99, 98, 96, 94, 91, 88, 83, 78, 72, 66, 60, 53, 46, 40, 34, 29, 24, 20, 16, 13, 11, 8, 7, 5, 4],
    [90, 86, 80, 74, 67, 60, 52, 45, 39, 33, 27, 22, 18, 15, 12, 9, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1],
    pad([25, 20, 16, 13, 10, 8, 6, 4, 3, 2, 2, 1, 1, 0, 0, 0, 0])] },
  { value: -4, lines: [
    [99, 99, 98, 96, 94, 91, 88, 83, 78, 73, 67, 61, 54, 48, 42, 36, 31, 26, 21, 18, 14, 12, 9, 7, 6, 5],
    [80, 74, 67, 60, 52, 45, 39, 33, 27, 22, 18, 15, 12, 9, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1, 1, 0]] },
  { value: -2, lines: [
    [99, 99, 97, 96, 93, 90, 86, 82, 76, 71, 65, 59, 53, 47, 41, 35, 30, 25, 21, 18, 14, 12, 10, 8, 6, 5],
    pad([52, 45, 38, 32, 27, 22, 18, 15, 12, 9, 7, 6, 5, 4, 3, 2, 2, 1, 1, 1, 1, 0, 0, 0])] },
  { value: 0, lines: [[99, 98, 97, 95, 93, 89, 85, 80, 75, 69, 63, 57, 51, 45, 40, 34, 30, 25, 21, 18, 15, 12, 10, 8, 6, 5]] },
  { value: 4, lines: [[99, 98, 97, 94, 91, 87, 82, 76, 70, 63, 57, 50, 44, 38, 33, 28, 24, 20, 17, 14, 12, 10, 8, 6, 5, 4]] },
  { value: 10, lines: [[99, 98, 96, 94, 90, 86, 81, 75, 68, 61, 54, 47, 40, 34, 29, 24, 20, 16, 13, 11, 9, 7, 6, 5, 4, 3]] },
  { value: 16, lines: [[99, 98, 96, 94, 90, 86, 80, 74, 67, 60, 53, 46, 39, 33, 28, 23, 19, 15, 12, 10, 8, 6, 5, 4, 3, 2]] }
].map(row => Object.freeze({ value: row.value, lines: Object.freeze(row.lines.map(line => Object.freeze(line))) })));

// The 3RB row by catalogue id, at the printed ranges 10, 20, 40, 70, 100, 200, 300 and 400
// hexes. The 200-400 columns are the shaded ones past the Effective Range.
export const threeRoundBurstRanges = Object.freeze([10, 20, 40, 70, 100, 200, 300, 400]);
export const threeRoundBurstRows = Object.freeze({
  'hk-vp70m': { pdfPage: 72, values: [-10, -5, 0, 4, 7, 12, 15, 17] },
  'm93r': { pdfPage: 72, values: [-2, 3, 8, 12, 15, 20, 22, 24] },
  'heckler-koch-mp5k': { pdfPage: 75, values: [-6, -1, 4, 8, 11, 16, 19, 21] },
  'fn-fnc': { pdfPage: 77, values: [-4, 1, 6, 10, 13, 17, 20, 22] },
  'fa-mas': { pdfPage: 77, values: [-6, -1, 4, 8, 10, 15, 18, 20] },
  'heckler-koch-g41': { pdfPage: 78, values: [-4, 1, 5, 9, 12, 17, 20, 22] },
  'heckler-koch-g11': { pdfPage: 78, values: [-20, -16, -11, -7, -4, 1, 4, 6] },
  'sig-550': { pdfPage: 80, values: [-6, -1, 4, 8, 11, 16, 19, 21] },
  'm16a2': { pdfPage: 81, values: [-5, 0, 5, 9, 11, 16, 19, 21] },
  'hk-13e': { pdfPage: 82, values: [-8, -3, 2, 6, 9, 14, 17, 19] },
  'hk-11e': { pdfPage: 82, values: [-4, 1, 6, 10, 13, 17, 20, 22] },
  'heckler-koch-23e': { pdfPage: 83, values: [-8, -3, 2, 6, 8, 13, 16, 18] },
  'heckler-koch-21e': { pdfPage: 83, values: [-4, 1, 6, 10, 12, 17, 20, 22] }
});

// The firearm mode's `threeRoundBurst` record for a catalogue id, keyed like minimumArc and
// stored in feet at six feet to the hex; empty for a weapon with no 3RB row.
export function threeRoundBurstRecord(catalogId) {
  const row = threeRoundBurstRows[catalogId];
  if (!row) return {};
  return Object.fromEntries(threeRoundBurstRanges.map((hexes, i) => [`r${hexes}`, { distanceFeet: hexes * 6, value: row.values[i] }]));
}
