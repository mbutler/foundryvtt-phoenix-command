// Flange Hit Location and Damage, LEG10204 Table 5C, PDF 49.
//
// The location ranges match the cutting table and partition 00–99. The five BPF lines
// are 0, 1, 2, 3 and 3+. The 3+ line's last heading is printed in a box as 01, after
// 97. Read as 101: a boxed heading is one hundred plus the two digits in the box,
// which is the only reading that keeps the columns in order (D42). A short damage
// row goes blank; past that cell the last printed PD is the value. The shading is
// transcribed (D60): eight of the twelve locations are shaded from some column onward,
// and a flange blow landing there disables the part it struck.

export const flangeSource = 'LEG10204 Table 5C, PDF 49; visual transcription, shading measured';

const scale = { '': 1, H: 100, K: 1000, T: 10000, X: 100000 };
function parse(text) {
  return text.split(' ').map(value => {
    const match = /^(\d+)([HKTX]?)$/.exec(value);
    return Number(match[1]) * scale[match[2]];
  });
}
// `disablingAt` is the zero-based column from which this location's cells are shaded.
// LEG10204 §3.8: "If the damage from a Strike is in a shaded area of the Damage Table, then
// the limb in question has been Disabled." Null where the row is shaded nowhere. Measured
// off the page rather than read by eye (D60); every shaded row's shading is a suffix.
const row = (id, label, region, left, right, damage, disablingAt = null) => ({
  id, label, region, left, right, damage: parse(damage), disablingAt
});

export const flangeLocations = [
  row('head', 'Head', 'head', [0, 31], null, '1 32 98 2H 4H 7H 1K 1K 2K 3K 3K 4K 5K 6K 8K 9K'),
  row('neck', 'Neck', 'neck', [32, 32], null, '2 6 12 18 26 38 47 70 84 90 1H 1H 1H 1H 2H 2H 2H 2H 3H 3H 3H 3H 4H 4H 5H 6H', 23),
  row('shoulder', 'Shoulder', 'arm', [33, 44], [45, 49], '1 2 3 4 9 11 17 22 27 40 55 72 86 1H 1H 1H 2H 2H 2H 2H 3H 3H 4H 4H 4H 5H', 4),
  row('upperChest', 'Upper Chest', 'torso', [50, 50], null, '1 2 3 7 13 20 30 45 56 69 90 1H 1H 2H 2H 3H 4H 5H 5H 5H 7H 8H 9H 9H 1K'),
  row('lowerChest', 'Lower Chest', 'torso', [51, 52], null, '1 2 3 7 13 20 30 45 54 64 82 1H 1H 1H 2H 2H 2H 3H 3H 3H 4H 5H 5H 6H 7H'),
  row('abdomen', 'Abdomen', 'torso', [53, 54], null, '2 6 12 18 27 42 51 81 99 1H 2H 2H 2H 3H 3H 4H 4H 5H 6H 6H'),
  row('hip', 'Hip', 'torso', [55, 59], null, '2 6 9 14 17 20 23 27 41 57 81 99 1H 1H 2H 2H 3H 3H 4H 4H 5H 5H 6H 7H', 7),
  row('upperArm', 'Upper Arm', 'arm', [60, 63], [64, 69], '2 4 7 12 15 21 25 29 37 46 55 76 97 1H', 7),
  row('forearm', 'Forearm', 'arm', [70, 72], [73, 76], '2 6 9 15 18 29 36 46 52 60', 7),
  row('hand', 'Hand', 'arm', [77, 79], [80, 82], '1 2 5 8 13 15', 1),
  row('thigh', 'Thigh', 'leg', [83, 88], [89, 94], '2 6 12 18 28 34 51 61 83 1H 1H 1H 2H 2H 2H 3H 3H 3H 4H 4H 4H', 4),
  row('shin', 'Shin', 'leg', [95, 98], [99, 99], '1 3 5 7 13 20 32 38 55 67 80 1H 1H 1H 2H', 4)
];

export const flangeThresholds = {
  '0': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  '1': [2, 4, 5, 7, 8, 10, 11, 13, 14, 16, 17, 18, 20, 21, 22, 24, 26, 27, 29, 30, 31, 33, 34, 35, 37, 38],
  '2': [3, 5, 6, 9, 11, 13, 15, 18, 20, 21, 23, 25, 27, 28, 29, 32, 34, 36, 38, 39, 41, 43, 44, 46, 49, 51],
  '3': [4, 7, 9, 13, 17, 20, 24, 28, 30, 32, 35, 38, 41, 42, 44, 47, 51, 54, 57, 59, 61, 65, 67, 69, 73, 76],
  '3+': [6, 9, 12, 17, 23, 27, 34, 37, 40, 43, 47, 50, 54, 56, 59, 63, 67, 71, 76, 78, 81, 86, 88, 91, 97, 101]
};
