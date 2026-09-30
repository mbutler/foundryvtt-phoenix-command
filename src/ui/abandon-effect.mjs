import {escapeHTML as e} from '../foundry/context.mjs';

const kinds={move:'hex placement',turn:'turn',posture:'posture change',unload:'unload',reload:'reload',
  recover:'weapon recovery',parry:'parry','item-handling':'equipment handling'};
export const pendingEffectLabel=(effect,name)=>`${name??'A combatant'}’s ${kinds[effect?.kind]??'action'}`;

// Setting a paid action aside is the GM's ruling. It writes nothing to the character; the
// encounter keeps the attempt, its error and this reason.
export async function confirmAbandonEffect(combat,effect){
  if(!effect)throw new Error('No action is waiting to be applied.');
  const label=pendingEffectLabel(effect,combat.combatants.get(effect.combatantId)?.name);
  const reason=await foundry.applications.api.DialogV2.prompt({window:{title:'Set action aside'},content:`
    <div class="pc-dialog"><p class="pc-record-kicker">GM RULING · PENDING ACTION</p>
    <p>${e(label)} is paid but cannot be applied. Resume will be tried once more; if it still fails, the action is set aside, its actions stay spent, and nothing changes on the character.</p>
    <label>Reason <input name="reason" required placeholder="e.g. the weapon was removed from the scene"></label></div>`,
    ok:{label:'Set aside',callback:(event,button,dialog)=>dialog.element.querySelector('[name=reason]').value.trim()},rejectClose:false});
  if(reason===null||reason===undefined)return null;
  if(!reason){ui.notifications.warn('Give a reason for setting this action aside.');return null;}
  return {reason};
}
