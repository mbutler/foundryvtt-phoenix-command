import {changeDecision,sightline} from '../rules/impulse-decisions.mjs';
import {actionBalance,activeMeleeDefence,movingAimLimit,reservesFinalConfirmation} from '../rules/timing.mjs';
import {finalOrderLabel} from './order-status.mjs';

// An aimed attack runs alongside a route (§2.2 mixing), so it can be fired early or cancelled
// mid-hex like any other time.
const aimedWhileMoving=a=>['shot','shotgun','burst'].includes(a?.weaponPlan?.kind);

export function earlyFireAction(state,id,{targetId=null}={}){
  const entry=state.entries[id],a=entry?.activity;
  if(!a?.weaponPlan||a.interrupted||(entry.movement?.pending&&!aimedWhileMoving(a))||sightline(state,id,targetId)?.status==='concealed')return null;
  try{
    changeDecision(state,{kind:'fireNow',combatantId:id,expectedRevision:state.revision},{
      aimModifiers:a.weaponPlan.weaponBefore?.firearmModes?.[a.weaponPlan.modeId]?.aimModifiers,
      preparation:a.weaponPlan.preparationActions??0
    });
    const exposure=sightline(state,id,targetId)?.status;
    return {kind:'fireNow',label:exposure==='departing'?'Fire before target leaves':'Fire with current aim'};
  }catch{return null;}
}

export function canPrepareActivity(state,id,{targetId=null}={}){
  const entry=state.entries[id],a=entry?.activity;
  if(!a||a.progress>=a.cost||a.interrupted||entry.movement?.pending||state.reactions||state.batch||state.pendingEffect)return false;
  if(!(actionBalance(state,id)>0))return false;
  if(sightline(state,id,targetId)?.status==='concealed')return false;
  const limit=['shot','burst'].includes(a.weaponPlan?.kind)?movingAimLimit(state,id):null;
  return limit===null||a.progress<limit;
}

export function prepareActionLabel(state,id){
  const a=state.entries[id]?.activity;
  if(!a)return 'Prepare · 1 action';
  return a.cost-a.progress===1&&reservesFinalConfirmation(a)?finalOrderLabel(a):'Prepare · 1 action';
}

export function canRollShot(state,id,{shot,reviewed=false}={}){
  if(!shot||shot.status!=='ready'||!reviewed)return false;
  if(state.pendingEffect||state.batch)return false;
  if(state.reactions&&state.reactions.stage!=='closed')return false;
  return true;
}

export function canCancelActivity(state,id,{shot=null}={}){
  const entry=state.entries[id],a=entry?.activity;
  if(!a||a.interrupted||state.reactions||state.batch||state.pendingEffect)return false;
  if(entry.movement?.pending&&!aimedWhileMoving(a))return false;
  if(shot&&['ready','rolled'].includes(shot.status))return false;
  return a.progress<a.cost;
}

export function canAbandonShot(state,id,{shot=null}={}){
  if(!shot||!['ready','rolled'].includes(shot.status))return false;
  if(state.pendingEffect||state.batch)return false;
  if(state.reactions&&state.reactions.stage!=='closed')return false;
  return true;
}
