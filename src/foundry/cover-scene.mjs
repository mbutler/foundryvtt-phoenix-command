import {coverOnLine} from '../rules/cover-line.mjs';
import {coverProtectionFactor} from '../data/cover.mjs';

// Reading §3.8's cover off a Foundry scene.
//
// The central fact, and the reason this is an annotation rather than a detection: **Foundry
// knows geometry, not materials.** A Wall document carries `c` (two endpoints), `move`,
// `sight`, `light`, `sound`, `door`, `ds` and `dir` — restriction types and a door state.
// It has no material and no thickness, and Table 7C is indexed by exactly those two things.
// A Region carries shapes and an elevation and no material either. So no amount of looking
// at a scene can produce a Protection Factor.
//
// What a scene CAN do is carry the answer. Whoever builds the map says once, per wall or
// region, which Table 7C row it is; from then on a shot reads it instead of asking. That is
// the difference this increment makes: not that cover is discovered, but that it stops being
// restated on every shot.
export const scope='phoenix-command';
export const coverSceneSource='LEG10200 §3.8 PDF 37, Table 7C PDF 67; recorded on Foundry Wall and Region documents';

// A scene declares that it has been marked up. Without this, "the line of fire crosses no
// recorded cover" would mean "he is standing in the open" — a claim about the map that
// nobody made, and the one that flatters the shooter. Same shape as the hex contract: the
// scene states what it is rather than being guessed at.
export const sceneCoverMapped=scene=>scene?.getFlag(scope,'coverMapped')===true;
export const setSceneCoverMapped=(scene,mapped)=>scene.setFlag(scope,'coverMapped',!!mapped);

// What is written on a wall or region: exactly the choice `coverProtectionFactor` takes, so
// the Table 7C provenance is rebuilt from the annotation rather than stored as a bare number
// that could drift from the table.
export function readCoverAnnotation(document){
  const choice=document?.getFlag?.(scope,'cover')??null;
  if(!choice)return null;
  try{return {...coverProtectionFactor(choice),choice};}
  catch(error){
    // A wall annotated with something Table 7C no longer prints is a map problem, not a shot
    // problem, and it must not silently become "no cover".
    return {invalid:true,reason:error.message,choice};
  }
}
// `setFlag` MERGES into whatever is already there, so re-marking a wall that was brick as
// twelve inches of concrete would leave `{id:'wall-brick-6', material:'concrete', inches:12}`
// - and `coverProtectionFactor` reads the id first, so the wall would silently stay brick.
// `ForcedReplacement` replaces the annotation outright. The native run caught this.
export const writeCoverAnnotation=(document,choice)=>choice===null
  ?document.unsetFlag(scope,'cover')
  :document.update({[`flags.${scope}.cover`]:foundry.data.operators.ForcedReplacement.create(choice)});

// A closed door is a wall; an open one is a doorway. Foundry's door states are
// 0 closed, 1 open, 2 locked.
const doorIsOpen=wall=>wall.door!==0&&wall.ds===1;

// Ruled at this table: a wall's `dir` is ignored for cover. Foundry's one-way walls restrict
// sight or movement from a single side, which is a vision concept; a bullet does not care
// which side of a brick wall it started on. A directional wall is therefore cover from both
// sides, and the ruling is recorded here rather than left to be rediscovered.
export const directionIgnored='Foundry one-way walls restrict sight or movement from one side. A round does not, so a wall is cover from either side.';

export function sceneCoverBarriers(scene){
  const barriers=[],problems=[];
  for(const wall of scene?.walls??[]){
    const annotation=readCoverAnnotation(wall);
    if(!annotation)continue;
    if(annotation.invalid){problems.push({id:wall.id,kind:'wall',reason:annotation.reason});continue;}
    if(doorIsOpen(wall)){problems.push({id:wall.id,kind:'wall',reason:`${annotation.label} is an open door, so it is a doorway rather than cover.`,open:true});continue;}
    const [x0,y0,x1,y1]=wall.c;
    barriers.push({id:wall.id,label:annotation.label,pf:annotation.pf,basis:annotation.basis,
      a:{x:x0,y:y0},b:{x:x1,y:y1}});
  }
  return {barriers,problems};
}

export function sceneCoverAreas(scene){
  const areas=[],problems=[];
  for(const region of scene?.regions??[]){
    const annotation=readCoverAnnotation(region);
    if(!annotation)continue;
    if(annotation.invalid){problems.push({id:region.id,kind:'region',reason:annotation.reason});continue;}
    areas.push({id:region.id,label:`${region.name||annotation.label} (${annotation.label})`,
      pf:annotation.pf,basis:annotation.basis,
      // `RegionDocument.testPoint` is Foundry's own containment test, shapes, holes and all.
      // Elevation is passed as the region's own floor so a flat scene tests as flat; this
      // system refuses movement between elevations anyway.
      contains:p=>region.testPoint({x:p.x,y:p.y,elevation:region.elevation?.bottom??0})});
  }
  return {areas,problems};
}

// What the scene says about one shot. `from` and `to` are the two Tokens' centres, which is
// the same pair of points the range measurement uses.
export function sceneCover(scene,from,to){
  const mapped=sceneCoverMapped(scene);
  const {barriers,problems:wallProblems}=mapped?sceneCoverBarriers(scene):{barriers:[],problems:[]};
  const {areas,problems:regionProblems}=mapped?sceneCoverAreas(scene):{areas:[],problems:[]};
  const problems=[...wallProblems,...regionProblems];
  const reading=coverOnLine({mapped,from,to,barriers,areas});
  // A broken annotation is never allowed to read as open ground. An open door is not broken,
  // so it only appears as a note.
  const broken=problems.filter(problem=>!problem.open);
  if(broken.length)return {...reading,cover:null,ambiguous:true,problems,
    detail:`This scene has cover recorded that cannot be priced: ${broken.map(p=>p.reason).join(' ')} Fix the map or state this shot's cover.`,
    source:coverSceneSource};
  return {...reading,problems,source:coverSceneSource};
}
