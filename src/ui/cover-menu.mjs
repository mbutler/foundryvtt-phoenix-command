import {namedCover,coverByThickness,coverProtectionFactor} from '../data/cover.mjs';

// Table 7C offered as a menu, shared by every interface that asks about cover. Each option
// is a printed row, so there is nothing to interpolate and no way to enter a Protection
// Factor the table does not print. A cover the table has no row for is an adjudication,
// which `coverProtectionFactor` takes separately and records a reason for.
export const coverMenu=Object.freeze([
  ...Object.values(namedCover).flatMap(group=>group.entries.map(entry=>
    [`named:${entry.id}`,`${group.label} · ${entry.label} (PF ${entry.pf})`])),
  ...Object.values(coverByThickness).flatMap(m=>m.thicknesses.map(inches=>
    [`material:${m.id}:${inches}`,`${m.label}, ${inches} inch (PF ${m.pf[String(inches)]})`]))]);

// A menu key and a stance back into the cover object the rules take. An unchosen or
// unrecognised key is `undefined`, not "no cover": §3.8 refuses an unanswered question
// rather than treating the target as standing in the open.
export function coverFromKey(key,stance='firing-over'){
  if(key==='open')return null;
  if(typeof key!=='string'||!key)return undefined;
  const [kind,id,inches]=key.split(':');
  if(kind==='named')return {...coverProtectionFactor({id}),stance};
  if(kind==='material')return {...coverProtectionFactor({material:id,inches:Number(inches)}),stance};
  return undefined;
}
