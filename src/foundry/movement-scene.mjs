import {movementModifiers} from '../data/movement.mjs';

export const scope='phoenix-command';
export const movementTerrainSource='Table 7A terrain groups recorded on Foundry Region documents';

const groups=['slope','cover','water'];

export function readMovementTerrain(document){
  const raw=document?.getFlag?.(scope,'movementTerrain')??null;
  if(!raw||typeof raw!=='object')return null;
  const terrain={};
  for(const group of groups){
    const value=raw[group];
    if(value===undefined||value==='none')continue;
    if(!(value in movementModifiers[group]))throw new Error(`Region terrain "${group}" is not a Table 7A row.`);
    terrain[group]=value;
  }
  const misc=Array.isArray(raw.miscellaneous)?raw.miscellaneous.filter(key=>key in movementModifiers.miscellaneous):[];
  if(misc.length)terrain.miscellaneous=misc;
  return Object.keys(terrain).length?terrain:null;
}

export function writeMovementTerrain(document,terrain){
  return terrain===null
    ?document.unsetFlag(scope,'movementTerrain')
    :document.update({[`flags.${scope}.movementTerrain`]:foundry.data.operators.ForcedReplacement.create(terrain)});
}

export function sceneMovementTerrain(scene,point){
  for(const region of scene?.regions??[]){
    try{
      const terrain=readMovementTerrain(region);
      if(!terrain)continue;
      if(region.testPoint({x:point.x,y:point.y,elevation:region.elevation?.bottom??0}))
        return {...terrain,regionId:region.id,regionName:region.name??'',source:'scene'};
    }catch{/* a broken annotation is ignored until the GM fixes the region */}
  }
  return null;
}

// Scene terrain is authoritative when present. An owner never states it; the coordinator
// merges it into the step before quoting Table 7A.
export function mergeSceneTerrain(step,{scene,point}){
  const recorded=sceneMovementTerrain(scene,point);
  if(!recorded)return {step,sceneTerrain:null};
  const merged={...step};
  for(const group of groups)if(recorded[group])merged[group]=recorded[group];
  if(recorded.miscellaneous?.length)merged.miscellaneous=[...(merged.miscellaneous??[]),...recorded.miscellaneous];
  return {step:merged,sceneTerrain:recorded};
}
