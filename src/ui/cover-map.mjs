import {coverProtectionFactor} from '../data/cover.mjs';
import {coverMenu} from './cover-menu.mjs';
import {readCoverAnnotation,writeCoverAnnotation,sceneCoverMapped,setSceneCoverMapped,
  sceneCoverBarriers,sceneCoverAreas,directionIgnored} from '../foundry/cover-scene.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

// Marking a map up for cover. Foundry has no material and no thickness on a Wall or a
// Region, so this is where a GM says once what each barrier is; from then on a shot reads it
// instead of asking him again.

const selection=()=>[
  ...(canvas.walls?.controlled??[]).map(w=>w.document),
  ...(canvas.regions?.controlled??[]).map(r=>r.document)];

export async function markCover(){
  if(!game.user.isGM)throw new Error('Marking a map for cover is a GM control.');
  const chosen=selection();
  if(!chosen.length)throw new Error('Select the walls or regions to mark. Switch to the Walls or Regions layer and select them, then run this again.');
  const existing=readCoverAnnotation(chosen[0]);
  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:`Cover · ${chosen.length} selected`},position:{width:560},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">SCENE DATA · COVER</p><p class="pc-help">Assign Table 7C material once; future shots read it from the map.</p>
      <label>This is<select name="cover"><option value="">Choose a Table 7C row…</option>${coverMenu.map(([key,label])=>`<option value="${e(key)}" ${existing?.choice&&`named:${existing.choice.id}`===key?'selected':''}>${e(label)}</option>`).join('')}<option value="adjudicated">Not on Table 7C — adjudicate</option><option value="clear">Not cover — clear the mark</option></select></label>
      <details><summary>Adjudicated cover</summary><label>Protection Factor<input name="pf" type="number" min="0" step="any"></label><label>What it is<input name="reason"></label></details>
      <p class="pc-sheet-muted">${e(directionIgnored)} Open doors are skipped.</p></div>`,
    ok:{label:'Mark',callback:(event,button,dialog)=>{
      const form=dialog.element,read=n=>form.querySelector(`[name="${n}"]`).value;
      const key=read('cover');
      if(!key)return null;
      if(key==='clear')return {clear:true};
      if(key==='adjudicated')return {choice:{adjudicated:Number(read('pf')),reason:read('reason')}};
      const [kind,id,inches]=key.split(':');
      return {choice:kind==='named'?{id}:{material:id,inches:Number(inches)}};
    }},rejectClose:false});
  if(!answer)return null;
  // Price it once here so a bad adjudication is refused before it reaches any document.
  const priced=answer.clear?null:coverProtectionFactor(answer.choice);
  for(const document of chosen)await writeCoverAnnotation(document,answer.clear?null:answer.choice);
  ui.notifications.info(answer.clear
    ?`Cleared the cover mark from ${chosen.length} object(s).`
    :`Marked ${chosen.length} object(s) as ${priced.label}, PF ${priced.pf}.`);
  return {count:chosen.length,cover:priced};
}

// A scene says for itself that it has been marked up. Until it does, a shot that crosses no
// marked wall means nothing - the map simply has not been asked. Saying so is the whole
// point of the switch, so it reports what is already on the scene before flipping it.
export async function reviewSceneCover(){
  if(!game.user.isGM)throw new Error('Marking a map for cover is a GM control.');
  const scene=canvas.scene;
  const {barriers,problems:wallProblems}=sceneCoverBarriers(scene);
  const {areas,problems:regionProblems}=sceneCoverAreas(scene);
  const problems=[...wallProblems,...regionProblems];
  const mapped=sceneCoverMapped(scene);
  const list=[...barriers.map(b=>`<li>Wall · ${e(b.label)} (PF ${e(b.pf)})</li>`),
    ...areas.map(a=>`<li>Region · ${e(a.label)} (PF ${e(a.pf)})</li>`)].join('');
  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:`Cover on ${scene.name}`},position:{width:560},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">SCENE DATA · COVER STATUS</p><p>${barriers.length} wall(s) · ${areas.length} region(s)</p>
      ${list?`<ul>${list}</ul>`:'<p class="pc-empty">Nothing is marked yet. Select walls or regions and use “Mark cover”.</p>'}
      ${problems.length?`<p role="alert">${problems.length} marked object(s) cannot be priced or are open doors: ${e(problems.map(p=>p.reason).join(' '))}</p>`:''}
      <label><input type="checkbox" name="mapped" ${mapped?'checked':''}> This scene has been marked up for cover</label>
      <p class="pc-sheet-muted">When enabled, an unobstructed mapped line is treated as open. Enable only after the scene is fully marked.</p></div>`,
    ok:{label:'Save',callback:(event,button,dialog)=>({mapped:dialog.element.querySelector('[name=mapped]').checked})},
    rejectClose:false});
  if(!answer)return null;
  if(answer.mapped!==mapped)await setSceneCoverMapped(scene,answer.mapped);
  return {mapped:answer.mapped,barriers:barriers.length,areas:areas.length,problems};
}
