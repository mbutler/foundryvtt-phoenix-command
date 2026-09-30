import {requireCoordinator,serialized} from './coordinator.mjs';
import {dueThisImpulse} from '../rules/impulse-completion.mjs';
import {finishFireSequence} from '../rules/fire-sequence.mjs';
import {reviewBlockers,buildSavedShotApplication,applySavedShotApplication} from './saved-shot-resolution.mjs';

const running=new Set();

export function dueFireSummary(combat){
  const due=dueThisImpulse(combat.getFlag('phoenix-command','shots'),combat.timing,combat.uuid);
  const kinds=[...new Set(due.map(s=>s.plan.kind))];
  const blockers=due.map(s=>reviewBlockers(combat,s)).filter(Boolean);
  return {due,kinds,blockers,ready:due.filter(s=>s.status==='ready'),rolled:due.filter(s=>s.status==='rolled')};
}

function assertClosedImpulse(combat){
  requireCoordinator();
  if(combat.timing.reactions?.stage!=='closed')throw new Error('Finish player reactions before resolving fire.');
}

function filterDue(combat,{kinds=null,homogeneous=false}={}){
  const due=dueThisImpulse(combat.getFlag('phoenix-command','shots'),combat.timing,combat.uuid);
  if(!due.length)throw new Error('No fire is due this impulse.');
  const selected=kinds?due.filter(s=>kinds.includes(s.plan.kind)):due;
  if(!selected.length)throw new Error('No due attacks match the requested weapon family.');
  const familyKinds=[...new Set(selected.map(s=>s.plan.kind))];
  if(homogeneous&&familyKinds.length>1)throw new Error('Resolve each weapon family separately, or use mixed-fire resolution.');
  const blockers=selected.map(s=>reviewBlockers(combat,s)).filter(Boolean);
  if(blockers.length)throw new Error(`Awaiting GM review: ${blockers.join('; ')}.`);
  return selected;
}

export async function resolveDueFire(combat,{kinds=null,homogeneous=false}={}){
  assertClosedImpulse(combat);
  if(running.has(combat.uuid))throw new Error('This encounter is already resolving fire.');
  const selected=filterDue(combat,{kinds,homogeneous});
  const clock=combat.timing.clockRevision;
  const assertClock=()=>{
    requireCoordinator();
    if(combat.timing.clockRevision!==clock||combat.timing.reactions?.stage!=='closed')
      throw new Error('The impulse changed during resolution. Saved dice are retained.');
  };
  running.add(combat.uuid);
  try{
    return await finishFireSequence(selected.map(s=>s.id),{
      prepare:async id=>{
        assertClock();
        let shot=combat.getFlag('phoenix-command',`shots.${id}`);
        if(['applied','undone','abandoned'].includes(shot.status))return null;
        if(shot.status==='ready'){
          await combat.timingCommand({kind:'rollShot',combatantId:shot.combatantId,expectedRevision:combat.timing.revision});
          shot=combat.getFlag('phoenix-command',`shots.${id}`);
        }
        return serialized(async()=>buildSavedShotApplication(combat,shot,{assertClock}));
      },
      apply:async prepared=>{if(prepared){assertClock();await applySavedShotApplication(prepared);}},
      total:async()=>{assertClock();return combat.resolveImpulseFire();}
    });
  }finally{running.delete(combat.uuid);}
}

export const resolveRifleFire=combat=>resolveDueFire(combat,{kinds:['shot'],homogeneous:true});
export const resolveBurstFire=combat=>resolveDueFire(combat,{kinds:['burst'],homogeneous:true});
export const resolveShotgunFire=combat=>resolveDueFire(combat,{kinds:['shotgun'],homogeneous:true});
export const resolveExplosiveFire=combat=>resolveDueFire(combat,{kinds:['grenade','launcher']});
export const resolveMeleeFire=combat=>resolveDueFire(combat,{kinds:['strike'],homogeneous:true});
export const resolveMixedFire=combat=>resolveDueFire(combat);
