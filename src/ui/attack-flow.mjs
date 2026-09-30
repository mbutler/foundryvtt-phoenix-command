import {situationLabel} from './situation.mjs';
import {rememberAttackDraft,recallAttackDraft,firearmReadiness,recordedShotDefaults} from './attack-draft.mjs';
import {automaticBallisticProtection} from '../rules/automatic-protection.mjs';
import { coverMenu, coverFromKey } from './cover-menu.mjs';
import { previewFirearm, previewMelee, resolveFirearm, resolveMelee, locateHit, firearmOptions, meleeArmorFromCoverage, damageModifierTable, postureDamageModifiers } from '../rules/attacks.mjs';
import {meleeOptionalRules} from '../foundry/optional-rules.mjs';
import { escapeHTML as e } from '../foundry/context.mjs';
import {derivedDamageBonus} from '../foundry/encounter-allowance.mjs';
const select = (name,label,choices,value='') => `<label>${e(label)}<select name="${name}"><option value="">Choose…</option>${choices.map(([v,l])=>`<option value="${e(v)}" ${String(v)===String(value)?'selected':''}>${e(l)}</option>`).join('')}</select></label>`;
const number = (name,label,value='',min=0) => `<label>${e(label)}<input name="${name}" type="number" min="${min}" step="any" value="${e(value)}"></label>`;
const modifierSelect = (name,label,ids,value,none) => `<label>${e(label)}<select name="${name}"><option value="">${e(none)}</option>${ids.map(id=>`<option value="${id}" ${id===value?'selected':''}>×${damageModifierTable[id].factor} ${e(damageModifierTable[id].label)}</option>`).join('')}</select></label>`;
const trace = result => `<details><summary>Inspect calculation & source</summary><dl>${result.trace.map(s=>`<dt>${e(s.label)}</dt><dd>${e(s.value)}</dd>`).join('')}</dl><p>${e(result.source)}</p></details>`;

// §3.5's choices in the attack flow's form, as the rules' modifier ids. A charge has no closing
// speed of its own to add: its line already includes it.
export function attackFlowDamageModifiers(draft,{charge=false}={}){
  return [draft.dmLevel,charge?'':draft.dmClosing,draft.dmBraced==='yes'?'braced':'',draft.dmGrasp==='yes'?'grasp':''].filter(Boolean);
}

// One selected weapon, one scene target, one immutable resolution. No document writes.
export function mountAttackFlow(root, {kind, loadContext, loadSavedInput, assertFresh, rollDice, postResult, applyResult, undoResult}) {
  let savedInput=null;
  let context, draft={}, input, preview, rolls, location, result, busy=false, revision=0, shared=false, applicationId, applicationStatus;
  const gun=kind==='firearm';
  const resolve = gun ? resolveFirearm : resolveMelee;
  const predict = gun ? previewFirearm : previewMelee;
  function error(message) { root.querySelector('[role=alert]').textContent=message; }
  function read() {
    if(savedInput)return structuredClone(savedInput);
    const {attacker,target,weapon,modeId,attackId,range,unit}=context;
    const n=key=>draft[key]===undefined||draft[key]===''?null:Number(draft[key]);
    return {...(context.reactions?{reactions:context.reactions}:{}),weapon,modeId,attackId,skill:attacker.system.skills[gun?'gun':'melee'],defenderSkill:target.system.skills.melee,
      distance:{value:range,unit},ammunitionKey:context.timedShot?.plan.ammunitionKey??draft.ammo,aimActions:context.timedShot?.plan.cost??n('aim'),targetSize:draft.exposure,
      visibility:draft.visibility?[draft.visibility]:[],situations:draft.situation?[draft.situation]:[],
      shooterSpeed:n('shooterSpeed'),targetSpeed:n('targetSpeed'),cover:coverFromKey(draft.cover,draft.coverStance),
      sets:n('sets'),damageBonus:n('damageBonus'),parryColumn:n('parry'),stationary:draft.stationary==='yes',
      ...(gun?{}:{optionalRules:meleeOptionalRules(),damageModifiers:meleeModifierChoice(),...(charging()?{chargeWeaponClass:n('chargeWc')}:{})})};
  }
  // §3.5: one height, one closing speed, and the braced and grasp conditions (D: LEG10204 review).
  function meleeModifierChoice() { return attackFlowDamageModifiers(draft,{charge:charging()}); }
  function charging() { return !gun&&context?.mode?.weaponClass===null&&context.mode.attacks?.[context.attackId]?.traits?.includes('charge'); }
  function capture() { if(root.querySelector('form')) { Object.assign(draft,Object.fromEntries(new FormData(root.querySelector('form')))); rememberAttackDraft(context,draft); } }
  function protections() {
    return [{id:'none',name:'Confirmed unarmored',ballisticPF:0,meleeClass:'NO'},...context.target.items.filter(i=>i.type==='armor'&&i.system.carried&&i.system.equipped)
      .flatMap(i=>Object.entries(i.system.coverage).map(([key,c])=>({...c,id:`${i.id}/${key}`,name:`${i.name} · ${c.side} ${c.region}`})))];
  }
  function refresh() {
    revision++;applicationId=crypto.randomUUID();applicationStatus=null;draft={};input=preview=rolls=location=result=null;shared=false;
    try {context=loadContext(); draft=recallAttackDraft(context); if(gun){const recorded=recordedShotDefaults(context.attacker,context.target);draft.situation=recorded.situation??draft.situation;draft.exposure??=recorded.exposure;const loadedAmmo=context.attacker.items.find(i=>i.id===context.weapon.system.loaded?.ammunitionItemId);if(loadedAmmo&&context.mode.ammunition[loadedAmmo.system.ammunitionKey])draft.ammo=loadedAmmo.system.ammunitionKey;} if(context.timedShot){applicationId=context.timedShot.applicationId;draft.aim=context.timedShot.plan.cost;draft.ammo=context.timedShot.plan.ammunitionKey;} const saved=loadSavedInput?.(context);savedInput=saved?structuredClone(saved):null;if(saved)Object.assign(draft,{exposure:saved.targetSize,visibility:saved.visibility[0],situation:saved.situations[0]??'none',cover:saved.cover?(saved.cover.key??'adjudicated'):'open',coverStance:saved.cover?.stance??'firing-over',shooterSpeed:saved.shooterSpeed,targetSpeed:saved.targetSpeed});if(context.timedShot){draft.shooterSpeed=0;draft.targetSpeed=0;} if(!gun){draft.sets=context.mode.preparation.sets;draft.damageBonus??=derivedDamageBonus(context.attacker)??undefined;draft.dmLevel??=postureDamageModifiers({attackerPosture:context.attacker.system.condition?.posture,targetPosture:context.target.system.condition?.posture})[0]??'';}render();}
    catch(err){context=null;render();error(err.message);}
  }
  function render() {
    const done=Boolean(result), struck=Boolean(rolls&&!done), mode=context?.mode;
    root.innerHTML=`<div class="pc-record pc-attack-flow"><header><p class="pc-record-kicker">TACTICAL RESOLUTION · ${gun?'FIREARM':'MELEE'}</p><h1>${e(context?.weapon.name??'Prepare attack')}</h1>${context?`<p>${e(context.attacker.name)} → ${e(context.target.name)}</p><div class="pc-attack-summary"><strong>${e(context.range)} ${e(context.unit)}</strong><span>SKILL ${e(context.attacker.system.skills[gun?'gun':'melee']??'—')} · ${e(context.modeId)}${gun?` · ${e(context.weapon.system.loaded?.rounds??'—')} RD`:''}</span></div><div class="pc-telemetry">${context.timing?`<span class="pc-chip" data-state="ready">P${e(context.timing.phase)} · I${e(context.timing.impulse)}</span>`:''}${savedInput?'<span class="pc-chip" data-state="ready">INPUTS LOCKED</span>':''}${applicationStatus?`<span class="pc-chip" data-tone="${applicationStatus==='applied'?'good':'warn'}">${e(applicationStatus)}</span>`:''}</div>`:''}</header>
      ${context?`<details><summary>Rules telemetry</summary><p>${e(context.measurement)}</p><p>${gun?'Applying spends the loaded and stocked round.':'Preparation comes from the selected mode.'}</p></details>`:''}
      ${savedInput&&!done&&!struck?`<p class="pc-sheet-muted">Paid timing, ammunition, movement, reactions, and adjudication are frozen for this roll.</p>${savedInput.situationSource?`<details><summary>Derived situation</summary><pre>${e(JSON.stringify(savedInput.situationSource,null,2))}</pre></details>`:''}<div class="pc-flow-actions"><button type="button" class="pc-save" data-command="roll">Roll saved attack</button></div>`:''}<p role="alert" class="pc-flow-error"></p>${context&&gun&&!done&&!struck&&!savedInput?`<p class="pc-rule-note">Target situation: <strong>${e(situationLabel(context.target.system.condition)??'Not recorded')}</strong>. Target exposure starts from that posture; adjust it for cover below. Shooter situation describes your firing stance. Range comes from the map; armor is read from the target at the hit location. Confirm exposure, visibility, cover and movement below. Choices are remembered for this target during this session until its state or the scene changes.</p>${firearmReadiness(context,draft.ammo)?`<p class="pc-sheet-warning">${e(firearmReadiness(context,draft.ammo))} You can still check odds.</p>`:''}`:''}
      ${context&&!done&&!struck&&!savedInput?`<form><div class="pc-flow-fields">${gun?
        select('ammo','Ammunition',Object.keys(mode.ammunition).map(k=>[k,k]),draft.ammo??(Object.keys(mode.ammunition).length===1?Object.keys(mode.ammunition)[0]:''))+
        select('aim','Aim actions',Object.keys(mode.aimModifiers).map(k=>[k,k]),draft.aim)+
        select('exposure','Target exposure',firearmOptions.targetSizes.map(k=>[k,k]),draft.exposure)+
        select('visibility','Visibility',firearmOptions.visibility.map(k=>[k,k]),draft.visibility)+
        select('cover','Cover (Table 7C)',[['open','None — in the open'],...coverMenu],draft.cover)+
        select('coverStance','Behind cover he is',[['firing-over','Firing over or around it'],['looking-over','Looking over or around it']],draft.coverStance??'firing-over'):
        select('sets','Prepared stroke',[['0','Short · no set'],['1','Normal · one set'],['2','Long · two sets']],draft.sets)+
        number('damageBonus','Damage bonus · Table 2D',draft.damageBonus)+number('parry','Resolved parry column · 1–9',draft.parry,1)+
        select('stationary','No movement during second set / strike?',[['yes','Yes'],['no','No']],draft.stationary)+
        (charging()?number('chargeWc','Weapon Class for this charge (none printed)',draft.chargeWc,-99):'')+
        modifierSelect('dmLevel','§3.5 height · from postures',['strikingDown','strikingUp','fromKnees','prone'],draft.dmLevel,'Level')+
        (charging()?'':modifierSelect('dmClosing','§3.5 closing speed',Object.keys(damageModifierTable).filter(id=>damageModifierTable[id].closing),draft.dmClosing,'None'))+
        select('dmBraced','§3.5 solidly braced target · ×2',[['no','No'],['yes','Yes']],draft.dmBraced??'no')+
        select('dmGrasp',"§3.5 striking in an opponent's grasp · ×.5",[['no','No'],['yes','Yes']],draft.dmGrasp??'no')}</div>
        ${gun?`<details open><summary>Movement & adjudication</summary><button type="button" data-command="stationary">Both stationary</button><p>Supply these unresolved modifiers explicitly; saved ft/second is not a verified impulse-speed conversion.</p><div class="pc-flow-fields">${number('shooterSpeed','Shooter speed · PCCS hex/impulse',draft.shooterSpeed)}${number('targetSpeed','Target speed · PCCS hex/impulse',draft.targetSpeed)}${select('situation','Shooter situation',[['none','None'],...firearmOptions.situations.map(k=>[k,k])],draft.situation)}</div></details>`:''}
        <div class="pc-flow-actions"><button type="button" data-command="preview">Check odds</button><button type="submit" class="pc-save">${savedInput?'Resume saved roll':'Roll attack'}</button></div></form>`:''}
      <section aria-live="polite" data-outcome>${done?`<h2>${result.hit?`${e(result.physicalDamage)} PD`:'MISS'}</h2><p>${e(result.location??'No hit location.')}${result.disabled?' · disabling injury':''}</p><p>Roll ${e(result.rolls.hit)} · ${preview.threshold==='hit'?'automatic hit':`00–${e(preview.threshold)} to hit`}</p><details><summary>Calculation trace</summary>${trace(result)}<pre>${e(JSON.stringify({input,rolls:result.rolls},null,2))}</pre></details><div class="pc-flow-actions"><button type="button" data-command="share" ${shared?'disabled':''}>${shared?'Shared':'Share'}</button>${applyResult?`<button type="button" class="pc-save" data-command="apply" ${['applied','undone'].includes(applicationStatus)?'disabled':''}>${applicationStatus==='applied'?'Applied':applicationStatus==='undone'?'Reversed':'Apply result'}</button>`:''}${undoResult&&applicationStatus==='applied'?'<button type="button" data-command="undo">Undo</button>':''}</div>`:
      struck?`<h2>Hit · ${e(location.location)}</h2><p>Hit roll ${e(rolls.hit)} · Location roll ${e(rolls.location)}</p><p>${gun?e(automaticBallisticProtection(context.target.items,location).reason??'Confirm protection at this location.'):'Choose protection for this exact location.'} Overlapping armor is not added together.</p>${select('protection','Protection at hit location',protections().map(p=>[p.id,`${p.name} · ${gun?'PF '+(p.ballisticPF??'unknown'):'class '+(p.meleeClass??'unknown')}`]))}<button type="button" class="pc-save" data-command="resolve">Confirm protection & resolve</button>`:preview?`<h2>${preview.threshold==='hit'?'Automatic hit':`Hit on 00–${e(preview.threshold)}`}</h2>${trace(preview)}`:''}</section>
      <footer><button type="button" data-command="refresh">${done?'New attack':struck?(context?.timedShot?'Reload saved shot':'Discard roll & refresh'):'Refresh from scene'}</button><p>Target one visible character token. Refresh after movement or document changes.</p></footer></div>`;
    if(savedInput)root.querySelectorAll('form input,form select').forEach(el=>el.disabled=true);
    if(context?.timedShot)root.querySelectorAll('[name=aim],[name=ammo]').forEach(el=>el.disabled=true);
    const form=root.querySelector('form');
    form?.addEventListener('input',()=>{revision++;capture();preview=null;root.querySelector('[data-outcome]').replaceChildren();error('');});
    form?.addEventListener('submit',event=>{event.preventDefault();run('roll');});
    root.querySelectorAll('[data-command]').forEach(button=>button.addEventListener('click',()=>run(button.dataset.command)));
  }
  async function run(command) {
    if(busy)return;
    if(command==='refresh'){capture();refresh();return;}
    if(command==='stationary'){capture();draft.shooterSpeed=0;draft.targetSpeed=0;preview=null;revision++;rememberAttackDraft(context,draft);render();return;}
    if(command==='roll'||command==='preview')capture();
    busy=true;const started=revision;
    root.querySelectorAll('button,input,select').forEach(el=>el.disabled=true);
    try {
      if(command==='apply'||command==='undo'){
        const saved=command==='apply'?await applyResult(structuredClone(result),structuredClone({attacker:context.attacker,target:context.target,input,rollSource:'Foundry Roll',applicationId,timing:context.timing??null,timedShotId:context.timedShot?.id??null})):await undoResult(applicationId);
        applicationStatus=saved.status;render();return;
      }
      if(command==='share') {
        await postResult(structuredClone(result),structuredClone({attacker:context.attacker,target:context.target,input,rollSource:'Foundry Roll',applicationId,timing:context.timing??null,timedShotId:context.timedShot?.id??null}));shared=true;render();return;
      }
      assertFresh(context);
      if(command==='resolve') {
        const protection=protections().find(p=>p.id===root.querySelector('[name=protection]').value);
        if(!protection)throw new Error('Choose the protection at this hit location.');
        input={...input,armorPF:protection.ballisticPF,...meleeArmorFromCoverage(context.mode.attacks?.[context.attackId],protection),protection:structuredClone(protection)};
        result=resolve(input,rolls);render();return;
      }
      input=read();if(!savedInput&&draft.situation==='none')input.situations=[];
      if(gun&&!savedInput){
        const missing=[['ammo','ammunition type'],['aim','aim actions'],['exposure','target exposure'],['visibility','visibility'],['cover','target cover'],['situation','shooter situation'],['shooterSpeed','shooter speed'],['targetSpeed','target speed']].filter(([key])=>draft[key]===undefined||draft[key]==='').map(([,label])=>label);
        if(missing.length)throw new Error(`Complete: ${missing.join(', ')}. Use Both stationary if neither token is moving.`);
      }
      if(gun&&command==='roll'){const problem=firearmReadiness(context,input.ammunitionKey);if(problem)throw new Error(problem);}
      preview=predict(input);
      if(command==='preview'){render();return;}
      const rolled=await rollDice({kind,dieSides:preview.dieSides,input:structuredClone(input),context});
      if(started!==revision)return;
      assertFresh(context);rolls=rolled;
      if(preview.threshold!=='hit'&&rolls.hit>preview.threshold)result=resolve(input,rolls);
      else {
        location=locateHit(kind,input,rolls);
        if(gun){
          const protection=automaticBallisticProtection(context.target.items,location);
          if(protection.resolved){input={...input,armorPF:protection.ballisticPF,protection};result=resolve(input,rolls);}
        }
      }
      render();
    }catch(err){error(['apply','undo'].includes(command)?`${command==='apply'?'Apply result':'Undo'} did not complete. ${err.message}`:err.message);}
    finally{busy=false;root.querySelectorAll('button,input,select').forEach(el=>el.disabled=(Boolean(savedInput)&&Boolean(el.closest('form'))&&['INPUT','SELECT'].includes(el.tagName))||(Boolean(context?.timedShot)&&['aim','ammo'].includes(el.name))||(shared&&el.dataset.command==='share')||(['applied','undone'].includes(applicationStatus)&&el.dataset.command==='apply'));}
  }
  refresh();
  return {getResult:()=>result?structuredClone(result):null};
}
