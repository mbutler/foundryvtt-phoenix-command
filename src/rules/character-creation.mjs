// Generating a character, LEG10200 §1.3 (PDF 9-12 / printed 4-7), with §1.2's scale and
// §1.5's pregenerated troops.
//
// The derivations themselves already existed: `./allowance.mjs` walks Tables 1A to 1E and the
// Knockout Value. What was missing was §1.3 itself — the nine steps as a named procedure, so
// that a character can be made rather than assembled by hand out of parts, and so that each
// value on the sheet can say which step of the book it came from.
//
// Two of the nine steps are not the system's to make. Step 1 is three six-sided dice, which
// the Foundry layer rolls, and Step 2 is a choice: "Player or Referee chooses the Gun Combat
// Skill Level." Everything else follows from those two and the equipment carried.
import {deriveAllowance,deriveBaseSpeed,deriveMaximumSpeed,skillAccuracyLevel,
  intelligenceSkillFactor,knockoutValue,allowanceSource,deriveHandToHand} from './allowance.mjs';
import {characteristicScale,skillLevelGuidance,pregeneratedTroops,equipmentSource} from '../data/equipment.mjs';

export const creationSource='LEG10200 §1.2 PDF 7-9, §1.3 PDF 9-12, §1.5 PDF 14; Tables 1A-1E PDF 60';

export const CHARACTERISTICS=Object.freeze(['strength','intelligence','will','health','agility']);
export const SKILL_LEVEL_MAX=20;

// §1.2, printed 4: "The value of each Characteristic will typically be between 3 and 18."
// A label, not a calculation - it reads the highest band the value reaches.
export function describeCharacteristic(value){
  if(!Number.isFinite(value))return null;
  return characteristicScale.find(band=>value>=band.from)?.label
    ?? `Below the printed scale, which starts at ${characteristicScale.at(-1).from}`;
}

// §1.3 Step 2, printed 4. The bands are guidance for a choice, never a constraint on it.
export function describeSkillLevel(level){
  if(!Number.isInteger(level)||level<0||level>SKILL_LEVEL_MAX)
    throw new Error(`A Gun Combat Skill Level is a whole number from 0 to ${SKILL_LEVEL_MAX}; §1.3 Step 2 calls ${SKILL_LEVEL_MAX} the maximum possible.`);
  return skillLevelGuidance.find(band=>level>=band.from&&level<=band.to)?.label ?? null;
}

// §1.3 Step 3, printed 4: "the total weight of armor, clothing, weapons, and equipment
// carried into combat". The book's own caveat travels with the number, because it changes
// the answer: "Backpacks and other non-combat equipment can sometimes be dropped before
// entering combat; if so, they should not be included in this weight."
export function encumbrance(items=[]){
  let total=0;const unknown=[];
  for(const item of items){
    if(item?.carried===false)continue;
    const quantity=item?.quantity??1;
    if(!Number.isInteger(quantity)||quantity<0)throw new Error('An item quantity is a whole number of zero or more.');
    if(!Number.isFinite(item?.weightLb)){unknown.push(item?.name??item?.id??'an unnamed item');continue;}
    if(item.weightLb<0)throw new Error('An item weight cannot be negative.');
    total+=item.weightLb*quantity;
  }
  return {weightLb:total,unknown,
    complete:unknown.length===0,
    detail:unknown.length
      ?`${total} lb of known weight, with no weight recorded for ${unknown.join(', ')}. §1.3 Step 3 totals everything carried into combat, so an unweighed item leaves the Encumbrance short.`
      :`${total} lb carried into combat. Anything dropped before the fight — a backpack, say — is not part of it.`,
    source:creationSource};
}

// §1.3 Step 9 and §1.5, printed 7 and 9: "Shot Accuracy = Aim Time Mod (Weapon Data Table)
// + SAL (Step 5)". One number per aim time, which is what the status sheet's Shot Accuracy
// column holds. The resolver adds the same two together for a single shot; this is the whole
// column, worked out once so a player can read it off rather than recompute it per shot.
export function shotAccuracy({aimModifiers,skillAccuracyLevel:sal}){
  if(!Number.isInteger(sal))throw new Error('A Skill Accuracy Level is needed before Shot Accuracy can be worked out.');
  if(!aimModifiers||typeof aimModifiers!=='object')throw new Error('Shot Accuracy needs the weapon’s printed Aim Time Modifiers.');
  const rows=Object.entries(aimModifiers)
    .map(([actions,modifier])=>[Number(actions),modifier])
    .filter(([actions,modifier])=>Number.isInteger(actions)&&Number.isFinite(modifier))
    .sort((a,b)=>a[0]-b[0])
    .map(([aimActions,aimModifier])=>({aimActions,aimModifier,shotAccuracy:aimModifier+sal}));
  return {rows,skillAccuracyLevel:sal,
    formula:'Shot Accuracy = Aim Time Mod + Skill Accuracy Level',source:creationSource};
}

// §1.3 as one pass. `characteristics` are Step 1's five values, `gunCombatSkill` is Step 2's
// choice, and `encumbranceLb` is Step 3. Steps 4 to 8 are the existing table chain, reported
// step by step so the sheet can show where each number came from rather than only the last.
//
// Unknown inputs stay unknown: a character with no Strength recorded has no Base Speed, and
// that is reported rather than guessed, exactly as `deriveAllowance` already does.
export function generateCharacter({characteristics={},gunCombatSkill,handToHandSkill,unarmedSkill,encumbranceLb,isfRounding=null}={}){
  const {strength,intelligence,will,health,agility}=characteristics;
  const steps={};
  const note=(step,title,value,extra={})=>({step,title,...value,...extra});

  steps.characteristics=note(1,'Characteristics',{resolved:CHARACTERISTICS.every(key=>Number.isFinite(characteristics[key])),
    value:Object.fromEntries(CHARACTERISTICS.map(key=>[key,characteristics[key]??null]))},
    {described:Object.fromEntries(CHARACTERISTICS.map(key=>[key,describeCharacteristic(characteristics[key])])),
     detail:'§1.3 Step 1: each characteristic is the total of three six-sided dice.'});

  let skillDescription=null;
  if(Number.isInteger(gunCombatSkill)){
    try{skillDescription=describeSkillLevel(gunCombatSkill);}catch(error){skillDescription=error.message;}
  }
  steps.skillLevel=note(2,'Gun Combat Skill Level',
    {resolved:Number.isInteger(gunCombatSkill)&&gunCombatSkill>=0&&gunCombatSkill<=SKILL_LEVEL_MAX,value:gunCombatSkill??null},
    {described:skillDescription,detail:'§1.3 Step 2: the player or referee chooses this; it is not rolled.'});

  steps.encumbrance=note(3,'Encumbrance',{resolved:Number.isFinite(encumbranceLb),value:encumbranceLb??null},
    {detail:'§1.3 Step 3: the total weight of armour, clothing, weapons and equipment carried into combat.'});

  const baseSpeed=deriveBaseSpeed({strength,encumbranceLb});
  steps.baseSpeed=note(4,'Base Speed',baseSpeed,{detail:'§1.3 Step 4: Strength against Encumbrance on Table 1A.'});
  const maximumSpeed=baseSpeed.resolved?deriveMaximumSpeed({agility,baseSpeed:baseSpeed.value})
    :{resolved:false,reason:'base-speed-unresolved',detail:'Maximum Speed needs a Base Speed first.'};
  steps.maximumSpeed=note(4,'Maximum Speed',maximumSpeed,{detail:'§1.3 Step 4: Agility against Base Speed on Table 1B.'});

  const sal=skillAccuracyLevel(gunCombatSkill);
  steps.skillAccuracyLevel=note(5,'Skill Accuracy Level',sal,{detail:'§1.3 Step 5: Table 1C, opposite the Gun Combat Skill Level.'});
  const isf=sal.resolved?intelligenceSkillFactor({intelligence,skillAccuracyLevel:sal.value})
    :{resolved:false,reason:'sal-unresolved',detail:'The Intelligence Skill Factor needs a Skill Accuracy Level first.'};
  steps.intelligenceSkillFactor=note(6,'Intelligence Skill Factor',isf,{detail:'§1.3 Step 6: Intelligence + Skill Accuracy Level.'});

  // Steps 7 and 8 come from the whole chain at once, so that a single unresolved input is
  // reported the same way here as it is anywhere else that asks for an allowance.
  const allowance=deriveAllowance({strength,agility,intelligence,will,gunCombatSkill,encumbranceLb,isfRounding});
  steps.combatActions=note(7,'Combat Actions',
    allowance.resolved?{resolved:true,value:allowance.value,schedule:allowance.schedule}:allowance,
    {detail:'§1.3 Step 7: Maximum Speed against the Intelligence Skill Factor on Table 1D, then Table 1E for the four impulses.'});
  const kv=knockoutValue({will,gunCombatSkill,handToHandSkill,unarmedSkill});
  steps.knockoutValue=note(8,'Knockout Value',kv,{detail:'§1.3 Step 8: half the Will characteristic times the highest Combat Skill Level (Gun, Hand-to-Hand or Unarmed), rounded off.'});
  // LEG10204 §1.2 Steps 5-7: the hand-to-hand factors, shown beside the small-arms ones. An
  // unrecorded Hand-to-Hand skill leaves them unresolved rather than reading it as zero.
  const handToHand=maximumSpeed.resolved
    ?{...deriveHandToHand({agility,handToHandSkill,maximumSpeed:maximumSpeed.value}),detail:'LEG10204 §1.2 Steps 5-7: CE from Table 2C, ASF = AGI + CE, Combat Actions and Damage Bonus from Table 2D.'}
    :{resolved:false,reason:'maximum-speed-unresolved',detail:'Hand-to-hand factors need a Maximum Speed first.'};

  const resolved=Object.values(steps).every(entry=>entry.resolved!==false);
  return {resolved,steps,handToHand,
    // Step 9 is per-weapon and needs the weapon, so it is offered rather than computed:
    // `shotAccuracy` turns a Skill Accuracy Level and a weapon's aim modifiers into the
    // column the status sheet prints.
    shotAccuracyReady:sal.resolved,
    allowance,source:creationSource,tables:allowanceSource};
}

// §1.5, printed 9. A ready-made combatant, and a check on the tables at the same time: every
// printed Skill Accuracy Level must equal Table 1C's, and every Knockout Value must equal
// half the implied Will times the Skill Level. Where the two disagree, the printed value is
// used and the disagreement is named rather than hidden.
export function pregeneratedTroop(id){
  const troop=pregeneratedTroops.find(entry=>entry.id===id);
  if(!troop)throw new Error(`"${id}" is not a §1.5 troop. Choose one of: ${pregeneratedTroops.map(t=>t.id).join(', ')}.`);
  const sal=skillAccuracyLevel(troop.skillLevel);
  const derivedKV=troop.impliedWill===null?null:knockoutValue({will:troop.impliedWill,gunCombatSkill:troop.skillLevel});
  const disagreements=[];
  if(sal.resolved&&sal.value!==troop.skillAccuracyLevel)
    disagreements.push(`Table 1C gives Skill Level ${troop.skillLevel} a Skill Accuracy Level of ${sal.value}; §1.5 prints ${troop.skillAccuracyLevel}.`);
  if(derivedKV?.resolved&&derivedKV.value!==troop.knockoutValue)
    disagreements.push(`.5 x Will ${troop.impliedWill} x Skill Level ${troop.skillLevel} is ${derivedKV.value}; §1.5 prints ${troop.knockoutValue}.`);
  // "Checked" and "agrees" are different claims. Untrained has no implied Will to check its
  // Knockout Value against, so saying it agrees would be saying more than was tested.
  const knockoutValueChecked=derivedKV?.resolved===true;
  return {...troop,agreesWithTables:disagreements.length===0,disagreements,
    skillAccuracyChecked:sal.resolved===true,knockoutValueChecked,
    ...(knockoutValueChecked?{}:{knockoutValueUnchecked:'\u00a71.5 gives this row no implied Will, so its Knockout Value is used as printed and not checked against \u00a71.3 Step 8.'}),
    source:equipmentSource};
}
