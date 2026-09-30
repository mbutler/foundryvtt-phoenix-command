// What a disabling injury stops a combatant doing.
//
// §2.7, PDF 20: "A Disabled Leg means the character cannot move (in the Basic Game), and a
// Disabled Arm or Shoulder means that he cannot fire a weapon with that Arm. (These rules
// are slightly modified in the Advanced Rules; see Table 7A.)"
//
// Table 7A is the movement table, and its Injuries rows are the modification: +2 for a
// disabling injury above the waist, +12 below. So in the advanced game a disabled leg does
// not stop a man moving - it makes every hex cost twelve more actions, which for most
// characters is several impulses of crawling. The system used to refuse to act at all on
// any disabling injury, including a wounded arm blocking a footstep; that was neither rule.
import {movementModifiers} from '../data/movement.mjs';

export const disablingEffectSource='Small Arms §2.7, PDF 20; Movement Table 7A, PDF 67';

// Hit locations arrive as the damage tables print them - "Thigh Bone" from Table 6A, or
// "right Forearm" from the melee table, which prefixes a side. Only locations the shading
// can actually disable need classifying; Pelvis, which would be the genuinely ambiguous one
// for the waist, is shaded nowhere and so never disables.
const ARM=['shoulder','arm','elbow','forearm','hand'];
const LEG=['thigh','knee','shin','ankle','foot','leg'];
const TRUNK=['mouth','neck','heart','spine','chest','hip','torso','head','forehead','eye','pelvis'];
export function classifyDisabledLocation(label){
  if(typeof label!=='string'||!label.trim())return null;
  const text=label.toLowerCase();
  const side=['left','right'].find(s=>text.startsWith(`${s} `))??null;
  const match=list=>list.some(word=>new RegExp(`\\b${word}`).test(text));
  // Leg words are checked first: "Leg Glance" also contains no arm word, but "Forearm"
  // contains "arm", so the arm test must not be allowed to claim a leg.
  if(match(LEG))return {label,side,group:'leg',waist:'below'};
  if(match(ARM))return {label,side,group:'arm',waist:'above'};
  if(match(TRUNK))return {label,side,group:'trunk',waist:'above'};
  return null;                                   // Unrecognised: the GM rules on it.
}

// The Table 7A cost a set of disabling injuries adds to every hex. Each waist row applies at
// most once - the table names the condition, not a count - and the two are summed when a
// combatant has injuries on both sides of the waist. That summing is not printed.
export function movementInjuryModifier(labels=[]){
  if(!Array.isArray(labels))throw new Error('Disabled locations must be a list.');
  const classified=labels.map(classifyDisabledLocation);
  const unclassified=labels.filter((_,i)=>classified[i]===null);
  const waists=new Set(classified.filter(Boolean).map(entry=>entry.waist));
  const parts=[...waists].map(waist=>({waist,
    actions:movementModifiers.injury[waist==='below'?'below-waist':'above-waist']}));
  return {actions:parts.reduce((sum,part)=>sum+part.actions,0),parts,unclassified,
    groups:[...waists].map(waist=>waist==='below'?'below-waist':'above-waist'),
    source:disablingEffectSource};
}

// §2.7's other half. A rifle needs both arms and a pistol can be fired with one, but nothing
// here records which arm a weapon wants - and Table 6A gives a firearm hit no side at all, so
// even which arm was hit is often unknown. The rule is therefore reported, not applied: a
// disabled arm or shoulder stops the shot until a GM rules otherwise, while an injury
// anywhere else does not touch firing, which is the part that was wrong before.
export function firingRestriction(labels=[]){
  if(!Array.isArray(labels))throw new Error('Disabled locations must be a list.');
  const arms=labels.map(classifyDisabledLocation).filter(entry=>entry?.group==='arm');
  const unclassified=labels.filter(label=>classifyDisabledLocation(label)===null);
  if(unclassified.length)return {allowed:false,arms,unclassified,source:disablingEffectSource,
    reason:`This combatant has a disabling injury at an unrecognised location (${unclassified.join(', ')}). Rule on what it prevents before he fires.`};
  if(!arms.length)return {allowed:true,arms:[],unclassified:[],source:disablingEffectSource};
  const named=arms.map(entry=>entry.label).join(', ');
  return {allowed:false,arms,unclassified:[],source:disablingEffectSource,
    reason:`Section 2.7: a disabled arm or shoulder means he cannot fire a weapon with that arm (${named}). Which arm a weapon needs is not modelled, so rule on this shot explicitly.`};
}

// Which disabling injuries restrict a combatant *right now*.
//
// The basic impulse sequence resolves all fire together at step 7 and applies disabling
// injuries at step 10, so a wound taken this impulse cannot restrict anything this impulse.
// Without that, whether a shot is allowed would depend on whether the GM happened to apply
// someone else's shot first - a click-order effect the basic game does not have, since
// §2.1 makes everything in an impulse simultaneous.
//
// `woundThisImpulse` is the caller's test for that, because only the encounter knows which
// impulse it is in. Outside an encounter every active wound restricts, which is right.
export function disabledLocations(injuries,woundThisImpulse=null){
  return Object.values(injuries??{})
    .filter(injury=>injury.status==='active'&&!(woundThisImpulse&&woundThisImpulse(injury)))
    .flatMap(injury=>injury.disabledRegions??[]);
}
