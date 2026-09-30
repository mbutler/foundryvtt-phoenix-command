import {launchersById,launcherItem} from '../data/launchers.mjs';
// Automatic grenade launchers made before a burst of grenades was a fire order carry
// fireTypes ['single'] only. Their catalogue entry now also fires a burst; nothing else about
// the saved Item changes.
export function launcherBurstPatch(item){
  const s=item.system;
  if(item.type!=='weapon'||!launchersById[s?.catalogId])return null;
  const fire=s.firearmModes?.fire;
  const wanted=launcherItem(s.catalogId).system.firearmModes.fire.fireTypes;
  if(!fire||!wanted.includes('automatic')||fire.fireTypes?.includes('automatic'))return null;
  return {_id:item.id,'system.firearmModes.fire.fireTypes':[...new Set([...(fire.fireTypes??[]),'automatic'])]};
}
export async function repairLauncherBursts(){
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
  const actors=[...game.actors];
  for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
  for(const actor of actors){
    const patches=Array.from(actor.items,launcherBurstPatch).filter(Boolean);
    if(patches.length)await actor.updateEmbeddedDocuments('Item',patches);
  }
  const world=Array.from(game.items??[],launcherBurstPatch).filter(Boolean);
  if(world.length)await Item.updateDocuments(world);
}
