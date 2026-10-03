import {escapeHTML as e} from '../foundry/context.mjs';
export const situationChoices=['Standing','Standing & Braced','Kneeling','Kneeling & Braced','Prone','Prone & Braced'];
export function situationLabel(condition){
  const base={standing:'Standing',kneeling:'Kneeling',prone:'Prone'}[condition?.posture];
  return base?base+(condition.braced?' & Braced':''):null;
}
export function situationUpdate(value){
  if(!situationChoices.includes(value))throw new Error('Choose a Table 4B situation.');
  return {'system.condition.posture':value.split(' ')[0].toLowerCase(),'system.condition.braced':value.endsWith('& Braced')};
}
export async function editSituation(actor){
  if(!actor?.isOwner)throw new Error('You must own this character.');
  const active=()=>game.combats.some(c=>c.started&&c.combatants.some(b=>b.actor?.uuid===actor.uuid));
  const value=await foundry.applications.api.DialogV2.prompt({window:{title:`Situation · ${actor.name}`},content:`<div class="pc-dialog"><p>Situation & stance · Table 4B. Braced means the weapon is supported; use it only when that support is available.</p><label>Shooter situation<select name="situation">${situationChoices.map(v=>`<option ${v===situationLabel(actor.system.condition)?'selected':''} value="${e(v)}">${e(v)}</option>`).join('')}</select></label>${active()?'<p>During combat, players change posture with Posture on the action bar. A GM may record an adjudicated situation here.</p>':''}</div>`,ok:{label:'Set situation',callback:(_e,_b,d)=>d.element.querySelector('[name=situation]').value},rejectClose:false});
  if(!value)return false;
  if(active()&&!game.user.isGM)throw new Error('During combat, use Posture on the action bar for a timed posture change; ask the GM to confirm bracing.');
  await actor.update(situationUpdate(value));return true;
}
export function registerSituationHUD(){
  const clear=()=>document.getElementById('pc-situation-menu')?.remove();
  Hooks.on('closeTokenHUD',clear);
  Hooks.on('canvasTearDown',clear);
  Hooks.on('canvasPan',clear);
  Hooks.on('renderTokenHUD',(hud,html)=>{
    clear();
    const actor=hud.actor??hud.object?.actor??hud.document?.actor;
    if(actor?.type!=='character'||!actor.isOwner)return;
    const root=html instanceof HTMLElement?html:html[0];
    if(!root)return;
    // Remove empty core palettes rather than leaving dead controls behind.
    const effects=root.querySelector('.status-effects');
    if(!effects?.querySelector('.effect-control'))root.querySelectorAll('[data-palette="effects"]').forEach(el=>el.remove());
    // Phoenix Command exposes only Move; core retains hidden engine actions in this palette.
    root.querySelectorAll('[data-palette="movementActions"]').forEach(el=>el.remove());
    if(root.querySelector('[data-pc-situation]'))return;
    const button=document.createElement('button');button.type='button';button.dataset.pcSituation='';button.className='control-icon pc-situation-toggle';
    button.setAttribute('aria-label','Shooter situation · Table 4B');button.setAttribute('aria-expanded','false');
    button.title=`Situation: ${situationLabel(actor.system.condition)??'Not recorded'}`;
    button.innerHTML='<i class="fa-solid fa-person" aria-hidden="true"></i><span>Situation</span>';
    button.addEventListener('click',event=>{
      event.preventDefault();event.stopPropagation();
      if(document.getElementById('pc-situation-menu')){clear();button.setAttribute('aria-expanded','false');return;}
      const panel=document.createElement('section');panel.id='pc-situation-menu';panel.setAttribute('aria-label','Shooter situation');
      const current=situationLabel(actor.system.condition);
      const active=game.combats.some(c=>c.started&&c.combatants.some(b=>b.actor?.uuid===actor.uuid));
      panel.innerHTML=`<header><strong>${e(actor.name)} · Situation</strong><button type="button" data-close aria-label="Close situation choices">×</button></header><p>Situation & stance · Table 4B</p><div role="group" aria-label="Choose situation">${situationChoices.map(value=>`<button type="button" data-value="${e(value)}" aria-pressed="${value===current}">${e(value)}${value===current?' ✓':''}</button>`).join('')}</div><p>${active?'Combat: players use Posture on the action bar for timed changes. GM selections here are adjudicated changes.':'Select a situation to save it to this character. Braced requires available weapon support.'}</p><p role="alert"></p>`;
      document.body.append(panel);
      const bounds=button.getBoundingClientRect();
      panel.style.left=`${Math.max(8,Math.min(bounds.right+10,innerWidth-panel.offsetWidth-8))}px`;
      panel.style.top=`${Math.max(8,Math.min(bounds.top,innerHeight-panel.offsetHeight-8))}px`;
      button.setAttribute('aria-expanded','true');
      panel.querySelector('[data-close]').addEventListener('click',()=>{clear();button.setAttribute('aria-expanded','false');button.focus();});
      panel.addEventListener('keydown',event=>{if(event.key==='Escape'){event.stopPropagation();clear();button.setAttribute('aria-expanded','false');button.focus();}});
      panel.querySelectorAll('[data-value]').forEach(choice=>choice.addEventListener('click',async()=>{
        panel.querySelectorAll('button').forEach(el=>el.disabled=true);
        try{
          if(!actor.isOwner)throw new Error('You must own this character.');
          if(!game.user.isGM&&game.combats.some(c=>c.started&&c.combatants.some(b=>b.actor?.uuid===actor.uuid)))throw new Error('Use Posture on the action bar to change posture during combat; ask the GM to confirm bracing.');
          await actor.update(situationUpdate(choice.dataset.value));
          clear();await hud.render({force:true});
        }catch(error){panel.querySelector('[role=alert]').textContent=error.message;panel.querySelectorAll('button').forEach(el=>el.disabled=false);}
      }));
      panel.querySelector('[data-value]').focus();
    });
    root.querySelector('.col.right')?.prepend(button);
  });
}
