import {armorRegion,armorHasSides,validArmorSide,firearmLocationRegions} from './armor-regions.mjs';
import {armorCandidates} from './summary.mjs';
import {meleeArmorFromCoverage} from './attacks.mjs';
const regionNames=['head','face','neck','shoulder','arm','hand','torso','pelvis','leg','foot'];
// A Table 6A hit names no side, and a few rows sit on a boundary. Every region and side the
// location may be is read; if they all give the same protection it is applied, and only a
// real difference (a vest on one side, a helmet that stops at the neck) goes to the GM.
export function automaticBallisticProtection(items,location){
  const armor=items.filter(i=>i.type==='armor'&&i.system.carried&&i.system.equipped);
  if(!armor.length)return {resolved:true,ballisticPF:0,basis:'No equipped armor'};
  if(armor.some(i=>!Object.keys(i.system.coverage??{}).length))return {resolved:false,reason:'An equipped armor item has no coverage recorded.'};
  const hit=typeof location==='string'?{location}:location;
  const regions=hit.region?[hit.region]:firearmLocationRegions(hit.location);
  if(!regions.length)return {resolved:false,reason:'This hit location has no armor region; confirm protection.'};
  if(armor.some(i=>Object.values(i.system.coverage).some(c=>!regionNames.includes(armorRegion(c.region))||!validArmorSide(c.region,c.side))))return {resolved:false,reason:'Armor coverage is incomplete.'};
  const readings=regions.flatMap(region=>(hit.side?[hit.side]:armorHasSides(region)?['left','right']:['center']).map(side=>{
    const candidates=armorCandidates(armor,region,side);
    if(candidates.length>1)return {overlap:true,region,side};
    if(!candidates.length)return {ballisticPF:0,basis:`No equipped coverage at ${side} ${region}`};
    const c=candidates[0];
    if(!Number.isFinite(c.ballisticPF)||c.ballisticPF<0)return {unknown:true};
    return {ballisticPF:c.ballisticPF,itemId:c.itemId,coverageId:c.coverageId,basis:`Equipped coverage at ${side} ${region}`};
  }));
  if(readings.some(r=>r.overlap))return {resolved:false,reason:'Overlapping armor requires adjudication.'};
  if(readings.some(r=>r.unknown))return {resolved:false,reason:'Ballistic protection is unknown.'};
  if(new Set(readings.map(r=>r.ballisticPF)).size>1)return {resolved:false,reason:`Protection differs by ${regions.length>1?'where exactly this hit landed':'side'}; confirm it.`};
  const read=readings.find(r=>r.itemId)??readings[0];
  return {resolved:true,...read,...(readings.length>1&&read.itemId?{basis:`Equipped coverage at ${regions.join(' or ')}${readings.length>regions.length?', either side':''}`}:{})};
}

// The melee equivalent: the struck location's region and side come from the melee location
// tables, and the equipped piece there gives its Table 3A class or BPF. Only a single
// matching piece with its class recorded is read; no coverage, overlaps or a piece without a
// melee class still go to the GM.
export function automaticMeleeProtection(items,{region,side},attack){
  const armor=items.filter(i=>i.type==='armor'&&i.system.carried&&i.system.equipped);
  if(armor.some(i=>!Object.keys(i.system.coverage??{}).length))return {resolved:false,reason:'An equipped armor item has no coverage recorded.'};
  if(!region||!side)return {resolved:false,reason:'The struck location has no armor region.'};
  const candidates=armor.length?armorCandidates(armor,region,side):[];
  if(candidates.length>1)return {resolved:false,reason:'Overlapping armor requires adjudication.'};
  try{
    const protection=meleeArmorFromCoverage(attack,candidates[0]??null);
    return {resolved:true,protection,basis:candidates.length?`Equipped coverage at ${side} ${region}`:armor.length?`No equipped coverage at ${side} ${region}`:'No equipped armor'};
  }catch(error){return {resolved:false,reason:error.message};}
}
