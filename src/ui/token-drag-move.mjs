const paidFlag='phoenixPaidMove';

function encounterToken(doc){
  const combat=game.combat;
  if(!combat?.started||!combat.scene)return null;
  if(doc.parent?.id!==combat.scene.id)return null;
  return combat.combatants.find(c=>c.token?.id===doc.id)??null;
}

async function proposeDragMove(doc,destination){
  const combatant=encounterToken(doc);
  if(!combatant?.actor?.testUserPermission(game.user,'OWNER'))return;
  const {coordinatorStatus}=await import('../application/player-intents.mjs');
  if(!coordinatorStatus().accepting){ui.notifications.warn('Waiting for the GM coordinator.');return;}
  const state=game.combat.timing;
  if(state.reactions||state.batch||state.pendingEffect){ui.notifications.warn('Finish the current reactions or resolution before moving.');return;}
  const {selectHexMove}=await import('./hex-move.mjs');
  const fields=await selectHexMove(game.combat,structuredClone(state),combatant.id,{dragDestination:destination});
  if(!fields)return;
  const command={kind:'move',combatantId:combatant.id,expectedRevision:state.revision,id:foundry.utils.randomID(),...fields};
  if(game.user.isGM)await game.combat.timingCommand(command);
  else{
    const {submitPlayerIntent}=await import('../application/player-intents.mjs');
    await submitPlayerIntent(game.combat,command);
  }
}

export function registerTokenDragMove(){
  Hooks.on('preUpdateToken',(doc,update,options)=>{
    if(options[paidFlag]||options.isPhoenixPaidMove)return;
    const moving=update.x!==undefined||update.y!==undefined;
    const turning=update.rotation!==undefined&&update.rotation!==doc.rotation;
    if(!moving&&!turning)return;
    const combatant=encounterToken(doc);
    if(!combatant)return;
    if(!combatant.actor?.testUserPermission(game.user,'OWNER'))return;
    if(!moving&&turning){ui.notifications.warn('Use Turn on the token action bar or combat tracker to pay for changing facing.');return false;}
    queueMicrotask(()=>proposeDragMove(doc,{x:update.x??doc.x,y:update.y??doc.y}).catch(error=>ui.notifications.warn(error.message)));
    return false;
  });
}

export {paidFlag as phoenixPaidMoveFlag};
