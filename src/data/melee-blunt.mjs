// Blunt Hit Location and Damage, LEG10204 Table 5D, PDF 49.
//
// The location ranges were read off that page. They partition 00–95. Rolls 96–99
// are not printed; there is no foot row to invent. Every location's damage is
// transcribed. A short row goes blank, and past that cell the last printed PD
// stands. The BPF lines are complete. BPF 1 prints 3 in the first two columns;
// an ID of exactly 3 reads the left one. The 3+ line's boxed headings, from 06
// after 99 through 98, are one hundred plus the printed digits (D42). The shading
// is transcribed (D60): seven of the seventeen locations are shaded from some column
// onward, and a blunt blow landing there disables the part it struck.

export const bluntSource = 'LEG10204 Table 5D, PDF 49; visual transcription, shading measured';

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
const row = (id, label, region, left, right, damage = null, disablingAt = null) => ({
  id, label, region, left, right, damage: damage ? parse(damage) : null, disablingAt
});

export const bluntLocations = [
  row('head', 'Head', 'head', [0, 5], null, '1 2 4 34 2H 4H 7H 1K 2K 2K 3K 4K 5K 6K 7K 8K 9K 1T 1T 2T 2T 2T 2T 3T 3T 3T'),
  row('face', 'Face', 'head', [6, 7], null, '2 4 8 70 1H 3H 5H 8H 1K 2K 3K 4K 5K 6K 7K 8K 9K 1T 1T 2T 2T 2T 2T 3T 3T 3T'),
  row('jawMouth', 'Jaw-Mouth', 'head', [8, 14], null, '2 4 8 63 95 1H 2H 3H 5H 7H 9H 1K 2K 2K 3K 4K 5K 6K 7K 8K 9K 1T 1T 2T 2T 2T'),
  row('neck', 'Neck', 'neck', [15, 15], null, '3 12 45 1H 2H 3H 4H 4H 4H 4H 4H 5H 5H 5H 5H 5H 6H 6H 6H 6H 6H 7H 7H 8H 8H 1K'),
  row('baseOfNeck', 'Base of Neck', 'neck', [16, 17], null, '1 2 3 8 14 39 78 1H 2H 3H 4H 4H 4H 4H 4H 5H 5H 5H 5H 5H 6H 6H 6H 6H 6H 7H'),
  row('shoulder', 'Shoulder', 'arm', [18, 19], [20, 21], '1 2 3 4 5 6 7 9 12 15 18 22 25 28 31 34 37 41 44 47 51 54 54 64 64 69', 7),
  row('upperChest', 'Upper Chest', 'torso', [22, 30], null, '1 2 3 6 11 18 27 37 49 61 76 1H 1H 2H 2H 3H 3H 4H 4H 5H 6H 7H 7H 1K 1K 1K'),
  row('heart', 'Heart', 'torso', [31, 32], null, '1 2 3 10 28 76 1H 3H 9H 1K 1K 2K 2K 3K 4K 5K 6K 8K 1T 1T 1T 2T 2T 3T 3T 3T'),
  row('lowerChest', 'Lower Chest', 'torso', [33, 42], null, '1 2 3 6 11 18 27 37 50 63 80 1H 1H 2H 2H 3H 3H 4H 4H 5H 6H 7H 7H 2K 2K 2K'),
  row('abdomen', 'Abdomen', 'torso', [43, 50], null, '1 3 5 11 20 28 36 43 52 60 68 75 83 90 98 1H 1H 1H 1H 1H 1H 2H 2H 2H 2H 2H'),
  row('groin', 'Groin', 'torso', [51, 54], null, '3 10 18 35 39 45 53 60 68 75 84 95 1H 1H 1H 1H 1H 1H 2H 2H 2H 2H 2H 2H 2H 2H'),
  row('hip', 'Hip', 'torso', [55, 58], null, '1 2 3 4 5 6 8 12 16 20 23 27 31 35 39 43 47 52 56 60 65 69 69 84 84 92', 11),
  row('upperArm', 'Upper Arm', 'arm', [59, 62], [63, 66], '1 1 2 4 8 15 19 23 31 43 56 72 1H 1H 1H', 8),
  row('forearm', 'Forearm', 'arm', [67, 70], [71, 74], '1 2 3 5 9 18 22 28 37 50 60', 9),
  row('hand', 'Hand', 'arm', [75, 75], [76, 76], '1 2 3 5 10 13 15', 1),
  row('thigh', 'Thigh', 'leg', [77, 83], [84, 90], '1 1 2 4 8 15 19 23 31 43 56 72 1H 1H 1H 2H 2H 2H 2H 3H 3H 3H 3H 4H 4H 5H', 6),
  row('shin', 'Shin', 'leg', [91, 92], [93, 95], '1 1 2 2 3 4 6 9 12 15 19 24 35 80 1H 1H 1H 1H 1H 1H 1H 1H 2H 2H 2H 2H', 9)
];

// BPF 3's third column is 11. Abdomen there is 5 PD, which is the flak-vest example
// after 33 ID is divided by BPF 3.
export const bluntThresholds = {
  '0': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26],
  '1': [3, 3, 4, 5, 9, 11, 13, 14, 15, 16, 17, 18, 19, 20, 22, 24, 26, 27, 28, 30, 32, 34, 36, 38, 40, 42],
  '2': [4, 7, 8, 11, 15, 17, 20, 24, 26, 28, 30, 32, 34, 39, 41, 43, 46, 48, 52, 56, 59, 61, 64, 66, 70, 78],
  '3': [5, 10, 11, 14, 18, 20, 24, 28, 30, 33, 35, 38, 41, 45, 48, 50, 53, 55, 60, 65, 68, 70, 73, 75, 80, 90],
  '3+': [11, 22, 24, 31, 40, 44, 53, 62, 66, 73, 77, 84, 90, 99, 106, 110, 117, 121, 132, 143, 150, 154, 161, 165, 176, 198]
};
