import {pickMapMove,drawRoute} from './map-move-picker.mjs';
import {projectRoute,routeSummary} from '../rules/route-projection.mjs';
import {preferredMovementStance,movementInvestment} from './movement-order-options.mjs';
import {movementInjuryModifier,disabledLocations} from '../rules/disabling-effects.mjs';
import {woundInImpulse} from '../rules/impulse-completion.mjs';
import {submitPlayerIntent,coordinatorStatus} from '../application/player-intents.mjs';
import {planHexMove,postureForStance,bearingBetween} from '../foundry/hex-move.mjs';
import {mergeSceneTerrain} from '../foundry/movement-scene.mjs';
import {quoteHexStep,facingChangeCost} from '../rules/movement.mjs';
import {movementModifiers} from '../data/movement.mjs';
import {actionBalance,aimedThisImpulse} from '../rules/timing.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

const stanceLabels=Object.freeze({standing:'Standing / running',
  'low-crouch':'Low crouch','hands-and-knees':'Hands and knees','belly-crawl':'Belly crawl'});
const groupLabels=Object.freeze({slope:'Stairs and hills',cover:'Brush or rubble',water:'Water'});

function buildMeasure(scene){
  return {measurePath:points=>scene.grid.measurePath(points),
    testCollision:(a,b)=>!!CONFIG.Canvas.polygonBackends.move?.testCollision(a,b,{type:'move',mode:'any'})};
}

export async function selectHexMove(combat,state,id,{split=false,dragDestination=null}={}){
  const token=combat.combatants.get(id)?.token;
  if(!token?.object)throw new Error('This combatant has no scene token on the current canvas.');
  const entry=state.entries[id],pending=entry?.movement?.pending??null;
  let balance=actionBalance(state,id);
  if(!(balance>0))throw new Error('No configured actions remain in this impulse.');

  if(pending){
    if(!split)return {};
    const maximum=movementInvestment({balance,cost:pending.cost,progress:pending.progress}).amount;
    const actions=await foundry.applications.api.DialogV2.prompt({window:{title:'Split movement actions'},
      content:`<div class="pc-dialog"><p>${e(pending.label)} · ${pending.cost-pending.progress} actions remaining.</p><label>Actions to spend now<input name="amount" type="number" min="1" max="${maximum}" step="1" value="${maximum}" required></label></div>`,
      ok:{label:'Continue move',callback:(_event,_button,dialog)=>movementInvestment({balance,cost:pending.cost,progress:pending.progress,manual:Number(dialog.element.querySelector('[name=amount]').value)}).amount},rejectClose:false});
    return actions===null||actions===undefined?null:{actions};
  }
  if(!canvas.ready||canvas.scene.id!==combat.scene?.id)throw new Error('View the encounter scene before moving.');
  const actor=combat.combatants.get(id).actor;
  const injury=movementInjuryModifier(disabledLocations(actor.system.injuries,i=>woundInImpulse(i,state,combat.uuid)));
  if(injury.unclassified.length)throw new Error('An unclassified disabling injury needs a GM movement ruling.');

  const grid=combat.scene.grid;
  const point=token.getCenterPoint({x:token.x,y:token.y});
  const centre={x:point.x,y:point.y};
  const measure=buildMeasure(combat.scene);
  const same=(a,b)=>Math.abs(a.x-b.x)<0.01&&Math.abs(a.y-b.y)<0.01;
  let live=state;

  const root=document.createElement('div');root.className='pc-hex-move pc-dialog pc-weapon-order';
  const terrain=game.user.isGM?`<details><summary>Terrain and condition</summary>
    ${Object.entries(groupLabels).map(([group,label])=>`<label>${e(label)} <select name="${group}">${Object.keys(movementModifiers[group]).map(key=>`<option value="${e(key)}">${key==='none'?'None':`${e(key)} (+${movementModifiers[group][key]})`}</option>`).join('')}</select></label>`).join('')}
    <fieldset><legend>Other conditions</legend>${Object.entries(movementModifiers.miscellaneous).map(([key,cost])=>`<label><input type="checkbox" name="misc" value="${e(key)}"> ${e(key)} (+${cost})</label>`).join('')}</fieldset>
    <p class="pc-help">Scene-marked regions apply automatically when present. Manual entries apply to every hex of the route that the scene does not mark.</p></details>`
    :'<p class="pc-help">Base terrain cost unless the scene marks this hex. Recorded injuries are derived.</p>';
  root.innerHTML=`<p class="pc-record-kicker">${e(actor.name)} · MOVE</p><p>Click any hex on the map to plot a route there. Click again to add waypoints, for example around a wall; click the last waypoint to remove it.</p>
    <p class="pc-route-headline" data-route-headline role="status" aria-live="polite"></p>
    <p class="pc-route-legend" aria-hidden="true"><span data-tone="now"></span>This impulse <span data-tone="next"></span>Next <span data-tone="later"></span>Later</p>
    <label>Stance <select data-stance><option value="">Choose…</option>${Object.entries(stanceLabels).map(([key,label])=>`<option value="${e(key)}">${e(label)} → ${e(postureForStance[key])}</option>`).join('')}</select></label>
    <label><input type="checkbox" data-face checked> Turn to face the way you are going</label>
    <label>Next hex by keyboard<select data-destination></select></label>
    ${terrain}
    <details><summary>Split actions with another task</summary><label><input data-split type="checkbox"> Limit actions spent on the first hex now</label><label>Actions <input data-actions type="number" min="1" step="1" disabled></label></details>
    <details><summary data-hex-count>Hexes</summary><ol class="pc-route-hexes" data-route-list></ol><p data-cost-breakdown class="pc-help"></p><p class="pc-help">Table 7A. Direction comes from the facing at each hex; one hexside of turning is free while moving; stance sets posture. Arrivals assume every action goes to the move.</p></details>`;

  const stance=root.querySelector('[data-stance]'),keyboard=root.querySelector('[data-destination]');
  const actions=root.querySelector('[data-actions]'),headline=root.querySelector('[data-route-headline]');
  const waypoints=[];

  function terrainForPoint(target,baseStep){
    const manual={...baseStep};
    const miscellaneous=[];
    if(game.user.isGM){
      for(const group of Object.keys(groupLabels))manual[group]=root.querySelector(`[name=${group}]`).value;
      for(const box of root.querySelectorAll('[name=misc]:checked'))miscellaneous.push(box.value);
      if(miscellaneous.length)manual.miscellaneous=miscellaneous;
    }
    return mergeSceneTerrain(manual,{scene:combat.scene,point:target});
  }

  // The hexes of the route: a straight hex path from where he stands to the first waypoint,
  // then on from each waypoint to the next.
  function routeHexes(){
    const hexes=[];let from=centre;
    for(const waypoint of waypoints){
      let previous=from;
      // Facing is a free angle (§2.3), so he faces down the leg, not at each hex of it: a
      // line that is not along a hex row zigzags, and turning to each hex would swing him
      // 60 degrees a hex. Faced down the leg, every hex of it is within 30 degrees: forward.
      // Measured between hex centres: a token's own centre can sit a fraction of a pixel off
      // its hex's, which would otherwise read as a tiny turn.
      const heading=bearingBetween(grid.getCenterPoint(grid.getOffset(from)),waypoint);
      for(const offset of grid.getDirectPath([from,waypoint]).slice(1)){
        const to=grid.getCenterPoint(offset);
        hexes.push({from:previous,to,heading,waypoint:false});previous=to;
      }
      if(hexes.length)hexes.at(-1).waypoint=true;
      from=waypoint;
    }
    return hexes;
  }

  // Each hex priced as the coordinator will price it when it is declared: the direction read
  // from the facing he has at that hex, the turn to face his way, the scene's terrain.
  function routeLegs({priced=true}={}){
    let rotation=token.rotation;const legs=[];
    for(const [index,hex] of routeHexes().entries()){
      let plan;
      try{plan=planHexMove({scene:combat.scene,from:hex.from,to:hex.to,rotation,elevation:token.elevation,destinationElevation:token.elevation,...measure});}
      catch(error){throw new Error(`Hex ${index+1}: ${error.message.replace(/ go round it, or have the GM move this combatant directly\./,'')} Add a waypoint to go round it.`.replace(/\s+/g,' '));}
      const face=root.querySelector('[data-face]').checked;
      const turnDegrees=face?Math.abs(((hex.heading-rotation)%360+540)%360-180):0;
      const hexsides=face&&turnDegrees>=0.5?Math.ceil(turnDegrees/60-1e-6):0;
      const leg={...hex,direction:plan.direction,offAxisDegrees:plan.offAxisDegrees,hexsides,facing:face&&turnDegrees>=0.5?hex.heading:null};
      if(priced){
        const {step,sceneTerrain}=terrainForPoint(hex.to,{stance:stance.value});
        const quote=quoteHexStep({...step,direction:plan.direction,miscellaneous:step.miscellaneous??[],injury:injury.groups.length?injury.groups:'none'});
        const turn=facingChangeCost({hexsides,movingThisHex:true});
        Object.assign(leg,{step,sceneTerrain,quote,turn,cost:quote.actions+turn.actions});
      }
      legs.push(leg);
      if(leg.facing!==null)rotation=leg.facing;
    }
    return legs;
  }

  function fillKeyboard(){
    const end=waypoints.at(-1)??centre;
    const options=grid.getAdjacentOffsets(grid.getOffset(end)).map(offset=>grid.getCenterPoint(offset))
      .filter(to=>!same(to,centre)&&!waypoints.some(w=>same(w,to)));
    keyboard.innerHTML=`<option value="">Choose…</option>${options.map(to=>`<option value="${to.x},${to.y}">${Math.round(bearingBetween(end,to))}° from ${waypoints.length?'the last waypoint':'where he stands'}</option>`).join('')}`;
  }

  const tone=offset=>offset===0?'now':offset===1?'next':'later';
  function update(){
    let valid=false,summaryText='';
    const list=root.querySelector('[data-route-list]');
    try{
      if(!waypoints.length){drawRoute([]);throw new Error('Click a hex on the map to plan the route.');}
      if(!stance.value)throw new Error('Choose a movement stance.');
      const legs=routeLegs();
      const costs=legs.map(leg=>leg.cost),entry=live.entries[id];
      const a=entry?.activity,aiming=a?.continuous&&a.progress<a.cost&&!a.interrupted&&!a.holdReason&&['shot','shotgun','burst'].includes(a.weaponPlan?.kind);
      const arrivals=projectRoute(costs,{allowance:entry?.allowance,phase:live.phase,impulse:live.impulse,spent:entry?.spent??0,
        aim:aiming?{remaining:a.cost-a.progress,takenNow:aimedThisImpulse(live,id,a)>=1}:null});
      drawRoute(legs.map((leg,index)=>({to:leg.to,waypoint:leg.waypoint,offset:arrivals[index]?.offset??2})));
      const summary=routeSummary(costs,arrivals);
      const at=summary.arrives?(summary.arrives.offset===0?'this impulse':`Phase ${summary.arrives.phase} · Impulse ${summary.arrives.impulse}`):'—';
      summaryText=`${summary.hexes} hex${summary.hexes===1?'':'es'} · ${summary.actions} action${summary.actions===1?'':'s'} · ${summary.thisImpulse} this impulse · arrives ${at}`;
      if(aiming)summaryText+=` · aiming alongside (1 action an impulse)`;
      headline.textContent=summaryText;
      root.querySelector('[data-hex-count]').textContent=`Hexes · ${summary.hexes}`;
      list.innerHTML=legs.map((leg,index)=>`<li data-tone="${tone(arrivals[index]?.offset??2)}">${e(leg.direction)} · ${leg.cost} action${leg.cost===1?'':'s'}${leg.sceneTerrain?` · ${e(leg.sceneTerrain.regionName||'marked terrain')}`:''}${arrivals[index]?` · P${arrivals[index].phase} I${arrivals[index].impulse}`:''}</li>`).join('');
      const first=legs[0];
      if(!(balance>0))throw new Error('No actions are left this impulse; commit the move when he has actions again.');
      const most=Math.min(balance,first.cost);
      actions.max=most;actions.disabled=!root.querySelector('[data-split]').checked;
      if(!actions.value||Number(actions.value)>most||Number(actions.value)<1)actions.value=most;
      movementInvestment({balance,cost:first.cost,manual:actions.disabled?null:Number(actions.value)});
      const parts=[...first.quote.breakdown,...(first.turn.actions?[{label:`Facing: ${first.turn.paidHexsides} paid hexside(s)`,actions:first.turn.actions}]:[])];
      root.querySelector('[data-cost-breakdown]').textContent=`First hex: ${parts.map(p=>`${p.label} ${p.actions}`).join(' · ')}${first.quote.assumed.length?` · Base terrain assumed for ${first.quote.assumed.map(a=>a.field).join(', ')}.`:''}`;
      valid=true;
    }catch(error){
      headline.textContent=summaryText?`${summaryText}. ${error.message}`:error.message;
      if(!summaryText){list.innerHTML='';if(waypoints.length)drawRoute([]);}
    }
    root.querySelector('[data-route-headline]').dataset.invalid=String(!valid);
    const save=root.querySelector('[data-commit-move]');if(save)save.disabled=!valid;
    fillKeyboard();
  }

  function addWaypoint(to){
    if(!waypoints.length&&same(to,centre))throw new Error('That is the hex he is standing in.');
    if(waypoints.length&&same(to,waypoints.at(-1))){waypoints.pop();update();return;}
    if(same(to,waypoints.at(-1)??centre))return;
    waypoints.push(to);
    try{routeLegs({priced:false});}catch(error){waypoints.pop();update();throw error;}
    update();
  }

  root.addEventListener('input',update);root.addEventListener('change',event=>{
    if(event.target===keyboard&&keyboard.value){const [x,y]=keyboard.value.split(',').map(Number);try{addWaypoint({x,y});}catch(error){ui.notifications.warn(error.message);}return;}
    update();
  });
  stance.value=preferredMovementStance(entry,actor.system.condition.posture);

  if(dragDestination){
    const end=grid.getCenterPoint(grid.getOffset(token.getCenterPoint(dragDestination)));
    if(same(end,centre))return null;
    waypoints.push(end);
    try{routeLegs({priced:false});}catch(error){throw new Error(`The direct route is blocked. ${error.message}`);}
  }

  update();
  return pickMapMove({root,scene:combat.scene,token,combat,
    hasRoute:()=>waypoints.length>0,
    onPoint:addWaypoint,
    onUndo:()=>{waypoints.pop();update();},
    // An impulse timer or another combatant's order does not spoil this plan; a pending hex
    // of his own, or a reaction or resolution window, does.
    onEncounterChange:doc=>{
      const next=doc.timing,own=next.entries[id];
      if(next.reactions||next.batch||next.pendingEffect||own?.movement?.pending)return false;
      live=next;balance=actionBalance(next,id);update();return true;
    },
    onConfirm:()=>{
      if(!(balance>0))throw new Error('No actions are left this impulse.');
      const legs=routeLegs(),first=legs[0];
      // The direction is read by the coordinator from the facing at each hex; only the stance
      // (and, for the GM, the terrain) is sent.
      const send=leg=>game.user.isGM?leg.step:{stance:leg.step.stance};
      const route=legs.slice(1).map(leg=>({destination:leg.to,hexsides:leg.hexsides,...(leg.facing===null?{}:{facing:leg.facing}),step:send(leg)}));
      return {step:send(first),destination:first.to,hexsides:first.hexsides,
        ...(first.facing===null?{}:{facing:first.facing}),
        ...(route.length?{route}:{}),
        ...(root.querySelector('[data-split]').checked?{actions:movementInvestment({balance,cost:first.cost,manual:Number(actions.value)}).amount}:{}),
        expectedRevision:combat.timing.revision};
    }});
}

export async function openTokenMove(){
  try{
    if(!canvas.ready||canvas.tokens.controlled.length!==1)throw new Error('Control one character token to move.');
    const token=canvas.tokens.controlled[0].document,combat=game.combat;
    if(!combat?.started||combat.scene?.id!==canvas.scene.id)throw new Error('Begin an encounter on this scene before using paid movement.');
    const c=combat.combatants.find(c=>c.token?.uuid===token.uuid);
    if(!c?.actor?.testUserPermission(game.user,'OWNER'))throw new Error('You must own this encounter combatant.');
    if(!coordinatorStatus().accepting)throw new Error('Waiting for the GM coordinator.');
    const state=structuredClone(combat.timing);
    if(state.reactions||state.batch||state.pendingEffect)throw new Error('Finish the current reactions or resolution before moving.');
    const fields=await selectHexMove(combat,state,c.id);if(!fields)return null;
    const command={kind:'move',combatantId:c.id,expectedRevision:state.revision,id:foundry.utils.randomID(),...fields};
    return game.user.isGM?await combat.timingCommand(command):await submitPlayerIntent(combat,command);
  }catch(error){ui.notifications.warn(error.message);return null;}
}
