// Table 6A's shading and Table 6C, LEG10200 PDF 65 (DC 1-4) and PDF 66 (DC 5-10).
//
// §3.3, PDF 24: "A Disabling Injury to the limbs or spine occurs whenever the damage enters
// a shaded portion of Table 6A." Key 6C says it plainly: "The shaded portions of the table
// indicate Disabling Injuries." The shading is what defines a disabling injury, and it was
// missing from the ported damage table entirely - see docs/decisions.md.
//
// Each shaded row's shading is contiguous to the right within every Damage Class block, so
// it reduces to one Effective Penetration threshold per (hit location, DC): the first EPEN
// column at which that row is shaded. Rows absent from this table are shaded nowhere.
//
// Transcribed by measuring the scan's cell backgrounds rather than by eye: the two shading
// levels are far apart on both pages, every row came out right-contiguous without being
// made so, and twenty rows read by eye agreed with the measurement. See runtime verification.
export const disablingSource=Object.freeze({book:'LEG10200',pdfPages:Object.freeze([65,66]),
  table:'6A shading',revision:1,status:'measured-from-scan'});
const thresholds=map=>Object.freeze(map);
export const disablingThresholds=Object.freeze({
  'Mouth':thresholds({1:2,2:2,3:2,4:2,5:2,6:2,7:2,8:3,9:3,10:3}),
  'Neck Spine':thresholds({1:1.5,2:1.5,3:1.5,4:2,5:2,6:2,7:2,8:3,9:3,10:3}),
  'Shoulder':thresholds({2:1.5,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Arm Flesh':thresholds({3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Arm Bone':thresholds({1:1.5,2:1.5,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Elbow':thresholds({1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Forearm Flesh':thresholds({3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Forearm Bone':thresholds({1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Hand':thresholds({3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Base of Neck':thresholds({1:2,2:2,3:2,4:2,5:2,6:2,7:2,8:3,9:3,10:3}),
  'Heart':thresholds({1:2,2:2,3:2,4:2,5:2,6:2,7:2,8:3,9:3,10:3}),
  'Liver - Spine':thresholds({1:1.5,2:1.5,3:1.5,4:2,5:2,6:2,7:2,8:3,9:3,10:3}),
  'Spine':thresholds({1:1.5,2:1.5,3:1.5,4:2,5:2,6:2,7:2,8:3,9:3,10:3}),
  'Thigh Flesh':thresholds({2:1.5,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Thigh Bone':thresholds({1:2,2:2,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Knee':thresholds({1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Shin Flesh':thresholds({4:1,5:1,6:1,7:1,8:1,9:1,10:1}),
  'Shin Bone':thresholds({1:1.5,2:1.5,3:1.5,4:2,5:2,6:1,7:1,8:1,9:1,10:1}),
  'Ankle - Foot':thresholds({1:1,2:1,3:1,4:1,5:1,6:1,7:1,8:1,9:1,10:1})
});

// Table 6C, PDF 65. "the following Shock Points (SP) are added to the PD of wounds in the
// shaded portions of the table when making the Knockout Roll. These Shock Points are not
// added to the PD Total." §3.3 adds that the shock is effective only in the impulse it is
// inflicted.
//
// 6C lists eight body groups; mapping each to the table's hit-location rows is ours, not the
// book's, and is recorded as such. Mouth and Heart are shaded but appear in no group, so no
// shock applies to them - that is the table's own shape, not an omission here.
export const shockSource=Object.freeze({book:'LEG10200',pdfPage:65,table:'6C',revision:1,status:'visual-transcription'});
export const shockPoints=Object.freeze({
  'Neck Spine':400,'Base of Neck':400,'Spine':400,'Liver - Spine':400,
  'Shoulder':10,'Arm Flesh':20,'Arm Bone':20,'Elbow':20,'Forearm Flesh':20,'Forearm Bone':20,'Hand':10,
  'Thigh Flesh':80,'Thigh Bone':80,'Knee':50,'Shin Flesh':50,'Shin Bone':50,'Ankle - Foot':20
});
