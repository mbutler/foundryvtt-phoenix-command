// A small notch on each character token's hex, pointing the way he faces. The art does not
// always show it, and facing prices every hex of movement (Table 7A) and bounds every shot
// (the 60-degree Field of Fire).
//
// Facing is the Token's `rotation`, 0 = scene north, clockwise (the convention in
// foundry/hex-move.mjs), read in the same refresh that turns the token's art, so the notch
// turns with it. It sits inside the hex, just within its edge: Foundry's target arrows are
// drawn outside the token's corners and other players' target pips above its top edge, so it
// never covers either. It shows even when a token's art is locked from rotating.

// The triangle before rotation, centred on the token, pointing north. Sized from the hex's
// inscribed radius so it stays inside a pointy-top hex whichever way he faces.
export function facingMarkerShape({w,h}){
  const inner=Math.min(w,h)/2,size=Math.min(w,h);
  const tip=-inner*0.95,base=tip+size*0.16,half=size*0.09;
  return {points:[0,tip,half,base,-half,base],line:Math.max(1.5,size*0.02)};
}

function draw(token){
  const shown=token.actor?.type==='character'&&canvas.grid?.type!==CONST.GRID_TYPES.GRIDLESS;
  let marker=token.phoenixFacing;
  if(!shown){if(marker&&!marker.destroyed)marker.visible=false;return;}
  if(!marker||marker.destroyed){
    marker=token.phoenixFacing=token.addChild(new PIXI.Graphics());
    marker.eventMode='none';marker.label='phoenix-facing';
  }
  const {points,line}=facingMarkerShape({w:token.w,h:token.h});
  marker.clear().lineStyle({width:line,color:0x101519,alpha:0.85,join:PIXI.LINE_JOIN.ROUND})
    .beginFill(0xc8d67a,0.95).drawPolygon(points).endFill();
  marker.position.set(token.w/2,token.h/2);
  marker.angle=token.document.rotation??0;
  marker.visible=true;
}

export function registerFacingMarker(){
  Hooks.on('drawToken',token=>draw(token));
  Hooks.on('refreshToken',(token,flags)=>{
    if(flags.refreshRotation||flags.refreshSize||flags.refreshState||!token.phoenixFacing)draw(token);
  });
}
