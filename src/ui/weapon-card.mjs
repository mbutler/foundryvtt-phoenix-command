import {threeRoundBurstRows,threeRoundBurstRanges} from '../data/three-round-burst.mjs';
import {weaponSourceCitation} from '../data/weapon-source-citation.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

// The catalogue's read-only weapon card and picker list. Everything here reads the transcribed
// catalogue entry itself, so a weapon can be examined before anything is added to a character.
// Where it came from (page, verification) is shown to the GM only.

const signed=n=>n>0?`+${n}`:n<0?`−${Math.abs(n)}`:'0';
const blank=v=>v==null||v==='';
const stat=(label,value)=>blank(value)?'':`<div><dt>${e(label)}</dt><dd>${e(String(value))}</dd></div>`;
const ammoNames={fmj:'FMJ',jhp:'JHP',ap:'AP',aps:'APS',shot:'Shot',slug:'Slug'};
const hexes=key=>Number(String(key).replace(/^r/,''));

export function gunSummary(entry){
  return [`${entry.weightLb} lb`,
    blank(entry.capacity)?null:`${entry.capacity} ${entry.feedDevice??''}`.trim(),
    entry.gauge?`${entry.gauge} ga`:rateOfFire(entry)?`ROF ${rateOfFire(entry)}`:null].filter(Boolean).join(' · ');
}
function rateOfFire(entry){
  const printed=entry.printedRateOfFire??entry.rateOfFire;
  return blank(printed)?null:String(printed);
}
function aimTable(aim){
  const rows=Object.entries(aim??{}).sort((a,b)=>Number(a[0])-Number(b[0]));
  if(!rows.length)return '';
  return `<section><h4>Aim time</h4><div class="pc-card-scroll"><table class="pc-card-table">
    <tr><th scope="row">Actions</th>${rows.map(([n])=>`<td>${e(n)}</td>`).join('')}</tr>
    <tr><th scope="row">Modifier</th>${rows.map(([,v])=>`<td>${e(signed(v))}</td>`).join('')}</tr></table></div></section>`;
}
function ammunitionTable(ammunition){
  const kinds=Object.entries(ammunition??{});
  if(!kinds.length)return '';
  const keys=[...new Set(kinds.flatMap(([,a])=>Object.keys(a.ranges??{})))].sort((a,b)=>hexes(a)-hexes(b));
  const name=(key,a)=>`${ammoNames[key]??key.toUpperCase()}${a.pelletNumber?` <small>${e(String(a.pelletNumber))} pellets</small>`:''}`;
  const cell=r=>r?`<td>${e(String(r.penetration??'—'))}<small>${e(String(r.damageClass??'—'))}</small></td>`:'<td>—</td>';
  return `<section><h4>Ammunition</h4><p class="pc-help">Penetration above, Damage Class below, by range in hexes.</p>
    <div class="pc-card-scroll"><table class="pc-card-table pc-card-ammo">
    <tr><th scope="col">Range</th>${keys.map(k=>`<th scope="col">${e(String(hexes(k)))}</th>`).join('')}</tr>
    ${kinds.map(([key,a])=>`<tr><th scope="row">${name(key,a)}</th>${keys.map(k=>cell(a.ranges?.[k])).join('')}</tr>`).join('')}
    </table></div></section>`;
}
function gunSource(entry){
  const citation=weaponSourceCitation(entry);
  return citation?`<footer class="pc-card-source"><strong>Source</strong> ${e(citation)}</footer>`:'';
}

export function gunCardHTML(entry,{group='',img=null,gm=false}={}){
  const kicker=[entry.category??(entry.gauge?'Shotgun':null),group].filter(Boolean).join(' · ');
  return `<header><p class="pc-card-kicker">${e(kicker)}</p><h3>${e(entry.name)}</h3></header>
    ${img?`<figure class="pc-card-image"><img src="${e(img)}" alt="${e(entry.name)}"></figure>`:''}
    ${entry.description?`<p class="pc-card-description">${e(entry.description)}</p>`:''}
    <dl class="pc-card-stats">
      ${stat('Weight',`${entry.weightLb} lb`)}${stat('Length',blank(entry.lengthIn)?null:`${entry.lengthIn} in`)}
      ${stat('Capacity',blank(entry.capacity)?null:`${entry.capacity} ${entry.feedDevice??''}`.trim())}
      ${stat('Reload',blank(entry.reloadTimeActions)?null:`${entry.reloadTimeActions} actions`)}
      ${stat('Rate of fire',rateOfFire(entry))}${stat('Burst',entry.burstRounds?`${entry.burstRounds} rounds`:null)}
      ${stat('Sustained burst penalty',entry.sustainedBurstPenalty)}${stat('Knock-Down',entry.knockDown)}
      ${stat('Gauge',entry.gauge)}${stat('SAB',entry.sab)}${stat('Country',entry.country)}
    </dl>
    ${aimTable(entry.aimModifiers)}${ammunitionTable(entry.ammunition)}${threeRoundTable(entry.id)}${gm?gunSource(entry):''}`;
}
// LEG10203 §6.3: a `**` weapon's 3RB row, the scatter of its three-round burst.
function threeRoundTable(id){
  const row=threeRoundBurstRows[id];
  if(!row)return '';
  return `<section><h4>Three-round burst</h4><p class="pc-help">3RB by range: the burst's scatter. The lower it is, the more of the three rounds can hit; from 0 up, only one can.</p>
    <div class="pc-card-scroll"><table class="pc-card-table">
    <tr><th scope="row">Range · hexes</th>${threeRoundBurstRanges.map(n=>`<td>${n}</td>`).join('')}</tr>
    <tr><th scope="row">3RB</th>${row.values.map(v=>`<td>${e(String(v))}</td>`).join('')}</tr></table></div></section>`;
}

export function meleeSummary(entry){
  const m=entry.modes.find(x=>x.weaponSpeed!=null)??entry.modes[0];
  return [`${entry.weightLb} lb`,m.weaponSpeed!=null?`WS ${m.weaponSpeed}`:null,m.range?`reach ${m.range}`:null].filter(Boolean).join(' · ');
}
export function meleeCardHTML(entry,{gm=false}={}){
  const thrust=entry.thrustFamily??(entry.family==='cutting'?'stabbing':entry.family);
  const v=x=>blank(x)?'—':e(String(x));
  return `<header><p class="pc-card-kicker">${e(`Table ${entry.table} · ${entry.section}`)}</p><h3>${e(entry.name)}</h3></header>
    <dl class="pc-card-stats">${stat('Weight',`${entry.weightLb} lb`)}${stat('Slash reads',`${entry.family} table`)}${stat('Thrust reads',`${thrust} table`)}</dl>
    <section><h4>Grips</h4><div class="pc-card-scroll"><table class="pc-card-table pc-card-grips">
      <tr><th scope="col">Grip</th><th scope="col">Hands</th><th scope="col">Speed</th><th scope="col">Class</th><th scope="col">Slash</th><th scope="col">Thrust</th><th scope="col">Reach</th></tr>
      ${entry.modes.map(m=>`<tr><th scope="row">${e(m.grip)}</th><td>${v(m.hands)}</td><td>${v(m.weaponSpeed)}</td><td>${v(m.weaponClass)}</td><td>${v(m.cutting)}</td><td>${v(m.stabbing)}</td><td>${v(m.range)}</td></tr>`).join('')}
    </table></div>
    <p class="pc-help">Impact is a die plus a bonus: (4) + 2 is a four-sided die plus 2. Reach is in 2-foot hexes; "2+" can also tip-hit one hex further.</p></section>
    ${gm?`<footer class="pc-card-source"><strong>Source</strong> LEG10204 Table ${e(entry.table)}, PDF page ${entry.table==='1A'?42:43}</footer>`:''}`;
}

// `groups` are [{label, options:[{key, name, summary, search}]}]; the first option is chosen.
export function pickerHTML(groups,{noun='weapon'}={}){
  const first=groups.flatMap(g=>g.options)[0]?.key??'';
  return `<div class="pc-weapon-picker">
    <div class="pc-picker-list">
      <input type="search" name="filter" placeholder="Search ${e(noun)}s" aria-label="Search ${e(noun)}s" autocomplete="off">
      <div class="pc-picker-options" role="listbox" aria-label="${e(noun)}s" tabindex="0">
        ${groups.map(g=>`<div role="group" aria-label="${e(g.label)}" data-group><p class="pc-picker-group" aria-hidden="true">${e(g.label)}</p>
          ${g.options.map(o=>`<div role="option" id="pc-pick-${e(o.key.replace(/[^A-Za-z0-9_-]/g,'-'))}" data-key="${e(o.key)}" data-search="${e(o.search.toLowerCase())}" aria-selected="${o.key===first}"><strong>${e(o.name)}</strong><span>${e(o.summary)}</span></div>`).join('')}</div>`).join('')}
      </div>
      <p class="pc-help" data-empty hidden>No ${e(noun)} matches.</p>
    </div>
    <article class="pc-weapon-card" data-card aria-live="polite"></article>
    <input type="hidden" name="choice" value="${e(first)}">
  </div>`;
}

// Grenades, charges and launchers (LEG10200 §3.6: the Grenades and Explosives table and the
// Explosive Weapons table). A burst is read by the distance from the blast, in hexes; C is
// contact, the round touching the man.
function burstTable(burst,{title='Blast by distance'}={}){
  // A supplement round may print more distance columns than the core table.
  const keys=['C',...Object.keys(burst??{}).filter(k=>k!=='C').sort((a,b)=>a-b)].filter(k=>burst?.[k]);
  if(!keys.length)return '';
  const cell=v=>`<td>${blank(v)?'—':e(String(v))}</td>`;
  // The Base Shrapnel Hit Chance as printed: *n is n pieces hitting; a number is the chance of
  // one piece on 00–99, which §3.7's target-size shift can still raise, so it may be negative.
  const shrapnel=b=>b.shrapnelRounds!=null?`*${b.shrapnelRounds}`:b.shrapnelChance!=null?String(b.shrapnelChance):null;
  return `<section><h4>${e(title)}</h4><p class="pc-help">By distance from the blast in hexes; C is contact. BSHC (Base Shrapnel Hit Chance): *n is n pieces hitting; a number is the chance of one piece on 00–99, before the target's size shifts it.</p>
    <div class="pc-card-scroll"><table class="pc-card-table">
    <tr><th scope="col">Distance</th>${keys.map(k=>`<th scope="col">${k}</th>`).join('')}</tr>
    <tr><th scope="row">PEN</th>${keys.map(k=>cell(burst[k].penetration)).join('')}</tr>
    <tr><th scope="row">DC</th>${keys.map(k=>cell(burst[k].damageClass)).join('')}</tr>
    <tr><th scope="row">BSHC</th>${keys.map(k=>cell(shrapnel(burst[k]))).join('')}</tr>
    <tr><th scope="row">Concussion</th>${keys.map(k=>cell(burst[k].baseConcussion)).join('')}</tr>
    </table></div></section>`;
}

export function grenadeSummary(entry){
  return [`${entry.weightLb} lb`,`${entry.throwRangeHexes} hex throw`,entry.fusePhases!=null?`fuse ${entry.fusePhases} phase${entry.fusePhases===1?'':'s'}`:null].filter(Boolean).join(' · ');
}
export function grenadeCardHTML(entry,{img=null,gm=false,source=null}={}){
  const kind=entry.ammoKey==='demolition'?'Demolition charge':/blast/i.test(entry.name)?'Blast grenade':/anti-tank/i.test(entry.name)?'Anti-tank grenade':'Fragmentation grenade';
  return `<header><p class="pc-card-kicker">${e([kind,entry.country].filter(Boolean).join(' · '))}</p><h3>${e(entry.name)}</h3></header>
    ${img?`<figure class="pc-card-image"><img src="${e(img)}" alt="${e(entry.name)}"></figure>`:''}
    <dl class="pc-card-stats">
      ${stat('Weight',`${entry.weightLb} lb`)}${stat('Length',blank(entry.lengthIn)?null:`${entry.lengthIn} in`)}
      ${stat('Throw range',`${entry.throwRangeHexes} hexes`)}${stat('Arming',blank(entry.armTime)?null:`${entry.armTime} actions`)}
      ${stat('Fuse',blank(entry.fusePhases)?null:`${entry.fusePhases} phase${entry.fusePhases===1?'':'s'}`)}
    </dl>
    ${blank(entry.armTime)||blank(entry.fusePhases)?`<p class="pc-help pc-card-note">The book prints V (variable) for this charge's arming and fuse: it is set the way it is rigged. Record its Arm Time on the item before it can be thrown.</p>`:''}
    ${burstTable(entry.burst)}
    ${gm&&source?`<footer class="pc-card-source"><strong>Source</strong> ${e(source)}</footer>`:''}`;
}

export function launcherSummary(entry){
  return [`${entry.weightLb} lb`,`${entry.capacity} rd`,entry.rounds.map(r=>r.toUpperCase()).join(', ')].join(' · ');
}
function arcTable(arc){
  const rows=Object.entries(arc??{}).sort((a,b)=>a[1].distanceFeet-b[1].distanceFeet);
  if(!rows.length)return '';
  return `<section><h4>Minimum arc</h4><p class="pc-help">A burst of grenades is swept across at least this many hexes, and its rounds land spread across them.</p>
    <div class="pc-card-scroll"><table class="pc-card-table">
    <tr><th scope="row">Range · hexes</th>${rows.map(([key])=>`<td>${e(String(hexes(key)))}</td>`).join('')}</tr>
    <tr><th scope="row">Arc · hexes</th>${rows.map(([,v])=>`<td>${e(String(v.arcHexes))}</td>`).join('')}</tr></table></div></section>`;
}
export function launcherCardHTML(entry,{img=null,gm=false,source=null}={}){
  return `<header><p class="pc-card-kicker">${e([entry.category??'Grenade launcher',entry.country].filter(Boolean).join(' · '))}</p><h3>${e(entry.name)}</h3></header>
    ${img?`<figure class="pc-card-image"><img src="${e(img)}" alt="${e(entry.name)}"></figure>`:''}
    <dl class="pc-card-stats">
      ${stat('Weight',`${entry.weightLb} lb`)}${stat('Length',blank(entry.lengthIn)?null:`${entry.lengthIn} in`)}
      ${stat('Capacity',`${entry.capacity} round${entry.capacity===1?'':'s'}`)}${stat('Reload',blank(entry.reloadTimeActions)?null:`${entry.reloadTimeActions} actions`)}
      ${stat('Rate of fire',entry.printedRateOfFire??null)}
      ${stat('Rounds',entry.rounds.map(r=>r.toUpperCase()).join(', '))}
      ${stat('Max range',entry.maxRangeHexes==null?null:typeof entry.maxRangeHexes==='object'
        ?Object.entries(entry.maxRangeHexes).map(([k,v])=>`${k.toUpperCase()} ${v}`).join(' · ')+' hexes':`${entry.maxRangeHexes} hexes`)}
    </dl>
    ${aimTable(entry.aimModifiers)}
    ${arcTable(entry.minimumArc)}
    ${entry.rounds.map(r=>burstTable(entry.bursts[r],{title:`${r.toUpperCase()} round · blast by distance`})).join('')}
    ${gm&&source?`<footer class="pc-card-source"><strong>Source</strong> ${e(source)}</footer>`:''}`;
}
