// §1.4 Equipment and Armor (LEG10200 PDF 13-14 / printed 8-9) and §1.5's Pregenerated Troop
// Table (PDF 14 / printed 9). Visual transcription from the rendered pages, 21 September 2026.
//
// These are the book's own catalogues, small and complete. §1.4 says of the equipment list
// that it "is by no means a complete list" and invites players to extend it, so it is a
// starting kit rather than a closed set.
export const equipmentSource=Object.freeze({book:'LEG10200',pdfPages:Object.freeze([13,14]),
  printedPages:Object.freeze([8,9]),sections:Object.freeze(['1.4','1.5']),
  revision:1,status:'visual-transcription'});

// The Equipment Table, printed 8. Weights in pounds, exactly as printed - a magazine pouch
// really is .2 lb and a field radio really is 12.
export const equipmentCatalog=Object.freeze([
  Object.freeze({id:'bayonet',name:'Bayonet',weightLb:1.0}),
  Object.freeze({id:'binoculars',name:'Binoculars',weightLb:2.0}),
  Object.freeze({id:'bipod',name:'Bipod',weightLb:1.0}),
  Object.freeze({id:'canteen',name:'Canteen (full)',weightLb:2.5}),
  Object.freeze({id:'clothing',name:'Clothing',weightLb:5.0}),
  Object.freeze({id:'entrenching-tool',name:'Entrenching tool',weightLb:1.5}),
  Object.freeze({id:'field-radio',name:'Field radio',weightLb:12.0}),
  Object.freeze({id:'fighting-harness',name:'Fighting harness',weightLb:0.6}),
  Object.freeze({id:'headset',name:'Headset communication',weightLb:1.0}),
  Object.freeze({id:'holster',name:'Holster',weightLb:0.4}),
  Object.freeze({id:'magazine-pouch',name:'Magazine pouch (2 mags)',weightLb:0.2}),
  Object.freeze({id:'optical-scope',name:'Optical scope',weightLb:2.5}),
  Object.freeze({id:'sling',name:'Sling',weightLb:0.4}),
  Object.freeze({id:'smoke-grenade',name:'Smoke grenade',weightLb:1.0})]);

// The Armor Table, printed 9. §1.4: "If the weapon's Penetration value (PEN) is less than or
// equal to the armor's Protection Factor (PF), the armor will stop the projectile" - the same
// comparison Table 7C makes for cover. "Body armor has been divided into head, visor, and
// body coverage and is worn over normal clothing."
//
// A dash in a weight column means the armour has no piece there, which is not the same as a
// piece weighing nothing, so those are `null`. BPF is the Blunt Protection Factor, used only
// by the Advanced Combat Supplement, and is carried rather than used.
//
// The three starred rows have a visor, and the footnote overrides its Protection Factor:
// "* Visor PF = 4", whatever the rest of the suit is rated at.
export const VISOR_PROTECTION_FACTOR=4;
//
// Hand-to-hand reads armor by LEG10204 §1.4 and Armor Data Table 3A (PDF 12, 45): a melee
// Armor Class and a BPF. By the user's ruling (26 Sep 2026) 3A's BPF is the one melee uses; it
// differs from this table's printed BPF on two rows, Medium Flexible (3A: 1) and Heavy Flexible
// (3A: 2), and `bluntProtectionFactor` keeps this table's value as printed. 3A's Rigid rows are
// Light 3.1/.8/11.5, Medium 4.0/.8/15.0 and Heavy 24.0, which are this table's Rigid, Medium
// and Heavy; this table's lighter "Light Rigid" is not on 3A, and §1.4 makes all rigid armor I.
const melee=(armorClass,bluntProtectionFactor)=>Object.freeze({armorClass,bluntProtectionFactor,
  source:'LEG10204 §1.4 and Table 3A, PDF 12 and 45'});
const meleeRows={clothing:melee('NO',0),'light-flexible':melee('LT',1),'medium-flexible':melee('ML',1),'heavy-flexible':melee('BR',2),
  'light-rigid':melee('I',4),rigid:melee('I',4),'medium-rigid':melee('I',5),'heavy-rigid':melee('I',6)};
const armor=(id,name,pf,bpf,head,visor,body)=>Object.freeze({id,name,protectionFactor:pf,bluntProtectionFactor:bpf,melee:meleeRows[id],
  pieces:Object.freeze([
    ...(head===null?[]:[Object.freeze({region:'head',weightLb:head,protectionFactor:pf})]),
    ...(visor===null?[]:[Object.freeze({region:'visor',weightLb:visor,protectionFactor:VISOR_PROTECTION_FACTOR,
      note:'Table footnote: a visor is Protection Factor 4 whatever the rest of the suit is rated at.'})]),
    ...(body===null?[]:[Object.freeze({region:'body',weightLb:body,protectionFactor:pf})])])});
export const armorCatalog=Object.freeze([
  armor('clothing','Clothing',0,0,null,null,5.0),
  armor('light-flexible','Light flexible armor',4,1,null,null,2.0),
  armor('medium-flexible','Medium flexible armor',6,2,null,null,2.6),
  armor('heavy-flexible','Heavy flexible armor',9,3,null,null,3.2),
  armor('light-rigid','Light rigid armor',6,4,2.2,0.8,7.9),
  armor('rigid','Rigid armor',10,4,3.1,0.8,11.5),
  armor('medium-rigid','Medium rigid armor',16,5,4.0,0.8,15.0),
  armor('heavy-rigid','Heavy rigid armor',30,6,null,null,24.0)]);

// §1.5's Pregenerated Troop Table, printed 9. The first six rows are unarmoured; the last
// three are Line, Crack and Elite again in a helmet and body armour, which costs them Combat
// Actions. A dash in a Protection Factor column means no armour, so those are `null`.
//
// This table is a second oracle on the character derivations, independent of the sample
// character in Figure 1: every printed Skill Accuracy Level must fall out of Table 1C, and
// every Knockout Value out of .5 x Will x Skill Level. They do - see the tests - which is a
// real check on a legacy-ported Table 1C. The implied Will rises with quality: 10 for
// Militia, Green and Line, 14 for Crack, 16 for Elite.
//
// Untrained is the one row that does not fall out: Skill Level 0 gives a Knockout Value of 0
// by the formula, and the table prints 5. Recorded as printed, and flagged rather than
// smoothed over.
const troop=(id,name,skillLevel,combatActions,helmPF,bodyPF,knockoutValue,skillAccuracyLevel,impliedWill,note=null)=>
  Object.freeze({id,name,skillLevel,combatActions,helmPF,bodyPF,knockoutValue,skillAccuracyLevel,impliedWill,
    armored:helmPF!==null,...(note?{note}:{})});
export const pregeneratedTroops=Object.freeze([
  troop('untrained','Untrained',0,3,null,null,5,0,null,
    'Skill Level 0 gives a Knockout Value of 0 by §1.3 Step 8, but the table prints 5. Used as printed.'),
  troop('militia','Militia',1,4,null,null,5,5,10),
  troop('green','Green',2,4,null,null,10,7,10),
  troop('line','Line',4,4,null,null,20,10,10),
  troop('crack','Crack',5,6,null,null,35,11,14),
  troop('elite','Elite',7,6,null,null,56,13,16),
  troop('line-armored','Line, armoured',4,3,16,30,20,10,10),
  troop('crack-armored','Crack, armoured',5,4,16,30,35,11,14),
  troop('elite-armored','Elite, armoured',7,4,16,30,56,13,16)]);

// §1.2's description of the 3-18 scale, printed 4. Used to label a rolled characteristic
// rather than to compute anything.
export const characteristicScale=Object.freeze([
  Object.freeze({from:18,label:'Exceptional'}),Object.freeze({from:16,label:'Excellent'}),
  Object.freeze({from:14,label:'Good'}),Object.freeze({from:12,label:'Above average'}),
  Object.freeze({from:10,label:'Average'}),Object.freeze({from:8,label:'Below average'}),
  Object.freeze({from:6,label:'Poor'}),Object.freeze({from:3,label:'Extremely poor'})]);

// §1.3 Step 2's guidance on choosing a Gun Combat Skill Level. The book gives bands rather
// than a table, and it is explicit that the level is chosen rather than rolled: "Player or
// Referee chooses the Gun Combat Skill Level."
export const skillLevelGuidance=Object.freeze([
  Object.freeze({from:0,to:0,label:'No training whatsoever'}),
  Object.freeze({from:1,to:2,label:'Below an average soldier'}),
  Object.freeze({from:3,to:4,label:'An average soldier in an average army'}),
  Object.freeze({from:5,to:7,label:'Highly trained elite troops'}),
  Object.freeze({from:8,to:12,label:'Outstanding members of elite units'}),
  Object.freeze({from:13,to:20,label:'Only truly exceptional people'})]);
