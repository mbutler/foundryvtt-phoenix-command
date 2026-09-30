import {registerFireWorkflow} from './application/fire-workflow.mjs';
import {registerMeleeOptionalRules,registerSmallArmsOptionalRules} from './foundry/optional-rules.mjs';
import {inStartedEncounter,lockedItemChange} from './rules/combat-inventory.mjs';
import {registerCriticalTimeAlerts} from './ui/medical-aid.mjs';
import {registerHealingClock} from './foundry/healing-clock.mjs';
import {defaultWeaponImage,repairWeaponImages} from './foundry/weapon-image-repair.mjs';
import {repairAmmunitionWeights} from './foundry/ammunition-weight-repair.mjs';
import {repairLauncherBursts} from './foundry/launcher-burst-repair.mjs';
import {repairThreeRoundBursts} from './foundry/three-round-burst-repair.mjs';
import {defaultCharacterLink} from './foundry/character-identity.mjs';
import {registerSituationHUD} from './ui/situation.mjs';
import {configureTokenOptions} from './foundry/token-options.mjs';
import {registerTokenActionBar} from './ui/token-action-bar.mjs';
import {registerAutoAdvance} from './foundry/auto-advance.mjs';
import {registerGmImpulsePanel} from './ui/gm-impulse-panel.mjs';
import {registerTokenDragMove} from './ui/token-drag-move.mjs';
import {registerFacingMarker} from './ui/facing-marker.mjs';
import {registerPinMarkers} from './ui/pin-markers.mjs';
import {registerHexScenes} from './foundry/hex-scene.mjs';
import {registerPlayerIntents,submitPlayerIntent} from './application/player-intents.mjs';
import {PhoenixCombat} from './combat/combat.mjs';
import {PhoenixCombatTracker} from './combat/tracker.mjs';
import {registerApplicationChat} from './application/foundry.mjs';
import { CharacterData } from './models/character.mjs';
import { itemModels } from './models/items.mjs';
import * as units from './rules/units.mjs';
import * as summary from './rules/summary.mjs';
import * as attacks from './rules/attacks.mjs';
import { registerSheets } from './ui/sheets.mjs';
import { PhoenixCalculator, openTokenAttack } from './ui/foundry-calculator.mjs';

Hooks.once('init', () => {
  configureTokenOptions(CONFIG);
  registerSituationHUD();
  Hooks.on('preCreateActor',defaultCharacterLink);
  Hooks.on('preCreateItem',defaultWeaponImage);
  registerTokenActionBar();
  registerAutoAdvance();
  registerGmImpulsePanel();
  registerTokenDragMove();
  registerFacingMarker();
  registerPinMarkers();
  CONFIG.Combat.documentClass=PhoenixCombat;
  CONFIG.ui.combat=PhoenixCombatTracker;
  CONFIG.time.roundTime=2;
  CONFIG.time.turnTime=0;
  CONFIG.Actor.dataModels.character = CharacterData;
  Object.assign(CONFIG.Item.dataModels, itemModels);
  registerHexScenes();
  registerSheets();
  registerCriticalTimeAlerts();
  registerHealingClock();
  registerApplicationChat();
  registerPlayerIntents();
  registerFireWorkflow();
  // Table 8C dates the levels of medical care, from first aid in 1831 to a technology
  // level 18 trauma centre in 2345. The year is the world's, not a character's, so it is a
  // world setting rather than a field on anybody's sheet. Null means unset, and the
  // recovery dialog then says Table 8C cannot answer rather than guessing a century.
  game.settings.register('phoenix-command','campaignYear',{name:'Campaign year',
    hint:'Used with Table 8C (LEG10200 PDF 68) to say what medical care the period can offer. Leave blank to decide it case by case.',
    scope:'world',config:true,type:new foundry.data.fields.NumberField({required:false,nullable:true,integer:true,initial:null})});
  registerMeleeOptionalRules();
  registerSmallArmsOptionalRules();
  // Route ordinary player posture edits through the combat workflow. This is
  // client-side VTT workflow enforcement, not a hostile-client security boundary.
  Hooks.on('preUpdateActor',(actor,change)=>{
    const flat=foundry.utils.flattenObject(change);
    if(Object.hasOwn(flat,'system.condition.posture')&&flat['system.condition.posture']!==actor.system.condition.posture&&!Object.hasOwn(flat,'system.condition.braced'))foundry.utils.setProperty(change,'system.condition.braced',false);
    if(game.user.isGM)return;
    if(!['posture','braced','firingStance','looking'].some(key=>Object.hasOwn(flat,`system.condition.${key}`)))return;
    if(game.combats.some(combat=>combat.started&&combat.combatants.some(c=>c.actor?.uuid===actor.uuid))){
      ui.notifications.warn('Use a combat posture activity; ask the GM to plan it.');return false;
    }
  });
  const combatInventory=actor=>inStartedEncounter(actor,game.combats);
  Hooks.on('preUpdateItem',(item,change)=>{
    if(game.user.isGM||!combatInventory(item.parent))return;
    const refused=lockedItemChange(foundry.utils.flattenObject(change),item.system);
    if(refused){ui.notifications.warn(refused);return false;}
  });
  for(const hook of ['preCreateItem','preDeleteItem'])Hooks.on(hook,item=>{
    if(!game.user.isGM&&combatInventory(item.parent)){ui.notifications.warn('Ask the GM to change inventory during combat.');return false;}
  });
  game.system.api = Object.freeze({
    version: game.system.version,
    submitPlayerIntent,
    models: Object.freeze({ CharacterData, ...itemModels }),
    rules: Object.freeze({ ...units, ...summary, ...attacks }),
    openTokenAttack,
    openCalculator: () => new PhoenixCalculator().render({ force: true }),
    // Marking a map for cover. Foundry records no material or thickness on a wall, so the
    // GM says once what each barrier is and every shot across it reads the answer.
    markCover: async () => (await import('./ui/cover-map.mjs')).markCover(),
    markMovementTerrain: async () => (await import('./ui/movement-terrain.mjs')).markMovementTerrain(),
    reviewSceneCover: async () => (await import('./ui/cover-map.mjs')).reviewSceneCover(),
    resolveImpulseFire: () => game.combat?.resolveImpulseFire(),
    resolveDueFire: options => game.combat && import('./application/resolve-due-fire.mjs').then(m => m.resolveDueFire(game.combat, options))
  });
  Hooks.on('getSceneControlButtons',controls=>{
    const tools=controls.tokens?.tools;
    if(!tools)return;
    const order=()=>Object.keys(tools).length;
    tools.phoenixAttack={name:'phoenixAttack',title:'Phoenix Command: Attack — choose enemy on map',
      icon:'fa-solid fa-gun',order:order(),button:true,visible:true,onChange:()=>openTokenAttack()};
    tools.phoenixMove={name:'phoenixMove',title:'Phoenix Command: move selected token',icon:'fa-solid fa-person-walking',order:order(),button:true,visible:true,onChange:async()=>{await (await import('./ui/hex-move.mjs')).openTokenMove();}};
    tools.phoenixMarkCover={name:'phoenixMarkCover',title:'Phoenix Command: mark selected cover',
      icon:'fa-solid fa-shield-halved',order:order(),button:true,visible:game.user.isGM,
      onChange:async()=>{try{await (await import('./ui/cover-map.mjs')).markCover();}catch(error){ui.notifications.warn(error.message);}}};
    tools.phoenixMarkTerrain={name:'phoenixMarkTerrain',title:'Phoenix Command: mark movement terrain on regions',
      icon:'fa-solid fa-mountain',order:order(),button:true,visible:game.user.isGM,
      onChange:async()=>{try{await (await import('./ui/movement-terrain.mjs')).markMovementTerrain();}catch(error){ui.notifications.warn(error.message);}}};
    tools.phoenixReviewCover={name:'phoenixReviewCover',title:'Phoenix Command: review scene cover',
      icon:'fa-solid fa-layer-group',order:order(),button:true,visible:game.user.isGM,
      onChange:async()=>{try{await (await import('./ui/cover-map.mjs')).reviewSceneCover();}catch(error){ui.notifications.warn(error.message);}}};
  });
});

Hooks.once('ready',()=>repairAmmunitionWeights().catch(error=>console.error('Phoenix Command ammunition weight repair',error)));
Hooks.once('ready',()=>repairLauncherBursts().catch(error=>console.error('Phoenix Command launcher burst repair',error)));
Hooks.once('ready',()=>repairThreeRoundBursts().catch(error=>console.error('Phoenix Command three-round burst repair',error)));

Hooks.once('ready',()=>repairWeaponImages().catch(error=>console.error('Phoenix Command weapon image repair',error)));
