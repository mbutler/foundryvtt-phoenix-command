// §5.9 Pinning Fire and §5.10 Cover Fire (optional): the hexes being pinned or covered, outlined
// on the map for the GM and for
// whoever owns the pinning character, so a pin is not forgotten or mistaken for another hex.
const layerName='phoenix-pins';
export function drawPins(){
  const layer=canvas.interface?.grid,combat=game.combat;
  if(!layer||!canvas.ready)return;
  if(!layer.getHighlightLayer?.(layerName))layer.addHighlightLayer(layerName);
  layer.clearHighlightLayer(layerName);
  if(!combat?.started||combat.scene?.id!==canvas.scene?.id)return;
  let state;try{state=combat.timing;}catch{return;}
  for(const [id,entry] of Object.entries(state.entries??{})){
    if(!entry.pin&&!entry.coverFire)continue;
    const c=combat.combatants.get(id);
    if(!game.user.isGM&&!c?.actor?.testUserPermission(game.user,'OWNER'))continue;
    // Pinned hex in amber; §5.10 covered hexes in red.
    const hexes=[...(entry.pin?[{hex:entry.pin.hex,color:0xd4a354}]:[]),
      ...(entry.coverFire?.arc?.hexes??[]).map(point=>({hex:canvas.grid.getOffset(point),color:0xd26b5d}))];
    for(const {hex,color} of hexes){
      const corner=canvas.grid.getTopLeftPoint(hex);
      layer.highlightPosition(layerName,{x:corner.x,y:corner.y,color,border:color,alpha:0.18});
    }
  }
}
export function registerPinMarkers(){
  const redraw=()=>setTimeout(drawPins,0);
  for(const hook of ['canvasReady','updateCombat','deleteCombat','combatStart'])Hooks.on(hook,redraw);
}
