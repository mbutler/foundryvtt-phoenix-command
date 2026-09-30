import {incapacitationTime} from './medical.mjs';
import {parseDuration} from '../data/medical.mjs';

// LEG10200 §5.13 Incapacitation Effects (optional), PDF 58–59 / printed 53–54, read from the
// page at 4x. "To use this table, simply cross-index the Knockout Roll with the PD Total to
// determine the Incapacitation effects." Each range sits inside the failed rolls of its row
// of the §2.7 knockout table (10, 25, 75, 98, 98), so a failed roll always lands on one.
//
//   Knocked Out  - "The character is unconscious." Table 8B time.
//   Stunned      - "semi-conscious but incapable of action or coherent thought." Table 8B.
//   Dazed        - "drops to the ground conscious but incapable of offensive action or
//                   thought. After 1 Impulse, a dazed character may flee to cover and take
//                   non-offensive actions at 1/2 normal CA." Table 8B with -1 to the 0-9 roll.
//   Disoriented  - "fully functional except for Disabling Injuries and may flee or duck to save
//                   himself. He is incapable of offensive action and may not advance toward the
//                   enemy." Table 8B with -2 to the 0-9 roll.
//
// Readings (28 September 2026): the row is the one the failed knockout check was read on; the
// "200+" row is used whenever that figure is 200 or more. The Table 8B time runs on the
// encounter clock from the end of the impulse of the knockout. "May not advance toward the
// enemy" is shown to the player, not enforced: which way is toward the enemy is not a thing
// the map can say for him.
export const incapacitationEffectsSource='LEG10200 §5.13, PDF 58–59 · visual check';
const rows={
  'over KV/10':[[0,0],[1,2],[3,5],[6,9]],
  'over KV':[[0,2],[3,8],[9,16],[17,24]],
  'over 2 x KV':[[0,13],[14,31],[32,52],[53,74]],
  'over 3 x KV':[[0,26],[27,53],[54,82],[83,97]],
  '200+':[[0,60],[61,94],[95,96],[97,97]]};
export const incapacitationEffectKinds=Object.freeze(['knockedOut','stunned','dazed','disoriented']);
export const incapacitationEffectLabels=Object.freeze({knockedOut:'Knocked out',stunned:'Stunned',dazed:'Dazed',disoriented:'Disoriented'});
const rollModifier={knockedOut:0,stunned:0,dazed:-1,disoriented:-2};

export function incapacitationEffect({row,knockoutPhysicalDamage,roll}){
  const key=knockoutPhysicalDamage>=200?'200+':row;
  const ranges=rows[key];
  if(!ranges)throw new Error(`§5.13 has no row for "${row}".`);
  const index=ranges.findIndex(([from,to])=>roll>=from&&roll<=to);
  // A roll past a row's last range was not a failure; the caller only asks about failures.
  const effect=incapacitationEffectKinds[index===-1?0:index];
  return {effect,row:key,detail:`Knockout roll ${String(roll).padStart(2,'0')} on the ${key} row: ${incapacitationEffectLabels[effect]}.`};
}

// Table 8B's time for the effect: the 0-9 roll, less 1 dazed or 2 disoriented (not below 0).
export function incapacitationEffectTime({effect,physicalDamage,roll}){
  const adjusted=Math.max(0,roll+rollModifier[effect]);
  const read=incapacitationTime({physicalDamage,roll:adjusted});
  return {roll,adjusted,printed:read.time.printed,seconds:parseDuration(read.time.printed).seconds,
    detail:`${incapacitationEffectLabels[effect]} for ${read.time.printed} (Table 8B, roll ${roll}${adjusted!==roll?` ${rollModifier[effect]} = ${adjusted}`:''}).`};
}

// What each effect lets him do while it lasts.
export const effectRules=Object.freeze({
  knockedOut:{conscious:false,offensive:false},
  stunned:{conscious:false,offensive:false},
  dazed:{conscious:true,offensive:false,proneAtOnce:true,firstImpulseLost:true,halfActions:true},
  disoriented:{conscious:true,offensive:false}});
