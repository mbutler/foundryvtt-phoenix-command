// LEG10204 Armor Data Table 3A (PDF 45) and §1.4 (PDF 12): the Medieval and High Tech rows, and
// the two Modern rows (Flak Vest, Police Helmet) the LEG10200 armor catalogue does not hold.
// Visual transcription at 250 dpi, 26 September 2026. The LEG10200 catalogue keeps the modern
// flexible and rigid armor (equipment.mjs), with 3A's melee class and BPF.
//
// Each piece is a coverage record: a melee Armor Class, a BPF, and the PCCS Protection Factor
// §1.4 gives for the archaic armors ("PCCS PF equals ..."; untreated leather is "roughly .5").
// High Tech and the two modern rows print no PF, so theirs is unknown (null), not 0.
//
// Readings recorded in docs/decisions.md:
// - Scale is BR / BPF 3 on Table 3A; §1.4's text says "Armor Class = PL". The table is used.
// - A Combat Suit Level prints two classes and two BPFs: "The first value given in the Armor
//   Class column is for the Arms and Legs, and the second is for the Head and Body."
// - Pieces are the table's own columns: Head, Visor (face), Body (torso), Arms and Legs (both
//   sides). No coverage is widened to shoulders, hands, pelvis or feet.
// - Power Armor (I, BPF 8 - 10, weight "Var") is not an Item: it has no single BPF or weight.
export const meleeArmorSource=Object.freeze({bookId:'LEG10204',table:'3A',section:'1.4',pdfPages:[12,45],verification:'visual',checkedOn:'2026-09-26'});

const piece=(region,side,meleeClass,bpf,ballisticPF,weightLb)=>Object.freeze({region,side,meleeClass,bpf,ballisticPF,weightLb});
// One class over the table's columns. A null weight is a column the page leaves blank (a suit
// prints only its total).
function suit(meleeClass,bpf,pf,{head=null,visor=null,body=null,arms=null,legs=null}={},{limbs=null}={}){
  const limb=limbs??{meleeClass,bpf};
  return [
    ...(head!==false?[piece('head','center',meleeClass,bpf,pf,head)]:[]),
    ...(visor!==null&&visor!==false?[piece('face','center',meleeClass,bpf,pf,visor)]:[]),
    ...(body!==false?[piece('torso','center',meleeClass,bpf,pf,body)]:[]),
    ...(arms!==false?[piece('arm','both',limb.meleeClass,limb.bpf,pf,arms)]:[]),
    ...(legs!==false?[piece('leg','both',limb.meleeClass,limb.bpf,pf,legs)]:[])];
}
const row=(id,name,era,weightLb,pieces,note=null)=>Object.freeze({id,name,era,weightLb,pieces:Object.freeze(pieces),...(note?{note}:{})});

export const meleeArmorCatalog=Object.freeze([
  row('medieval-clothing','Clothing (medieval)','Medieval',5.0,suit('NO',0,0,{head:false,body:2.0,arms:1.0,legs:2.0})),
  row('leather-untreated','Leather, untreated','Medieval',17.0,suit('LT',2,.5,{head:2.0,body:5.0,arms:3.5,legs:6.5}),'§1.4: PCCS PF "roughly .5".'),
  row('leather-hardened','Leather, hardened','Medieval',29.0,suit('ML',2,1,{head:3.0,body:9.0,arms:6.0,legs:11.0})),
  row('mail-light','Mail, light','Medieval',26.0,suit('LT',2,.5,{head:3.0,body:7.5,arms:5.5,legs:10.0})),
  row('mail-regular','Mail, regular','Medieval',29.0,suit('ML',2,1,{head:3.5,body:8.5,arms:6.0,legs:11.0})),
  row('mail-double','Mail, double','Medieval',56.0,suit('BR',3,2,{head:7.0,body:16.0,arms:12.0,legs:21.0})),
  row('brigandine','Brigandine','Medieval',45.5,suit('BR',3,2,{head:5.5,body:13.5,arms:9.5,legs:17.0})),
  row('scale','Scale','Medieval',56.8,suit('BR',3,2.5,{head:6.6,body:16.8,arms:11.8,legs:21.6}),'Table 3A prints BR; §1.4\'s text says PL. The table is used.'),
  row('plate','Plate','Medieval',54.0,suit('PL','3+',3,{head:6.0,visor:1.0,body:16.0,arms:11.0,legs:20.0})),
  row('flak-vest','Flak Vest','Modern',10.3,suit('I',3,null,{head:false,body:10.3,arms:false,legs:false})),
  row('police-helmet','Police Helmet','Modern',2.5,suit('LT',2,null,{head:2.5,body:false,arms:false,legs:false})),
  row('ht-flexible-light','Flexible, light (high tech)','High Tech',2.0,suit('LT',1,null,{head:false,body:2.0,arms:false,legs:false})),
  row('ht-flexible-medium','Flexible, medium (high tech)','High Tech',2.5,suit('ML',1,null,{head:false,body:2.5,arms:false,legs:false})),
  row('ht-flexible-heavy','Flexible, heavy (high tech)','High Tech',3.0,suit('BR',2,null,{head:false,body:3.0,arms:false,legs:false})),
  row('combat-suit','Combat Suit','High Tech',7.4,suit('LT',1,null)),
  row('combat-suit-1','Combat Suit, Level 1','High Tech',13.9,suit('BR',3,null,{},{limbs:{meleeClass:'LT',bpf:1}})),
  row('combat-suit-2','Combat Suit, Level 2','High Tech',29.3,suit('I',5,null,{},{limbs:{meleeClass:'LT',bpf:1}})),
  row('combat-suit-3','Combat Suit, Level 3','High Tech',37.1,suit('I',6,null,{},{limbs:{meleeClass:'LT',bpf:1}})),
  row('combat-suit-4','Combat Suit, Level 4','High Tech',47.1,suit('I',6,null,{},{limbs:{meleeClass:'LT',bpf:1}})),
  row('combat-suit-5','Combat Suit, Level 5','High Tech',56.2,suit('I',7,null,{},{limbs:{meleeClass:'LT',bpf:1}})),
  row('drgn-suit','DRGN Suit','High Tech',10.0,suit('ML',1,null))
]);
export const meleeArmorById=Object.freeze(Object.fromEntries(meleeArmorCatalog.map(entry=>[entry.id,entry])));

// One armor Item for the printed pieces. Coverage keys are the region (and side) so a head and
// a visor never collide.
export function meleeArmorItem(id){
  const entry=meleeArmorById[id];
  if(!entry)throw new Error(`No Table 3A armor has id "${id}".`);
  return {name:entry.name,type:'armor',system:{
    schemaVersion:1,catalogId:entry.id,catalogRevision:'',weightLb:entry.weightLb,quantity:1,carried:true,equipped:true,attachedToId:null,
    weightNote:'',notes:entry.note??'',
    source:{bookId:'LEG10204',table:'3A',section:'1.4',pdfPage:45,verification:'visual',note:entry.note??''},
    coverage:Object.fromEntries(entry.pieces.map(p=>[p.region,{region:p.region,side:p.side,ballisticPF:p.ballisticPF,
      meleeClass:p.meleeClass,bpf:String(p.bpf),material:entry.name}]))}};
}
