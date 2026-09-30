import {projectileKnockDown,explosiveKnockDown,knockDownLevels,knockDownSource} from '../data/knock-down.mjs';

// §5.12's four columns are Head, Body, Arm and Leg; Table 6A has thirty-nine locations. The
// reading (28 September 2026): the neck with the head; shoulders, hands and the arm rows with
// the arm; the torso rows and the pelvis with the body; the leg rows and ankle-foot with the
// leg. A Weapon Critical strikes the weapon, not the man, and knocks nothing down.
const regions={
  head:['Head Glance','Forehead','Eye - Nose','Mouth','Neck Flesh','Neck Spine'],
  arm:['Shoulder Glance','Shoulder','Arm Glance','Arm Flesh','Arm Bone','Elbow','Forearm Flesh','Forearm Bone','Hand','Upper arm','Forearm'],
  body:['Torso Glance','Base of Neck','Lung Rib','Lung','Heart','Liver - Rib','Liver','Stomach - Rib','Stomach','Stomach - Spleen','Stomach - Kidney',
    'Liver - Kidney','Liver - Spine','Intestines','Spine','Pelvis','Upper chest','Lower chest','Abdomen','Hip','Hip Socket','Shoulder Socket'],
  leg:['Leg Glance','Thigh Flesh','Thigh Bone','Knee','Shin Flesh','Shin Bone','Ankle - Foot','Thigh','Shin','Foot']};
const byLocation=new Map(Object.entries(regions).flatMap(([region,names])=>names.map(name=>[name,region])));
export const knockDownRegion=location=>byLocation.get(location)??null;

const rank=level=>level===null?0:level==='down'?4:knockDownLevels.indexOf(level)+1;
const describe=level=>level==='down'?'knocked down':`−${level} action${level===1?'':'s'}`;
// The highest row the value reaches, or null.
function read(row,value){
  let level=null;
  row.forEach((entry,index)=>{if(value>=entry)level=knockDownLevels[index];});
  return level;
}

// A bullet or pellet that hits, whatever the armor did to it (§5.12: "The armor can stop the
// projectile's penetration but may result in the target being knocked off his feet").
export function projectileKnockDownResult(knockDown,location){
  const region=knockDownRegion(location);
  if(!Number.isFinite(knockDown)||!region)return null;
  const level=read(projectileKnockDown[region],knockDown);
  return level===null?null:{level,detail:`KD ${knockDown} at the ${region} (${location}): ${describe(level)}.`};
}
// A blast, by the concussion it did to this man.
export function explosiveKnockDownResult(concussion){
  if(!Number.isFinite(concussion)||concussion<=0)return null;
  const level=read(explosiveKnockDown,concussion);
  return level===null?null:{level,detail:`Blast concussion ${concussion}: ${describe(level)}.`};
}
// Several hits in one impulse: the worst of them, not their sum (the reading, 28 September).
export function worstKnockDown(results){
  return results.filter(Boolean).reduce((worst,r)=>rank(r.level)>rank(worst?.level??null)?r:worst,null);
}
export const describeKnockDown=describe;
export {knockDownSource};
