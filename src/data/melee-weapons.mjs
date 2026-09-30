// LEG10204 Weapon Data Tables 1A (Archaic, PDF 42) and 1B (Modern, PDF 43). Visual transcription
// from 300 dpi renders of the user-supplied PDF, 26 September 2026. The existing K-Bar, Axe or Mace
// and Club items agree with their rows here.
//
// §3.6 (PDF 23): slashes with edged weapons read the Cutting table, maces and hard narrow surfaces
// the Flange table, wooden weapons and broad unedged surfaces the Blunt table; thrusts with pointed
// weapons read the Stabbing table. The per-weapon reading below is the user's ruling (26 Sep 2026).
// A thrust with a flange or blunt weapon stays on that weapon's own table (D42).
//
// Each mode is [modeId, grip, hands, Weapon Speed, Weapon Class, cutting ID, stabbing ID, range].
// ID is printed "(N) + b": an N-sided die plus b. Range is in 2-foot hexes; "N+" can Tip Hit at
// N + 1 (§1.2 Step 9), and "A - B" reaches A to B hexes only.
//
// Special rows (user rulings, 26 Sep 2026): both Chainsaws (§5.7) and the Bullwhip (§5.9) play
// only with their optional rule enabled in the world settings. Lance at Charge and the spears'
// Mounted Charge lines print no WS or WC: they are grips the GM chooses when a charge happens,
// stating its WC; a charge strikes for one action (D41's Strike row), after no sets, and owes no
// recovery. The Small Arms block's rows are hand weapons of their own: a gun barrel or pistol
// frame reads the Flange table and a stock the Blunt table (§3.6), a bayonet the Stabbing one.
//
// §1.3 (PDF 11) prints special damage for three small points, carried as attack traits the
// resolver knows: Scissors do normal Impact but 1/4 PD; a Screwdriver normal Impact but 1/10 PD
// when stabbing; an Ice Pick a Damage Modifier of 4 times normal Impact but 1/10 PD. The book
// prints "Screwdriver or Ice Pick" as one row; it is split because their rules differ.
export const meleeWeaponSource=Object.freeze({bookId:'LEG10204',tables:['1A','1B'],pdfPages:[42,43],verification:'visual',checkedOn:'2026-09-26'});

const one=(ws,wc,idc,ids,range)=>['oneHanded','One handed',1,ws,wc,idc,ids,range];
const two=(ws,wc,idc,ids,range)=>['twoHanded','Used in two hands',2,ws,wc,idc,ids,range];
const oneOfTwo=(ws,wc,idc,ids,range)=>['oneHanded','Used in one hand',1,ws,wc,idc,ids,range];
const choked=(ws,wc,idc,ids,range)=>['choked','Choked grip',2,ws,wc,idc,ids,range];
const charge=(ids,range,hands=1)=>['charge','At charge',hands,null,null,null,ids,range];
const mountedCharge=(ids,range)=>['mountedCharge','Mounted charge',1,null,null,null,ids,range];
const longGrip=(ws,wc,idc,ids,range)=>['longGrip','Long grip',2,ws,wc,idc,ids,range];

// [id, name, table, section, slash family, weight, modes]
const rows=[
  ['dagger','Dagger','1A','One-handed weapons','cutting',1.1,[one(2.8,2,'(3) + 2','(3)','1')]],
  ['wakizashi','Wakizashi','1A','One-handed weapons','cutting',1.8,[one(2.5,1,'(5) + 2','(3)','1')]],
  ['short-sword','Short Sword','1A','One-handed weapons','cutting',1.7,[one(2.7,1,'(4) + 2','(3)','1')]],
  ['rapier','Rapier','1A','One-handed weapons','cutting',1.8,[one(2.7,1,'(2) + 1','(3)','2+')]],
  ['saber','Saber','1A','One-handed weapons','cutting',2.6,[one(2.3,0,'(5) + 2','(3)','2+')]],
  ['broadsword','Broadsword','1A','One-handed weapons','cutting',3.6,[one(2.2,0,'(6) + 2','(3)','2'),two(2.3,0,'(10) + 2','(5)','2')]],
  ['scimitar','Scimitar','1A','One-handed weapons','cutting',3.7,[one(2.0,0,'(6) + 3','(3)','2+'),two(2.1,0,'(10) + 3','(5)','2+')]],
  ['cutlass','Cutlass','1A','One-handed weapons','cutting',3.1,[one(2.3,0,'(5) + 2','(3)','1+'),two(2.4,0,'(8) + 2','(4)','1+')]],
  ['hand-and-a-half-sword','Hand and a Half Sword','1A','One-handed weapons','cutting',4.6,[one(2.0,-1,'(6) + 2','(3)','2+'),two(2.1,-1,'(10) + 4','(5)','2+')]],
  ['axe','Axe','1A','One-handed weapons','cutting',3.3,[one(2.1,-2,'(4) + 4','(3)','1'),two(2.1,-2,'(6) + 6','(4)','1')]],
  ['mace','Mace','1A','One-handed weapons','flange',3.3,[one(2.1,-2,'(4) + 4','(3)','1'),two(2.1,-2,'(6) + 6','(4)','1')]],
  ['lance','Lance','1A','One-handed weapons','cutting',9.2,[charge('(10) x (3)','5')]],
  ['katana','Katana','1A','Two-handed weapons','cutting',3.0,[two(2.2,0,'(10) + 4','(5)','2'),oneOfTwo(2.1,0,'(5) + 2','(3)','2')]],
  ['no-dachi','No-Dachi','1A','Two-handed weapons','cutting',6.8,[two(1.6,-4,'(12) + 6','(6)','3')]],
  ['two-handed-sword','Two Handed Sword','1A','Two-handed weapons','cutting',5.9,[two(2.0,-1,'(12) + 5','(6)','2+')]],
  ['great-sword','Great Sword','1A','Two-handed weapons','cutting',5.8,[two(1.6,-4,'(12) + 6','(6)','3')]],
  ['battleaxe','Battleaxe','1A','Two-handed weapons','cutting',4.6,[two(1.8,-3,'(8) + 7','(5)','2')]],
  ['light-spear','Light Spear','1A','Two-handed weapons','cutting',3.0,[two(2.1,-2,null,'(5)','4'),oneOfTwo(2.0,-2,null,'(3)','3'),mountedCharge('(12)','3')]],
  ['heavy-spear','Heavy Spear','1A','Two-handed weapons','cutting',5.0,[two(1.8,-3,null,'(6)','4'),oneOfTwo(1.7,-4,null,'(4)','3'),mountedCharge('(20)','3')]],
  ['glaive','Glaive or Naginata','1A','Two-handed weapons','cutting',6.2,[two(1.1,-9,'(12) + 8','(6)','3 - 4'),choked(1.6,-4,'(12) + 7','(6)','1 - 2')]],
  ['halberd','Halberd or Poleaxe','1A','Two-handed weapons','cutting',5.8,[two(1.2,-8,'(12) + 8','(6)','3 - 4'),choked(1.6,-4,'(12) + 7','(6)','1 - 2')]],
  ['club','Club','1A','Blunt impact weapons','blunt',2.2,[one(2.2,0,'(4) + 3','(3)','1'),two(2.4,0,'(10) + 5','(5)','1')]],
  ['quarterstaff','Quarterstaff','1A','Blunt impact weapons','blunt',3.4,[two(2.2,0,'(8) + 4','(5)','2'),longGrip(2.1,-1,'(12) + 5','(5)','3')]],
  ['mace-and-chain','Mace and Chain','1A','Blunt impact weapons','flange',4.2,[one(1.6,2,'(6) + 4',null,'2'),two(2.0,2,'(12) + 6',null,'2')]],
  ['nunchaku','Nunchaku','1A','Blunt impact weapons','blunt',2.1,[one(2.1,1,'(4) + 2',null,'1+')]],
  ['stick','Stick','1A','Blunt impact weapons','blunt',2.0,[one(2.5,0,'(4) + 2','(3)','2'),two(2.6,0,'(10) + 5','(5)','2')]],
  ['rock','Rock','1A','Blunt impact weapons','blunt',1.5,[one(2.6,0,'(6) + 2',null,'1')]],
  ['heavy-rock','Rock, heavy (two hands)','1A','Blunt impact weapons','blunt',10.0,[two(1.4,-5,'(10) + 5',null,'1')]],
  ['baseball-bat','Baseball Bat','1B','Modern weapons','blunt',2.2,[one(2.5,1,'(4) + 2','(3)','2'),two(2.6,1,'(10) + 3','(5)','2')]],
  ['billyclub','Billyclub, Tonfa','1B','Modern weapons','blunt',.5,[one(2.8,2,'(3) + 1','(3)','1')]],
  ['blackjack','Blackjack','1B','Modern weapons','blunt',.5,[one(2.8,0,'(5)',null,'1')]],
  ['bottle','Bottle','1B','Modern weapons','blunt',1.3,[one(2.8,1,'(3) + 2','(3)','1')]],
  ['bottle-hollywood','Bottle, Hollywood type','1B','Modern weapons','blunt',1.3,[one(2.8,1,'(2)',null,'1')]],
  ['bullwhip','Bullwhip','1B','Modern weapons','cutting',2.0,[one(1.0,0,'(6)',null,'5')]],
  ['chain','Chain','1B','Modern weapons','flange',3.0,[one(2.0,2,'(6) + 2',null,'2'),two(2.2,2,'(10) + 2',null,'2')]],
  ['chainsaw-18','Chainsaw, 18 inch','1B','Modern weapons','cutting',19.5,[two(1.5,-8,'(8) + 2','(6) + 1','1+')]],
  ['chainsaw-30','Chainsaw, 30 inch','1B','Modern weapons','cutting',27.3,[two(1.0,-10,'(10) + 3','(6) + 3','2')]],
  ['chair','Chair (two hands)','1B','Modern weapons','blunt',15.0,[two(1.0,-12,'(12) + 8','(6)','2')]],
  ['chair-hollywood','Chair, Hollywood type','1B','Modern weapons','blunt',15.0,[two(1.0,-12,'(5)',null,'2')]],
  ['cleaver','Cleaver or Hatchet','1B','Modern weapons','cutting',2.5,[one(2.3,-1,'(4) + 3','(3)','1'),two(2.3,-1,'(6) + 5','(4)','1')]],
  ['crowbar','Crowbar','1B','Modern weapons','flange',2.5,[one(2.3,0,'(6) + 2','(3)','1+'),two(2.4,0,'(10) + 4','(5)','1+')]],
  ['entrenching-tool','Entrenching Tool','1B','Modern weapons','cutting',1.8,[one(2.5,-1,'(3) + 3','(3)','1'),two(2.6,-1,'(5) + 5','(4)','1')]],
  ['hammer-14oz','Hammer, 14 ounce','1B','Modern weapons','flange',1.5,[one(2.6,-1,'(3) + 3','(3)','1'),two(2.7,-1,'(6) + 3','(3)','1')]],
  ['hammer-2lb','Hammer, 2 pound','1B','Modern weapons','flange',2.3,[one(2.4,-2,'(4) + 3','(3)','1'),two(2.5,-2,'(6) + 5','(4)','1')]],
  ['pocket-knife','Pocket Knife','1B','Modern weapons','cutting',.3,[one(2.9,2,'(2) + 1','(3)','1')]],
  ['switchblade','Switchblade','1B','Modern weapons','cutting',.3,[one(2.9,2,'(2) + 1','(3)','1')]],
  ['k-bar','K-Bar Knife','1B','Modern weapons','cutting',.6,[one(2.8,2,'(3) + 1','(3)','1')]],
  ['bowie-knife','Bowie or Survival Knife','1B','Modern weapons','cutting',1.1,[one(2.8,2,'(3) + 2','(3)','1')]],
  ['machete','Machete','1B','Modern weapons','cutting',2.4,[one(2.3,0,'(6) + 2','(3)','1'),two(2.4,0,'(10) + 3','(3)','1')]],
  ['pipe','Pipe, 24 inch','1B','Modern weapons','flange',2.2,[one(2.5,0,'(4) + 2','(3)','1+'),two(2.6,0,'(10) + 3','(4)','1+')]],
  ['pipe-wrench','Pipe Wrench, 12 inch','1B','Modern weapons','flange',3.3,[one(2.1,-2,'(4) + 4','(3)','1')]],
  ['scissors','Scissors','1B','Modern weapons','cutting',.2,[one(2.7,1,null,'(3)','1')]],
  ['screwdriver','Screwdriver','1B','Modern weapons','cutting',.2,[one(2.9,2,null,'(3)','1')]],
  ['ice-pick','Ice Pick','1B','Modern weapons','cutting',.2,[one(2.9,2,null,'(3)','1')]],
  ['sledge-hammer','Sledge Hammer, 6 pound','1B','Modern weapons','flange',7.5,[two(1.0,-9,'(10) + 10','(6)','2')]],
  ['two-by-four','Two by Four','1B','Modern weapons','blunt',3.0,[one(2.4,0,'(5) + 2','(3)','2'),two(2.5,0,'(8) + 4','(5)','2')]],
  ['wood-axe','Wood Axe (two hands)','1B','Modern weapons','cutting',3.5,[two(1.7,-2,'(10) + 6','(5)','2')]],
  ['pistol-melee','Pistol (as a hand weapon)','1B','Small arms weapons','flange',2.4,[one(2.4,0,'(6) + 3',null,'1')]],
  ['light-rifle-bayonet','Light Rifle with Bayonet','1B','Small arms weapons','blunt',8.0,[two(1.9,-1,'(6) + 3','(6) + 2','2+')],{thrustFamily:'stabbing'}],
  ['heavy-rifle-bayonet','Heavy Rifle with Bayonet','1B','Small arms weapons','blunt',11.2,[two(1.8,-2,'(8) + 3','(6) + 3','2+')],{thrustFamily:'stabbing'}],
  ['smg-melee','Sub-Machinegun (as a hand weapon)','1B','Small arms weapons','blunt',6.8,[two(2.0,-1,'(6)','(6) + 1','2')],{thrustFamily:'flange'}]
];

const specialTraits={scissors:['pd-quarter'],screwdriver:['pd-tenth'],'ice-pick':['impact-x4','pd-tenth'],
  'chainsaw-18':['chainsaw'],'chainsaw-30':['chainsaw'],bullwhip:['whip']};

// "(N) + b" or "(N)" to the stored "1dN + b" / "1dN" form.
// "(N) x (M)" is Lance at Charge's die times M.
export function impactFormula(printed){
  const times=/^\((\d+)\)\s*x\s*\((\d+)\)$/.exec(printed??'');
  if(times)return `1d${times[1]} x ${times[2]}`;
  const match=/^\((\d+)\)(?:\s*\+\s*(\d+))?$/.exec(printed??'');
  if(!match)throw new Error(`"${printed}" is not a Table 1 Impact Damage entry.`);
  return match[2]?`1d${match[1]} + ${match[2]}`:`1d${match[1]}`;
}

// Range in 2-foot hexes to reach in feet.
export function reachFeet(range){
  const span=/^(\d+)\s*-\s*(\d+)$/.exec(range);
  if(span)return {reachMinFeet:2*Number(span[1]),reachMaxFeet:2*Number(span[2]),tipReachFeet:null};
  const plain=/^(\d+)(\+)?$/.exec(range);
  if(!plain)throw new Error(`"${range}" is not a Table 1 range.`);
  const hexes=Number(plain[1]);
  return {reachMinFeet:2,reachMaxFeet:2*hexes,tipReachFeet:plain[2]?2*(hexes+1):null};
}

export const meleeWeapons=Object.freeze(rows.map(([id,name,table,section,family,weightLb,modes,options={}])=>Object.freeze({id,name,table,section,family,weightLb,thrustFamily:options.thrustFamily??null,
  modes:Object.freeze(modes.map(([modeId,grip,hands,weaponSpeed,weaponClass,cutting,stabbing,range])=>Object.freeze({modeId,grip,hands,weaponSpeed,weaponClass,cutting,stabbing,range})))})));
export const meleeWeaponsById=Object.freeze(Object.fromEntries(meleeWeapons.map(entry=>[entry.id,entry])));

export function meleeWeaponItem(id){
  const entry=meleeWeaponsById[id];
  if(!entry)throw new Error(`No transcribed hand weapon has id "${id}".`);
  const thrustFamily=entry.thrustFamily??(entry.family==='cutting'?'stabbing':entry.family);
  const traits=()=>[...(specialTraits[entry.id]??[])];
  const charging=mode=>mode.modeId==='charge'||mode.modeId==='mountedCharge';
  const meleeModes=Object.fromEntries(entry.modes.map(mode=>[mode.modeId,{
    grip:mode.grip,skill:'melee',hands:mode.hands,weaponSpeed:mode.weaponSpeed,weaponClass:mode.weaponClass,
    ...reachFeet(mode.range),
    attacks:{
      ...(mode.cutting?{slash:{motion:'slash',damageFamily:entry.family,impactFormula:impactFormula(mode.cutting),traits:traits()}}:{}),
      ...(mode.stabbing?{thrust:{motion:'thrust',damageFamily:thrustFamily,impactFormula:impactFormula(mode.stabbing),
        ...(charging(mode)?{traits:[...traits(),'charge'],actionCosts:{set:0,strike:1,recover:0}}:{traits:traits()})}}:{})
    },
    preparation:{sets:0,progressActions:0,recoveryRequired:false}
  }]));
  return {name:entry.name,type:'weapon',system:{
    schemaVersion:1,catalogId:entry.id,catalogRevision:'',weightLb:entry.weightLb,
    quantity:1,carried:true,equipped:true,attachedToId:null,weightNote:'',notes:'',
    source:{bookId:'LEG10204',table:entry.table,section:entry.section,pdfPage:entry.table==='1A'?42:43,verification:'visual',note:''},
    selectedModeId:entry.modes[0].modeId,firearmModes:{},
    loaded:{ammunitionItemId:null,rounds:0,chamber:'unknown'},meleeModes}};
}
