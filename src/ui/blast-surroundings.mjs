import {blastModifiers_5B} from '../data/explosive-tables.mjs';
import {firearmOptions} from '../rules/attacks.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

// Table 5B surroundings are asked once the landing hex is known, and only for the people the
// blast reaches. Prone is read from each character, so it is not offered here.
const CONDITIONS=blastModifiers_5B.filter(row=>row.name!=='Prone').map(row=>row.name);

export function landingSummary({hit,hexes,direction}){
  if(hit)return 'Landed on the aimed hex.';
  if(hexes===1)return 'Missed by 1 hex: landed in a hex beside the aimed one.';
  return `Missed by ${hexes} hexes: landed ${direction<=4?'short':'long'}, on the line of the throw.`;
}

// Every person needs at least one condition; In the Open is a choice, not a default to infer.
export function readSurroundings(rows,answers,applyTargetSize){
  const blastModifiersById={},targetSizeById={};
  for(const row of rows){
    const chosen=(answers[row.id]?.conditions??[]).filter(name=>CONDITIONS.includes(name));
    if(!chosen.length)throw new Error(`Choose ${row.name}'s surroundings.`);
    blastModifiersById[row.id]=chosen;
    const size=applyTargetSize?answers[row.id]?.targetSize||null:null;
    if(size!==null&&!firearmOptions.targetSizes.includes(size))throw new Error(`Unknown shrapnel target size for ${row.name}.`);
    targetSizeById[row.id]=size;
  }
  return {blastModifiersById,targetSizeById};
}

export async function confirmBlastSurroundings({title,landing,rows,applyTargetSize}){
  if(!rows.length)return {blastModifiersById:{},targetSizeById:{}};
  let answers=Object.fromEntries(rows.map(row=>[row.id,{conditions:row.selected.length?row.selected:['In the Open'],targetSize:row.targetSize}]));
  for(;;){
    const fields=rows.map(row=>`<fieldset data-blast-person="${e(row.id)}"><legend>${e(row.name)} · ${e(row.distanceHexes)} hex${row.distanceHexes===1?'':'es'} · ${e(row.posture)}</legend>
      ${row.mapHint?`<p class="pc-help">${e(row.mapHint)}</p>`:''}
      <div class="pc-form-grid">${CONDITIONS.map(name=>`<label class="pc-custom-toggle"><input name="blast" type="checkbox" value="${e(name)}" ${answers[row.id].conditions.includes(name)?'checked':''}> ${e(name)}</label>`).join('')}</div>
      ${applyTargetSize?`<label>Shrapnel target size<select name="blastSize"><option value="">Use current posture</option>${firearmOptions.targetSizes.map(name=>`<option value="${e(name)}" ${answers[row.id].targetSize===name?'selected':''}>${e(name)}</option>`).join('')}</select></label>`:''}
    </fieldset>`).join('');
    const read=await foundry.applications.api.DialogV2.prompt({window:{title},position:{width:560},content:`
      <div class="pc-dialog"><p class="pc-record-kicker">BLAST · SURROUNDINGS</p><p>${e(landing)}</p>
      <p class="pc-help">Confirm each person's surroundings as seen from where it landed. Solid cover stops shrapnel.</p>${fields}</div>`,
      ok:{label:'Confirm surroundings',callback:(event,button,dialog)=>Object.fromEntries([...dialog.element.querySelectorAll('[data-blast-person]')].map(row=>[row.dataset.blastPerson,{
        conditions:[...row.querySelectorAll('[name=blast]:checked')].map(box=>box.value),
        targetSize:row.querySelector('[name=blastSize]')?.value||null}]))},
      rejectClose:false});
    if(!read)return null;
    answers=read;
    try{return readSurroundings(rows,answers,applyTargetSize);}
    catch(error){ui.notifications.warn(error.message);}
  }
}
