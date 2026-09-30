import {mountFireQueue} from './fire-queue.mjs';
import {impulseWorkflow} from './impulse-workflow.mjs';
import {coordinatorStatus} from '../application/player-intents.mjs';
import {elapsedSeconds} from '../rules/timing.mjs';
import {woundInImpulse} from '../rules/impulse-completion.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {encounterBlockers,autoAdvanceEnabled,setAutoAdvance} from '../foundry/auto-advance.mjs';

// The GM's controls for the impulse: its step, who the table is waiting for, auto-advance,
// the fire queue and reactions, pending effects, totals and the clock. One builder, so the
// combat tracker's footer and the docked GM panel show the same thing.
export function fillImpulseControls(footer,combat,{command}){
  const state=combat.timing;
  const wounded=state.phase?combat.combatants.some(c=>Object.values(c.actor?.system.injuries??{}).some(i=>woundInImpulse(i,state,combat.uuid))):false;
  const batch=state.batch;
  const coordination=coordinatorStatus();
  const coordinationNote=coordination.accepting?'':`<p role="alert">${e(coordination.detail??'No active coordinator.')}${coordination.recovery?` ${e(coordination.recovery)}`:''}</p>`;
  const totalDetail=batch?.complete?`<details><summary>Impulse total</summary><p>${Object.entries(batch.knockout).map(([id,k])=>`${e(combat.combatants.get(id)?.name??id)} ${k.totalPhysicalDamage} PD${k.shockPhysicalDamage?` + ${k.shockPhysicalDamage} Shock PD = ${k.knockoutPhysicalDamage} for knockout`:''} vs KV ${k.knockoutValue} · ${e(k.threshold.label)} ${k.threshold.incapacitationChance}${k.checked?` · rolled ${k.roll} · ${k.incapacitated?'incapacitated':'still active'}`:' · no check required'}`).join(' | ')||'No wounds'}</p></details>`:'';
  footer.innerHTML=`${coordinationNote}<p>${state.phase?`${elapsedSeconds(state)} s · impulse ${state.impulse}/4`:'Encounter not started'}</p>${wounded&&!batch?.complete?'<p role="alert">Wounds this impulse. Total it before advancing.</p>':''}${batch&&!batch.complete?`<p role="alert">${e(batch.unresolved?.map(item=>item.detail).join(' ')||'Resume pending knockout effects.')}</p>`:''}${totalDetail}${game.user.isGM&&(wounded||batch)&&!batch?.complete?'<button type="button" data-resolve-impulse>Total this impulse</button>':''}${game.user.isGM?`<button type="button" data-timing="${state.phase?'advance':'start'}">${state.phase?'Next impulse':'Begin encounter'}</button>`:''}${state.pendingEffect&&game.user.isGM?'<button type="button" data-resume-effect>Resume pending effect</button><button type="button" data-abandon-effect>Set action aside…</button>':''}`;
  const workflow=impulseWorkflow(state,Object.values(combat.getFlag('phoenix-command','shots')??{}),{wounded});
  footer.querySelectorAll('button').forEach(button=>{
    const active=!!workflow.selector&&button.matches(workflow.selector);
    button.hidden=!active;
    if(active){button.dataset.primary='true';if(workflow.disabled)button.disabled=true;}
  });
  delete footer.querySelector('[data-abandon-effect]')?.dataset.primary;
  // One readiness reading for the GM and for auto-advance, so they never disagree.
  const blockers=state.phase&&!state.reactions&&!state.batch?encounterBlockers(combat,state):[];
  const auto=autoAdvanceEnabled();
  // For the GM, each person named gets Select (and Wait when simply idle), so a stalled
  // NPC is handled from here rather than by finding his token.
  const who=b=>game.user.isGM&&b.id?`<li>${e(b.reason)} <button type="button" data-blocker-select="${e(b.id)}">Select</button>${b.kind==='idle'?`<button type="button" data-blocker-wait="${e(b.id)}">Wait</button>`:''}</li>`:`<li>${e(b.reason)}</li>`;
  const readiness=state.phase&&!state.reactions&&!state.batch?(blockers.length?`<div class="pc-help pc-blockers"><p>${auto?'Auto-advance waiting:':'Waiting:'}</p><ul>${blockers.map(who).join('')}</ul></div>`:'<p class="pc-help">Everyone is ready to advance.</p>'):'';
  const toggle=game.user.isGM?`<label class="pc-custom-toggle pc-auto-advance"><input type="checkbox" data-auto-advance ${auto?'checked':''}> Auto-advance when nobody has a decision</label>`:'';
  footer.insertAdjacentHTML('afterbegin',`<div class="pc-impulse-workflow"><strong>Phase ${state.phase} · Impulse ${state.impulse}/4</strong><p role="status">${e(workflow.label)}</p>${readiness}${toggle}</div>`);
  footer.querySelectorAll('[data-blocker-select]').forEach(button=>button.addEventListener('click',()=>{
    const token=combat.combatants.get(button.dataset.blockerSelect)?.token?.object;
    if(!token)return ui.notifications.warn('That token is not on the viewed scene.');
    token.control({releaseOthers:true});canvas.animatePan({x:token.center.x,y:token.center.y});
  }));
  footer.querySelectorAll('[data-blocker-wait]').forEach(button=>button.addEventListener('click',()=>command(combat,combat.timing,button.dataset.blockerWait,'wait',button)));
  footer.querySelector('[data-auto-advance]')?.addEventListener('change',event=>setAutoAdvance(event.currentTarget.checked).catch(error=>ui.notifications.warn(error.message)));
  if(!coordination.accepting)footer.querySelectorAll('button').forEach(button=>button.disabled=true);
  footer.querySelector('[data-resume-effect]')?.addEventListener('click',event=>command(combat,state,null,'resumeEffect',event.currentTarget));
  footer.querySelector('[data-abandon-effect]')?.addEventListener('click',event=>command(combat,state,null,'abandonEffect',event.currentTarget));
  footer.querySelector('[data-resolve-impulse]')?.addEventListener('click',async event=>{
    const control=event.currentTarget;control.disabled=true;
    try{await combat.resolveImpulseFire();}catch(error){ui.notifications.warn(error.message);}finally{control.disabled=false;}
  });
  footer.querySelectorAll('[data-timing]').forEach(button=>button.addEventListener('click',()=>command(combat,state,null,button.dataset.timing,button)));
  if(game.user.isGM&&coordination.accepting&&!state.pendingEffect&&!state.batch)mountFireQueue(footer,combat,{command});
}
