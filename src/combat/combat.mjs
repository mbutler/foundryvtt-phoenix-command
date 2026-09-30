import {validateBurstArc} from '../foundry/burst-arc-validation.mjs';
import {recoveryToQueue} from '../rules/recovery-queue.mjs';
import {finishTimedActivities} from '../rules/activity-lifecycle.mjs';
import {characterActivity} from '../rules/activity-cost.mjs';
import {refreshEncounterAllowances,orderCombatMode,applyOrderCombatMode} from '../foundry/encounter-allowance.mjs';
import {planTurn,validateTurn,finishTurn,assertFireFacing,fieldOfFire} from '../foundry/facing.mjs';
import {locationRollFormula} from '../rules/called-shot.mjs';
import {conditionKey,conditionStamp,reusableShotConditions} from '../foundry/shot-conditions.mjs';
import {hexGeometry,hexRange,encounterScene} from '../foundry/hex-scene.mjs';
import {distanceInFeet} from '../rules/units.mjs';
import {previewFirearm,firearmBand} from '../rules/attacks.mjs';
import {previewShotgun,resolveShotgun,pelletHitCount,hitLocationSpacing,groupingWindow,peopleInPattern,previewAutomaticShotgun,resolveAutomaticShotgun} from '../rules/shotgun.mjs';
import {blastPeople} from '../foundry/shotgun-scene.mjs';
import {changeDecision,sightline,assertVisible,departurePending,reactionInput} from '../rules/impulse-decisions.mjs';
import {validateIntent} from '../application/player-intents.mjs';
import {shotHandoffInput} from '../foundry/shot-handoff.mjs';
import {initialTiming,changeTiming,continueUnchangedWork,elapsedSeconds,migrateTiming,hexesInPhase,actionBalance,reservesFinalConfirmation,movingAimReserve,TIMING_VERSION} from '../rules/timing.mjs';
import {projectActivity} from '../rules/activity-projection.mjs';
import {assertBurstCap} from '../rules/burst-ledger.mjs';
import {previewBurst,burstHitChance,resolveBurst} from '../rules/automatic-fire.mjs';
import {locateHit,previewMelee,resolveMelee} from '../rules/attacks.mjs';
import {arcOccupants,sweptOccupants} from '../foundry/burst-scene.mjs';
import {burstHandoffInput} from '../foundry/burst-handoff.mjs';
import {blastSurroundingRows,burstSurroundingRows,detonationApplyContext,explosiveHandoffInput,grenadeBurstHandoffInput,rebuildDetonationInput,validateThrowPlanRange} from '../foundry/grenade-scene.mjs';
import {grenadeBurstPlacement,previewGrenadeBurst,resolveGrenadeBurst} from '../rules/grenade-burst.mjs';
import {confirmBlastSurroundings,landingSummary} from '../ui/blast-surroundings.mjs';
import {strikeHandoffInput} from '../foundry/strike-scene.mjs';
import {confirmMeleeArmor} from '../ui/shot-review.mjs';
import {smallArmsOptionalRules} from '../foundry/optional-rules.mjs';
import {effectRules,incapacitationEffectLabels} from '../rules/incapacitation-effects.mjs';
import {coverSituation} from '../rules/cover.mjs';
import {automaticMeleeProtection} from '../rules/automatic-protection.mjs';
import {assertParryAllocation} from '../foundry/strike-review.mjs';
import {previewLaunchedGrenade,previewThrownGrenade,resolveDueDetonation,resolveLaunchedGrenade,resolveThrownGrenade,scatterGap,shrapnelHitCount,shrapnelLocationName,detonationHex,burstColumn,burstCell} from '../rules/explosive.mjs';
import {cubeDistance} from '../rules/hex-cube.mjs';
import {confirmImpactArmor,armorOptions} from '../ui/burst-review.mjs';
import {requireCoordinator,serialized} from '../application/coordinator.mjs';
import {postureEffect,validatePosture,finishPosture,supersedePostureActivity} from '../rules/posture.mjs';
import {unloadEffect,validateUnload,finishUnload} from '../rules/unload.mjs';
import {itemHandlingEffect,validateItemHandling,finishItemHandling} from '../rules/item-handling.mjs';
import {doorEffect,validateDoor,finishDoor} from '../rules/door-handling.mjs';
import {planHexMove,validateTokenMove,finishTokenMove,postureForStance,movementPosture,accountedMovement} from '../foundry/hex-move.mjs';
import {mergeSceneTerrain} from '../foundry/movement-scene.mjs';
import {phoenixPaidMoveFlag} from '../ui/token-drag-move.mjs';
import {movementInjuryModifier} from '../rules/disabling-effects.mjs';
import {weaponActivity,validateWeaponActivity,validateShotInput} from '../rules/weapon-timing.mjs';
import {readyToFire,holdFireReason} from '../rules/fire-when-ready.mjs';
import {autoAdvanceEnabled,encounterBlockers} from '../foundry/auto-advance.mjs';
import {impulseInputs,assertBatchUnchanged,finishImpulseBatch,woundInImpulse,dueThisImpulse} from '../rules/impulse-completion.mjs';
import {disabledLocations} from '../rules/disabling-effects.mjs';
import {deriveBaseSpeed,deriveMaximumSpeed} from '../rules/allowance.mjs';
import {defenceParryColumn} from '../rules/melee-parry.mjs';
// Item flags ride along for §5.7's chainsaw cut in progress (flags.phoenix-command.chainsawCut).
export const weaponActorSnapshot=actor=>({uuid:actor.uuid,system:actor.system.toObject(),items:Array.from(actor.items,i=>({id:i.id,uuid:i.uuid,name:i.name,type:i.type,system:i.system.toObject(),flags:structuredClone(i.flags??{})}))});
const timingRecord=state=>foundry.data.operators.ForcedReplacement.create(state);
const spatial=token=>({uuid:token.uuid,x:token.x,y:token.y,elevation:token.elevation,rotation:token.rotation});
// Doors a token can reach: wall snapshots, the token's centre and one hex of reach.
const doorContext=(combat,combatantId)=>{
  const combatant=combat.combatants.get(combatantId),token=combatant?.token;
  return {actor:combatant?.actor,token,center:token?token.getCenterPoint({x:token.x,y:token.y}):null,reach:combat.scene?.grid?.size??0,
    walls:Array.from(combat.scene?.walls??[],wall=>({id:wall.id,door:wall.door,ds:wall.ds,c:[...wall.c]}))};
};
// Attach a pending completion for a fully paid routine order, or a due attack when allowed.
// Attacks keep an explicit final confirmation; reload/turn/posture/unload finish once paid.
function attachActivityCompletion(after,combatantId,{allowAttack=false,combat=null}={}){
  const activity=after.entries[combatantId]?.activity;
  if(!activity||activity.progress<activity.cost||after.pendingEffect||activity.effectStatus)return null;
  if(activity.effect){
    after.pendingEffect={...activity.effect,id:foundry.utils.randomID(),activityId:activity.id,combatantId,
      phase:after.phase,impulse:after.impulse,revision:after.revision};
    return 'effect';
  }
  const kind=activity.weaponPlan?.kind;
  if(['reload','recover','parry'].includes(kind)){
    after.pendingEffect={kind,id:foundry.utils.randomID(),combatantId,plan:activity.weaponPlan};
    return 'effect';
  }
  if(!allowAttack||!reservesFinalConfirmation(activity))return null;
  if(kind==='burst'&&combat)assertBurstCap(combat.getFlag('phoenix-command','shots'),{combatantId,phase:after.phase,impulse:after.impulse});
  const shotId=foundry.utils.randomID();activity.shotId=shotId;
  return {shotId,plan:activity.weaponPlan};
}
// A plan records what each Token had already paid for, so later hexes can be told apart
// from an unpaid drag. See accountedMovement.
const binding=token=>({...spatial(token),movementIds:Object.keys(token.getFlag('phoenix-command','movementReceipts')??{}),turnIds:Object.keys(token.getFlag('phoenix-command','turnReceipts')??{})});
function boundPlan(combat,plan){
  if(JSON.stringify(plan.geometry)!==JSON.stringify(hexGeometry(combat.scene)))throw new Error('The shot’s hex geometry changed or predates hex validation. Abandon this shot and plan it again.');
  if(['shot','shotgun','launcher'].includes(plan.kind)){
    const shooter=combat.combatants.find(c=>c.actor?.uuid===plan.actorUuid&&c.token?.uuid===plan.spatial[0]?.uuid)?.token;
    const target=combat.combatants.find(c=>c.token?.uuid===plan.targetUuid)?.token;
    if(shooter&&target)assertFireFacing(shooter,target);
  }
  for(const saved of plan.spatial){
    const token=combat.combatants.find(c=>c.token?.uuid===saved.uuid)?.token;
    if(!token)throw new Error('A shot participant left the encounter. Reconcile the planned shot.');
    // A plan made before moving fire opened cannot be checked this way, and its positions
    // were never recorded against paid movement. It is replanned rather than reinterpreted.
    if(!Array.isArray(saved.movementIds))throw new Error('This shot predates moving fire. Abandon it and plan it again.');
    const result=accountedMovement({planned:saved,current:spatial(token),
      receipts:{...token.getFlag('phoenix-command','movementReceipts'),...token.getFlag('phoenix-command','turnReceipts')},knownIds:[...saved.movementIds,...(saved.turnIds??[])]});
    if(!result.accounted)throw new Error(`${result.reason} Reconcile the planned shot.`);
  }
}

export class PhoenixCombat extends foundry.documents.Combat {
  get timing(){
    const value=this.getFlag('phoenix-command','timing');
    if(!value&&this.round>0)throw new Error('This encounter uses an older round clock. Create a new Phoenix Command encounter.');
    const state=value?migrateTiming(value):initialTiming();
    if(state.version!==TIMING_VERSION||state.phase!==this.round||!Number.isSafeInteger(state.phase)||state.phase<0||!Number.isSafeInteger(state.revision)||state.revision<0||!Number.isSafeInteger(state.clockRevision)||state.clockRevision<0||!Number.isInteger(state.impulse)||(state.phase===0?state.impulse!==0:state.impulse<1||state.impulse>4))throw new Error('Encounter clock is inconsistent; GM reconciliation is required.');
    return finishTimedActivities(refreshEncounterAllowances(structuredClone(state),this.combatants));
  }
  targetFor(plan){return plan?.targetUuid?this.combatants.find(c=>c.token?.uuid===plan.targetUuid):null;}
  assertDeparturesResolved(){
    for(const [id,entry] of Object.entries(this.timing.entries)){
      const target=this.targetFor(entry.activity?.weaponPlan);
      if(target&&departurePending(this.timing,id,target.id))throw new Error('A target is leaving visibility. Fire accumulated aim or abandon it before closing this impulse.');
    }
  }
  burstTargetIds(shot){
    if(!shot.arc)throw new Error('Designate the arc before resolving this burst.');
    // A burst of grenades is aimed at the hexes: whoever the shooter can see standing in them.
    if(shot.plan?.explosive)return sweptOccupants(this,shot.combatantId,shot.arc).map(man=>man.id)
      .filter(id=>sightline(this.timing,shot.combatantId,id)?.status!=='concealed');
    const {atRange}=arcOccupants(this,shot.combatantId,shot.arc);
    // §5.10 cover fire is aimed at the hexes; nobody need be in them.
    if(!atRange.length&&!shot.plan?.coverFire)throw new Error('Nobody at the swept hexes’ range stands in the arc, so the burst has no elevation target.');
    return atRange.map(man=>man.id);
  }
  threatenedIds(shot){
    return shot.plan?.kind==='burst'?this.burstTargetIds(shot):shot.plan?.kind==='shotgun'?this.shotgunTargetIds(shot):[this.targetFor(shot.plan)?.id].filter(Boolean);
  }
  shotgunTargetIds(shot){
    const intended=this.targetFor(shot.plan);
    if(!intended?.token)throw new Error('The intended target left this encounter.');
    const shooter=this.combatants.get(shot.combatantId)?.token;
    if(!shooter)throw new Error('The shooter has no scene token.');
    const actor=weaponActorSnapshot(this.combatants.get(shot.combatantId).actor);
    const weapon=actor.items.find(item=>item.id===shot.plan.weaponId);
    const measured=hexRange(this.scene,[shooter.getCenterPoint({x:shooter.x,y:shooter.y}),intended.token.getCenterPoint({x:intended.token.x,y:intended.token.y})],points=>this.scene.grid.measurePath(points));
    const band=firearmBand({weapon,modeId:shot.plan.modeId,ammunitionKey:shot.plan.ammunitionKey,distance:{value:measured.range,unit:measured.unit}});
    const radius=band.salm==null||(band.pelletChance==null&&band.pelletRounds==null)?null:band.patternRadiusHexes;
    return blastPeople(this,shot,radius).map(person=>person.id);
  }
  reactionInputForShot(shot){return reactionInput(this.timing,shot.combatantId,this.targetFor(shot.plan)?.id);}
  assertShotDecisions(shot){
    const state=this.timing;
    const ids=shot.plan?.kind==='burst'?this.burstTargetIds(shot):shot.plan?.kind==='shotgun'?this.shotgunTargetIds(shot):[this.targetFor(shot.plan)?.id];
    if(ids.some(id=>!id))throw new Error('The shot target left this encounter.');
    for(const id of ids)assertVisible(state,shot.combatantId,id);
    if(state.reactions?.stage!=='closed'||ids.some(id=>!Object.hasOwn(state.reactions.choices,id)))throw new Error('Open the reaction window, collect hold or duck choices, and close it before rolling.');
    for(const [id,uuid] of Object.entries(state.reactions.participants??{}))if(this.combatants.get(id)?.actor?.uuid!==uuid)throw new Error('A reaction participant changed; GM reconciliation is required.');
  }
  timingCommand(command,options={}){
    return serialized(async()=>{
      await this._timingCommand(command,options);
      if(command.kind==='advance')await this._comeRound();
      if(['advance','coverFire'].includes(command.kind))await this._continueCoverFire();
      if(['advance','move','resumeEffect'].includes(command.kind))await this._continueMovement();
      if(['advance','resumeEffect','cancel'].includes(command.kind))await this._queueRecoveries();
      if(['activity','advance','move','resumeEffect','done','cancel','coverFire'].includes(command.kind))await this._fireWhenReady();
      if(['activity','advance','move','resumeEffect','done','cancel','work','fireNow','coverFire'].includes(command.kind))await this._applyPlannedArcs();
      await this._autoAdvance();
      return this;
    });
  }
  async _timingCommand(command,{intent=null}={}){
      requireCoordinator();
      if(intent){
        const receipt=this.getFlag('phoenix-command',`intents.${intent.id}`);
        if(receipt){
          if(receipt.authorId!==intent.authorId||JSON.stringify(receipt.request)!==JSON.stringify(intent.request))throw new Error('Request identity conflicts with its saved receipt.');
          return this;
        }
        command={...validateIntent(this,intent),id:intent.id};
      }
      if(command.combatantId&&!this.combatants.has(command.combatantId))throw new Error('Combatant no longer exists.');
      const startingScene=command.kind==='start'?encounterScene(this,game.scenes,canvas.scene):null;
      if(['start','activity','work','fireNow','openReactions','move'].includes(command.kind))hexGeometry(startingScene??this.scene);
      const before=this.timing;
      if(command.expectedRevision!==before.revision)throw new Error('Combat timing changed. Review the tracker and try again.');
      if(before.batch&&command.kind!=='advance')throw new Error('The impulse is closed for actions. Finish its knockout checks and advance.');
      const incompleteApplication=game.messages.some(m=>['applying','undoing'].includes(m.getFlag('phoenix-command','application')?.status)&&m.getFlag('phoenix-command','resolution')?.context?.timing?.combatUuid===this.uuid);
      if(incompleteApplication)throw new Error('Recover the unfinished attack application in GM chat before changing this encounter.');
      if(before.pendingEffect){
        if(command.kind==='abandonEffect')return this._abandonPendingEffect(command.reason);
        if(command.kind!=='resumeEffect')throw new Error('Resume the pending activity effect, or set it aside, before changing this encounter.');
        try{await this.finishActivityEffect();}
        catch(error){throw new Error(`${error.message} Resume after fixing it, or set the action aside from the tracker.`);}
        return this;
      }
      if(['resumeEffect','abandonEffect'].includes(command.kind))return this;
      if(before.reactions&&!['react','closeReactions','reviewShot','rollShot','abandonShot','advance'].includes(command.kind))throw new Error('Actions and exposure are frozen for this impulse’s reaction and fire resolution.');
      if(['sightline','openReactions','react','closeReactions','reconcileInterruption'].includes(command.kind)){
        const shots=Object.values(this.getFlag('phoenix-command','shots')??{}).filter(s=>s.timing.clockRevision===before.clockRevision);
        if(shots.some(s=>['rolled','applied','undone'].includes(s.status)))throw new Error('Decisions cannot change after this impulse’s dice have been rolled.');
        if(command.kind==='sightline'&&!this.combatants.has(command.targetId))throw new Error('Choose an encounter target for this sightline.');
        if(command.kind==='react'&&command.choice==='duck'&&this.combatants.get(command.combatantId)?.actor?.system.condition.consciousness!=='conscious')throw new Error('Only a conscious combatant may choose to duck.');
        if(command.kind==='react')assertParryAllocation(this,command.combatantId,command.parries);
        if(command.kind==='openReactions')this.assertDeparturesResolved();
        const ready=shots.filter(s=>s.status==='ready');
        const targetIds=[...new Set(ready.flatMap(shot=>this.threatenedIds(shot)))];
        const incapacitatedIds=targetIds.filter(id=>this.combatants.get(id)?.actor?.system.condition.consciousness!=='conscious');
        const after=changeDecision(before,command,{targetIds,incapacitatedIds,allowEmpty:ready.length>0&&ready.every(shot=>shot.plan?.coverFire||shot.plan?.explosive)});
        if(command.kind==='openReactions'){
          for(const shot of ready)for(const id of this.threatenedIds(shot))assertVisible(before,shot.combatantId,id);
          after.reactions.participants=Object.fromEntries(targetIds.map(id=>[id,this.combatants.get(id).actor.uuid]));
        }
        await this.update({'flags.phoenix-command.timing':timingRecord(after),...(intent?{[`flags.phoenix-command.intents.${intent.id}`]:{...intent,status:'accepted'}}:{})},{phoenixTiming:true});return this;
      }
      if(['reviewShot','rollShot'].includes(command.kind)){
        const activity=before.entries[command.combatantId]?.activity;
        let shot=this.getFlag('phoenix-command',`shots.${activity?.shotId}`);
        if(!shot||!['ready','rolled'].includes(shot.status))throw new Error('Finish paying for an unused aimed shot first.');
        if(command.kind==='reviewShot'){
          if(shot.status!=='ready')throw new Error('Rolled inputs cannot be changed.');
          this.assertShotDecisions(shot);
          boundPlan(this,shot.plan);
          validateWeaponActivity(shot.plan,weaponActorSnapshot(this.combatants.get(command.combatantId).actor));
          const input=(shot.plan.kind==='burst'?(shot.plan.explosive?grenadeBurstHandoffInput(this,shot,command.choices):burstHandoffInput(this,shot,command.choices).input):shot.plan.kind==='grenade'||shot.plan.kind==='launcher'?explosiveHandoffInput(this,shot,command.choices):shot.plan.kind==='strike'?strikeHandoffInput(this,shot,command.choices):shotHandoffInput(this,shot,command.choices));
          const state=structuredClone(before);state.revision++;
          await this.update({'flags.phoenix-command.timing':timingRecord(state),
            // ForcedReplacement, because an update MERGES: a second review that states no
            // cover would otherwise keep the first one's cover underneath it, and the shot
            // would roll against something nobody chose this time. Found natively.
            [`flags.phoenix-command.shots.${shot.id}.adjudication`]:foundry.data.operators.ForcedReplacement.create(
              {choices:command.choices,input,userId:game.user.id,conditionStamp:shot.plan.kind==='shot'?conditionStamp(this,shot):null}),
            ...(shot.plan.kind==='shot'?{[`flags.phoenix-command.shotConditions.${conditionKey(this,shot)}`]:foundry.data.operators.ForcedReplacement.create(command.choices.reuseConditions?{stamp:conditionStamp(this,shot),choices:command.choices}:null)}:{})},{phoenixTiming:true});
        }else{
          if(shot.status==='ready'&&shot.adjudication?.conditionStamp&&shot.adjudication.conditionStamp!==conditionStamp(this,shot))throw new Error('Approved shot conditions changed. Ask the GM to review this sightline again.');
          if(shot.status==='ready'&&!shot.adjudication){
            this.assertShotDecisions(shot);
            const choices=reusableShotConditions(this,shot);
            if(!choices)throw new Error('Awaiting GM review: no approved conditions for this sightline.');
            const input=shotHandoffInput(this,shot,choices);
            await this.update({[`flags.phoenix-command.shots.${shot.id}.adjudication`]:foundry.data.operators.ForcedReplacement.create({choices,input,userId:game.user.id,basis:'reused-approved-conditions',conditionStamp:conditionStamp(this,shot)})});
            shot=this.getFlag('phoenix-command',`shots.${shot.id}`);
          }
          const input=shot.status==='rolled'?shot.input:(shot.plan.kind==='burst'?(shot.plan.explosive?grenadeBurstHandoffInput(this,shot):burstHandoffInput(this,shot).input):shot.plan.kind==='grenade'||shot.plan.kind==='launcher'?explosiveHandoffInput(this,shot):shot.plan.kind==='strike'?strikeHandoffInput(this,shot):shotHandoffInput(this,shot));
          if(shot.status==='ready'&&JSON.stringify(input)!==JSON.stringify(shot.adjudication.input))throw new Error('Shot situation changed. Ask the GM to review it again.');
          if(shot.plan.kind==='burst'&&shot.plan.explosive)await this._rollTimedGrenadeBurst(shot,input,intent);
          else if(shot.plan.kind==='burst')await this._rollTimedBurst(shot,input,intent);
          else if(shot.plan.kind==='shotgun')await this._rollTimedShotgun(shot,input,intent);
          else if(shot.plan.kind==='grenade'||shot.plan.kind==='launcher')await this._rollTimedExplosive(shot,input,intent);
          else if(shot.plan.kind==='strike')await this._rollTimedStrike(shot,input,intent);
          else await this._rollTimedShot(shot.id,input,shot.plan.targetUuid,intent);
        }
        return this;
      }
      if(command.kind==='designateArc'){
        const activity=before.entries[command.combatantId]?.activity;
        const shot=this.getFlag('phoenix-command',`shots.${activity?.shotId}`);
        if(!shot||shot.status!=='ready'||shot.plan.kind!=='burst')throw new Error('Finish paying for an unrolled burst before designating its arc.');
        const {arc}=validateBurstArc(this,shot,command.hexes,command.arcHexes);
        const state=structuredClone(before);state.revision++;
        await this.update({'flags.phoenix-command.timing':timingRecord(state),
          [`flags.phoenix-command.shots.${shot.id}.arc`]:foundry.data.operators.ForcedReplacement.create(arc),
          // A new sweep is a new situation. The previous review was of the previous one.
          [`flags.phoenix-command.shots.${shot.id}.adjudication`]:foundry.data.operators.ForcedReplacement.create(null),
          ...(intent?{[`flags.phoenix-command.intents.${intent.id}`]:{...intent,status:'accepted'}}:{})},{phoenixTiming:true});
        return this;
      }
      if(command.kind==='abandonShot'){
        if(command.expectedRevision!==before.revision)throw new Error('Encounter changed; refresh before abandoning aim.');
        const activity=before.entries[command.combatantId]?.activity,shot=this.getFlag('phoenix-command',`shots.${activity?.shotId}`);
        if(shot?.status!=='ready')throw new Error('Only an unrolled shot can be abandoned. Rolled shots must be applied.');
        const state=structuredClone(before);state.revision++;state.entries[command.combatantId].activity.effectStatus='abandoned';
        await this.update({'flags.phoenix-command.timing':timingRecord(state),[`flags.phoenix-command.shots.${shot.id}.status`]:'abandoned',...(intent?{[`flags.phoenix-command.intents.${intent.id}`]:{...intent,status:'accepted'}}:{})},{phoenixTiming:true});return this;
      }
      const current=before.entries[command.combatantId]?.activity;
      const combatantActor=this.combatants.get(command.combatantId)?.actor;
      // Step 10 of the impulse sequence applies disabling injuries after step 7 resolves all
      // fire, so a wound taken this impulse restricts nothing this impulse. Reading it any
      // other way would make a shot legal or illegal according to which application the GM
      // clicked first.
      const thisImpulse={woundThisImpulse:injury=>woundInImpulse(injury,before,this.uuid)};
      const outstanding=Object.values(this.getFlag('phoenix-command','shots')??{}).filter(s=>['ready','rolled'].includes(s.status));
      if(['activity','cancel','advance','move','abandonMove','meleeDefence'].includes(command.kind)&&outstanding.some(s=>command.kind==='advance'||s.combatantId===command.combatantId))throw new Error('Resolve and apply the due shot before advancing, moving or replacing the activity.');
      let weaponPlan=null,turnPlan=null,plannedArc=null;
      if(command.kind==='activity'&&command.turnFacing!==undefined){
        if(before.entries[command.combatantId]?.movement?.pending)throw new Error('Finish or abandon the current hex before turning in place.');
        turnPlan=planTurn(this.combatants.get(command.combatantId)?.token,combatantActor,command.turnFacing);
        // Turn and aim: the shot is checked now as far as it can be, and fully again when the
        // turn is applied and it is committed as an ordinary order.
        if(command.then){
          const plan=weaponActivity(weaponActorSnapshot(combatantActor),command.then.weaponRequest,thisImpulse);
          if(!['shot','shotgun','launcher'].includes(plan.kind))throw new Error('Only a shot, shotgun blast or launcher round can follow a turn.');
          const shooter=this.combatants.get(command.combatantId).token,target=this.combatants.find(c=>c.token?.uuid===plan.targetUuid)?.token;
          if(!shooter||!target||shooter.uuid===target.uuid)throw new Error('Timed shots require distinct scene tokens.');
          if(!fieldOfFire(shooter.getCenterPoint({x:shooter.x,y:shooter.y}),target.getCenterPoint({x:target.x,y:target.y}),command.turnFacing).allowed)
            throw new Error('After this turn the target would still be outside the 60° Field of Fire.');
          assertVisible(before,command.combatantId,this.targetFor(plan).id);
        }
        command={...command,label:turnPlan.label,cost:turnPlan.cost,catalog:undefined,weaponRequest:undefined};
      }
      if(command.kind==='move'&&current?.effect?.kind==='turn'&&current.progress<current.cost)
        throw new Error('Finish or cancel the stationary turn before moving.');
      if(command.kind==='meleeDefence'){
        if(!combatantActor)throw new Error('The defending combatant has no Actor.');
        if(combatantActor.system.condition.consciousness!=='conscious')throw new Error('Only a conscious character can Dodge or Cover Up.');
        if(command.defence==='dodge'){
          const system=combatantActor.system;
          const base=deriveBaseSpeed({strength:system.attributes.strength,encumbranceLb:system.summary?.inventory?.totalWeightLb});
          if(!base.resolved)throw new Error(base.detail??'Dodge needs a derived Base Speed.');
          const maximum=deriveMaximumSpeed({agility:system.attributes.agility,baseSpeed:base.value});
          if(!maximum.resolved)throw new Error(maximum.detail??'Dodge needs a derived Maximum Speed.');
          const parry=defenceParryColumn({defence:'dodge',maximumSpeed:maximum.value});
          command={...command,maximumSpeed:maximum.value,parryColumn:parry.column};
        }else if(command.defence==='coverUp'){
          const shields=Array.from(combatantActor.items).filter(item=>item.type==='shield'&&item.system.carried&&item.system.equipped&&item.system.strapped&&item.system.partialParry>=5);
          const shield=shields.find(item=>item.id===command.shieldItemId);
          if(!shield)throw new Error('Cover Up requires the selected equipped, strapped Round-or-larger shield.');
          const parry=defenceParryColumn({defence:'coverUp',shieldPartialParry:shield.system.partialParry});
          command={...command,shieldItemId:shield.id,shieldName:shield.name,
            shieldPartialParry:shield.system.partialParry,parryColumn:parry.column};
        }else throw new Error('Choose Dodge or Cover Up.');
      }
      // §5.9 Pinning Fire (optional): one hex, from a firing stance, inside his Field of Fire.
      if(command.kind==='pin'){
        if(!smallArmsOptionalRules().pinningFire)throw new Error('Pinning Fire is an optional rule; turn it on in the world settings first.');
        const token=this.combatants.get(command.combatantId)?.token;
        if(!token||!combatantActor)throw new Error('The pinning combatant has no token or character.');
        if(combatantActor.system.condition.consciousness!=='conscious')throw new Error('Only a conscious character can pin a hex.');
        if(!combatantActor.system.condition.firingStance)throw new Error('Take a firing stance first: a location is pinned from one (§5.9).');
        const grid=this.scene.grid,point=grid.getCenterPoint(grid.getOffset(command.point??{}));
        const from=token.getCenterPoint({x:token.x,y:token.y}),hex=grid.getOffset(point),own=grid.getOffset(from);
        if(hex.i===own.i&&hex.j===own.j)throw new Error('Pin a hex other than his own.');
        if(!fieldOfFire(from,point,token.rotation).allowed)throw new Error('That hex is outside his Field of Fire; turn to face it first.');
        command={...command,pin:{hex:{i:hex.i,j:hex.j},point:{x:point.x,y:point.y},shooterHex:{i:own.i,j:own.j},
          posture:combatantActor.system.condition.posture,firingStance:true}};
      }
      // §5.10 Cover Fire (optional): an automatic weapon and an arc of hexes to cover, checked
      // the way a burst's arc is, except that nobody need stand in it.
      if(command.kind==='coverFire'){
        if(!smallArmsOptionalRules().coverFire)throw new Error('Cover Fire is an optional rule; turn it on in the world settings first.');
        if(combatantActor?.system.condition.consciousness!=='conscious')throw new Error('Only a conscious character can give cover fire.');
        const order=command.order??{};
        const weapon=combatantActor.items.get(order.weaponId),mode=weapon?.system.firearmModes?.[order.modeId];
        if(!weapon?.system.carried||!weapon.system.equipped||!mode?.fireTypes?.includes('automatic')||!(mode.burstRounds>0))throw new Error('Cover fire here is fired in bursts: choose an equipped automatic weapon mode.');
        validateBurstArc(this,{combatantId:command.combatantId,plan:{weaponId:order.weaponId,modeId:order.modeId,coverFire:true}},order.arc?.hexes??[],order.arc?.arcHexes);
      }
      // A shot at someone in the pinned hex keeps the pin; any other order ends it (timing.mjs).
      const pinned=before.entries[command.combatantId]?.pin;
      if(pinned&&command.kind==='activity'&&['shot','shotgun'].includes(command.weaponRequest?.kind)){
        const target=this.combatants.find(c=>c.token?.uuid===command.weaponRequest.targetUuid)?.token;
        const at=target?this.scene.grid.getOffset(target.getCenterPoint({x:target.x,y:target.y})):null;
        if(at&&at.i===pinned.hex.i&&at.j===pinned.hex.j)command={...command,keepPin:true};
      }
      // §5.13 (optional): dazed or disoriented, he is "incapable of offensive action".
      const incapacitated=before.entries[command.combatantId]?.incapacitation?.effect;
      if(command.kind==='activity'&&['shot','shotgun','burst','grenade','launcher','strike'].includes(command.weaponRequest?.kind)&&incapacitated&&!effectRules[incapacitated]?.offensive)
        throw new Error(`${incapacitationEffectLabels[incapacitated]}: incapable of offensive action until it passes.`);
      if(command.kind==='activity'&&command.weaponRequest){
        weaponPlan=weaponActivity(weaponActorSnapshot(combatantActor),command.weaponRequest,thisImpulse);
        validateThrowPlanRange(this,command.combatantId,weaponPlan);
        if((weaponPlan.kind==='shot'||weaponPlan.kind==='shotgun'||weaponPlan.kind==='grenade'||weaponPlan.kind==='launcher'||weaponPlan.kind==='strike')&&!this.combatants.some(c=>c.token?.uuid===weaponPlan.targetUuid))throw new Error('The target token must be in this encounter.');
        if(weaponPlan.kind==='shot'||weaponPlan.kind==='shotgun'||weaponPlan.kind==='grenade'||weaponPlan.kind==='launcher'||weaponPlan.kind==='strike'){
          const shooter=this.combatants.get(command.combatantId).token,target=this.combatants.find(c=>c.token?.uuid===weaponPlan.targetUuid)?.token;
          if(!shooter||!target||shooter.uuid===target.uuid)throw new Error('Timed shots require distinct scene tokens.');
          if(['shot','shotgun','launcher'].includes(weaponPlan.kind))assertFireFacing(shooter,target);
          assertVisible(before,command.combatantId,this.targetFor(weaponPlan).id);
          weaponPlan.geometry=hexGeometry(this.scene);
          weaponPlan.spatial=[binding(shooter),binding(target)];
        }
        if(weaponPlan.kind==='burst'){
          const shooter=this.combatants.get(command.combatantId).token;
          if(!shooter)throw new Error('The shooter has no scene token.');
          // U2d: an arc chosen with the order is checked now and kept with where he stood.
          if(command.weaponRequest.arc){
            validateBurstArc(this,{combatantId:command.combatantId,plan:weaponPlan},command.weaponRequest.arc.hexes,command.weaponRequest.arc.arcHexes);
            plannedArc={...structuredClone(command.weaponRequest.arc),from:{x:shooter.x,y:shooter.y,elevation:shooter.elevation}};
          }
          const entry=before.entries[command.combatantId];
          if(!entry?.allowance)throw new Error('Set a small-arms allowance before planning a burst.');
          const end=projectActivity({allowance:entry.allowance,phase:before.phase,impulse:before.impulse,remaining:actionBalance(before,command.combatantId),cost:weaponPlan.cost});
          assertBurstCap(this.getFlag('phoenix-command','shots'),{combatantId:command.combatantId,phase:end.phase,impulse:end.impulse});
          weaponPlan.geometry=hexGeometry(this.scene);
          weaponPlan.spatial=[binding(shooter)];
        }
        command={...command,label:weaponPlan.label,cost:weaponPlan.cost,catalog:undefined};
      }
      // A declared hex is placed on the map here: Table 7A's direction is read from the
      // angle between the mover's facing and his destination, and a turn made while moving
      // must fit the free hexside the section allows, plus whatever hexsides were paid for.
      if(command.kind==='move'&&command.step){
        const token=this.combatants.get(command.combatantId)?.token;
        if(!token)throw new Error('The moving combatant has no scene token.');
        if(before.entries[command.combatantId]?.movement?.pending)throw new Error('Finish or abandon the hex already being entered.');
        if(!command.destination)throw new Error('Choose the hex to move into.');
        // Snap to the destination hex's centre so a click anywhere inside it means the same
        // hex, and keep the token's own centre offset: a Token's x/y is its top-left corner,
        // not the point the grid measures from.
        const to=this.scene.grid.getCenterPoint(command.destination);
        command={...command,step:mergeSceneTerrain(command.step,{scene:this.scene,point:to}).step};
        if(command.route?.length){
          command={...command,route:command.route.map(leg=>{
            const point=this.scene.grid.getCenterPoint(leg.destination);
            return {...leg,destination:point,step:mergeSceneTerrain(leg.step??{stance:command.step.stance},{scene:this.scene,point}).step};
          })};
        }
        const pivot=token.getCenterPoint({x:0,y:0});
        // The DOCUMENT's centre, not the placeable's. A placeable can lag its document -
        // mid-animation, or after a busy session - and a hex measured from a stale sprite
        // is measured from somewhere the combatant is not. `_rollTimedShot` already reads
        // the document for range; this now agrees with it.
        const placement=planHexMove({scene:this.scene,from:token.getCenterPoint({x:token.x,y:token.y}),to,pivot,
          rotation:token.rotation,elevation:token.elevation,destinationElevation:command.destinationElevation??token.elevation,
          measurePath:points=>this.scene.grid.measurePath(points),
          // Foundry's own movement sweep, so the walls a GM drew are the walls a hex obeys.
          testCollision:(a,b)=>!!CONFIG.Canvas.polygonBackends.move?.testCollision(a,b,{type:'move',mode:'any'})});
        // The stance sets the posture, so record what it was when the hex was declared;
        // application refuses a posture something else has changed in the meantime.
        const posture=postureForStance[command.step.stance];
        // Reached before quoteHexStep, so it must give the rules reason rather than a
        // consequence of it: the stance is refused because Table 7A does not print it.
        if(!posture)throw new Error(`Movement stance "${command.step.stance??'unknown'}" has no Table 7A row, so it has neither a movement cost nor a posture. Supported: ${Object.keys(postureForStance).join(', ')}.`);
        const actor=this.combatants.get(command.combatantId)?.actor;
        if(!actor)throw new Error('The moving combatant has no Actor.');
        if(actor.system.condition.consciousness!=='conscious')throw new Error('Confirm the combatant is conscious before moving.');
        // Table 7A prices injured movement, so a disabling injury makes a hex cost more
        // rather than stopping it. The rows are derived from the wounds, never asked for.
        const injury=movementInjuryModifier(disabledLocations(actor.system.injuries,thisImpulse.woundThisImpulse));
        if(injury.unclassified.length)throw new Error(`A disabling injury at an unrecognised location (${injury.unclassified.join(', ')}) has no Table 7A movement row. Rule on its cost and move this combatant directly.`);
        if(injury.groups.length){
          if(command.step.injury!==undefined&&JSON.stringify([command.step.injury].flat().sort())!==JSON.stringify([...injury.groups].sort()))
            throw new Error('The stated movement injury rows do not match this combatant\u2019s recorded disabling injuries.');
          command={...command,step:{...command.step,injury:injury.groups}};
        }
        // Every completed hex ends preparation, even when posture stays the same.
        placement.posture=movementPosture(actor,posture);
        const hexsides=command.hexsides??0;
        if(command.facing!==undefined){
          if(!Number.isFinite(command.facing))throw new Error('A new facing must be a finite angle in degrees.');
          const delta=Math.abs(((command.facing-token.rotation)%360+540)%360-180);
          if(delta>(hexsides+1e-9)*60)throw new Error(`Turning ${Math.round(delta)} degrees needs ${Math.ceil(delta/60)} hexsides; ${hexsides} were declared.`);
        }
        command={...command,step:{...command.step,direction:command.step.direction??placement.direction},
          placement:{...placement,tokenUuid:token.uuid,before:spatial(token),facing:command.facing??null}};
      }
      if(['work','fireNow'].includes(command.kind)&&current?.weaponPlan)validateWeaponActivity(current.weaponPlan,weaponActorSnapshot(combatantActor),thisImpulse);
      if(['work','fireNow'].includes(command.kind)&&['shot','shotgun','grenade','launcher','strike'].includes(current?.weaponPlan?.kind)){boundPlan(this,current.weaponPlan);assertVisible(before,command.combatantId,this.targetFor(current.weaponPlan)?.id);}
      if(command.kind==='undoWork'&&current?.weaponPlan&&current.progress===current.cost)throw new Error('Completed weapon activities cannot use action-only undo.');
      if(command.kind==='activity'&&command.catalog){
        if(combatantActor?.system.condition.consciousness!=='conscious')throw new Error('Only a conscious character can start an activity.');
        command={...command,catalog:characterActivity(command.catalog,combatantActor)};
      }
      const effect=turnPlan?.effect??(command.kind==='activity'&&command.catalog
        ?(postureEffect(command.catalog.id,combatantActor,thisImpulse)??unloadEffect(command.catalog,combatantActor)??itemHandlingEffect(command.catalog,combatantActor)??doorEffect(command.catalog,doorContext(this,command.combatantId)))
        :null);
      const validateEffect=(effect,actor,id)=>effect.kind==='turn'
        ?validateTurn(effect,this.combatants.get(id)?.token,actor)
        :effect.kind==='unload'?validateUnload(effect,weaponActorSnapshot(actor)):effect.kind==='item-handling'?validateItemHandling(effect,weaponActorSnapshot(actor)):effect.kind==='door'?validateDoor(effect,doorContext(this,id)):validatePosture(effect,actor,thisImpulse);
      if(command.kind==='work'&&current?.effect)validateEffect(current.effect,combatantActor,command.combatantId);
      if(command.kind==='undoWork'&&current?.effect&&current.progress===current.cost)throw new Error('Completed effects cannot use action-only undo. The GM must adjudicate a correction.');
      if(command.kind==='advance'){
        if(before.reactions?.stage==='open')throw new Error('Finish the open reaction window before advancing.');
        this.assertDeparturesResolved();
        const incomplete=game.messages.some(m=>{const p=m.getFlag('phoenix-command','application');return ['applying','undoing'].includes(p?.status)&&m.getFlag('phoenix-command','resolution')?.context?.timing?.combatUuid===this.uuid;});
        if(incomplete)throw new Error('Recover the unfinished application in GM chat before advancing.');
        // A detonation that failed when its fuse expired is retried, with its saved dice,
        // before time moves on. Its wounds then join this impulse's knockout check below.
        await this._resolveDueDetonations(before.phase);
        // Section 2.7 requires a knockout check in every impulse a combatant is wounded,
        // so the impulse cannot be left untotalled once any wound is recorded in it.
        const wounded=this.combatants.some(c=>Object.values(c.actor?.system.injuries??{}).some(i=>woundInImpulse(i,before,this.uuid)));
        if(before.batch)assertBatchUnchanged(before.batch,this.impulseInputs());
        if(wounded&&!before.batch?.complete)throw new Error('Wounds were recorded this impulse. Total the impulse and take its knockout checks before advancing.');
      }
      // User ruling (26 Sep 2026): the order says which Combat Actions it is fought with.
      const orderMode=command.combatantId?orderCombatMode(command):null;
      const base=orderMode?applyOrderCombatMode(structuredClone(before),command.combatantId,orderMode,combatantActor):before;
      const after=command.kind==='fireNow'?changeDecision(base,command,{aimModifiers:current?.weaponPlan?.weaponBefore.firearmModes[current.weaponPlan.modeId]?.aimModifiers,preparation:current?.weaponPlan?.preparationActions??0}):changeTiming(base,command,{refreshAllowances:state=>refreshEncounterAllowances(state,this.combatants)});
      // Validate only continuations that actually invested actions, before persisting
      // either their progress or the new clock. The rule transition is still local.
      if(command.kind==='advance')for(const [id,entry] of Object.entries(after.entries)){
        const previous=before.entries[id]?.activity,activity=entry.activity;
        if(!previous||activity?.progress<=previous.progress)continue;
        const actor=this.combatants.get(id)?.actor;
        if(!actor)throw new Error('The continuing activity Actor no longer exists; reconcile or cancel its activity.');
        // A continuation that is no longer valid holds that one order with its reason; the
        // clock still advances for everyone else. Its actions this impulse are not spent.
        try{
          if(activity.effect)validateEffect(activity.effect,actor,id);
          if(activity.weaponPlan)validateWeaponActivity(activity.weaponPlan,weaponActorSnapshot(actor),thisImpulse);
          if(['shot','shotgun','grenade','launcher','strike'].includes(activity.weaponPlan?.kind)){boundPlan(this,activity.weaponPlan);assertVisible(after,id,this.targetFor(activity.weaponPlan)?.id);}
        }catch(error){
          const paid=activity.progress-previous.progress;
          activity.progress=previous.progress;entry.spent-=paid;
          const index=entry.history.findLastIndex(h=>h.kind==='work'&&h.continued&&h.activityId===activity.id);
          if(index>=0)entry.history.splice(index,1);
          activity.holdReason=error.message;
        }
      }
      if(weaponPlan)after.entries[command.combatantId].activity.weaponPlan=weaponPlan;
      if(plannedArc)after.entries[command.combatantId].activity.plannedArc=plannedArc;
      if(effect)after.entries[command.combatantId].activity.effect=effect;
      // Commit and initial preparation are one coordinator transaction. Attach the
      // effect first so continuous work can finish routine orders in the same pass.
      if(command.kind==='activity')continueUnchangedWork(after,[command.combatantId]);
      if(command.kind==='move'&&!command.declareOnly){
        const last=after.entries[command.combatantId].history.at(-1);
        const placement=before.entries[command.combatantId]?.movement?.pending?.placement??command.placement;
        if(last?.kind==='move'&&last.status==='entered'){
          if(!placement)throw new Error('This hex has no recorded placement; abandon and replan it.');
          after.pendingEffect={kind:'move',id:foundry.utils.randomID(),combatantId:command.combatantId,
            tokenUuid:placement.tokenUuid,before:placement.before,
            after:{...placement.position,...(placement.facing===null?{}:{rotation:placement.facing})},
            ...(placement.posture?{posture:placement.posture}:{}),
            phase:after.phase,impulse:after.impulse,revision:after.revision};
        }
      }
      finishTimedActivities(after);
      if(command.kind==='activity')attachActivityCompletion(after,command.combatantId);
      const update={round:after.phase,turn:null,'flags.phoenix-command.timing':timingRecord(after)};
      // A different intention can invalidate preparation even if a token stays put
      // (reload, parry, posture work). Starting it requires fresh condition approval.
      if(command.combatantId&&(['move','meleeDefence'].includes(command.kind)||(command.kind==='activity'&&weaponPlan?.kind!=='shot')))
        update[`flags.phoenix-command.shotConditionEpochs.${command.combatantId}`]=after.revision;
      if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted'};
      if(command.kind==='advance'&&(before.reactions||before.sightlines))update[`flags.phoenix-command.decisionHistory.${before.phase}-${before.impulse}`]={reactions:before.reactions??null,sightlines:before.sightlines??{},source:'LEG10200 §2.2–2.5'};
      if(command.kind==='advance'&&before.batch?.complete)update[`flags.phoenix-command.impulseBatches.${before.phase}-${before.impulse}`]=before.batch;
      if(['work','fireNow'].includes(command.kind)){
        const due=attachActivityCompletion(after,command.combatantId,{allowAttack:true,combat:this});
        update['flags.phoenix-command.timing']=timingRecord(after);
        if(due?.shotId)update[`flags.phoenix-command.shots.${due.shotId}`]={id:due.shotId,applicationId:crypto.randomUUID(),combatantId:command.combatantId,status:'ready',plan:due.plan,
          timing:{combatUuid:this.uuid,phase:after.phase,impulse:after.impulse,clockRevision:after.clockRevision}};
      }
      const options={phoenixTiming:true,turnEvents:false,worldTime:{delta:elapsedSeconds(after)-elapsedSeconds(before)}};
      if(command.kind==='start'){update.scene=startingScene.id;Hooks.callAll('combatStart',this,update);}
      await this.update(update,options);
      if(after.pendingEffect)await this.finishActivityEffect();
      if(command.kind==='advance')await this._finishCompletedRoutineActivities();
      if(command.kind==='advance')await this._resolveDueDetonations(after.phase);
      Hooks.callAll('phoenixCommandTiming',this,{phase:after.phase,impulse:after.impulse});
      return this;
  }
  async _finishCompletedRoutineActivities(){
    for(let steps=0;steps<24;steps++){
      const state=structuredClone(this.timing);
      if(state.pendingEffect){await this.finishActivityEffect();continue;}
      let combatantId=null;
      for(const [id,entry] of Object.entries(state.entries)){
        const activity=entry.activity;
        if(!activity||activity.progress<activity.cost||activity.effectStatus)continue;
        if(activity.effect||['reload','recover','parry'].includes(activity.weaponPlan?.kind)){combatantId=id;break;}
      }
      if(!combatantId)return;
      attachActivityCompletion(state,combatantId);
      if(!state.pendingEffect)return;
      state.revision++;
      await this.update({'flags.phoenix-command.timing':timingRecord(state)},{phoenixTiming:true});
      await this.finishActivityEffect();
    }
  }
  // Fire when ready: pay each paid-up attack's final action with the command the Fire button
  // sends. A refusal, or a reason the shooter would reconsider, holds fire and is shown.
  // Auto-advance: when the GM has it on, run the clock through impulses in which nobody has
  // a decision, up to four phases at a time. Each step is an ordinary advance, followed by
  // the same continuation and fire-when-ready passes an advance normally gets.
  autoAdvance(){return serialized(()=>this._autoAdvance());}
  async _autoAdvance(){
    if(!autoAdvanceEnabled()||game.combat?.id!==this.id)return;
    for(let step=0;step<16;step++){
      if(encounterBlockers(this).length)return;
      try{await this._timingCommand({kind:'advance',expectedRevision:this.timing.revision,id:foundry.utils.randomID()});}
      catch(error){globalThis.ui?.notifications?.warn(`Auto-advance stopped: ${error.message}`);return;}
      await this._comeRound();
      await this._continueCoverFire();
      await this._continueMovement();
      await this._queueRecoveries();
      await this._fireWhenReady();
    }
  }
  // §5.10 (optional): a standing Cover Fire order fires a one-action burst at its hexes each
  // impulse he has an action and nothing else in hand. Running dry, or a burst that can no
  // longer be planned, ends the order and says why.
  async _continueCoverFire(){
    for(const c of this.combatants){
      const state=this.timing,entry=state.entries[c.id],order=entry?.coverFire;
      if(!order||state.pendingEffect||state.reactions||state.batch)continue;
      if(entry.activity&&entry.activity.progress<entry.activity.cost)continue;
      if(!(actionBalance(state,c.id)>0)||c.actor?.system.condition.consciousness!=='conscious')continue;
      const weapon=c.actor.items.get(order.weaponId),rounds=weapon?.system.firearmModes?.[order.modeId]?.burstRounds;
      const stop=async reason=>{
        await this._timingCommand({kind:'stopCoverFire',combatantId:c.id,reason,expectedRevision:this.timing.revision,id:foundry.utils.randomID()});
        globalThis.ui?.notifications?.info(`${c.name}: cover fire stops. ${reason}`);
      };
      if(!weapon||(weapon.system.loaded?.rounds??0)<rounds){await stop('Not enough rounds loaded for another burst; reload.');continue;}
      try{await this._timingCommand({kind:'activity',combatantId:c.id,continuous:true,keepCoverFire:true,keepPin:false,expectedRevision:this.timing.revision,id:foundry.utils.randomID(),
        weaponRequest:{kind:'burst',coverFire:true,weaponId:order.weaponId,modeId:order.modeId,ammunitionId:order.ammunitionId,aimActions:1,arc:structuredClone(order.arc)}});}
      catch(error){await stop(error.message);}
    }
  }
  // §5.13 (optional): a man knocked out or stunned comes round when his Table 8B time is up on
  // the encounter clock (timing.mjs marks him). One whose recovery says he died stays down.
  async _comeRound(){
    const ids=Object.entries(this.timing.entries).filter(([,entry])=>entry.comeRound).map(([id])=>id);
    if(!ids.length)return;
    for(const id of ids){
      const actor=this.combatants.get(id)?.actor;
      if(actor?.system.condition.consciousness==='incapacitated'&&actor.system.recovery?.outcome!=='died')
        await actor.update({'system.condition.consciousness':'conscious'});
    }
    const after=structuredClone(this.timing);
    for(const id of ids)delete after.entries[id].comeRound;
    after.revision++;
    await this.update({'flags.phoenix-command.timing':timingRecord(after)},{phoenixTiming:true});
  }
  // U5: a striker who owes recovery and has no order gets a continuous Recover.
  async _queueRecoveries(){
    const shots=Object.values(this.getFlag('phoenix-command','shots')??{});
    for(const c of this.combatants){
      const state=this.timing;
      if(!c.actor)continue;
      const weapons=Array.from(c.actor.items??[]).filter(i=>i.type==='weapon').map(i=>({id:i.id,carried:i.system.carried,equipped:i.system.equipped,
        meleeModes:i.system.meleeModes,chainsawCut:i.flags?.['phoenix-command']?.chainsawCut??null}));
      const queuedShot=shots.some(s=>s.combatantId===c.id&&['ready','rolled'].includes(s.status));
      const recover=recoveryToQueue(state,c.id,{weapons,combatUuid:this.uuid,queuedShot,conscious:c.actor.system.condition?.consciousness==='conscious'});
      if(!recover)continue;
      try{await this._timingCommand({kind:'activity',combatantId:c.id,continuous:true,weaponRequest:{kind:'recover',...recover},
        expectedRevision:this.timing.revision,id:foundry.utils.randomID()});}
      catch(error){globalThis.ui?.notifications?.warn(`${c.name}: recovery was not queued. ${error.message}`);}
    }
  }
  // U2d: a burst fired where its shooter stood when he chose its arc takes that arc, through
  // the ordinary designateArc command (so it is validated again). If he moved, or it no longer
  // validates, the arc is his choice now, with the reason shown.
  async _applyPlannedArcs(){
    for(const c of this.combatants){
      const state=this.timing,a=state.entries[c.id]?.activity;
      if(!a?.plannedArc||a.plannedArcIssue||state.reactions||state.batch||state.pendingEffect)continue;
      const shot=this.getFlag('phoenix-command',`shots.${a.shotId}`);
      if(shot?.status!=='ready'||shot.plan.kind!=='burst'||shot.arc)continue;
      const token=c.token,from=a.plannedArc.from;
      let issue=token&&token.x===from.x&&token.y===from.y&&token.elevation===from.elevation?null:'The shooter has moved since the arc was chosen.';
      if(!issue){
        try{await this._timingCommand({kind:'designateArc',combatantId:c.id,hexes:a.plannedArc.hexes,arcHexes:a.plannedArc.arcHexes,expectedRevision:this.timing.revision,id:foundry.utils.randomID()});continue;}
        catch(error){issue=`The arc chosen with the order no longer fits: ${error.message}`;}
      }
      const held=structuredClone(this.timing),heldActivity=held.entries[c.id]?.activity;
      if(!heldActivity)continue;
      heldActivity.plannedArcIssue=issue;held.revision++;
      await this.update({'flags.phoenix-command.timing':timingRecord(held)},{phoenixTiming:true});
    }
  }
  async _fireWhenReady(){
    for(const c of this.combatants){
      const state=this.timing;
      if(!readyToFire(state,c.id))continue;
      const activity=state.entries[c.id].activity;
      let reason=holdFireReason(state,c.id,{condition:c.actor?.system.condition,injuries:c.actor?.system.injuries,
        combatUuid:this.uuid,targetId:this.targetFor(activity.weaponPlan)?.id});
      if(!reason){
        try{await this._timingCommand({kind:'work',combatantId:c.id,expectedRevision:state.revision,id:foundry.utils.randomID()});continue;}
        catch(error){reason=error.message;}
      }
      const held=structuredClone(this.timing),a=held.entries[c.id]?.activity;
      if(!a||a.id!==activity.id||a.holdReason===reason)continue;
      a.holdReason=reason;held.revision++;
      await this.update({'flags.phoenix-command.timing':timingRecord(held)},{phoenixTiming:true});
    }
  }
  async _continueMovement(){
    for(const c of this.combatants){
      for(let steps=0;steps<24;steps++){
        const state=this.timing,entry=state.entries[c.id];
        if(state.pendingEffect||state.reactions||state.batch||!entry?.movement?.pending||entry.movement.automatic===false||!(actionBalance(state,c.id)-movingAimReserve(state,c.id)>0))break;
        if(c.actor?.system.condition.consciousness!=='conscious')break;
        try{await this._timingCommand({kind:'move',combatantId:c.id,expectedRevision:state.revision,id:foundry.utils.randomID()});}
        catch(error){
          const paused=structuredClone(this.timing);
          if(paused.pendingEffect)throw error;
          paused.entries[c.id].movement.automatic=false;paused.entries[c.id].movement.pausedReason=error.message;paused.revision++;
          await this.update({'flags.phoenix-command.timing':timingRecord(paused)},{phoenixTiming:true});
          globalThis.ui?.notifications?.warn(`${c.name}: movement paused. ${error.message}`);break;
        }
      }
    }
  }
  // A completed action whose effect cannot be applied (its item or token is gone, or it was
  // changed another way) would otherwise block every encounter command. The GM may set it
  // aside with a reason. It is retried once first, so an effect whose receipt already landed
  // finishes normally instead of being recorded as abandoned. Nothing is written to the
  // character; the attempt, the error and the reason are kept on the encounter.
  async _abandonPendingEffect(reason){
    requireCoordinator();
    if(typeof reason!=='string'||!reason.trim())throw new Error('Give a reason for setting this action aside.');
    const pending=this.timing.pendingEffect;
    try{await this.finishActivityEffect();return this;}
    catch(error){
      const state=structuredClone(this.timing);
      if(state.pendingEffect?.id!==pending.id)throw new Error('Pending activity changed; inspect the encounter.');
      const activity=pending.kind==='move'?null:state.entries[pending.combatantId]?.activity;
      if(activity)activity.effectStatus='abandoned';
      state.pendingEffect=null;state.revision++;
      await this.update({'flags.phoenix-command.timing':timingRecord(state),
        [`flags.phoenix-command.abandonedEffects.${pending.id}`]:{effect:pending,error:error.message,reason:reason.trim(),
          userId:game.user.id,phase:state.phase,impulse:state.impulse}},{phoenixTiming:true});
      return this;
    }
  }
  // A turn made for a shot starts that shot as soon as the turn is applied, through the
  // ordinary activity command, so every check runs against the new facing. If it can no
  // longer be started (the target moved or hid, the gun was emptied), the reason is kept
  // in the combatant's history for the owner to see, and he chooses again.
  async _startFollowUp(combatantId,then){
    try{
      await this._timingCommand({kind:'activity',combatantId,weaponRequest:then.weaponRequest,continuous:true,
        id:foundry.utils.randomID(),expectedRevision:this.timing.revision});
    }catch(error){
      const state=structuredClone(this.timing);
      state.entries[combatantId].history.push({kind:'followUpDropped',label:'Shot after turning',reason:error.message,phase:state.phase,impulse:state.impulse});
      state.revision++;
      await this.update({'flags.phoenix-command.timing':timingRecord(state)},{phoenixTiming:true});
      globalThis.ui?.notifications?.warn(`${this.combatants.get(combatantId)?.name??'Combatant'}: turned, but the shot could not start. ${error.message}`);
    }
  }
  async finishActivityEffect(){
    requireCoordinator();
    const pending=this.timing.pendingEffect;if(!pending)return;
    const acknowledge=async()=>{
      const state=structuredClone(this.timing);
      if(state.pendingEffect?.id!==pending.id)throw new Error('Pending activity changed; inspect the encounter.');
      // Movement is paid in its own slot, so there is no activity to stamp as applied.
      if(pending.kind!=='move')state.entries[pending.combatantId].activity.effectStatus='applied';
      else if(pending.posture)supersedePostureActivity(state,pending);
      state.pendingEffect=null;state.revision++;
      await this.update({'flags.phoenix-command.timing':timingRecord(state)},{phoenixTiming:true});
    };
    if(pending.kind==='move'){
      await finishTokenMove(pending,{
        readToken:async uuid=>{const token=await fromUuid(uuid);return token?{uuid:token.uuid,x:token.x,y:token.y,elevation:token.elevation,rotation:token.rotation,receipts:token.getFlag('phoenix-command','movementReceipts')}:null;},
        // A walk, so Foundry's movement history measures it (a teleport, the old `teleport`
        // option, records every hex as 0 ft). Its wall and cost constraints are off: by this
        // point the hex has been declared, checked against the walls and paid for in full, and
        // letting Foundry reconsider it would second-guess a settled decision silently.
        writeToken:async(uuid,patch)=>{const token=await fromUuid(uuid);if(!token?.canUserModify(game.user,'update'))throw new Error('Token update permission is required to place paid movement.');
          await token.update(patch,{animate:false,[phoenixPaidMoveFlag]:true,movement:{[token.id]:{method:'api',
            waypoints:[{x:patch.x,y:patch.y,elevation:token.elevation,action:'walk'}],constrainOptions:{ignoreWalls:true,ignoreCost:true}}}});},
        readActor:async uuid=>{const actor=await fromUuid(uuid);return actor?{uuid:actor.uuid,system:actor.system.toObject(),receipts:actor.getFlag('phoenix-command','movementReceipts')}:null;},
        writeActor:async(uuid,patch)=>{const actor=await fromUuid(uuid);if(!actor?.testUserPermission(game.user,'OWNER'))throw new Error('Actor ownership is required to set the posture a movement stance implies.');await actor.update(patch);},
        acknowledge});
      const route=this.timing.entries[pending.combatantId]?.movement?.route;
      if(route?.length){
        const leg=route[0];
        await this._timingCommand({kind:'move',combatantId:pending.combatantId,declareOnly:true,popRoute:true,
          id:foundry.utils.randomID(),expectedRevision:this.timing.revision,
          step:leg.step,destination:leg.destination,hexsides:leg.hexsides??0,
          ...(leg.facing===undefined?{}:{facing:leg.facing})});
      }
      return;
    }
    if(pending.kind==='turn'){
      const then=this.timing.entries[pending.combatantId]?.activity?.then;
      await finishTurn(pending,{
        readToken:async uuid=>{const token=await fromUuid(uuid);return token?{uuid:token.uuid,x:token.x,y:token.y,elevation:token.elevation,rotation:token.rotation,receipts:token.getFlag('phoenix-command','turnReceipts')}:null;},
        readActor:uuid=>fromUuid(uuid),
        writeToken:async(uuid,patch)=>{const token=await fromUuid(uuid);if(!token?.canUserModify(game.user,'update'))throw new Error('Token ownership is required to turn.');await token.update(patch,{animate:false,[phoenixPaidMoveFlag]:true});},
        acknowledge});
      if(then)await this._startFollowUp(pending.combatantId,then);
      return;
    }
    if(pending.kind==='recover'||pending.kind==='parry'){
      // §3.1: recovering brings the weapon back into position, and the blow it owed is paid.
      // A parry does the same job - "a Parry with a weapon can always be used in place of a
      // Recover move" - so both clear the debt (D62).
      const actor=this.combatants.get(pending.combatantId)?.actor;
      if(actor?.uuid!==pending.plan.actorUuid)throw new Error('Recover Actor changed.');
      const weapon=actor.items.get(pending.plan.weaponId);
      if(!weapon)throw new Error('Recover weapon no longer exists.');
      if(!weapon.getFlag('phoenix-command',`recoverReceipts.${pending.id}`)){
        await weapon.update({[`system.meleeModes.${pending.plan.modeId}.preparation.recoveryRequired`]:false,
          [`flags.phoenix-command.recoverReceipts.${pending.id}`]:true});
      }
      await acknowledge();return;
    }
    if(pending.kind==='reload'){
      const actor=this.combatants.get(pending.combatantId)?.actor;
      if(actor?.uuid!==pending.plan.actorUuid)throw new Error('Reload Actor changed.');
      const weapon=actor.items.get(pending.plan.weaponId);
      if(!weapon)throw new Error('Reload weapon no longer exists.');
      if(!weapon.getFlag('phoenix-command',`reloadReceipts.${pending.id}`)){
        validateWeaponActivity(pending.plan,weaponActorSnapshot(actor));
        await weapon.update({'system.loaded':{ammunitionItemId:pending.plan.ammunitionId,rounds:pending.plan.loadedAfter,
          ...(pending.plan.chamberAfter?{chamber:pending.plan.chamberAfter}:{chamber:weapon.system.loaded.chamber})},
          'flags.phoenix-command.lastResourceApplication':`reload-${pending.id}`,
          [`flags.phoenix-command.reloadReceipts.${pending.id}`]:true});
      }
      await acknowledge();return;
    }
    if(pending.kind==='unload'){
      await finishUnload(pending,{
        readActor:async uuid=>{
          const actor=await fromUuid(uuid);
          return actor?{uuid:actor.uuid,type:actor.type,system:actor.system.toObject(),
            items:Array.from(actor.items,i=>({id:i.id,uuid:i.uuid,type:i.type,system:i.system.toObject(),
              receipts:typeof i.getFlag==='function'?i.getFlag('phoenix-command','unloadReceipts'):undefined}))}:null;
        },
        writeWeapon:async(uuid,patch)=>{
          const weapon=await fromUuid(uuid);
          if(!weapon)throw new Error('Unload weapon no longer exists.');
          await weapon.update(patch);
        },
        acknowledge});
      return;
    }
    if(pending.kind==='door'){
      await finishDoor(pending,{
        readWall:async id=>{const wall=this.scene?.walls.get(id);return wall?{id:wall.id,ds:wall.ds,receipts:wall.getFlag('phoenix-command','doorReceipts')}:null;},
        writeWall:async(id,patch)=>{const wall=this.scene?.walls.get(id);if(!wall)throw new Error('The door is no longer on the map.');await wall.update(patch);},
        acknowledge});
      return;
    }
    if(pending.kind==='item-handling'){
      await finishItemHandling(pending,{
        readActor:async uuid=>{
          const actor=await fromUuid(uuid);
          return actor?{...weaponActorSnapshot(actor),items:Array.from(actor.items,i=>({id:i.id,uuid:i.uuid,type:i.type,name:i.name,system:i.system.toObject(),
            receipts:typeof i.getFlag==='function'?i.getFlag('phoenix-command','handlingReceipts'):undefined}))}:null;
        },
        writeItem:async(uuid,patch)=>{
          const item=await fromUuid(uuid);
          if(!item)throw new Error('The item no longer exists.');
          await item.update(patch);
        },
        acknowledge});
      return;
    }
    await finishPosture(pending,{
      readActor:async uuid=>{const actor=await fromUuid(uuid);return actor?{uuid:actor.uuid,system:actor.system.toObject(),receipts:actor.getFlag('phoenix-command','activityReceipts')}:null;},
      writeActor:async(uuid,patch)=>{const actor=await fromUuid(uuid);if(!actor?.testUserPermission(game.user,'OWNER'))throw new Error('Activity Actor ownership is required.');await actor.update(patch);},
      acknowledge
    });
  }
  async _rollTimedShotgun(saved,input,intent=null){
    requireCoordinator();
    const shot=structuredClone(saved);
    if(shot.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
    if(this.timing.batch)throw new Error('The impulse is closed for new attack rolls.');
    if(this.timing.pendingEffect||shot.timing.clockRevision!==this.timing.clockRevision)throw new Error('Finish pending effects in the original impulse before rolling.');
    validateShotInput(shot,input,shot.plan.targetUuid);
    if(shot.status==='rolled'){
      if(JSON.stringify(shot.input)!==JSON.stringify(input))throw new Error('This blast already has frozen inputs and dice. Restore those inputs to resume.');
      if(intent)await this.setFlag('phoenix-command',`intents.${intent.id}`,{...intent,status:'accepted',shotId:shot.id});
      return shot;
    }
    this.assertShotDecisions(shot);boundPlan(this,shot.plan);
    let dice=shot.shotgunDice??null;
    if(!dice){
      const preview=previewShotgun(input);
      const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
      const pattern=await roll('1d100 - 1');
      const occupants=[];
      if(pattern<=preview.threshold){
        const faces=(preview.cover?.rollMax??99)+1;
        const inside=preview.mass?input.people.filter(person=>person.id===input.intendedId)
          :peopleInPattern({intendedId:input.intendedId,patternRadiusHexes:preview.patternRadiusHexes,people:input.people});
        for(const person of inside){
          const chance=preview.mass?{kind:'rounds',rounds:1}:pelletHitCount({band:preview.band,pelletNumber:preview.pelletNumber,applyTargetWidth:input.applyPelletWidth,autoWidth:person.autoWidth??null});
          let pellets=0,pelletRoll=null;
          if(chance.kind==='rounds')pellets=chance.rounds;
          else if(chance.kind==='chance'){pelletRoll=await roll('1d100 - 1');pellets=pelletRoll<=chance.chance?1:0;}
          const locations=[];
          for(let n=0;n<pellets;n++){
            let location;
            if(input.pelletGrouping==='random'&&n>0){
              const window=groupingWindow(locations[0].location,hitLocationSpacing(preview.salm),preview.cover?.rollMax??99);
              location=window.low+await roll(`1d${window.high-window.low+1} - 1`);
            }else location=await roll(`1d${faces} - 1`);
            locations.push({location,armor:await roll('1d10 - 1')});
          }
          occupants.push({pellet:pelletRoll,locations});
        }
      }
      dice={pattern,occupants};
      await this.update({[`flags.phoenix-command.shots.${shot.id}.shotgunDice`]:dice});
    }
    const pending=[];
    dice.occupants.forEach((occupant,index)=>{
      const person=input.people[index];
      const combatant=this.combatants.get(person?.id);
      for(const round of occupant.locations){
        let location=String(round.location);
        try{location=locateHit('firearm',person?.cover!==undefined?{...input,cover:person.cover}:input,{location:round.location}).location;}catch{/* the roll is still shown */}
        pending.push({occupantIndex:index,round,targetName:combatant?.name??person?.id??'target',location,options:armorOptions(combatant.actor),actor:combatant.actor});
      }
    });
    const confirmed=await confirmImpactArmor(pending);
    if(!confirmed)throw new Error('Armour was not confirmed. The dice are saved; rolling again will not reroll them.');
    const occupants=dice.occupants.map(occupant=>({...occupant,locations:[]}));
    pending.forEach((round,index)=>{occupants[round.occupantIndex].locations.push({...round.round,armorPF:confirmed[index]});});
    const rolls={pattern:dice.pattern,occupants};
    try{
      if(intent)validateIntent(this,intent);
      boundPlan(this,shot.plan);
      this.assertShotDecisions(shot);
      if(JSON.stringify(shotHandoffInput(this,shot))!==JSON.stringify(input))throw new Error('Shotgun situation changed while rolling.');
    }catch(error){shot.contextConflict=error.message;}
    const result=shot.contextConflict?null:resolveShotgun(input,rolls);
    shot.rolls=rolls;shot.input=structuredClone(input);shot.eal=result?.eal??null;shot.status='rolled';
    if(result)shot.result=result;
    const update={[`flags.phoenix-command.shots.${shot.id}`]:shot};
    if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:shot.id};
    await this.update(update);
    return shot;
  }
  async _rollTimedExplosive(saved,input,intent=null){
    requireCoordinator();
    const shot=structuredClone(saved);
    if(shot.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
    if(this.timing.batch)throw new Error('The impulse is closed for new attack rolls.');
    if(this.timing.pendingEffect||shot.timing.clockRevision!==this.timing.clockRevision)throw new Error('Finish pending effects in the original impulse before rolling.');
    validateShotInput(shot,input,shot.plan.targetUuid);
    if(shot.status==='rolled'){
      if(JSON.stringify(shot.input)!==JSON.stringify(input))throw new Error('This shot already has frozen inputs and dice. Restore those inputs to resume.');
      if(intent)await this.setFlag('phoenix-command',`intents.${intent.id}`,{...intent,status:'accepted',shotId:shot.id});
      return shot;
    }
    this.assertShotDecisions(shot);boundPlan(this,shot.plan);
    const preview=shot.plan.kind==='launcher'?previewLaunchedGrenade(input):previewThrownGrenade(input);
    const ammo=input.weapon.system.firearmModes[input.modeId].ammunition[input.ammunitionKey];
    const scheduled=shot.plan.kind==='grenade'&&ammo.fusePhases!=null;
    const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
    const path=`flags.phoenix-command.shots.${shot.id}`;
    // Three saved stages, so a cancelled dialog never rerolls: where it lands; then, with the
    // landing hex known, the surroundings of the people it reaches; then their shrapnel.
    let dice=shot.grenadeDice??null;
    if(!dice){
      const hit=await roll('1d100 - 1');
      const gap=scatterGap(preview.eal,hit);
      const direction=!gap.hit&&gap.hexes>1?await roll('1d10 - 1'):null;
      const neighbor=!gap.hit&&gap.hexes===1?await roll('1d6'):null;
      dice={hit,direction,neighbor,occupants:scheduled?[]:null};
      await this.update({[`${path}.grenadeDice`]:dice});
    }
    const gap=scatterGap(preview.eal,dice.hit);
    const detonation=detonationHex({shooter:input.shooterCube,target:input.targetCube,hexes:gap.hexes,direction:dice.direction,neighbor:dice.neighbor});
    // Dice saved by the earlier review-first flow already carry shrapnel; keep that review.
    const legacy=Array.isArray(dice.occupants)&&!scheduled&&!shot.blastSurroundings;
    let blastInput=input;
    if(!scheduled&&!legacy){
      let surroundings=shot.blastSurroundings??null;
      if(!surroundings){
        surroundings=await confirmBlastSurroundings({title:shot.plan.kind==='launcher'?'Launcher round landed':'Grenade landed',
          landing:landingSummary({hit:gap.hit,hexes:gap.hexes,direction:dice.direction}),
          rows:blastSurroundingRows(this,input,detonation),applyTargetSize:input.applyTargetSize});
        if(!surroundings)throw new Error('Surroundings were not confirmed. Where it landed is saved; rolling again will not reroll it.');
        shot.blastSurroundings=surroundings;
        await this.update({[`${path}.blastSurroundings`]:surroundings});
      }
      blastInput=explosiveHandoffInput(this,shot,undefined,surroundings);
      if(!Array.isArray(dice.occupants)){
        dice={...dice,occupants:await this._rollBlastOccupants(blastInput,detonation,ammo,roll)};
        await this.update({[`${path}.grenadeDice`]:dice});
      }
    }
    const rolls={hit:dice.hit,direction:dice.direction,neighbor:dice.neighbor,occupants:[]};
    if(!scheduled){
      rolls.occupants=await this._confirmBlastArmor(blastInput,dice.occupants);
      if(!rolls.occupants)throw new Error('Armour was not confirmed. The dice are saved; rolling again will not reroll them.');
    }
    try{
      if(intent)validateIntent(this,intent);
      boundPlan(this,shot.plan);
      this.assertShotDecisions(shot);
      if(JSON.stringify(explosiveHandoffInput(this,shot))!==JSON.stringify(input))throw new Error('Explosive situation changed while rolling.');
    }catch(error){shot.contextConflict=error.message;}
    const result=shot.contextConflict?null:(shot.plan.kind==='launcher'?resolveLaunchedGrenade(blastInput,rolls):resolveThrownGrenade(blastInput,rolls));
    shot.rolls=rolls;shot.input=structuredClone(blastInput);shot.eal=result?.eal??null;shot.status='rolled';shot.grenadeDice=dice;
    if(result)shot.result=result;
    const update={[path]:shot};
    if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:shot.id};
    await this.update(update);
    return shot;
  }
  // One entry per person the blast reaches: none for solid cover, otherwise the shrapnel
  // roll (when the column prints a percentage) and a location and armour die per piece.
  async _rollBlastOccupants(input,detonation,ammo,roll){
    const occupants=[];
    for(const person of input.people){
      const columnKey=burstColumn(cubeDistance(detonation,person.cube),person.contact===true,ammo);
      if(columnKey==null)continue;
      if((person.blastModifiers??[]).includes('Behind Solid Cover')){occupants.push({id:person.id,shrapnel:null,locations:[]});continue;}
      const chance=shrapnelHitCount({column:burstCell(ammo,columnKey),applyTargetSize:input.applyTargetSize,targetSizeAlm:person.targetSizeAlm??null});
      let pieces=0,shrapnel=null;
      if(chance.kind==='rounds')pieces=chance.rounds;
      else if(chance.kind==='chance'){shrapnel=await roll('1d100 - 1');pieces=shrapnel<=chance.chance?1:0;}
      const locations=[];
      for(let n=0;n<pieces;n++)locations.push({location:await roll('1d100 - 1'),armor:await roll('1d10 - 1')});
      occupants.push({id:person.id,shrapnel,locations});
    }
    return occupants;
  }
  // Asks the protection at each piece's location; null when the GM cancels.
  async _confirmBlastArmor(input,occupants){
    const pending=[];
    occupants.forEach((occupant,occupantIndex)=>{
      const person=input.people.find(candidate=>candidate.id===occupant.id);
      const combatant=this.combatants.get(occupant.id);
      occupant.locations.forEach((round,index)=>{
        let location=String(round.location);
        try{location=shrapnelLocationName(round.location);}catch{/* the roll is still shown */}
        pending.push({occupantIndex,index,round,targetName:combatant?.name??person?.name??occupant.id,location,options:armorOptions(combatant?.actor),actor:combatant?.actor});
      });
    });
    const confirmed=await confirmImpactArmor(pending);
    if(!confirmed)return null;
    const result=occupants.map(occupant=>({...occupant,locations:occupant.locations.map(round=>({...round}))}));
    pending.forEach((round,n)=>{result[round.occupantIndex].locations[round.index].armorPF=confirmed[n];});
    return result;
  }
  // A burst of grenades (grenade-burst.mjs), in the same saved stages as one launcher round:
  // the elevation roll and scatter; the surroundings of everyone any round reaches; then each
  // detonation's shrapnel. Armour for every piece is asked in one dialog.
  async _rollTimedGrenadeBurst(saved,input,intent=null){
    requireCoordinator();
    const shot=structuredClone(saved);
    if(shot.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
    if(this.timing.batch)throw new Error('The impulse is closed for new attack rolls.');
    if(this.timing.pendingEffect||shot.timing.clockRevision!==this.timing.clockRevision)throw new Error('Finish pending effects in the original impulse before rolling.');
    validateShotInput({plan:shot.plan,arc:shot.arc},input,null);
    if(shot.status==='rolled'){
      if(JSON.stringify(shot.input)!==JSON.stringify(input))throw new Error('This burst already has frozen inputs and dice. Restore those inputs to resume.');
      if(intent)await this.setFlag('phoenix-command',`intents.${intent.id}`,{...intent,status:'accepted',shotId:shot.id});
      return shot;
    }
    this.assertShotDecisions(shot);boundPlan(this,shot.plan);
    const preview=previewGrenadeBurst(input);
    const ammo=input.weapon.system.firearmModes[input.modeId].ammunition[input.ammunitionKey];
    const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
    const path=`flags.phoenix-command.shots.${shot.id}`;
    let dice=shot.grenadeDice??null;
    if(!dice){
      const elevation=await roll('1d100 - 1');
      const gap=scatterGap(preview.eal,elevation,'Burst Elevation');
      dice={elevation,direction:!gap.hit&&gap.hexes>1?await roll('1d10 - 1'):null,neighbor:!gap.hit&&gap.hexes===1?await roll('1d6'):null,detonations:null};
      await this.update({[`${path}.grenadeDice`]:dice});
    }
    const {gap,landings}=grenadeBurstPlacement(input,preview,dice);
    let surroundings=shot.blastSurroundings??null;
    if(!surroundings){
      surroundings=await confirmBlastSurroundings({title:'Grenade burst landed',
        landing:gap.hit?`On the arc: ${landings.length} round${landings.length===1?'':'s'} spread across the swept hexes.`
          :`Off the arc by ${gap.hexes} hex${gap.hexes===1?'':'es'}: every round landed ${gap.hexes===1?'one hex aside':dice.direction<=4?'short':'long'}.`,
        rows:burstSurroundingRows(this,input,landings),applyTargetSize:input.applyTargetSize});
      if(!surroundings)throw new Error('Surroundings were not confirmed. Where it landed is saved; rolling again will not reroll it.');
      shot.blastSurroundings=surroundings;
      await this.update({[`${path}.blastSurroundings`]:surroundings});
    }
    const blastInput=grenadeBurstHandoffInput(this,shot,undefined,surroundings);
    if(!Array.isArray(dice.detonations)){
      const detonations=[];
      for(const landing of landings)detonations.push({occupants:await this._rollBlastOccupants(blastInput,landing,ammo,roll)});
      dice={...dice,detonations};
      await this.update({[`${path}.grenadeDice`]:dice});
    }
    const flat=dice.detonations.flatMap(d=>d.occupants);
    const confirmed=await this._confirmBlastArmor(blastInput,flat);
    if(!confirmed)throw new Error('Armour was not confirmed. The dice are saved; rolling again will not reroll them.');
    let n=0;
    const rolls={elevation:dice.elevation,direction:dice.direction,neighbor:dice.neighbor,
      detonations:dice.detonations.map(d=>({occupants:d.occupants.map(()=>confirmed[n++])}))};
    try{
      if(intent)validateIntent(this,intent);
      boundPlan(this,shot.plan);
      this.assertShotDecisions(shot);
      if(JSON.stringify(grenadeBurstHandoffInput(this,shot))!==JSON.stringify(input))throw new Error('Burst situation changed while rolling.');
    }catch(error){shot.contextConflict=error.message;}
    const result=shot.contextConflict?null:resolveGrenadeBurst(blastInput,rolls);
    shot.rolls=rolls;shot.input=structuredClone(blastInput);shot.eal=result?.eal??null;shot.status='rolled';shot.grenadeDice=dice;
    if(result)shot.result=result;
    const update={[path]:shot};
    if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:shot.id};
    await this.update(update);
    return shot;
  }
  // A timed fuse expiring (D45). Resolved on the coordinator inside the timing queue. The
  // expiry situation and every die are saved on the pending record before armour is asked
  // for, so a cancelled dialog or failed write resumes with the same dice, never a reroll.
  // A record is due from its phase onward until it is applied, so a failure is retried on
  // the next advance before the clock moves rather than being skipped.
  async _resolveDueDetonations(phase){
    requireCoordinator();
    const pending=this.getFlag('phoenix-command','pendingDetonations')??{};
    const due=Object.entries(pending).filter(([,record])=>record.duePhase<=phase).sort(([a],[b])=>a.localeCompare(b));
    if(!due.length)return;
    const {_applyResult}=await import('../application/foundry.mjs');
    const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
    for(const [key,saved]of due){
      const path=`flags.phoenix-command.pendingDetonations.${key}`;
      const record=structuredClone(saved);
      try{
        // Stage 1: who is where when it goes off, and their surroundings from that hex.
        if(!record.resolution){
          const base=rebuildDetonationInput(this,record);
          const surroundings=await confirmBlastSurroundings({title:'Grenade fuse expired',
            landing:`${base.weapon?.name??'The grenade'} goes off where it landed.`,
            rows:blastSurroundingRows(this,base,record.detonation),applyTargetSize:base.applyTargetSize});
          if(!surroundings)throw new Error('Surroundings were not confirmed.');
          const state=this.timing;
          record.resolution={surroundings,occupants:null,armorConfirmed:false,
            timing:{combatUuid:this.uuid,phase:state.phase,impulse:state.impulse,clockRevision:state.clockRevision}};
          await this.update({[`${path}.resolution`]:record.resolution});
        }
        const frozen=record.resolution;
        // Stage 2: the situation read with those surroundings, and every shrapnel die.
        if(!frozen.input){
          frozen.input=rebuildDetonationInput(this,record,frozen.surroundings);
          const ammo=frozen.input.weapon.system.firearmModes[frozen.input.modeId].ammunition[frozen.input.ammunitionKey];
          frozen.occupants=await this._rollBlastOccupants(frozen.input,record.detonation,ammo,roll);
          await this.update({[`${path}.resolution`]:frozen});
        }
        // Stage 3: protection at each piece's location.
        if(!frozen.armorConfirmed){
          const confirmed=await this._confirmBlastArmor(frozen.input,frozen.occupants);
          if(!confirmed)throw new Error('Armour was not confirmed.');
          frozen.occupants=confirmed;frozen.armorConfirmed=true;
          await this.update({[`${path}.resolution`]:frozen});
        }
        const rolls={hit:record.rolls.hit,direction:record.rolls.direction,neighbor:record.rolls.neighbor,occupants:frozen.occupants};
        const result=resolveDueDetonation(frozen.input,record.detonation,rolls);
        // An application the GM has since undone stays undone; it is not re-applied.
        await _applyResult(result,detonationApplyContext(this,record,result));
        await this.update({[`flags.phoenix-command.pendingDetonations.-=${key}`]:null});
      }catch(error){
        throw new Error(`A grenade fuse expired but its detonation could not be applied: ${error.message} Its dice are saved; advance again to retry.`);
      }
    }
  }
  async _rollTimedAutomaticShotgun(shot,input,intent){
    let dice=shot.shotgunDice??null;
    if(!dice){
      const preview=previewAutomaticShotgun(input);
      const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
      const elevation=await roll('1d100 - 1');
      const targets=[];
      const patterns=[];
      if(elevation<=preview.elevationThreshold){
        // §5.10 cover fire: each man's own cover sets his location die.
        const facesFor=target=>((target.cover!==undefined?coverSituation({penetration:preview.band.penetration,cover:target.cover}):preview.cover)?.rollMax??99)+1;
        for(const target of input.targets){
          const faces=facesFor(target);
          const chance=burstHitChance({arcHexes:preview.arcHexes,burstRounds:preview.burstRounds,autoWidth:target.autoWidth});
          let count=0;
          if(chance.kind==='chance'){
            const value=await roll('1d100 - 1');
            targets.push(value);
            if(value<=chance.chance)count=1;
          }else{targets.push(0);count=chance.kind==='rounds'?chance.rounds:0;}
          const groups=[];
          for(let n=0;n<count;n++){
            const pellets=pelletHitCount({band:preview.band,pelletNumber:preview.pelletNumber,applyTargetWidth:input.applyPelletWidth,autoWidth:target.autoWidth??null});
            let hitPellets=0,pelletRoll=null;
            if(pellets.kind==='rounds')hitPellets=pellets.rounds;
            else if(pellets.kind==='chance'){pelletRoll=await roll('1d100 - 1');hitPellets=pelletRoll<=pellets.chance?1:0;}
            const locations=[];
            for(let p=0;p<hitPellets;p++){
              let location;
              if(input.pelletGrouping==='random'&&p>0){
                const window=groupingWindow(locations[0].location,hitLocationSpacing(preview.salm),preview.cover?.rollMax??99);
                location=window.low+await roll(`1d${window.high-window.low+1} - 1`);
              }else location=await roll(`1d${faces} - 1`);
              locations.push({location,armor:await roll('1d10 - 1')});
            }
            groups.push({pellet:pelletRoll,locations});
          }
          patterns.push(groups);
        }
      }
      dice={elevation,targets,patterns};
      await this.update({[`flags.phoenix-command.shots.${shot.id}.shotgunDice`]:dice});
    }
    const pending=[];
    (dice.patterns??[]).forEach((groups,targetIndex)=>{
      const target=input.targets[targetIndex];
      const combatant=this.combatants.get(target.id);
      groups.forEach((group,groupIndex)=>{
        for(const round of group.locations){
          let location=String(round.location);
          try{location=locateHit('firearm',input,{location:round.location}).location;}catch{/* shown as the roll */}
          pending.push({targetIndex,groupIndex,round,targetName:combatant?.name??target.id,location,options:armorOptions(combatant.actor),actor:combatant.actor});
        }
      });
    });
    const confirmed=await confirmImpactArmor(pending);
    if(!confirmed)throw new Error('Armour was not confirmed. The dice are saved; rolling again will not reroll them.');
    const patterns=(dice.patterns??[]).map(groups=>groups.map(group=>({...group,locations:[]})));
    pending.forEach((round,index)=>{patterns[round.targetIndex][round.groupIndex].locations.push({...round.round,armorPF:confirmed[index]});});
    const rolls={elevation:dice.elevation,targets:dice.targets,patterns};
    try{
      if(intent)validateIntent(this,intent);
      boundPlan(this,shot.plan);
      this.assertShotDecisions(shot);
      if(JSON.stringify(burstHandoffInput(this,shot).input)!==JSON.stringify(input))throw new Error('Burst situation changed while rolling.');
    }catch(error){shot.contextConflict=error.message;}
    const result=shot.contextConflict?null:resolveAutomaticShotgun(input,rolls);
    shot.rolls=rolls;shot.input=structuredClone(input);shot.eal=result?.eal??null;shot.status='rolled';
    if(result)shot.result=result;
    const update={[`flags.phoenix-command.shots.${shot.id}`]:shot};
    if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:shot.id};
    await this.update(update);
    return shot;
  }
  async _rollTimedBurst(saved,input,intent=null){
    requireCoordinator();
    const shot=structuredClone(saved);
    if(shot.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
    if(this.timing.batch)throw new Error('The impulse is closed for new attack rolls.');
    if(this.timing.pendingEffect||shot.timing.clockRevision!==this.timing.clockRevision)throw new Error('Finish pending effects in the original impulse before rolling.');
    validateShotInput({plan:shot.plan,arc:shot.arc},input,null);
    if(shot.status==='rolled'){
      if(JSON.stringify(shot.input)!==JSON.stringify(input))throw new Error('This burst already has frozen inputs and dice. Restore those inputs to resume.');
      if(intent)await this.setFlag('phoenix-command',`intents.${intent.id}`,{...intent,status:'accepted',shotId:shot.id});
      return shot;
    }
    this.assertShotDecisions(shot);boundPlan(this,shot.plan);
    const buckshot=firearmBand(input,'automatic');
    if(buckshot.salm!=null)return this._rollTimedAutomaticShotgun(shot,input,intent);
    let dice=shot.burstDice??null;
    if(!dice){
      const preview=previewBurst(input);
      const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
      const elevation=await roll('1d100 - 1');
      const targets=[];
      const impacts=[];
      if(elevation<=preview.elevationThreshold){
        // §5.10 cover fire: each man's own cover sets his location die.
        const facesFor=target=>((target.cover!==undefined?coverSituation({penetration:preview.band.penetration,cover:target.cover}):preview.cover)?.rollMax??99)+1;
        for(const target of input.targets){
          const faces=facesFor(target);
          const chance=burstHitChance({arcHexes:preview.arcHexes,burstRounds:preview.burstRounds,autoWidth:target.autoWidth});
          let rounds=0;
          if(chance.kind==='chance'){
            const value=await roll('1d100 - 1');
            targets.push(value);
            if(value<=chance.chance)rounds=1;
          }else{
            // A printed round count or a blank is not a 00–99 roll. Zero keeps the
            // per-target list aligned without being read as a hit roll.
            targets.push(0);
            rounds=chance.kind==='rounds'?chance.rounds:0;
          }
          const roundRolls=[];
          for(let n=0;n<rounds;n++)roundRolls.push({location:await roll(`1d${faces} - 1`),armor:await roll('1d10 - 1')});
          impacts.push(roundRolls);
        }
      }
      dice={elevation,targets,impacts};
      // Saved before anyone is asked about armour, so closing that dialog cannot buy a reroll.
      await this.update({[`flags.phoenix-command.shots.${shot.id}.burstDice`]:dice});
    }
    const pending=[];
    input.targets.forEach((target,index)=>{
      const combatant=this.combatants.get(target.id);
      for(const round of dice.impacts[index]??[]){
        let location=String(round.location);
        try{location=locateHit('firearm',target.cover!==undefined?{...input,cover:target.cover}:input,{location:round.location}).location;}catch{/* the roll is still shown */}
        pending.push({targetIndex:index,round,targetName:combatant?.name??target.id,location,options:armorOptions(combatant.actor),actor:combatant.actor});
      }
    });
    const confirmed=await confirmImpactArmor(pending);
    if(!confirmed)throw new Error('Armour was not confirmed. The dice are saved; rolling again will not reroll them.');
    const impacts=input.targets.map(()=>[]);
    pending.forEach((round,index)=>{impacts[round.targetIndex].push({...round.round,armorPF:confirmed[index]});});
    const rolls={elevation:dice.elevation,targets:dice.targets,impacts};
    try{
      if(intent)validateIntent(this,intent);
      boundPlan(this,shot.plan);
      this.assertShotDecisions(shot);
      if(JSON.stringify(burstHandoffInput(this,shot).input)!==JSON.stringify(input))throw new Error('Burst situation changed while rolling.');
    }catch(error){shot.contextConflict=error.message;}
    const result=shot.contextConflict?null:resolveBurst(input,rolls);
    shot.rolls=rolls;shot.input=structuredClone(input);shot.eal=result?.eal??null;shot.status='rolled';
    if(result)shot.result=result;
    const update={[`flags.phoenix-command.shots.${shot.id}`]:shot};
    if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:shot.id};
    await this.update(update);
    return shot;
  }
  async _rollTimedStrike(saved,input,intent=null){
    requireCoordinator();
    const shot=structuredClone(saved);
    if(shot.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
    if(this.timing.batch)throw new Error('The impulse is closed for new attack rolls.');
    if(this.timing.pendingEffect||shot.timing.clockRevision!==this.timing.clockRevision)throw new Error('Finish pending effects in the original impulse before rolling.');
    validateShotInput(shot,input,shot.plan.targetUuid);
    if(shot.status==='rolled'){
      if(JSON.stringify(shot.input)!==JSON.stringify(input))throw new Error('This strike already has frozen inputs and dice. Restore those inputs to resume.');
      if(intent)await this.setFlag('phoenix-command',`intents.${intent.id}`,{...intent,status:'accepted',shotId:shot.id});
      return shot;
    }
    this.assertShotDecisions(shot);boundPlan(this,shot.plan);
    let dice=shot.strikeDice??null;
    if(!dice){
      const preview=previewMelee(input);
      const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
      const hit=await roll('1d100 - 1');
      dice={hit,impact:null,location:null};
      if(preview.threshold==='hit'||hit<=preview.threshold){
        dice.impact=await roll(`1d${preview.dieSides}`);
        dice.location=await roll('1d100 - 1');
      }
      await this.update({[`flags.phoenix-command.shots.${shot.id}.strikeDice`]:dice});
    }
    const struck=dice.location!==null;
    const located=struck?locateHit('melee',input,{hit:dice.hit,location:dice.location,impact:dice.impact}):null;
    // Recorded coverage answers for itself; the GM is asked only when it cannot.
    const attack=input.weapon?.system?.meleeModes?.[input.modeId]?.attacks?.[input.attackId];
    const known=struck?automaticMeleeProtection(Array.from(this.targetFor(shot.plan)?.actor?.items??[]),located,attack):null;
    const armor=struck?(known.resolved?known.protection:await confirmMeleeArmor(located.location,located.family,known.reason)):null;
    if(struck&&!armor)throw new Error('Armor was not confirmed. The dice are saved; rolling again will not reroll them.');
    const rolls={hit:dice.hit,...(struck?{impact:dice.impact,location:dice.location}:{})};
    const resolvedInput=struck?{...input,...armor}:input;
    try{
      if(intent)validateIntent(this,intent);
      boundPlan(this,shot.plan);
      this.assertShotDecisions(shot);
      if(JSON.stringify(strikeHandoffInput(this,shot))!==JSON.stringify(input))throw new Error('Strike situation changed while rolling.');
    }catch(error){shot.contextConflict=error.message;}
    const result=shot.contextConflict?null:resolveMelee(resolvedInput,rolls);
    shot.rolls=rolls;shot.input=structuredClone(resolvedInput);shot.eal=result?.attackLevel??null;shot.status='rolled';
    if(result)shot.result=result;
    const update={[`flags.phoenix-command.shots.${shot.id}`]:shot};
    if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:shot.id};
    await this.update(update);
    return shot;
  }
  rollTimedShot(id,input,targetUuid){
    return serialized(()=>this._rollTimedShot(id,input,targetUuid));
  }
  async _rollTimedShot(id,input,targetUuid,intent=null){
      requireCoordinator();
      const shot=structuredClone(this.getFlag('phoenix-command',`shots.${id}`));
      if(!shot||!['ready','rolled'].includes(shot.status))throw new Error('No unused completed shot activity.');
      if(shot.contextConflict)throw new Error(`Saved shot requires GM reconciliation: ${shot.contextConflict}`);
      if(this.timing.batch)throw new Error('The impulse is closed for new attack rolls.');
      if(this.timing.pendingEffect||shot.timing.clockRevision!==this.timing.clockRevision)throw new Error('Finish pending effects in the original impulse before rolling.');
      validateShotInput(shot,input,targetUuid);
      if(shot.status==='ready'){
        this.assertShotDecisions(shot);boundPlan(this,shot.plan);
        const shooter=this.combatants.get(shot.combatantId).token,target=this.targetFor(shot.plan).token;
        if(shooter.elevation!==target.elevation)throw new Error('Timed shots require equal elevation.');
        const measured=hexRange(this.scene,[shooter.getCenterPoint(),target.getCenterPoint()],points=>this.scene.grid.measurePath(points));
        if(Math.abs(distanceInFeet(input.distance)-distanceInFeet({value:measured.range,unit:measured.unit}))>1e-6)throw new Error('Shot range must match the current counted hex distance.');
        if(JSON.stringify(input.reactions??null)!==JSON.stringify(this.reactionInputForShot(shot)))throw new Error('Use the committed ducking modifiers; refresh this shot’s inputs.');
        // Speed is the ledger's, never the reviewed input's: a shot reviewed before its
        // target moved must be reviewed again rather than scored at a stale Table 4D row.
        if(input.shooterSpeed!==hexesInPhase(this.timing,shot.combatantId)||input.targetSpeed!==hexesInPhase(this.timing,this.targetFor(shot.plan)?.id))
          throw new Error('Movement changed since this shot was reviewed. Ask the GM to review it again.');
      }

      if(shot.status==='rolled'){
        if(JSON.stringify(shot.input)!==JSON.stringify(input))throw new Error('This shot already has frozen inputs and dice. Restore those inputs to resume.');
        if(intent)await this.setFlag('phoenix-command',`intents.${intent.id}`,{...intent,status:'accepted',shotId:id});
        return shot;
      }
      validateWeaponActivity(shot.plan,weaponActorSnapshot(this.combatants.get(shot.combatantId)?.actor),{woundThisImpulse:injury=>woundInImpulse(injury,this.timing,this.uuid)});
      shot.decisions={reactions:structuredClone(this.timing.reactions),sightline:structuredClone(sightline(this.timing,shot.combatantId,this.targetFor(shot.plan)?.id))};
      const decisionStamp=JSON.stringify({reactions:this.timing.reactions,sightlines:this.timing.sightlines,clock:this.timing.clockRevision});
      const beforeRoll=JSON.stringify(weaponActorSnapshot(this.combatants.get(shot.combatantId).actor));
      const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
      // Key 6B, PDF 65: a target only LOOKING over blocking cover is read on Table 6A's Fire
      // column with a 00-22 roll, not a 00-99 one - the shortened die is how the book says
      // that only his head is showing. The cover situation carries the range, so the die
      // that is thrown is the die the rules ask for rather than a 00-99 one that is then
      // refused a quarter of the time.
      const locationFormula=locationRollFormula(previewFirearm(input).cover);
      // LEG10203 §6.3: one hit roll for a three-round burst, and dice for each round it may place.
      shot.rolls=shot.plan.threeRoundBurst
        ?{hit:await roll('1d100 - 1'),rounds:[await roll(locationFormula),await roll(locationFormula),await roll(locationFormula)].map(location=>({location}))}
        :{hit:await roll('1d100 - 1'),location:await roll(locationFormula),armor:await roll('1d10 - 1')};
      if(shot.plan.threeRoundBurst)for(const round of shot.rolls.rounds)round.armor=await roll('1d10 - 1');
      shot.input=structuredClone(input);shot.status='rolled';
      try{
        if(intent)validateIntent(this,intent);
        boundPlan(this,shot.plan);
        if(decisionStamp!==JSON.stringify({reactions:this.timing.reactions,sightlines:this.timing.sightlines,clock:this.timing.clockRevision}))throw new Error('Impulse decisions changed while rolling.');
        if(beforeRoll!==JSON.stringify(weaponActorSnapshot(this.combatants.get(shot.combatantId).actor)))throw new Error('Actor changed while rolling.');
        if(intent&&JSON.stringify(shotHandoffInput(this,shot))!==JSON.stringify(input))throw new Error('Shot situation changed while rolling.');
      }catch(error){shot.contextConflict=error.message;}
      // Persist dice before reporting a changed context: retries must never buy a reroll.
      const update={[`flags.phoenix-command.shots.${id}`]:shot};
      if(intent)update[`flags.phoenix-command.intents.${intent.id}`]={...intent,status:'accepted',shotId:id,...(shot.contextConflict?{reason:`Dice saved; GM reconciliation required: ${shot.contextConflict}`}:{})};
      await this.update(update);
      if(shot.contextConflict)throw new Error(`Saved dice retained; GM reconciliation required: ${shot.contextConflict}`);
      return shot;
  }
  impulseInputs(){
    return impulseInputs(this.combatants.filter(c=>c.actor).map(c=>({id:c.id,uuid:c.actor.uuid,system:c.actor.system.toObject(),
      knockDowns:c.actor.getFlag('phoenix-command','knockDowns')??{}})),this.timing,this.uuid);
  }
  resolveImpulseFire(){
    return serialized(async()=>{
      requireCoordinator();
      const state=this.timing;
      if(!state.phase)throw new Error('Start the encounter first.');
      if(state.pendingEffect)throw new Error('Resume the pending activity effect before totalling this impulse.');
      if(state.reactions?.stage==='open')throw new Error('Finish the open reaction window before totalling.');
      this.assertDeparturesResolved();
      if(game.messages.some(m=>['applying','undoing'].includes(m.getFlag('phoenix-command','application')?.status)&&m.getFlag('phoenix-command','resolution')?.context?.timing?.combatUuid===this.uuid))throw new Error('Recover the unfinished attack application before totalling.');
      const due=dueThisImpulse(this.getFlag('phoenix-command','shots'),state,this.uuid);
      if(due.some(s=>['ready','rolled'].includes(s.status)))throw new Error('Resolve and apply every shot due this impulse before totalling it.');
      const batch=await finishImpulseBatch(state.batch,this.impulseInputs(),{
        id:foundry.utils.randomID(),
        roll:async()=>(await new foundry.dice.Roll('1d100 - 1').evaluate()).total,
        save:async batch=>{
          const current=this.timing;
          const after=changeTiming(current,{kind:'batch',expectedRevision:current.revision,batch});
          const update={'flags.phoenix-command.timing':timingRecord(after)};
          if(batch.complete)update[`flags.phoenix-command.impulseBatches.${state.phase}-${state.impulse}`]=after.batch;
          await this.update(update,{phoenixTiming:true});
        },
        // §5.13 (optional) splits a failed check: knocked out and stunned are out of it;
        // dazed drops to the ground conscious; disoriented stays on his feet. Without the
        // rule every failure is the basic game's incapacitation.
        incapacitationEffects:smallArmsOptionalRules().incapacitationEffects,
        roll10:async()=>(await new foundry.dice.Roll('1d10 - 1').evaluate()).total,
        applyCondition:async(id,targetId,before,effect='knockedOut')=>{
          const actor=this.combatants.get(targetId)?.actor;
          if(actor?.uuid!==before.uuid)throw new Error('The knockout Actor changed.');
          const path=`impulseReceipts.${id}`;
          if(actor.getFlag('phoenix-command',path))return;
          if(actor.system.condition.consciousness!==before.condition)throw new Error('Character condition changed during knockout resolution; reconcile it before resuming.');
          const change=effectRules[effect]?.conscious?(effect==='dazed'?{'system.condition.posture':'prone','system.condition.firingStance':false,'system.condition.braced':false,'system.condition.looking':false}:{})
            :{'system.condition.consciousness':'incapacitated'};
          await actor.update({...change,[`flags.phoenix-command.${path}`]:true});
        },
        // §5.12: knocked down, he is on the ground. Same receipt pattern as the knockout.
        applyKnockDown:async(id,targetId,before)=>{
          const actor=this.combatants.get(targetId)?.actor;
          if(actor?.uuid!==before.uuid)throw new Error('The knocked-down Actor changed.');
          const path=`knockDownReceipts.${id}`;
          if(actor.getFlag('phoenix-command',path))return;
          await actor.update({'system.condition.posture':'prone','system.condition.firingStance':false,'system.condition.braced':false,'system.condition.looking':false,[`flags.phoenix-command.${path}`]:true});
        }
      });
      Hooks.callAll('phoenixCommandImpulseBatch',this,batch);
      return this.timing.batch;
    });
  }
  async _preUpdate(data,options,user){
    if(data.turn!==undefined&&data.turn!==null)throw new Error('Phoenix Command has no individual initiative turn.');
    if(data.round!==undefined&&data.round!==this.round&&!options.phoenixTiming)throw new Error('Advance the Phoenix Command clock using Next impulse.');
    return super._preUpdate(data,options,user);
  }
  startCombat(){return this.timingCommand({kind:'start',expectedRevision:this.timing.revision});}
  nextTurn(){return this.timingCommand({kind:'advance',expectedRevision:this.timing.revision});}
  nextRound(){return this.nextTurn();}
  previousTurn(){throw new Error('Clock rewind is not enabled. Undo a current action or application separately.');}
  previousRound(){return this.previousTurn();}
  rollInitiative(){throw new Error('Phoenix Command impulses are simultaneous; initiative rolls are not used.');}
  _sortCombatants(a,b){return String(a.name??'').localeCompare(String(b.name??''))||a.id.localeCompare(b.id);}
}
export function encounterStamp(attackerToken,targetToken){
  const combat=game.combat;
  if(!combat?.started||combat.scene?.id!==canvas.scene?.id)return null;
  const has=t=>combat.combatants.some(c=>c.tokenId===t?.id);
  if(!has(attackerToken)&&!has(targetToken))return null;
  if(!has(attackerToken)||!has(targetToken))throw new Error('Add both attack tokens to the active encounter before resolving a timed attack.');
  const state=combat.timing;
  return {combatUuid:combat.uuid,phase:state.phase,impulse:state.impulse,clockRevision:state.clockRevision};
}
