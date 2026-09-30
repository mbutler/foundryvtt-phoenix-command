import {characterIdentity} from '../foundry/character-identity.mjs';
import {generateCharacter,describeCharacteristic,describeSkillLevel,CHARACTERISTICS,
  SKILL_LEVEL_MAX,pregeneratedTroop} from '../rules/character-creation.mjs';
import {pregeneratedTroops,skillLevelGuidance,equipmentCatalog,equipmentSource} from '../data/equipment.mjs';
import {summarizeInventory} from '../rules/summary.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

// §1.3 Steps 1 and 2 — the two the system cannot make for itself. Step 1 is three six-sided
// dice per characteristic; Step 2 is a choice the book explicitly gives to the player or
// referee. Hand-to-hand and unarmed are the same kind of choice (LEG10204 §1.2): a blank
// stays unrecorded and is not read as zero. Everything downstream already derives.
//
// §1.5's pregenerated troops are offered beside them, because a pick-up game wants a Line
// rifleman rather than five dice rolls.

const label=key=>({strength:'Strength',intelligence:'Intelligence',will:'Will',health:'Health',agility:'Agility'}[key]??key);

// One characteristic, rolled where anyone can see it. §1.3 Step 1: "summing the roll of
// three six-sided dice".
async function rollCharacteristics(actorName){
  const rolled={};
  for(const key of CHARACTERISTICS){
    const roll=await new foundry.dice.Roll('3d6').evaluate();
    await roll.toMessage({flavor:`${actorName} · ${label(key)} · §1.3 Step 1`});
    rolled[key]=roll.total;
  }
  return rolled;
}

// Step 1's value is five characteristics and its description is five labels, so both are
// laid out rather than stringified - a row reading `[object Object]` tells nobody anything.
const shortLabel={strength:'STR',intelligence:'INT',will:'WIL',health:'HLT',agility:'AGI'};
const formatValue=value=>value&&typeof value==='object'&&!Array.isArray(value)
  ?Object.entries(value).map(([key,v])=>`${shortLabel[key]??key} ${v??'\u2014'}`).join(' \u00b7 ')
  :String(value);
const formatNote=entry=>{
  const described=entry.described;
  if(described&&typeof described==='object')
    return Object.entries(described).map(([key,v])=>`${shortLabel[key]??key} ${v??'not recorded'}`).join(' \u00b7 ');
  return described??entry.detail??'';
};
const stepRow=entry=>`<tr><td>${entry.step}</td><td>${e(entry.title)}</td>
  <td>${entry.resolved===false?'<em>\u2014</em>':`<strong>${e(formatValue(entry.value))}</strong>`}</td>
  <td class="pc-sheet-muted">${e(entry.resolved===false?(entry.detail??'Not derivable yet'):formatNote(entry))}</td></tr>`;

function preview(made){
  return `<table><thead><tr><th>Step</th><th>Value</th><th></th><th>Source</th></tr></thead><tbody>
    ${Object.values(made.steps).map(stepRow).join('')}</tbody></table>`;
}

export function troopSetupValues(id,entered={}){
  const troop=pregeneratedTroop(id);
  const defaulted=CHARACTERISTICS.filter(key=>!Number.isFinite(entered[key])&&!(key==='will'&&troop.impliedWill!==null));
  const characteristics=Object.fromEntries(CHARACTERISTICS.map(key=>[key,Number.isFinite(entered[key])?entered[key]:10]));
  if(troop.impliedWill!==null)characteristics.will=troop.impliedWill;
  return {troop,characteristics,gunCombatSkill:troop.skillLevel,defaulted};
}

export function bindTroopSetup(form){
  const read=key=>{const value=form.querySelector(`[name="${key}"]`).value;return value===''?null:Number(value);};
  const select=form.querySelector('[name="troop"]');
  select.addEventListener('change',()=>{
    if(!select.value)return;
    const setup=troopSetupValues(select.value,Object.fromEntries(CHARACTERISTICS.map(key=>[key,read(key)])));
    form.querySelector('[name="how"][value="troop"]').checked=true;
    for(const [key,value] of Object.entries(setup.characteristics))form.querySelector(`[name="${key}"]`).value=value;
    form.querySelector('[name="gun"]').value=setup.gunCombatSkill;
    form.querySelector('[data-preset-note]').textContent=setup.defaulted.length
      ? `Filled ${setup.defaulted.map(label).join(', ')} with editable defaults of 10. These are setup defaults, not printed troop statistics.`
      : 'Applied gun skill and the preset’s Will, where supplied. Other entered characteristics were preserved.';
  });
}

export async function openCharacterCreation(actor){
  if(!actor?.isOwner)throw new Error('Generating a character needs ownership of it.');
  const identity=characterIdentity(actor);
  const inventory=summarizeInventory(Array.from(actor.items,i=>({id:i.id,type:i.type,system:i.system.toObject()})));
  const current=actor.system.attributes,skills=actor.system.skills;
  const skillField=(name,labelText)=>`<label>${labelText}<input name="${name}" type="number" min="0" max="${SKILL_LEVEL_MAX}" step="1" value="${e(skills[name]??'')}"></label>`;

  const answer=await foundry.applications.api.DialogV2.prompt({
    classes:['pc-character-setup-dialog'],window:{title:`Generate a character · ${actor.name}`,resizable:true},position:{width:620},
    content:`<div class="pc-dialog pc-character-generator"><p class="pc-record-kicker">CHARACTER SETUP</p><p><strong>${e(identity.label)}</strong> · ${e(identity.detail)}</p><p>Choose one method. You’ll review the results before saving them to your character.</p>
      <details><summary>What is a choice</summary><p class="pc-help">§1.3's first two steps are choices. Characteristics are 3d6. Combat skill levels are chosen. Everything after derives from those and from carried weight.</p></details>
      <fieldset><legend>1 · Choose a method</legend>
        <label class="pc-generation-choice"><input type="radio" name="how" value="keep" checked><span><strong>Keep or edit current values</strong><small>Use the characteristics and skills entered below. No dice are rolled.</small></span></label>
        <label class="pc-generation-choice"><input type="radio" name="how" value="roll"><span><strong>Roll new characteristics</strong><small>Roll 3d6 for each of the five characteristics. Rolls appear in chat; current values change only if you save.</small></span></label>
        <label class="pc-generation-choice"><input type="radio" name="how" value="troop"><span><strong>Apply a troop skill preset</strong><small>Fills gun skill and, for some troops, Will. Hand-to-hand and unarmed stay as entered. Blank characteristics start at an editable 10; existing values are kept.</small></span></label>
        </fieldset><fieldset class="pc-generation-values"><legend>2 · Characteristics</legend><div class="pc-grid">${CHARACTERISTICS.map(key=>`<label>${e(label(key))}
          <input name="${key}" type="number" min="3" max="18" step="1" value="${e(current[key]??'')}"></label>`).join('')}</div>
        <p class="pc-sheet-muted">Three dice run 3 to 18, which is why the printed scale does.</p></fieldset>
      <fieldset class="pc-generation-skill"><legend>Combat skills</legend>
        <div class="pc-grid pc-skill-grid">${skillField('gun','Gun combat')}${skillField('melee','Hand-to-hand')}${skillField('unarmed','Unarmed')}</div>
        <p class="pc-sheet-muted">Leave a skill blank if this character has none. Blank is not zero: zero is no training, and it still counts toward Knockout Value.</p>
        <p class="pc-sheet-muted">${skillLevelGuidance.map(band=>`${band.from===band.to?band.from:`${band.from}–${band.to}`}: ${e(band.label)}`).join(' · ')}</p></fieldset>
      <fieldset class="pc-generation-troop"><legend>Troop skill preset · §1.5</legend>
        <p data-preset-note role="status"></p><label>Troop<select name="troop"><option value="">None</option>${pregeneratedTroops.map(t=>
          `<option value="${e(t.id)}">${e(t.name)} — gun skill ${t.skillLevel}${t.impliedWill!==null?`, Will ${t.impliedWill}`:''}</option>`).join('')}</select></label>
        <p class="pc-sheet-muted">The preset replaces gun skill and may replace Will. Missing characteristics use editable defaults of 10, not printed troop statistics. It does not add armor or equipment; actions derive from your actual loadout.</p></fieldset>
      <p class="pc-sheet-muted">Step 3's Encumbrance is the ${e(inventory.totalWeightLb===null?'incomplete':`${Number(inventory.totalWeightLb.toFixed(2))} lb`)} this character already carries.</p></div>`,
    render:(_event,dialog)=>bindTroopSetup(dialog.element),
    ok:{label:'Review character',callback:(event,button,dialog)=>{
      const form=dialog.element,read=n=>form.querySelector(`[name="${n}"]`).value;
      return {how:form.querySelector('[name=how]:checked').value,
        troop:read('troop')||null,
        gunCombatSkill:read('gun')===''?null:Number(read('gun')),
        handToHandSkill:read('melee')===''?null:Number(read('melee')),
        unarmedSkill:read('unarmed')===''?null:Number(read('unarmed')),
        entered:Object.fromEntries(CHARACTERISTICS.map(key=>[key,read(key)===''?null:Number(read(key))]))};
    }},rejectClose:false});
  if(!answer)return null;

  let characteristics={...answer.entered};
  let gunCombatSkill=answer.gunCombatSkill;
  const handToHandSkill=answer.handToHandSkill,unarmedSkill=answer.unarmedSkill;
  let troop=null;
  if(answer.how==='roll')characteristics=await rollCharacteristics(actor.name);
  if(answer.how==='troop'){
    if(!answer.troop)throw new Error('Choose which §1.5 troop to use.');
    const setup=troopSetupValues(answer.troop,characteristics);
    troop=setup.troop;
    characteristics=setup.characteristics;
    gunCombatSkill=setup.gunCombatSkill;
  }

  const made=generateCharacter({characteristics,gunCombatSkill,handToHandSkill,unarmedSkill,encumbranceLb:inventory.totalWeightLb});
  const handLine=Number.isInteger(handToHandSkill)?(made.handToHand.resolved
    ?`<p>Hand-to-hand skill ${handToHandSkill}: ${made.handToHand.combatActions} actions a phase, damage bonus ${made.handToHand.damageBonus}.</p>`
    :`<p class="pc-sheet-muted">${e(made.handToHand.detail??'Hand-to-hand factors are not derivable yet.')}</p>`):'';
  const confirmed=await foundry.applications.api.DialogV2.confirm({
    classes:['pc-character-setup-dialog'],window:{title:`§1.3 · ${actor.name}`,resizable:true},position:{width:620},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">PERSONNEL · DERIVED PROFILE</p>${troop?`<p><strong>${e(troop.name)}</strong> · §1.5 prints ${troop.combatActions} Combat Actions,
        Knockout Value ${troop.knockoutValue} and Skill Accuracy Level ${troop.skillAccuracyLevel}.
        ${troop.agreesWithTables?'The tables agree.':`<strong>Note:</strong> ${e(troop.disagreements.join(' '))}`}
        ${troop.knockoutValueChecked?'':e(troop.knockoutValueUnchecked)}</p>`:''}
      ${preview(made)}
      ${handLine}
      <p class="pc-sheet-muted">Saving writes the five characteristics and the combat skills. A skill left blank stays unrecorded. Everything else on the
        sheet is derived from them and is never stored.</p></div>`,
    yes:{label:identity.independent?'Save to this token only':'Save to shared character'},no:{label:'Discard'},rejectClose:false});
  if(!confirmed)return null;

  const update={'system.skills.gun':gunCombatSkill,'system.skills.melee':handToHandSkill,'system.skills.unarmed':unarmedSkill};
  for(const key of CHARACTERISTICS)if(Number.isFinite(characteristics[key]))update[`system.attributes.${key}`]=characteristics[key];
  await actor.update(update);
  return {characteristics,gunCombatSkill,handToHandSkill,unarmedSkill,troop:troop?.id??null,derived:made};
}

// §1.4's equipment catalogue as Items (armor has its own list, armor-picker.mjs). The weights are the book's, so an Encumbrance built from
// them is the book's too — which is the whole point of Step 3.
export async function addFromCatalog(actor){
  if(!actor?.isOwner)throw new Error('Adding equipment needs ownership of this character.');
  const answer=await foundry.applications.api.DialogV2.prompt({
    window:{title:`§1.4 equipment · ${actor.name}`},position:{width:520},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">LOGISTICS · CATALOG</p><p class="pc-help">Starting kit from the printed lists. Extend it with other Items.</p>
      <label>Equipment<select name="equipment"><option value="">None</option>${equipmentCatalog.map(item=>
        `<option value="${e(item.id)}">${e(item.name)} — ${item.weightLb} lb</option>`).join('')}</select></label>
      <label>Quantity <input name="quantity" type="number" min="1" step="1" value="1"></label>
      <p class="pc-help">Armor has its own list: use Choose armor.</p></div>`,
    ok:{label:'Add',callback:(event,button,dialog)=>{
      const form=dialog.element,read=n=>form.querySelector(`[name="${n}"]`).value;
      return {equipment:read('equipment')||null,quantity:Math.max(1,Number(read('quantity'))||1)};
    }},rejectClose:false});
  if(!answer)return null;

  const source={bookId:equipmentSource.book,section:'1.4',pdfPage:13,verification:'visual',
    note:'Transcribed from the Equipment and Armor Tables.'};
  const created=[];
  if(answer.equipment){
    const item=equipmentCatalog.find(entry=>entry.id===answer.equipment);
    created.push({name:item.name,type:'equipment',
      system:{weightLb:item.weightLb,quantity:answer.quantity,carried:true,catalogId:item.id,source}});
  }
  if(!created.length)return null;
  const items=await actor.createEmbeddedDocuments('Item',created);
  ui.notifications.info(`Added ${items.map(i=>i.name).join(', ')} from §1.4.`);
  return items;
}
