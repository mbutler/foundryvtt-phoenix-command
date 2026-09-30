import {bodyHitLocations_5D} from '../data/explosive-tables.mjs';
import {legacyFirearm} from '../data/legacy-firearm.mjs';

// §3.2, PDF 28: Head uses Fire 00–32; Legs uses Open 57–99;
// Body uses Table 5D. Retain the original cover properties for penetration.
export function calledShotCover(cover,targetSize){
  if(!['Head','Body','Legs'].includes(targetSize))return cover;
  if(cover.blocking&&targetSize!=='Head')throw new Error('The body and legs are hidden by blocking cover. Choose an exposed target.');
  if(targetSize==='Head')return {...cover,calledShot:'Head',column:'Fire',rollMin:0,rollMax:cover.blocking&&cover.stance==='looking-over'?22:32};
  return {...cover,calledShot:targetSize,column:'Open',rollMin:targetSize==='Legs'?57:0,rollMax:99};
}
export function locationRollFormula(cover){
  const min=cover?.rollMin??0,max=cover?.rollMax??99;
  return min===0?`1d${max+1} - 1`:`1d${max-min+1} + ${min-1}`;
}
export function firearmLocationRow(cover,value){
  const min=cover.rollMin??0,max=cover.rollMax??99;
  if(!Number.isInteger(value)||value<min||value>max)throw new Error(`Location roll must be ${min}–${max}.`);
  const rows=legacyFirearm.hitLocationDamage_6A['DC 1'];
  if(cover.calledShot==='Body'){
    const body=bodyHitLocations_5D.find(row=>value>=row.from&&value<=row.to);
    // 5D's more specific names have no separate 6A damage rows. Resolve on the
    // corresponding 6A anatomical region, preserving the 5D name for the trace.
    const aliases={'Shoulder Socket':'Shoulder','Hip Socket':'Pelvis','Lung - Rib':'Lung Rib'};
    const name=aliases[body.location]??body.location;
    return {row:rows.find(row=>row['Hit Location']===name),specificLocation:body.location};
  }
  return {row:rows.find(row=>Array.isArray(row[cover.column])&&value>=row[cover.column][0]&&value<row[cover.column][1]),specificLocation:null};
}
