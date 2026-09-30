// Row helpers shared by the supplement book modules. A row is written as printed.
export const w = (pdfPage, id, name, category, calibre, country, physical, aim, ammo, extra = {}) =>
  Object.freeze({ pdfPage, id, name, category, calibre, country, physical, aim, ammo, ...extra });
// Numbers separated by spaces; "-" is a column the page leaves blank.
export const n = text => text.trim().split(/\s+/).map(v => v === '-' ? null : Number(v));
// Aim as printed: action counts and modifiers in pairs ("1 -23 2 -12 ... 12 0").
export const aim = text => { const v = n(text), out = {}; for (let i = 0; i < v.length; i += 2) out[String(v[i])] = v[i + 1]; return out; };
// One ammunition type's PEN and DC rows; "1s" for a DC row of 1s the length of its PEN row.
// The third argument is `true` for a starred type, or { starred, asPrinted }: `asPrinted` marks a
// DC row that rises with range on the page, read the same way from the image and the text layer.
export const ammo = (pen, dc, flags = false) => {
  const p = n(pen), f = flags === true ? { starred: true } : (flags || {});
  return { ...(f.starred ? { starred: true } : {}), ...(f.asPrinted ? { asPrinted: true } : {}),
    pen: p, dc: dc === '1s' ? p.map(v => v === null ? null : 1) : n(dc) };
};
export const AS_PRINTED = { asPrinted: true };
export const phys = (L, W, RT, ROF, Cap, AW, feed, KD, SAB) => ({ L: String(L), W, RT, ROF: String(ROF), Cap, AW, feed, KD, SAB });

// A shotgun load as printed (LEG10200 PDF 86's layout): PEN and DC rows, and for shot the SALM,
// Base Pellet Hit Chance and Pattern Radius rows, by 1, 2, 4, 6, 8, 10, 15, 20, 30, 40 and 80
// hexes. In the BPHC row "-" is a blank cell, "*14" is 14 pellets and "*1H" 100 (H ×100).
export const load = ({ pellets = null, pen, dc, salm = null, bphc = null, pr = null }) => ({
  pellets, pen: n(pen), dc: n(dc), salm: salm ? n(salm) : null, pr: pr ? n(pr) : null,
  bphc: bphc ? bphc.trim().split(/\s+/).map(t => t === '-' ? null
    : t.startsWith('*') ? { rounds: /H$/.test(t) ? Number(t.slice(1, -1)) * 100 : Number(t.slice(1)) } : { chance: Number(t) }) : null
});
export const sg = (pdfPage, id, name, gauge, country, physical, aimText, loads, extra = {}) =>
  Object.freeze({ pdfPage, id, name, gauge, country, physical, aim: aim(aimText), loads, ...extra });

// Shot fired from a musket or rifle: a pellet load printed on the rifle range columns (10, 20,
// 40, 70 ... hexes), with SALM, Base Pellet Hit Chance and Pattern Radius rows beside PEN and DC.
export const shot = (pellets, pen, dc, salm, bphc, pr) => ({ ...load({ pellets, pen, dc, salm, bphc, pr }), shot: true });
