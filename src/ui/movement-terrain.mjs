import {movementModifiers} from '../data/movement.mjs';
import {readMovementTerrain,writeMovementTerrain} from '../foundry/movement-scene.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

const groupLabels={slope:'Stairs and hills',cover:'Brush or rubble',water:'Water'};

const selection=()=>(canvas.regions?.controlled??[]).map(r=>r.document);

export async function markMovementTerrain(){
  if(!game.user.isGM)throw new Error('Marking movement terrain is a GM control.');
  const chosen=selection();
  if(!chosen.length)throw new Error('Select one or more regions on the Regions layer, then run this again.');
  const existing=readMovementTerrain(chosen[0])??{};
  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:`Movement terrain · ${chosen.length} region(s)`},position:{width:560},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">SCENE DATA · MOVEMENT</p><p class="pc-help">Table 7A terrain groups for any hex whose centre lies in the region.</p>
      ${Object.entries(groupLabels).map(([group,label])=>`<label>${e(label)} <select name="${group}">${Object.keys(movementModifiers[group]).map(key=>`<option value="${e(key)}" ${existing[group]===key?'selected':''}>${key==='none'?'None':`${e(key)} (+${movementModifiers[group][key]})`}</option>`).join('')}</select></label>`).join('')}
      <fieldset><legend>Other conditions</legend>${Object.entries(movementModifiers.miscellaneous).map(([key,cost])=>`<label><input type="checkbox" name="misc" value="${e(key)}" ${existing.miscellaneous?.includes(key)?'checked':''}> ${e(key)} (+${cost})</label>`).join('')}</fieldset>
      <label><input type="checkbox" name="clear"> Clear terrain marks on the selected regions</label></div>`,
    ok:{label:'Save',callback:(event,button,dialog)=>{
      const form=dialog.element;
      if(form.querySelector('[name=clear]').checked)return {clear:true};
      const terrain={};
      for(const group of Object.keys(groupLabels))terrain[group]=form.querySelector(`[name=${group}]`).value;
      terrain.miscellaneous=[...form.querySelectorAll('[name=misc]:checked')].map(box=>box.value);
      return {terrain};
    }},rejectClose:false});
  if(!answer)return null;
  for(const document of chosen)await writeMovementTerrain(document,answer.clear?null:answer.terrain);
  ui.notifications.info(answer.clear?`Cleared movement terrain from ${chosen.length} region(s).`:`Marked ${chosen.length} region(s) for Table 7A terrain.`);
  return answer;
}
