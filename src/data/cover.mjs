// Cover Protection Factors, Table 7C, LEG10200 PDF 67 / printed 62.
// Visual transcription from the rendered page, 21 September 2026.
//
// §3.8 (PDF 37 / printed 32) gives the table its meaning: "The cover's Protection Factor
// (PF) measures its protection and is given on the Cover Protection Factor Table (7C). If
// the weapon's PEN is greater than the cover's PF, the weapon penetrates and the cover is
// Nonblocking. If the PEN is less than or equal to the PF, the cover is blocking."
//
// The printed table has two halves. The left half names particular things and gives each a
// single PF. The right half gives PF by material and thickness, in two blocks with different
// thickness columns - thin materials in .12 to 4 inches, bulk materials in 6 to 36 inches.
export const coverSource=Object.freeze({book:'LEG10200',pdfPage:67,printedPage:62,table:'7C',
  revision:1,status:'visual-transcription'});

// The named covers, in the printed groups and order. A fractional PF is printed as such
// (".3" for an interior wood door) and is kept fractional: §3.8 compares it against a
// weapon's PEN, which is itself fractional.
export const namedCover=Object.freeze({
  doors:Object.freeze({label:'Doors',entries:Object.freeze([
    Object.freeze({id:'door-automobile',label:'Automobile',pf:2}),
    Object.freeze({id:'door-elevator',label:'Elevator',pf:4}),
    Object.freeze({id:'door-exterior-wood',label:'Exterior wood',pf:2}),
    Object.freeze({id:'door-heavy-wood-gate',label:'Heavy wood gate',pf:5}),
    Object.freeze({id:'door-interior-wood',label:'Interior wood',pf:0.3}),
    Object.freeze({id:'door-metal-fire',label:'Metal fire',pf:6})])}),
  walls:Object.freeze({label:'Walls',entries:Object.freeze([
    Object.freeze({id:'wall-brick-6',label:'Brick, 6 inch',pf:370}),
    Object.freeze({id:'wall-brick-12',label:'Brick, 12 inch',pf:980}),
    Object.freeze({id:'wall-cinder-block',label:'Cinder block',pf:4}),
    Object.freeze({id:'wall-cinder-block-earth',label:'Cinder block, earth filled',pf:25}),
    Object.freeze({id:'wall-cinder-block-concrete',label:'Cinder block, concrete filled',pf:460}),
    Object.freeze({id:'wall-wood-frame-plaster',label:'Wood frame, interior plaster',pf:0.3}),
    Object.freeze({id:'wall-wood-frame-stucco',label:'Wood frame, exterior stucco',pf:1}),
    Object.freeze({id:'wall-log-timber',label:'Log timber',pf:22})])}),
  roofsAndFloors:Object.freeze({label:'Roofs and floors',entries:Object.freeze([
    Object.freeze({id:'roof-asphalt-shingle',label:'Asphalt shingle roof',pf:2}),
    Object.freeze({id:'roof-tile-slate',label:'Tile or slate roof',pf:4}),
    Object.freeze({id:'floor-house',label:'House floor',pf:1}),
    Object.freeze({id:'floor-high-rise',label:'High rise floor',pf:260})])}),
  miscellaneous:Object.freeze({label:'Miscellaneous',entries:Object.freeze([
    Object.freeze({id:'misc-common-furniture',label:'Common furniture',pf:1}),
    Object.freeze({id:'misc-drum-water',label:'55 gallon drum, water filled',pf:8}),
    Object.freeze({id:'misc-drum-earth',label:'55 gallon drum, earth filled',pf:85}),
    Object.freeze({id:'misc-drum-concrete',label:'55 gallon drum, concrete filled',pf:3200}),
    Object.freeze({id:'misc-horse',label:'Horse',pf:18}),
    Object.freeze({id:'misc-railroad-tie',label:'Railroad tie',pf:20}),
    Object.freeze({id:'misc-telephone-pole',label:'Telephone pole',pf:30}),
    // Printed "Woods (per 10 hexes)". The per-ten-hexes qualifier is carried on the record
    // rather than applied: nothing here measures how far a shot travels through woodland,
    // and scaling the figure would be an invention. A GM who wants five hexes of light
    // woods rules on it and states the PF.
    Object.freeze({id:'misc-woods-light',label:'Woods, light (per 10 hexes)',pf:1,perTenHexes:true}),
    Object.freeze({id:'misc-woods-medium',label:'Woods, medium (per 10 hexes)',pf:4,perTenHexes:true}),
    Object.freeze({id:'misc-woods-heavy',label:'Woods, heavy (per 10 hexes)',pf:17,perTenHexes:true})])})
});

// By material and thickness. Wood is printed in BOTH thickness blocks, at .12-4 inches and
// again at 6-36 inches; the two are merged here into one row because they share no column
// and every printed pair is preserved. Nothing is interpolated: a thickness the table does
// not print has no PF, and `coverProtectionFactor` refuses it rather than guessing.
const material=(id,label,pairs)=>Object.freeze({id,label,
  thicknesses:Object.freeze(pairs.map(([inches])=>inches)),
  pf:Object.freeze(Object.fromEntries(pairs.map(([inches,value])=>[String(inches),value])))});
const thin=[0.12,0.25,0.5,0.75,1,2,4];
const bulk=[6,8,10,12,16,24,36];
const zip=(columns,values)=>columns.map((inches,index)=>[inches,values[index]]);
export const coverByThickness=Object.freeze(Object.fromEntries([
  material('aluminum','Aluminum',zip(thin,[1,4,9,16,24,64,170])),
  material('bullet-proof-glass','Bullet proof glass',zip(thin,[0.5,1,3,6,8,22,58])),
  material('fiberglass','Fiberglass',zip(thin,[0.4,1,3,5,7,18,181])),
  material('steel','Steel',zip(thin,[6,16,42,75,110,300,780])),
  material('steel-armor-plate','Steel armor plate',zip(thin,[11,30,79,140,210,550,1500])),
  material('titanium-armor-plate','Titanium armor plate',zip(thin,[5,13,35,62,93,250,650])),
  material('wood','Wood',[...zip(thin,[0.3,0.5,1,1,2,4,7]),...zip(bulk,[11,15,18,22,29,44,66])]),
  material('concrete','Concrete',zip(bulk,[450,680,930,1200,1800,3200,5600])),
  material('earth-hand-packed','Earth, hand packed',zip(bulk,[20,27,34,40,54,80,120])),
  material('earth-hard-ground','Earth, hard ground',zip(bulk,[24,32,41,48,65,96,140])),
  material('rock','Rock',zip(bulk,[900,1300,1800,2400,3600,6400,11000])),
  material('sand-loose','Sand, loose',zip(bulk,[11,15,19,23,30,45,68])),
  material('water','Water',zip(bulk,[1,2,2,2,3,5,7]))
].map(entry=>[entry.id,entry])));

const named=new Map(Object.values(namedCover).flatMap(group=>group.entries.map(entry=>[entry.id,entry])));
export const namedCoverIds=Object.freeze([...named.keys()]);

// One printed Protection Factor, or a refusal that says what the table does print. Nothing
// is interpolated and nothing is defaulted: an unstated cover is not PF 0, it is a question.
export function coverProtectionFactor(choice){
  if(!choice||typeof choice!=='object')throw new Error('Name the cover from Table 7C, or state an adjudicated Protection Factor.');
  if(choice.adjudicated!==undefined){
    const pf=choice.adjudicated;
    if(typeof pf!=='number'||!Number.isFinite(pf)||pf<0)throw new Error('An adjudicated cover Protection Factor must be a finite number of zero or more.');
    if(typeof choice.reason!=='string'||!choice.reason.trim())throw new Error('Record why this cover is not on Table 7C.');
    return {pf,label:choice.reason.trim(),basis:'adjudicated',source:coverSource};
  }
  if(choice.id){
    const entry=named.get(choice.id);
    if(!entry)throw new Error(`"${choice.id}" is not a Table 7C cover. Choose one of: ${namedCoverIds.join(', ')}.`);
    return {pf:entry.pf,label:entry.label,basis:'table',source:coverSource,
      ...(entry.perTenHexes?{note:'Table 7C prints this per ten hexes of woodland; the figure is used as printed.'}:{})};
  }
  if(choice.material){
    const entry=coverByThickness[choice.material];
    if(!entry)throw new Error(`"${choice.material}" is not a Table 7C material. Choose one of: ${Object.keys(coverByThickness).join(', ')}.`);
    const key=String(choice.inches);
    if(!Object.hasOwn(entry.pf,key))throw new Error(`Table 7C prints ${entry.label} at ${entry.thicknesses.join(', ')} inches, not ${choice.inches}. Choose a printed thickness or record an adjudicated Protection Factor.`);
    return {pf:entry.pf[key],label:`${entry.label}, ${key} inch`,basis:'table',source:coverSource};
  }
  throw new Error('Name the cover from Table 7C, or state an adjudicated Protection Factor.');
}
