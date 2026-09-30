import {weaponActivity} from '../rules/weapon-timing.mjs';
import {projectActivity} from '../rules/activity-projection.mjs';
import {actionBalance} from '../rules/timing.mjs';
import {needsTarget} from './weapon-order-options.mjs';

// Kinds whose timing choice is aim: each supported aim time is one committable option.
export const aimedKinds=Object.freeze(['shot','threeRound','shotgun','burst','grenade','launcher']);
export const commitLabels=Object.freeze({reload:'Start reloading',recover:'Start recovery',parry:'Ready parry'});

// When the order finishes, as the player reads it on the clock.
export function finishLabel(end,now){
  if(end.phase===now.phase&&end.impulse===now.impulse)return 'now';
  return end.phase===now.phase?`I${end.impulse}`:`P${end.phase} I${end.impulse}`;
}

// One option per printed aim time, cheapest first, with its cost and finish impulse.
// An option the rules refuse is kept with its reason so the strip explains itself.
// `extraCost` is work done first, such as turning to face the target.
export function aimChoices(snapshot,state,combatantId,request,{extraCost=0}={}){
  const row=snapshot.items.find(i=>i.id===request.weaponId)?.system.firearmModes?.[request.modeId];
  const aims=Object.keys(row?.aimModifiers??{}).map(Number).filter(n=>Number.isSafeInteger(n)&&n>0).sort((a,b)=>a-b);
  const entry=state.entries[combatantId],now={phase:state.phase,impulse:state.impulse};
  return aims.map(aimActions=>{
    const modifier=row.aimModifiers[String(aimActions)];
    try{
      const plan=weaponActivity(snapshot,{...request,aimActions});
      if(!entry?.allowance)throw new Error('Combat Actions are not available.');
      const end=projectActivity({allowance:entry.allowance,phase:state.phase,impulse:state.impulse,remaining:actionBalance(state,combatantId),cost:plan.cost+extraCost});
      return {aimActions,modifier,cost:plan.cost+extraCost,finishes:finishLabel(end,now),end};
    }catch(error){return {aimActions,modifier,blocked:error.message};}
  });
}

// A field is a choice to make when the context could not settle it, a chip the player may
// open when there are alternatives, and plain context when there is only one answer.
export function fieldPresentation({resolved,counts,opened=[]}){
  const show={};
  for(const field of ['kind','mode','ammunitionId','targetUuid']){
    const count=counts[field]??0;
    const unresolved=resolved.ambiguous.includes(field);
    show[field]=count===0?'hidden':unresolved||opened.includes(field)?'choose':count>1?'chip':'fixed';
  }
  if(!needsTarget(resolved.kind)||resolved.kind==='burst')show.targetUuid='hidden';
  if(['strike','parry','recover'].includes(resolved.kind))show.ammunitionId='hidden';
  return show;
}
