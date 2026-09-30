import {damageModifierTable,postureDamageModifiers} from '../rules/attacks.mjs';
import {derivedDamageBonus} from './encounter-allowance.mjs';
import {activeMeleeDefence,movedThisPhase} from '../rules/timing.mjs';
import {allocateParries,deriveParryActivity,deriveParryLoadout,fieldOfAttack} from '../rules/melee-parry.mjs';
import {closestMeleeHexes} from '../rules/melee-strike.mjs';
import {cubeOf} from './burst-scene.mjs';
import {cubeDistance} from '../rules/hex-cube.mjs';

// Everything a strike's review needs that the encounter already knows: stroke, parry column
// from the defender's weapons and ledger, Field of Attack from facing, damage bonus, and the
// §3.5 height from the postures. `open` lists what only the GM can say. Shared by the fire
// queue's inline row and the review dialog, so both read the same derivation.
export function strikeReviewContext(combat,combatantId,previous={}){
  const shot=combat.getFlag('phoenix-command',`shots.${combat.timing.entries[combatantId]?.activity?.shotId}`);
  if(!shot||shot.plan.kind!=='strike')throw new Error('No strike is ready for this combatant.');
  const sets=shot.plan.sets;
  const stroke=sets===0?'Short, half damage':sets===1?'Normal':'Long, double damage';
  const defender=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid);
  const attacker=combat.combatants.get(combatantId);
  const defence=activeMeleeDefence(combat.timing,defender?.id);
  const loadout=deriveParryLoadout(defender?.actor);
  const activity=deriveParryActivity(combat.timing.entries[defender?.id],combat.timing);
  let field={outside:false,difference:0};
  try{
    const a=attacker?.token,d=defender?.token;
    field=fieldOfAttack({defender:d?.getCenterPoint({x:d.x,y:d.y}),attacker:a?.getCenterPoint({x:a.x,y:a.y}),facing:d?.rotation});
  }catch(error){field={outside:null,difference:null,error:error.message};}
  const parry=loadout.resolved&&!defence?allocateParries({...loadout,...activity,strikes:[{id:'incoming',fullParry:false,outsideFieldOfAttack:field.outside===true}]}):null;
  const available=defence?0:(parry?.available??0);
  const defaultColumn=defence?.parryColumn??parry?.strikes[0].column??null;
  const stationary=!movedThisPhase(combat.timing,combatantId);
  const sixFoot=combat.scene?.grid?.distance!==2;
  // On a 6-foot map the 2-foot range is the GM's to state; it starts at the closest the two
  // hexes allow, which strikeHandoffInput also enforces as the minimum.
  let closest=1;
  try{
    const a=attacker?.token,d=defender?.token,grid=combat.scene.grid;
    closest=closestMeleeHexes(cubeDistance(cubeOf(grid,a.getCenterPoint({x:a.x,y:a.y})),cubeOf(grid,d.getCenterPoint({x:d.x,y:d.y}))));
  }catch{/* Tokens off the map: the GM states it. */}
  // Lance at Charge and the spears' Mounted Charge lines print no WC: the GM states it.
  const mode=attacker?.actor?.items.get(shot.plan.weaponId)?.system.meleeModes?.[shot.plan.modeId];
  const charge=mode?.weaponClass===null&&mode?.attacks?.[shot.plan.attackId]?.traits?.includes('charge');
  // §3.5: postures give the starting choice; the GM confirms or changes it.
  const suggested=previous.damageModifiers??postureDamageModifiers({attackerPosture:attacker?.actor?.system.condition.posture,targetPosture:defender?.actor?.system.condition.posture});
  const damageBonus=previous.damageBonus??derivedDamageBonus(attacker?.actor)??null;
  const defaults={damageBonus,
    dmLevel:['strikingDown','strikingUp','fromKnees','prone'].find(id=>suggested.includes(id))??'',
    dmClosing:Object.keys(damageModifierTable).find(id=>damageModifierTable[id].closing&&suggested.includes(id))??'',
    dmBraced:suggested.includes('braced'),dmGrasp:suggested.includes('grasp'),
    rangeHexes:previous.rangeHexes??closest,
    field:previous.outsideFieldOverride??'derived',parry:previous.adjudicatedParryColumn??'',chargeWc:previous.chargeWeaponClass??''};
  const open=[];
  if(!loadout.resolved)open.push({field:'parry',detail:`${loadout.reason} Choose a parry column.`});
  if(field.outside===null)open.push({field:'field',detail:'Facing is unresolved: choose whether the attacker is inside or outside the Field of Attack.'});
  if(charge)open.push({field:'chargeWc',detail:'This charge prints no Weapon Class: state it.'});
  if(damageBonus===null)open.push({field:'damageBonus',detail:'The attacker’s damage bonus could not be derived: state it.'});
  return {shot,sets,stroke,defender,attacker,defence,loadout,activity,field,available,defaultColumn,stationary,sixFoot,charge,defaults,open};
}

// The review a strike is resolved with. `values` are the queue row's or dialog's fields;
// missing ones take the derived defaults. Throws, naming it, when a GM-only fact is missing.
export function strikeChoices(ctx,values={}){
  const v={...ctx.defaults,...Object.fromEntries(Object.entries(values).filter(([,x])=>x!==undefined))};
  if(!ctx.loadout.resolved&&(v.parry===''||v.parry==null))throw new Error(`${ctx.loadout.reason} Choose a GM parry-column override.`);
  if(ctx.field.outside===null&&v.field==='derived')throw new Error('Choose whether the attacker is inside or outside the Field of Attack.');
  const damageBonus=Number(v.damageBonus);
  if(v.damageBonus===null||v.damageBonus===''||!Number.isFinite(damageBonus))throw new Error('State the attacker’s damage bonus.');
  let chargeWeaponClass;
  if(ctx.charge){
    if(v.chargeWc===''||!Number.isSafeInteger(Number(v.chargeWc)))throw new Error('State a whole-number Weapon Class for this charge.');
    chargeWeaponClass=Number(v.chargeWc);
  }
  const rangeHexes=ctx.sixFoot?Number(v.rangeHexes):undefined;
  if(ctx.sixFoot&&!(Number.isSafeInteger(rangeHexes)&&rangeHexes>=1))throw new Error('State the range in 2-foot melee hexes.');
  return {defenderLoadout:ctx.loadout.loadout??'one-weapon',
    defenderOffHandHands:ctx.loadout.offHandHands??1,
    defenderBothWeaponsCommitted:ctx.activity.bothWeaponsCommitted,
    defenderParryActions:ctx.activity.parryActions,
    defenderRecoverActions:ctx.activity.recoverActions,
    defenderSetActions:ctx.activity.setActions,
    defenderShieldPartialParry:ctx.loadout.shieldPartialParry??null,
    defenderHands:ctx.loadout.hands??1,
    outsideFieldOfAttack:v.field==='outside'||(v.field==='derived'&&ctx.field.outside===true),
    outsideFieldOverride:v.field==='derived'?null:v.field,
    adjudicatedParryColumn:v.parry===''||v.parry==null?null:Number(v.parry),
    damageBonus,rangeHexes,
    damageModifiers:[v.dmLevel,ctx.charge?'':v.dmClosing,v.dmBraced?'braced':'',v.dmGrasp?'grasp':''].filter(Boolean),
    ...(ctx.charge?{chargeWeaponClass}:{}),
    stationary:ctx.stationary};
}

// Explosives: visibility and the two optional adjustments; surroundings are confirmed after
// landing (26 September ruling), so nothing else is asked before the throw.
export function explosiveChoices({visibility='Good Visibility',elevatedHex=false,applyShrapnelSize=false}={}){
  return {visibility:[visibility],elevatedHex:elevatedHex===true,applyShrapnelSize:applyShrapnelSize===true,shrapnelCombined:false};
}

// The defender's own decision at the reaction window (LEG10204 §3.2: full parries are
// allocated before anyone rolls; user ruling 27 September 2026 that the defender makes it).
// The blows he can parry are the strikes due at him this impulse that come from inside his
// Field of Attack; how many full parries he has comes from his ledger and loadout. Null when
// there is nothing to decide.
export function parryOptions(combat,defenderId,state=combat.timing){
  const defender=combat.combatants.get(defenderId);
  // A full parry is a conscious defence, like ducking: nobody who is out is offered one.
  if(!defender?.token||!defender.actor||defender.actor.system.condition?.consciousness!=='conscious'||activeMeleeDefence(state,defenderId))return null;
  const due=Object.values(combat.getFlag('phoenix-command','shots')??{}).filter(s=>s.status==='ready'&&s.plan.kind==='strike'
    &&s.plan.targetUuid===defender.token.uuid&&s.timing?.clockRevision===state.clockRevision);
  const d=defender.token,blows=[];
  for(const shot of due){
    const a=combat.combatants.get(shot.combatantId)?.token;
    let outside=false;
    try{outside=fieldOfAttack({defender:d.getCenterPoint({x:d.x,y:d.y}),attacker:a.getCenterPoint({x:a.x,y:a.y}),facing:d.rotation}).outside===true;}catch{/* Unknown facing: offer it. */}
    if(!outside)blows.push({shotId:shot.id,attacker:combat.combatants.get(shot.combatantId)?.name??'Attacker'});
  }
  if(!blows.length)return null;
  const loadout=deriveParryLoadout(defender.actor);
  if(!loadout.resolved)return null;
  const available=allocateParries({...loadout,...deriveParryActivity(state.entries[defenderId],state),strikes:blows.map(b=>({id:b.shotId}))}).available;
  return available>0?{available,blows}:null;
}

// The coordinator's check of an allocation a defender submits with his reaction.
export function assertParryAllocation(combat,defenderId,shotIds){
  if(!shotIds?.length)return;
  if(combat.combatants.get(defenderId)?.actor?.system.condition?.consciousness!=='conscious')throw new Error('Only a conscious combatant may parry.');
  const options=parryOptions(combat,defenderId);
  if(!options)throw new Error('There is no blow this defender can fully parry this impulse.');
  if(new Set(shotIds).size!==shotIds.length||shotIds.some(id=>!options.blows.some(b=>b.shotId===id)))throw new Error('Allocate full parries only to blows arriving at you this impulse.');
  if(shotIds.length>options.available)throw new Error(`You have ${options.available} full parr${options.available===1?'y':'ies'} this impulse.`);
}
