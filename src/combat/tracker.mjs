import {fillImpulseControls} from '../ui/impulse-controls.mjs';
import {rowNotes,historyDetail,shotChip,sightlineChip,currentOrder} from '../ui/tracker-row-text.mjs';
import {activityTimer} from '../ui/activity-timer.mjs';
import {selectTurn} from '../ui/turn.mjs';
import {orderStatus} from '../ui/order-status.mjs';
import {reusableShotConditions} from '../foundry/shot-conditions.mjs';
import {buildSavedShotApplication,applySavedShotApplication} from '../application/saved-shot-resolution.mjs';
import {chooseSightline,reconcileInterruption} from '../ui/impulse-decisions.mjs';
import {sightline,exposureInterval,observersStillSeeing,duckedThisOrder} from '../rules/impulse-decisions.mjs';
import {reviewShot,openSavedShot} from '../ui/shot-review.mjs';
import {reviewBurst} from '../ui/burst-review.mjs';
import {pickBurstArc} from '../ui/burst-arc.mjs';
import {submitPlayerIntent,coordinatorStatus,awaitIntentReceipt} from '../application/player-intents.mjs';
import {actionBalance,actionSchedule,activeMeleeDefence,timingSource,hexesInPhase,movedThisPhase} from '../rules/timing.mjs';
import {selectActionAllowance} from '../ui/action-allowance.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {selectActivity} from '../ui/activity-selector.mjs';
import {openCombatWeaponOrder} from '../ui/weapon-order.mjs';
import {selectHexMove} from '../ui/hex-move.mjs';
import {confirmAbandonEffect} from '../ui/abandon-effect.mjs';
import {parryOptions} from '../foundry/strike-review.mjs';
import {parryChoiceMarkup,readParryChoice,keepParryTicks,forgetParryTicks} from '../ui/parry-choice.mjs';
export class PhoenixCombatTracker extends foundry.applications.sidebar.tabs.CombatTracker {
  _getCombatContextOptions(){return super._getCombatContextOptions().filter(option=>option.label!=='COMBAT.InitiativeReset');}
  _getEntryContextOptions(){return super._getEntryContextOptions().filter(option=>!['COMBATANT.ACTIONS.Clear','COMBATANT.ACTIONS.Reroll'].includes(option.label));}
  async _onRender(context,options){
    // v14.368 can render the viewed tracker for an update to another encounter.
    // Its base handler assumes an array always contains the viewed Combat.
    if(options.renderContext==='updateCombat'&&Array.isArray(options.renderData)&&!options.renderData.some(d=>d._id===this.viewed?.id))options={...options,renderData:null};
    await super._onRender(context,options);
    const combat=this.viewed;if(!combat)return;
    let state;try{state=combat.timing;}catch(error){ui.notifications.warn(error.message);return;}
    this.element.querySelectorAll('[data-action="rollAll"],[data-action="rollNPC"],.token-initiative').forEach(el=>el.remove());
    const title=this.element.querySelector('.encounter-title');
    if(title)title.textContent=state.phase?`Phase ${state.phase} · Impulse ${state.impulse} / 4`:'Phoenix Command · Not started';
    for(const row of this.element.querySelectorAll('[data-combatant-id]')){
      row.querySelector('.pc-impulse-entry')?.remove();
      const id=row.dataset.combatantId,combatant=combat.combatants.get(id);
      if(!combatant||(!game.user.isGM&&!combatant.actor?.testUserPermission(game.user,'OWNER')))continue;
      const entry=state.entries[id],remaining=actionBalance(state,id),activity=entry?.activity,defence=activeMeleeDefence(state,id);
      const last=entry?.history.findLast(h=>h.kind==='work'&&h.status==='active');
      const canUndo=last&&last.phase===state.phase&&last.impulse===state.impulse&&last.activityId===activity?.id&&last.after===activity.progress&&!((activity?.effect||activity?.weaponPlan)&&activity.progress===activity.cost);
      const unfinished=activity&&activity.progress<activity.cost;
      const movement=entry?.movement,partHex=movement?.pending??null;
      const reaction=state.reactions?.choices?.[id],target=combat.targetFor(activity?.weaponPlan),exposure=target?sightline(state,id,target.id):null;
      const shot=activity?.shotId?combat.getFlag('phoenix-command',`shots.${activity.shotId}`):null;
      const progress=activity?.cost?Math.min(100,Math.round(activity.progress/activity.cost*100)):0;
      const shown=currentOrder(state,id,shot);
      const actionLabel=entry?.allowance?'Actions this impulse':'Cannot calculate actions';
      const aimAtRisk=reaction===null&&unfinished&&['shot','burst'].includes(activity.weaponPlan?.kind);
      const interval=exposure?exposureInterval(state,id,target.id):null;
      const {notes,sources}=rowNotes({spent:entry?.spent??0,partHex,movedHexes:state.phase&&movedThisPhase(state,id)?hexesInPhase(state,id):null,
        reactionPending:reaction===null,unfinished,aimAtRisk,
        sightline:exposure?{targetName:target.name,status:exposure.status,interval:interval?.from?interval:null}:null,
        ducking:reaction==='duck',
        duckedViewers:duckedThisOrder(activity)?observersStillSeeing(state,id).map(observer=>combat.combatants.get(observer)?.name??observer):null,
        interrupted:!!activity?.interrupted,allowance:entry?.allowance,schedule:entry?.allowance?actionSchedule(entry.allowance):[],
        allowanceSource:entry?.allowanceSource?.source,combatMode:entry?.combatMode,reason:entry?.reason,pendingCombatMode:entry?.pendingCombatMode,
        timingSource,catalogSource:activity?.catalog?.source});
      const nextStep=orderStatus(state,id,{shot,targetName:target?.name,targetId:target?.id,reviewed:!!(shot?.adjudication||shot&&reusableShotConditions(combat,shot))});
      const shotLabel=shot&&shown?shotChip(shot.status):null,sightLabel=exposure?sightlineChip(exposure.status):null;
      const box=document.createElement('div');box.className='pc-impulse-entry';
      box.innerHTML=`<div class="pc-combat-readout" ${activityTimer(state,id)?'hidden':''}><strong class="pc-action-value" aria-label="${e(String(remaining??'unknown'))} actions remaining this impulse">${remaining??'—'}</strong><div class="pc-action-meta"><strong>${e(actionLabel)}</strong>${shown?`<span>${e(shown.label)} · ${shown.progress}/${shown.cost}</span>`:defence?`<span>${e(defence.label)}</span>`:''}${shown?`<div class="pc-progress" aria-label="${progress}% complete"><span style="width:${progress}%"></span></div>`:''}</div></div>${activityTimer(state,id)}<p class="pc-next-step">${e(nextStep)}</p><div class="pc-combat-status">${defence?`<span class="pc-chip" data-tone="warn">${e(defence.label)} · PARRY ${defence.parryColumn}</span>`:''}${partHex?`<span class="pc-chip" data-tone="warn">ENTERING HEX ${partHex.progress}/${partHex.cost}</span>`:''}${shotLabel?`<span class="pc-chip" ${shotLabel.tone?`data-tone="${shotLabel.tone}"`:''}>${e(shotLabel.label)}</span>`:''}${reaction!==undefined?`<span class="pc-chip" data-tone="${reaction===null?'warn':reaction==='duck'?'danger':'good'}">${reaction===null?'REACTION REQUIRED':reaction==='duck'?'DUCKING':'HOLDING'}</span>`:''}${sightLabel?`<span class="pc-chip" data-tone="${sightLabel.tone}">${e(sightLabel.label)}</span>`:''}${activity?.interrupted?'<span class="pc-chip" data-tone="danger">INTERRUPTED</span>':''}${aimAtRisk?'<span class="pc-chip" data-tone="warn">DUCK DROPS AIM</span>':''}</div>
        ${shot?.status==='ready'&&shot.plan?.kind==='burst'&&!state.reactions?`<button type="button" data-timing="designateArc">${shot.arc?'Change burst arc':'Choose burst arc'}</button>`:''}
        ${game.user.isGM&&state.phase&&!state.reactions&&!state.batch&&!state.pendingEffect&&(entry?.waiting||!(activity&&activity.progress<activity.cost))?`<div class="pc-timing-actions"><button type="button" data-timing="${entry?.waiting?'stopWaiting':'wait'}">${entry?.waiting?'Stop waiting':'Wait'}</button></div>`:''}
        ${reaction===null?`${parryChoiceMarkup(parryOptions(combat,id),{scope:id})}<div class="pc-timing-actions"><button type="button" data-timing="hold">Hold</button><button type="button" data-timing="duck">Duck</button></div>`:''}
        ${game.user.isGM?`<div class="pc-timing-actions">${activity?.interrupted?'<button type="button" data-timing="reconcileInterruption">Resolve interruption</button>':''}</div>
        <details><summary>GM adjustments</summary><div class="pc-timing-actions"><button type="button" data-timing="allowance">Override actions</button>${state.phase?'<button type="button" data-timing="sightline">Sightline</button>':''}${canUndo?'<button type="button" data-timing="undoWork">Undo last action</button>':''}</div></details>`:''}
        <details><summary>Details & history</summary>${notes.map(note=>`<p>${e(note)}</p>`).join('')}${(entry?.history??[]).map(h=>`<p>P${h.phase} I${h.impulse} · ${e(h.label)} · ${e(historyDetail(h))}</p>`).join('')}</details>
        ${game.user.isGM&&sources.length?`<details><summary>Sources & derivation</summary>${sources.map(note=>`<p>${e(note)}</p>`).join('')}</details>`:''}`;
      box.dataset.reactionFor=id;keepParryTicks(box);
      box.addEventListener('click',event=>event.stopPropagation());
      box.querySelectorAll('[data-timing]').forEach(button=>button.addEventListener('click',()=>this.command(combat,state,id,button.dataset.timing,button)));
      if(state.batch||!coordinatorStatus().accepting)box.querySelectorAll('[data-timing]').forEach(button=>button.disabled=true);
      row.append(box);
    }
    const footer=this.element.querySelector('.combat-controls');
    if(footer){
      footer.classList.add('pc-impulse-footer');
      fillImpulseControls(footer,combat,{command:this.command.bind(this)});
    }
  }
  async command(combat,state,id,kind,button){
    button.disabled=true;
    try{
      let fields={};
      if(kind==='sightline'){fields=await chooseSightline(combat,id,state);if(!fields)return;}
      if(kind==='reconcileInterruption'){fields=await reconcileInterruption(state.entries[id].activity);if(!fields)return;}
      if(kind==='abandonEffect'){fields=await confirmAbandonEffect(combat,state.pendingEffect);if(!fields)return;}
      if(['hold','duck'].includes(kind)){
        fields.choice=kind;kind='react';
        const holder=button.closest?.('[data-reaction-for]'),parries=holder?readParryChoice(holder,id):undefined;
        if(parries)fields.parries=parries;
        forgetParryTicks(id);
      }
      if(kind==='openShot'){
        const saved=combat.getFlag('phoenix-command',`shots.${state.entries[id]?.activity?.shotId}`);
        if(saved?.status==='rolled'&&saved.plan.kind!=='shot'){
          const prepared=await buildSavedShotApplication(combat,saved);
          await applySavedShotApplication(prepared);
          return;
        }
        await openSavedShot(combat,id);return;
      }
      if(kind==='designateArc'){
        const shot=combat.getFlag('phoenix-command',`shots.${state.entries[id]?.activity?.shotId}`);
        if(!shot||shot.status!=='ready'||shot.plan.kind!=='burst')throw new Error('Finish declaring the burst first.');
        await pickBurstArc({combat,shot,onConfirm:async fields=>{
          const command={kind,combatantId:id,expectedRevision:state.revision,id:foundry.utils.randomID(),...fields};
          if(game.user.isGM)await combat.timingCommand(command);else{const message=await submitPlayerIntent(combat,command);const receipt=await awaitIntentReceipt(combat,message.id);if(receipt?.status!=='accepted')throw new Error(receipt?.reason??'The arc was not accepted.');}
        }});
        return;
      }
      if(kind==='reviewShot'){
        const plan=state.entries[id]?.activity?.weaponPlan;
        fields.choices=plan?.kind==='burst'&&!plan.explosive?await reviewBurst(combat,id):await reviewShot(combat,id);
        if(!fields.choices)return;
      }
      if(kind==='wait'||kind==='stopWaiting'){fields={done:kind==='wait',...(kind==='wait'?{wait:true}:{})};kind='done';}
      if(kind==='dodge'){fields={defence:'dodge'};kind='meleeDefence';}
      if(kind==='coverUp'){
        const eligible=Array.from(combat.combatants.get(id)?.actor?.items??[]).filter(item=>
          item.type==='shield'&&item.system.carried&&item.system.equipped&&item.system.strapped&&item.system.partialParry>=5);
        if(!eligible.length)throw new Error('Cover Up requires an equipped, strapped Round-or-larger shield.');
        let shieldItemId=eligible[0].id;
        if(eligible.length>1){
          const answer=await foundry.applications.api.DialogV2.prompt({window:{title:'Choose shield for Cover Up'},
            content:`<label>Shield<select name="shield">${eligible.map(item=>`<option value="${e(item.id)}">${e(item.name)} · partial parry ${item.system.partialParry}</option>`).join('')}</select></label>`,
            ok:{label:'Cover Up',callback:(event,button,dialog)=>dialog.element.querySelector('[name=shield]').value},rejectClose:false});
          if(!answer)return;
          shieldItemId=answer;
        }
        fields={defence:'coverUp',shieldItemId};kind='meleeDefence';
      }
      if(kind==='move'||kind==='moveSplit'){fields=await selectHexMove(combat,state,id,{split:kind==='moveSplit'});if(!fields)return;kind='move';}
      else if(kind==='turn'){fields=await selectTurn(combat,id);if(!fields)return;kind='activity';}
      else if(kind==='weaponActivity'){
        await openCombatWeaponOrder(combat,id);return;
      }else if(kind==='activity'){
        fields=await selectActivity(state,id,combat.combatants.get(id)?.actor);if(!fields)return;
      }else if(kind==='allowance'){
        fields=await selectActionAllowance(combat,state,id);if(!fields)return;
      }
      const command={kind,combatantId:id,expectedRevision:state.revision,id:foundry.utils.randomID(),...fields};
      if(game.user.isGM)await combat.timingCommand(command);
      else await submitPlayerIntent(combat,command);
    }catch(error){ui.notifications.warn(error.message);}finally{button.disabled=false;}
  }
}
