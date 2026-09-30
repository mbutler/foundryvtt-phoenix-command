import {autoAdvanceBlockers} from '../rules/auto-advance.mjs';
import {dueThisImpulse,woundInImpulse} from '../rules/impulse-completion.mjs';

const scope='phoenix-command';
// A GM table setting, off by default (user ruling, 27 September 2026).
export function registerAutoAdvance(){
  game.settings.register(scope,'autoAdvance',{scope:'world',config:false,type:Boolean,default:false,
    onChange:()=>{ui.combat?.render();if(game.users.activeGM?.id===game.user.id)void game.combat?.autoAdvance?.().catch(error=>ui.notifications.warn(error.message));}});
}
export const autoAdvanceEnabled=()=>{try{return game.settings.get(scope,'autoAdvance')===true;}catch{return false;}};
export const setAutoAdvance=value=>game.settings.set(scope,'autoAdvance',!!value);

// What the table is waiting for, read from the encounter.
export function encounterBlockers(combat,state=combat.timing){
  const people=combat.combatants.filter(c=>c.actor).map(c=>({id:c.id,name:c.name,
    conscious:c.actor.system.condition?.consciousness==='conscious',
    woundedThisImpulse:Object.values(c.actor.system.injuries??{}).some(i=>woundInImpulse(i,state,combat.uuid))}));
  return autoAdvanceBlockers(state,{people,shots:dueThisImpulse(combat.getFlag(scope,'shots'),state,combat.uuid)});
}
