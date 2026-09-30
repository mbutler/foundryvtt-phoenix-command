import {armorCatalog as gunBookArmor,equipmentSource,VISOR_PROTECTION_FACTOR} from './equipment.mjs';
import {meleeArmorCatalog} from './melee-armor.mjs';
import {armorRating} from '../rules/armor-rating.mjs';

// One Armor list (user ruling, 27 September 2026), built from the two transcriptions without
// changing them: LEG10200 §1.4's modern armor (printed PF; melee class and BPF from LEG10204
// Table 3A) and LEG10204 Table 3A's Medieval, Modern and High Tech rows (printed class, BPF and
// weight; §1.4's PCCS PF for the medieval rows). Every printed value is kept. What the books do
// not print is a house rule, marked as one:
//
// - A PF Table 3A leaves blank is set on the NIJ calibration in rules/armor-rating.mjs: the two
//   Modern rows as 1980s armor, the High Tech rows as 2026-and-later armor, better than the
//   book's modern armor at the same class, as the table's era implies.
// - Coverage follows what the real harness covers, not only the table's columns (Head, Visor,
//   Body, Arms, Legs). The neck and pelvis take the Body values, the shoulders and hands the
//   Arms values, the feet the Legs values.
// - The book's two Clothing rows are one item: PF 0 and no melee class wherever it is worn.
//
// Power Armor stays out: Table 3A prints it no single BPF or weight.

const house=(ballisticPF,note)=>({ballisticPF,basis:'house',note});
// The High Tech and Modern rows Table 3A prints without a PF, by piece column.
const housePF={
  'flak-vest':{body:house(4,'1980s fragmentation vest: about NIJ IIA–II.')},
  'police-helmet':{head:house(4,'Ballistic helmet: about NIJ IIIA.')},
  'ht-flexible-light':{body:house(6,'2026 soft armor at the printed weight.')},
  'ht-flexible-medium':{body:house(10,'Past 2026 soft armor: stops AK ball.')},
  'ht-flexible-heavy':{body:house(16,'Past 2026 soft armor: stops 5.56 M193.')},
  'combat-suit':{all:house(6,'Light all-over armor, above NIJ IIIA.')},
  'drgn-suit':{all:house(10,'Stops AK ball all over.')},
  'combat-suit-1':{body:house(10,'Head and body stop AK ball.'),limbs:house(6,'Flexible limb armor.')},
  'combat-suit-2':{body:house(20,'Head and body about NIJ III (RF1).'),limbs:house(6,'Flexible limb armor.')},
  'combat-suit-3':{body:house(20,'Head and body about NIJ III (RF2). Table 3A prints Levels 3 and 4 alike; the weight separates them.'),limbs:house(6,'Flexible limb armor.')},
  'combat-suit-4':{body:house(30,'Head and body about NIJ IV (RF3).'),limbs:house(6,'Flexible limb armor.')},
  'combat-suit-5':{body:house(40,'Head and body beyond NIJ IV: stops .50 caliber ball.'),limbs:house(6,'Flexible limb armor.')}
};

const ALL=['head','face','neck','torso','pelvis','shoulder','arm','hand','leg','foot'];
const HARNESS=['head','neck','torso','pelvis','shoulder','arm','leg'];
// What each piece of armor covers on the body, by the real harness it is.
const coverageById={
  clothing:['torso','pelvis','shoulder','arm','leg'],
  'light-flexible':['torso'],'medium-flexible':['torso'],'heavy-flexible':['torso'],'heavy-rigid':['torso'],
  'light-rigid':['head','face','torso'],rigid:['head','face','torso'],'medium-rigid':['head','face','torso'],
  'leather-untreated':HARNESS,'leather-hardened':HARNESS,brigandine:HARNESS,scale:HARNESS,
  'mail-light':[...HARNESS,'foot'],'mail-regular':[...HARNESS,'foot'],'mail-double':[...HARNESS,'foot'],
  plate:ALL,
  'flak-vest':['torso'],'police-helmet':['head'],
  'ht-flexible-light':['torso'],'ht-flexible-medium':['torso'],'ht-flexible-heavy':['torso'],
  'combat-suit':ALL.filter(r=>r!=='face'),'combat-suit-1':ALL.filter(r=>r!=='face'),'combat-suit-2':ALL.filter(r=>r!=='face'),
  'combat-suit-3':ALL.filter(r=>r!=='face'),'combat-suit-4':ALL.filter(r=>r!=='face'),'combat-suit-5':ALL.filter(r=>r!=='face'),
  'drgn-suit':ALL.filter(r=>r!=='face')
};
// Which printed column a body region reads.
const column={head:'head',face:'face',neck:'body',torso:'body',pelvis:'body',shoulder:'limbs',arm:'limbs',hand:'limbs',leg:'legs',foot:'legs'};
const paired=new Set(['shoulder','arm','hand','leg','foot']);
const regionLabels={head:'Head',face:'Face',neck:'Neck',torso:'Torso',pelvis:'Pelvis',shoulder:'Shoulders',arm:'Arms',hand:'Hands',leg:'Legs',foot:'Feet'};
export const armorRegionOrder=ALL;
export const armorRegionLabel=region=>regionLabels[region]??region;

function pieces(id,columns){
  return coverageById[id].map(region=>{
    const values=columns[column[region]]??(column[region]==='legs'?columns.limbs:null);
    if(!values)throw new Error(`${id}: no printed column for ${region}.`);
    return Object.freeze({region,side:paired.has(region)?'both':'center',...values});
  });
}
const printed=(ballisticPF,meleeClass,bpf)=>({ballisticPF,basis:'printed',meleeClass,bpf:String(bpf)});

// LEG10200 §1.4: body, head and visor pieces with a printed PF; visor PF 4 by the footnote.
const fromGunBook=gunBookArmor.map(a=>{
  const byRegion=Object.fromEntries(a.pieces.map(p=>[p.region,p]));
  const melee=[a.melee.armorClass,a.melee.bluntProtectionFactor];
  const col=region=>byRegion[region]?printed(byRegion[region].protectionFactor,...melee):null;
  const columns={head:col('head'),face:byRegion.visor?printed(VISOR_PROTECTION_FACTOR,...melee):null,body:col('body'),
    limbs:a.id==='clothing'?printed(0,...melee):null};
  return {id:a.id,name:a.id==='clothing'?'Clothing':a.name,era:'Modern',weightLb:Math.round(a.pieces.reduce((s,p)=>s+p.weightLb,0)*10)/10,
    source:{bookId:equipmentSource.book,table:'',section:'1.4',pdfPage:13,verification:'visual',note:'LEG10200 §1.4 Armor Table; melee class and BPF from LEG10204 Table 3A.'},
    pieces:pieces(a.id,columns)};
});
// LEG10204 Table 3A, less its Clothing row (merged above).
const fromTable3A=meleeArmorCatalog.filter(e=>e.id!=='medieval-clothing').map(e=>{
  const by=region=>e.pieces.find(p=>p.region===region);
  const col=(region,key)=>{
    const p=by(region);if(!p)return null;
    const rule=housePF[e.id]??{},pf=p.ballisticPF!=null?{ballisticPF:p.ballisticPF,basis:'printed'}:(rule[region]??rule[key]??rule.all);
    if(!pf)throw new Error(`${e.id}: no PF for ${region}.`);
    return {...pf,meleeClass:p.meleeClass,bpf:String(p.bpf)};
  };
  const columns={head:col('head','body'),face:col('face','body'),body:col('torso','body'),limbs:col('arm','limbs'),legs:col('leg','limbs')};
  return {id:e.id,name:e.name,era:e.era,weightLb:e.weightLb,note:e.note??null,
    source:{bookId:'LEG10204',table:'3A',section:'1.4',pdfPage:45,verification:'visual',note:e.note??''},
    pieces:pieces(e.id,columns)};
});

export const armorEras=Object.freeze(['Medieval','Modern','High Tech']);
export const unifiedArmorCatalog=Object.freeze([...fromGunBook,...fromTable3A]
  .sort((a,b)=>armorEras.indexOf(a.era)-armorEras.indexOf(b.era))
  .map(e=>Object.freeze({...e,pieces:Object.freeze(e.pieces)})));
export const unifiedArmorById=Object.freeze(Object.fromEntries(unifiedArmorCatalog.map(e=>[e.id,e])));

// Pieces with the same protection, grouped for a card or a note: [{regions, ...values}].
export function protectionGroups(entry){
  const groups=[];
  for(const p of entry.pieces){
    const same=groups.find(g=>g.ballisticPF===p.ballisticPF&&g.meleeClass===p.meleeClass&&g.bpf===p.bpf&&g.basis===p.basis);
    if(same)same.regions.push(p.region);else groups.push({regions:[p.region],ballisticPF:p.ballisticPF,meleeClass:p.meleeClass,bpf:p.bpf,basis:p.basis,note:p.note??null});
  }
  return groups;
}

export function unifiedArmorItem(id){
  const entry=unifiedArmorById[id];
  if(!entry)throw new Error('Choose armor from the list.');
  const houseNotes=protectionGroups(entry).filter(g=>g.basis==='house')
    .map(g=>`${g.regions.map(armorRegionLabel).join(', ')}: PF ${g.ballisticPF} is a house rule (${armorRating(g.ballisticPF).nij}). ${g.note??''}`.trim());
  const note=[entry.source.note,entry.note,...houseNotes].filter(Boolean).join(' ');
  return {name:entry.name,type:'armor',system:{
    schemaVersion:1,catalogId:entry.id,catalogRevision:'',weightLb:entry.weightLb,quantity:1,carried:true,equipped:true,attachedToId:null,
    weightNote:'',notes:houseNotes.join(' '),source:{...entry.source,note},
    coverage:Object.fromEntries(entry.pieces.map(p=>[p.region,{region:p.region,side:p.side,ballisticPF:p.ballisticPF,
      meleeClass:p.meleeClass,bpf:p.bpf,material:entry.name}]))}};
}
