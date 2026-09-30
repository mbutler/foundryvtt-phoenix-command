import { weaponSourcePages } from './weapon-source-pages.mjs';

export function formatWeaponSourceCitation({ book, pdfPage }) {
  if (!book || pdfPage == null) return null;
  return `${book}, p. ${pdfPage}`;
}

export function weaponSourceCitation(entry) {
  if (!entry?.id) return null;
  const page = weaponSourcePages[entry.id];
  return page ? formatWeaponSourceCitation(page) : null;
}
