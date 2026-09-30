import {deriveAllowance} from '../rules/allowance.mjs';
import {summarizeInventory} from '../rules/summary.mjs';
import {recoveryClock} from '../rules/recovery-clock.mjs';

// The sheet and encounter use the same tables and carried-weight accounting.
// §2.10's wound penalty is spent against Combat Actions, as it stands on the world clock now.
// A character still incapacitated by Table 8B's time has no allowance to derive.
export function actorAllowance(actor,now=globalThis.game?.time?.worldTime,{mode='gun'}={}){
  if(!actor)return {resolved:false,detail:'This token has no character.'};
  try{
    const clock=recoveryClock(actor.system.recovery,now);
    if(clock.state==='incapacitated')return {resolved:false,detail:`${clock.detail} ${Math.ceil(clock.remainingSeconds/60)} minute(s) remain.`};
    const s=actor.system,items=Array.from(actor.items??[]);
    const inventory=summarizeInventory(items);
    if(inventory.missingWeightIds.length){
      const names=inventory.missingWeightIds.map(id=>items.find(i=>i.id===id)?.name??id);
      return {resolved:false,detail:`Missing carried weight: ${names.join(', ')}. Open Character to correct the equipment.`};
    }
    return deriveAllowance({strength:s.attributes?.strength,agility:s.attributes?.agility,
      intelligence:s.attributes?.intelligence,will:s.attributes?.will,gunCombatSkill:s.skills?.gun,
      handToHandSkill:s.skills?.melee,unarmedSkill:s.skills?.unarmed,
      encumbranceLb:inventory.totalWeightLb,woundPenalty:clock.woundPenalty,mode});
  }catch(error){return {resolved:false,detail:error.message};}
}

function deriveEntry(entry,actor){
  const mode=entry.combatMode??'gun';
  const derived=actorAllowance(actor,undefined,{mode});
  entry.allowance=derived.resolved?derived.value:null;
  entry.allowanceIssue=derived.resolved?null:derived.detail;
  entry.reason='';
  entry.allowanceSource={source:'derived',automatic:true,mode,provenance:derived.resolved?structuredClone(derived.provenance):null};
}

// Read-only projection until the next coordinator command persists it. Existing
// spent actions and in-flight effects keep their impulse's recorded allowance.
// User ruling (26 Sep 2026): a combatant fighting hand-to-hand spends LEG10204's Combat
// Actions. A switch of mode waits for a new phase, so a phase is never re-budgeted.
export function refreshEncounterAllowances(state,combatants){
  if(state.pendingEffect||state.batch||state.reactions)return state;
  for(const combatant of combatants){
    let entry=state.entries[combatant.id];
    if(entry?.pendingCombatMode&&state.impulse===1&&!entry.spent){entry.combatMode=entry.pendingCombatMode;delete entry.pendingCombatMode;}
    if(entry?.spent||entry?.allowance&&(entry.allowanceSource?.source!=='derived'))continue;
    entry??=state.entries[combatant.id]={allowance:null,reason:'',spent:0,activity:null,history:[]};
    deriveEntry(entry,combatant.actor);
  }
  return state;
}

// Which Combat Actions an order is fought with: a strike, recovery, parry or melee defence is
// hand-to-hand; a shot, burst, blast, throw, launch or reload is gun combat; anything else
// (movement, posture, equipment) leaves the mode as it is.
export function orderCombatMode(command){
  if(command?.kind==='meleeDefence')return 'hand-to-hand';
  const kind=command?.kind==='activity'?command.weaponRequest?.kind:null;
  if(['strike','recover','parry'].includes(kind))return 'hand-to-hand';
  if(['shot','burst','shotgun','grenade','launcher','reload'].includes(kind))return 'gun';
  return null;
}

// Before an order spends anything: switch now if nothing has been spent this phase (impulse 1,
// or before the encounter starts), otherwise record the switch for the next phase.
export function applyOrderCombatMode(state,combatantId,mode,actor){
  const entry=state.entries[combatantId];
  if(!entry||!mode)return state;
  if((entry.combatMode??'gun')===mode){delete entry.pendingCombatMode;return state;}
  if(!state.phase||(state.impulse===1&&!entry.spent)){
    entry.combatMode=mode;delete entry.pendingCombatMode;
    if(!entry.allowance||entry.allowanceSource?.source==='derived')deriveEntry(entry,actor);
  }else entry.pendingCombatMode=mode;
  return state;
}

// LEG10204 Table 2D's Damage Bonus for this character, or null when it cannot be derived.
export function derivedDamageBonus(actor){
  const derived=actorAllowance(actor,globalThis.game?.time?.worldTime,{mode:'hand-to-hand'});
  return derived.resolved?derived.damageBonus:null;
}
