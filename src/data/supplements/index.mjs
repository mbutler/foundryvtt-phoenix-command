// Weapon data supplements, transcribed a book at a time (one module per book in this folder),
// turned into catalogue entries of the same shape as the core catalogue's so the Item builders,
// the picker and the weapon card need nothing new. Each book is its own picker group.
import { leg10206Weapons, leg10206Source, leg10206Launchers, leg10206Grenades, leg10206WithoutPicture } from './leg10206.mjs';
import { leg10207Weapons, leg10207Source, leg10207Shotguns, leg10207WithoutPicture } from './leg10207.mjs';
import { leg10202Weapons, leg10202Source, leg10202Shotguns, leg10202WithoutPicture } from './leg10202.mjs';
import { firearmSystem } from '../firearms.mjs';
import { shotgunRanges, shotgunItemFor } from '../shotguns.mjs';
import { automaticWeaponSystem } from '../automatic-weapons.mjs';

export const RANGES = Object.freeze([10, 20, 40, 70, 100, 200, 300, 400]);
const FEED_UNITS = Object.freeze({ Mag: 'magazine', Rnd: 'round', Blt: 'belt', Drm: 'drum', HMC: 'half-moon clip',
  CS: 'charger', SL: 'speed loader', Cp: 'clip', MS: 'strip', Hop: 'hopper', Pan: 'pan', Tube: 'tube' });

export const supplementBooks = Object.freeze([
  { ...leg10206Source, label: 'WWII weapons (LEG10206)', weapons: leg10206Weapons,
    launchers: leg10206Launchers, grenades: leg10206Grenades, withoutPicture: leg10206WithoutPicture },
  { ...leg10202Source, label: 'Civilian weapons (LEG10202)', weapons: leg10202Weapons, shotguns: leg10202Shotguns, withoutPicture: leg10202WithoutPicture },
  { ...leg10207Source, label: 'Wild West weapons (LEG10207)', weapons: leg10207Weapons, shotguns: leg10207Shotguns, withoutPicture: leg10207WithoutPicture }
]);

// The printed Rate of Fire cell, as LEG10200 PDF 6-7 and LEG10203 §6.3 define it.
export function printedRof(cell) {
  const match = /^(\*\*|\*|-|)(\d*)$/.exec(String(cell));
  if (!match) throw new Error(`"${cell}" is not a printed Rate of Fire.`);
  const [, marker, digits] = match, n = digits === '' ? null : Number(digits);
  if (marker === '-') return { feed: 'single-load', rateOfFire: null, burstRounds: null, threeRoundBurst: false };
  if (marker === '') {
    if (n === null) throw new Error('A blank Rate of Fire cell is written "-".');
    return { feed: 'manual', rateOfFire: n, burstRounds: null, threeRoundBurst: false };
  }
  return { feed: 'self-loading', rateOfFire: null, burstRounds: n, threeRoundBurst: marker === '**' };
}

// A column the page leaves blank (null) is left out, the way the core catalogue omits one (D52).
const byRange = (values, make) => Object.fromEntries(values.map((value, i) => value == null ? null : [`r${RANGES[i]}`, make(value, RANGES[i] * 6)]).filter(Boolean));
const aimTable = aim => Array.isArray(aim) ? Object.fromEntries(aim.map((mod, i) => [String(i + 1), mod])) : { ...aim };

export function supplementEntry(row, book) {
  const p = row.physical, rof = printedRof(p.ROF);
  const automatic = rof.burstRounds !== null;
  if (automatic !== Array.isArray(row.MA)) throw new Error(`${row.name}: a Minimum Arc row is printed exactly for a *N weapon.`);
  return Object.freeze({
    id: row.id, name: row.name, category: row.category, calibre: row.calibre, country: row.country,
    description: row.description ?? '', book: book.book, bookTitle: book.title, pdfPage: row.pdfPage, provenance: 'page-verified',
    weightLb: p.W, lengthIn: p.L, knockDown: p.KD ?? null, feedDevice: p.feed ?? null, capacity: p.Cap ?? null,
    reloadTimeActions: p.RT ?? null, sustainedBurstPenalty: p.SAB ?? null,
    printedRateOfFire: String(p.ROF), ...rof,
    aimModifiers: aimTable(row.aim),
    ballisticAmmunitionWeightLb: p.AW ?? null,
    ammunition: Object.fromEntries(Object.entries(row.ammo).map(([key, a]) =>
      [key, { ...(a.shot ? { pelletNumber: a.pellets } : {}), ranges: byRange(a.pen, (penetration, distanceFeet) => {
        const i = RANGES.indexOf(distanceFeet / 6), band = { distanceFeet, penetration, damageClass: a.dc[i] };
        // A shot load carries the shotgun columns too (shotgun.mjs reads them from the band).
        return a.shot ? { ...band, salm: a.salm[i] ?? null, pelletChance: a.bphc[i]?.chance ?? null,
          pelletRounds: a.bphc[i]?.rounds ?? null, patternRadiusHexes: a.pr[i] ?? null } : band;
      }) }])),
    starredAmmunition: Object.entries(row.ammo).filter(([, a]) => a.starred).map(([key]) => key),
    minimumArc: automatic ? byRange(row.MA, (arcHexes, distanceFeet) => ({ distanceFeet, arcHexes })) : {},
    threeRoundBurstRow: row.threeRoundBurst ?? null,
    feedNote: `Printed ROF ${p.ROF}, ${book.book} PDF ${row.pdfPage}.`,
    sourceNote: `${book.title} (${book.book}), PDF ${row.pdfPage}.`
  });
}

// Every transcribed weapon; the picker shows only those with a picture (`shown`).
const shown = book => entry => !book.withoutPicture?.has(entry.id);
export const supplementEntries = Object.freeze(supplementBooks.flatMap(book => book.weapons.map(row => supplementEntry(row, book))));
export const supplementGroups = Object.freeze(supplementBooks.map(book => Object.freeze({
  label: book.label, book: book.book, entries: Object.freeze(supplementEntries.filter(e => e.book === book.book).filter(shown(book)))
})));
export const supplementEntriesById = Object.freeze(Object.fromEntries(supplementEntries.map(entry => [entry.id, entry])));

// The Item `system` for an entry: the core builders, with the supplement as the source.
export function supplementWeaponSystem(entry) {
  const system = entry.burstRounds !== null
    ? automaticWeaponSystem(entry, { modeId: 'auto' })
    : firearmSystem({ ...entry, feed: entry.feed, rateOfFire: entry.rateOfFire }, { modeId: 'fire' });
  system.source = { bookId: entry.book, table: 'Weapon Data Tables', section: '', pdfPage: entry.pdfPage, verification: 'visual', note: entry.sourceNote };
  if (entry.burstRounds !== null) system.firearmModes.auto.feed = entry.feed;
  if (entry.threeRoundBurstRow) for (const mode of Object.values(system.firearmModes))
    mode.threeRoundBurst = byRange(entry.threeRoundBurstRow, (value, distanceFeet) => ({ distanceFeet, value }));
  return system;
}

// Shotguns keep the core shotgun shape (shotguns.mjs): a slug row or a shot row with SALM, Base
// Pellet Hit Chance and Pattern Radius. Columns are the core 1-80 hex headings unless the page
// prints its own (`row.ranges`); a row that stops early stops there. The band lookup reads
// whatever headings were stored.
function shotgunEntry(row, book) {
  const p = row.physical, rof = printedRof(p.ROF);
  const headings = row.ranges ?? shotgunRanges;
  const ranges = load => Object.fromEntries(load.pen.map((pen, i) => {
    const hexes = headings[i];
    if (hexes == null) throw new Error(`${row.name}: a ballistic column with no range heading.`);
    return pen == null ? null : [`r${hexes}`, {
      distanceFeet: hexes * 6, penetration: pen, damageClass: load.dc[i],
      salm: load.salm?.[i] ?? null,
      pelletChance: load.bphc?.[i]?.chance ?? null, pelletRounds: load.bphc?.[i]?.rounds ?? null,
      patternRadiusHexes: load.pr?.[i] ?? null
    }];
  }).filter(Boolean));
  return Object.freeze({
    id: row.id, name: row.name, gauge: row.gauge, country: row.country, description: row.description ?? '',
    book: book.book, bookTitle: book.title, pdfPage: row.pdfPage, provenance: 'page-verified',
    weightLb: p.W, lengthIn: p.L, reloadTimeActions: p.RT, capacity: p.Cap, feedDevice: p.feed, knockDown: p.KD, sab: p.SAB,
    ballisticAmmunitionWeightLb: p.AW, printedRateOfFire: String(p.ROF),
    aimModifiers: Object.freeze({ ...row.aim }), feed: rof.feed, rateOfFire: rof.rateOfFire, fireTypes: ['single'],
    ammunition: Object.fromEntries(Object.entries(row.loads).map(([key, load]) => [key, { pelletNumber: load.pellets, ranges: ranges(load) }])),
    sourceNote: `${book.title} (${book.book}), PDF ${row.pdfPage}.`
  });
}
export const supplementShotgunGroups = Object.freeze(supplementBooks.filter(book => book.shotguns?.length).map(book => Object.freeze({
  label: book.label.replace(' weapons ', ' shotguns '), book: book.book,
  entries: Object.freeze(book.shotguns.map(row => shotgunEntry(row, book)).filter(e => !book.withoutPicture?.has(e.id)))
})));
export function supplementShotgunSystem(entry) {
  return shotgunItemFor(entry, { loadedRounds: 0, source: { bookId: entry.book, table: 'Shotguns', section: '', pdfPage: entry.pdfPage, verification: 'visual', note: entry.sourceNote } }).system;
}

// AW is pounds per feed device, or per round (LEG10200 PDF 6).
export const supplementAmmunitionWeights = Object.freeze(Object.fromEntries([...supplementEntries, ...supplementShotgunGroups.flatMap(g => g.entries)
  .map(e => ({ ...e, ballisticAmmunitionWeightLb: e.ballisticAmmunitionWeightLb }))]
  .filter(entry => Number.isFinite(entry.ballisticAmmunitionWeightLb) && entry.feedDevice)
  .map(entry => {
    const unit = FEED_UNITS[entry.feedDevice];
    if (!unit) throw new Error(`${entry.name}: feed device "${entry.feedDevice}" is not one the book defines.`);
    return [entry.id, { weightLb: entry.ballisticAmmunitionWeightLb, unit, capacity: unit === 'round' ? 1 : entry.capacity }];
  })));

// Launchers and grenades keep the core tables' shapes (launchers.mjs, grenades.mjs); each book's
// are their own picker groups, with the book and table as the Items' source.
export const supplementExplosiveGroups = Object.freeze(supplementBooks.flatMap(book => [
  ...(book.launchers?.length ? [{ label: book.label.replace(' weapons ', ' launchers '), prefix: `${book.book}-launcher`, kind: 'launcher',
    entries: book.launchers.filter(shown(book)), source: { book: book.book, table: 'Explosive Weapons' } }] : []),
  ...(book.grenades?.length ? [{ label: book.label.replace(' weapons ', ' grenades '), prefix: `${book.book}-grenade`, kind: 'grenade',
    entries: book.grenades.filter(shown(book)), source: { book: book.book, table: 'Grenades / Explosives' } }] : [])
]));

// Pictures go where the core catalogue's do, by catalogue id, and are used once the file is there.
export const supplementImageFiles = Object.freeze(Object.fromEntries([...supplementEntries, ...supplementBooks.flatMap(b => [...(b.launchers ?? []), ...(b.grenades ?? []), ...(b.shotguns ?? [])])]
  .map(entry => [entry.id, `assets/weapons/${entry.id}.png`])));
