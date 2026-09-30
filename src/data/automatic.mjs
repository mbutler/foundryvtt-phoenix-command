// §3.4 Fully Automatic Weapon Fire and §3.7 Hit Chance and Target Size, with the tables they
// read: Table 5A (Automatic Fire and Shrapnel Hit Chance, LEG10200 PDF 64 / printed 59) and
// Table 4F (Target Size Modifier Table, PDF 63 / printed 58).
//
// PROVENANCE. Three different things went into Table 5A below, and they are not the same
// kind of evidence:
//
//   * The NUMBERS are phoenix-functions' `automaticFireAndShrapnel_5A`, which the user
//     confirmed as accurate and which were independently checked against a render of PDF 64.
//   * The ASTERISKS are transcribed from the page, because the library drops them entirely.
//     §3.4 makes the asterisk the difference between "a 1% chance of one round" and "one
//     round hits, no roll" - printed side by side in the same column - so a table without
//     them cannot be resolved at all.
//   * The BLANKS are likewise transcribed. A printed `0` still hits on a roll of 00; a blank
//     cell can never hit. The library stores both as 0.
//
// The asterisks and blanks were MEASURED rather than read: each cell of a 6x render was
// located from the header's own column positions, its glyph clusters counted, and a cluster
// classified as an asterisk when its ink sits entirely in the top 62% of the line. Two
// independent checks agree with the result and are re-run as tests in `attacks.test.mjs`:
//
//   1. For twelve of the fourteen ROF columns the measured glyph count equals the digit
//      count of the library's number in that cell. (The remaining two are excluded because
//      the page prints them with no gap - "*72*144" - so no window separates their glyphs.)
//   2. In EVERY column the first starred cell going down the table is exactly `*1`, and the
//      cell immediately below it is a percentage between 86 and 98. That is the boundary
//      where the odds pass 100%, and wrong asterisks break it.
export const automaticSource=Object.freeze({book:'LEG10200',pdfPages:Object.freeze([30,31,36,63,64]),
  printedPages:Object.freeze([25,26,31,58,59]),sections:Object.freeze(['3.4','3.7']),
  revision:1,status:'library-numbers-with-measured-asterisks',
  numbers:'phoenix-functions automaticFireAndShrapnel_5A / targetSizeModifiers_4F',
  markers:'measured from LEG10200 PDF 64'});

// Table 5A's Rate of Fire columns, left to right as printed.
export const rofColumns=Object.freeze([3,4,5,6,7,8,9,10,12,18,36,54,72,144]);

// One row per printed line, highest Index first. `arc` is the Arc of Fire in 2-yard hexes and
// is null on the lines the page leaves unlabelled - those exist so that §3.7's target-size
// shift has somewhere to land, and are never entered directly. `-` is a blank cell, `*n` is
// n rounds that hit without a roll, and a bare number is a percentage rolled 00-99.
const printed=[
  [ 31, null, '*3 *4 *5 *6 *7 *8 *9 *10 *12 *18 *36 *54 *72 *144', '*58'],
  [ 30, null, '*3 *4 *5 *5 *6 *7 *8 *9 *11 *16 *33 *49 *65 *131', '*44'],
  [ 29, null, '*2 *3 *4 *5 *6 *6 *7 *8 *9 *14 *28 *43 *57 *114', '*33'],
  [ 28,  0.2, '*2 *3 *3 *4 *5 *5 *6 *7 *8 *12 *25 *37 *50 *99', '*25'],
  [ 27, null, '*2 *2 *3 *4 *4 *5 *5 *6 *7 *11 *22 *32 *43 *86', '*19'],
  [ 26, null, '*2 *2 *3 *3 *4 *4 *5 *5 *6 *9 *19 *28 *37 *75', '*14'],
  [ 25,  0.3, '*1 *2 *2 *3 *3 *4 *4 *5 *5 *8 *16 *24 *33 *65', '*11'],
  [ 24, null, '*1 *2 *2 *2 *3 *3 *4 *4 *5 *7 *14 *21 *28 *57', '*8'],
  [ 23,  0.4, '*1 *1 *2 *2 *2 *3 *3 *3 *4 *6 *12 *18 *25 *49', '*6'],
  [ 22, null, '89 *1 *1 *2 *2 *2 *3 *3 *4 *5 *11 *16 *21 *43', '*5'],
  [ 21,  0.5, '77 *1 *1 *2 *2 *2 *2 *3 *3 *5 *9 *14 *19 *37', '*4'],
  [ 20,  0.6, '67 89 *1 *1 *2 *2 *2 *2 *3 *4 *8 *12 *16 *32', '*3'],
  [ 19,  0.7, '58 78 97 *1 *1 *2 *2 *2 *2 *4 *7 *11 *14 *28', '*2'],
  [ 18,  0.8, '51 67 84 *1 *1 *1 *2 *2 *2 *3 *6 *9 *12 *24', '*2'],
  [ 17,  0.9, '44 58 73 88 *1 *1 *1 *1 *2 *3 *5 *8 *11 *21', '*1'],
  [ 16,    1, '38 51 64 77 89 *1 *1 *1 *2 *2 *5 *7 *9 *19', '87'],
  [ 15, null, '33 44 55 66 78 89 *1 *1 *1 *2 *4 *6 *8 *16', '65'],
  [ 14, null, '28 38 48 58 67 77 87 97 *1 *2 *3 *5 *7 *14', '49'],
  [ 13, null, '25 33 41 50 58 67 75 84 *1 *2 *3 *5 *6 *12', '37'],
  [ 12, null, '21 29 36 43 51 58 65 73 88 *1 *3 *4 *5 *11', '28'],
  [ 11,    2, '18 25 31 38 44 50 57 63 76 *1 *2 *3 *5 *9', '21'],
  [ 10, null, '16 21 27 33 38 44 49 55 66 *1 *2 *3 *4 *8', '15'],
  [  9, null, '14 18 23 28 33 38 43 48 57 86 *2 *3 *3 *7', '11'],
  [  8,    3, '12 16 20 24 29 33 37 41 50 75 *2 *2 *3 *6', '8'],
  [  7, null, '10 14 17 21 25 28 32 36 43 65 *1 *2 *3 *5', '6'],
  [  6,    4, '9 12 15 18 21 25 28 31 37 56 *1 *2 *2 *5', '4'],
  [  5, null, '7 10 13 16 18 21 24 27 32 49 98 *1 *2 *4', '3'],
  [  4,    5, '6 9 11 13 16 18 21 23 28 42 85 *1 *2 *3', '2'],
  [  3,    6, '5 7 10 12 14 16 18 20 24 37 74 *1 *2 *3', '1'],
  [  2,    7, '5 6 8 10 12 14 15 17 21 32 64 97 *1 *3', '1'],
  [  1,    8, '4 5 7 9 10 12 13 15 18 28 56 84 *1 *2', '0'],
  [  0,   10, '3 5 6 7 9 10 11 13 16 24 48 73 98 *2', '0'],
  [ -1,   11, '3 4 5 6 7 9 10 11 13 21 42 64 85 *2', '-'],
  [ -2,   13, '2 3 4 5 6 7 8 9 12 18 36 55 74 *1', '-'],
  [ -3,   15, '2 3 4 4 5 6 7 8 10 15 32 48 64 *1', '-'],
  [ -4,   17, '1 2 3 4 5 5 6 7 8 13 27 41 56 *1', '-'],
  [ -5,   20, '1 2 2 3 4 5 5 6 7 11 24 36 48 97', '-'],
  [ -6,   23, '1 1 2 3 3 4 4 5 6 10 20 31 42 85', '-'],
  [ -7,   26, '1 1 2 2 3 3 4 4 5 8 18 27 36 73', '-'],
  [ -8,   30, '0 1 1 2 2 3 3 3 4 7 15 23 31 64', '-'],
  [ -9,   35, '0 1 1 1 2 2 3 3 4 6 13 20 27 55', '-'],
  [-10,   40, '0 0 1 1 1 2 2 2 3 5 11 17 23 48', '-'],
  [-11,   46, '0 0 0 1 1 1 2 2 3 4 10 15 20 42', '-'],
  [-12,   53, '0 0 0 1 1 1 1 2 2 4 8 13 17 37', '-'],
  [-13,   61, '0 0 0 0 1 1 1 1 2 3 7 11 15 31', '-'],
  [-14,   70, '0 0 0 0 0 1 1 1 1 2 6 9 13 27', '-'],
  [-15,   81, '- 0 0 0 0 0 1 1 1 2 5 8 11 23', '-'],
  [-16,   93, '- 0 0 0 0 0 0 1 1 2 4 7 10 20', '-'],
  [-17,  107, '- 0 0 0 0 0 0 0 1 1 4 6 8 17', '-'],
  [-18,  123, '- - 0 0 0 0 0 0 0 1 3 5 7 15', '-'],
  [-19,  142, '- - - 0 0 0 0 0 0 1 2 4 6 13', '-'],
  [-20,  163, '- - - 0 0 0 0 0 0 1 2 4 5 11', '-'],
  [-21,  188, '- - - - 0 0 0 0 0 0 2 3 4 10', '-'],
];

const cell=token=>token==='-'?null
  :token.startsWith('*')?Object.freeze({rounds:Number(token.slice(1))})
  :Object.freeze({chance:Number(token)});

export const autoHitChance_5A=Object.freeze(printed.map(([index,arc,row,pellet])=>Object.freeze({
  index,arc,
  // Keyed by ROF so a caller never has to know the column order.
  chances:Object.freeze(Object.fromEntries(row.split(' ').map((t,i)=>[rofColumns[i],cell(t)]))),
  // §3.5's Base Pellet Hit Chance and §3.6's Base Shrapnel Hit Chance share this one column.
  pellet:cell(pellet)
})));

// Table 4F: a nonstandard target's ALM from its size in feet. §3.4 reads it opposite target
// HEIGHT for the Auto ELE and §3.7 opposite target WIDTH for the Auto WTH, so the same table
// answers two different questions and the caller says which.
export const targetSizeModifiers_4F=Object.freeze([
  [0.1,-15],[0.2,-10],[0.3,-7],[0.4,-5],[0.5,-3],[0.6,-2],[0.7,-1],[0.8,0],[0.9,1],[1,2],
  [1.2,3],[1.4,4],[1.6,5],[1.8,6],[2.1,7],[2.4,8],[2.7,9],[3.2,10],[3.6,11],[4.2,12],
  [4.8,13],[5.5,14],[6.3,15],[7.3,16],[8.4,17],[9.7,18],[11.1,19],[12.8,20],[14.7,21],
  [16.9,22],[19.4,23],[22.3,24],[25.7,25],[29.5,26],[34,27],[39,28]
].map(([sizeFeet,alm])=>Object.freeze({sizeFeet,alm})));
