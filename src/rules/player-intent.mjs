import {characterActivity} from './activity-cost.mjs';
const postures=new Set(['stand-kneel','stand-prone','kneel-stand','kneel-prone','prone-kneel','prone-stand','firing-stance','hip-stance','brace','look-cover','duck-cover']);
// Table 7A's stances. An owner chooses where he goes and how; he does not get to state the
// ground he crosses, and he never supplies the direction - the coordinator reads that from
// his facing, so a request cannot pick the cheap row of the table for itself.
const movementStances=new Set(['standing','low-crouch','hands-and-knees','belly-crawl']);
const finite=value=>typeof value==='number'&&Number.isFinite(value);
const id=value=>typeof value==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(value);
export function playerCommand(request,{owned,actor,actorUuid,clockRevision,session,activity,targetAllowed=true}){
  if(!owned)throw new Error('You must own this combatant.');
  if(request?.version!==1||request.actorUuid!==actorUuid)throw new Error('The requested Actor changed.');
  if(request.session!==session||!session)throw new Error('The GM coordinator changed or reloaded. Review and submit a new request.');
  if(request.clockRevision!==clockRevision)throw new Error('The impulse changed. Review the tracker and submit again.');
  const c=request.command;
  if(!c||!id(c.combatantId)||!Number.isSafeInteger(c.expectedRevision)||c.expectedRevision<0)throw new Error('Invalid player command.');
  const command={kind:c.kind,combatantId:c.combatantId,expectedRevision:c.expectedRevision};
  if(c.kind==='done'){
    if(typeof c.done!=='boolean')throw new Error('Choose whether you are done this impulse.');
    command.done=c.done;
    if(c.wait===true)command.wait=true;
  }else if(c.kind==='react'){
    if(!['hold','duck'].includes(c.choice))throw new Error('Choose hold or duck.');
    command.choice=c.choice;
    if(c.parries!==undefined){
      if(!Array.isArray(c.parries)||c.parries.length>9||!c.parries.every(id))throw new Error('Allocate full parries to blows arriving at you.');
      command.parries=[...c.parries];
    }
  }else if(c.kind==='coverFire'){
    // §5.10: the owner names the weapon and the hexes; the coordinator checks the arc.
    const o=c.order;
    if(!o||![o.weaponId,o.modeId,o.ammunitionId].every(id)||!Array.isArray(o.arc?.hexes)||!o.arc.hexes.length)throw new Error('Choose the weapon and the hexes to cover.');
    command.order={weaponId:o.weaponId,modeId:o.modeId,ammunitionId:o.ammunitionId,arc:burstArcFrom(o.arc)};
  }else if(c.kind==='stopCoverFire'){
    // Nothing to state.
  }else if(c.kind==='pin'){
    // §5.9: the owner names the spot; the coordinator snaps it to a hex and checks the stance
    // and the Field of Fire.
    if(!finite(c.point?.x)||!finite(c.point?.y))throw new Error('Choose the hex to pin.');
    command.point={x:c.point.x,y:c.point.y};
  }else if(c.kind==='fireNow'){
    if(!targetAllowed)throw new Error('Choose an observable encounter target before firing.');
    if(!['shot','shotgun','burst'].includes(activity?.weaponPlan?.kind))throw new Error('Only an aimed shot can fire accumulated aim.');
  }else if(c.kind==='meleeDefence'){
    if(!['dodge','coverUp'].includes(c.defence))throw new Error('Choose Dodge or Cover Up.');
    command.defence=c.defence;
    if(c.defence==='coverUp'){
      if(!id(c.shieldItemId))throw new Error('Choose an equipped Round-or-larger shield.');
      command.shieldItemId=c.shieldItemId;
    }
  }else if(c.kind==='activity'){
    if(c.continuous)command.continuous=true;
    if(c.weaponRequest){
      command.weaponRequest=weaponRequestFrom(c.weaponRequest,targetAllowed);
    }else if(c.turnFacing!==undefined){
      if(!finite(c.turnFacing))throw new Error('Choose a finite facing angle.');
      command.turnFacing=c.turnFacing;
      // Turn and aim: the shot the turn is for, started once the turn is applied.
      if(c.then!==undefined){
        if(!['shot','shotgun','launcher'].includes(c.then?.weaponRequest?.kind))throw new Error('Only a shot, shotgun blast or launcher round can follow a turn.');
        command.then={weaponRequest:weaponRequestFrom(c.then.weaponRequest,targetAllowed)};
      }
    }else if(c.catalog)command.catalog=characterActivity(c.catalog,actor);
    else throw new Error('Player plans currently support posture and weapon activities. Other activities require GM adjudication.');
  }else if(c.kind==='designateArc'){
    // The hexes are the owner's choice. The coordinator snaps them to the map and
    // refuses a width the table does not print, so a request cannot invent an arc.
    if(activity?.weaponPlan?.kind!=='burst'||activity.progress<activity.cost)throw new Error('Finish paying for the burst before designating its arc.');
    if(!Number.isFinite(c.arcHexes)||!Array.isArray(c.hexes)||!c.hexes.length||c.hexes.some(hex=>!finite(hex?.x)||!finite(hex?.y)))throw new Error('Designate the hexes the burst is swept across.');
    command.arcHexes=c.arcHexes;
    command.hexes=c.hexes.map(hex=>({x:hex.x,y:hex.y}));
  }else if(c.kind==='rollShot'){
    if(!targetAllowed)throw new Error('Choose an observable encounter target before requesting a roll.');
    // The owner asks for the roll; the coordinator makes it. No modifier, die or situation
    // value travels from the player, so the request cannot flatter the shot. The
    // coordinator derives what it can and refuses anything still needing adjudication.
    if(!['shot','shotgun','burst','strike','grenade','launcher'].includes(activity?.weaponPlan?.kind))throw new Error('Only a paid attack can be rolled.');
    if(activity.progress<activity.cost)throw new Error('Finish paying for the aim before rolling.');
  }else if(c.kind==='move'){
    // An injured owner may move: Table 7A prices it, and the coordinator derives the rows
    // from his recorded wounds. He still does not get to state them.
    if(c.step!==undefined){
      if(!c.step||typeof c.step!=='object'||Array.isArray(c.step))throw new Error('Describe the hex being entered.');
      if(!movementStances.has(c.step.stance))throw new Error(`Choose a Table 7A movement stance: ${[...movementStances].join(', ')}.`);
      if(Object.keys(c.step).some(key=>key!=='stance'))throw new Error('Terrain and direction are not yours to state. An owner\u2019s move is charged at Table 7A\u2019s unmodified cost, with the direction read from his facing.');
      if(!c.destination||!finite(c.destination.x)||!finite(c.destination.y))throw new Error('Choose the hex to move into.');
      command.step={stance:c.step.stance};
      command.destination={x:c.destination.x,y:c.destination.y};
      if(c.hexsides!==undefined){
        if(!Number.isSafeInteger(c.hexsides)||c.hexsides<0||c.hexsides>3)throw new Error('A turn while entering a hex is zero to three hexsides.');
        command.hexsides=c.hexsides;
      }
      if(c.facing!==undefined){
        if(!finite(c.facing))throw new Error('A new facing must be an angle in degrees.');
        command.facing=c.facing;
      }
      if(c.route?.length){
        command.route=c.route.map(leg=>{
          if(!leg?.destination||!finite(leg.destination.x)||!finite(leg.destination.y))throw new Error('Each route hex needs a destination.');
          if(leg.step&&Object.keys(leg.step).some(key=>key!=='stance'))throw new Error('Terrain and direction are not yours to state on a movement route.');
          return {destination:{x:leg.destination.x,y:leg.destination.y},
            ...(leg.hexsides!==undefined?{hexsides:leg.hexsides}:{}),
            ...(leg.facing!==undefined?{facing:leg.facing}:{}),
            step:{stance:leg.step?.stance??c.step.stance}};
        });
      }
    }
    if(c.actions!==undefined){
      if(!Number.isSafeInteger(c.actions)||c.actions<1)throw new Error('Spend a whole number of at least one action on movement.');
      command.actions=c.actions;
    }
  }else if(c.kind==='abandonMove'){
    // Nothing to validate beyond ownership: abandoning refunds nothing and ends a hex the
    // owner declared himself.
  }else if(['work','cancel','abandonShot'].includes(c.kind)){
    if(!activity?.effect&&!activity?.weaponPlan&&!activity?.catalog)throw new Error('Only supported catalog or weapon activities accept player commands.');
  }else throw new Error('This command requires the GM.');
  return command;
}
export const playerPostureIds=Object.freeze([...postures]);
export const playerMovementStances=Object.freeze([...movementStances]);

// Coordinator handover is not automatic. A GM client only becomes a working coordinator
// by publishing a session nonce when it loads, so a client that becomes the active GM
// later - because the previous coordinator disconnected - accepts nothing until it
// reloads. Left unreported that looks like requests being silently ignored, so the
// state is named and carries its own recovery step.
export function coordinatorState({isGM,isActiveGM,localSession,worldSession,sessionCurrent=false,coordinatorName=null}){
  if(!isGM)return {role:'player',accepting:!!worldSession&&sessionCurrent,coordinatorName,
    detail:worldSession&&sessionCurrent?null:'No GM client is accepting action requests yet.'};
  if(!isActiveGM)return {role:'other-gm',accepting:false,coordinatorName,
    detail:`${coordinatorName??'Another GM'} is the active coordinator. Only one GM client coordinates an encounter.`};
  if(!localSession)return {role:'needs-reload',accepting:false,coordinatorName,
    detail:'This client became the active GM after loading, so it never published a coordinator session and is accepting no player requests.',
    recovery:'Reload Foundry on this client to take over coordination. Pending requests are not replayed; ask their owners to submit again.'};
  if(localSession!==worldSession)return {role:'superseded',accepting:false,coordinatorName,
    detail:'Another GM client published a newer coordinator session, so this one no longer coordinates.',
    recovery:'Coordinate from the newest GM client, or reload this one to take over again.'};
  return {role:'coordinator',accepting:true,coordinatorName};
}

// The weapon request fields an owner may state. Everything else is derived by the coordinator.
function weaponRequestFrom(w,targetAllowed){
  if(w.kind==='strike'){
    if(![w.weaponId,w.modeId,w.attackId].every(id)||!targetAllowed||typeof w.targetUuid!=='string')throw new Error('Choose an observable target and a melee attack.');
    // §3.1 charges the sets with the blow, so the owner chooses the stroke when he plans
    // it and the number has to survive this boundary (D61).
    if(!Number.isSafeInteger(w.sets)||w.sets<0||w.sets>2)throw new Error('Choose how many sets the blow is thrown after: 0, 1 or 2.');
    return {kind:'strike',weaponId:w.weaponId,modeId:w.modeId,attackId:w.attackId,sets:w.sets,
      ...(Number.isSafeInteger(w.agilitySkillFactor)?{agilitySkillFactor:w.agilitySkillFactor}:{}),
      ...(w.continueCut===true?{continueCut:true}:{}),targetUuid:w.targetUuid};
  }else if(w.kind==='recover'||w.kind==='parry'){
    if(![w.weaponId,w.modeId].every(id))throw new Error('Choose a melee weapon to recover or parry with.');
    return {kind:w.kind,weaponId:w.weaponId,modeId:w.modeId};
  }else{
    if(!['shot','shotgun','reload','burst','grenade','launcher'].includes(w.kind)||![w.weaponId,w.modeId,w.ammunitionId].every(id))throw new Error('Unsupported weapon request.');
    if((w.kind==='shot'||w.kind==='shotgun'||w.kind==='grenade'||w.kind==='launcher')&&(!targetAllowed||typeof w.targetUuid!=='string'||!Number.isSafeInteger(w.aimActions)||w.aimActions<1))throw new Error('Choose an observable encounter target and supported aim time.');
    if(w.kind==='burst'&&(!Number.isSafeInteger(w.aimActions)||w.aimActions<1))throw new Error('Choose a supported aim time. The arc is designated when the burst is fired.');
    return {kind:w.kind,weaponId:w.weaponId,modeId:w.modeId,ammunitionId:w.ammunitionId,
      ...(w.kind==='shot'||w.kind==='shotgun'||w.kind==='grenade'||w.kind==='launcher'?{targetUuid:w.targetUuid,aimActions:w.aimActions}:{}),
      ...(w.kind==='burst'?{aimActions:w.aimActions}:{}),
      // A stationary burst may carry the arc chosen with the order; the coordinator checks it.
      ...(w.kind==='burst'&&w.arc?{arc:burstArcFrom(w.arc)}:{}),
      ...(w.kind==='burst'&&w.coverFire===true?{coverFire:true}:{}),
      ...(w.kind==='shot'&&w.threeRoundBurst===true?{threeRoundBurst:true}:{})};
  }
}
function burstArcFrom(arc){
  if(!Number.isFinite(arc?.arcHexes)||!Array.isArray(arc.hexes)||!arc.hexes.length||arc.hexes.length>30||arc.hexes.some(hex=>!finite(hex?.x)||!finite(hex?.y)))throw new Error('Designate the hexes the burst is swept across.');
  return {arcHexes:arc.arcHexes,hexes:arc.hexes.map(hex=>({x:hex.x,y:hex.y}))};
}
