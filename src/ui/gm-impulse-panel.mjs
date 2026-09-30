import {fillImpulseControls} from './impulse-controls.mjs';
import {impulseWorkflow} from './impulse-workflow.mjs';
import {woundInImpulse} from '../rules/impulse-completion.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

// The GM's one surface for the impulse, docked over the scene whatever sidebar tab is open:
// the step, who the table is waiting for (with Select and Wait), auto-advance, the fire
// queue and reactions, pending effects, totals and the clock. The tracker footer shows the
// same controls; this makes them reachable without the Combat tab.
let panel=null,pending=false,collapsed=false;
try{collapsed=localStorage.getItem('pc-gm-impulse-collapsed')==='1';}catch{/* Private window: start open. */}

function editing(){
  const active=document.activeElement;
  return !!panel&&panel.contains(active)&&['SELECT','INPUT','TEXTAREA'].includes(active?.tagName);
}
export function renderGmImpulsePanel(){
  const combat=game.combat;
  if(!game.user.isGM||!canvas.ready||!combat||combat.scene?.id!==canvas.scene?.id){panel?.remove();panel=null;return;}
  // Never re-render under a GM who is choosing cover or typing a value; catch up on blur.
  if(editing()){pending=true;return;}
  pending=false;
  let state;try{state=combat.timing;}catch{panel?.remove();panel=null;return;}
  if(!panel){
    panel=document.createElement('section');panel.id='pc-gm-impulse';panel.className='phoenix-command';
    panel.setAttribute('aria-label','Impulse controls');
    panel.addEventListener('focusout',()=>setTimeout(()=>{if(pending&&!editing())renderGmImpulsePanel();},0));
  }
  // Dock in the column beside the sidebar so the panel slides left when the sidebar expands.
  const column=document.getElementById('ui-right-column-1');
  if(column&&panel.parentElement!==column)column.prepend(panel);
  else if(!column&&!panel.isConnected)document.body.append(panel);
  panel.classList.toggle('pc-floating',!column);
  const scroll=panel.querySelector('.pc-gm-body')?.scrollTop??0;
  const wounded=state.phase?combat.combatants.some(c=>Object.values(c.actor?.system.injuries??{}).some(i=>woundInImpulse(i,state,combat.uuid))):false;
  const step=impulseWorkflow(state,Object.values(combat.getFlag('phoenix-command','shots')??{}),{wounded}).label;
  panel.innerHTML=`<header><strong>${state.phase?`Phase ${state.phase} · Impulse ${state.impulse}`:'Encounter'}</strong><span>${e(step)}</span>
    <button type="button" data-collapse aria-expanded="${!collapsed}" aria-label="${collapsed?'Show':'Hide'} impulse controls">${collapsed?'▸':'▾'}</button></header>
    <div class="pc-gm-body pc-impulse-footer" ${collapsed?'hidden':''}></div>`;
  panel.querySelector('[data-collapse]').addEventListener('click',()=>{
    collapsed=!collapsed;try{localStorage.setItem('pc-gm-impulse-collapsed',collapsed?'1':'0');}catch{/* Not remembered. */}
    renderGmImpulsePanel();
  });
  if(!collapsed){
    const body=panel.querySelector('.pc-gm-body');
    fillImpulseControls(body,combat,{command:ui.combat.command.bind(ui.combat)});
    body.scrollTop=scroll;
  }
}
export function registerGmImpulsePanel(){
  let queued=false;
  const schedule=()=>{if(queued)return;queued=true;setTimeout(()=>{queued=false;renderGmImpulsePanel();},30);};
  for(const hook of ['updateCombat','createCombat','deleteCombat','combatStart','createCombatant','updateCombatant','deleteCombatant','updateActor','updateToken','updateSetting','canvasReady','userConnected'])Hooks.on(hook,schedule);
  Hooks.on('canvasTearDown',()=>{panel?.remove();panel=null;});
}
