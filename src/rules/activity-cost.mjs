import {activities} from '../data/activities.mjs';
import {itemHandlingEffect,itemHandlingIds} from './item-handling.mjs';
import {doorIds} from './door-handling.mjs';

// A quote is not permission to act. Explicit choices avoid guessing missing
// weapon RT, concealed-holster status, or the printed equipment In/Out column.
export function quoteActivity(id,parameters={}) {
  const activity=activities.find(row=>row.id===id);
  if(!activity)throw new Error('Unknown activity.');
  const cost=activity.cost;
  let actions,allowed=[];
  switch(cost.kind) {
    case 'fixed':actions=cost.actions;break;
    case 'holster':
      allowed=['concealed'];
      if(typeof parameters.concealed!=='boolean')throw new Error('Specify whether the holster is concealed.');
      actions=cost.actions+(parameters.concealed?cost.concealedExtra:0);break;
    case 'equipment-direction':
      allowed=['direction'];
      if(!['in','out'].includes(parameters.direction))throw new Error('Select the printed equipment In or Out column.');
      actions=parameters.direction==='in'?cost.inActions:cost.outActions;break;
    case 'weapon-reload-time':
      allowed=['reloadTime'];actions=parameters.reloadTime;
      if(!Number.isSafeInteger(actions)||actions<=0)throw new Error('A positive whole-action weapon Reload Time is required.');
      break;
    default:throw new Error('Unsupported cost expression.');
  }
  if(Object.keys(parameters).some(key=>!allowed.includes(key)))throw new Error('Unsupported activity parameter.');
  return {activityId:id,label:activity.label,actions,parameters:{...parameters},source:{...activity.source},execution:activity.execution};
}

// Weapon-specific costs come from owned equipment, never a player-supplied number.
export function characterActivity(catalog,actor){
  if(['turn','turn-firing'].includes(catalog?.id))throw new Error('Use Turn to choose the new facing.');
  let parameters=catalog?.parameters??{};
  if(catalog?.id==='unload-weapon'){
    const weapon=Array.from(actor?.items??[]).find(item=>item.id===catalog.weaponId&&item.type==='weapon');
    const mode=weapon?.system.firearmModes?.[catalog.modeId];
    if(!weapon?.system.carried||!mode)throw new Error('Choose a carried weapon to unload.');
    parameters={reloadTime:mode.reloadTimeActions};
  }
  const quote=quoteActivity(catalog?.id,parameters);
  // Handling names the item it acts on; refuse an impossible choice before paying.
  if(itemHandlingIds.includes(catalog.id)){
    const bound={id:quote.activityId,parameters:quote.parameters,itemId:catalog.itemId,
      ...(catalog.id==='pick-set-weapon'?{handling:catalog.handling}:{}),...(catalog.id==='selector'?{modeId:catalog.modeId}:{})};
    itemHandlingEffect(bound,actor);
    return bound;
  }
  // A door is on the map, so it is checked against the token when the coordinator binds it.
  if(doorIds.includes(catalog.id)){
    if(typeof catalog.wallId!=='string'||!catalog.wallId)throw new Error('Choose a door on the map.');
    return {id:quote.activityId,parameters:quote.parameters,wallId:catalog.wallId};
  }
  return {id:quote.activityId,parameters:quote.parameters,...(catalog.id==='unload-weapon'?{weaponId:catalog.weaponId,modeId:catalog.modeId}:{})};
}
