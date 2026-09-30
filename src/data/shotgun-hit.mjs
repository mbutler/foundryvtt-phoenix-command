// Shotgun Multiple Hit Table, LEG10200 §3.5, PDF 33 / printed 28.
//
// Transcribed from the word positions on that page. The row at SALM 14 is 80, then 16 is 79,
// then 18 is 100 — the dip is printed. A fitted curve in the sibling library smooths it out
// and is not used.
//
// The open first row is SALM below −12. The printed numeric rows start at −10, so −12 and
// −11 are a gap with no weapon in it; the lookup refuses them rather than inventing a step.

export const shotgunHitSource = Object.freeze({
  book: 'LEG10200', section: '3.5', pdfPage: 33, printedPage: 28,
  table: 'Shotgun Multiple Hit Table'
});

// `open` is the "< −12" row. Every other row is entered at that SALM and at the unprinted
// values above it, up to but not including the next row.
export const shotgunMultipleHit = Object.freeze([
  Object.freeze({ salm: null, open: true, hls: 1 }),
  Object.freeze({ salm: -10, hls: 2 }),
  Object.freeze({ salm: -6, hls: 3 }),
  Object.freeze({ salm: -4, hls: 4 }),
  Object.freeze({ salm: -2, hls: 6 }),
  Object.freeze({ salm: 0, hls: 8 }),
  Object.freeze({ salm: 2, hls: 11 }),
  Object.freeze({ salm: 4, hls: 14 }),
  Object.freeze({ salm: 6, hls: 19 }),
  Object.freeze({ salm: 8, hls: 25 }),
  Object.freeze({ salm: 10, hls: 34 }),
  Object.freeze({ salm: 12, hls: 45 }),
  Object.freeze({ salm: 14, hls: 80 }),
  Object.freeze({ salm: 16, hls: 79 }),
  Object.freeze({ salm: 18, hls: 100 })
]);
