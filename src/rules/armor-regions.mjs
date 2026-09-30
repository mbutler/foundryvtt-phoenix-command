// Catalog piece names used by older saved Items. Normalize on read so existing
// characters work without a migration; do not broaden anatomical coverage.
export const armorRegion = region => region==='body'?'torso':region==='visor'?'face':region;
export const armorHasSides = region => ['shoulder','arm','hand','leg','foot'].includes(armorRegion(region));
export const validArmorSide = (region,side) => armorHasSides(region) ? ['left','right','both'].includes(side) : ['center','both'].includes(side);

// Table 6A's hit locations as the armor regions they may be (user ruling, 27 September 2026).
// The table names no side, and a few rows sit on a boundary (Base of Neck, Ankle - Foot), so a
// location lists every region it may be; protection is read automatically only when every
// region and side it could be gives the same answer. A Weapon Critical strikes the weapon, not
// the body, and is left to the GM.
const firearmRegions={
  'Head Glance':['head'],Forehead:['head'],'Eye - Nose':['face'],Mouth:['face'],
  'Neck Flesh':['neck'],'Neck Spine':['neck'],'Base of Neck':['neck','torso'],
  'Shoulder Glance':['shoulder'],Shoulder:['shoulder'],
  'Arm Glance':['arm'],'Arm Flesh':['arm'],'Arm Bone':['arm'],Elbow:['arm'],'Forearm Flesh':['arm'],'Forearm Bone':['arm'],
  Hand:['hand'],
  'Torso Glance':['torso'],'Lung Rib':['torso'],Lung:['torso'],Heart:['torso'],'Liver - Rib':['torso'],Liver:['torso'],
  'Stomach - Rib':['torso'],Stomach:['torso'],'Stomach - Spleen':['torso'],'Stomach - Kidney':['torso'],
  'Liver - Kidney':['torso'],'Liver - Spine':['torso'],Intestines:['torso'],Spine:['torso'],
  Pelvis:['pelvis'],
  'Leg Glance':['leg'],'Thigh Flesh':['leg'],'Thigh Bone':['leg'],Knee:['leg'],'Shin Flesh':['leg'],'Shin Bone':['leg'],
  'Ankle - Foot':['leg','foot']
};
export const firearmLocationRegions = location => firearmRegions[location] ?? [];
