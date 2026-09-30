import {weaponImage} from '../data/weapon-images.mjs';
import {explosiveImageFiles,explosiveImagePath,presentImage} from '../data/explosive-images.mjs';
// Only replace Foundry's default Item icon. A deliberately chosen icon is artwork too.
export function weaponImagePatch(item) {
 if(item.type!=='weapon'||(item.img&&item.img!=='icons/svg/item-bag.svg'))return null;
 const img=weaponImage({...item,name:item.name,system:item.system,img:null});
 return img?{_id:item.id,img}:null;
}
export function defaultWeaponImage(item) {
 const patch=weaponImagePatch(item);
 if(patch)item.updateSource({img:patch.img});
}
export async function repairWeaponImages(){
 if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
 // Grenade and launcher artwork is used once its file has been added (explosive-images.mjs).
 const explosive=async item=>{
  if(item.type!=='weapon'||(item.img&&item.img!=='icons/svg/item-bag.svg')||!explosiveImageFiles[item.system?.catalogId])return null;
  const img=await presentImage(explosiveImagePath(item.system.catalogId));
  return img?{_id:item.id,img}:null;
 };
 const patchesFor=async items=>[...items.map(weaponImagePatch),...await Promise.all(items.map(explosive))].filter(Boolean);
 const worldPatches=await patchesFor(Array.from(game.items));
 if(worldPatches.length)await foundry.documents.Item.updateDocuments(worldPatches);
 const actors=[...game.actors];
 for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
 const seen=new Set();
 for(const actor of actors){
  if(seen.has(actor.uuid))continue;
  seen.add(actor.uuid);
  const patches=await patchesFor(Array.from(actor.items));
  if(patches.length)await actor.updateEmbeddedDocuments('Item',patches);
 }
}
