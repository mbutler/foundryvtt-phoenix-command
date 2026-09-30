import {sightline} from '../rules/impulse-decisions.mjs';
import {actionBalance,movingAimLimit,reservesFinalConfirmation} from '../rules/timing.mjs';
const attacks=new Set(['shot','shotgun','burst','strike','grenade','launcher']);
export function finalOrderLabel(activity){
  if(activity?.effect?.kind==='turn')return 'Finish turn';
  if(activity?.effect?.kind==='posture'){
    const effect=activity.effect;
    const label=effect.field==='braced'?'brace weapon':effect.field==='firingStance'?(effect.after?'firing stance':'hip stance'):effect.field==='looking'?'look over cover':effect.field==='cover'?'duck behind cover':effect.after;
    return `Finish · ${label}`;
  }
  if(activity?.effect?.kind==='unload')return 'Finish unload';
  if(activity?.effect?.kind==='door')return activity.effect.activityId==='kick-door'?'Finish · kick the door open':'Finish · open the door';
  if(activity?.effect?.kind==='item-handling'){
    const {choice,after}=activity.effect;
    return after.selectedModeId!==undefined?'Finish · change fire mode':choice==='set-down'?'Finish · set weapon down':choice==='pick-up'?'Finish · pick weapon up':!after.carried?'Finish · let go':after.equipped?'Finish · ready or put on':'Finish · stow or take off';
  }
  const kind=activity?.weaponPlan?.kind;
  return kind==='strike'?'Strike':kind==='grenade'?'Throw grenade':attacks.has(kind)?'Fire':kind==='reload'?'Finish reload':kind==='recover'?'Finish recovery':kind==='parry'?'Ready parry':'Finish action';
}
export function orderStatus(state,id,{shot=null,targetName=null,targetId=null,reviewed=false}={}){
  const entry=state.entries[id],a=entry?.activity,balance=actionBalance(state,id);
  if(state.pendingEffect)return 'Waiting for GM: finish applying the current action.';
  if(a?.interrupted)return 'Waiting for GM: review interrupted preparation.';
  if(state.reactions?.choices?.[id]===null)return 'Your decision: hold position or duck.';
  if(state.batch)return state.batch.complete?'Impulse resolved. Waiting for the GM to advance.':'Waiting for GM: resolve wounds and knockout checks.';
  if(shot?.status==='rolled')return 'Dice saved. Waiting for GM to resolve simultaneous fire.';
  if(shot?.status==='ready'){
    if(shot.plan?.kind==='burst'&&!shot.arc)return a?.plannedArc&&!a.plannedArcIssue?'Applying the arc chosen with the order.':`Choose the burst arc on the map before reactions.${a?.plannedArcIssue?` ${a.plannedArcIssue}`:''}`;
    if(shot.plan?.kind==='burst'&&!state.reactions)return `Arc saved · ${shot.arc.arcHexes} hexes wide. Ready for reactions.`;
    if(state.reactions?.stage!=='closed')return 'Attack committed. Waiting for reactions to finish.';
    return 'Attack queued for simultaneous resolution.';
  }
  // §5.13 Incapacitation Effects: what he may do while it lasts.
  if(entry?.incapacitation?.effect==='dazed')return 'Dazed: may get to cover and take non-offensive actions at half actions. No attacks.';
  if(entry?.incapacitation?.effect==='disoriented')return 'Disoriented: may flee, take cover or duck. No attacks, and no advancing toward the enemy.';
  // §5.12 Knock Down: what the blow is costing him now.
  if(entry?.knockedDown)return 'Knocked down: falling, no actions this impulse.';
  if(entry?.balanceOwed>0&&!(balance>0))return `Regaining balance: ${entry.balanceOwed} more action${entry.balanceOwed===1?'':'s'} next impulse.`;
  if(state.reactions)return 'Waiting for this impulse’s reactions and fire to resolve.';
  if(a?.catalog?.execution==='manual'&&a.progress>=a.cost)return 'Activity finished. Choose your next action.';
  if(entry?.coverFire&&!(a&&a.progress<a.cost)&&!['ready','rolled'].includes(shot?.status))return `Cover fire on ${entry.coverFire.arc.hexes.length} hex${entry.coverFire.arc.hexes.length===1?'':'es'} · a burst every impulse he has an action. Anyone exposed there is attacked.`;
  if(entry?.pin&&entry.done)return 'Pinning a hex · field of view 10°. A shot at anyone who appears there gets +1 aim.';
  if(entry?.done)return entry.waiting?'Waiting until given an order.':a&&a.progress<a.cost?'Done this impulse · preparation saved.':'Done this impulse.';
  if(entry?.movement?.pending&&!entry.movement.pausedReason&&a?.continuous&&a.progress<a.cost&&!a.interrupted&&!a.holdReason&&['shot','shotgun','burst'].includes(a.weaponPlan?.kind))
    return `Moving and aiming${targetName?` at ${targetName}`:''} · one action of aim each impulse, the rest to the move. Fires when ready.`;
  if(entry?.movement?.pending)return entry.movement.pausedReason?`Movement paused: ${entry.movement.pausedReason}`:entry.movement.automatic!==false?'Moving · continues automatically.':balance>0?'Movement paused · continue when ready.':'Movement paused · actions refresh next impulse.';
  if(a?.catalog?.execution==='manual'&&a.continuous&&!a.interrupted&&!entry?.movement?.pending)return 'Working · continues automatically.';
  if(a&&a.progress<a.cost){
    const exposure=sightline(state,id,targetId)?.status;
    if(exposure==='concealed')return 'Target concealed. Cancel this order and choose another target.';
    if(exposure==='departing')return 'Target leaves at the end of this impulse. Fire with supported aim now, or cancel the order.';
    const remaining=a.cost-a.progress;
    if(remaining===1&&a.holdReason&&reservesFinalConfirmation(a))return `Holding fire: ${a.holdReason} ${finalOrderLabel(a)} anyway, or cancel the order.`;
    if(a.holdReason)return `On hold: ${a.holdReason} Continue when it is fixed, or cancel the order.`;
    const limit=['shot','burst'].includes(a.weaponPlan?.kind)?movingAimLimit(state,id):null;
    if(limit!==null&&a.progress>=limit)return 'Movement limits further aim. Fire now with current aim, or wait until movement no longer limits preparation.';
    if(!(balance>0))return 'Waiting for the next impulse’s actions. Your preparation is saved.';
    // A continuous attack fires when ready; it is held only for a named reason.
    if(remaining===1&&balance>0&&reservesFinalConfirmation(a))return a.continuous?'Fires when ready.':`${finalOrderLabel(a)} when ready. The final action is yours to confirm.`;
    if(a.continuous&&reservesFinalConfirmation(a))return `${targetName?`Aiming at ${targetName}. `:''}Fires when ready; you can change or cancel the order.`;
    if(a.continuous)return `${targetName?`Preparing against ${targetName}. `:''}Preparation continues next impulse; you can change or cancel the order.`;
    return 'Preparation is manual. Invest an action when ready.';
  }
  const dropped=entry?.history?.at(-1);
  if(dropped?.kind==='followUpDropped'&&dropped.phase===state.phase&&dropped.impulse===state.impulse)return `Turned, but the shot could not start: ${dropped.reason} Choose your next order.`;
  if(!entry?.allowance)return entry?.allowanceIssue??'Combat Actions could not be calculated. Open Character to check characteristics and carried equipment.';
  return 'Choose your next order.';
}
