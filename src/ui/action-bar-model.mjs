import {actionBalance,activeMeleeDefence} from '../rules/timing.mjs';
import {earlyFireAction,canPrepareActivity,prepareActionLabel,canCancelActivity,canAbandonShot} from './order-actions.mjs';

// The selected-character bar has two parts. Decisions are what this moment asks of the
// player (react, fire early, finish, cancel); they change with the state. Verbs are the
// fixed row: always the same eight, in the same place, on the same keys, disabled with a
// reason rather than hidden, so nothing has to be hunted for.
export const barVerbs=Object.freeze([
  {kind:'attack',label:'Attack',key:'A'},{kind:'move',label:'Move',key:'M'},{kind:'turn',label:'Turn',key:'T'},
  {kind:'reload',label:'Reload',key:'R'},{kind:'posture',label:'Posture',key:'P'},{kind:'defend',label:'Defend',key:'D'},
  {kind:'more',label:'More',key:'O'},{kind:'done',label:'Done',key:'N'}]);
export const menuVerbs=new Set(['posture','defend','more']);

// `consciousness` is his sheet's: a man who is out is offered nothing the coordinator would
// refuse. He is held automatically when reactions open, so he has no decisions at all.
export function barDecisions(state,id,{shot=null,targetId=null,consciousness='conscious',pinnedTargets=[]}={}){
  const entry=state.entries?.[id],a=entry?.activity;
  if(!entry?.allowance||!state.phase||state.pendingEffect||state.batch)return [];
  if(consciousness!=='conscious')return [];
  if(state.reactions?.choices?.[id]===null)return [{kind:'hold',label:'Hold position'},{kind:'duck',label:['shot','burst'].includes(a?.weaponPlan?.kind)&&a.progress<a.cost?'Duck · lose aim':'Duck'}];
  if(state.reactions||activeMeleeDefence(state,id))return [];
  // §5.9: pinning, he fires at whoever appears in the hex; stopping the pin ends the wait.
  if(entry.done)return [...(entry.pin?pinnedTargets.map(t=>({kind:`pinFire:${t.id}`,label:`Fire at ${t.name} · pinned`})):[]),
    {kind:'resumeOrders',label:entry.pin?'Stop pinning':entry.waiting?'Stop waiting':'Change actions'}];
  const decisions=[];
  if(shot?.status==='ready'&&shot.plan?.kind==='burst')decisions.push({kind:'designateArc',label:shot.arc?'Change burst arc':'Choose burst arc'});
  const early=earlyFireAction(state,id,{targetId});
  if(early)decisions.push(early);
  if(a&&a.progress<a.cost&&canPrepareActivity(state,id,{targetId}))decisions.push({kind:'work',label:prepareActionLabel(state,id)});
  if(entry.coverFire)decisions.push({kind:'stopCoverFire',label:'Stop cover fire'});
  if(canCancelActivity(state,id,{shot}))decisions.push({kind:'cancel',label:'Cancel order'});
  else if(canAbandonShot(state,id,{shot}))decisions.push({kind:'abandonShot',label:'Abandon shot'});
  if(entry.movement?.pending){
    if(actionBalance(state,id)>0)decisions.push({kind:'move',label:'Continue move'});
    decisions.push({kind:'moveSplit',label:'Split movement'},{kind:'abandonMove',label:'Cancel movement'});
  }
  return decisions;
}

// `options` says what the character's equipment makes possible: reload and posture rows,
// a melee weapon to parry with, a strapped shield to cover up with.
export function barVerbState(state,id,{shot=null,reload=0,reloadReason=null,posture=0,parry=false,shield=false,consciousness='conscious'}={}){
  const entry=state.entries?.[id],a=entry?.activity;
  const blocked=consciousness!=='conscious'?'Not conscious.':(!entry?.allowance?(entry?.allowanceIssue??'Combat Actions are unavailable.')
    :!state.phase?'The encounter has not started.'
    :state.pendingEffect||state.batch?'Waiting for the GM.'
    :state.reactions?'Reactions are in progress.'
    :activeMeleeDefence(state,id)?`${activeMeleeDefence(state,id).label} this impulse.`
    :entry.done?(entry.waiting?'Waiting until given an order. Stop waiting to act.':'Done this impulse. Change actions to act again.'):null);
  const queued=['ready','rolled'].includes(shot?.status);
  const unfinished=!!a&&a.progress<a.cost;
  const moving=!!entry?.movement?.pending;
  const busy=queued?'Your attack is queued.':unfinished?'Finish or cancel the current order.':moving?'Finish or cancel the move.':null;
  const turning=a?.effect?.kind==='turn'&&unfinished;
  const noActions=!(actionBalance(state,id)>0)?'No actions left this impulse.':null;
  const reason={
    // §2.2: aiming while moving is allowed; a route leaves the aim one action an impulse.
    attack:blocked??(['dazed','disoriented'].includes(entry?.incapacitation?.effect)?`${entry.incapacitation.effect==='dazed'?'Dazed':'Disoriented'}: no offensive action.`:null)??(queued?busy:unfinished?'Finish or cancel the current order.':null),
    move:blocked??(queued?busy:turning?'Finish or cancel the turn.':noActions),
    turn:blocked??busy,
    reload:blocked??busy??(reload?null:(reloadReason||'No reload for your equipped weapons and ammunition.')),
    posture:blocked??busy??(posture?null:'No posture change is available.'),
    defend:blocked??busy??(parry||!entry?.spent?null:'Nothing to defend with this impulse.'),
    more:null,
    done:blocked??(queued?busy:null)};
  return barVerbs.map(verb=>({...verb,enabled:!reason[verb.kind],reason:reason[verb.kind]??null,
    ...(verb.kind==='defend'?{items:[...(parry?['parry']:[]),...(!entry?.spent?['dodge']:[]),...(!entry?.spent&&shield?['coverUp']:[])]}:{})}));
}
