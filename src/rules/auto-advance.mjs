import {actionBalance,activeMeleeDefence} from './timing.mjs';

// Auto-advance (GM toggle, off by default; user ruling 27 September 2026). The clock runs
// on only through impulses in which nobody has a decision to make. Each reason it stops is
// named so the GM and the tracker can say what the table is waiting for.
//
// `people` are the encounter's combatants: {id, name, conscious, woundedThisImpulse}.
// `shots` are this impulse's saved attacks.
export function autoAdvanceBlockers(state,{people=[],shots=[]}={}){
  const blockers=[];
  if(!state?.phase)return [{reason:'The encounter has not started.'}];
  if(state.pendingEffect)return [{reason:'An action is being applied.'}];
  if(state.reactions)return [{reason:'Reactions and fire are being resolved.'}];
  if(state.batch&&!state.batch.complete)return [{reason:'Wounds and knockout checks are being totalled.'}];
  if(shots.some(s=>['ready','rolled'].includes(s.status)))blockers.push({reason:'Attacks are waiting to be resolved.'});
  if(!state.batch?.complete&&people.some(p=>p.woundedThisImpulse))blockers.push({reason:'Wounds this impulse need totalling.'});
  for(const person of people){
    const entry=state.entries?.[person.id],a=entry?.activity;
    if(!entry?.allowance||!person.conscious||entry.done||activeMeleeDefence(state,person.id))continue;
    const who=person.name??person.id;
    if(a?.holdReason&&a.progress<a.cost){blockers.push({id:person.id,kind:'held',reason:`${who}: ${a.holdReason}`});continue;}
    if(a?.interrupted){blockers.push({id:person.id,kind:'interrupted',reason:`${who}: interrupted work needs a ruling.`});continue;}
    const move=entry.movement?.pending;
    if(move&&(entry.movement.automatic===false||entry.movement.pausedReason)){blockers.push({id:person.id,kind:'movement',reason:`${who}: movement is paused.`});continue;}
    if(!(actionBalance(state,person.id)>0))continue;
    if(move||(a&&a.progress<a.cost&&a.continuous))continue;
    blockers.push({id:person.id,kind:a&&a.progress<a.cost?'manual':'idle',reason:a&&a.progress<a.cost?`${who}: ${a.label} waits for actions to be invested.`:`${who} has actions and no order.`});
  }
  return blockers;
}
