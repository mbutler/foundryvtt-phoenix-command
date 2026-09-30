// Stabbing Hit Location and Damage, LEG10204 Table 5B, PDF 48.
//
// The location ranges were read off that page and partition 00–99. Every location's
// unarmored damage is transcribed. The NO headings are 1 through 26. A short row goes
// blank, and past that cell the last printed PD stands. Intestines prints a second 5H
// and then nothing; the old bound at 9 was the edge of an incomplete row (D43).
// Impact 3 there is 75 and impact 6 is 300, which is §5.19. All five Armor Class
// heading rows are transcribed (D58), and so is the shading (D59): fourteen of the
// twenty-four locations are shaded from some column onward, and a stab landing there
// disables the part it struck.

export const stabbingSource = 'LEG10204 Table 5B, PDF 48; all five armor lines and the shading, visual and measured';

const scale = { '': 1, H: 100, K: 1000, T: 10000, X: 100000 };
function parse(text) {
  return text.split(' ').map(value => {
    const match = /^(\d+)([HKTX]?)$/.exec(value);
    return Number(match[1]) * scale[match[2]];
  });
}
// `disablingAt` is the zero-based column from which this location's cells are shaded.
// LEG10204 §3.8: "If the damage from a Strike is in a shaded area of the Damage Table, then
// the limb in question has been Disabled. It cannot be used for the remainder of the battle."
// Null where the row is shaded nowhere. Every shaded row's shading is a suffix - once it
// starts it runs to the end of the printed cells - which the measurement below asserted.
const row = (id, label, region, left, right, damage, disablingAt = null) => ({
  id, label, region, left, right, damage: parse(damage), disablingAt
});

export const stabbingLocations = [
  row('forehead','Forehead','head',[0,5],null,'80 2H 4H 1K 2K 4K 6K 8K 1T 2T 2T 2T 3T 3T 3T 4T 4T'),
  row('eye','Eye','head',[6,7],null,'61 2H 4H 1K 2K 4K 6K 8K 1T 1T 2T 2T 2T 3T 3T'),
  row('mouth','Mouth','head',[8,14],null,'2 4 20 31 41 51 2H 1K 1K 5K 5K 5K 5K 5K 5K 6K 6K 6K 7K 7K 7K 7K',7),
  row('neck','Neck','neck',[15,17],null,'25 67 1H 2H 1K 3K 4K 4K 4K 5K 5K 6K 6K 6K 6K 6K 7K 7K 7K 8K 8K',4),
  row('baseOfNeck','Base of Neck','neck',[18,19],null,'3 13 21 32 38 50 1H 6H 4K 4K 5K 6K 6K 6K 6K 6K 6K 6K 7K 7K 7K 7K 8K'),
  row('shoulderSocket','Shoulder Socket','arm',[20,20],[21,21],'1 1 2 3 4 5 6 9 11 13 15 17 20 23 26 29 32 35 38 41 44 48 51 54 65 82',7),
  row('shoulderScapula','Shoulder Scapula','arm',[22,23],[24,25],'5 11 22 38 53 72 87 1H 1H 1H',4),
  row('lung','Lung','torso',[26,30],null,'1 1 5 28 4H 5H 5H 9H 1K 1K'),
  row('heart','Heart','torso',[31,32],null,'3K 5K 8K 1T 1T 1T 2T 2T 3T 3T 4T 4T 4T 4T 5T 5T 5T 5T 6T 6T 7T 7T 7T 7T',8),
  row('liver','Liver','torso',[33,34],null,'1 1 9 72 2H 4H 7H 9H 9H 1K 2K 2K 2K 2K'),
  row('stomach','Stomach','torso',[35,35],null,'1 1 6 27 52 1H 2H 2H 2H 3H 4H 5H 6H 6H'),
  row('stomachKidney','Stomach-Kidney','torso',[36,38],null,'1 1 6 33 36 3H 5H 7H 8H 1K 2K 3K 3K 3K'),
  row('liverSpine','Liver-Spine','torso',[39,40],null,'14 65 1H 1H 2H 6H 2K 4K 5K 7K 7K 7K 7K 7K 7K 7K 7K 9K 9K 1T 1T 1T 1T 1T',5),
  row('liverKidney','Liver-Kidney','torso',[41,42],null,'1 1 6 72 2H 5H 9H 1K 1K 2K 2K 3K 4K 4K'),
  row('intestines','Intestines','torso',[43,46],null,'12 33 75 1H 2H 3H 4H 5H 5H'),
  row('spine','Spine','torso',[47,47],null,'12 33 40 48 55 66 2K 3K 4K 5K 5K 5K 5K 5K 6K 6K 6K 6K 7K 7K 7K 7K 7K',6),
  row('intestinesPelvis','Intestines-Pelvis','torso',[48,54],null,'10 33 81 1H 2H 2H 3H 3H 4H 4H 5H 5H'),
  row('hipSocket','Hip Socket','torso',[55,58],null,'1 1 2 3 4 6 7 8 9 11 14 17 20 23 26 29 32 36 40 44 48 52 56 60 63 86',7),
  row('upperArm','Upper Arm','arm',[59,62],[63,66],'2 3 4 5 7 12 24 41 61 85 1H',3),
  row('forearm','Forearm','arm',[67,70],[71,74],'1 2 2 8 16 31 49 70 92',2),
  row('hand','Hand','arm',[75,75],[76,76],'2 5 12 17',1),
  row('thigh','Thigh','leg',[77,83],[84,90],'5 6 8 12 15 18 21 24 28 32 36 40 44 48 52 69 98 1H 2H 2H 3H 3H 3H',7),
  row('shin','Shin','leg',[91,92],[93,95],'1 1 1 2 2 3 5 6 7 7 8 11 13 17 21 25 29 33 37 41 45 50 55 60 65 92',10),
  row('foot','Foot','leg',[96,97],[98,99],'1 3 5 8 14 18 25 36 45',1)
];

// All five Armor Class heading rows, 26 columns each, read off the same render (D58). The
// damage grid below is shared: an armor class does not change what a column does, it changes
// which column an Impact Damage lands in. Unarmored runs 1 through 26 one for one; the
// heavier the armour, the more ID it takes to reach the same column, so plate needs 6 before
// the first column does anything at all and an ID of 5 against it is no damage.
//
// There is no exclusive sentinel: an ID past the last cell a row prints keeps that cell, and
// an ID above the last heading reads the last column. Unlike the cutting table, none of these
// rows carries a boxed high-impact continuation, so all 26 are usable as printed.
export const stabbingThresholds = {
  NO: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  LT: [2, 3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28],
  ML: [3, 4, 5, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29],
  BR: [4, 5, 7, 9, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32],
  PL: [6, 7, 9, 12, 13, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35]
};
