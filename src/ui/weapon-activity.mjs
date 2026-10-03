import {visibleEncounterTarget} from '../rules/target-eligibility.mjs';
import {weaponActivity} from '../rules/weapon-timing.mjs';
import {equippedModes,supportsOrder,compatibleAmmunition,preferredMode,weaponOrderKinds,isMeleeOrder,needsTarget} from './weapon-order-options.mjs';
import {resolveWeaponOrderContext,previewWeaponOrder} from './weapon-order-context.mjs';
import {aimChoices,aimedKinds,commitLabels,fieldPresentation,presentAimChoices,offHandAgilitySkillFactor} from './order-card-model.mjs';
import {escapeHTML as e,selectedAttackContext} from '../foundry/context.mjs';
import {observedHitChance} from '../rules/hit-estimate.mjs';
import {observedShotScene} from '../foundry/hit-estimate-scene.mjs';
import {fieldOfFire,planTurn} from '../foundry/facing.mjs';
import {pickBurstArc} from './burst-arc.mjs';
import {movedThisPhase} from '../rules/timing.mjs';
import {bearingBetween} from '../foundry/hex-move.mjs';

const strokes=[[0,'Short','half damage'],[1,'Normal',''],[2,'Long','double damage']];
function aimButton(c,shortcut){
  const odds=c.chance!=null?`~${c.chance}%`:`${c.modifier>0?'+':''}${c.modifier}`;
  const when=c.finishes==='now'?'now':c.finishes;
  const actions=`${c.aimActions} action${c.aimActions===1?'':'s'}`;
  const headline=c.role==='rest'?String(c.aimActions):c.label;
  const detail=c.role==='rest'?when:`${when} · ${actions}`;
  const spoken=`${headline}, fires ${when==='now'?'this impulse':when}, ${actions}, ${c.chance!=null?`about ${c.chance}% to hit`:`modifier ${c.modifier}`}`;
  return `<button type="button" data-aim-actions="${c.aimActions}" aria-label="${e(spoken)}" title="Aim modifier ${e(String(c.modifier))}" ${shortcut?`aria-keyshortcuts="${shortcut}"`:''}><strong>${e(headline)}</strong><span>${e(detail)}</span><span class="pc-aim-mod">${e(odds)}</span></button>`;
}
let cancelActive=null;

// The order card docks above the token action bar. Anything the context settles is shown
// as context; only open questions are asked, and choosing an aim time or attack commits.
export async function selectWeaponActivity(combat,state,id,selection={}){
  const actor=combat.combatants.get(id)?.actor;
  if(!actor)throw new Error('Choose a character combatant.');
  const snapshot={uuid:actor.uuid,system:actor.system.toObject(),items:Array.from(actor.items,i=>({id:i.id,uuid:i.uuid,name:i.name,type:i.type,system:i.system.toObject(),flags:structuredClone(i.flags??{})}))};
  const modes=equippedModes(snapshot.items);
  const kinds=Object.keys(weaponOrderKinds).filter(kind=>modes.some(m=>supportsOrder(m,kind)));
  if(!kinds.length)throw new Error('Equip a supported weapon before giving a weapon order.');
  const initialKind=selection.kind==='melee'?'strike':selection.kind==='firearm'?'shot':selection.kind;
  if(initialKind&&!kinds.includes(initialKind))throw new Error('The selected attack is not supported by the equipped weapons.');
  const targets=combat.combatants.filter(c=>c.id!==id&&visibleEncounterTarget(c,game.user));
  const options=rows=>rows.map(([value,label])=>`<option value="${e(value)}">${e(label)}</option>`).join('');

  cancelActive?.();
  const root=document.createElement('section');
  root.className='pc-order-card pc-dialog pc-weapon-order';
  root.setAttribute('role','dialog');root.setAttribute('aria-label',`${actor.name} · order`);
  root.innerHTML=`<header><strong data-title></strong><button type="button" data-close aria-label="Close without ordering">×</button></header>
    <p class="pc-order-facts" data-facts></p>
    <div class="pc-order-chips" data-chips></div>
    <div class="pc-order-choose">
      <label data-field="kind">Order<select name="kind">${options(kinds.map(k=>[k,weaponOrderKinds[k]]))}</select></label>
      <label data-field="mode">Weapon<select name="mode"></select></label>
      <label data-field="ammunitionId">Ammunition<select name="ammunitionId"></select></label>
      <label data-field="targetUuid">Target<select name="targetUuid"><option value="">Choose…</option>${options(targets.map(c=>[c.token.uuid,c.name]))}</select></label>
    </div>
    <p class="pc-order-blocker" data-blocker role="alert"></p>
    <p class="pc-aim-caption" data-aim-caption>When it fires</p><div class="pc-aim-strip pc-aim-featured" data-aim role="group" aria-label="When it fires"></div>
    <details class="pc-aim-rest" data-aim-rest hidden><summary>Other aim times</summary><div class="pc-aim-strip" data-aim-more role="group" aria-label="Other aim times"></div></details>
    <div data-strike hidden>
      <div class="pc-stroke-chips" role="radiogroup" aria-label="Sets before the blow">${strokes.map(([sets,label,note])=>`<label><input type="radio" name="sets" value="${sets}" ${sets===1?'checked':''}><span>${label}${note?` · ${note}`:''}</span></label>`).join('')}</div>
      <div class="pc-attack-buttons" data-attacks role="group" aria-label="Attack"></div>
      <details class="pc-order-more" data-special hidden><summary>This weapon</summary><label data-continue-cut class="pc-custom-toggle"><input type="checkbox" name="continueCut"> Continue the cut</label></details>
    </div>
    <button type="button" class="pc-order-commit" data-commit hidden></button>
    <details class="pc-order-more"><summary>Timing</summary><label class="pc-custom-toggle"><input type="checkbox" name="continuous" checked> Keep investing actions each impulse until done</label></details>`;
  const find=name=>root.querySelector(`[name="${name}"]`);
  const opened=new Set();
  // Set by render when the target is outside the Field of Fire and a turn is folded in.
  let turn=null;
  const listed=()=>modes.filter(m=>supportsOrder(m,find('kind').value));
  const current=()=>listed()[Number(find('mode').value)];
  const kind=()=>find('kind').value;

  function request(extra={}){
    const chosen=kind(),row=current();
    // A three-round burst is sent as the shot it is, with its flag.
    const k=chosen==='threeRound'?'shot':chosen;
    return {kind:k,...(chosen==='threeRound'?{threeRoundBurst:true}:{}),weaponId:row?.weapon.id,modeId:row?.modeId,ammunitionId:isMeleeOrder(k)?null:find('ammunitionId').value||null,
      ...(k==='strike'?{sets:Number(root.querySelector('[name=sets]:checked')?.value??1),
        continueCut:find('continueCut').checked&&!root.querySelector('[data-special]').hidden?true:undefined,
        ...(row?.weapon.system.heldIn==='off'?{agilitySkillFactor:offHandAgilitySkillFactor(snapshot.system)}:{})}:{}),
      targetUuid:needsTarget(k)&&k!=='burst'?find('targetUuid').value||null:null,...extra};
  }
  function fillModes(useSelection=false){
    const rows=listed();
    find('mode').innerHTML=options(rows.map((m,i)=>[String(i),`${m.weapon.name}${rows.filter(r=>r.weapon.id===m.weapon.id).length>1?` · ${m.modeId}`:''}`]));
    find('mode').value=String(preferredMode(rows,useSelection?selection:{}));
    fillAmmunition();
  }
  function fillAmmunition(){
    const row=current(),ammo=compatibleAmmunition(snapshot.items,row);
    find('ammunitionId').innerHTML=options(ammo.map(i=>[i.id,`${i.name} · ${i.system.quantity} rounds`]));
    if(ammo.some(i=>i.id===row?.weapon.system.loaded?.ammunitionItemId))find('ammunitionId').value=row.weapon.system.loaded.ammunitionItemId;
  }

  let finish;
  const done=new Promise(resolve=>{finish=value=>{
    if(!root.isConnected)return;
    root.remove();window.removeEventListener('keydown',onKey,true);
    for(const [name,hook] of hooks)Hooks.off(name,hook);
    if(cancelActive===cancel)cancelActive=null;
    resolve(value);
  };});
  const cancel=()=>finish(null);
  const commit=extra=>{
    const weaponRequest=request(extra);
    try{weaponActivity(snapshot,weaponRequest);if(!turn)previewWeaponOrder(snapshot,state,id,weaponRequest,combat);}
    catch(error){const blocker=root.querySelector('[data-blocker]');blocker.textContent=error.message;blocker.hidden=false;return;}
    // Turn and aim: the turn is the order; the shot starts once the turn is applied.
    if(turn&&extra.aimActions!=null)return finish({turnFacing:turn.facing,then:{weaponRequest},continuous:true});
    // Burst, stationary shooter (U2d ruling): the arc is chosen now, from where he stands,
    // and applied when the burst fires if he has not moved. A moving shooter chooses it then.
    if(weaponRequest.kind==='burst'&&!movedThisPhase(state,id)&&!state.entries[id]?.movement?.pending){
      root.hidden=true;
      const explosive=weaponActivity(snapshot,weaponRequest).explosive===true;
      void pickBurstArc({combat,shot:{combatantId:id,plan:{kind:'burst',weaponId:weaponRequest.weaponId,modeId:weaponRequest.modeId,...(explosive?{explosive:true}:{})}},
        onConfirm:async arc=>{weaponRequest.arc=arc;}}).then(picked=>picked?finish({weaponRequest,continuous:find('continuous').checked}):cancel())
        .catch(error=>{root.hidden=false;const blocker=root.querySelector('[data-blocker]');blocker.textContent=error.message;blocker.hidden=false;});
      return;
    }
    finish({weaponRequest,continuous:find('continuous').checked});
  };

  function render(){
    const k=kind(),row=current();
    const resolved=resolveWeaponOrderContext({snapshot,combat,state,combatantId:id,
      selection:{...selection,kind:k,itemId:row?.weapon.id,modeId:row?.modeId,targetUuid:find('targetUuid').value||selection.targetUuid},user:game.user});
    const counts={kind:kinds.length,mode:listed().length,ammunitionId:isMeleeOrder(k)?0:compatibleAmmunition(snapshot.items,row).length,targetUuid:targets.length};
    const show=fieldPresentation({resolved:{...resolved,kind:k},counts,opened:[...opened]});
    // The target is asked for only when no chosen target is already set.
    if(show.targetUuid!=='hidden'&&!find('targetUuid').value&&show.targetUuid!=='choose')show.targetUuid='choose';
    for(const label of root.querySelectorAll('[data-field]'))label.hidden=show[label.dataset.field]!=='choose';

    const target=targets.find(c=>c.token.uuid===find('targetUuid').value);
    const ammo=snapshot.items.find(i=>i.id===find('ammunitionId').value);
    root.querySelector('[data-title]').textContent=`${row?.weapon.name??'Weapon'}${target&&show.targetUuid!=='hidden'?` → ${target.name}`:k==='burst'?' · burst':['reload','parry','recover'].includes(k)?` · ${weaponOrderKinds[k].toLowerCase()}`:''}`;
    const facts=[];let distance=null;
    const shooter=combat.combatants.get(id)?.token?.object,targetToken=target?.token?.object;
    if(show.targetUuid!=='hidden'&&shooter&&targetToken&&globalThis.canvas?.ready){
      try{const m=selectedAttackContext({controlled:[shooter],targets:[targetToken],scene:canvas.scene,user:game.user,geometryOnly:true,measurePath:points=>canvas.grid.measurePath(points)});facts.push(`${m.range} ${m.unit}`);distance={value:m.range,unit:m.unit};}catch{/* Shown by validation below when it matters. */}
    }
    if(row&&!row.melee)facts.push(`${row.weapon.system.loaded?.rounds??'unknown'} loaded`);
    if(ammo&&show.ammunitionId!=='hidden')facts.push(ammo.name);
    root.querySelector('[data-facts]').textContent=facts.join(' · ');

    const chips=[];
    for(const [field,text] of [['kind',weaponOrderKinds[k]],['mode',row?.weapon.name],['ammunitionId',ammo?.name],['targetUuid',target?.name]])
      if(show[field]==='chip')chips.push(`<button type="button" class="pc-order-chip" data-open="${field}" aria-label="Change ${e({kind:'order',mode:'weapon',ammunitionId:'ammunition',targetUuid:'target'}[field])}">${e(text??'')} <span aria-hidden="true">▾</span></button>`);
    root.querySelector('[data-chips]').innerHTML=chips.join('');

    const strike=k==='strike';
    root.querySelector('[data-strike]').hidden=!strike;
    const aim=root.querySelector('[data-aim]'),blocker=root.querySelector('[data-blocker]'),commitButton=root.querySelector('[data-commit]');
    aim.hidden=!aimedKinds.includes(k);root.querySelector('[data-aim-caption]').hidden=aim.hidden;
    if(!aimedKinds.includes(k))root.querySelector('[data-aim-rest]').hidden=true;
    commitButton.hidden=!commitLabels[k];
    blocker.textContent='';
    let base=null;
    try{base=request();if(!row)throw new Error('Choose a weapon.');if(show.targetUuid!=='hidden'&&!base.targetUuid)throw new Error('Choose a target.');}
    catch(error){blocker.textContent=error.message;base=null;}

    turn=null;
    if(base?.targetUuid&&['shot','threeRound','shotgun','launcher'].includes(k)){
      const shooterDoc=combat.combatants.get(id)?.token,targetDoc=combat.combatants.find(c=>c.token?.uuid===base.targetUuid)?.token;
      if(shooterDoc&&targetDoc){
        const from=shooterDoc.getCenterPoint({x:shooterDoc.x,y:shooterDoc.y}),to=targetDoc.getCenterPoint({x:targetDoc.x,y:targetDoc.y});
        if(!fieldOfFire(from,to,shooterDoc.rotation).allowed){
          const facing=bearingBetween(from,to);
          try{turn={facing,cost:planTurn(shooterDoc,actor,facing).cost};}catch(error){blocker.textContent=error.message;}
        }
      }
    }
    if(aimedKinds.includes(k)){
      const choices=base?aimChoices(snapshot,state,id,base,{extraCost:turn?.cost??0}):[];
      const fits=choices.filter(c=>!c.blocked);
      // Single shots carry the shooter's own estimate, built only from what he can see.
      const seen=k==='shot'&&distance?observedShotScene(combat,state,id,base.targetUuid):null;
      for(const c of fits)c.chance=seen?observedHitChance({weapon:row.weapon,modeId:row.modeId,ammunitionKey:ammo?.system.ammunitionKey,
        skill:snapshot.system.skills?.gun,aimActions:c.aimActions,distance,...seen}):null;
      const estimated=fits.some(c=>c.chance!=null);
      root.querySelector('[data-aim-caption]').textContent=`${turn?`Turn to face · ${turn.cost} action${turn.cost===1?'':'s'}, then aim`:'When it fires'} · ${estimated?'your estimate to hit':'aim modifier'}`;
      if(base&&!fits.length&&choices.length)blocker.textContent=choices[0].blocked;
      const shown=presentAimChoices(fits);
      const button=(c,shortcut)=>aimButton(c,shortcut);
      aim.innerHTML=shown.featured.map((c,i)=>button(c,i<9?String(i+1):'')).join('');
      const rest=root.querySelector('[data-aim-rest]'),more=root.querySelector('[data-aim-more]');
      rest.hidden=!shown.rest.length;
      rest.querySelector('summary').textContent=shown.rest.length===1?'Other aim time':`Other aim times · ${shown.rest.length}`;
      more.innerHTML=shown.rest.map(c=>button(c,'')).join('');
      if(base&&fits.length&&!turn){
        // Other rule checks (range, facing, target) apply to every aim time alike.
        try{previewWeaponOrder(snapshot,state,id,{...base,aimActions:fits[0].aimActions},combat);}
        catch(error){blocker.textContent=error.message;aim.innerHTML='';more.innerHTML='';rest.hidden=true;}
      }
    }
    if(strike&&row){
      const attacks=Object.entries(row.mode.attacks??{});
      const traits=row.mode.attacks?.[selection.attackId]?.traits??[];
      const cut=row.weapon.flags?.['phoenix-command']?.chainsawCut;
      const special=attacks.some(([,a])=>a.traits?.includes('chainsaw'))&&cut?.cuttingPower>0;
      root.querySelector('[data-special]').hidden=!special;
      const noSets=traits.includes('charge')||(find('continueCut').checked&&special);
      root.querySelectorAll('[name=sets]').forEach(input=>{input.disabled=noSets;if(noSets)input.checked=input.value==='0';});
      const offHand=row.weapon.system.heldIn==='off'?offHandAgilitySkillFactor(snapshot.system):undefined;
      root.querySelector('[data-attacks]').innerHTML=base?attacks.map(([attackId,a],i)=>{
        let blocked=null;
        if(row.weapon.system.heldIn==='off'&&offHand==null)blocked='Off-hand blows need Agility and a Hand-to-Hand skill on the sheet.';
        else try{const r=request({attackId});if(a.traits?.includes('charge'))r.sets=0;weaponActivity(snapshot,r);previewWeaponOrder(snapshot,state,id,r,combat);}catch(error){blocked=error.message;}
        return `<button type="button" data-attack-id="${e(attackId)}" aria-keyshortcuts="${i+1}" ${blocked?`disabled title="${e(blocked)}"`:''}>${e(attackId[0].toUpperCase()+attackId.slice(1))}</button>`;
      }).join(''):'';
      const all=[...root.querySelectorAll('[data-attack-id]')];
      if(base&&all.length&&all.every(b=>b.disabled))blocker.textContent=all[0].title;
    }
    if(commitLabels[k]){
      commitButton.textContent=commitLabels[k];
      try{if(!base)throw new Error(blocker.textContent||'Choose the order details.');weaponActivity(snapshot,base);const p=previewWeaponOrder(snapshot,state,id,base,combat);commitButton.textContent=`${commitLabels[k]} · ${p.plan.cost} action${p.plan.cost===1?'':'s'}`;commitButton.disabled=false;}
      catch(error){commitButton.disabled=true;blocker.textContent=error.message;}
    }
    root.querySelector('[data-blocker]').hidden=!root.querySelector('[data-blocker]').textContent;
  }

  // Start from the context the entry point resolved.
  const resolved=resolveWeaponOrderContext({snapshot,combat,state,combatantId:id,selection,user:game.user});
  // What the entry point left open stays a visible question after a default fills it.
  for(const field of resolved.ambiguous)opened.add(field);
  if(resolved.kind)find('kind').value=resolved.kind;
  fillModes(true);
  if(resolved.modeIndex!=null)find('mode').value=String(resolved.modeIndex);
  fillAmmunition();
  if(resolved.ammunitionId)find('ammunitionId').value=resolved.ammunitionId;
  if(resolved.targetUuid&&[...find('targetUuid').options].some(o=>o.value===resolved.targetUuid))find('targetUuid').value=resolved.targetUuid;
  if(resolved.sets!=null){const radio=root.querySelector(`[name=sets][value="${resolved.sets}"]`);if(radio)radio.checked=true;}

  find('kind').addEventListener('change',()=>{fillModes();render();});
  find('mode').addEventListener('change',()=>{fillAmmunition();render();});
  root.addEventListener('change',event=>{if(!['kind','mode'].includes(event.target.name))render();});
  root.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.close!==undefined)return cancel();
    if(button.dataset.open){opened.add(button.dataset.open);render();root.querySelector(`[name="${button.dataset.open}"]`)?.focus();return;}
    if(button.dataset.aimActions)return commit({aimActions:Number(button.dataset.aimActions)});
    if(button.dataset.attackId){const attack=current()?.mode.attacks?.[button.dataset.attackId];return commit({attackId:button.dataset.attackId,...(attack?.traits?.includes('charge')?{sets:0}:{})});}
    if(button.dataset.commit!==undefined)return commit({});
  });
  const onKey=event=>{
    if(!root.isConnected||root.hidden)return;
    if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancel();return;}
    if(['INPUT','SELECT','TEXTAREA'].includes(event.target?.tagName)||event.ctrlKey||event.metaKey||event.altKey)return;
    const index=Number(event.key)-1;
    const buttons=[...root.querySelectorAll('[data-aim-actions],[data-attack-id]:not(:disabled)')].filter(b=>!b.closest('[hidden]')&&(!b.closest('details')||b.closest('details').open));
    if(index>=0&&index<buttons.length){event.preventDefault();event.stopPropagation();buttons[index].click();}
  };
  const hooks=[];
  for(const name of ['canvasTearDown','deleteCombat'])hooks.push([name,Hooks.on(name,doc=>{if(name==='canvasTearDown'||doc?.id===combat.id)cancel();})]);
  window.addEventListener('keydown',onKey,true);
  cancelActive=cancel;
  document.body.append(root);
  render();
  (root.querySelector('[data-field]:not([hidden]) select')??root.querySelector('[data-aim-actions],[data-attack-id]:not(:disabled),[data-commit]:not([hidden])'))?.focus();
  return done;
}
