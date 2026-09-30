import {orderStatus} from './order-status.mjs';
import {earlyFireAction,canPrepareActivity} from './order-actions.mjs';
import {selectWeaponActivity} from './weapon-activity.mjs';
import {submitPlayerIntent,coordinatorStatus,awaitIntentReceipt} from '../application/player-intents.mjs';
import {reusableShotConditions} from '../foundry/shot-conditions.mjs';

// All encounter entry points submit through the same validated coordinator boundary.
export async function openCombatWeaponOrder(combat,id,selection={}) {
  const combatant=combat.combatants.get(id);
  if(!combatant?.actor?.testUserPermission(game.user,'OWNER'))throw new Error('You must own this combatant.');
  const state=structuredClone(combat.timing);
  if(!state.phase)throw new Error('The GM must begin the encounter before orders can be committed.');
  const coordination=coordinatorStatus();
  if(!coordination.accepting)throw new Error(coordination.detail??'Waiting for the GM coordinator.');
  const activity=state.entries[id]?.activity;
  const shot=activity?.shotId?combat.getFlag('phoenix-command',`shots.${activity.shotId}`):null;
  if(activity&&(activity.progress<activity.cost||['ready','rolled'].includes(shot?.status))){
    const targetId=combat.targetFor?.(activity.weaponPlan)?.id;
    const early=earlyFireAction(state,id,{targetId});
    const canWork=canPrepareActivity(state,id,{targetId});
    const reviewed=!!(shot?.adjudication||shot&&reusableShotConditions(combat,shot));
    if(shot?.status==='ready'&&shot.plan.kind==='burst'&&!state.reactions){
      await ui.combat.command(combat,state,id,'designateArc',{disabled:false});return null;
    }
    const next=canWork?'work':early?'fireNow':null;
    if(next){
      await sendOrder(combat,{kind:next,combatantId:id,expectedRevision:state.revision,id:foundry.utils.randomID()});
      await continueAttack(combat,id);return null;
    }
    ui.notifications.info(orderStatus(state,id,{shot,reviewed,targetId}));
    return null;
  }
  const fields=await selectWeaponActivity(combat,state,id,selection);
  if(!fields)return null;
  // Keep the opening revision: a dialog must never silently commit against a newer impulse.
  const command={kind:'activity',combatantId:id,expectedRevision:state.revision,id:foundry.utils.randomID(),...fields};
  await sendOrder(combat,command);
  await continueAttack(combat,id);
  return combat;
}

export function encounterCombatant(actor,tokens,combat,sceneId) {
  if(!combat?.started||combat.scene?.id!==sceneId)return null;
  const matches=tokens.filter(t=>t.visible&&(actor.isToken?t.document.uuid===actor.token.uuid:t.document.actorId===actor.id));
  const controlled=matches.filter(t=>t.controlled);
  const token=controlled.length===1?controlled[0]:matches.length===1?matches[0]:null;
  if(!token)throw new Error('Control one token for this character.');
  const combatant=combat.combatants.find(c=>c.token?.uuid===token.document.uuid);
  if(!combatant)throw new Error('Add this token to the active encounter before giving combat orders.');
  return combatant;
}

async function sendOrder(combat,command){
  if(game.user.isGM)return combat.timingCommand(command);
  const message=await submitPlayerIntent(combat,command);
  const receipt=await awaitIntentReceipt(combat,message.id);
  if(receipt?.status!=='accepted')throw new Error(receipt?.reason??'The order was not accepted.');
  return receipt;
}
async function continueAttack(combat,id){
  const state=combat.timing;
  const shot=combat.getFlag('phoenix-command',`shots.${state.entries[id]?.activity?.shotId}`);
  const a=state.entries[id]?.activity;
  if(shot?.status==='ready'&&shot.plan.kind==='burst'&&!shot.arc&&!state.reactions&&!(a?.plannedArc&&!a.plannedArcIssue))
    await ui.combat.command(combat,state,id,'designateArc',{disabled:false});
}
