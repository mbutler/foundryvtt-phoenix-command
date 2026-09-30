// Blocking and nonblocking cover, LEG10200 §3.8, PDF 37 / printed 32, with Table 7C
// (PDF 67) for the Protection Factors and Key 6B (PDF 65) for the hit-location columns.
//
// Everything here comes from four printed statements:
//
//   1. "If the weapon's PEN is greater than the cover's PF, the weapon penetrates and the
//      cover is Nonblocking. If the PEN is less than or equal to the PF, the cover is
//      blocking."                                                            §3.8
//   2. "EPEN = weapon PEN - cover PF - EPF"                                  §3.8
//   3. "When a hit is scored on an opponent behind Nonblocking Cover, the second column
//      (Open) is always used. If he is Firing Over Cover and the 00-99 hit location roll is
//      in the top part of the table, he is hit in an exposed location. Otherwise, the
//      bullet must penetrate the cover before striking."                     §3.8
//   4. "For a target Looking over or around Blocking Cover, use the Fire column and a
//      00-22 roll."                                                          Key 6B
//
// And one more that ties cover to the odds rather than the damage:
//
//   5. "If the target is behind Nonblocking cover ... the entire target area, both visible
//      and hidden, is used for the Target Size ALM ... the Target Size ALM would be for a
//      man standing exposed (ALM = +7) rather than a man firing over blocking cover
//      (ALM = 0)."                                                           §3.8
//
// What is deliberately NOT here: cover read from the Foundry scene, and cover the shot
// passes through on its way to a target who is not behind it. Both are named in
// docs/cover-reference.md as exclusions, not oversights.
export const coverSource='LEG10200 §3.8 PDF 37; Table 7C PDF 67; Key 6B PDF 65';

// The two things a target can be doing behind cover, and the Table 4E rows they name.
export const coverStances=Object.freeze({'firing-over':'Fire Over/Around','looking-over':'Look Over/Around'});

// Table 7B's cover rows leave a target's state saved: a paid firing stance shows him firing over
// the cover, and Look Over or Around Cover shows him looking over it (Key 6B's 00-22 column). A
// target who moved this phase is doing neither. This is the review's default; the GM can still
// state otherwise for a particular shot.
export function savedCoverStance(condition,{moving=false}={}){
  return !moving&&condition?.looking===true&&condition?.firingStance!==true?'looking-over':'firing-over';
}

// Table 6A's left columns ARE the division §3.8 calls the top and bottom of the table: the
// sixteen rows from Head Glance to Weapon Critical carry a Fire range, and nothing below
// Torso Glance does. So a struck location is exposed over cover exactly when its row has
// one, and that single fact answers both which column to read and whether the round had to
// come through the cover first.
export const topOfTable=row=>Array.isArray(row?.Fire);

// §3.8's first statement. Equal PF stops the round: the comparison is strict one way only.
export function coverBlocks(penetration,coverPF){
  for(const [value,name] of [[penetration,'weapon PEN'],[coverPF,'cover PF']])
    if(typeof value!=='number'||!Number.isFinite(value)||value<0)throw new Error(`Blocking is decided by ${name}, which must be a finite number of zero or more.`);
  return penetration<=coverPF;
}

// Which Table 6A column the hit location is read on, and over what range the die is rolled.
//
// The Looking range is the one place the roll itself changes. A man with only his head
// showing cannot be hit in the elbow, and the book expresses that by shortening the die
// rather than by rerolling: 00-22 on the Fire column is Head Glance, Forehead and Eye-Nose.
export function hitLocationColumn({behindCover,stance=null,blocking=null}={}){
  if(typeof behindCover!=='boolean')throw new Error('State whether the target is behind cover.');
  if(!behindCover)return {column:'Open',rollMax:99,
    detail:'No cover, so the hit location is read in the open.',source:coverSource};
  if(!Object.hasOwn(coverStances,stance??''))throw new Error(`A target behind cover is either ${Object.keys(coverStances).join(' or ')}.`);
  if(typeof blocking!=='boolean')throw new Error('Decide whether the cover blocks this weapon before reading a hit location.');
  // §3.8: nonblocking cover puts the whole man back on the table, because the round reaches
  // the parts of him the cover hides.
  if(!blocking)return {column:'Open',rollMax:99,
    detail:'The cover does not stop this round, so §3.8 reads the hit location in the Open column: the parts of him behind it can still be struck.',
    source:coverSource};
  if(stance==='looking-over')return {column:'Fire',rollMax:22,
    detail:'Key 6B: a target looking over or around blocking cover is read on the Fire column with a 00-22 roll.',
    source:coverSource};
  return {column:'Fire',rollMax:99,
    detail:'Blocking cover, so only what he exposes to fire over it can be struck: the Fire column.',
    source:coverSource};
}

// §3.8's second and third statements together. The cover's PF comes out of the round's
// penetration only when the round actually had to come through the cover, which is to say
// when the struck location is NOT in the top part of the table.
//
// With blocking cover the column is Fire, every row of which is in the top part, so this is
// always false and the PF never subtracts - which is right, because a round the cover stops
// never reaches the man at all. One rule covers every case.
export function coverAppliesToLocation({behindCover,row}){
  if(typeof behindCover!=='boolean')throw new Error('State whether the target is behind cover.');
  if(!behindCover)return false;
  if(!row||typeof row!=='object')throw new Error('The struck Table 6A row is needed to say whether the cover was in the way.');
  return !topOfTable(row);
}

// EPEN = weapon PEN - cover PF - EPF, with the cover term present only when the round came
// through the cover. Returns the parts as well as the total, so a trace can show the
// subtraction the book prints rather than a number that appeared from nowhere.
export function effectivePenetration({penetration,coverPF=0,epf,throughCover}){
  for(const [value,name] of [[penetration,'weapon PEN'],[coverPF,'cover PF'],[epf,'EPF']])
    if(typeof value!=='number'||!Number.isFinite(value))throw new Error(`${name} must be a finite number.`);
  if(typeof throughCover!=='boolean')throw new Error('State whether the round came through the cover.');
  const applied=throughCover?coverPF:0;
  return {epen:penetration-applied-epf,penetration,coverPF:applied,epf,
    detail:throughCover?`EPEN = PEN ${penetration} - cover PF ${applied} - EPF ${epf}`
      :`EPEN = PEN ${penetration} - EPF ${epf}; the struck location was exposed, so the round did not come through the cover`,
    source:coverSource};
}

// §3.8's fifth statement: nonblocking cover does not shrink the target, because the round
// reaches the parts of him it hides. So the Table 4E row is the exposed one for his posture,
// not the cover row - and a caller who asked for the cover row is told why it changed rather
// than having it changed under him.
const exposedRows=Object.freeze({standing:'Standing Exposed',kneeling:'Kneeling Exposed',prone:'Prone/Crawl'});
export function targetSizeRow({behindCover,stance=null,blocking=null,targetPosture}){
  if(typeof behindCover!=='boolean')throw new Error('State whether the target is behind cover.');
  const exposed=exposedRows[targetPosture];
  if(!exposed)throw new Error(`Target posture "${targetPosture??'unknown'}" has no Table 4E row. Supported: ${Object.keys(exposedRows).join(', ')}.`);
  if(!behindCover)return {row:exposed,basis:'exposed',source:coverSource};
  if(!Object.hasOwn(coverStances,stance??''))throw new Error(`A target behind cover is either ${Object.keys(coverStances).join(' or ')}.`);
  if(typeof blocking!=='boolean')throw new Error('Decide whether the cover blocks this weapon before reading a target size.');
  if(blocking)return {row:coverStances[stance],basis:'behind-blocking-cover',source:coverSource};
  return {row:exposed,basis:'behind-nonblocking-cover',
    detail:`§3.8: the cover does not stop this round, so "the entire target area, both visible and hidden, is used for the Target Size ALM". ${exposed} is read, not ${coverStances[stance]}.`,
    source:coverSource};
}

// Everything a shot needs to know about its target's cover, decided once from the weapon's
// penetration and the cover's Protection Factor so that the column, the roll range and the
// EPEN subtraction cannot disagree with one another. The target size is decided separately,
// by `targetSizeRow`, because it is an odds input and belongs with the other situational
// modifiers rather than with the damage chain.
//
// `cover` is null for a target in the open, or {pf, label, stance}. It is deliberately not a
// boolean any more: §3.8 cannot decide anything without the Protection Factor, and a boolean
// hid that it was never being asked.
export function coverSituation({penetration,cover=null}={}){
  if(cover===true)throw new Error('Cover is no longer a yes-or-no: \u00a73.8 needs its Protection Factor from Table 7C and whether the target is firing over it or looking over it.');
  if(cover===null||cover===undefined||cover===false){
    return {behindCover:false,blocking:null,coverPF:0,coverLabel:null,stance:null,
      ...hitLocationColumn({behindCover:false}),source:coverSource};
  }
  if(typeof cover!=='object')throw new Error('Cover is null for a target in the open, or an object carrying its Table 7C Protection Factor and the target\u2019s stance behind it.');
  if(typeof cover.pf!=='number'||!Number.isFinite(cover.pf)||cover.pf<0)
    throw new Error('Cover needs a Protection Factor from Table 7C, or an adjudicated one.');
  const blocking=coverBlocks(penetration,cover.pf);
  return {behindCover:true,blocking,coverPF:cover.pf,coverLabel:cover.label??null,stance:cover.stance??null,
    ...hitLocationColumn({behindCover:true,stance:cover.stance,blocking}),
    detail:blocking
      ?`PEN ${penetration} is not greater than the cover\u2019s PF ${cover.pf}, so the cover is blocking.`
      :`PEN ${penetration} is greater than the cover\u2019s PF ${cover.pf}, so the cover is nonblocking and the round goes through it.`,
    source:coverSource};
}

// The Table 4E rows that mean "behind cover". §3.8 forbids pairing either of them with cover
// the round goes straight through, and they mean nothing at all with no cover.
export const coverTargetSizeRows=Object.freeze(Object.values(coverStances));
