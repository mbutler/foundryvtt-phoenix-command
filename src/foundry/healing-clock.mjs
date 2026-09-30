import {healingUpdate} from '../rules/healing.mjs';
import {escapeHTML as e} from './context.mjs';
// §2.10 on the world clock, applied by the active GM whenever world time moves (and once at
// start-up, for time that passed while nobody was connected): wounds whose Healing Time is up
// are marked healed, and a man whose Table 8B incapacitation is over comes round. The GM gets
// a whispered note of each; nothing is asked.
const scope='phoenix-command';
const regionLabel=region=>String(region).replace(/[-_]/g,' ');

// `only` limits the pass to the given Actors (a native check reads a future time without
// touching anyone else's wounds).
export async function applyHealingClock(now=game.time.worldTime,{only=null}={}){
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return [];
  const actors=new Map();
  if(only)for(const actor of only)actors.set(actor.uuid,actor);
  else{
    for(const actor of game.actors)actors.set(actor.uuid,actor);
    for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.set(token.actor.uuid,token.actor);
  }
  const applied=[];
  for(const actor of actors.values()){
    if(actor?.type!=='character')continue;
    const due=healingUpdate(actor.system.toObject(),now,{wokeFor:actor.getFlag(scope,'wokeFor')??null});
    if(!due)continue;
    try{
      await actor.update(due.update);
      const lines=[];
      if(due.heal.length)lines.push(`${due.heal.length} wound${due.heal.length===1?' has':'s have'} healed (${e(String(actor.system.recovery.healingTimeDays))} days). They no longer count toward the PD Total.${due.freed.length?` Usable again: ${due.freed.map(r=>e(regionLabel(r))).join(', ')}.`:''}`);
      if(due.wake)lines.push(`Table 8B's ${e(actor.system.recovery.incapacitationTime)} is over: conscious again, with the healing penalty.`);
      await foundry.documents.ChatMessage.create({whisper:game.users.filter(u=>u.isGM).map(u=>u.id),
        content:`<section class="phoenix-command"><p class="pc-record-kicker">MEDICAL · HEALING</p><h2>${e(actor.name)}</h2>${lines.map(l=>`<p>${l}</p>`).join('')}</section>`});
      applied.push({actor:actor.uuid,...due});
    }catch(error){console.error('Phoenix Command healing clock',error);}
  }
  return applied;
}

export function registerHealingClock(){
  Hooks.on('updateWorldTime',worldTime=>{void applyHealingClock(worldTime);});
  Hooks.once('ready',()=>{void applyHealingClock();});
}
