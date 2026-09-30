let activePicker=null;
const layerName='phoenix-move-route';

// A non-modal panel keeps Foundry's map available. A click on any hex adds a waypoint and the
// panel plots the hex path to it; only the coordinator moves the token and spends actions.
// The route is drawn on the map, coloured by the impulse each hex is reached in.
//
// The panel survives encounter updates that do not concern this mover (an impulse timer,
// another combatant's order): `onEncounterChange` re-reads the encounter and says whether
// the plan still stands. Its token being moved, or its character changing, still closes it.
export function pickMapMove({root,scene,token,combat,onPoint,onUndo,onConfirm,onEncounterChange=()=>true,hasRoute}){
  if(!canvas.ready||canvas.scene.id!==scene.id)throw new Error('View the encounter scene before moving.');
  activePicker?.();
  const stage=canvas.stage;
  const previousFocus=document.activeElement;
  root.classList.add('pc-map-move');root.setAttribute('role','region');root.setAttribute('aria-label','Movement order');
  const actions=document.createElement('div');actions.className='pc-map-move-actions';
  const undo=document.createElement('button');undo.type='button';undo.textContent='Undo last waypoint';undo.disabled=true;
  const commit=document.createElement('button');commit.type='button';commit.dataset.commitMove='';commit.textContent='Commit route';commit.disabled=true;
  const cancel=document.createElement('button');cancel.type='button';cancel.textContent='Cancel';
  actions.append(undo,commit,cancel);root.append(actions);document.body.append(root);
  const refreshButtons=()=>{undo.disabled=!hasRoute();};
  return new Promise(resolve=>{
    let finished=false;
    const hookIds=[];
    const finish=value=>{
      if(finished)return;finished=true;
      stage.off('pointerdown',onDown);window.removeEventListener('keydown',onKey,true);
      for(const [name,id]of hookIds)Hooks.off(name,id);
      clearRoute(true);
      root.remove();if(activePicker===cancelPicker)activePicker=null;
      if(previousFocus?.isConnected)previousFocus.focus?.();
      resolve(value);
    };
    const cancelPicker=()=>finish(null);
    const confirm=()=>{if(commit.disabled)return;try{finish(onConfirm());}catch(error){ui.notifications.warn(error.message);}};
    const onDown=event=>{
      if(event.button!==undefined&&event.button!==0)return;
      // The same conversion the burst-arc picker uses: from the pointer's client position,
      // through Foundry's own canvas transform, so it cannot disagree with the grid.
      const client=event.nativeEvent??event;
      const point=Number.isFinite(client.clientX)?canvas.canvasCoordinatesFromClient({x:client.clientX,y:client.clientY}):event.getLocalPosition(stage);
      const center=scene.grid.getCenterPoint(scene.grid.getOffset(point));
      try{onPoint(center);}catch(error){ui.notifications.warn(error.message);}
      refreshButtons();
    };
    const back=()=>{if(!hasRoute())return;onUndo();refreshButtons();};
    const onKey=event=>{
      if(event.key==='Escape'){event.preventDefault();event.stopPropagation();finish(null);}
      else if(event.key==='Backspace'&&hasRoute()&&!['INPUT','SELECT','TEXTAREA'].includes(event.target?.tagName)){event.preventDefault();back();}
      else if(event.key==='Enter'&&(event.target===commit||event.target===document.body)){event.preventDefault();confirm();}
    };
    undo.addEventListener('click',back);
    commit.addEventListener('click',confirm);cancel.addEventListener('click',cancelPicker);
    stage.on('pointerdown',onDown);window.addEventListener('keydown',onKey,true);
    hookIds.push(['canvasTearDown',Hooks.on('canvasTearDown',cancelPicker)]);
    hookIds.push(['deleteToken',Hooks.on('deleteToken',doc=>{if(doc.uuid===token.uuid)finish(null);})]);
    hookIds.push(['updateToken',Hooks.on('updateToken',(doc,change)=>{
      if(doc.uuid!==token.uuid||!['x','y','rotation','elevation'].some(k=>k in change))return;
      ui.notifications.warn('The moving token changed. Plan the move again.');finish(null);
    })]);
    hookIds.push(['updateActor',Hooks.on('updateActor',(doc,change)=>{
      if(doc.uuid!==token.actor?.uuid||!foundry.utils.hasProperty(change,'system.condition'))return;
      ui.notifications.warn('The moving character changed. Review the move again.');finish(null);
    })]);
    hookIds.push(['deleteCombat',Hooks.on('deleteCombat',doc=>{if(doc.id===combat.id)finish(null);})]);
    hookIds.push(['updateCombat',Hooks.on('updateCombat',doc=>{
      if(doc.id!==combat.id)return;
      let keep=false;try{keep=onEncounterChange(doc);}catch{keep=false;}
      if(!keep){ui.notifications.warn('This move can no longer be made as planned. Plan it again.');finish(null);}
    })]);
    activePicker=cancelPicker;
    root.querySelector('[data-stance]')?.focus();
    refreshButtons();
  });
}

// The planned route on the map: this impulse, the next, and later, in three tones. The
// waypoints are outlined.
const tones=[0xb6c66a,0xd4a354,0x8a95a0];
export function drawRoute(hexes){
  const layer=canvas.interface?.grid;if(!layer)return;
  if(!layer.getHighlightLayer?.(layerName))layer.addHighlightLayer(layerName);
  layer.clearHighlightLayer(layerName);
  for(const hex of hexes){
    const offset=canvas.grid.getOffset(hex.to),corner=canvas.grid.getTopLeftPoint(offset);
    layer.highlightPosition(layerName,{x:corner.x,y:corner.y,color:tones[Math.min(hex.offset??2,2)],
      border:hex.waypoint?0xffffff:null,alpha:hex.waypoint?0.55:0.4});
  }
}
export function clearRoute(destroy=false){
  const layer=canvas.interface?.grid;if(!layer?.getHighlightLayer?.(layerName))return;
  if(destroy)layer.destroyHighlightLayer(layerName);else layer.clearHighlightLayer(layerName);
}
