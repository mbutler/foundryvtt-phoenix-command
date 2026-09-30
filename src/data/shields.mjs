// Shields, LEG10204 Parry Data Table 3C, PDF 45 / printed 41.
//
// §3.1 (PDF 17): "A Shield is the primary parrying device in classical combat. Its
// effectiveness is dependent on its size and how fast it can be brought into parrying
// position. This is represented by the Partial Parry (PP) value." Five are printed, with
// their weights:
//
//   Buckler Shield   4.6   PP 4
//   Round Shield    10.0   PP 5
//   Heater Shield    9.7   PP 6
//   Kite Shield     11.2   PP 7
//   Scutem Shield   23.1   PP 8
//
// The page spells the largest one "Scutem" in both places it appears - Table 3C here and the
// parry column table on PDF 19 - so that is what is transcribed, though it is a misspelling
// of scutum and a text extraction of the book silently corrects it.
//
// Table 3C also prints the two weapon rows, One Handed Weapon PP 4 and Two Handed Weapon
// PP 5, which are in melee-parry.mjs where the parry rules read them. That module also
// computes Dodge at MS - 1 and Cover Up at PP + 1 (D68).
//
// The Action Time Table (3D, same page) prices getting a shield out, putting it on and
// taking it off. Those are carried here and charged by nothing yet.

export const shieldSource = Object.freeze({
  book: 'LEG10204', table: '3C', pdfPage: 45, printedPage: 41, verification: 'visual'
});

const printed = [
  // id, name, weightLb, partialParry, getOut, putOn, takeOff
  ['buckler', 'Buckler Shield', 4.6, 4, 4, 2, 1],
  ['round', 'Round Shield', 10.0, 5, 8, 6, 3],
  ['heater', 'Heater Shield', 9.7, 6, 8, 6, 3],
  ['kite', 'Kite Shield', 11.2, 7, 8, 6, 3],
  ['scutem', 'Scutem Shield', 23.1, 8, 8, 6, 3]
];

export const shields = Object.freeze(printed.map(([id, name, weightLb, partialParry, getOut, putOn, takeOff]) =>
  Object.freeze({ id, name, weightLb, partialParry, arming: Object.freeze({ getOut, putOn, takeOff }) })));

export const shieldsById = Object.freeze(Object.fromEntries(shields.map(shield => [shield.id, shield])));

export function shieldItem(id, { strapped = true } = {}) {
  const shield = shieldsById[id];
  if (!shield) throw new Error(`No shield is transcribed under "${id}".`);
  return {
    name: shield.name, type: 'shield',
    system: {
      schemaVersion: 1, catalogId: shield.id, catalogRevision: '', weightLb: shield.weightLb,
      quantity: 1, carried: true, equipped: true, attachedToId: null, weightNote: '', notes: '',
      source: { bookId: shieldSource.book, table: shieldSource.table, section: '3.1',
        pdfPage: shieldSource.pdfPage, verification: shieldSource.verification, note: '' },
      partialParry: shield.partialParry, strapped, strikeModes: {}
    }
  };
}
