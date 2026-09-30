import {nextDecisionImpulse} from './impulse-decisions.mjs';
// Small Arms Combat System: sections 2.1–2.2 (PDF 15–16), table 1E (PDF 60).
// Visually checked against the supplied scan, 2026-09-20. Allowance derivation is separate.
import {quoteActivity} from './activity-cost.mjs';
import {quoteHexStep,facingChangeCost,movingAimCap} from './movement.mjs';
export const timingSource='Small Arms §2.1–2.2, PDF 15–16; Table 1E, PDF 60 · visual check';
// Rows 22–24 use the Phoenix Functions continuation approved 2026-09-25; printed Table 1E ends at 21.
const schedules=[null,[1,0,0,0],[1,0,1,0],[1,0,1,1],[1,1,1,1],[2,1,1,1],[2,1,2,1],[2,1,2,2],[2,2,2,2],[3,2,2,2],[3,2,3,2],[3,2,3,3],[3,3,3,3],[4,3,3,3],[4,3,4,3],[4,3,4,4],[4,4,4,4],[5,4,4,4],[5,4,5,4],[5,4,5,5],[5,5,5,5],[6,5,5,5],[6,6,5,5],[6,6,6,5],[6,6,6,6]];
export function actionSchedule(allowance){
  if(!Number.isInteger(allowance)||allowance<1||allowance>24)throw new Error('Small-arms allowance must be a whole number from 1 to 24 (Table 1E and approved library continuation).');
  return [...schedules[allowance]];
}
export const TIMING_VERSION=2;
export const initialTiming=()=>({version:TIMING_VERSION,phase:0,impulse:0,revision:0,clockRevision:0,entries:{},batch:null});
// Version 1 stored a GM-supplied allowance with a free-text reason and had no impulse
// batch. Version 2 adds allowance provenance and the batch record. A version-1 allowance
// is adjudicated by definition: never relabel an old manual value as derived.
export function migrateTiming(state){
  if(!state||!Number.isInteger(state.version))throw new Error('Unreadable timing record.');
  if(state.version===TIMING_VERSION)return state;
  if(state.version!==1)throw new Error(`Unsupported timing record version ${state.version}.`);
  const next=structuredClone(state);
  next.version=TIMING_VERSION;
  next.batch=null;
  for(const entry of Object.values(next.entries))
    if(entry.allowance!==null&&entry.allowance!==undefined&&!entry.allowanceSource)
      entry.allowanceSource={source:'adjudicated',reason:entry.reason??'',migratedFrom:1};
  return next;
}
export function elapsedSeconds(state){return state.phase===0?0:((state.phase-1)*4+state.impulse-1)*0.5;}
export function actionBalance(state,id){
  const entry=state.entries[id];
  if(!state.phase||!entry?.allowance)return null;
  return actionSchedule(entry.allowance)[state.impulse-1]-entry.spent;
}

const impulseNumber=(phase,impulse)=>(phase-1)*4+impulse;
export function activeMeleeDefence(state,id,phase=state?.phase,impulse=state?.impulse){
  const defence=state?.entries?.[id]?.meleeDefence;
  if(!defence||!Number.isSafeInteger(phase)||!Number.isSafeInteger(impulse)||phase<1||impulse<1)return null;
  const now=impulseNumber(phase,impulse);
  return now>=defence.fromNumber&&now<=defence.throughNumber?defence:null;
}

// Section 2.2 (PDF 16): a combatant who needs more than one impulse "simply applies
// whatever Actions he has to the activity, and continues applying them each Impulse
// until he has enough". Re-declaring that each impulse is bookkeeping, not a decision,
// so an activity marked continuous draws its own actions when the clock advances.
//
// Attacks keep their final action out of this automatic spending: completing paid aim
// creates a shot, which the coordinator does through the Fire command when the attack is
// ready (fire when ready, user ruling 27 September 2026, rules/fire-when-ready.mjs), so every
// check runs and a changed situation can hold fire. Routine completions whose outcome was
// already chosen at commit — reload, recover, parry, posture, turn, unload — finish here.
export function reservesFinalConfirmation(activity){
  return ['shot','shotgun','burst','grenade','launcher','strike'].includes(activity?.weaponPlan?.kind);
}

export function continueUnchangedWork(state,combatantIds=null){
  for(const [id,entry] of Object.entries(state.entries)){
    if(combatantIds&&!combatantIds.includes(id))continue;
    const activity=entry.activity;
    if(activity?.interrupted||activity?.holdReason||!activity?.continuous||activity.progress>=activity.cost)continue;
    if(activeMeleeDefence(state,id))continue;
    // A combatant part-way into a hex is mid-movement, and section 2.2 caps how much aim he
    // may hold while moving - so the impulse's actions are his to split, not ours to spend
    // for him. Each hex also needs a fresh direction and stance, which is never "unchanged
    // work" in the sense this function automates.
    const reserve=entry.movement?.pending?movingAimReserve(state,id):Infinity;
    if(!reserve)continue;
    const balance=actionBalance(state,id);
    if(!(balance>0))continue;
    const outstanding=activity.cost-activity.progress-(reservesFinalConfirmation(activity)?1:0);
    const aimLimit=['shot','burst'].includes(activity.weaponPlan?.kind)?movingAimLimit(state,id):null;
    const spend=Math.min(balance,outstanding,reserve,aimLimit===null?Infinity:Math.max(0,aimLimit-activity.progress));
    if(spend<1)continue;
    const before=activity.progress;
    activity.progress+=spend;entry.spent+=spend;
    entry.history.push({kind:'work',activityId:activity.id,label:activity.label,phase:state.phase,impulse:state.impulse,
      before,after:activity.progress,status:'active',continued:true});
  }
}


// Movement is paid per hex entered (Table 7A), not worked toward a completion effect, so
// it occupies its own slot rather than the single activity slot. Section 2.2 permits
// mixing non-exclusive actions, and a hex of movement alongside an action of aim is the
// section's own example - both draw on the same impulse balance, which is the only budget.
//
// These fields are additive and optional: an entry written before this increment has no
// `movement` key and keeps its meaning, so no timing migration is needed.
const impulseKey=state=>`${state.phase}-${state.impulse}`;
const movementRecord=entry=>entry.movement??={pending:null,spent:{},hexes:{}};
// A record written before this increment, or a Combat with no timing at all, simply has no
// movement to report: that reads as stationary, which is what it was.
export function hexesEntered(state,id,phase=state?.phase,impulse=state?.impulse){
  return state?.entries?.[id]?.movement?.hexes?.[`${phase}-${impulse}`]??0;
}
export function isMoving(state,id,phase=state?.phase,impulse=state?.impulse){
  return (state?.entries?.[id]?.movement?.spent?.[`${phase}-${impulse}`]??0)>0;
}
// Whether a combatant has moved at all this phase, which is what makes him a moving
// shooter: §2.5's firing stance lasts "until he moves", and under D17 speed itself is a
// per-phase figure. This is deliberately not the same question as how fast he is going -
// a combatant part-way into an expensive hex has moved but has entered no hex yet.
export function movedThisPhase(state,id,phase=state?.phase){
  const spent=state?.entries?.[id]?.movement?.spent??{};
  for(let impulse=1;impulse<=4;impulse++)if((spent[`${phase}-${impulse}`]??0)>0)return true;
  return false;
}
// When this combatant's current unbroken run of movement began. Section 2.4 starts an
// exposure "from the beginning of the Impulse they begin an action which exposes them", so
// a hex still being paid for exposes its mover from the impulse he started paying, not from
// the impulse someone noticed. Null when he is not moving in the impulse asked about.
export function movementBegan(state,id,phase=state?.phase,impulse=state?.impulse){
  const spent=state?.entries?.[id]?.movement?.spent??{};
  const moving=(p,i)=>(spent[`${p}-${i}`]??0)>0;
  if(!Number.isInteger(phase)||!Number.isInteger(impulse)||!moving(phase,impulse))return null;
  let began={phase,impulse};
  for(;;){
    const impulseBefore=began.impulse===1?4:began.impulse-1;
    const phaseBefore=began.impulse===1?began.phase-1:began.phase;
    if(phaseBefore<1||!moving(phaseBefore,impulseBefore))return began;
    began={phase:phaseBefore,impulse:impulseBefore};
  }
}
// When the combatant's current activity first took an action. Section 2.4's own example is
// a man who steps out around a corner, and the step is what exposes him - so an exposure
// caused by an activity begins when that activity did, not when it finishes.
export function activityBegan(state,id){
  const entry=state?.entries?.[id],activity=entry?.activity;
  if(!activity)return null;
  const first=entry.history.find(record=>record.kind==='work'&&record.activityId===activity.id&&record.status==='active');
  return first?{phase:first.phase,impulse:first.impulse}:null;
}
// Table 4D is entered with hexes per PHASE, so this is the speed a shot reads. A shot
// fired part-way through a phase can only count the hexes entered so far in it; the rest
// of the phase has not happened.
export function hexesInPhase(state,id,phase=state?.phase){
  const hexes=state?.entries?.[id]?.movement?.hexes??{};
  let total=0;
  for(let impulse=1;impulse<=4;impulse++)total+=hexes[`${phase}-${impulse}`]??0;
  return total;
}

// Section 2.2, PDF 11: "a character may only use a maximum of 1 Impulse worth of aim if he
// is moving", ruled at this table as the allotment of the impulse he fires in. Paying
// toward a hex counts as moving even before the hex is entered; the per-phase hex count is
// the separate figure Table 4D reads as speed, and can still be zero while he is moving.
// The cap follows the same per-phase notion of moving that the shot will use, so a
// combatant cannot bank aim in a later impulse of a phase he has already moved in and then
// be refused at the trigger. The ceiling itself is the current impulse's allotment, which
// is the most the shooter can know while he is still spending.
export function movingAimLimit(state,id){
  if(!movedThisPhase(state,id))return null;
  return movingAimCap(state.entries[id].allowance,state.impulse).actions;
}

// Aiming while moving (§2.2, PDF 11: "Actions can be mixed… a player can aim while moving").
// The book's worked example splits Trent's 2 actions an impulse into 1 hex and 1 action of
// aim, every impulse. With no one to ask, that is the split: while a shooter is part-way
// into a hex with an aimed attack ordered, one action of each impulse goes to the aim and the
// rest to the route, until the aim is paid (or held, or at the moving-aim cap). The final
// action of aim, the one that fires, draws on the same reservation.
export const AIM_ACTIONS_WHILE_MOVING=1;
const aimedKinds=new Set(['shot','shotgun','burst']);
export function aimedThisImpulse(state,id,activity=state.entries?.[id]?.activity){
  if(!activity)return 0;
  return (state.entries[id]?.history??[]).filter(h=>h.kind==='work'&&h.activityId===activity.id&&h.phase===state.phase&&h.impulse===state.impulse)
    .reduce((sum,h)=>sum+Math.max(0,(h.after??0)-(h.before??0)),0);
}
export function movingAimReserve(state,id){
  const entry=state.entries?.[id],a=entry?.activity;
  if(!entry?.movement?.pending||!a?.continuous||a.interrupted||a.holdReason||a.shotId||a.progress>=a.cost)return 0;
  if(!aimedKinds.has(a.weaponPlan?.kind))return 0;
  const limit=movingAimLimit(state,id);
  if(limit!==null&&a.progress>=limit)return 0;
  return Math.max(0,Math.min(AIM_ACTIONS_WHILE_MOVING-aimedThisImpulse(state,id,a),actionBalance(state,id)??0));
}
function assertAimWithinMovingCap(state,id,activity){
  if(!['shot','burst'].includes(activity?.weaponPlan?.kind))return;
  const limit=movingAimLimit(state,id);
  if(limit!==null&&activity.progress>=limit)
    throw new Error(`A moving shooter may hold only ${limit} action${limit===1?'':'s'} of aim (§2.2). Stop moving to aim longer.`);
}

// §5.13 Incapacitation Effects (optional), on the encounter clock (rules/incapacitation-effects.mjs).
// An effect starts as the clock moves on from the impulse of the failed knockout and lasts its
// Table 8B time. Dazed spends that first impulse getting to the ground, then has half his
// actions; the others cost nothing here (knocked out and stunned are incapacitated on the
// Actor; disoriented only loses offensive action). When the time is up the effect ends, and a
// man knocked out or stunned is marked for the coordinator to bring round.
function chargeIncapacitation(state,started={}){
  const now=elapsedSeconds(state);
  for(const [id,effect] of Object.entries(started??{})){
    const entry=state.entries[id];if(!entry)continue;
    entry.incapacitation={effect:effect.effect,until:now+effect.seconds,printed:effect.printed,started:{phase:state.phase,impulse:state.impulse}};
    entry.history.push({kind:'incapacitation',label:effect.detail,phase:state.phase,impulse:state.impulse,source:'LEG10200 §5.13'});
  }
  for(const entry of Object.values(state.entries)){
    const effect=entry.incapacitation;if(!effect)continue;
    if(now>=effect.until){
      if(['knockedOut','stunned'].includes(effect.effect))entry.comeRound=true;
      entry.history.push({kind:'incapacitation',label:`${effect.effect==='knockedOut'?'Comes round':'Recovers'} after ${effect.printed}`,phase:state.phase,impulse:state.impulse});
      delete entry.incapacitation;continue;
    }
    if(effect.effect!=='dazed'||!entry.allowance)continue;
    const allotment=actionSchedule(entry.allowance)[state.impulse-1];
    const first=effect.started.phase===state.phase&&effect.started.impulse===state.impulse;
    const lost=first?allotment:allotment-Math.floor(allotment/2);
    entry.spent=Math.max(entry.spent,lost);
    entry.history.push({kind:'incapacitation',label:first?'Dazed: dropping to the ground, no actions':'Dazed: half actions',phase:state.phase,impulse:state.impulse,before:0,after:lost});
  }
}

// §5.12 Knock Down (optional), charged as the clock moves on from the impulse the blow landed
// in. A penalty of 1, 2 or 4 actions is time spent regaining balance "before he can take any
// action", so it is paid from his next actions, running into later impulses if his allotment
// is small. Knocked down, he spends the next impulse falling ("1 Impulse for him to hit the
// ground during which he can take no actions"), then owes 3 more "to roll into a position in
// which he can use his hands"; getting up is an ordinary posture order.
export const KNOCKED_DOWN_RECOVERY_ACTIONS=3;
function chargeKnockDowns(state,knockDowns={}){
  for(const [id,knock] of Object.entries(knockDowns??{})){
    const entry=state.entries[id];if(!entry)continue;
    if(knock.level==='down'){entry.knockedDown={impulses:1};entry.balanceOwed=(entry.balanceOwed??0)+KNOCKED_DOWN_RECOVERY_ACTIONS;}
    else entry.balanceOwed=(entry.balanceOwed??0)+knock.level;
    entry.history.push({kind:'knockDown',label:knock.detail,phase:state.phase,impulse:state.impulse,source:'LEG10200 §5.12'});
  }
  for(const entry of Object.values(state.entries)){
    if(!entry.allowance||(!entry.knockedDown&&!(entry.balanceOwed>0)))continue;
    const allotment=actionSchedule(entry.allowance)[state.impulse-1];
    // The marker stays through the falling impulse, so the bar can say so, and goes at the next.
    if(entry.knockedDown){
      if(entry.knockedDown.impulses>0){
        entry.spent=Math.max(entry.spent,allotment);entry.knockedDown.impulses--;
        entry.history.push({kind:'knockDown',label:'Falling: no actions this impulse',phase:state.phase,impulse:state.impulse,before:0,after:allotment});
        continue;
      }
      delete entry.knockedDown;
      if(!(entry.balanceOwed>0))continue;
    }
    const pay=Math.min(Math.max(0,allotment-entry.spent),entry.balanceOwed);
    entry.spent+=pay;entry.balanceOwed-=pay;
    entry.history.push({kind:'knockDown',label:`Regaining balance: ${pay} action${pay===1?'':'s'}`,phase:state.phase,impulse:state.impulse,before:0,after:pay});
    if(!entry.balanceOwed)delete entry.balanceOwed;
  }
}

export function changeTiming(previous,command,{refreshAllowances=()=>{}}={}){
  if(previous.version!==TIMING_VERSION)throw new Error('Unsupported timing record. Migrate it with migrateTiming first.');
  if(command.expectedRevision!==previous.revision)throw new Error('Combat timing changed. Review the tracker and try again.');
  const state=structuredClone(previous);
  if(command.kind==='start'){
    if(state.phase)throw new Error('This encounter has already started.');
    state.phase=state.impulse=1;state.clockRevision++;
  }else if(command.kind==='advance'){
    if(!state.phase)throw new Error('Start the encounter first.');
    if(state.batch&&!state.batch.complete)throw new Error('This impulse has an unresolved fire batch. Supply the outstanding knockout rolls before advancing.');
    const closing=state.batch;
    state.batch=null;
    if(state.impulse===4){state.phase++;state.impulse=1;}else state.impulse++;
    // Done lasts one impulse; Wait (done until given an order) carries over.
    state.clockRevision++;for(const entry of Object.values(state.entries)){entry.spent=0;entry.done=entry.waiting===true;}
    for(const entry of Object.values(state.entries)){
      if(entry.meleeDefence&&impulseNumber(state.phase,state.impulse)>entry.meleeDefence.throughNumber)entry.meleeDefence=null;
    }
    nextDecisionImpulse(state);
    refreshAllowances(state);
    chargeIncapacitation(state,closing?.incapacitation);
    chargeKnockDowns(state,closing?.knockDowns);
    continueUnchangedWork(state);
  }else if(command.kind==='batch'){
    if(!state.phase)throw new Error('Start the encounter first.');
    const batch=command.batch;
    if(!batch||typeof batch.complete!=='boolean')throw new Error('A resolved impulse batch is required.');
    if(state.batch&&state.batch.complete)throw new Error('This impulse already has a completed fire batch.');
    state.batch={...batch,phase:state.phase,impulse:state.impulse};
  }else if(command.kind==='clearBatch'){
    if(!state.batch)throw new Error('No impulse batch to clear.');
    if(state.batch.complete)throw new Error('A completed batch is cleared by advancing the impulse.');
    state.batch=null;
  }else{
    const id=command.combatantId;
    if(!/^[a-zA-Z0-9_-]+$/.test(id??'')||['__proto__','constructor','prototype'].includes(id))throw new Error('Invalid combatant identity.');
    const entry=state.entries[id]??={allowance:null,reason:'',spent:0,activity:null,history:[]};
    // Any order ends Done for this impulse, and ends Wait.
    if(command.kind!=='done'){entry.done=false;if(command.kind!=='allowance')delete entry.waiting;}
    // §5.9 Pinning Fire (optional): the pin lasts while he stays and aims there. Moving, a
    // melee defence, stopping the wait, or any order but a shot into the pinned hex ends it.
    if(['move','abandonMove','meleeDefence'].includes(command.kind)||(command.kind==='activity'&&!command.keepPin)||(command.kind==='done'&&command.done===false))delete entry.pin;
    // §5.10 Cover Fire (optional): the standing order ends the same way; the bursts it fires
    // each impulse keep it.
    if(['move','abandonMove','meleeDefence','stopCoverFire'].includes(command.kind)||(command.kind==='activity'&&!command.keepCoverFire)||(command.kind==='done'&&command.done===false))delete entry.coverFire;
    if(command.kind==='done'){
      if(!state.phase||state.reactions||state.batch||state.pendingEffect)throw new Error('Finish resolution before changing readiness.');
      if(typeof command.done!=='boolean')throw new Error('Choose whether you are done this impulse.');
      entry.done=command.done;
      if(command.done&&command.wait===true){
        if(entry.activity&&entry.activity.progress<entry.activity.cost)throw new Error('Finish or cancel the current order before waiting.');
        entry.waiting=true;
      }else delete entry.waiting;
    }else if(command.kind==='coverFire'){
      if(!state.phase||state.reactions||state.batch||state.pendingEffect)throw new Error('Finish resolution before ordering cover fire.');
      if(entry.activity&&entry.activity.progress<entry.activity.cost)throw new Error('Finish or cancel the current order before ordering cover fire.');
      const order=command.order;
      if(!order?.weaponId||!order.modeId||!order.ammunitionId||!Array.isArray(order.arc?.hexes)||!order.arc.hexes.length)throw new Error('Choose the weapon and the hexes to cover.');
      entry.coverFire={...structuredClone(order),since:{phase:state.phase,impulse:state.impulse}};
      entry.history.push({kind:'coverFire',label:`Cover fire on ${order.arc.hexes.length} hex${order.arc.hexes.length===1?'':'es'}`,phase:state.phase,impulse:state.impulse,source:'LEG10200 §5.10'});
    }else if(command.kind==='stopCoverFire'){
      entry.history.push({kind:'coverFire',label:command.reason?`Cover fire stops: ${command.reason}`:'Cover fire stopped',phase:state.phase,impulse:state.impulse});
    }else if(command.kind==='pin'){
      if(!state.phase||state.reactions||state.batch||state.pendingEffect)throw new Error('Finish resolution before pinning a hex.');
      if(entry.activity&&entry.activity.progress<entry.activity.cost)throw new Error('Finish or cancel the current order before pinning a hex.');
      const pin=command.pin;
      if(!Number.isInteger(pin?.hex?.i)||!Number.isInteger(pin?.hex?.j))throw new Error('Choose the hex to pin.');
      // He aims at the spot and waits for someone to appear: done, until given an order.
      entry.pin={...structuredClone(pin),since:{phase:state.phase,impulse:state.impulse}};
      entry.done=true;entry.waiting=true;
      entry.history.push({kind:'pin',label:`Pinning a hex (${pin.hex.i}, ${pin.hex.j})`,phase:state.phase,impulse:state.impulse,source:'LEG10200 §5.9'});
    }else if(command.kind==='allowance'){
      actionSchedule(command.allowance);
      if(entry.spent)throw new Error('Change the allowance before spending any actions in this impulse.');
      if(command.derivation){
        if(command.derivation.value!==command.allowance)throw new Error('The derived allowance does not match the supplied value.');
        entry.allowance=command.allowance;entry.reason='';
        // Deep-copied, because the provenance points straight at the frozen source tables
        // in `src/data/`. Foundry walks an update object and writes into it, and cannot
        // write into a frozen one: storing the derivation as it arrives fails with "cannot
        // assign to read only property". The copy also stops a later reader mutating the
        // tables through the record it was handed.
        entry.allowanceSource={source:'derived',
          provenance:command.derivation.provenance?structuredClone(command.derivation.provenance):null};
      }else{
        if(!command.reason?.trim())throw new Error('Record the source or reason for the adjudicated allowance.');
        entry.allowance=command.allowance;entry.reason=command.reason.trim();
        entry.allowanceSource={source:'adjudicated',reason:command.reason.trim()};
      }
    }else{
      if(!state.phase)throw new Error('Start the encounter first.');
      if(command.kind==='meleeDefence'){
        if(!['dodge','coverUp'].includes(command.defence))throw new Error('Choose Dodge or Cover Up.');
        if(!Number.isSafeInteger(command.parryColumn)||command.parryColumn<1||command.parryColumn>9)throw new Error('A melee defence needs its derived Table 4 parry column.');
        if(activeMeleeDefence(state,id))throw new Error('This combatant is already Dodging or Covering Up.');
        if(entry.spent>0||(entry.movement?.spent?.[impulseKey(state)]??0)>0)throw new Error('Dodge or Cover Up must be chosen before doing anything else this impulse.');
        if(entry.movement?.pending)throw new Error('Finish or abandon the hex already being entered before choosing a melee defence.');
        if(entry.activity&&entry.activity.progress<entry.activity.cost)throw new Error('Cancel or finish the current activity before choosing a melee defence.');
        const duration=command.defence==='dodge'?4:1;
        const fromNumber=impulseNumber(state.phase,state.impulse);
        entry.meleeDefence={kind:command.defence,label:command.defence==='dodge'?'Dodge':'Cover Up',
          impulseCost:duration,from:{phase:state.phase,impulse:state.impulse},fromNumber,
          throughNumber:fromNumber+duration-1,parryColumn:command.parryColumn,
          ...(command.maximumSpeed===undefined?{}:{maximumSpeed:command.maximumSpeed}),
          ...(command.shieldItemId===undefined?{}:{shieldItemId:command.shieldItemId}),
          ...(command.shieldName===undefined?{}:{shieldName:command.shieldName}),
          ...(command.shieldPartialParry===undefined?{}:{shieldPartialParry:command.shieldPartialParry}),
          source:'LEG10204 §3.4, PDF 18; Tables 3B–3C, PDF 45'};
        entry.history.push({kind:'meleeDefence',label:entry.meleeDefence.label,phase:state.phase,impulse:state.impulse,
          throughNumber:entry.meleeDefence.throughNumber,status:'active'});
      }else if(command.kind==='activity'){
        if(activeMeleeDefence(state,id))throw new Error('A combatant who is Dodging or Covering Up cannot begin another activity.');
        if(entry.activity&&entry.activity.progress<entry.activity.cost)throw new Error('Finish or cancel the current activity first.');
        const quote=command.catalog?quoteActivity(command.catalog.id,command.catalog.parameters):null;
        const label=quote?.label??command.label,cost=quote?.actions??command.cost;
        if(!label?.trim()||!Number.isSafeInteger(cost)||cost<1)throw new Error('Give the activity a name and positive whole-action cost.');
        entry.activity={id:command.id,label:label.trim(),cost,progress:0,...(command.continuous?{continuous:true}:{}),...(quote?{ruleset:'small-arms',catalog:quote}:{}),...(command.then?{then:structuredClone(command.then)}:{})};
      }else if(command.kind==='work'){
        if(activeMeleeDefence(state,id))throw new Error('A combatant who is Dodging or Covering Up cannot apply actions to another activity.');
        if(entry.activity?.interrupted)throw new Error('The interrupted activity needs GM adjudication before resuming.');
        if(!entry.activity||entry.activity.progress>=entry.activity.cost)throw new Error('Plan an unfinished activity first.');
        if(!(actionBalance(state,id)>0))throw new Error('No configured actions remain in this impulse.');
        assertAimWithinMovingCap(state,id,entry.activity);
        const before=entry.activity.progress;entry.activity.progress++;entry.spent++;delete entry.activity.holdReason;
        entry.history.push({id:command.id,kind:'work',activityId:entry.activity.id,label:entry.activity.label,phase:state.phase,impulse:state.impulse,before,after:entry.activity.progress,status:'active'});
      }else if(command.kind==='undoWork'){
        const last=entry.history.findLast(e=>e.kind==='work'&&e.status==='active');
        if(!last||last.phase!==state.phase||last.impulse!==state.impulse||last.activityId!==entry.activity?.id||last.after!==entry.activity.progress)throw new Error('Only the current activity’s latest action in this impulse can be undone.');
        entry.activity.progress=last.before;entry.spent-=last.after-last.before;last.status='reversed';
      }else if(command.kind==='cancel'){
        if(!entry.activity)throw new Error('No activity to cancel.');
        entry.history.push({kind:'cancel',activityId:entry.activity.id,label:entry.activity.label,progress:entry.activity.progress,phase:state.phase,impulse:state.impulse});entry.activity=null;
      }else if(command.kind==='move'){
        if(activeMeleeDefence(state,id))throw new Error('Only LEG10204 Free Movement is permitted during Dodge or Cover Up; 2-foot melee movement is not implemented, so remain stationary.');
        // A hex costs what Table 7A says and is entered only when it is paid for in full;
        // section 2.2 lets that payment span impulses like any other activity. Omitting
        // `actions` spends everything available, so mixing means naming the split.
        const movement=movementRecord(entry),key=impulseKey(state);
        if(command.step){
          if(movement.pending)throw new Error('Finish or abandon the hex already being entered.');
          const hexsides=command.hexsides??0,step=quoteHexStep(command.step),turn=facingChangeCost({hexsides,movingThisHex:true});
          // The placement - which hex on which map - is the adapter's business, not this
          // module's. It is carried opaquely so a hex paid for across impulses still lands
          // where it was declared to land.
          if(command.placement!==undefined&&(typeof command.placement!=='object'||command.placement===null||Array.isArray(command.placement)))
            throw new Error('Movement placement must be an object when supplied.');
          movement.stance=command.step.stance;
          movement.pending={id:command.id,step:{...command.step},hexsides,
            ...(command.placement===undefined?{}:{placement:structuredClone(command.placement)}),
            label:`Enter 1 hex ${command.step.direction}, ${command.step.stance}`,
            cost:step.actions+turn.actions,progress:0,assumed:step.assumed,source:step.source,
            breakdown:[...step.breakdown,...(turn.actions?[{label:`Facing: ${turn.paidHexsides} paid hexside(s)`,actions:turn.actions}]:[])]};
          if(command.route?.length)movement.route=command.route.map(leg=>structuredClone(leg));
          if(command.popRoute&&movement.route?.length)movement.route.shift();
        }
        const pending=movement.pending;
        if(!pending)throw new Error('Declare the hex being entered first.');
        // A new route declared when only the aim's action is left waits for the next impulse.
        const waitsForAim=command.step&&command.actions===undefined&&(actionBalance(state,id)??0)>0&&actionBalance(state,id)<=movingAimReserve(state,id);
        if(waitsForAim){movement.automatic=true;movement.pausedReason=null;}
        if(!command.declareOnly&&!waitsForAim){
          movement.automatic=command.actions===undefined;movement.pausedReason=null;
          const balance=actionBalance(state,id);
          if(!(balance>0))throw new Error('No configured actions remain in this impulse.');
          const outstanding=pending.cost-pending.progress;
          // Automatic spending leaves the action an aimed attack is owed this impulse.
          const reserve=command.actions===undefined?movingAimReserve(state,id):0;
          const spend=command.actions??Math.min(balance-reserve,outstanding);
          if(reserve&&spend<1)throw new Error('This impulse\u2019s remaining action goes to the aim; the move continues next impulse.');
          if(!Number.isSafeInteger(spend)||spend<1)throw new Error('Spend a whole number of at least one action on movement.');
          if(spend>balance)throw new Error('That is more actions than remain in this impulse.');
          if(spend>outstanding)throw new Error('That is more actions than entering this hex costs.');
          const before=pending.progress;
          pending.progress+=spend;entry.spent+=spend;
          movement.spent[key]=(movement.spent[key]??0)+spend;
          const entered=pending.progress>=pending.cost;
          if(entered)movement.hexes[key]=(movement.hexes[key]??0)+1;
          entry.history.push({id:command.id,kind:'move',label:pending.label,phase:state.phase,impulse:state.impulse,
            before,after:pending.progress,cost:pending.cost,hexsides:pending.hexsides,status:entered?'entered':'active'});
          if(entered)movement.pending=null;
        }
      }else if(command.kind==='abandonMove'){
        // Actions already spent on a part-entered hex are not refunded, as elsewhere here.
        const movement=entry.movement;
        if(!movement?.pending)throw new Error('No part-entered hex to abandon.');
        entry.history.push({kind:'abandonMove',label:movement.pending.label,progress:movement.pending.progress,
          cost:movement.pending.cost,phase:state.phase,impulse:state.impulse});
        movement.pending=null;
      }else throw new Error('Unknown timing command.');
    }
  }
  state.revision++;return state;
}
