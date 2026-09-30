import {requireCoordinator,localCoordinatorSession} from './coordinator.mjs';
import {dueFireSummary,resolveDueFire} from './resolve-due-fire.mjs';

const running=new Set();
const read=combat=>combat.getFlag('phoenix-command','fireWorkflow');
const save=(combat,value)=>combat.setFlag('phoenix-command','fireWorkflow',value);
const command=(combat,kind,fields={})=>combat.timingCommand({kind,expectedRevision:combat.timing.revision,...fields});

// A GM's single explicit authorization survives reaction handoffs, but never replays
// dice automatically after reload/takeover or after a failed application.
export async function startFireWorkflow(combat,choices){
  requireCoordinator();
  if(running.has(combat.uuid))throw new Error('This impulse is already resolving.');
  const {due}=dueFireSummary(combat);
  if(!due.length)throw new Error('No attacks are due.');
  if(due.some(s=>s.status==='ready'&&s.plan.kind==='burst'&&!s.arc))throw new Error('Choose the missing burst arcs first.');
  for(const shot of due)if(shot.status==='ready'&&!shot.adjudication&&!choices[shot.id])throw new Error('Complete the attack conditions in the queue.');
  running.add(combat.uuid);
  try{await save(combat,{clockRevision:combat.timing.clockRevision,session:localCoordinatorSession(),status:'waiting',choices,error:null});}
  finally{running.delete(combat.uuid);}
  return continueFireWorkflow(combat);
}

export async function continueFireWorkflow(combat,{resolve=resolveDueFire}={}){
  const request=read(combat);
  if(!request||request.status!=='waiting'||request.clockRevision!==combat.timing.clockRevision||request.session!==localCoordinatorSession()||running.has(combat.uuid))return;
  requireCoordinator();
  running.add(combat.uuid);
  try{
    if(!combat.timing.reactions)await command(combat,'openReactions');
    if(combat.timing.reactions?.stage==='open'){
      if(Object.values(combat.timing.reactions.choices).some(c=>c===null))return;
      await command(combat,'closeReactions');
    }
    // Review every pending attack before any dice: a bad input cannot partly roll a batch.
    for(const shot of dueFireSummary(combat).ready){
      const choices=request.choices[shot.id];
      if(choices)await command(combat,'reviewShot',{combatantId:shot.combatantId,choices});
    }
    await save(combat,{...request,status:'resolving'});
    await resolve(combat);
    await save(combat,{...request,status:'complete'});
    // With auto-advance on, a resolved impulse moves on once nobody has a decision left.
    await combat.autoAdvance?.();
  }catch(error){
    await save(combat,{...request,status:'paused',error:error.message});
    throw error;
  }finally{running.delete(combat.uuid);}
}

export function registerFireWorkflow(){
  Hooks.on('updateCombat',combat=>{
    // Never await from inside the coordinator's document update: timing commands
    // share its serialization queue and must start after that update returns.
    if(game.users.activeGM?.id!==game.user.id)return;
    void continueFireWorkflow(combat).catch(error=>ui.notifications.warn(error.message));
  });
}
