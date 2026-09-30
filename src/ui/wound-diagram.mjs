import {bodyParts,bodyDiagram} from './body-diagram.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
// Display grouping only, never used for armor, damage or disabling calculations.
// Preserve the precise saved location beside the schematic body region.
const normalize=value=>String(value??'').toLowerCase().replace(/\s*-\s*/g,'-').trim();
const locations={
  head:['Head','Head Glance','Forehead'],
  face:['Eye','Eye - Nose','Mouth'],
  neck:['Neck','Neck Flesh','Neck Spine','Base of Neck'],
  shoulder:['Shoulder','Shoulder Glance','Shoulder Socket','Shoulder Scapula'],
  arm:['Arm Glance','Arm Flesh','Arm Bone','Elbow','Forearm Flesh','Forearm Bone','Upper arm','Forearm'],
  hand:['Hand'],
  torso:['Torso Glance','Upper chest','Lower chest','Abdomen','Lung Rib','Lung','Heart','Liver - Rib','Liver','Stomach - Rib','Stomach','Stomach - Spleen','Stomach - Kidney','Liver - Kidney','Liver - Spine','Intestines','Spine'],
  pelvis:['Pelvis','Hip','Hip Socket','Intestines-Pelvis'],
  leg:['Leg Glance','Thigh Flesh','Thigh Bone','Thigh','Knee','Shin Flesh','Shin Bone','Shin'],
  foot:['Ankle - Foot','Foot']
};
const locationRegions=new Map(Object.entries(locations).flatMap(([region,names])=>names.map(name=>[normalize(name),region])));
const paired=new Set(['shoulder','arm','hand','leg','foot']);
export function woundDisplayLocation(wound) {
  const name=normalize(wound.location), prefix=/^(left|right)\s+/.exec(name);
  const region=locationRegions.get(name.replace(/^(left|right)\s+/,''))??null;
  const recorded=['left','right'].includes(wound.side)?wound.side:null;
  const conflict=prefix&&recorded&&prefix[1]!==recorded;
  const side=conflict?null:recorded??prefix?.[1]??null;
  return {region,side:paired.has(region)?side:'center',uncertain:paired.has(region)&&!side};
}
export function woundDiagram(injuries={}) {
  const wounds=Object.values(injuries).filter(w=>w.status==='active').map((w,index)=>({...w,index,...woundDisplayLocation(w)}));
  const regions=bodyParts.map(([region,side,label,path,transform])=>{
    const matches=wounds.filter(w=>w.region===region&&(!paired.has(region)||!w.side||w.side===side));
    const uncertain=matches.some(w=>w.uncertain);
    return {path,transform,key:`${region}-${side}`,label:label.replace(/^./,s=>s.toUpperCase()),count:matches.length,
      state:matches.length?(uncertain?'wound-uncertain':'wounded'):'bare',
      detail:matches.length?matches.map(w=>`${w.location}, ${w.physicalDamage} PD${w.uncertain?', side not recorded':''}`).join('; '):'No active wounds',matches};
  });
  return `<div class="pc-wound-map${wounds.length?'':' pc-wounds-empty'}" data-wound-map><div class="pc-wound-body">${bodyDiagram(regions,{label:'Active wound locations, front view. Select a highlighted region to inspect its wounds.',interactive:true})}<p class="pc-rule-note">Red: active wound<br>Dashed: side not recorded</p></div><div class="pc-wound-detail"><div class="pc-wound-toolbar"><strong data-wound-heading aria-live="polite">Active wounds · ${wounds.length}</strong><button type="button" data-wound-all aria-pressed="true">Show all</button></div><p class="pc-sheet-muted">Select a marked region to inspect. Exact locations are listed below.</p><div class="pc-wound-list">${wounds.map(w=>{
    const keys=regions.filter(r=>r.matches.includes(w)).map(r=>r.key).join(' ');
    return `<article class="pc-wound-entry" data-wound-keys="${e(keys)}"><div><strong>${e(w.location||'Location not recorded')}</strong><span class="pc-wound-pd">${e(w.physicalDamage)} PD</span></div><p>${w.uncertain?'Side not recorded':paired.has(w.region)?`${e(w.side)} side`:''}${!w.region?'Not placed on the diagram':''}${w.disabledRegions?.length?' · Disabling wound':''}</p>${w.phase!=null?`<small>Phase ${e(w.phase)}${w.impulse!=null?` · Impulse ${e(w.impulse)}`:''}</small>`:''}${w.notes?`<details><summary>Wound notes</summary><p>${e(w.notes)}</p></details>`:''}</article>`;
  }).join('')||'<p class="pc-empty">No active wounds recorded.</p>'}</div></div></div>`;
}
export function bindWoundDiagram(root) {
  for(const map of root.querySelectorAll('[data-wound-map]')) {
    const select=key=>{
      const shapes=map.querySelectorAll('[data-wound-region]');
      let selected=null;
      for(const shape of shapes){const on=shape.dataset.woundRegion===key;shape.setAttribute('aria-pressed',String(on));if(on)selected=shape;}
      let count=0;
      for(const entry of map.querySelectorAll('[data-wound-keys]')){entry.hidden=Boolean(key)&&!entry.dataset.woundKeys.split(' ').includes(key);if(!entry.hidden)count++;}
      map.querySelector('[data-wound-heading]').textContent=selected?`${selected.querySelector('title').textContent.split(':')[0]} · ${count}`:`Active wounds · ${count}`;
      map.querySelector('[data-wound-all]').setAttribute('aria-pressed',String(!key));
    };
    map.addEventListener('click',event=>{const part=event.target.closest('[data-wound-region]');if(part)select(part.getAttribute('aria-pressed')==='true'?null:part.dataset.woundRegion);else if(event.target.closest('[data-wound-all]'))select(null);});
    map.addEventListener('keydown',event=>{if(['Enter',' '].includes(event.key)&&event.target.matches('[data-wound-region]')){event.preventDefault();event.target.dispatchEvent(new MouseEvent('click',{bubbles:true}));}});
  }
}
