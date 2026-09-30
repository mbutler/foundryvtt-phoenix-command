import {deriveShotSituation,playerRollable,preparationDefaults} from '../rules/shot-situation.mjs';
import {previewFirearm,firearmBand} from '../rules/attacks.mjs';
import {previewShotgun} from '../rules/shotgun.mjs';
import {blastPeople} from './shotgun-scene.mjs';
import {plannedAim} from '../rules/weapon-timing.mjs';
import {reviewMovingShot} from '../rules/movement.mjs';
import {hexesInPhase,movedThisPhase} from '../rules/timing.mjs';
import {snapshotActor,selectedAttackContext} from './context.mjs';
import {convertDistance} from '../rules/units.mjs';
import {exposureInterval} from '../rules/impulse-decisions.mjs';
import {sceneCover} from './cover-scene.mjs';
import {savedCoverStance} from '../rules/cover.mjs';
import {secondShotBonus} from '../rules/second-shot.mjs';
import {smallArmsOptionalRules} from './optional-rules.mjs';

function fireRecord(combat,shot,attacker,firingStance){
  const grid=combat.scene?.grid??globalThis.canvas?.grid;
  const hex=token=>{
    if(!grid?.getOffset||!token?.getCenterPoint)return null;
    const {i,j}=grid.getOffset(token.getCenterPoint({x:token.x,y:token.y}));return {i,j};
  };
  const shooter=combat.combatants.get(shot.combatantId)?.token,target=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid)?.token;
  return {shooterHex:hex(shooter),targetHex:hex(target),posture:attacker.system.condition.posture,firingStance:Boolean(firingStance),
    phase:combat.timing?.phase??null,impulse:combat.timing?.impulse??null};
}
// §5.9 (optional): a shot at someone in the hex he has pinned, from where he pinned it and
// still in the firing stance he pinned it from, "adds 1AC to the aim time".
function pinnedFor(combat,shot,current){
  if(!smallArmsOptionalRules().pinningFire)return {bonus:0,reason:'Optional rule off.'};
  const pin=combat.timing?.entries?.[shot.combatantId]?.pin;
  const same=(a,b)=>a&&b&&a.i===b.i&&a.j===b.j;
  if(!pin)return {bonus:0,reason:'No hex pinned.'};
  if(!same(pin.hex,current.targetHex))return {bonus:0,reason:'The target is not in the pinned hex.'};
  if(!same(pin.shooterHex,current.shooterHex)||!current.firingStance||current.posture!==pin.posture)return {bonus:0,reason:'The shooter has moved or left the firing stance he pinned from.'};
  return {bonus:1,reason:'Target in the pinned hex: +1 AC of aim (§5.9).'};
}
// §5.8 (optional): the shooter's previous single shot or blast this encounter, and whether
// this one is a second shot into the same hex.
function secondShotFor(combat,shot,current){
  if(!smallArmsOptionalRules().secondShot)return {bonus:0,reason:'Optional rule off.'};
  const at=f=>(f.phase-1)*4+f.impulse;
  const previous=Object.values(combat.getFlag('phoenix-command','shots')??{})
    .filter(s=>s.id!==shot.id&&s.combatantId===shot.combatantId&&['rolled','applied'].includes(s.status)&&s.input?.situationSource?.fire)
    .map(s=>s.input.situationSource.fire).sort((a,b)=>at(a)-at(b)).at(-1);
  const movedSince=!!previous&&(combat.timing?.entries?.[shot.combatantId]?.history??[])
    .some(h=>h.kind==='move'&&h.status==='entered'&&at(h)>at(previous));
  return secondShotBonus({previous,current,movedSince});
}

// The coordinator rebuilds inputs from the paid plan, never from a player's payload.
export function shotHandoffInput(combat,shot,choices=shot.adjudication?.choices){
  if(!choices)throw new Error('The GM must review this shot’s cover, visibility and SAB before an owner can roll.');
  if(!canvas.ready||canvas.scene.id!==combat.scene?.id)throw new Error('The coordinator must view the encounter scene.');
  const shooter=combat.combatants.get(shot.combatantId)?.token?.object;
  const target=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid)?.token?.object;
  if(!shooter||!target)throw new Error('The shot tokens are no longer available.');
  const range=selectedAttackContext({controlled:[shooter],targets:[target],scene:canvas.scene,user:game.user,measurePath:p=>canvas.grid.measurePath(p)});
  const attacker=snapshotActor(shooter.actor,{token:shooter}),defender=snapshotActor(target.actor,{token:target});
  const {visibility}=choices;
  // Table 4D is entered with hexes per phase, which the ledger has recorded as each hex was
  // paid for. A shot part-way through a phase counts the hexes entered so far in it; the
  // rest of the phase has not happened. Nothing here is re-entered by hand.
  const targetCombatant=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid);
  const shooterHexes=hexesInPhase(combat.timing,shot.combatantId),
    targetHexes=hexesInPhase(combat.timing,targetCombatant?.id),
    // A combatant part-way into an expensive hex is moving with a speed of zero, so
    // whether he moved and how fast he is going are asked separately.
    shooterMoving=movedThisPhase(combat.timing,shot.combatantId);
  const preparation=preparationDefaults(attacker.system.condition,shooterMoving);
  const firingStance=choices.firingStance??preparation.firingStance;
  const braced=choices.braced??preparation.braced;
  // §3.8 decides the target size from the round's PEN against the cover's PF, so the band
  // is read before the situation rather than after it.
  const weapon=attacker.items.find(i=>i.id===shot.plan.weaponId);
  const band=firearmBand({weapon,modeId:shot.plan.modeId,ammunitionKey:shot.plan.ammunitionKey,
    distance:{value:range.range,unit:range.unit}});
  // Cover is read from the map where the map has been marked up, and stated where it has
  // not. A scene reading that is unambiguous is DERIVED - nobody decided it for this shot -
  // and a GM who disagrees overrides it deliberately, which is recorded as an override
  // rather than replacing the reading silently.
  // Document centres, matching the range measurement in `_rollTimedShot`: a line of fire
  // read from a lagging sprite could cross a different wall from the one the shot does.
  const shooterDoc=combat.combatants.get(shot.combatantId).token;
  const targetDoc=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid).token;
  const reading=sceneCover(canvas.scene,
    shooterDoc.getCenterPoint({x:shooterDoc.x,y:shooterDoc.y}),
    targetDoc.getCenterPoint({x:targetDoc.x,y:targetDoc.y}));
  const targetId=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid)?.id;
  const stance=choices.coverStance??choices.cover?.stance??savedCoverStance(defender.system.condition,{moving:movedThisPhase(combat.timing,targetId)});
  const read=reading.cover?{...reading.cover,stance}:reading.mapped&&!reading.ambiguous?null:undefined;
  const override=choices.coverOverride===true;
  const cover=override||read===undefined?choices.cover:read;
  if(override&&choices.cover===undefined)throw new Error('An override has to say what the cover is instead.');
  const situation=deriveShotSituation({shooterPosture:attacker.system.condition.posture,targetPosture:defender.system.condition.posture,
    cover,penetration:band.penetration,firingStance,braced,visibility,shooterMoving});
  if(shot.plan.kind==='shot'&&choices.calledShot){
    if(!['Head','Body','Legs'].includes(choices.calledShot))throw new Error('Choose Head, Body or Legs for a called shot.');
    situation.derived.targetSize=choices.calledShot;
  }
  const allowed=playerRollable(situation);if(!allowed.allowed)throw new Error(allowed.reason);
  // Movement restricts aim time as well as accuracy, and a paid plan that the restriction
  // forbids is refused here rather than silently reduced at the dice.
  // Table 4D's columns are 2-yard hexes, which a melee-scale scene's counted hexes are not.
  // The measured range is converted, exactly as the firearm preview converts it.
  const movement=reviewMovingShot({aimActions:plannedAim(shot.plan),allowance:combat.timing?.entries?.[shot.combatantId]?.allowance,
    impulse:combat.timing?.impulse??1,shooterHexes,targetHexes,shooterMoving,
    rangeHexes:convertDistance({value:range.range,unit:range.unit},'pccsHex')});
  if(!movement.allowed)throw new Error(movement.reasons.join(' '));
  const input={weapon,modeId:shot.plan.modeId,skill:attacker.system.skills.gun,
    distance:{value:range.range,unit:range.unit},ammunitionKey:shot.plan.ammunitionKey,aimActions:plannedAim(shot.plan),
    ...(combat.reactionInputForShot?.(shot)?{reactions:combat.reactionInputForShot(shot)}:{}),
    ...situation.derived,shooterSpeed:shooterHexes,targetSpeed:targetHexes,
    situationSource:{...situation,movement,
      // How long the target has been in the open is a rule fact (§2.4), so the shot records
      // it rather than leaving it to be reconstructed from the impulse it was fired in.
      exposure:exposureInterval(combat.timing,shot.combatantId,targetCombatant?.id),
      // What the map said, alongside what was used, so a shot records whether its cover was
      // read or stated - and, if they differ, that somebody chose to differ.
      sceneCover:{mapped:reading.mapped,ambiguous:reading.ambiguous,detail:reading.detail,
        read:reading.cover??null,overridden:override,
        basis:override?'gm-override':read===undefined?'stated':'read-from-scene'},
      adjudications:structuredClone(choices),
      // Where the shot was fired from and at, and the stance: what §5.8 compares a later shot with.
      fire:fireRecord(combat,shot,attacker,firingStance)}};
  const second=secondShotFor(combat,shot,input.situationSource.fire);
  if(second.bonus)input.secondShotAim=second.bonus;
  input.situationSource.secondShot=second;
  const pinned=pinnedFor(combat,shot,input.situationSource.fire);
  if(pinned.bonus)input.pinnedAim=pinned.bonus;
  input.situationSource.pinned=pinned;
  if(shot.plan.kind==='shotgun'){
    if(typeof choices.applyPelletWidth!=='boolean')throw new Error('Say whether §3.7 adjusts the pellet hit chance. It is optional, and leaving it unstated is not a choice.');
    if(choices.pelletGrouping!==false&&choices.pelletGrouping!=='random')throw new Error('Say whether later pellets are grouped. Leave it off, or choose random rolls inside the spacing.');
    const intended=combat.targetFor(shot.plan);
    const aimed={...input,applyPelletWidth:choices.applyPelletWidth,pelletGrouping:choices.pelletGrouping,intendedId:intended.id,
      autoWidth:choices.applyPelletWidth?situation.derived.targetSize:null,
      people:[{id:intended.id,name:intended.name,distanceHexes:0,elevation:intended.token.elevation}]};
    const preview=previewShotgun(aimed);
    const people=blastPeople(combat,shot,preview.mass?null:preview.patternRadiusHexes).map(person=>({
      ...person,autoWidth:choices.applyPelletWidth?situation.derived.targetSize:null}));
    const blast={...aimed,people};
    previewShotgun(blast);
    return blast;
  }
  previewFirearm(input);
  return input;
}
