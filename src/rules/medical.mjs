// Medical aid and recovery, LEG10200 §2.9 (PDF 22-24 / printed 17-19) and §2.10
// (PDF 24 / printed 19), against Tables 8A, 8B and 8C in `../data/medical.mjs`.
//
// This is the aftermath of a fight rather than part of one: what a wound does to a man once
// the shooting stops, whether he lives, how long he is out of it, and what he can still do
// while he heals. Nothing here touches the encounter clock or the scene.
import {recoveryTable,incapacitationTable,incapacitationRollBands,careLevels,careLabels,
  technologyByDate,techLevels,medicalSource} from '../data/medical.mjs';

export const medicalRulesSource='LEG10200 §2.9 PDF 22-24, §2.10 PDF 24; Tables 8A/8B/8C PDF 68';

const finite=value=>typeof value==='number'&&Number.isFinite(value);

// §2.9: "Damage Total (DT) = PD Total X 10 / Health Characteristic". The quotient is used as
// it falls; it is the table LOOKUP that rounds, and it rounds down to a printed line rather
// than to the nearest integer.
export function damageTotal({physicalDamage,health}){
  if(!finite(physicalDamage)||physicalDamage<0)throw new Error('Total Physical Damage must be a number of zero or more.');
  if(!finite(health)||health<=0)throw new Error('The Health characteristic is needed to work out a Damage Total.');
  return physicalDamage*10/health;
}

// §2.9: "If there is no entry for the character's DT, then the next lower entry should be
// used. A DT of 34 would use the DT 30 line, for example."
//
// Below the table's first line there is no lower entry to fall back on, and the book does
// not print one. That is reported rather than invented: §2.6 calls a 3 PD wound superficial
// and "little threat to one's health", which is a description, not a healing time.
export function recoveryRow(dt){
  if(!finite(dt)||dt<0)throw new Error('A Damage Total must be a number of zero or more.');
  let found=null;
  for(const row of recoveryTable)if(row.damageTotal<=dt)found=row;else break;
  if(!found)return {row:null,belowTable:true,
    detail:`A Damage Total of ${round(dt,2)} is below Table 8A's first line of ${recoveryTable[0].damageTotal}, and the table prints no lower entry. The book treats wounds this small as superficial; it gives them no healing time or Recovery Roll.`,
    source:medicalSource};
  return {row:found,belowTable:false,
    detail:found.damageTotal===dt?`Table 8A's DT ${found.damageTotal} line.`
      :`Damage Total ${round(dt,2)} reads Table 8A's next lower line, DT ${found.damageTotal}.`,
    source:medicalSource};
}

// What one level of care offers this Damage Total. The trauma centre needs its technology
// level as well, because the table gives it six Recovery Rolls rather than one.
export function careOutcome(row,care,techLevel=null){
  if(!careLevels.includes(care))throw new Error(`"${care}" is not a Table 8A level of care. Choose one of: ${careLevels.join(', ')}.`);
  if(care!=='trauma-center')return {...row.care[care],care,label:careLabels[care]};
  if(!techLevels.includes(techLevel))
    throw new Error(`A trauma centre is rated by technology level; Table 8A prints ${techLevels.join(', ')}. Table 8C dates them.`);
  const block=row.care['trauma-center'],entry=block.byTechLevel[techLevel];
  return {...entry,care,techLevel,label:`${careLabels['trauma-center']}, technology level ${techLevel}`,
    criticalTimePeriod:entry.shaded?null:block.criticalTimePeriod,
    detail:entry.shaded
      ?`Trauma centre at technology level ${techLevel}: inside Table 8A's shaded block, which the table labels RR = 99.`
      :entry.recoveryRoll===null
        ?`Trauma centre at technology level ${techLevel}: a Critical Time Period of ${block.criticalTimePeriod.printed} with no Recovery Roll printed — §2.9 makes that automatic death at the end of it.`
        :`Trauma centre at technology level ${techLevel}: ${block.criticalTimePeriod.printed} to reach it, then a Recovery Roll of ${entry.recoveryRoll}.`};
}

// The whole of §2.9 for one wounded man: his Damage Total, his healing time, and what each
// level of care would do for him. `care` and `techLevel` name the care he actually got.
export function recovery({physicalDamage,health,care='none',techLevel=null}){
  const dt=damageTotal({physicalDamage,health});
  const lookup=recoveryRow(dt);
  if(lookup.belowTable)return {damageTotal:dt,belowTable:true,row:null,
    healingTimeDays:null,outcome:null,options:null,detail:lookup.detail,source:medicalSource};
  const row=lookup.row;
  const options=careLevels.map(level=>level==='trauma-center'
    ?techLevels.map(tl=>careOutcome(row,level,tl))
    :[careOutcome(row,level)]).flat();
  const outcome=careOutcome(row,care,techLevel);
  return {damageTotal:dt,belowTable:false,row,healingTimeDays:row.healingTimeDays,
    outcome,options,detail:lookup.detail,source:medicalSource};
}

// §2.9: "At the end of the CTP, he must make his Recovery Roll; if he makes this roll, he
// will survive. If he fails, he dies." The example settles the comparison: with RR 30, "if
// less than or equal to 30 is rolled, he survives".
//
// A printed 00 is therefore a one-in-a-hundred chance and is NOT the same as a blank, which
// §2.9 makes automatic death. The two are kept apart all the way to here.
export function resolveRecoveryRoll(outcome,roll){
  if(!Number.isInteger(roll)||roll<0||roll>99)throw new Error('A Recovery Roll is a whole 00-99 number.');
  if(outcome.recoveryRoll===null)return {survives:false,automatic:true,roll,
    detail:'No Recovery Roll is printed for this Damage Total at this level of care, so §2.9 makes it death at the end of the Critical Time Period unless better aid is found.'};
  const survives=roll<=outcome.recoveryRoll;
  return {survives,automatic:false,roll,threshold:outcome.recoveryRoll,
    detail:`Rolled ${String(roll).padStart(2,'0')} against a Recovery Roll of ${outcome.recoveryRoll}: ${survives?'survives':'dies'}. The roll succeeds at or under the printed number.`};
}

// §2.9: "Any character who remains in a Trauma Center throughout the first third of his
// Healing Time may reduce his total Healing Time by 20%." Both of the book's worked examples
// round the reduction to a whole number of days: 60 days gives 12, and 88 gives 18.
export function healingTime({healingTimeDays,traumaCentreFirstThird=false}){
  if(!finite(healingTimeDays)||healingTimeDays<0)throw new Error('A healing time is a number of days.');
  if(!traumaCentreFirstThird)return {days:healingTimeDays,reducedBy:0,
    detail:`Table 8A's healing time of ${healingTimeDays} days.`};
  const reduction=nearest(healingTimeDays*0.2);
  return {days:healingTimeDays-reduction,reducedBy:reduction,
    firstThirdDays:healingTimeDays/3,
    detail:`${healingTimeDays} days, less 20% (${reduction} days) for remaining in a trauma centre through the first third of it — ${round(healingTimeDays/3,1)} days.`};
}

// §2.10, Table 8B: "The time a character remains dazed or knocked out is found on the
// Incapacitation Time Table (8B) by cross-indexing a 0-9 roll and the PD Total. Round the PD
// down to the nearest entry." The book's own example: a PD Total of 49 uses the 0 PD line.
export function incapacitationTime({physicalDamage,roll}){
  if(!finite(physicalDamage)||physicalDamage<0)throw new Error('Total Physical Damage must be a number of zero or more.');
  if(!Number.isInteger(roll)||roll<0||roll>9)throw new Error('The incapacitation roll is a whole 0-9 number.');
  let found=null;
  for(const row of incapacitationTable)if(row.physicalDamage<=physicalDamage)found=row;else break;
  if(!found)throw new Error('Table 8B starts at a PD Total of 0; a negative total has no line.');
  const index=incapacitationRollBands.findIndex(band=>roll>=band.from&&roll<=band.to);
  const time=found.times[index];
  return {time,row:found.physicalDamage,band:incapacitationRollBands[index].label,
    detail:`PD Total ${physicalDamage} reads Table 8B's ${found.physicalDamage} line; a roll of ${roll} is the ${incapacitationRollBands[index].label} column: ${time.printed}.`,
    source:medicalSource};
}

// §2.10's three categories, and the Combat Action penalty each carries.
//
//   Recent wounds, knockout roll made  - "he is affected only by Disabling Injuries
//                                        (Section 2.7) and can continue combat subject only
//                                        to those limitations."
//   Recent wounds, knockout roll failed - incapacitated for Table 8B's time, then "a penalty
//                                        of Healing Time / 20 points subtracted from his
//                                        Combat Actions".
//   Old healing injuries                - "From one hour after the injury until the time the
//                                        wounds heal, the character suffers a 'Days' / 20
//                                        point penalty to his Combat Actions. 'Days' are the
//                                        number of days remaining until the injuries heal."
//
// The book rounds these to the nearest whole point in its own examples: 30/20 = 1.5 "rounds
// to 2 points", and 29/20 = 1.45 "rounds down to 1".
export function woundedCapability({recent,knockoutRollMade=null,healingTimeDays=null,daysRemaining=null}){
  if(typeof recent!=='boolean')throw new Error('Say whether these are recent wounds: §2.10 makes them old an hour after the injury.');
  if(recent){
    if(typeof knockoutRollMade!=='boolean')throw new Error('A recent wound’s capability depends on whether the knockout roll was made.');
    if(knockoutRollMade)return {category:'recent-knockout-made',actionPenalty:0,
      detail:'§2.10: while he makes his knockout roll, recent wounds cost him nothing but his disabling injuries. Adrenalin covers the rest until the hour is up.',
      source:medicalSource};
    if(!finite(healingTimeDays)||healingTimeDays<0)throw new Error('A failed knockout roll needs the healing time, which sets the penalty once he comes round.');
    return {category:'recent-knockout-failed',actionPenalty:nearest(healingTimeDays/20),
      detail:`§2.10: incapacitated for Table 8B's time, and then Healing Time / 20 = ${round(healingTimeDays/20,2)}, which rounds to ${nearest(healingTimeDays/20)} Combat Action(s).`,
      source:medicalSource};
  }
  if(!finite(daysRemaining)||daysRemaining<0)throw new Error('An old healing injury is priced by the days remaining until it heals.');
  return {category:'old-healing',actionPenalty:nearest(daysRemaining/20),
    detail:`§2.10: ${round(daysRemaining,2)} days remaining / 20 = ${round(daysRemaining/20,2)}, which rounds to ${nearest(daysRemaining/20)} Combat Action(s).`,
    source:medicalSource};
}

// Table 8C: what a given year can actually offer. A date outside the printed span is
// reported as outside it rather than clamped to an end.
export function careAvailableIn(year){
  if(!Number.isInteger(year))throw new Error('A campaign year is a whole number.');
  const entry=technologyByDate.find(row=>year>=row.from&&year<=row.to);
  if(!entry)return {available:null,outsideTable:true,
    detail:`Table 8C runs from ${technologyByDate[0].from} to ${technologyByDate.at(-1).to}; ${year} is outside it, so the best available care is an adjudication.`,
    source:medicalSource};
  return {available:entry.best,techLevel:entry.techLevel??null,outsideTable:false,
    detail:entry.techLevel
      ?`Table 8C: ${entry.from}-${entry.to} is a technology level ${entry.techLevel} trauma centre.`
      :`Table 8C: ${entry.from}-${entry.to} reaches ${careLabels[entry.best]} and no further.`,
    source:medicalSource};
}

// The book rounds to the nearest whole point, with .5 going up: its own examples take 1.5 to
// 2 and 1.45 to 1.
const nearest=value=>Math.round(value);
const round=(value,places)=>Number(value.toFixed(places));
