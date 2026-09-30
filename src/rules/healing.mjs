// §2.10 (LEG10200 PDF 24) carried to its end on the world clock. The healing penalty already
// counts down (recovery-clock.mjs); what this adds is what happens when a clock runs out.
//
//   - "HT = Healing Time. This is the number of days required for a character to fully
//     recover." Once it has passed, the wounds the recovery covered are healed: they leave the
//     PD Total, and "Disabling injuries remain in effect until completely healed", so their
//     disabled limbs are usable again.
//   - A failed knockout leaves him incapacitated for Table 8B's time. Once it has passed he
//     comes round, "capable of action" with the Healing Time / 20 penalty.
//
// A recovery covers the wounds taken up to its resolution (critical-time.mjs's reading).
// Wounds taken after it are a new injury with their own Critical Time Period, so they are
// never healed by the old clock, and a man carrying them is not brought round by it either:
// something newer may be what is keeping him down. Nothing here rolls or kills.
import {recoveryClock} from './recovery-clock.mjs';
import {pendingWounds} from './critical-time.mjs';

// `wokeFor` is the recovery (by its resolution time) he has already been brought round from,
// so a GM who later puts him down again for another reason is not overridden.
export function healingDue(system,now,{wokeFor=null}={}){
  const recovery=system?.recovery;
  const clock=recoveryClock(recovery,now);
  const injuries=Object.entries(system?.injuries??{});
  const pending=new Set(pendingWounds(system?.injuries,recovery));
  const covered=injuries.filter(([,injury])=>injury?.status==='active'&&!pending.has(injury));
  const heal=clock.state==='healed'?covered.map(([id])=>id):[];
  const freed=[...new Set(heal.flatMap(id=>system.injuries[id].disabledRegions??[]))];
  const wake=recovery?.outcome==='survived'&&recovery.penaltyCategory==='recent-knockout-failed'
    &&system?.condition?.consciousness==='incapacitated'&&!pending.size
    &&['recent','healing','healed'].includes(clock.state)&&wokeFor!==recovery.resolvedAtWorldTime;
  return {clock,heal,freed,wake};
}

// The Actor update for what is due, or null when nothing is.
export function healingUpdate(system,now,options={}){
  const due=healingDue(system,now,options);
  if(!due.heal.length&&!due.wake)return null;
  const update={};
  for(const id of due.heal)update[`system.injuries.${id}.status`]='healed';
  if(due.wake){
    update['system.condition.consciousness']='conscious';
    update['flags.phoenix-command.wokeFor']=system.recovery.resolvedAtWorldTime;
  }
  return {update,...due};
}
