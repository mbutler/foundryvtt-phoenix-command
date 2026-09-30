// LEG10200 §2.2–2.5, PDF 16–18; visually checked 2026-09-21.
// Sightlines are GM adjudications between two combatants, never token.hidden or wall inference.
export const decisionSource='LEG10200 §2.2–2.5, PDF 16–18 · visual check';
const validId=id=>typeof id==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(id)&&!['__proto__','constructor','prototype'].includes(id);
export function sightline(state,observerId,targetId){return state?.sightlines?.[observerId]?.[targetId]??null;}

// Section 2.4, PDF 12: exposure is an interval, not a per-impulse fact. "All exposed targets
// within a character's Field of View are visible from the beginning of the Impulse they
// begin an action which exposes them, until the end of the Impulse in which they go into
// concealment." The section's own example runs from the impulse a man steps out to the
// impulse he ducks back, three impulses later.
//
// So a sightline carries when its exposure began, and keeps it while the exposure stands.
// Re-declaring visibility in a later impulse does not restart the interval; only concealment
// ends it. `until` is set when concealment is declared, because he stays visible through the
// end of that impulse.
export function exposureInterval(state,observerId,targetId){
  const row=sightline(state,observerId,targetId);
  if(!row?.from)return null;
  const impulses=row.until?(row.until.phase-row.from.phase)*4+row.until.impulse-row.from.impulse+1:null;
  return {from:{...row.from},until:row.until?{...row.until}:null,closed:!!row.until,impulses,source:decisionSource};
}
const atOrBefore=(a,b)=>a.phase<b.phase||(a.phase===b.phase&&a.impulse<=b.impulse);
const exposedStatus=status=>['visible','appearing'].includes(status);

// After a paid duck behind cover (user ruling, 26 Sep 2026): sightlines are not changed for him,
// because cover hides him only from its far side. These are the observers still recorded as
// seeing him, for the GM to mark as departing where the cover now hides him.
export function observersStillSeeing(state,targetId){
  return Object.entries(state?.sightlines??{}).filter(([observer,rows])=>observer!==targetId&&exposedStatus(rows?.[targetId]?.status)).map(([observer])=>observer);
}
export const duckedThisOrder=activity=>activity?.effect?.kind==='posture'&&activity.effect.field==='cover'&&activity.effectStatus==='applied';
export function assertVisible(state,observerId,targetId){
  if(sightline(state,observerId,targetId)?.status==='concealed')throw new Error('This target is concealed from this shooter for the whole impulse.');
}
export function departurePending(state,observerId,targetId){
  const a=state.entries[observerId]?.activity;
  return ['departing','concealed'].includes(sightline(state,observerId,targetId)?.status)&&['shot','burst'].includes(a?.weaponPlan?.kind)&&a.progress<a.cost;
}
export function reactionInput(state,shooterId,targetId){
  const choices=state.reactions?.choices??{};
  const shooterDucking=choices[shooterId]==='duck',targetDucking=choices[targetId]==='duck';
  return shooterDucking||targetDucking?{shooterDucking,targetDucking,source:decisionSource}:null;
}
export function nextDecisionImpulse(state){
  delete state.reactions;
  for(const rows of Object.values(state.sightlines??{}))for(const row of Object.values(rows)){
    const ending=['departing','concealed'].includes(row.status);
    row.status=ending?'concealed':'visible';
    // A concealed target's interval is over; an exposure that still stands keeps the
    // impulse it began in, so the record says how long he has been in the open.
    if(ending){delete row.from;delete row.until;}
  }
}
export function changeDecision(previous,command,{targetIds=[],incapacitatedIds=[],allowEmpty=false,aimModifiers=null,preparation=0}={}){
  if(command.expectedRevision!==previous.revision)throw new Error('Combat timing changed. Review the tracker and try again.');
  if(!previous.phase||previous.batch||previous.pendingEffect)throw new Error('Decisions require an open impulse without pending effects.');
  const state=structuredClone(previous),id=command.combatantId,entry=state.entries[id];
  if(command.kind==='sightline'){
    if(state.reactions)throw new Error('Exposure is frozen once the reaction window opens.');
    if(!validId(id)||!validId(command.targetId)||id===command.targetId||!['visible','appearing','departing','concealed'].includes(command.status))throw new Error('Choose distinct combatants and a supported sightline state.');
    if(!command.reason?.trim())throw new Error('Record why this sightline applies.');
    state.sightlines??={};state.sightlines[id]??={};
    const existing=state.sightlines[id][command.targetId];
    const now={phase:state.phase,impulse:state.impulse};
    const row={status:command.status,reason:command.reason.trim(),source:decisionSource};
    if(exposedStatus(command.status)){
      // An exposure already running keeps its start; a new one takes the impulse the
      // exposing action began in, which may be earlier than the impulse it is declared in.
      let from=existing?.from??command.from??now;
      if(command.from){
        const f=command.from;
        if(!Number.isInteger(f.phase)||f.phase<1||!Number.isInteger(f.impulse)||f.impulse<1||f.impulse>4||!atOrBefore(f,now))
          throw new Error('An exposure begins at a real impulse of this encounter, at or before the current one.');
        from=existing?.from&&atOrBefore(existing.from,f)?existing.from:f;
      }
      row.from=from;
    }else if(command.status==='departing'){
      // Visible until the end of this impulse. Keep the start if there was one; a departure
      // declared with no prior exposure is at least visible for this impulse.
      row.from=existing?.from??now;row.until=now;
    }
    state.sightlines[id][command.targetId]=row;
  }else if(command.kind==='fireNow'){
    if(state.reactions)throw new Error('Choose departure shots before opening reactions.');
    const a=entry?.activity;
    if(!['shot','burst'].includes(a?.weaponPlan?.kind)||a.progress<1||a.progress>=a.cost)throw new Error('Invest at least one action in an unfinished aimed shot first.');
    // Chambering is paid before aim begins, so what the weapon table is entered with is the
    // aim held, not everything invested. Firing early with the chambering incomplete is not
    // firing early at all: there is no aim yet.
    const aim=a.progress-preparation;
    if(aim<1)throw new Error(`This shot still owes ${preparation-a.progress} action(s) to chamber a round; no aim has been paid yet.`);
    if(!Object.hasOwn(aimModifiers??{},String(aim)))throw new Error('This accumulated aim has no weapon-table entry; invest a supported amount or abandon aim.');
    entry.history.push({kind:'fireNow',activityId:a.id,label:a.label,phase:state.phase,impulse:state.impulse,before:a.cost,after:a.progress,source:decisionSource});
    a.originalCost??=a.cost;a.cost=a.progress;a.weaponPlan.cost=a.progress;a.weaponPlan.aimActions=aim;
    a.label=`${a.label} · fire at ${aim} actions of aim`;a.continuous=false;
  }else if(command.kind==='openReactions'){
    if(state.reactions)throw new Error('This impulse already has a reaction window.');
    // Cover fire at empty hexes still opens (and closes) a window, with nobody in it.
    if((!targetIds.length&&!allowEmpty)||targetIds.some(t=>!validId(t)))throw new Error('Declare at least one due shot before opening reactions.');
    // A man already out cannot duck (§2.5 ducking is a conscious reaction): he holds, and
    // nobody is asked for a decision that has only one answer.
    const out=new Set(incapacitatedIds);
    state.reactions={stage:'open',choices:Object.fromEntries([...new Set(targetIds)].map(id=>[id,out.has(id)?'hold':null])),source:decisionSource};
    const unable=[...new Set(targetIds)].filter(id=>out.has(id));
    if(unable.length)state.reactions.unable=unable;
  }else if(command.kind==='react'){
    if(state.reactions?.stage!=='open'||!Object.hasOwn(state.reactions.choices,id))throw new Error('Only a target in the open reaction window may react.');
    if(!['hold','duck'].includes(command.choice))throw new Error('Choose hold or duck.');
    if(state.reactions.choices[id]!==null)throw new Error('This reaction is already committed.');
    state.reactions.choices[id]=command.choice;
    // LEG10204 §3.2: full parries are the defender's allocation, made before anyone rolls.
    if(command.parries!==undefined){
      if(!Array.isArray(command.parries)||command.parries.some(p=>!validId(p))||new Set(command.parries).size!==command.parries.length)throw new Error('Allocate full parries to distinct blows.');
      if(command.parries.length)state.reactions.parries={...state.reactions.parries,[id]:[...command.parries]};
    }
    const a=entry?.activity;
    if(command.choice==='duck'&&a&&a.progress<a.cost){
      entry.history.push({kind:'duck',activityId:a.id,label:a.label,phase:state.phase,impulse:state.impulse,before:a.progress,after:a.progress,source:decisionSource});
      if(['shot','burst'].includes(a.weaponPlan?.kind)){
        entry.history.at(-1).detail='Unfired aim abandoned without refund.';entry.activity=null;
      }else{
        a.interrupted={reason:'Ducked under fire',progress:a.progress,phase:state.phase,impulse:state.impulse};a.continuous=false;
      }
    }
  }else if(command.kind==='closeReactions'){
    if(state.reactions?.stage!=='open'||Object.values(state.reactions.choices).some(c=>c===null))throw new Error('Every threatened combatant must choose hold or duck before closing reactions.');
    state.reactions.stage='closed';
  }else if(command.kind==='reconcileInterruption'){
    if(state.reactions)throw new Error('Reconcile interrupted work in the next impulse.');
    const a=entry?.activity;
    if(!a?.interrupted||!Number.isSafeInteger(command.progress)||command.progress<0||command.progress>a.progress||!command.reason?.trim())throw new Error('Adjudicate retained progress from zero to the interrupted amount and record a reason.');
    entry.history.push({kind:'reconcileInterruption',activityId:a.id,label:a.label,phase:state.phase,impulse:state.impulse,before:a.progress,after:command.progress,detail:command.reason.trim()});
    a.progress=command.progress;delete a.interrupted;
  }else throw new Error('Unknown impulse decision.');
  state.revision++;return state;
}
