// LEG10204 Character Generation Tables (2), PDF 44 / printed 40. Visual transcription from a
// 300 dpi render of the user-supplied PDF, 26 September 2026.
//
// Only the Damage Bonus half of Table 2D is new data. Checked cell by cell against the LEG10200
// tables already transcribed here: Table 2A (Base Speed) and 2B (Maximum Speed) print the same
// values as LEG10200 Tables 1A and 1B; Table 2C's Combat Effectiveness for skills 0-16 equals
// LEG10200 Table 1C's Skill Accuracy Level; Table 2D's Combat Actions for MS 1-11 equal all 187
// cells of LEG10200 Table 1D (with ASF in place of ISF); Table 2E equals Table 1E for CA 1-17.
// Those tables are therefore reused rather than copied.
export const handToHandTableSource=Object.freeze({book:'LEG10204',pdfPage:44,printedPage:40,tables:['2A','2B','2C','2D','2E'],
  status:'visual-transcription',checkedOn:'2026-09-26'});

// Table 2D columns are the Agility Skill Factor (ASF = AGI + CE); rows are Maximum Speed 1-11.
export const asfColumns=Object.freeze([7,9,11,13,15,17,19,21,23,25,27,29,31,33,35,37,39]);

// Table 2D, the lower number in each cell: the Damage Bonus.
export const damageBonusTable=Object.freeze({
  1:[.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5],
  2:[.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,.5,1],
  3:[.5,.5,.5,.5,.5,.5,1,1,1,1,1,1,1,1,1,1,1],
  4:[.5,.5,1,1,1,1,1,1,1,1,1,1.5,1.5,1.5,1.5,1.5,2],
  5:[.5,1,1,1,1,1,1.5,1.5,1.5,1.5,2,2,2,2.5,2.5,2.5,2.5],
  6:[1,1,1,1.5,1.5,1.5,2,2,2,2.5,2.5,3,3,3,3.5,3.5,4],
  7:[1,1,1.5,1.5,2,2,2.5,2.5,3,3,3.5,3.5,4,4,4.5,4.5,5],
  8:[1,1.5,2,2,2.5,2.5,3,3.5,3.5,4,4.5,4.5,5,5.5,5.5,6,6.5],
  9:[1.5,2,2,2.5,3,3.5,4,4,4.5,5,5.5,6,6,6.5,7,7.5,8],
  10:[2,2,2.5,3,3.5,4,4.5,5,5.5,6,6.5,7,7.5,8,8.5,9,9.5],
  11:[2,2.5,3,3.5,4.5,5,5.5,6,6.5,7.5,8,8.5,9,9.5,10,11,12]
});
