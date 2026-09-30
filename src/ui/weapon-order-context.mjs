import {assertFireFacing} from '../foundry/facing.mjs';
import {visibleEncounterTarget} from '../rules/target-eligibility.mjs';
import {weaponActivity} from '../rules/weapon-timing.mjs';
import {projectActivity} from '../rules/activity-projection.mjs';
import {actionBalance} from '../rules/timing.mjs';
import {validateThrowPlanRange} from '../foundry/grenade-scene.mjs';
import {equippedModes,supportsOrder,compatibleAmmunition,preferredMode,weaponOrderKinds,isMeleeOrder,needsTarget} from './weapon-order-options.mjs';

function aimOptions(row){
  return Object.keys(row?.mode.aimModifiers??{}).filter(k=>Number.isSafeInteger(Number(k))&&Number(k)>0).sort((a,b)=>Number(a)-Number(b));
}
const combatantsOf=combat=>typeof combat.combatants?.filter==='function'?combat.combatants:[...combat.combatants.values()];
const combatantById=(combat,id)=>combat.combatants.get?.(id)??combatantsOf(combat).find(c=>c.id===id);

export function existingAttackTarget(combat,attacker,user=game.user){
  for(const token of Array.from(user.targets??[])){
    const target=combatantsOf(combat).find(c=>c.token?.uuid===token.document.uuid);
    if(target?.id!==attacker.id&&visibleEncounterTarget(target,user))return token.document.uuid;
  }
  return null;
}

export function resolveWeaponOrderContext({snapshot,combat,state,combatantId,selection={},user=game.user}){
  const modes=equippedModes(snapshot.items);
  const kinds=Object.keys(weaponOrderKinds).filter(k=>modes.some(m=>supportsOrder(m,k)));
  const requested=selection.kind==='melee'?'strike':selection.kind==='firearm'?'shot':selection.kind;
  let kind=requested&&kinds.includes(requested)?requested:null;
  const rowsForKind=kind?modes.filter(m=>supportsOrder(m,kind)):[];
  let modeIndex=null;
  if(rowsForKind.length===1)modeIndex=0;
  else if(kind&&selection.itemId){
    try{modeIndex=preferredMode(rowsForKind,selection);}catch{modeIndex=null;}
  }
  const row=modeIndex!==null?rowsForKind[modeIndex]:null;
  let ammunitionId=null;
  if(row&&!isMeleeOrder(kind)){
    const ammo=compatibleAmmunition(snapshot.items,row);
    if(ammo.length===1)ammunitionId=ammo[0].id;
    else if(row.weapon.system.loaded?.ammunitionItemId&&ammo.some(i=>i.id===row.weapon.system.loaded.ammunitionItemId))
      ammunitionId=row.weapon.system.loaded.ammunitionItemId;
  }
  let targetUuid=selection.targetUuid??existingAttackTarget(combat,combatantById(combat,combatantId),user)??null;
  if(!targetUuid&&needsTarget(kind)&&kind!=='burst'){
    const visible=combatantsOf(combat).filter(c=>c.id!==combatantId&&visibleEncounterTarget(c,user));
    if(visible.length===1)targetUuid=visible[0].token.uuid;
  }
  let aimActions=null;
  if(row&&needsTarget(kind)&&!['strike','reload','recover','parry'].includes(kind)){
    const aims=aimOptions(row);
    if(aims.length===1)aimActions=Number(aims[0]);
    else if(selection.aimActions!=null&&aims.includes(String(selection.aimActions)))aimActions=Number(selection.aimActions);
  }
  let attackId=selection.attackId??null;
  if(kind==='strike'&&row){
    const attacks=Object.keys(row.mode.attacks??{});
    if(attacks.length===1)attackId=attacks[0];
  }
  // A charge is thrown after no sets (its ID carries the closing speed).
  const sets=selection.sets??(row?.mode.attacks?.[attackId]?.traits?.includes('charge')?0:1);
  const ambiguous=[];
  if(!kind||(!requested&&kinds.length>1))ambiguous.push('kind');
  if(kind&&modeIndex===null)ambiguous.push('mode');
  if(row&&!isMeleeOrder(kind)&&!ammunitionId&&compatibleAmmunition(snapshot.items,row).length>1)ambiguous.push('ammunitionId');
  if(needsTarget(kind)&&kind!=='burst'&&!targetUuid)ambiguous.push('targetUuid');
  if(row&&needsTarget(kind)&&!['strike','reload','recover','parry'].includes(kind)&&aimActions===null)ambiguous.push('aimActions');
  if(kind==='strike'&&row&&!attackId)ambiguous.push('attackId');
  const request=row?{kind,weaponId:row.weapon.id,modeId:row.modeId,
    ...(ammunitionId?{ammunitionId}:{}),
    ...(attackId?{attackId}:{}),
    ...(kind==='strike'?{sets,...selection.agilitySkillFactor!=null?{agilitySkillFactor:selection.agilitySkillFactor}:{}}:{}),
    ...(needsTarget(kind)&&kind!=='burst'&&targetUuid?{targetUuid}:{}),
    ...(aimActions!=null?{aimActions}:{})}:null;
  return {kinds,kind,modeIndex,row,rowsForKind,request,ambiguous,targetUuid,ammunitionId,aimActions,attackId,sets};
}

export function previewWeaponOrder(snapshot,state,combatantId,request,combat){
  const plan=weaponActivity(snapshot,request);
  if(combat){
    validateThrowPlanRange(combat,combatantId,plan);
    if(['shot','shotgun','launcher'].includes(plan.kind)){
      const shooter=combatantById(combat,combatantId)?.token;
      const target=combatantsOf(combat).find(c=>c.token?.uuid===plan.targetUuid)?.token;
      if(shooter&&target)assertFireFacing(shooter,target);
    }
  }
  const entry=state.entries[combatantId];
  if(!entry?.allowance)throw new Error('Set a small-arms allowance before planning a weapon activity.');
  const end=projectActivity({allowance:entry.allowance,phase:state.phase,impulse:state.impulse,remaining:actionBalance(state,combatantId),cost:plan.cost});
  return {plan,end,
    detail:`${plan.cost} action${plan.cost===1?'':'s'} · Earliest Phase ${end.phase} / Impulse ${end.impulse}. ${['shot','shotgun','grenade','launcher','strike'].includes(plan.kind)?'Preparation continues through the encounter clock; fire resolves after reactions.':plan.kind==='reload'?'Ammunition loads on completion.':'The order takes effect on completion.'}`};
}
