import {actorAllowance} from '../foundry/encounter-allowance.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

export async function selectActionAllowance(combat,state,id){
  const existing=state.entries[id];
  const derived=actorAllowance(combat.combatants.get(id)?.actor);
  const note=derived?.resolved
    ?`<p class="pc-help">Derived: ${derived.value}/phase · impulses ${derived.schedule.join(' / ')} · KV ${derived.knockoutValue}. Leave the value unchanged and the reason blank to keep it derived.</p>`
    :`<p class="pc-help">Cannot derive: ${e(derived?.detail??'characteristics or encumbrance are unknown')}. Enter a value and a reason.</p>`;
  const content=`<div class="pc-dialog"><p class="pc-record-kicker">ALLOWANCE</p>${note}<label>Actions per phase <input name="amount" type="number" min="1" max="24" step="1" value="${existing?.allowance??derived?.value??''}" required></label><label>Adjudication reason <input name="label" value="${e(existing?.reason??'')}"></label></div>`;
  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:'Override Combat Actions'},content,ok:{label:'Save',callback:(event,button,dialog)=>({amount:Number(dialog.element.querySelector('[name=amount]').value),label:dialog.element.querySelector('[name=label]').value})},rejectClose:false});
  if(!answer)return null;
  const acceptDerived=derived?.resolved&&answer.amount===derived.value&&!answer.label.trim();
  if(!acceptDerived&&!answer.label.trim()){throw new Error('Record the source or reason for an adjudicated allowance.');}
  return acceptDerived?{allowance:derived.value,derivation:derived}:{allowance:answer.amount,reason:answer.label};
}
