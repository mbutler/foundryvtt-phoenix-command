import {publicEncounterTarget} from '../rules/target-eligibility.mjs';
import {serialized,requireCoordinator,localCoordinatorSession,setCoordinatorSession} from './coordinator.mjs';
import {playerCommand,coordinatorState} from '../rules/player-intent.mjs';
import {escapeHTML} from '../foundry/context.mjs';
const scope='phoenix-command';
export const intentSession=()=>game.settings.get(scope,'intentSession')?.nonce??null;
export const coordinatorStatus=()=>coordinatorState({isGM:game.user.isGM,isActiveGM:game.users.activeGM?.id===game.user.id,
  localSession:localCoordinatorSession(),worldSession:intentSession(),sessionCurrent:!!game.users.activeGM&&game.settings.get(scope,'intentSession')?.userId===game.users.activeGM.id,coordinatorName:game.users.activeGM?.name??null});
export function validateIntent(combat,intent){
  const {request,authorId}=intent,user=game.users.get(authorId),c=combat.combatants.get(request.command?.combatantId);
  if(!user||user.isGM||!user.active)throw new Error('The requesting player must be connected.');
  requireCoordinator();
  const target=['rollShot','fireNow'].includes(request.command?.kind)?combat.timing.entries[c?.id]?.activity?.weaponPlan?.targetUuid:(request.command?.weaponRequest??request.command?.then?.weaponRequest)?.targetUuid;
  const targetCombatant=target?combat.combatants.find(c=>c.token?.uuid===target):null;
  return playerCommand(request,{owned:!!c?.actor?.testUserPermission(user,'OWNER'),actorUuid:c?.actor?.uuid,actor:c?.actor,
    clockRevision:combat.timing.clockRevision,session:localCoordinatorSession(),activity:combat.timing.entries[c?.id]?.activity,
    targetAllowed:!target||publicEncounterTarget(targetCombatant)});
}
export async function awaitIntentReceipt(combat,messageId,{timeout=10000}={}){
  const read=()=>combat.getFlag(scope,`intents.${messageId}`);
  if(!read())await new Promise((resolve,reject)=>{
    const hook=Hooks.on('updateCombat',()=>{if(read()){clearTimeout(timer);Hooks.off('updateCombat',hook);resolve();}});
    const timer=setTimeout(()=>{Hooks.off('updateCombat',hook);reject(new Error('Coordinator response timed out'));},timeout);
  });
  const receipt=read();
  if(receipt?.status==='accepted'&&combat.timing.pendingEffect)await new Promise((resolve,reject)=>{
    const hook=Hooks.on('updateCombat',()=>{if(!combat.timing.pendingEffect){clearTimeout(timer);Hooks.off('updateCombat',hook);resolve();}});
    const timer=setTimeout(()=>{Hooks.off('updateCombat',hook);reject(new Error('Pending effect did not complete'));},timeout);
  });
  return receipt;
}
export async function submitPlayerIntent(combat,command){
  if(game.user.isGM)throw new Error('GM controls use the coordinator directly.');
  const actor=combat.combatants.get(command.combatantId)?.actor;
  if(!actor?.testUserPermission(game.user,'OWNER'))throw new Error('You must own this combatant.');
  const coordinator=game.users.activeGM;
  if(!coordinator||!coordinatorStatus().accepting)throw new Error('An active GM coordinator is required.');
  const request={version:1,combatUuid:combat.uuid,actorUuid:actor.uuid,clockRevision:combat.timing.clockRevision,session:intentSession(),command:structuredClone(command)};
  const message=await foundry.documents.ChatMessage.create({author:game.user.id,whisper:[coordinator.id],content:`<section class="phoenix-command"><p class="pc-record-kicker">ACTION REQUEST</p><h2>${escapeHTML(actor.name)}</h2><span class="pc-chip" data-tone="warn">${escapeHTML(command.kind)}</span></section>`,flags:{[scope]:{playerIntent:request}}});
  ui.notifications.info('Action requested. Status is shown on the request card.');return message;
}
export async function processPlayerIntent(message){
  try{requireCoordinator();}catch{return;}
  const request=structuredClone(message.getFlag(scope,'playerIntent'));
  if(!request)return;
  const combat=game.combats.find(c=>c.uuid===request.combatUuid);if(!combat)return;
  const intent={id:message.id,authorId:message.author?.id,request};
  try{await combat.timingCommand(request.command,{intent});}
  catch(error){
    // An accepted command may have an effect awaiting recovery. Never overwrite its receipt.
    await serialized(async()=>{requireCoordinator();if(!combat.getFlag(scope,`intents.${message.id}`))await combat.setFlag(scope,`intents.${message.id}`,{status:'rejected',authorId:intent.authorId,request,reason:error.message});});
    ui.notifications.warn(`Player request: ${error.message}`);
  }
}
export function registerPlayerIntents(){
  game.settings.register(scope,'intentSession',{scope:'world',config:false,type:Object,default:{}});
  Hooks.once('ready',async()=>{
    if(game.users.activeGM?.id===game.user.id){
      const localSession=foundry.utils.randomID();setCoordinatorSession(localSession);
      await game.settings.set(scope,'intentSession',{nonce:localSession,userId:game.user.id});
      // Old requests are visible but not replayed automatically after a reload/handover.
    }
  });
  Hooks.on('createChatMessage',message=>{if(message.getFlag(scope,'playerIntent'))void processPlayerIntent(message).catch(error=>ui.notifications.error(error.message));});
  const refresh=()=>{
    for(const message of game.messages.filter(m=>m.getFlag(scope,'playerIntent')))ui.chat.updateMessage(message);
    ui.combat.render({force:true});
  };
  Hooks.on('updateCombat',refresh);
  Hooks.on('userConnected',refresh);
  Hooks.on('updateUser',refresh);
  Hooks.on('updateSetting',setting=>{if(setting.key===`${scope}.intentSession`)refresh();});
  Hooks.on('renderChatMessageHTML',(message,html)=>{
    const request=message.getFlag(scope,'playerIntent');if(!request)return;
    const combat=game.combats.find(c=>c.uuid===request.combatUuid),receipt=combat?.getFlag(scope,`intents.${message.id}`);
    const card=html.querySelector('.phoenix-command')??html;
    const note=document.createElement('p');note.className='pc-chip';
    const status=coordinatorStatus();
    const detail=receipt?`${receipt.status==='accepted'&&combat?.timing.pendingEffect?'Effect awaiting GM completion.':''}${receipt.reason?receipt.reason:''}`
      :request.session!==intentSession()?'Coordinator changed. Submit a new request.'
      :status.accepting?'Retry uses the same request identity.'
      :`${status.detail??'No active coordinator.'}${status.recovery?` ${status.recovery}`:''}`;
    note.textContent=receipt?(receipt.status==='accepted'?'Accepted':'Rejected'):request.session!==intentSession()?'Stale':status.accepting?'Awaiting':'Uncoordinated';
    note.dataset.tone=receipt?.status==='accepted'?'good':receipt?.status==='rejected'?'danger':'warn';
    card.append(note);
    if(detail){const help=document.createElement('p');help.className='pc-help';help.textContent=detail;card.append(help);}
    if(!receipt&&game.user.isGM&&status.accepting){const button=document.createElement('button');button.textContent='Process request';button.addEventListener('click',()=>processPlayerIntent(message));const actions=document.createElement('div');actions.className='pc-card-actions';actions.append(button);card.append(actions);}
  });
}
