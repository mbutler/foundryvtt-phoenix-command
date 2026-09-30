import {inspectLoadout} from './summary.mjs';
import {firingRestriction,disabledLocations} from './disabling-effects.mjs';
import {grenadeAimAlm} from './explosive.mjs';
import {attackActionCost,parryActions,recoverActions,strokeCost} from './melee-strike.mjs';
import {assertOffHandBlow} from './off-hand.mjs';
import {unarmedDefences} from '../data/unarmed.mjs';

// What a shot costs to prepare, before any aim. Section 1.3 Step 9 (PDF 11-12) gives ROF
// three meanings by its printed form, and §5.11 (PDF 57) settles how the cost is paid:
//
//   "his next shot takes 1 AC to prepare and 1 AC to aim and fire"
//
// so chambering is paid ON TOP of aim, not absorbed into it. The same section adds the rule
// that decides when it is paid at all:
//
//   "Note that the Rate of Fire applies only to a second or subsequent shot"
//
// and its worked example fires a drawn pistol "after 1 AC of aim" with no ROF. So ROF is the
// cost of recovering the weapon after firing, not of preparing the first shot from a weapon
// that is already ready. `chamberReady` is that state and is never guessed.
export const shotPreparationSource='Small Arms §1.3 Step 9, PDF 11-12; §5.11, PDF 57';
export function shotPreparation({feed,rateOfFire,reloadTimeActions,aimActions,chamberReady}={}){
  if(!Number.isSafeInteger(aimActions)||aimActions<1)throw new Error('Aim time is a whole number of at least one action; firing is included in it.');
  if(feed!=='self-loading'&&typeof chamberReady!=='boolean')
    throw new Error('State whether this weapon is ready to fire; the Rate of Fire is paid only for a second or subsequent shot.');
  let preparation=0,detail;
  if(feed==='self-loading'){
    // The asterisk form: "a round is always ready for fire until the magazine is empty".
    detail='Self-loading: a round is chambered automatically, so no preparation is charged.';
  }else if(feed==='manual'){
    if(!Number.isSafeInteger(rateOfFire)||rateOfFire<1)throw new Error('A manually chambered weapon needs a printed whole-action Rate of Fire.');
    preparation=chamberReady?0:rateOfFire;
    detail=chamberReady?'Already chambered: the Rate of Fire applies only to a second or subsequent shot.'
      :`Chambering costs the printed Rate of Fire of ${rateOfFire}, paid on top of aim.`;
  }else if(feed==='single-load'){
    // No printed ROF: "the time required to prepare a shot is given by the Reload Time".
    if(!Number.isSafeInteger(reloadTimeActions)||reloadTimeActions<1)throw new Error('A weapon with no magazine needs a printed whole-action Reload Time to prepare a shot.');
    preparation=chamberReady?0:reloadTimeActions;
    detail=chamberReady?'Already loaded: the next shot pays the Reload Time again.'
      :`No magazine, so preparing a shot costs the Reload Time of ${reloadTimeActions}.`;
  }else throw new Error(`Unsupported feed "${feed??'unknown'}". Record the weapon's printed ROF form: self-loading, manual or single-load.`);
  return {preparation,aim:aimActions,total:preparation+aimActions,detail,source:shotPreparationSource};
}
const same=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
// What a completed activity leaves in the chamber. Firing empties it on any weapon that
// chambers by hand; a reload leaves it ready.
//
// RT is "the time, in Action Counts, required to FULLY reload the weapon" (§1.3 Step 9), and
// a reload that left the weapon unable to fire would not be a full one. §5.11 points the same
// way: the Rate of Fire "applies only to a second or subsequent shot", which makes it the
// cost of cycling the weapon after firing rather than of loading it. A weapon that has just
// been reloaded has not fired, so it owes nothing - which is also the state §5.11's own
// example describes, a drawn pistol with "a round in the chamber".
export function chamberAfter(feed,kind){
  if(feed==='self-loading'||kind==='grenade')return null; // Unread for these. A grenade does not chamber.
  return kind==='shot'||kind==='burst'||kind==='shotgun'||kind==='launcher'?'empty':'ready';
}
function buckshot(mode, key) {
  const ammo = mode.ammunition?.[key];
  return ammo?.pelletNumber != null || Object.values(ammo?.ranges ?? {}).some(range => range.salm != null);
}
// Readying the next grenade (user ruling, 28 September 2026). The book prints no cost for
// taking a grenade into hand, and a grenade prints no capacity or Reload Time, so after one
// throw nothing could put the next in hand. It is the reload of a thrown weapon: one grenade
// from the carried stack into the hand, at the cost of the nearest printed row, "Take bullet
// or magazine from pouch" (4 actions, LEG10200 §2.2 action list). Arm Time is still paid when
// it is thrown.
export const READY_GRENADE_ACTIONS=4;
export const thrownMode=mode=>mode?.throwRangeHexes!=null||mode?.armTimeActions!=null;
export const reloadCapacity=mode=>thrownMode(mode)?1:mode?.capacity;

export function weaponActivity(actor,request,{woundThisImpulse=null}={}){
  // The order dialog's "three-round burst" is a shot with its flag (LEG10203 §6.3).
  if(request.kind==='threeRound')request={...request,kind:'shot',threeRoundBurst:true};
  if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm conscious state before planning a weapon activity.');
  // §2.7 restricts firing for a disabled arm or shoulder, and for nothing else. A wounded
  // leg used to block a shot here, which was never a rule.
  const firing=firingRestriction(disabledLocations(actor.system.injuries,woundThisImpulse));
  if(!firing.allowed)throw new Error(firing.reason);
  if(request.kind==='strike'||request.kind==='recover'||request.kind==='parry'){
    const weapon=actor.items.find(i=>i.id===request.weaponId),mode=weapon?.system.meleeModes?.[request.modeId];
    if(!weapon?.system.carried||!weapon.system.equipped||!mode)throw new Error('Choose a carried, equipped melee weapon.');
    const owed=mode.preparation?.recoveryRequired===true;
    if(request.kind==='parry'){
      // §3.2 buys one Column 9 parry per action spent. §3.1's two substitutions come with it:
      // a parry counts as a recover, so it clears a blow's debt, and a weapon that parries is
      // back out of position for any set that was building - which here means the strike
      // activity it was being bought for is no longer payable (D62).
      // Table 3B prices the unarmed Parry as Block, one action. There is no Weapon Speed
      // to enter on §3.1's armed-weapon row.
      const unarmed=mode.grip==='unarmed';
      const cost=unarmed?unarmedDefences.block.actionCost:parryActions(mode.weaponSpeed);
      return {kind:'parry',actorUuid:actor.uuid,weaponId:weapon.id,weaponUuid:weapon.uuid,modeId:request.modeId,
        attackId:null,ammunitionId:null,ammunitionKey:null,cost,targetUuid:null,
        aimActions:null,preparationActions:0,chamberAfter:null,roundsFired:null,sets:null,
        weaponBefore:structuredClone(weapon.system),ammoBefore:null,loadedAfter:null,
        label:`${weapon.name} · ${unarmed?'Block':'Parry'} (${cost} action${cost===1?'':'s'}, one full parry)`,
        source:unarmed?'LEG10204 §3.4 and Table 3B, PDF 18 and 45':'LEG10204 §3.1 Weapon Action Costs and §3.2, PDF 18-20',ruleset:'small-arms'};
    }
    if(request.kind==='recover'){
      // §3.1: "After Striking, a Character must Recover in order to bring his weapon back
      // into position." There is nothing to recover from until he has struck.
      if(!owed)throw new Error('This weapon is already in position; there is nothing to recover from.');
      // An unarmed blow's recovery is the attack's own cost: a kick takes longer to get back
      // from than a jab (D66), and the mode has no Weapon Speed to look up.
      const attackCosts=attackActionCost(mode.attacks?.[request.attackId]);
      if(mode.weaponSpeed===null&&!attackCosts)throw new Error('Say which unarmed blow is being recovered from; Table 3B prices each one separately.');
      const cost=attackCosts?attackCosts.recover:recoverActions(mode.weaponSpeed);
      return {kind:'recover',actorUuid:actor.uuid,weaponId:weapon.id,weaponUuid:weapon.uuid,modeId:request.modeId,
        attackId:null,ammunitionId:null,ammunitionKey:null,cost,targetUuid:null,
        aimActions:null,preparationActions:0,chamberAfter:null,roundsFired:null,sets:null,
        weaponBefore:structuredClone(weapon.system),ammoBefore:null,loadedAfter:null,
        label:`${weapon.name} · Recover (${cost} action${cost===1?'':'s'})`,
        source:'LEG10204 §3.1 Weapon Action Costs, PDF 18',ruleset:'small-arms'};
    }
    const attack=mode?.attacks?.[request.attackId];
    if(!attack)throw new Error('Choose a carried, equipped melee attack.');
    if(!request.targetUuid)throw new Error('Choose the exact target token.');
    // §5.7: a Chainsaw whose cut is still biting may Strike again on the next impulse instead
    // of recovering. The cut it continues is on the weapon (flags.phoenix-command.chainsawCut);
    // the strike scene checks the impulse when the blow lands.
    const cut=weapon.flags?.['phoenix-command']?.chainsawCut??null;
    if(request.continueCut){
      if(!attack.traits?.includes('chainsaw'))throw new Error('Only a Chainsaw can continue a cut (§5.7).');
      if(!cut||!(cut.cuttingPower>0))throw new Error('There is no cut still biting to continue; strike anew after recovering.');
      if(cut.targetUuid!==request.targetUuid)throw new Error('A continued cut stays on the target the blade is in.');
      if(request.sets!==0)throw new Error('A continued cut is thrown after no sets; the blade is already in contact.');
    }
    // A blow cannot be thrown from a weapon that is still out of position after the last one.
    else if(owed)throw new Error('This weapon has not been recovered since its last blow. Recover before striking again.');
    if(attack.traits?.includes('charge')&&request.sets!==0)throw new Error('A charge is not thrown after sets; its ID already includes the closing speed.');
    // §3.1's cycle: the sets are bought with the blow, and how many were bought is what makes
    // it short, normal or long. Before this the sets were stated in the review and paid for by
    // nobody, which let a long stroke double the damage for the price of a short one (D61).
    const sets=request.sets;
    if(!Number.isSafeInteger(sets)||sets<0||sets>2)throw new Error('State how many sets this blow is thrown after: 0, 1 or 2.');
    // §3.1 limits what the OFF-HAND may throw, against the Agility Skill Factor (D64). A
    // weapon nobody has assigned to a hand is refused rather than assumed to be the primary
    // one, which would let an off-hand long slash through unchecked.
    if(weapon.system.heldIn==='off'){
      assertOffHandBlow({agilitySkillFactor:request.agilitySkillFactor,motion:attack.motion,sets});
    }else if(weapon.system.heldIn!=='primary'&&actor.items.some(i=>i.id!==weapon.id&&i.type==='weapon'&&i.system.carried&&i.system.equipped&&Object.keys(i.system.meleeModes??{}).length)){
      throw new Error('He has another melee weapon equipped. Say which hand holds this one before striking with it, because the off-hand is limited by §3.1.');
    }
    const stroke=strokeCost(mode.weaponSpeed,sets,attack);
    return {kind:'strike',actorUuid:actor.uuid,weaponId:weapon.id,weaponUuid:weapon.uuid,modeId:request.modeId,
      attackId:request.attackId,ammunitionId:null,ammunitionKey:null,cost:stroke.total,targetUuid:request.targetUuid,
      aimActions:null,preparationActions:stroke.setActions,chamberAfter:null,roundsFired:null,sets,
      ...(weapon.system.heldIn==='off'?{agilitySkillFactor:request.agilitySkillFactor}:{}),
      weaponBefore:structuredClone(weapon.system),ammoBefore:null,loadedAfter:null,
      // A fast weapon strikes and recovers in the same action (D65), so the blow leaves
      // nothing owed and the plan says so rather than the tracker inferring it later.
      pairedRecovery:stroke.pairedRecovery,
      ...(request.continueCut?{continueCut:true}:{}),
      label:`${request.continueCut?'Continue the cut · ':''}${weapon.name} · ${attack.traits?.includes('charge')?'Charge':request.continueCut?'Continued':stroke.stroke==='short'?'Short stroke':stroke.stroke==='normal'?'Normal stroke':'Long stroke'} ${request.attackId} (${sets} set${sets===1?'':'s'} + ${stroke.pairedRecovery?'strike and recover together':'strike'}, ${stroke.total} action${stroke.total===1?'':'s'})`,
      source:'LEG10204 §3.1 Weapon Action Costs, PDF 18',ruleset:'small-arms'};
  }
  const weapon=actor.items.find(i=>i.id===request.weaponId),mode=weapon?.system.firearmModes?.[request.modeId];
  if(!weapon?.system.carried||!weapon.system.equipped||!mode)throw new Error('Choose a carried, equipped firearm mode.');
  if(!['self-loading','manual','single-load'].includes(mode.feed))throw new Error('Record the weapon mode\u2019s printed ROF form before timing it: self-loading, manual or single-load.');
  const ammo=actor.items.find(i=>i.id===request.ammunitionId);
  if(!ammo||ammo.type!=='ammunition'||!ammo.system.carried||!mode.ammunition[ammo.system.ammunitionKey])throw new Error('Choose carried ammunition supported by this mode.');
  if(ammo.system.compatibleCatalogIds?.length&&!ammo.system.compatibleCatalogIds.includes(weapon.system.catalogId))throw new Error('Ammunition catalog compatibility does not match this weapon.');
  if(inspectLoadout(actor.items).some(i=>i.code==='ammunitionOverReserved'))throw new Error('Ammunition is over-reserved. Correct the loadout first.');
  let cost,loadedAfter,preparation=null,aimActions=null,roundsFired=null,explosiveBurst=false;
  if(request.kind==='shot'){
    aimActions=request.aimActions;
    if(!mode.fireTypes.includes('single')||!Number.isSafeInteger(aimActions)||aimActions<1||!Object.hasOwn(mode.aimModifiers,String(aimActions)))throw new Error('Choose a supported whole-action single-shot aim time. Firing is included.');
    if(!request.targetUuid)throw new Error('Choose the exact target token.');
    if(weapon.system.loaded.rounds<1||weapon.system.loaded.ammunitionItemId!==ammo.id||ammo.system.quantity<1)throw new Error('Load the selected ammunition before planning a shot.');
    // Chambering is paid on top of aim and only when the weapon is not already ready, so a
    // manual or single-load weapon whose chamber has never been recorded is refused here
    // rather than flattered with an assumption either way.
    const chamber=weapon.system.loaded.chamber;
    if(mode.feed!=='self-loading'&&!['ready','empty'].includes(chamber))
      throw new Error('Record whether this weapon has a round ready before planning a shot with it; the Rate of Fire is paid only for a second or subsequent shot.');
    preparation=shotPreparation({feed:mode.feed,rateOfFire:mode.rateOfFire,reloadTimeActions:mode.reloadTimeActions,
      aimActions,...(mode.feed==='self-loading'?{}:{chamberReady:chamber==='ready'})});
    if(buckshot(mode, ammo.system.ammunitionKey))throw new Error('Buckshot is a pattern. Plan it as a shotgun blast, not a single shot.');
    cost=preparation.total;
    // LEG10203 §6.3: a `**` weapon's trigger pull sends three rounds, aimed like one shot.
    if(request.threeRoundBurst===true){
      if(!Object.keys(mode.threeRoundBurst??{}).length)throw new Error('This weapon prints no 3RB row, so it fires no three-round burst.');
      if(weapon.system.loaded.rounds<3||ammo.system.quantity<3)throw new Error('A three-round burst fires 3 rounds. Load at least that many.');
      roundsFired=3;
    }
  }else if(request.kind==='shotgun'){
    aimActions=request.aimActions;
    if(!mode.fireTypes.includes('single')||!Number.isSafeInteger(aimActions)||aimActions<1||!Object.hasOwn(mode.aimModifiers,String(aimActions)))throw new Error('Choose a supported whole-action aim time. Firing is included.');
    if(!request.targetUuid)throw new Error('Choose the intended target token.');
    if(!buckshot(mode, ammo.system.ammunitionKey))throw new Error('This ammunition prints no SALM, so it is a single shot rather than a shotgun pattern.');
    if(weapon.system.loaded.rounds<1||weapon.system.loaded.ammunitionItemId!==ammo.id||ammo.system.quantity<1)throw new Error('Load the selected ammunition before planning a shot.');
    const chamber=weapon.system.loaded.chamber;
    if(mode.feed!=='self-loading'&&!['ready','empty'].includes(chamber))
      throw new Error('Record whether this weapon has a round ready before planning a shot with it; the Rate of Fire is paid only for a second or subsequent shot.');
    preparation=shotPreparation({feed:mode.feed,rateOfFire:mode.rateOfFire,reloadTimeActions:mode.reloadTimeActions,
      aimActions,...(mode.feed==='self-loading'?{}:{chamberReady:chamber==='ready'})});
    cost=preparation.total;
    roundsFired=1;
  }else if(request.kind==='burst'){
    // A burst is aimed like a shot: the aim time includes firing (§2.2), and these weapons
    // print `*N`, which is how many rounds leave in the half-second, not a chambering cost.
    if(!mode.fireTypes.includes('automatic')||!Number.isSafeInteger(mode.burstRounds)||mode.burstRounds<1)
      throw new Error('This mode has no automatic Rate of Fire, so it fires no burst.');
    aimActions=request.aimActions;
    if(!Number.isSafeInteger(aimActions)||aimActions<1||!Object.hasOwn(mode.aimModifiers,String(aimActions)))
      throw new Error('Choose a supported whole-action aim time. Firing the burst is included.');
    // The hexes are designated when the burst is fired, from the hex he is standing in
    // then. Aim can be paid while he is still moving, and an arc chosen early would be
    // the wrong one — §3.4's own example is a man who is rushing.
    if(weapon.system.loaded.rounds<mode.burstRounds||weapon.system.loaded.ammunitionItemId!==ammo.id||ammo.system.quantity<mode.burstRounds)
      throw new Error(`A burst fires ${mode.burstRounds} rounds. Load at least that many of the selected ammunition.`);
    if(mode.feed!=='self-loading'&&!['ready','empty'].includes(weapon.system.loaded.chamber))
      throw new Error('Record whether this weapon has a round ready before planning a burst with it.');
    preparation=shotPreparation({feed:mode.feed,rateOfFire:mode.rateOfFire,reloadTimeActions:mode.reloadTimeActions,aimActions,
      ...(mode.feed==='self-loading'?{}:{chamberReady:weapon.system.loaded.chamber==='ready'})});
    cost=preparation.total;
    roundsFired=mode.burstRounds;
    // An automatic grenade launcher's rounds explode where they land (grenade-burst.mjs).
    if(Object.keys(mode.ammunition[ammo.system.ammunitionKey]?.burst??{}).length){
      if(mode.ammunition[ammo.system.ammunitionKey].fusePhases!=null)throw new Error('A launcher round detonates on impact.');
      if(request.coverFire===true)throw new Error('Cover fire is a burst of bullets. A burst of grenades is aimed at hexes already.');
      explosiveBurst=true;
    }
  }else if(request.kind==='grenade'){
    // Arm Time is paid, then the aim. Table 4H is the aim, not a firearm aim-time row, and
    // firing is included in it the way §2.2 includes firing in a shot's aim.
    aimActions=request.aimActions;
    grenadeAimAlm(aimActions);
    if(!request.targetUuid)throw new Error('Choose the hex the grenade is aimed at, by the token standing there.');
    const load=mode.ammunition[ammo.system.ammunitionKey];
    if(!load?.burst||!Object.keys(load.burst).length)throw new Error('This is not a grenade.');
    if(!Number.isSafeInteger(mode.armTimeActions)||mode.armTimeActions<1)throw new Error('Record the grenade\'s Arm Time before throwing it.');
    if(weapon.system.loaded.rounds<1||weapon.system.loaded.ammunitionItemId!==ammo.id||ammo.system.quantity<1)throw new Error('Have the grenade in hand before planning the throw.');
    preparation={preparation:mode.armTimeActions,total:mode.armTimeActions+aimActions,detail:`Arm ${mode.armTimeActions}, then aim ${aimActions}.`};
    cost=preparation.total;
    roundsFired=1;
  }else if(request.kind==='launcher'){
    aimActions=request.aimActions;
    if(!mode.fireTypes.includes('single')||!Number.isSafeInteger(aimActions)||aimActions<1||!Object.hasOwn(mode.aimModifiers,String(aimActions)))throw new Error('Choose a supported whole-action aim time. Firing is included.');
    if(!request.targetUuid)throw new Error('Choose the hex the round is aimed at, by the token standing there.');
    const load=mode.ammunition[ammo.system.ammunitionKey];
    if(!load?.burst||!Object.keys(load.burst).length)throw new Error('This is not a launcher round.');
    if(load.fusePhases!=null)throw new Error('This round has a timed fuse. A launched round with a fuse is not supported yet; only impact rounds can be fired.');
    if(weapon.system.loaded.rounds<1||weapon.system.loaded.ammunitionItemId!==ammo.id||ammo.system.quantity<1)throw new Error('Load the launcher before planning a shot.');
    const chamber=weapon.system.loaded.chamber;
    if(mode.feed!=='self-loading'&&!['ready','empty'].includes(chamber))
      throw new Error('Record whether this weapon has a round ready before planning a shot with it; the Rate of Fire is paid only for a second or subsequent shot.');
    preparation=shotPreparation({feed:mode.feed,rateOfFire:mode.rateOfFire,reloadTimeActions:mode.reloadTimeActions,
      aimActions,...(mode.feed==='self-loading'?{}:{chamberReady:chamber==='ready'})});
    cost=preparation.total;
    roundsFired=1;
  }else if(request.kind==='reload'){
    const grenade=thrownMode(mode);
    cost=grenade?READY_GRENADE_ACTIONS:mode.reloadTimeActions;
    if(!Number.isSafeInteger(cost)||cost<1||!Number.isSafeInteger(reloadCapacity(mode))||reloadCapacity(mode)<1)throw new Error('Enter verified weapon capacity and full Reload Time in the Item profile.');
    const loaded=weapon.system.loaded??{rounds:0,ammunitionItemId:null};
    if((loaded.rounds??0)>0&&loaded.ammunitionItemId&&loaded.ammunitionItemId!==ammo.id)throw new Error('Unload this weapon before loading other ammunition.');
    const other=actor.items.filter(i=>i.id!==weapon.id&&i.type==='weapon'&&i.system.loaded?.ammunitionItemId===ammo.id).reduce((sum,i)=>sum+(i.system.loaded?.rounds??0),0);
    loadedAfter=Math.min(reloadCapacity(mode),(ammo.system.quantity??0)-other);
    if(loadedAfter<=(loaded.rounds??0))throw new Error('Nothing remains to add from this stock. Ammunition totals include rounds already loaded.');
  }else throw new Error('Unsupported timed weapon activity.');
  return {kind:request.kind,actorUuid:actor.uuid,weaponId:weapon.id,weaponUuid:weapon.uuid,modeId:request.modeId,
    ammunitionId:ammo.id,ammunitionKey:ammo.system.ammunitionKey,cost,targetUuid:request.targetUuid??null,
    aimActions,preparationActions:preparation?.preparation??0,chamberAfter:chamberAfter(mode.feed,request.kind),
    weaponBefore:structuredClone(weapon.system),ammoBefore:structuredClone(ammo.system),loadedAfter:loadedAfter??null,
    ...(roundsFired!==null?{roundsFired}:{}),
    // §5.10 (optional): a burst aimed at hexes rather than at a man.
    ...(request.kind==='burst'&&request.coverFire===true?{coverFire:true}:{}),
    ...(explosiveBurst?{explosive:true}:{}),
    ...(request.kind==='shot'&&request.threeRoundBurst===true?{threeRoundBurst:true}:{}),
    label:request.kind==='burst'&&request.coverFire===true?`${weapon.name} · Cover fire (${aimActions} aim, ${roundsFired} rounds)`
      :request.kind==='shot'&&request.threeRoundBurst===true
      ?`${weapon.name} · Three-round burst (${aimActions} aim, 3 rounds)`
      :request.kind==='shot'
      ?`${weapon.name} · Aim & fire (${aimActions} aim${preparation.preparation?` + ${preparation.preparation} to chamber`:''})`
      :request.kind==='shotgun'
        ?`${weapon.name} · Shotgun blast (${aimActions} aim${preparation.preparation?` + ${preparation.preparation} to chamber`:''}, 1 round)`
        :request.kind==='burst'
          ?`${weapon.name} · ${explosiveBurst?'Grenade burst':'Automatic burst'} (${aimActions} aim, ${roundsFired} round${roundsFired===1?'':'s'})`
          :request.kind==='grenade'
            ?`${weapon.name} · Throw (${preparation.preparation} to arm + ${aimActions} aim)`
            :request.kind==='launcher'
              ?`${weapon.name} · Launch (${aimActions} aim${preparation.preparation?` + ${preparation.preparation} to chamber`:''})`
              :thrownMode(mode)?`${weapon.name} · Ready next grenade`
              :`${weapon.name} · Reload to ${loadedAfter} rounds`,
    ...(preparation?{preparationDetail:preparation.detail}:{}),
    source:'LEG10200 §1.3 RT/ROF, §5.11 chambering; §2.2–2.4 aim includes fire',ruleset:'small-arms'};
}
// A plan written before chambering was costed has no `aimActions`, and could only have been
// self-loading, where preparation is zero and the cost is the aim. Reading it that way is
// the truth about it, not a reinterpretation.
export const plannedAim=plan=>plan.aimActions??plan.cost;
export function validateWeaponActivity(plan,actor,options={}){
  if(actor.uuid!==plan.actorUuid)throw new Error('The combatant Actor changed.');
  // `sets` is part of what a strike was paid for, so the rebuild has to carry it or the
  // revalidation asks for a number the plan already settled (D61).
  const rebuilt=weaponActivity(actor,{kind:plan.kind,weaponId:plan.weaponId,modeId:plan.modeId,ammunitionId:plan.ammunitionId,attackId:plan.attackId,sets:plan.sets,agilitySkillFactor:plan.agilitySkillFactor,aimActions:plannedAim(plan),targetUuid:plan.targetUuid,...(plan.continueCut?{continueCut:true}:{}),...(plan.threeRoundBurst?{threeRoundBurst:true}:{})},options);
  if(!same(rebuilt.weaponBefore,plan.weaponBefore)||!same(rebuilt.ammoBefore,plan.ammoBefore)||rebuilt.loadedAfter!==plan.loadedAfter||rebuilt.cost!==plan.cost||(plan.kind==='strike'&&rebuilt.sets!==plan.sets)||((plan.kind==='burst'||plan.kind==='shotgun'||plan.kind==='grenade'||plan.kind==='launcher'||plan.threeRoundBurst)&&rebuilt.roundsFired!==plan.roundsFired))throw new Error('Weapon or ammunition changed; cancel and replan before investing more actions.');
}
export function validateShotInput(ticket,input,targetUuid){
  if(ticket.plan.kind==='strike'){
    if(ticket.plan.targetUuid!==targetUuid||ticket.plan.weaponId!==input.weapon.id||ticket.plan.modeId!==input.modeId||ticket.plan.attackId!==input.attackId||!same(ticket.plan.weaponBefore,input.weapon.system))throw new Error('Strike does not match the paid weapon, attack and target.');
    // The sets were bought with the blow, so the stroke resolved has to be the stroke paid for.
    if(ticket.plan.sets!==input.sets)throw new Error(`This blow was paid for after ${ticket.plan.sets} set${ticket.plan.sets===1?'':'s'} and is being resolved after ${input.sets}.`);
    return;
  }
  if(ticket.plan.kind==='burst'){
    if(ticket.plan.weaponId!==input.weapon.id||ticket.plan.modeId!==input.modeId||ticket.plan.ammunitionKey!==input.ammunitionKey||plannedAim(ticket.plan)!==input.aimActions||!same(ticket.plan.weaponBefore,input.weapon.system)||!same(ticket.arc,input.arc))throw new Error('Burst does not match the paid weapon, ammunition, aim time and arc.');
    return;
  }
  if(ticket.plan.targetUuid!==targetUuid||ticket.plan.weaponId!==input.weapon.id||ticket.plan.modeId!==input.modeId||ticket.plan.ammunitionKey!==input.ammunitionKey||plannedAim(ticket.plan)!==input.aimActions||!same(ticket.plan.weaponBefore,input.weapon.system))throw new Error('Attack does not match the paid weapon, target, ammunition and aim time.');
}
