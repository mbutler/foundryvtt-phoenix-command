import {legacyFirearm as t} from '../data/legacy-firearm.mjs';

// House calibration (user ruling, 27 September 2026): what a Protection Factor stops, in plain
// words and against real-world NIJ levels. It changes no rule. It reads the book's own numbers:
// Table 6D turns PF into the EPF a round must beat, and on a square hit (armor roll 0) that EPF
// is compared with the catalogue's PEN at its first range band (10 hexes, 60 ft; NIJ tests at
// 5 m, a little closer). Table 6D is indexed only by its printed PF rows, so a PF between two
// rows plays as the lower one (the book's Heavy Flexible, PF 9, plays as 6).
//
// Where this puts the book's own modern armor: Light Flexible (4) is about NIJ IIIA, Rigid (10)
// stops AK ball, Medium Rigid (16) stops 5.56 M193, Heavy Rigid (30) is NIJ IV. The High Tech
// rows Table 3A prints without a PF are given values on this scale as 2026-and-later armor
// (armor-catalog.mjs); the test checks each band against the catalogue's rounds.
const rows=t.effectiveArmorProtectionFactor_6D;
export const armorPFRows=Object.freeze(rows.map(row=>row.PF));

export function playedPF(pf){
  if(!Number.isFinite(pf)||pf<0)return null;
  return armorPFRows.filter(row=>row<=pf).at(-1)??0;
}
// The EPF a square hit (armor roll 0) has to beat.
export function squareHitEPF(pf){
  const played=playedPF(pf);
  return played==null?null:Number(rows.find(row=>row.PF===played)['0']);
}

const bands=[
  {pf:40,nij:'Beyond NIJ IV',stops:'.50 caliber ball'},
  {pf:30,nij:'About NIJ IV (RF3)',stops:'.30-06 armor-piercing'},
  {pf:20,nij:'About NIJ III (RF1–RF2)',stops:'7.62 NATO and 5.56 rifle ball'},
  {pf:16,nij:'Between NIJ IIIA and III',stops:'5.56 M193 ball'},
  {pf:10,nij:'Between NIJ IIIA and III',stops:'7.62×39 (AK) ball'},
  {pf:6,nij:'Above NIJ IIIA',stops:'pistol and carbine rounds'},
  {pf:4,nij:'About NIJ IIIA',stops:'pistol rounds, including armor-piercing'},
  {pf:2,nij:'About NIJ IIA',stops:'most 9 mm ball'}];

// Plain words for a PF: what it stops on a square hit, with its rough NIJ level.
export function armorRating(pf){
  if(pf==null||!Number.isFinite(pf))return {nij:null,stops:null,label:'Protection against bullets unknown'};
  const played=playedPF(pf);
  if(played===0)return {nij:null,stops:null,label:pf>0?'Negligible against bullets':'No protection against bullets'};
  const band=bands.find(b=>played>=b.pf);
  return {nij:band.nij,stops:band.stops,label:`${band.nij} · stops ${band.stops} on a square hit`};
}
