import {sceneCover} from './cover-scene.mjs';
import {hexesInPhase,movedThisPhase} from '../rules/timing.mjs';
import {visibleTargetFacts} from '../rules/hit-estimate.mjs';

// What the shooter can see on the map for his estimate. Of the scene cover reading only
// "is there cover on the line" is kept; its material and Protection Factor are not.
export function observedShotScene(combat,state,shooterId,targetUuid){
  const shooter=combat.combatants.get(shooterId),target=combat.combatants.find(c=>c.token?.uuid===targetUuid);
  const a=shooter?.token,b=target?.token;
  if(!a||!b||!shooter.actor||!target.actor)return null;
  let behindCover=false;
  try{behindCover=!!sceneCover(combat.scene,a.getCenterPoint({x:a.x,y:a.y}),b.getCenterPoint({x:b.x,y:b.y})).cover;}catch{/* No reading: as the tokens show. */}
  return {
    shooter:{condition:shooter.actor.system.condition,moving:movedThisPhase(state,shooterId),hexes:hexesInPhase(state,shooterId)},
    target:visibleTargetFacts(target.actor.system.condition,{moving:movedThisPhase(state,target.id),hexes:hexesInPhase(state,target.id),behindCover})
  };
}
