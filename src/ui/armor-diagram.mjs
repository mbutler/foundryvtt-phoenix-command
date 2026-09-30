import {armorRegion} from '../rules/armor-regions.mjs';
import {armorCandidates} from '../rules/summary.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {bodyParts,bodyDiagram} from './body-diagram.mjs';
export function armorDiagram(items) {
  const regions=bodyParts.map(([region,side,label,path,transform])=>{
    const candidates=armorCandidates(items,region,side);
    const state=candidates.length>1?'overlap':candidates.length===1?(Number.isFinite(candidates[0].ballisticPF)&&candidates[0].ballisticPF>=0?(candidates[0].ballisticPF>0?'covered':'zero'):'unknown'):'bare';
    const detail=candidates.length?candidates.map(c=>`${items.find(i=>i.id===c.itemId)?.name}: PF ${c.ballisticPF??'unknown'}`).join('; '):'No equipped coverage';
    return {label:label.replace(/^./,c=>c.toUpperCase()),path,transform,candidates,state,detail};
  });
  const incomplete=items.filter(i=>i.type==='armor'&&i.system.carried&&i.system.equipped).filter(i=>{
    const coverage=Object.values(i.system.coverage??{});
    return !coverage.length||coverage.some(c=>!bodyParts.some(([region,side])=>region===armorRegion(c.region)&&(side===c.side||c.side==='both')));
  });
  return `${incomplete.length?`<p class="pc-rule-note" role="status">Armor coverage needs attention: ${incomplete.map(i=>e(i.name)).join(', ')}. Open the armor and assign its body parts. Automatic protection is unresolved until coverage is complete.</p>`:''}<div class="pc-armor-map">${bodyDiagram(regions,{label:'Equipped armor coverage, front view. Region details follow.'})}<div class="pc-armor-key"><p class="pc-sheet-muted">Equipped coverage · front view</p>${regions.filter(r=>r.state!=='bare').map(r=>`<div class="pc-region" data-coverage="${r.state}"><span>${e(r.label)}</span><strong>${r.candidates.length>1?'Overlap':r.candidates.length?`PF ${e(r.candidates[0].ballisticPF??'?')}`:'—'}</strong></div>`).join('')||'<p class="pc-empty">No covered regions</p>'}<details class="pc-uncovered-regions"><summary>Uncovered regions · ${regions.filter(r=>r.state==='bare').length}</summary>${regions.filter(r=>r.state==='bare').map(r=>`<div class="pc-region" data-coverage="${r.state}"><span>${e(r.label)}</span><strong>${r.candidates.length>1?'Overlap':r.candidates.length?`PF ${e(r.candidates[0].ballisticPF??'?')}`:'—'}</strong></div>`).join('')}</details><p class="pc-rule-note">— Uncovered · ? Unknown PF<br>Overlapping pieces stay separate.</p></div></div>`;
}
