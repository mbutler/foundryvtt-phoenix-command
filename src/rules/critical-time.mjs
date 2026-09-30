// §2.9's Critical Time Period on the world clock (LEG10200 PDF 23-24, Table 8A PDF 68).
// "When a character is injured, he has this much time to seek Medical Aid before the player
// rolls to see if he survives." Better aid lengthens it, but "the time available is still
// assumed to have begun when the injury took place." A blank Recovery Roll is automatic death
// at its end "unless better Medical Aid is found".
//
// The clock runs for wounds not yet covered by a resolved recovery, from the earliest of them,
// using the care the GM has recorded as reached (No aid until then). It reports; it never rolls
// or kills. Care recorded before these wounds belongs to an earlier injury and is ignored.
import {recoveryRow,careOutcome} from './medical.mjs';

export function pendingWounds(injuries,recovery){
  const resolvedAt=recovery?.outcome&&recovery.outcome!=='unknown'&&Number.isFinite(recovery.resolvedAtWorldTime)?recovery.resolvedAtWorldTime:null;
  return Object.values(injuries??{}).filter(injury=>injury?.status==='active'&&(resolvedAt===null||!Number.isFinite(injury.worldTime)||injury.worldTime>resolvedAt));
}

export function criticalTime({injuries,recovery,health,physicalDamage,aid,now}){
  if(recovery?.outcome==='died')return {state:'none'};
  const wounds=pendingWounds(injuries,recovery);
  if(!wounds.length)return {state:'none'};
  if(!Number.isFinite(health)||health<=0)return {state:'unknown',detail:'Record Health to read the Critical Time Period.'};
  const lookup=recoveryRow(physicalDamage*10/health);
  if(lookup.belowTable)return {state:'superficial',detail:lookup.detail};
  const times=wounds.map(w=>w.worldTime);
  if(times.some(t=>!Number.isFinite(t)))return {state:'unknown',detail:'A wound has no recorded time, so its Critical Time Period cannot be counted. Resolve recovery when the fiction says time is up.'};
  const woundedAt=Math.min(...times);
  const current=Number.isFinite(aid?.recordedAtWorldTime)&&aid.recordedAtWorldTime>=woundedAt&&aid.care&&aid.care!=='none'?aid:{care:'none',techLevel:null};
  let outcome;
  try{outcome=careOutcome(lookup.row,current.care,current.techLevel??null);}
  catch(error){return {state:'unknown',care:current.care,detail:error.message};}
  const base={care:current.care,techLevel:current.techLevel??null,label:outcome.label,woundedAt,recoveryRoll:outcome.recoveryRoll,
    automaticDeath:outcome.recoveryRoll===null};
  if(!outcome.criticalTimePeriod)return {...base,state:'no-ctp',detail:`${outcome.label}: Table 8A's shaded block, Recovery Roll 99 with no Critical Time Period.`};
  const deadline=woundedAt+outcome.criticalTimePeriod.seconds;
  const remainingSeconds=deadline-(Number.isFinite(now)?now:woundedAt);
  const due=remainingSeconds<=0;
  return {...base,state:due?'due':'running',criticalTimePeriod:outcome.criticalTimePeriod.printed,deadline,remainingSeconds:Math.max(0,remainingSeconds),
    detail:due
      ?(base.automaticDeath?`${outcome.label}'s Critical Time Period of ${outcome.criticalTimePeriod.printed} has ended with no Recovery Roll printed: §2.9 makes that death unless better aid was found in time.`
        :`${outcome.label}'s Critical Time Period of ${outcome.criticalTimePeriod.printed} has ended: the Recovery Roll of ${outcome.recoveryRoll} is due.`)
      :`${outcome.label}: ${outcome.criticalTimePeriod.printed} from the wound${base.automaticDeath?', and no Recovery Roll is printed — better aid is needed before it ends':`, then a Recovery Roll of ${outcome.recoveryRoll}`}.`};
}

export function formatRemaining(seconds){
  if(!(seconds>0))return 'now';
  const units=[[86400,'d'],[3600,'h'],[60,'min'],[1,'s']];
  const parts=[];let rest=Math.ceil(seconds);
  for(const [size,label] of units){if(rest>=size&&parts.length<2){parts.push(`${Math.floor(rest/size)} ${label}`);rest%=size;}}
  return parts.join(' ');
}
