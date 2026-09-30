// LEG10204 PDF pp. 46,48. Cutting Table 5A: all five armor lines and all 26 ID columns.
// This file contains cutting damage only. Defensive skill 3 lives in melee-odds.mjs
// with the other Table 4 charts and is re-exported here for older imports.
export const meleeSource = 'LEG10204 tables 4/5A, PDF pp.46/48; visual transcription v2, all 26 columns';
export { defense3 } from './melee-odds.mjs';

// All 26 ID columns, visual transcription at 300 dpi (26 Sep 2026). The boxed headings on the
// PL and BR lines print only the last two digits past 100: PL 01 09 17 25 33 41 57 are 101 to
// 157, BR 04 16 are 104 and 116. §3.7: an ID between two headings reads the lower one, and an ID
// past the last heading reads the last column.
export const cuttingThresholds = {
  NO: [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,22,24,26,28,30,34],
  LT: [3,4,5,7,11,13,15,17,19,21,23,24,26,28,30,31,33,35,37,38,42,45,49,52,56,63],
  ML: [4,7,10,13,17,19,20,23,25,27,29,31,33,35,37,39,41,43,45,47,51,55,59,63,67,75],
  BR: [5,9,13,16,20,25,30,35,41,44,47,50,53,56,59,62,65,68,71,74,80,86,92,98,104,116],
  PL: [11,21,33,37,41,45,49,53,57,61,65,69,73,77,81,85,89,93,97,101,109,117,125,133,141,157]
};
// Short rows stop where the page stops printing (upper arm, forearm, hand): §3.7, the last
// value stands and the limb is severed. Shading starts at a zero-based column index, measured
// off an 8-bit raster of PDF 48 (shaded cells ~160, white ~250), every one a suffix.
const row = (id, label, region, left, right, damage, disablingAt = null) => ({
  id, label, region, left, right, damage: damage.split(' ').map(value => {
    const match = /^(\d+)([HKTX]?)$/.exec(value);
    return Number(match[1]) * ({ '': 1, H: 100, K: 1000, T: 10000, X: 100000 }[match[2]]);
  }), disablingAt
});
export const cuttingLocations = [
  row('head','Head','head',[0,31],null,'1 1 29 90 4H 8H 2K 3K 5K 7K 9K 1T 1T 2T 2T 2T 3T 3T 4T 4T 5T 7T 9T 1X 1X 2X'),
  row('neck','Neck','neck',[32,32],null,'3 1K 1K 1K 1K 2K 2K 2K 2K 2K 2K 2K 2K 2K 2K 2K 3K 3K 6K 1T 1T 2T 2T 2T 3T 3T',17),
  row('shoulder','Shoulder','arm',[33,44],[45,49],'1 1 4 7 13 17 23 28 34 52 76 1H 1H 1H 2H 2H 2H 3H 3H 4H 5H 6H 3K 4K 4K 5K',3),
  row('upperChest','Upper chest','torso',[50,50],null,'3 3 3 5 20 40 65 1H 2H 3H 4H 6H 9H 1K 1K 2K 2K 2K 3K 3K 4K 5K 6K 7K 2T 5T',18),
  row('lowerChest','Lower chest','torso',[51,52],null,'3 3 3 5 18 25 36 52 80 1H 2H 4H 8H 9H 1T 1T 1T 2T 2T 3T 4T 4T 5T 7T 9T 1X'),
  row('abdomen','Abdomen','torso',[53,54],null,'2 8 25 52 71 1H 2H 3H 4H 5H 6H 7H 1K 1K 1K 2K 2K 2K 2K 2K 2K 3K 3K 3K 4K 9K'),
  row('hip','Hip','torso',[55,59],null,'1 2 3 5 15 22 29 43 54 66 89 1H 1H 2H 3H 3H 4H 5H 5H 6H 9H 1K 1K 2K 2K 2K',13),
  row('upperArm','Upper arm','arm',[60,63],[64,69],'3 4 6 11 16 19 23 40 57 77 1H 1K 2K 2K 2K 2K 2K 2K',2),
  row('forearm','Forearm','arm',[70,72],[73,76],'3 8 13 15 19 28 42 69 91 4H 8H 9H 1K 1K 1K 1K',1),
  row('hand','Hand','arm',[77,79],[80,82],'1 3 6 15 26 42 64 93 1H 2H 2H',1),
  row('thigh','Thigh','leg',[83,88],[89,94],'2 6 13 35 52 72 98 1H 2H 2H 2H 3H 3H 3H 3H 3H 4H 4H 5H 5H 5H 6H 6H 7H 8H 3K',3),
  row('shin','Shin','leg',[95,98],[99,99],'2 4 6 10 22 31 55 69 86 1H 2H 3H 4H 5H 5H 5H 5H 6H 6H 6H 7H 7H 8H 2K 2K 2K',1),
];
