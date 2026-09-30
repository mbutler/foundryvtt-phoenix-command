import {blastModifiers_5B} from '../data/explosive-tables.mjs';
import {legacyFirearm} from '../data/legacy-firearm.mjs';
import {targetSizeRow} from './cover.mjs';

// Environmental choices belong to the blast review. Posture comes from the current
// actor, including when a timed fuse expires. Old solidCoverIds reviews still work.
export function blastSituation({posture,modifiers,solidCover=false,targetSize=null,applyTargetSize=false}){
  const selected=modifiers??(solidCover?['Behind Solid Cover']:['In the Open']);
  if(!Array.isArray(selected)||!selected.length)throw new Error('Choose a blast situation.');
  const names=[...new Set(selected)];
  if(names.some(name=>!blastModifiers_5B.some(row=>row.name===name)))throw new Error('Unknown Table 5B blast modifier.');
  // The review stores environmental modifiers; saved legacy Prone entries are also
  // refreshed from the actor so standing up before detonation actually matters.
  const current=names.filter(name=>name!=='Prone');
  if(posture==='prone')current.push('Prone');
  if(!current.length)current.push('In the Open');
  let targetSizeAlm=null;
  if(applyTargetSize){
    const row=targetSize??targetSizeRow({behindCover:false,targetPosture:posture}).row;
    const entry=legacyFirearm.standardTargetSizeModifiers_4E.find(r=>r.Position===row);
    if(!entry)throw new Error('Choose a printed target size for shrapnel.');
    targetSizeAlm=entry['Target Size'];
  }
  return {blastModifiers:current,targetSizeAlm};
}
