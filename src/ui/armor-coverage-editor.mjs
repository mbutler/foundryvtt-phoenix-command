import {armorRegion,armorHasSides} from '../rules/armor-regions.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
export const armorRegionLabels={head:'Head / helmet',face:'Face / visor',neck:'Neck',shoulder:'Shoulder',arm:'Arm',hand:'Hand',torso:'Torso / body',pelvis:'Pelvis',leg:'Leg',foot:'Foot'};
export function armorSideChoices(region,side) {
 if(armorHasSides(region))return {value:['left','right','both'].includes(side)?side:'',choices:{'':'Choose left, right or both…',left:'Left',right:'Right',both:'Both sides'}};
 return {value:'center',choices:{center:'Center'}};
}
export function bindArmorCoverageEditor(root) {
 root.addEventListener('change',event=>{
  if(!event.target.matches('select[name$=".region"]'))return;
  const side=event.target.closest('.pc-coverage-piece').querySelector('select[name$=".side"]');
  const config=armorSideChoices(event.target.value,side.value);
  side.innerHTML=Object.entries(config.choices).map(([value,label])=>`<option value="${value}">${label}</option>`).join('');
  side.value=config.value;
 });
}
export function armorRegionChoices(value='') {
 const region=armorRegion(value);
 return {value:region,choices:{'':'Choose a body part…',...armorRegionLabels,...(region&&!Object.hasOwn(armorRegionLabels,region)?{[region]:`Unrecognized: ${region}`}:{})}};
}
const select=(name,value,choices,editable)=>`<select required name="${e(name)}" ${editable?'':'disabled'}>${Object.entries(choices).map(([key,label])=>`<option value="${e(key)}" ${key===value?'selected':''}>${e(label)}</option>`).join('')}</select>`;
export function armorCoverageEditor(coverage={},editable=false) {
 return `<section class="pc-coverage-editor"><h2>Body coverage</h2><p class="pc-sheet-muted">Choose the body parts this piece protects and its PF. Use Left, Right or Both sides for limbs; Center for head and body. Save item to apply changes.</p>${Object.entries(coverage).map(([key,c])=>{
  const region=armorRegionChoices(c.region),path=`system.coverage.${key}`,side=armorSideChoices(region.value,c.side);
  return `<fieldset class="pc-coverage-piece"><legend>${e(armorRegionLabels[region.value]??'Coverage')}</legend><div class="pc-coverage-controls"><label>Body part${select(`${path}.region`,region.value,region.choices,editable)}</label><label>Side${select(`${path}.side`,side.value,side.choices,editable)}</label><div data-coverage-field="${e(path)}.ballisticPF"></div></div><details><summary>Other protection & material</summary>${['meleeClass','bpf','material'].map(field=>`<div data-coverage-field="${e(path)}.${field}"></div>`).join('')}</details>${editable?`<button type="button" class="pc-remove-coverage" data-action="removeCoverage" data-coverage-key="${e(key)}">Remove body part</button>`:''}</fieldset>`;
 }).join('')||'<p class="pc-empty">No body parts assigned yet.</p>'}${editable?'<div class="pc-coverage-actions"><button type="submit" class="pc-save">Save armor</button><button type="button" data-action="addCoverage">Add body part</button></div>':''}</section>`;
}
export function nextCoverageKey(coverage={}){let n=1;while(Object.hasOwn(coverage,`part${n}`))n++;return `part${n}`;}
