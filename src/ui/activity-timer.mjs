import {projectActivity} from '../rules/activity-projection.mjs';
import {actionBalance} from '../rules/timing.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
export function activityTimer(state,id){
  const entry=state.entries[id],a=entry?.activity;
  if(!a||a.catalog?.execution!=='manual'||a.progress>=a.cost)return '';
  let finish='Paused';
  if(a.continuous&&!a.interrupted&&!entry.movement?.pending){
    try{
      const end=projectActivity({allowance:entry.allowance,phase:state.phase,impulse:state.impulse,
        remaining:actionBalance(state,id),cost:a.cost,invested:a.progress});
      finish=`Finishes: Phase ${end.phase}, Impulse ${end.impulse}`;
    }catch{finish='Finish time unavailable';}
  }else if(!a.continuous)finish='Manual progress';
  return `<div class="pc-activity-timer"><strong>${e(a.label)}</strong><progress max="${a.cost}" value="${a.progress}" aria-label="Activity progress"></progress><span>${e(finish)}</span></div>`;
}
