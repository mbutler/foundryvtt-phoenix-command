import {inStartedEncounter} from '../rules/combat-inventory.mjs';
import {armorCoverageEditor,nextCoverageKey,bindArmorCoverageEditor} from './armor-coverage-editor.mjs';
import {bindWoundDiagram} from './wound-diagram.mjs';
import {bindSheetHelp} from './sheet-help.mjs';
import {characterIdentity} from '../foundry/character-identity.mjs';
import { actorSheetHTML, attributeLabels, skillLabels } from './sheet-view.mjs';
import { escapeHTML as e } from '../foundry/context.mjs';
import { openWeaponAttack } from './foundry-calculator.mjs';
const f = foundry.data.fields;
const label = key => ({ rateOfFire:'Manual ROF · actions', burstRounds:'Automatic ROF · rounds / burst', feed:'ROF type', weightLb:'Unit weight · lb', packageCount:'Feed devices carried',packageCapacity:'Rounds per feed device',packageUnit:'Feed device type', speedFeetPerSecond:'Current speed · ft/second (note only)', actionPenalty:'Manual action penalty', dominant:'Dominant hand', partialParry:'Partial parry', ballisticPF:'Ballistic PF', meleeClass:'Melee armor class', bpf:'BPF category', penetration:'PEN', damageClass:'DC', distanceFeet:'Range · ft', weaponSpeed:'Weapon speed · WS', weaponClass:'Weapon class · WC', impactFormula:'Impact dice expression', chamber:'Chamber \u00b7 round ready?', ammunitionItemId:'Ammunition Item', selectedModeId:'Selected mode', pdfPage:'PDF page' }[key] ?? key.replace(/([a-z])([A-Z])/g,'$1 $2').replace(/^./,c=>c.toUpperCase()));
const get = (data,path) => foundry.utils.getProperty(data,path);
function fieldAt(schema, path) {
  return path.split('.').reduce((field,key)=>field instanceof f.TypedObjectField ? field.element : field.fields[key],schema);
}

function fieldGroup(field, path, value, text = label(path.split('.').at(-1))) {
  // Use Foundry's own DataField controls, choices, bounds and data types.
  const group = field.toFormGroup({ label:text }, { name:path, value, ...(field instanceof f.ArrayField ? {input:(_field,config)=>foundry.applications.elements.HTMLStringTagsElement.create(config)} : {}), ...(Array.isArray(field.choices) ? {choices:Object.fromEntries(field.choices.map(choice=>[choice,choice]))} : {}), ...(field instanceof f.NumberField ? {type:'number',step:field.integer ? 1 : 'any'} : {}), ...(field.nullable && field.choices ? {blank:'Unknown'} : {}) });
  if (field.nullable) group.querySelectorAll('[name]').forEach(el => { el.dataset.nullable = 'true'; });
  return group;
}

function formData(sheet, event, form, data) {
  const flat = { ...data.object };
  for (const el of form.querySelectorAll('[data-nullable="true"][name]')) if (el.value === '') flat[el.name] = null;
  return foundry.utils.expandObject(flat);
}

export class PhoenixCharacterSheet extends foundry.applications.sheets.ActorSheetV2 {
  static DEFAULT_OPTIONS = {
    classes:['phoenix-record-sheet'], position:{width:980,height:860}, window:{resizable:true},
    viewPermission:2,
    actions:{ portrait:PhoenixCharacterSheet.portrait, situation:PhoenixCharacterSheet.situation, editCharacter:PhoenixCharacterSheet.editCharacter, cancelEdit:PhoenixCharacterSheet.cancelEdit,
      item:PhoenixCharacterSheet.openItem, removeItem:PhoenixCharacterSheet.removeItem, addItem:PhoenixCharacterSheet.addItem, attack:PhoenixCharacterSheet.attack,
      recovery:PhoenixCharacterSheet.recovery, careReached:PhoenixCharacterSheet.careReached, generate:PhoenixCharacterSheet.generate,
      catalog:PhoenixCharacterSheet.catalog, armorCatalog:PhoenixCharacterSheet.armorCatalog, gunCatalog:PhoenixCharacterSheet.gunCatalog, meleeCatalog:PhoenixCharacterSheet.meleeCatalog, loadGun:PhoenixCharacterSheet.loadGun }
  };
  static async portrait(event,button) {
    if(!this.isEditable)return;
    const image=button.querySelector('img');
    const picker=new foundry.applications.apps.FilePicker.implementation({
      type:'image',current:image.getAttribute('src'),document:this.actor,
      callback:async path=>{
        if(!this.isEditable)return;
        // Preserve pending form edits; Foundry collects data-edit images on Save.
        if(this.editing){image.src=path;return;}
        try{await this.actor.update({img:path});}
        catch(error){ui.notifications.error(error.message);}
      },
      position:{top:this.position.top+40,left:this.position.left+10}
    });
    await picker.browse();
  }
  static async situation() {
    if(!this.isEditable||this.editing)return;
    try { const {editSituation}=await import('./situation.mjs'); if(await editSituation(this.actor))await this.render({force:true}); }
    catch(error){ui.notifications.warn(error.message);}
  }
  editing = false;
  static async editCharacter() { if (this.isEditable) { this.editing = true; await this.render({force:true}); } }
  static async cancelEdit() { this.editing = false; await this.render({force:true}); }
  static async openItem(event, button) { await this.actor.items.get(button.dataset.itemId)?.sheet.render({force:true}); }
  static async removeItem(event, button) {
    if (!this.isEditable || this.editing) return;
    try {
      const {removeCharacterItem} = await import('./remove-character-item.mjs');
      if (await removeCharacterItem(this.actor,button.dataset.itemId)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async addItem(event, button) {
    if (!this.isEditable || !['weapon','ammunition','armor','shield','equipment'].includes(button.dataset.type)) return;
    if(button.dataset.type==='ammunition'){
      try { await (await import('./add-ammunition.mjs')).addAmmunition(this.actor); }
      catch(error){ui.notifications.warn(error.message);}
      return;
    }
    const [item] = await this.actor.createEmbeddedDocuments('Item',[{ name:`New ${button.dataset.type}`, type:button.dataset.type }]);
    await item.sheet.render({force:true});
  }
  static async generate() {
    try {
      const {openCharacterCreation} = await import('./character-creation.mjs');
      if (await openCharacterCreation(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async loadGun(event,button) {
    if (!this.isEditable || this.editing) return;
    try {
      const {loadGun} = await import('./load-gun.mjs');
      if (await loadGun(this.actor,button.dataset.itemId,button.dataset.modeId)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async gunCatalog() {
    if (!this.isEditable) return;
    try {
      const {addGunFromCatalog} = await import('./gun-catalog.mjs');
      if (await addGunFromCatalog(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async meleeCatalog() {
    if (!this.isEditable) return;
    try {
      const {addMeleeWeaponFromCatalog} = await import('./melee-catalog.mjs');
      if (await addMeleeWeaponFromCatalog(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async armorCatalog() {
    if (!this.isEditable) return;
    try {
      const {addArmorFromCatalog} = await import('./armor-picker.mjs');
      if (await addArmorFromCatalog(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async catalog() {
    try {
      const {addFromCatalog} = await import('./character-creation.mjs');
      if (await addFromCatalog(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async careReached() {
    try {
      const {recordCareReached} = await import('./medical-aid.mjs');
      if (await recordCareReached(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async recovery() {
    try {
      const {openRecovery} = await import('./recovery.mjs');
      if (await openRecovery(this.actor)) await this.render({force:true});
    } catch (error) { ui.notifications.warn(error.message); }
  }
  static async attack(event, button) {
    if (!this.isEditable) return;
    const {itemId,kind,modeId,attackId} = button.dataset;
    await openWeaponAttack(this.actor,{itemId,kind,modeId,attackId});
  }
  async _renderHTML() {
    const root = document.createElement('div');
    const snapshot = { identity:characterIdentity(this.actor), name:this.actor.name,img:this.actor.img,system:this.actor.system.toObject(),items:Array.from(this.actor.items,i=>({id:i.id,name:i.name,img:i.img,type:i.type,system:i.system.toObject()})),recoveryAttempt:this.actor.getFlag('phoenix-command','recoveryAttempt')??null };
    root.innerHTML = actorSheetHTML(snapshot,{editing:this.editing,editable:this.isEditable});
    bindSheetHelp(root);
    bindWoundDiagram(root);
    for (const mount of root.querySelectorAll('[data-field]')) {
      const path = mount.dataset.field;
      const field = path === 'name' ? this.actor.schema.fields.name : fieldAt(this.actor.system.schema,path.slice(7));
      const text = path.startsWith('system.attributes.') ? attributeLabels[path.split('.').at(-1)] : path.startsWith('system.skills.') ? skillLabels[path.split('.').at(-1)] : label(path.split('.').at(-1));
      mount.append(fieldGroup(field,path,get(snapshot,path),text));
    }
    return root;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); }
  _processFormData(event, form, data) { return formData(this,event,form,data); }
  async _processSubmitData(event, form, data, options) {
    if (!this.isEditable || !this.editing) return {};
    const result = await super._processSubmitData(event,form,data,options);
    this.editing = false; await this.render({force:true}); return result;
  }
  async _onRender(context, options) {
    await super._onRender(context,options);
    // Observers may inspect Item sheets; updates remain native OWNER-only operations.
    if (!this.isEditable) this.element.querySelectorAll('[data-action="item"]').forEach(button=>button.disabled=false);
  }
}

export class PhoenixItemSheet extends foundry.applications.sheets.ItemSheetV2 {
  static DEFAULT_OPTIONS = {
    classes:['phoenix-record-sheet','phoenix-item-sheet'], position:{width:700,height:750}, window:{resizable:true}, viewPermission:2,
    actions:{addEntry:PhoenixItemSheet.addEntry,addCoverage:PhoenixItemSheet.addCoverage,removeCoverage:PhoenixItemSheet.removeCoverage}
  };
  static async addCoverage() {
    if(!this.isEditable || this.document.type!=='armor')return;
    try {
      const data=this._prepareSubmitData(null,this.form,new foundry.applications.ux.FormDataExtended(this.form));
      const coverage=get(data,'system.coverage')??{};
      const key=nextCoverageKey({...this.document.system.coverage,...coverage});
      const initial=fieldAt(this.document.system.schema,'coverage').element.getInitialValue({});
      foundry.utils.setProperty(data,`system.coverage.${key}`,initial);
      await this.document.update(data);
      await this.render({force:true});
      this.element.querySelector(`[name="system.coverage.${key}.region"]`)?.focus();
    }catch(error){ui.notifications.error(error.message);}
  }
  static async removeCoverage(event,button) {
    if(!this.isEditable || this.document.type!=='armor')return;
    const key=button.dataset.coverageKey;
    if(!Object.hasOwn(this.document.system.coverage,key))return;
    try {
      const data=this._prepareSubmitData(null,this.form,new foundry.applications.ux.FormDataExtended(this.form));
      if(data.system?.coverage)delete data.system.coverage[key];
      foundry.utils.setProperty(data,`system.coverage.-=${key}`,null);
      await this.document.update(data);
      await this.render({force:true});
    }catch(error){ui.notifications.error(error.message);}
  }
  static async addEntry(event, button) {
    if (!this.isEditable) return;
    const path = button.dataset.path;
    const field = fieldAt(this.document.system.schema,path.slice(7));
    if (!(field instanceof f.TypedObjectField)) return;
    const key = await foundry.applications.api.DialogV2.prompt({window:{title:`Add ${label(path.split('.').at(-1))} entry`},
      content:'<p>Choose a stable key (letters, digits, underscores or hyphens). For an aim modifier, use the number of aim actions.</p><label>Entry key <input name="entryKey" type="text" required pattern="[A-Za-z0-9_-]+"></label>',
      ok:{label:'Save & add entry',callback:(event,button,dialog)=>dialog.element.querySelector('[name=entryKey]').value.trim()}, rejectClose:false });
    if (!key) return;
    if (!/^[A-Za-z0-9_-]+$/.test(key) || ['__proto__','prototype','constructor'].includes(key)) { ui.notifications.warn('Choose a simple entry key.'); return; }
    const data = this._prepareSubmitData(null,this.form,new foundry.applications.ux.FormDataExtended(this.form));
    if (Object.hasOwn(get(data,path) ?? get(this.document,path) ?? {},key)) { ui.notifications.warn('That entry key already exists.'); return; }
    foundry.utils.setProperty(data,`${path}.${key}`,field.element.getInitialValue({}));
    try { await this.document.update(data); await this.render({force:true}); }
    catch (error) { ui.notifications.error(error.message); }
  }
  async _renderHTML() {
    const root = document.createElement('div'); root.className='pc-record pc-item-record';
    root.innerHTML=`<header class="pc-record-header"><img src="${e(this.document.img)}" alt="Item artwork" ${this.isEditable ? 'data-action="editImage" data-edit="img"' : ''}><div><p class="pc-record-kicker">PHOENIX COMMAND · ${e(this.document.type.toUpperCase())}</p><div data-name></div></div>${this.isEditable ? '<button type="submit" class="pc-save">Save item</button>' : '<span>View only</span>'}</header><p class="pc-sheet-muted">Blank numeric fields mean unknown. Changing a profile edits this Item only.</p>`;
    root.querySelector('[data-name]').append(fieldGroup(this.document.schema.fields.name,'name',this.document.name,'Name'));
    const schema = this.document.system.schema, data = this.document.system.toObject();
    const appendField = (parent, field, path, value) => {
      const name = path.split('.').at(-1);
      if(path==='system.coverage' && this.document.type==='armor'){
        const panel=document.createElement('div');
        panel.innerHTML=armorCoverageEditor(value,this.isEditable);
        for(const mount of panel.querySelectorAll('[data-coverage-field]')){
          const fieldPath=mount.dataset.coverageField;
          mount.append(fieldGroup(fieldAt(schema,fieldPath.slice(7)),fieldPath,get({system:data},fieldPath)));
        }
        parent.append(panel);return;
      }
      if (field instanceof f.SchemaField || field instanceof f.TypedObjectField) {
        const details = document.createElement('details'); details.className='pc-field-section';
        const summary = document.createElement('summary'); summary.textContent=label(name); details.append(summary);
        if (field instanceof f.SchemaField) {
          for (const [key,child] of Object.entries(field.fields)) appendField(details,child,`${path}.${key}`,value?.[key]);
        } else {
          for (const [key,child] of Object.entries(value ?? {})) appendField(details,field.element,`${path}.${key}`,child);
          if (!Object.keys(value ?? {}).length) { const empty=document.createElement('p');empty.className='pc-sheet-muted';empty.textContent='No entries yet.';details.append(empty); }
          if (this.isEditable) { const add=document.createElement('button');add.type='button';add.dataset.action='addEntry';add.dataset.path=path;add.textContent='Save & add entry';details.append(add); }
        }
        parent.append(details);
      } else {
        const group = fieldGroup(field,path,value,path==='system.weightLb'&&this.document.type==='ammunition'&&this.document.system.packageCapacity?'Weight per '+this.document.system.packageUnit+' · lb':undefined);
        parent.append(group);
      }
    };
    const core=document.createElement('section');core.className='pc-item-core';root.append(core);
    for (const key of ['quantity','weightLb','carried','equipped']) appendField(core,schema.fields[key],`system.${key}`,data[key]);
    // Readying and wearing equipment costs Table 7B time once an encounter has started.
    if(!game.user.isGM&&inStartedEncounter(this.document.parent,game.combats)){
      for(const input of core.querySelectorAll('[name="system.carried"],[name="system.equipped"]'))input.disabled=true;
      const note=document.createElement('p');note.className='pc-help';
      note.textContent='In an encounter, use Other actions to draw, stow, put on or take off this item.';core.append(note);
    }
    const metadata=document.createElement('details');metadata.className='pc-field-section';
    metadata.innerHTML='<summary>Catalog & reference links</summary>';
    for (const [key,field] of Object.entries(schema.fields)) {
      if (['schemaVersion','quantity','weightLb','carried','equipped','source'].includes(key)) continue;
      const parent=['catalogId','catalogRevision','attachedToId','selectedModeId'].includes(key) ? metadata : root;
      appendField(parent,field,`system.${key}`,data[key]);
    }
    root.append(metadata);
    return root;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); bindArmorCoverageEditor(result); }
  _processFormData(event, form, data) { return formData(this,event,form,data); }
}

export function registerSheets() {
  // Healing, incapacitation and the Critical Time Period read the world clock, so open records follow it.
  Hooks.on('updateWorldTime',()=>{
    for(const app of foundry.applications.instances.values())
      if(app instanceof PhoenixCharacterSheet&&!app.editing&&(app.actor?.system.recovery?.outcome==='survived'||Object.values(app.actor?.system.injuries??{}).some(i=>i.status==='active')))app.render();
  });
  const config=foundry.applications.apps.DocumentSheetConfig;
  config.registerSheet(foundry.documents.Actor,'phoenix-command',PhoenixCharacterSheet,{types:['character'],makeDefault:true,label:'Phoenix Command · Character record'});
  config.registerSheet(foundry.documents.Item,'phoenix-command',PhoenixItemSheet,{types:['weapon','ammunition','armor','shield','equipment'],makeDefault:true,label:'Phoenix Command · Equipment'});
}
