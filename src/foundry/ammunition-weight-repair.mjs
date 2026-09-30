import {ammunitionWeightDefaults} from '../rules/ammunition-weight.mjs';
export function missingAmmunitionWeightPatch(item){
  const s=item.system;
  if(item.type!=='ammunition'||s.weightLb!=null||s.compatibleCatalogIds?.length!==1)return null;
  const defaults=ammunitionWeightDefaults(s.compatibleCatalogIds[0],s.quantity);
  return defaults?{_id:item.id,...Object.fromEntries(Object.entries(defaults).map(([key,value])=>[`system.${key}`,value]))}:null;
}
export async function repairAmmunitionWeights(){
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
  const actors=[...game.actors];
  for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
  for(const actor of actors){
    const patches=Array.from(actor.items,missingAmmunitionWeightPatch).filter(Boolean);
    if(patches.length)await actor.updateEmbeddedDocuments('Item',patches);
  }
}
