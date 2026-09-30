import {burstArcFromPoints,arcOccupants,sweptOccupants} from './burst-scene.mjs';
import {minimumArc} from '../rules/automatic-fire.mjs';
import {designateArc} from '../rules/arc-geometry.mjs';
// Shared preflight for map preview and authoritative commit.
export function validateBurstArc(combat,shot,points,arcHexes){
 const shooter=combat.combatants.get(shot.combatantId)?.token;
 if(!shooter)throw new Error('The shooter has no scene token.');
 const built=burstArcFromPoints(combat.scene,shooter,points,arcHexes);
 const designated=designateArc(built.arc);
 const actor=combat.combatants.get(shot.combatantId).actor;
 const weapon=Array.from(actor.items).find(item=>item.id===shot.plan.weaponId);
 const minimum=minimumArc({weapon,modeId:shot.plan.modeId,distance:{value:designated.rangeHexes*designated.feetPerHex,unit:'ft'}});
 if(designated.arcHexes<minimum)throw new Error(`Select an arc at least ${minimum} hexes wide at this range (weapon minimum).`);
 const arc={arcHexes:designated.arcHexes,shooter:designated.shooter,swept:designated.swept,feetPerHex:designated.feetPerHex,rangeHexes:designated.rangeHexes};
 // A burst of grenades is aimed at the hexes themselves (grenade-burst.mjs).
 if(shot.plan?.explosive)return {arc,minimum,targets:sweptOccupants(combat,shot.combatantId,arc)};
 const occupants=arcOccupants(combat,shot.combatantId,arc);
 // §5.10 cover fire is aimed at the hexes, so an arc nobody stands in is allowed.
 if(!occupants.atRange.length&&!shot.plan?.coverFire)throw new Error('Include a target at the selected range. No combatants are in this arc.');
 return {arc,minimum,targets:occupants.atRange};
}
