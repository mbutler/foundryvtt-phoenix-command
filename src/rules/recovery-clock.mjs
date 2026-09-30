// §2.10 (LEG10200 PDF 24) read against the world clock. A resolved recovery records the
// healing time, the Table 8B incapacitation time and whether the knockout roll was made; what
// the wound costs *now* depends on how long ago it happened:
//   - the first hour, knockout made: nothing but disabling injuries (adrenalin);
//   - knockout failed: incapacitated for Table 8B's time, then Healing Time / 20;
//   - from one hour after the wound: days remaining / 20, until it has healed.
// Time is Foundry world time in seconds. The clock is counted from the wound when it was
// recorded, otherwise from the recovery's resolution, and says which.
import {parseDuration} from '../data/medical.mjs';
import {woundedCapability} from './medical.mjs';

const HOUR=3600,DAY=86400;

export function recoveryClock(recovery,now){
  if(!recovery||recovery.outcome!=='survived')return {state:recovery?.outcome==='died'?'died':'unresolved',woundPenalty:0};
  if(!Number.isFinite(now))return {state:'unknown',woundPenalty:0,detail:'World time is unavailable, so the healing clock cannot be read.'};
  const fromWound=Number.isFinite(recovery.injuredAtWorldTime);
  const anchor=fromWound?recovery.injuredAtWorldTime:recovery.resolvedAtWorldTime;
  if(!Number.isFinite(anchor)||!Number.isFinite(recovery.healingTimeDays))
    return {state:'unknown',woundPenalty:recovery.actionPenalty??0,detail:'This recovery has no recorded time, so its penalty stays as resolved.'};
  const basis=fromWound?'since the wound':'since recovery was resolved (the wound time was not recorded)';
  const elapsed=Math.max(0,now-anchor);
  const daysRemaining=Math.max(0,recovery.healingTimeDays-elapsed/DAY);
  const failed=recovery.penaltyCategory==='recent-knockout-failed';
  if(failed&&recovery.incapacitationTime){
    const until=anchor+parseDuration(recovery.incapacitationTime).seconds;
    if(now<until)return {state:'incapacitated',woundPenalty:0,incapacitatedUntil:until,remainingSeconds:until-now,daysRemaining,basis,
      detail:`§2.10: incapacitated for Table 8B's ${recovery.incapacitationTime} ${basis}.`};
  }
  if(daysRemaining<=0)return {state:'healed',woundPenalty:0,daysRemaining:0,basis,detail:`Healing time of ${recovery.healingTimeDays} days has passed ${basis}.`};
  if(elapsed<HOUR){
    const capability=woundedCapability({recent:true,knockoutRollMade:!failed,healingTimeDays:failed?recovery.healingTimeDays:null});
    return {state:'recent',woundPenalty:capability.actionPenalty,daysRemaining,basis,detail:capability.detail};
  }
  const capability=woundedCapability({recent:false,daysRemaining});
  return {state:'healing',woundPenalty:capability.actionPenalty,daysRemaining,basis,detail:capability.detail};
}
