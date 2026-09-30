import {distanceInFeet} from '../rules/units.mjs';

// Foundry v14 GRID_TYPES: odd/even rows (2/3), odd/even columns (4/5).
export function hexGeometry(scene) {
  const grid=scene?.grid;
  if(![2,3,4,5].includes(grid?.type))throw new Error('Phoenix Command combat requires a hex map. Set the scene grid type to hexagonal.');
  if(scene.flags?.core?.legacyHex)throw new Error('Migrate this legacy hex scene before using Phoenix Command combat.');
  const unit=({ft:'ft',feet:'ft',foot:'ft',m:'m',meter:'m',meters:'m',metre:'m',metres:'m'})[String(grid.units??'').trim().toLowerCase()];
  if(!unit)throw new Error('Set scene distance units to feet or meters before measuring an attack.');
  if(!(Number.isFinite(grid.size)&&grid.size>0&&Number.isFinite(grid.distance)&&grid.distance>0))throw new Error('Scene hex scale must be positive.');
  const feet=distanceInFeet({value:grid.distance,unit});
  const scale=[6,2].find(value=>Math.abs(feet-value)<1e-6);
  if(!scale)throw new Error('Use 6 feet per hex for small arms or 2 feet per hex for melee (1.8288 or 0.6096 meters).');
  return {type:grid.type,size:grid.size,distance:grid.distance,unit,feetPerHex:scale};
}

export function hexRange(scene,points,measurePath) {
  const geometry=hexGeometry(scene);
  const spaces=measurePath(points).spaces;
  if(!Number.isSafeInteger(spaces)||spaces<0)throw new Error('Native hex measurement is unavailable.');
  return {range:spaces*geometry.distance,unit:geometry.unit,hexes:spaces,geometry};
}

export function defaultHexScene(scene,data) {
  const grid=data.grid??{};
  // Explicit imported or configured maps remain intact; defaults only fill omissions.
  if(grid.type!==undefined)return;
  scene.updateSource({'grid.type':2,...(grid.distance===undefined?{'grid.distance':6}:{}),...(grid.units===undefined?{'grid.units':'ft'}:{})});
}

export function registerHexScenes() {
  Hooks.on('preCreateScene',defaultHexScene);
  Hooks.on('canvasReady',canvas=>{
    try{hexGeometry(canvas.scene);}catch(error){ui.notifications.warn(error.message);}
  });
}

// Foundry v14 creates unlinked encounters; combatants retain their scene IDs.
export function encounterScene(combat,scenes,viewedScene=null){
  const ids=[...new Set(Array.from(combat.combatants??[],c=>c.sceneId??c.token?.parent?.id).filter(Boolean))];
  if(ids.length>1)throw new Error('Phoenix Command encounters require combatants on one scene. Move them to the same map before starting.');
  if(combat.scene){
    if(ids.length&&ids[0]!==combat.scene.id)throw new Error('The encounter is linked to a different scene from its combatants. Link it to their map before starting.');
    return combat.scene;
  }
  const scene=ids.length?scenes.get(ids[0]):viewedScene;
  if(!scene)throw new Error('No scene is available for this encounter. Open the combatants’ map before starting.');
  return scene;
}
