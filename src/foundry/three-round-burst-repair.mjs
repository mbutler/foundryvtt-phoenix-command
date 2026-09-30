import {threeRoundBurstRecord} from '../data/three-round-burst.mjs';
// Items made before the three-round burst (LEG10203 §6.3) lack their `**` weapon's 3RB row.
// The HK VP70M and M93R were also imported as ROF 2 manual weapons, a misreading of the `**`
// PDF 72 prints; their feed is corrected to self-loading. Nothing else on the Item changes.
const misread=new Set(['hk-vp70m','m93r']);
export function threeRoundBurstPatch(item){
  const s=item.system;
  if(item.type!=='weapon')return null;
  const record=threeRoundBurstRecord(s?.catalogId);
  if(!Object.keys(record).length)return null;
  const patch={};
  for(const [modeId,mode] of Object.entries(s.firearmModes??{})){
    if(!Object.keys(mode.threeRoundBurst??{}).length)patch[`system.firearmModes.${modeId}.threeRoundBurst`]=structuredClone(record);
    if(misread.has(s.catalogId)&&mode.feed==='manual'&&mode.rateOfFire===2){
      patch[`system.firearmModes.${modeId}.feed`]='self-loading';
      patch[`system.firearmModes.${modeId}.rateOfFire`]=null;
    }
  }
  return Object.keys(patch).length?{_id:item.id,...patch}:null;
}
export async function repairThreeRoundBursts(){
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)return;
  const actors=[...game.actors];
  for(const scene of game.scenes)for(const token of scene.tokens)if(!token.actorLink&&token.actor)actors.push(token.actor);
  for(const actor of actors){
    const patches=Array.from(actor.items,threeRoundBurstPatch).filter(Boolean);
    if(patches.length)await actor.updateEmbeddedDocuments('Item',patches);
  }
  const world=Array.from(game.items??[],threeRoundBurstPatch).filter(Boolean);
  if(world.length)await Item.updateDocuments(world);
}
