import {deriveShotSituation,preparationDefaults} from './shot-situation.mjs';
import {targetSizeRow,savedCoverStance} from './cover.mjs';
import {estimateSingleShot} from './attacks.mjs';

// The shooter's estimate uses only what his character can observe (user ruling, 27 September
// 2026): his own skill, weapon, aim, posture, preparation and movement; the measured range;
// the target's visible posture, whether he is behind cover and how much of him shows, and
// how far he has moved. It never reads the target's armor, the cover's material or
// Protection Factor, reactions not yet declared, or adjudications the GM has not made.
// Lighting is not modelled, so visibility is the unmodified row, as at resolution.
export function observedHitChance({weapon,modeId,ammunitionKey,skill,aimActions,distance,shooter,target}){
  try{
    const preparation=preparationDefaults(shooter.condition,shooter.moving);
    const situation=deriveShotSituation({shooterPosture:shooter.condition?.posture,targetPosture:target.posture,cover:null,
      firingStance:preparation.firingStance,braced:preparation.braced,shooterMoving:shooter.moving});
    if(!situation.ready)return null;
    const perceived=target.behindCover
      ?targetSizeRow({behindCover:true,stance:savedCoverStance(target.condition,{moving:target.moving}),blocking:true,targetPosture:target.posture}).row
      :situation.derived.targetSize;
    return estimateSingleShot({weapon,modeId,ammunitionKey,skill,aimActions,distance,
      targetSize:situation.derived.targetSize,visibility:['Good Visibility'],situations:situation.derived.situations??[],
      shooterSpeed:shooter.hexes,targetSpeed:target.hexes},perceived).chance;
  }catch{return null;}
}

// Only these target fields may reach the estimate. Building the target from this list keeps
// anything else on the Actor (armor, wounds, attributes) out of it by construction.
export function visibleTargetFacts(condition={},{moving=false,hexes=0,behindCover=false}={}){
  return {posture:condition.posture,condition:{looking:condition.looking===true,firingStance:condition.firingStance===true},moving,hexes,behindCover};
}
