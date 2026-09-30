import {escapeHTML as e} from '../foundry/context.mjs';
import {bodyParts,bodyDiagram} from './body-diagram.mjs';
import {protectionGroups,armorRegionLabel} from '../data/armor-catalog.mjs';
import {armorRating} from '../rules/armor-rating.mjs';

// The unified Armor list's card: where the armor sits on the body, what each part stops, its
// melee class and BPF, and its weight. Which values are the books' and which are house rules,
// and where they came from, is for the GM.

const areas=regions=>regions.map(armorRegionLabel).join(', ');
const shape=regions=>regions.length>=9?'full suit':regions.length===1&&regions[0]==='torso'?'vest':regions.length===1&&regions[0]==='head'?'helmet':`${regions.length} areas`;

export function armorSummary(entry){
  const groups=protectionGroups(entry);
  const pfs=[...new Set(groups.map(g=>g.ballisticPF))];
  return `${entry.weightLb} lb · ${shape(entry.pieces.map(p=>p.region))} · PF ${pfs.join('/')}`;
}

export function armorCardHTML(entry,{gm=false}={}){
  const covered=new Map(entry.pieces.map(p=>[p.region,p]));
  const regions=bodyParts.map(([region,side,label,path,transform])=>{
    const p=covered.get(region);
    return {path,transform,label,state:!p?'bare':p.ballisticPF>0?'covered':'zero',detail:p?`PF ${p.ballisticPF}`:'Not covered'};
  });
  const groups=protectionGroups(entry);
  const house=groups.filter(g=>g.basis==='house');
  return `<header><p class="pc-card-kicker">${e(entry.era)}</p><h3>${e(entry.name)}</h3></header>
    <div class="pc-armor-card-body">${bodyDiagram(regions,{label:`${entry.name} coverage, front view`})}
      <div><dl class="pc-card-stats">
        <div><dt>Weight</dt><dd>${e(String(entry.weightLb))} lb</dd></div>
        <div><dt>Covers</dt><dd>${e(areas(entry.pieces.map(p=>p.region)))}</dd></div></dl>
      ${groups.map(g=>`<section class="pc-armor-protection"><h4>${e(areas(g.regions))}</h4>
        <p><strong>PF ${e(String(g.ballisticPF))}</strong> · ${e(armorRating(g.ballisticPF).label)}</p>
        <p class="pc-help">Hand-to-hand: Armor Class ${e(g.meleeClass)}, BPF ${e(g.bpf)}</p></section>`).join('')}
      </div></div>
    ${gm?`<footer class="pc-card-source"><strong>Source</strong> ${e(entry.source.bookId)}${entry.source.table?` Table ${e(entry.source.table)}`:''} §${e(entry.source.section)}, PDF page ${e(String(entry.source.pdfPage))}.
      ${house.length?`<br><strong>House rules</strong> ${house.map(g=>`${e(areas(g.regions))}: PF ${e(String(g.ballisticPF))}${g.note?` — ${e(g.note)}`:''}`).join(' ')} Coverage beyond the printed columns follows the real harness.`:' Coverage beyond the printed columns follows the real harness.'}</footer>`:''}`;
}
