import {assertFireFacing} from '../foundry/facing.mjs';
import {pickAttackTarget} from './attack-target-picker.mjs';
import {existingAttackTarget} from './weapon-order-context.mjs';
import {encounterStamp} from '../combat/combat.mjs';
import {locationRollFormula} from '../rules/called-shot.mjs';
import {previewFirearm,playsMelee} from '../rules/attacks.mjs';
import {applyResult,undoResult} from '../application/foundry.mjs';
import { mountAttackFlow } from './attack-flow.mjs';
import { mountCalculator } from './calculator.mjs';
import {openCombatWeaponOrder,encounterCombatant} from './weapon-order.mjs';
import {equippedModes,supportsOrder} from './weapon-order-options.mjs';
import {attackFamilies,defaultAttackOrder,withinMeleeReach} from './attack-order.mjs';
import { buildRoster, selectedAttackContext, resultChatData, snapshotActor } from '../foundry/context.mjs';

export class PhoenixCalculator extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS = {
    id: 'phoenix-command-calculator', classes: ['phoenix-command'],
    window: { title: 'Phoenix Command · Combat calculator', resizable: true },
    position: { width: 580, height: 800 }
  };

  async _renderHTML() {
    const root = document.createElement('div');
    const tokens = canvas.ready ? canvas.tokens.placeables : [];
    const roster = buildRoster(game.actors, tokens, game.user);
    if (this.options.extraActor && !roster.some(a => a.id === this.options.extraActor.id)) roster.push(this.options.extraActor);
    const initialState = this.options.fromTokens ? selectedAttackContext({
      controlled: canvas.tokens.controlled, targets: Array.from(game.user.targets), scene: canvas.scene, user: game.user, measurePath: points => canvas.grid.measurePath(points)
    }) : (this.options.initialState ?? {});
    mountCalculator(root, {
      roster, initialState,
      rollDice: async ({ kind, dieSides, input }) => {
        const roll = async formula => (await new foundry.dice.Roll(formula).evaluate()).total;
        return { hit: await roll('1d100 - 1'), location: await roll(kind==='firearm'?locationRollFormula(previewFirearm(input).cover):'1d100 - 1'),
          ...(kind === 'firearm' ? { armor: await roll('1d10 - 1') } : { impact: await roll(`1d${dieSides}`) }) };
      },
      postResult: async (result, context) => {
        const data = resultChatData(result, { ...context, systemVersion: game.system.version });
        // Respect the user's selected public/GM/blind/self roll mode.
        foundry.documents.ChatMessage.applyMode(data);
        await foundry.documents.ChatMessage.create(data);
      }
    });
    return root;
  }
  _replaceHTML(result, content) { content.replaceChildren(result); }
}

export async function openTokenAttack() {
  try {
    if (!canvas.ready) throw new Error('Open a scene first.');
    const tokens=canvas.tokens.controlled;
    if(tokens.length!==1||!tokens[0].actor)throw new Error('Control one character token to give an order.');
    const actor=tokens[0].actor;
    if(!actor.testUserPermission(game.user,'OWNER'))throw new Error('You must own this character.');
    const combatant=encounterCombatant(actor,canvas.tokens.placeables,game.combat,canvas.scene.id);
    if(combatant){
      const combat=game.combat,activity=combat.timing.entries[combatant.id]?.activity;
      const shot=activity?.shotId&&combat.getFlag('phoenix-command',`shots.${activity.shotId}`);
      if(activity&&(activity.progress<activity.cost||['ready','rolled'].includes(shot?.status)))return await openCombatWeaponOrder(combat,combatant.id);
      const items=Array.from(actor.items),families=attackFamilies(items);
      // Melee versus ranged depends on the target only when both are equipped.
      let targetUuid=existingAttackTarget(combat,combatant);
      let order=families.melee&&families.ranged?null:defaultAttackOrder(items);
      if(!targetUuid&&(!order||order.needsTarget)){
        targetUuid=await pickAttackTarget(combat,combatant);
        if(!targetUuid)return null;
      }
      if(!order){
        const target=combat.combatants.find(c=>c.token?.uuid===targetUuid)?.token?.object;
        const path=target?canvas.grid.measurePath([tokens[0].center,target.center]):null;
        order=defaultAttackOrder(items,{targetInReach:!!path&&withinMeleeReach(items,{spaces:path.spaces,distance:path.distance,units:canvas.scene.grid.units})});
      }
      return await openCombatWeaponOrder(combat,combatant.id,{kind:order.kind,itemId:order.itemId,modeId:order.modeId,...(targetUuid?{targetUuid}:{})});
    }
    const rows=equippedModes(Array.from(actor.items)).filter(r=>supportsOrder(r,'shot'));
    if(rows.length!==1)throw new Error('Outside an encounter, choose the weapon on your character sheet.');
    return await openWeaponAttack(actor,{itemId:rows[0].weapon.id,modeId:rows[0].modeId,kind:'firearm',attackId:'single'});
  } catch (error) { ui.notifications.warn(error.message); return null; }
}


// Rebuilt at every decision boundary to reject stale positions, ownership and documents.
export function loadWeaponContext(actor, {itemId, kind, modeId, attackId}) {
  if (!actor.testUserPermission(game.user,'OWNER')) throw new Error('You must own this character.');
  if (!canvas.ready) throw new Error('Open a scene and target one character token.');
  const matches=canvas.tokens.placeables.filter(t=>t.visible&&(actor.isToken?t.document.uuid===actor.token.uuid:t.document.actorId===actor.id));
  const controlled=matches.filter(t=>t.controlled);
  const token=controlled.length===1?controlled[0]:matches.length===1?matches[0]:null;
  if (!token) throw new Error('Control one token for this character.');
  const targets=Array.from(game.user.targets);
  const selection=selectedAttackContext({controlled:[token],targets,scene:canvas.scene,user:game.user,measurePath:points=>canvas.grid.measurePath(points)});
  if(kind==='firearm')assertFireFacing(token.document,targets[0].document);
  const attacker=snapshotActor(token.actor,{token}), target=snapshotActor(targets[0].actor,{token:targets[0]});
  const weapon=attacker.items.find(i=>i.id===itemId);
  const mode=weapon?.system?.[kind==='firearm'?'firearmModes':'meleeModes']?.[modeId];
  if(!mode||!weapon.system.carried||!weapon.system.equipped)throw new Error('Equip and carry the selected weapon.');
  if(kind==='firearm'&&!mode.fireTypes.includes('single'))throw new Error('Only single shots are supported.');
  const attack=mode.attacks?.[attackId];
  const timing=encounterStamp(token.document,targets[0].document);
  if(kind==='melee'&&timing)throw new Error('Plan the strike in the combat tracker. It spends the same actions as a shot.');
  if(kind==='melee'&&(mode.skill!=='melee'||!playsMelee(attack)))throw new Error('This melee attack is not transcribed.');
  let timedShot=null;
  if(kind==='firearm'&&timing){
    const shot=Object.values(game.combat.getFlag('phoenix-command','shots')??{}).find(s=>['ready','rolled'].includes(s.status)&&s.plan.actorUuid===attacker.actorUuid&&s.plan.weaponId===itemId&&s.plan.modeId===modeId&&s.plan.targetUuid===target.tokenUuid);
    if(!shot)throw new Error('Plan Aim & fire in the combat tracker and finish its action cost before opening this attack.');
    timedShot={id:shot.id,combatantId:shot.combatantId,applicationId:shot.applicationId,plan:shot.plan};
  }
  return {attacker,target,weapon,mode,modeId,attackId,timing,timedShot,reactions:timedShot?game.combat.reactionInputForShot(timedShot):null,range:selection.range,unit:selection.unit,measurement:selection.measurement,geometry:selection.geometry,
    environment:{darkness:canvas.scene.darkness,environment:canvas.scene.environment,flags:canvas.scene.flags?.['phoenix-command'],walls:Array.from(canvas.scene.walls??[],d=>d.toObject()),regions:Array.from(canvas.scene.regions??[],d=>d.toObject()),lights:Array.from(canvas.scene.lights??[],d=>d.toObject())},
    positions:[token,targets[0]].map(t=>({uuid:t.document.uuid,x:t.center.x,y:t.center.y,elevation:t.document.elevation,rotation:t.document.rotation})),scene:canvas.scene.uuid};
}

export class PhoenixAttackFlow extends foundry.applications.api.ApplicationV2 {
  static DEFAULT_OPTIONS={classes:['phoenix-record-sheet'],window:{title:'Phoenix Command · Attack',resizable:true},position:{width:620,height:820}};
  async _renderHTML() {
    const root=document.createElement('div');
    const load=()=>loadWeaponContext(this.options.actor,this.options.selection);
    this.flow=mountAttackFlow(root,{
      kind:this.options.selection.kind,loadContext:load,
      loadSavedInput:context=>context.timedShot?game.combat.getFlag('phoenix-command',`shots.${context.timedShot.id}.input`):null,
      applyResult:game.user.isGM?applyResult:null,undoResult:game.user.isGM?undoResult:null,
      assertFresh:context=>{if(JSON.stringify(load())!==JSON.stringify(context))throw new Error('Scene or character data changed. Refresh from scene before continuing.');},
      rollDice:async({kind,dieSides,input,context})=>{
        if(context.timedShot)return (await game.combat.rollTimedShot(context.timedShot.id,input,context.target.tokenUuid)).rolls;
        const roll=async formula=>(await new foundry.dice.Roll(formula).evaluate()).total;
        return {hit:await roll('1d100 - 1'),location:await roll(kind==='firearm'?locationRollFormula(previewFirearm(input).cover):'1d100 - 1'),...(kind==='firearm'?{armor:await roll('1d10 - 1')}:{impact:await roll(`1d${dieSides}`)})};
      },
      postResult:async(result,context)=>{
        const data=resultChatData(result,{...context,systemVersion:game.system.version});
        foundry.documents.ChatMessage.applyMode(data);
        await foundry.documents.ChatMessage.create(data);
      }
    });return root;
  }
  _replaceHTML(result,content){content.replaceChildren(result);}
}

export async function openWeaponAttack(actor, selection) {
  if(!actor.testUserPermission(game.user,'OWNER')){ui.notifications.warn('You must own this character.');return null;}
  try {
    if(!canvas.ready)throw new Error('Open a scene first.');
    const combatant=encounterCombatant(actor,canvas.tokens.placeables,game.combat,canvas.scene.id);
    if(combatant)return await openCombatWeaponOrder(game.combat,combatant.id,selection);
    return new PhoenixAttackFlow({actor,selection}).render({force:true});
  }catch(error){ui.notifications.warn(error.message);return null;}
}
