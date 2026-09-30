import {activityBegan,reservesFinalConfirmation,actionBalance,activeMeleeDefence,movingAimReserve} from './timing.mjs';
import {sightline} from './impulse-decisions.mjs';

// Fire when ready (user ruling, 27 September 2026). An attack whose preparation is paid
// fires without a further click; the coordinator pays its final action through the same
// command the Fire button sends, so every rule check still runs. It holds fire, and names
// why, only when something the shooter would reconsider has changed. Other changes (the
// target left the Field of Fire, the gun was unloaded) surface as that command's refusal.
const at=({phase,impulse})=>(phase-1)*4+impulse;

// Whether the coordinator should try to fire this combatant's attack now.
export function readyToFire(state,id){
  const entry=state.entries?.[id],a=entry?.activity;
  if(state.pendingEffect||state.reactions||state.batch)return false;
  if(!a?.continuous||!reservesFinalConfirmation(a)||a.interrupted||a.shotId)return false;
  // While moving, the final action of aim is taken from the action the route leaves for it.
  if(a.progress!==a.cost-1||(entry.movement?.pending&&!movingAimReserve(state,id))||entry.done)return false;
  return !activeMeleeDefence(state,id)&&actionBalance(state,id)>0;
}

// A reason to hold fire that the command itself would not refuse, or null.
export function holdFireReason(state,id,{condition,injuries={},combatUuid,targetId=null}={}){
  if(condition?.consciousness&&condition.consciousness!=='conscious')return 'No longer conscious.';
  // §5.13 (optional): dazed or disoriented, no offensive action.
  const effect=state.entries?.[id]?.incapacitation?.effect;
  if(effect==='dazed'||effect==='disoriented')return `${effect==='dazed'?'Dazed':'Disoriented'}: incapable of offensive action.`;
  const since=activityBegan(state,id)??{phase:state.phase,impulse:state.impulse};
  const wounded=Object.values(injuries).some(i=>i?.status==='active'&&i.combatUuid===combatUuid&&Number.isSafeInteger(i.phase)&&at(i)>=at(since));
  if(wounded)return 'Wounded while aiming.';
  if(targetId&&sightline(state,id,targetId)?.status==='concealed')return 'The target is out of sight.';
  return null;
}
