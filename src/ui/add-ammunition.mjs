import {ammunitionWeightDefaults} from '../rules/ammunition-weight.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
export function ammunitionChoices(actor){
 return Array.from(actor.items).filter(i=>i.type==='weapon').flatMap(weapon=>{
  const keys=[...new Set(Object.values(weapon.system.firearmModes??{}).flatMap(mode=>Object.keys(mode.ammunition??{})))];
  return keys.map(key=>({name:`${weapon.name} · ${key.toUpperCase()}`,key,catalogId:weapon.system.catalogId}));
 });
}
export function ammunitionStock(choice,answer){
 const quantity=Number(answer.quantity);
 if(!Number.isSafeInteger(quantity)||quantity<1)throw new Error('Enter at least one whole round.');
 const defaults=choice&&ammunitionWeightDefaults(choice.catalogId,quantity);
 const weight=answer.weight?.trim();
 if(!defaults&&(!weight||!Number.isFinite(Number(weight))||Number(weight)<0))throw new Error('Enter a nonnegative weight per round for ammunition without a book weight.');
 const name=choice?.name||answer.name?.trim(),key=choice?.key||answer.key?.trim();
 if(!name||!key)throw new Error('Enter a name and ammunition type for custom stock.');
 return {name,type:'ammunition',system:{quantity,carried:true,equipped:false,ammunitionKey:key,compatibleCatalogIds:choice?.catalogId?[choice.catalogId]:[],...(defaults??{weightLb:Number(weight)})}};
}
export async function addAmmunition(actor){
 if(!actor?.isOwner)throw new Error('Adding ammunition requires ownership of the character.');
 const choices=ammunitionChoices(actor);
 const answer=await foundry.applications.api.DialogV2.prompt({
  window:{title:'Add ammunition'},position:{width:500},
  content:`<div class="pc-dialog"><p>Add stock for a gun. Nothing is added until you confirm; loading the gun is a separate action.</p>
  <label>Ammunition<select name="choice">${choices.map((c,index)=>`<option value="${index}">${e(c.name)}</option>`).join('')}<option value="custom">Custom ammunition</option></select></label>
  <label>Total rounds<input name="quantity" type="number" min="1" step="1" required></label>
  <p>Book weights are filled automatically when available.</p>
  <label>Weight per round · lb (only if no book weight)<input name="weight" type="number" min="0" step="any"></label>
  <details${choices.length?'':' open'}><summary>Custom ammunition details</summary><label>Name<input name="name" type="text"></label><label>Ammunition type / key<input name="key" type="text"></label></details></div>`,
  ok:{label:'Add ammunition',callback:(_event,_button,dialog)=>{
   const answer=Object.fromEntries(['choice','quantity','weight','name','key'].map(key=>[key,dialog.element.querySelector(`[name="${key}"]`).value]));
   return ammunitionStock(answer.choice==='custom'?null:choices[Number(answer.choice)],answer);
  }},rejectClose:false
 });
 if(!answer)return null;
 const [item]=await actor.createEmbeddedDocuments('Item',[answer]);
 return item??null;
}
