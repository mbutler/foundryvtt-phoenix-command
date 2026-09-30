import {activityTimer} from './activity-timer.mjs';
import {quickOrders} from './quick-orders.mjs';
import {woundInImpulse} from '../rules/impulse-completion.mjs';
import {actionBalance} from '../rules/timing.mjs';
import {orderStatus} from './order-status.mjs';
import {coordinatorStatus,submitPlayerIntent,awaitIntentReceipt} from '../application/player-intents.mjs';
import {reusableShotConditions} from '../foundry/shot-conditions.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {parryOptions} from '../foundry/strike-review.mjs';
import {parryChoiceMarkup,readParryChoice,limitParryChoices} from './parry-choice.mjs';
import {barDecisions,barVerbState,barVerbs,menuVerbs} from './action-bar-model.mjs';
import {equippedModes,supportsOrder} from './weapon-order-options.mjs';
import {smallArmsOptionalRules} from '../foundry/optional-rules.mjs';
import {pickBurstArc} from './burst-arc.mjs';
// §5.10: the equipped automatic modes that can give cover fire.
const coverFireModes=items=>equippedModes(items).filter(r=>!r.melee&&r.mode.fireTypes?.includes('automatic')&&r.mode.burstRounds>0);

export {barDecisions};
const defendLabels={parry:'Parry',dodge:'Dodge',coverUp:'Cover Up'};
let root,busy=false,openMenu=null;

export function actionBarContext(){
  if(!canvas.ready)return null;
  const combat=game.combat;
  if(!combat?.started||combat.scene?.id!==canvas.scene.id)return null;
  const owned=canvas.tokens.controlled.filter(t=>t.actor?.testUserPermission(game.user,'OWNER'));
  if(!owned.length)return null;
  if(owned.length>1)return {combat,multi:true,names:owned.map(t=>t.name)};
  const c=combat.combatants.find(c=>c.token?.uuid===owned[0].document.uuid);
  return c?{combat,combatant:c}:null;
}
function mount(){
  if(!root){root=document.createElement('section');root.id='pc-token-actions';root.tabIndex=0;root.setAttribute('aria-label','Selected character actions');document.body.append(root);}
  return root;
}
const shift=key=>`<span class="pc-keyhint" aria-hidden="true">⇧${key}</span>`;

export function renderTokenActionBar(){
  const context=actionBarContext();
  if(!context?.combatant?.actor?.testUserPermission(game.user,'OWNER')){
    if(context?.multi){mount().innerHTML=`<p role="status">Select one owned character token. ${context.names.length} are selected.</p>`;return;}
    root?.remove();root=null;openMenu=null;return;
  }
  const {combat,combatant:c}=context;
  const state=combat.timing,entry=state.entries[c.id],a=entry?.activity;
  const shot=a?.shotId?combat.getFlag('phoenix-command',`shots.${a.shotId}`):null;
  const reviewed=!!(shot?.adjudication||shot&&reusableShotConditions(combat,shot));
  const coordination=coordinatorStatus();
  const target=combat.targetFor(a?.weaponPlan);
  const consciousness=c.actor.system.condition?.consciousness??'conscious';
  // §5.9: who is standing in the hex he has pinned, and can be seen.
  const pin=entry?.pin,pinnedTargets=pin?combat.combatants.filter(o=>o.id!==c.id&&o.token?.object?.visible&&(()=>{
    const at=canvas.grid.getOffset(o.token.getCenterPoint({x:o.token.x,y:o.token.y}));return at.i===pin.hex.i&&at.j===pin.hex.j;})()).map(o=>({id:o.id,name:o.name})):[];
  const decisions=barDecisions(state,c.id,{shot,targetId:target?.id,consciousness,pinnedTargets});
  // Shift+F and the emphasis go only to a step the moment requires. Firing early is optional
  // (the attack fires when ready) unless the target is leaving; cancelling never qualifies.
  const primary=Math.max(decisions.findIndex(d=>d.kind.startsWith('pinFire:')),decisions.findIndex(d=>['hold','designateArc','work','move','resumeOrders'].includes(d.kind)||(d.kind==='fireNow'&&/leaves/.test(d.label))));
  const items=Array.from(c.actor.items);
  const quick=quickOrders({uuid:c.actor.uuid,type:c.actor.type,system:c.actor.system.toObject(),items:items.map(i=>({id:i.id,name:i.name,type:i.type,system:i.system.toObject()}))},{woundThisImpulse:i=>woundInImpulse(i,state,combat.uuid)});
  const postureRows=[...quick.posture,...quick.preparation];
  const verbs=barVerbState(state,c.id,{shot,reload:quick.reload.length,reloadReason:quick.reloadBlocked.join(' ')||null,posture:postureRows.length,consciousness,
    parry:equippedModes(items).some(r=>supportsOrder(r,'parry')),
    shield:items.some(i=>i.type==='shield'&&i.system.carried&&i.system.equipped&&i.system.strapped&&i.system.partialParry>=5)});
  const reloadVerb=verbs.find(v=>v.kind==='reload'),attackVerb=verbs.find(v=>v.kind==='attack');
  // Combat-wide blocks already disable Attack with the same sentence. This line is the
  // extra reason Reload alone is off: a full magazine, no spare rounds, a move in progress.
  const reloadNote=reloadVerb&&!reloadVerb.enabled&&reloadVerb.reason&&reloadVerb.reason!==attackVerb?.reason?reloadVerb.reason:null;
  if(openMenu&&!verbs.find(v=>v.kind===openMenu)?.enabled)openMenu=null;
  const menu=openMenu==='posture'?postureRows.map((q,i)=>({kind:`quick-${i}`,label:q.label}))
    :openMenu==='defend'?verbs.find(v=>v.kind==='defend').items.map(kind=>({kind,label:defendLabels[kind]}))
    :openMenu==='more'?[...(verbs.find(v=>v.kind==='attack').enabled?[{kind:'other',label:'Other actions…'},{kind:'wait',label:'Wait until given an order'},
      ...(smallArmsOptionalRules().pinningFire&&c.actor.system.condition.firingStance?[{kind:'pin',label:'Pin a hex…'}]:[]),
      ...(smallArmsOptionalRules().coverFire&&coverFireModes(items).length?[{kind:'coverFire',label:'Cover fire…'}]:[])]:[]),{kind:'sheet',label:'Character sheet'}]:[];
  const parrying=state.reactions?.choices?.[c.id]===null?parryOptions(combat,c.id):null;
  const ticked=new Set(readParryChoice(mount(),c.id)??[]);
  const disabled=busy||!coordination.accepting;
  const status=coordination.accepting?orderStatus(state,c.id,{shot,reviewed,targetName:target?.name,targetId:target?.id}):coordination.detail??'Waiting for GM coordinator.';
  const loadout=items.filter(i=>i.type==='weapon'&&i.system.carried&&i.system.equipped&&Object.keys(i.system.firearmModes??{}).length).map(i=>`${i.name} · ${i.system.loaded?.rounds??'?'} loaded`).join(' · ');
  root.innerHTML=`<div class="pc-token-heading"><strong>${e(c.name)}</strong><span>P${state.phase} · I${state.impulse} · ${entry?.allowance?`${actionBalance(state,c.id)} action${actionBalance(state,c.id)===1?'':'s'} left`:'Actions unavailable'}</span></div>
    <p class="pc-bar-status" role="status">${e(status)}${coordination.recovery?` ${e(coordination.recovery)}`:''}</p>
    ${activityTimer(state,c.id)}${a&&a.catalog?.execution!=='manual'&&a.progress<a.cost?`<p class="pc-current-order"><strong>${e(a.label)}</strong> · ${a.progress}/${a.cost}${target?` · ${e(target.name)}`:''}</p>`:''}
    ${parryChoiceMarkup(parrying,{scope:c.id})}
    ${decisions.length?`<div class="pc-bar-decisions" role="group" aria-label="Decisions">${decisions.map((x,i)=>`<button type="button" data-order="${x.kind}" ${i===primary?'data-primary="true" aria-keyshortcuts="Shift+F"':''} ${disabled?'disabled':''}>${e(x.label)}${i===primary?shift('F'):''}</button>`).join('')}</div>`:''}
    <div class="pc-bar-verbs" role="toolbar" aria-label="Actions">${verbs.map(v=>`<button type="button" data-verb="${v.kind}" aria-keyshortcuts="Shift+${v.key}" ${menuVerbs.has(v.kind)?`aria-expanded="${openMenu===v.kind}"`:''} ${!v.enabled||disabled&&v.kind!=='more'?'disabled':''} title="${e(v.reason??`${v.label} (Shift+${v.key})`)}">${e(v.label)}${shift(v.key)}</button>`).join('')}</div>
    ${reloadNote?`<p class="pc-bar-note">${e(reloadNote)}</p>`:''}
    ${menu.length?`<div class="pc-bar-menu" role="menu">${menu.map(m=>`<button type="button" role="menuitem" data-order="${e(m.kind)}" ${disabled&&m.kind!=='sheet'?'disabled':''}>${e(m.label)}</button>`).join('')}</div>`:''}
    ${loadout?`<p class="pc-bar-loadout">${e(loadout)}</p>`:''}`;
  for(const box of root.querySelectorAll('[data-parry-shot]'))box.checked=ticked.has(box.dataset.parryShot);
  limitParryChoices(root);
  const revision=state.revision;
  const send=async command=>{
    if(game.user.isGM)return combat.timingCommand(command);
    const message=await submitPlayerIntent(combat,command);return awaitIntentReceipt(combat,message.id);
  };
  const act=async kind=>{
    if(kind==='sheet')return c.actor.sheet.render({force:true});
    if(['done','resumeOrders','wait'].includes(kind))return send({kind:'done',done:kind!=='resumeOrders',...(kind==='wait'?{wait:true}:{}),combatantId:c.id,expectedRevision:revision,id:foundry.utils.randomID()});
    if(kind==='other'){
      const fields=await (await import('./activity-selector.mjs')).selectActivity(state,c.id,c.actor);
      return fields&&send({kind:'activity',combatantId:c.id,expectedRevision:revision,id:foundry.utils.randomID(),...fields});
    }
    if(['moveSplit','designateArc','dodge','coverUp'].includes(kind))return ui.combat.command(combat,state,c.id,kind,{disabled:false});
    if(kind==='pin'){
      const point=await (await import('./hex-picker.mjs')).pickHex({title:`Pin a hex · ${c.name}`,prompt:'Click the hex to pin, such as a window or a corner, inside his Field of Fire.'});
      return point&&send({kind:'pin',combatantId:c.id,point,expectedRevision:combat.timing.revision,id:foundry.utils.randomID()});
    }
    if(kind==='coverFire'){
      const rows=coverFireModes(items);
      let row=rows[0];
      if(rows.length>1){
        const pick=await foundry.applications.api.DialogV2.prompt({window:{title:`Cover fire · ${c.name}`},
          content:`<div class="pc-dialog"><label>Weapon<select name="row">${rows.map((r,i)=>`<option value="${i}">${e(r.weapon.name)} · ${e(r.modeId)}</option>`).join('')}</select></label></div>`,
          ok:{label:'Choose the hexes',callback:(_e,_b,d)=>Number(d.element.querySelector('[name=row]').value)},rejectClose:false});
        if(pick===null||pick===undefined)return;row=rows[pick];
      }
      const ammo=row.weapon.system.loaded?.ammunitionItemId;
      if(!ammo)throw new Error(`Load the ${row.weapon.name} before giving cover fire.`);
      let arc=null;
      await pickBurstArc({combat,shot:{combatantId:c.id,plan:{kind:'burst',weaponId:row.weapon.id,modeId:row.modeId,coverFire:true}},onConfirm:async fields=>{arc=fields;}});
      return arc&&send({kind:'coverFire',combatantId:c.id,order:{weaponId:row.weapon.id,modeId:row.modeId,ammunitionId:ammo,arc},expectedRevision:combat.timing.revision,id:foundry.utils.randomID()});
    }
    if(kind==='stopCoverFire')return send({kind:'stopCoverFire',combatantId:c.id,expectedRevision:combat.timing.revision,id:foundry.utils.randomID()});
    if(kind.startsWith('pinFire:')){
      const token=combat.combatants.get(kind.slice(8))?.token?.object;
      if(!token)throw new Error('That combatant is no longer on the map.');
      token.setTarget(true,{releaseOthers:true});
      return (await import('./foundry-calculator.mjs')).openTokenAttack();
    }
    if(kind==='attack')return (await import('./foundry-calculator.mjs')).openTokenAttack();
    if(kind==='reload'||kind==='parry')return (await import('./weapon-order.mjs')).openCombatWeaponOrder(combat,c.id,{kind});
    if(kind==='move')return (await import('./hex-move.mjs')).openTokenMove();
    const turn=kind==='turn'?await (await import('./turn.mjs')).selectTurn(combat,c.id):null;
    if(kind==='turn'&&!turn)return;
    const react=['hold','duck'].includes(kind),parries=react?readParryChoice(root,c.id):undefined;
    await send({...(turn?{kind:'activity',...turn}:kind.startsWith('quick-')?postureRows[Number(kind.slice(6))].command:{kind:react?'react':kind}),
      combatantId:c.id,expectedRevision:revision,id:foundry.utils.randomID(),...(react?{choice:kind,...(parries?{parries}:{})}:{})});
    if(['work','fireNow'].includes(kind)){
      const latest=combat.timing,ready=combat.getFlag('phoenix-command',`shots.${latest.entries[c.id]?.activity?.shotId}`);
      const planned=latest.entries[c.id]?.activity;
      if(ready?.status==='ready'&&ready.plan?.kind==='burst'&&!ready.arc&&!latest.reactions&&!(planned?.plannedArc&&!planned.plannedArcIssue))await ui.combat.command(combat,latest,c.id,'designateArc',{disabled:false});
    }
  };
  const run=async kind=>{
    if(busy)return;
    if(menuVerbs.has(kind)){openMenu=openMenu===kind?null:kind;renderTokenActionBar();root?.querySelector('[role=menuitem]')?.focus();return;}
    busy=true;openMenu=null;renderTokenActionBar();
    try{await act(kind);}catch(error){ui.notifications.warn(error.message);}finally{busy=false;renderTokenActionBar();}
  };
  root.querySelectorAll('[data-order]').forEach(button=>button.addEventListener('click',()=>run(button.dataset.order)));
  root.querySelectorAll('[data-verb]').forEach(button=>button.addEventListener('click',()=>run(button.dataset.verb)));
  root.onkeydown=event=>{if(event.key==='Escape'&&openMenu){openMenu=null;renderTokenActionBar();event.stopPropagation();}};
}

// Shift + a mnemonic letter presses the matching button when it is shown and enabled.
// Registered through Foundry's keybindings, so players can see and rebind them; the plain
// letters belong to core Foundry (WASD panning, T targeting, and others).
function press(selector){
  const button=root?.querySelector(selector);
  if(!button||button.disabled)return false;
  button.click();return true;
}
export function registerTokenActionBar(){
  for(const verb of barVerbs)game.keybindings.register('phoenix-command',`bar-${verb.kind}`,{
    name:`Action bar · ${verb.label}`,editable:[{key:`Key${verb.key}`,modifiers:['Shift']}],
    onDown:()=>press(`[data-verb="${verb.kind}"]`)});
  game.keybindings.register('phoenix-command','bar-decision',{name:'Action bar · first decision (fire, hold, continue…)',
    editable:[{key:'KeyF',modifiers:['Shift']}],onDown:()=>press('[data-order][data-primary]')});
  const notified=new Set();
  Hooks.on('updateCombat',combat=>{
    const state=combat.timing;
    for(const c of combat.combatants){
      const done=state.entries[c.id]?.lastCompleted;
      if(!done||done.revision!==state.revision||!c.actor?.testUserPermission(game.user,'OWNER'))continue;
      const key=`${combat.uuid}:${c.id}:${done.activityId}:${done.revision}`;
      if(notified.has(key))continue;
      notified.add(key);ui.notifications.info(`${c.name}: ${done.label} — finished.`);
    }
  });
  for(const hook of ['controlToken','updateToken','deleteToken','updateCombat','deleteCombat','createCombatant','updateCombatant','deleteCombatant','updateActor','createItem','updateItem','deleteItem','updateUser','userConnected','updateSetting','canvasReady'])Hooks.on(hook,()=>renderTokenActionBar());
  Hooks.on('canvasTearDown',()=>{root?.remove();root=null;openMenu=null;});
}
