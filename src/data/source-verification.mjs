// How well a stored record is known to match the book. This is the vocabulary of the item
// model's `source.verification` field, kept in its own module because the model itself can
// only be loaded inside Foundry - `fields.mjs` reads `foundry.data.fields` at import - and a
// portable test that checks a catalogue's provenance needs the same list.
//
// It exists because a value outside this list is not a weaker claim, it is a REJECTED
// document: every weapon the automatic-weapons import produced carried `library-import`,
// which is not one of these, so none of the thirty-two could be created as an Item in
// Foundry at all. The portable tests never built documents and never saw it (D54).
//
//   unverified - nothing is claimed.
//   legacy     - ported from the sibling phoenix-functions library and not read off a page.
//   visual     - transcribed from a render of the printed page.
//   checked    - transcribed and then re-checked against the page cell by cell.
export const sourceVerifications = Object.freeze(['unverified', 'legacy', 'visual', 'checked']);
