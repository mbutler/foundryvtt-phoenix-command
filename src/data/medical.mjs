// Medical Aid and Recovery, LEG10200 PDF 68 / printed 63 — Tables 8A, 8B and the key's
// technology levels, which §2.9 names Table 8C. Visual transcription from the rendered page,
// 21 September 2026. The OCR layer was not used for any number here.
//
// §2.9 defines the index and the lookup:
//
//   "Damage Total (DT) = PD Total X 10 / Health Characteristic"
//   "If there is no entry for the character's DT, then the next lower entry should be used.
//    A DT of 34 would use the DT 30 line, for example."
//
// and what the two columns of each care level mean:
//
//   "CTP = Critical Time Period. When a character is injured, he has this much time to seek
//    Medical Aid before the player rolls to see if he survives."
//   "RR = Recovery Roll. This is the percentage chance that the character has of surviving
//    his wounds. If no Recovery Roll is given, then the character will automatically die at
//    the end of the Critical Time Period, unless better Medical Aid is found."
//
// A blank Recovery Roll is therefore a printed rule, not a missing cell, and it is kept
// distinct from a printed `00` — which is a one-in-a-hundred chance, because §2.9's own
// example survives on a roll "less than or equal to" the RR.
export const medicalSource=Object.freeze({book:'LEG10200',pdfPage:68,printedPage:63,
  tables:Object.freeze(['8A','8B','8C']),revision:1,status:'visual-transcription'});

// The table prints durations with a one-letter unit. A phase is the encounter clock's own
// two seconds, so every duration here is comparable with world time without parsing a
// string twice.
const SECONDS=Object.freeze({p:2,m:60,h:3600,d:86400});
const UNIT_NAMES=Object.freeze({p:'phases',m:'minutes',h:'hours',d:'days'});
export function parseDuration(printed){
  const match=/^(\d+)([pmhd])$/.exec(printed??'');
  if(!match)throw new Error(`"${printed}" is not a Table 8A duration; the table prints a whole number with p, m, h or d.`);
  const value=Number(match[1]),unit=match[2];
  return Object.freeze({printed,value,unit,unitName:UNIT_NAMES[unit],seconds:value*SECONDS[unit]});
}

// The five levels of care the table gives columns to, in the order it prints them — which is
// also the order of increasing help, so "better Medical Aid" in §2.9 means further right.
export const careLevels=Object.freeze(['none','first-aid','aid-station','field-hospital','trauma-center']);
export const careLabels=Object.freeze({none:'No aid','first-aid':'First aid','aid-station':'Aid station',
  'field-hospital':'Field hospital','trauma-center':'Trauma centre'});
export const techLevels=Object.freeze([13,14,15,16,17,18]);

// Table 8C, printed in the key beside Table 8B: which care a given year can actually offer.
// The first three entries are care levels rather than numbered technology levels, exactly as
// the page prints them.
export const technologyByDate=Object.freeze([
  Object.freeze({from:1831,to:1889,best:'first-aid'}),
  Object.freeze({from:1890,to:1918,best:'aid-station'}),
  Object.freeze({from:1919,to:1945,best:'field-hospital'}),
  Object.freeze({from:1946,to:2000,best:'trauma-center',techLevel:13}),
  Object.freeze({from:2001,to:2030,best:'trauma-center',techLevel:14}),
  Object.freeze({from:2031,to:2060,best:'trauma-center',techLevel:15}),
  Object.freeze({from:2061,to:2120,best:'trauma-center',techLevel:16}),
  Object.freeze({from:2121,to:2250,best:'trauma-center',techLevel:17}),
  Object.freeze({from:2251,to:2345,best:'trauma-center',techLevel:18})]);

// Table 8A, as printed. Each care level is one of:
//   null         the cell is inside a shaded block, which the table labels "RR = 99".
//                No Critical Time Period is printed for a shaded cell.
//   [ctp, rr]    a printed Critical Time Period and Recovery Roll.
//   [ctp, null]  a printed Critical Time Period with the Recovery Roll left blank, which
//                §2.9 makes automatic death at the end of it unless better aid is found.
// The trauma centre carries one CTP and six Recovery Rolls, one per technology level 13-18,
// each a number, `null` for a blank, or 's' for a shaded cell.
const S='s';
const rows=[
  // DT,    HT,  No aid,        First aid,     Aid station,   Field hospital, Trauma centre
  [5,       17, ['79h',94],    ['25d',96],    null,          null,           null],
  [10,      25, ['75h',89],    ['25d',92],    null,          null,           null],
  [15,      30, ['72h',85],    ['25d',89],    null,          null,           null],
  [20,      35, ['68h',81],    ['25d',86],    ['25d',96],    null,           null],
  [25,      38, ['65h',77],    ['25d',82],    ['25d',95],    null,           null],
  [30,      41, ['62h',73],    ['25d',79],    ['25d',94],    null,           null],
  [35,      43, ['59h',69],    ['25d',76],    ['25d',93],    ['25d',97],     null],
  [40,      44, ['56h',66],    ['25d',73],    ['25d',92],    ['25d',96],     null],
  [45,      46, ['53h',63],    ['25d',70],    ['25d',91],    ['25d',96],     null],
  [50,      47, ['51h',60],    ['25d',68],    ['25d',90],    ['25d',95],     null],
  [60,      48, ['46h',54],    ['25d',63],    ['25d',89],    ['25d',94],     null],
  [70,      50, ['41h',49],    ['25d',58],    ['25d',87],    ['25d',94],     null],
  [80,      51, ['37h',44],    ['25d',54],    ['25d',85],    ['25d',92],     ['25d',[97,S,S,S,S,S]]],
  [90,      52, ['34h',40],    ['25d',50],    ['25d',83],    ['25d',91],     ['25d',[96,S,S,S,S,S]]],
  [100,     53, ['31h',36],    ['25d',46],    ['25d',82],    ['25d',90],     ['25d',[96,97,S,S,S,S]]],
  [200,     61, ['11h',12],    ['23d',21],    ['25d',67],    ['25d',82],     ['25d',[92,94,96,S,S,S]]],
  [300,     65, ['4h',4],      ['19d',10],    ['25d',55],    ['25d',74],     ['25d',[89,91,94,96,S,S]]],
  [400,     68, ['93m',1],     ['16d',4],     ['25d',45],    ['25d',67],     ['25d',[85,88,92,95,97,S]]],
  [500,     70, ['35m',0],     ['13d',2],     ['25d',37],    ['25d',61],     ['25d',[82,85,90,94,96,S]]],
  [600,     72, ['13m',0],     ['10d',1],     ['25d',30],    ['25d',55],     ['25d',[79,82,88,93,95,S]]],
  [700,     73, ['6m',0],      ['8d',0],      ['25d',25],    ['25d',50],     ['25d',[76,80,86,92,94,S]]],
  [800,     75, ['5m',0],      ['7d',0],      ['25d',20],    ['25d',45],     ['25d',[73,77,84,91,94,97]]],
  [900,     76, ['4m',null],   ['6d',0],      ['25d',16],    ['25d',41],     ['25d',[70,75,82,90,93,96]]],
  [1000,    77, ['90p',null],  ['5d',null],   ['25d',13],    ['25d',37],     ['25d',[67,73,80,89,92,96]]],
  [2000,    84, ['85p',null],  ['15h',null],  ['6d',2],      ['25d',13],     ['25d',[45,53,64,79,85,92]]],
  [3000,    88, ['81p',null],  ['2h',null],   ['21h',0],     ['5d',5],       ['18d',[30,38,52,70,79,89]]],
  [4000,    91, ['76p',null],  ['22m',null],  ['4h',0],      ['18h',2],      ['72h',[20,28,41,62,73,85]]],
  [5000,    93, ['71p',null],  ['6m',null],   ['63m',0],     ['5h',1],       ['21h',[13,20,33,55,67,82]]],
  [6000,    95, ['67p',null],  ['4m',null],   ['36m',0],     ['3h',0],       ['12h',[9,15,27,49,62,79]]],
  [7000,    96, ['62p',null],  ['87p',null],  ['29m',null],  ['2h',0],       ['10h',[6,11,21,43,57,76]]],
  [8000,    98, ['57p',null],  ['75p',null],  ['25m',null],  ['2h',0],       ['8h',[4,8,17,39,53,73]]],
  [9000,    99, ['52p',null],  ['67p',null],  ['22m',null],  ['2h',null],    ['7h',[3,6,14,34,49,70]]],
  [12000,  102, ['38p',null],  ['57p',null],  ['19m',null],  ['95m',null],   ['6h',[1,3,7,21,39,62]]],
  [16000,  105, ['25p',null],  ['44p',null],  ['15m',null],  ['75m',null],   ['5h',[0,1,3,13,28,53]]],
  [20000,  107, ['1p',null],   ['30p',null],  ['10m',null],  ['50m',null],   ['3h',[null,0,1,9,20,45]]],
  [40000,  114, ['1p',null],   ['15p',null],  ['5m',null],   ['25m',null],   ['2h',[null,null,0,1,4,20]]],
  [60000,  118, ['1p',null],   ['10p',null],  ['3m',null],   ['17m',null],   ['68m',[null,null,null,0,1,9]]],
  [80000,  121, ['1p',null],   ['8p',null],   ['75p',null],  ['13m',null],   ['52m',[null,null,null,null,0,4]]],
  [100000, 123, ['1p',null],   ['6p',null],   ['60p',null],  ['10m',null],   ['40m',[null,null,null,null,null,2]]]
];

// The shaded label. It appears once over each shaded block rather than in every cell, so it
// is recorded here rather than repeated in the rows above.
export const SHADED_RECOVERY_ROLL=99;
const outcome=(cell,label)=>{
  if(cell===null)return Object.freeze({shaded:true,criticalTimePeriod:null,recoveryRoll:SHADED_RECOVERY_ROLL,
    detail:`${label}: inside Table 8A's shaded block, which the table labels RR = 99. No Critical Time Period is printed.`});
  const [ctp,rr]=cell;
  return Object.freeze({shaded:false,criticalTimePeriod:parseDuration(ctp),recoveryRoll:rr,
    detail:rr===null
      ?`${label}: a Critical Time Period of ${ctp} with no Recovery Roll printed — §2.9 makes that automatic death at the end of it unless better aid is found.`
      :`${label}: ${ctp} to reach this care, then a Recovery Roll of ${rr}.`});
};
const traumaOutcome=cell=>{
  if(cell===null)return Object.freeze({criticalTimePeriod:null,
    byTechLevel:Object.freeze(Object.fromEntries(techLevels.map(level=>[level,
      Object.freeze({shaded:true,recoveryRoll:SHADED_RECOVERY_ROLL})])))});
  const [ctp,rolls]=cell;
  return Object.freeze({criticalTimePeriod:parseDuration(ctp),
    byTechLevel:Object.freeze(Object.fromEntries(techLevels.map((level,index)=>{
      const value=rolls[index];
      return [level,value===S?Object.freeze({shaded:true,recoveryRoll:SHADED_RECOVERY_ROLL})
        :Object.freeze({shaded:false,recoveryRoll:value})];
    })))});
};

export const recoveryTable=Object.freeze(rows.map(([dt,ht,none,first,station,field,trauma])=>Object.freeze({
  damageTotal:dt,healingTimeDays:ht,
  care:Object.freeze({
    none:outcome(none,careLabels.none),
    'first-aid':outcome(first,careLabels['first-aid']),
    'aid-station':outcome(station,careLabels['aid-station']),
    'field-hospital':outcome(field,careLabels['field-hospital']),
    'trauma-center':traumaOutcome(trauma)})})));

// Table 8B, the Incapacitation Time Table. §2.10: "cross-indexing a 0-9 roll and the PD
// Total. Round the PD down to the nearest entry." The columns are the printed roll bands.
export const incapacitationRollBands=Object.freeze([
  Object.freeze({from:0,to:0,label:'0'}),Object.freeze({from:1,to:2,label:'1-2'}),
  Object.freeze({from:3,to:5,label:'3-5'}),Object.freeze({from:6,to:7,label:'6-7'}),
  Object.freeze({from:8,to:8,label:'8'}),Object.freeze({from:9,to:9,label:'9'})]);
const incapacitationRows=[
  [0,    ['1p','1p','2p','4p','6p','11p']],
  [50,   ['4p','15p','29p','47p','73p','4m']],
  [100,  ['25p','3m','5m','9m','14m','25m']],
  [200,  ['3m','11m','21m','23m','53m','96m']],
  [300,  ['10m','33m','63m','2h','3h','5h']],
  [450,  ['25m','85m','3h','4h','7h','12h']],
  [600,  ['50m','3h','5h','9h','14h','25h']],
  [750,  ['2h','6h','11h','19h','29h','53h']],
  [1000, ['5h','17h','32h','53h','82h','6d']]
];
export const incapacitationTable=Object.freeze(incapacitationRows.map(([pd,times])=>Object.freeze({
  physicalDamage:pd,times:Object.freeze(times.map(parseDuration))})));
