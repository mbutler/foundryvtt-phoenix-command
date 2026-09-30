// Paid movement, the moving-aim cap and the aim-time restrictions that movement imposes
// on a shot. Sourced in docs/movement-reference.md; read it before changing behaviour.
//
// Three kinds of answer, as in shot-situation.mjs: derived from state, assumed from a
// printed unmodified case, or genuinely adjudicated. Terrain is not modelled, so an
// unstated terrain group is an assumption that understates the cost, and says so.
import {baseMovementCosts,movementModifiers,movementSource,noMaximumAimFrom,aimRestrictionSource} from '../data/movement.mjs';
import {actionSchedule} from './timing.mjs';

const groups=['stance','slope','cover','water','injury'];
const defaults=Object.freeze({slope:'none',cover:'none',water:'none',injury:'none'});

// Cost of entering one hex. Direction and stance change the number and are never guessed;
// Table 7A prints no row for a kneeling mover, so posture is not translated into a stance.
export function quoteHexStep({direction,stance,miscellaneous=[],...rest}={}){
  if(!(direction in baseMovementCosts))
    throw new Error(`Movement direction "${direction??'unknown'}" has no Table 7A row. Supported: ${Object.keys(baseMovementCosts).join(', ')}.`);
  if(!(stance in movementModifiers.stance))
    throw new Error(`Movement stance "${stance??'unknown'}" has no Table 7A row. Supported: ${Object.keys(movementModifiers.stance).join(', ')}.`);
  const unsupported=Object.keys(rest).filter(key=>!groups.includes(key));
  if(unsupported.length)throw new Error(`Unsupported movement modifier group: ${unsupported.join(', ')}.`);
  if(!Array.isArray(miscellaneous))throw new Error('Miscellaneous movement conditions must be a list.');

  const breakdown=[{label:`Base: ${direction}`,actions:baseMovementCosts[direction]}];
  let actions=baseMovementCosts[direction];
  const assumed=[];
  breakdown.push({label:`Stance: ${stance}`,actions:movementModifiers.stance[stance]});
  actions+=movementModifiers.stance[stance];
  for(const group of groups.filter(g=>g!=='stance')){
    const table=movementModifiers[group];
    // A combatant can be disabled on both sides of the waist at once, so the injury group
    // takes a list where the terrain groups take one row. Each row still applies once.
    const choices=group==='injury'&&Array.isArray(rest[group])?[...new Set(rest[group])]
      :[rest[group]??defaults[group]];
    if(group!=='injury'&&Array.isArray(rest[group]))throw new Error(`Movement ${group} takes one Table 7A row, not a list.`);
    for(const choice of choices){
      if(!(choice in table))
        throw new Error(`Movement ${group} "${choice}" has no Table 7A row. Supported: ${Object.keys(table).join(', ')}.`);
      if(choice!=='none')breakdown.push({label:`${group}: ${choice}`,actions:table[choice]});
      actions+=table[choice];
    }
    if(rest[group]===undefined)assumed.push({field:group,value:'none',
      detail:`Terrain is not modelled. Table 7A's unmodified case is assumed for ${group}; state it when it differs, because an omission understates the cost.`});
  }
  const seen=new Set();
  for(const condition of miscellaneous){
    if(!(condition in movementModifiers.miscellaneous))
      throw new Error(`Movement condition "${condition}" has no Table 7A row. Supported: ${Object.keys(movementModifiers.miscellaneous).join(', ')}.`);
    if(seen.has(condition))throw new Error(`Movement condition "${condition}" was listed twice.`);
    seen.add(condition);
    breakdown.push({label:condition,actions:movementModifiers.miscellaneous[condition]});
    actions+=movementModifiers.miscellaneous[condition];
  }
  return {actions,breakdown,assumed,source:{...movementSource}};
}

// Section 2.3, PDF 12: "For each hex entered, a combatant may change facing up to 60
// degrees (one hexside) without CA cost. There is only a CA cost for turning if the
// combatant is not moving that Impulse, or if he wishes to turn more than one hexside per
// hex." The free hexside belongs to the hex being entered, so a turn made after stopping
// keeps only the one earned by the last hex - which is exactly how the section's own
// eleven-hex example arrives at four actions. Paid hexsides cost by Table 7B: one action
// per 60-120 degrees, or two actions per 60 degrees while holding a firing stance.
// Facing itself remains a free angle; hexsides only meter the allowance.
export function facingChangeCost({hexsides,movingThisHex,firingStance=false}={}){
  if(!Number.isInteger(hexsides)||hexsides<0)throw new Error('Hexsides turned must be a whole number of at least zero.');
  if(typeof movingThisHex!=='boolean')throw new Error('State whether the combatant entered a hex this impulse.');
  if(typeof firingStance!=='boolean')throw new Error('Firing stance must be true or false.');
  // Section 2.5, PDF 13: a firing stance lasts "until he moves", so the two cannot combine.
  if(movingThisHex&&firingStance)throw new Error('Moving breaks a firing stance; a moving combatant cannot turn in one.');
  const free=movingThisHex?Math.min(hexsides,1):0;
  const paid=hexsides-free;
  return {free,paidHexsides:paid,actions:firingStance?paid*2:Math.ceil(paid/2),
    source:'Small Arms §2.3, PDF 12; Table 7B, PDF 67'};
}

// Section 2.2, PDF 11: "a character may only use a maximum of 1 Impulse worth of aim if he
// is moving." The book's worked example (Trent, CA 8) shows aim accumulating across
// impulses up to that ceiling, so this caps the running total, not each impulse.
//
// "1 Impulse worth" is unambiguous only when Table 1E gives the character the same actions
// in every impulse; CA 7 is 2/1/2/2. Ruled at this table: it is the allotment of the
// impulse the shot is fired in, following §3.1, which already measures a moving shooter's
// speed as "the number of hexes moved the Impulse the shot was fired".
//
// `impulses` selects which restriction is being measured: 1 for the moving shooter of
// §3.1, 2 for the unshaded Table 4D entry that limits a shot at a moving target. Two
// impulses' worth is the firing impulse plus the one before it, wrapping into the previous
// phase - aim accumulates backwards from the shot, and every phase has the same schedule.
// That extension follows the same ruling; the book does not spell the two-impulse case out.
export function movingAimCap(allowance,impulse,impulses=1){
  if(!Number.isInteger(impulse)||impulse<1||impulse>4)throw new Error('The firing impulse must be 1 to 4.');
  if(!Number.isInteger(impulses)||impulses<1||impulses>4)throw new Error('An aim restriction is measured in one to four impulses.');
  const schedule=actionSchedule(allowance);
  let actions=0;
  for(let back=0;back<impulses;back++)actions+=schedule[(impulse-1-back+4)%4];
  return {actions,impulse,impulses,schedule,
    source:'Small Arms §2.2, PDF 11; §3.1, PDF 22; Table 1E, PDF 60 · firing-impulse ruling'};
}

// Accumulated aim a moving shooter may hold, measured against the impulse he fires in.
export function capMovingAim({allowance,accumulated,impulse,impulses=1}){
  if(!Number.isInteger(accumulated)||accumulated<0)throw new Error('Accumulated aim must be a whole number of actions.');
  const cap=movingAimCap(allowance,impulse,impulses);
  return {...cap,exceeded:accumulated>cap.actions,usable:Math.min(accumulated,cap.actions)};
}

// User ruling, 2026-09-25: Table 4D range headings round down. Accuracy and
// aim restrictions share this lookup. Table 4A retains its printed round-up rule.
const rangeColumns=[10,20,40,70,100,200,300,400,600,800,1000,1200,1500];
export function movementRangeColumn(rangeHexes){
  if(!Number.isFinite(rangeHexes)||rangeHexes<=0)throw new Error('Range must be a positive number of 2-yard hexes.');
  return rangeColumns.filter(column=>column<=rangeHexes).at(-1) ?? rangeColumns[0];
}

// Section 3.1, PDF 22. A moving shooter is restricted to 1 Impulse of aim wherever his own
// Table 4D entry falls, and "must Hip Fire" - section 2.5 (PDF 13) explains why: a firing
// stance lasts "until he moves". For a moving target the restriction comes from the
// table's shading: shaded entries print "No Maximum Aim", everything else allows 2.
// The shooter's own restriction turns on whether he is moving at all, not on how fast:
// §2.5's firing stance lasts "until he moves", and a combatant part-way into an expensive
// hex is moving while his Table 4D speed is still zero. The target's restriction is the
// opposite - it reads the table, so it needs the speed.
export function aimTimeRestriction({role,speed=0,moving=speed>0,rangeHexes}){
  if(!['shooter','target'].includes(role))throw new Error('Aim-time restriction applies to the shooter or the target.');
  if(!Number.isFinite(speed)||speed<0)throw new Error('Speed must be a number of hexes per phase of at least zero.');
  if(typeof moving!=='boolean')throw new Error('Whether the combatant is moving must be true or false.');
  const source=`Small Arms §3.1, PDF 22; Table 4D, PDF ${aimRestrictionSource.pdfPage}`;
  if(role==='shooter')return moving
    ?{restricted:true,impulses:1,hipFire:true,source,detail:'A moving shooter is restricted to 1 Impulse of aim and must hip fire.'}
    :{restricted:false,impulses:null,hipFire:false,source};
  if(speed===0)return {restricted:false,impulses:null,hipFire:false,source};
  const column=movementRangeColumn(rangeHexes);
  const row=noMaximumAimFrom.find(entry=>speed>=entry.speed[0]&&speed<entry.speed[1]);
  if(!row)throw new Error(`No Table 4D speed row covers ${speed}.`);
  if(row.column!==null&&column>=row.column)
    return {restricted:false,impulses:null,hipFire:false,column,source,
      detail:'Shaded Table 4D entry: no maximum aim.'};
  return {restricted:true,impulses:2,hipFire:false,column,source,
    detail:'Unshaded Table 4D entry: maximum 2 Impulse aim.'};
}

// Section 2.2, PDF 11: "Actions can be mixed, as long as they are not exclusive... a
// player can aim while moving, but cannot aim at two different targets at once, or any
// other obvious contradiction." The book names one contradiction and leaves the rest to
// judgement, so only that one is decided here; everything unfamiliar is referred out.
export function mixImpulseActivities(plans){
  if(!Array.isArray(plans)||!plans.length)throw new Error('Supply the activities planned for this impulse.');
  const actions=plans.reduce((sum,plan)=>{
    if(!Number.isInteger(plan?.actions)||plan.actions<0)throw new Error('Each planned activity needs a whole number of actions.');
    return sum+plan.actions;
  },0);
  const aims=plans.filter(plan=>plan.kind==='aim');
  const targets=new Set(aims.map(plan=>plan.targetUuid));
  if(aims.length>1&&targets.size>1)
    return {allowed:false,actions,reason:'Section 2.2 names aiming at two different targets at once as exclusive.'};
  const kinds=new Set(plans.map(plan=>plan.kind));
  const known=kinds.size<=1||[...kinds].every(kind=>kind==='aim'||kind==='move');
  if(!known)return {allowed:false,actions,adjudication:true,
    reason:`Section 2.2 leaves "any other obvious contradiction" to judgement. Rule on mixing ${[...kinds].join(' + ')} before committing it.`};
  return {allowed:true,actions,source:'Small Arms §2.2, PDF 11'};
}

// Everything movement does to a shot, in one place, because the pieces interlock: a moving
// shooter hip fires and is held to one impulse of aim, while an unshaded Table 4D entry
// holds a shot at a moving target to two. Speeds are HEXES PER PHASE: LEG10200 labels Table
// 4D's axis "HPI" but LEG10203 §12 enters it with hexes per phase, and that reading is the
// one ruled at this table. See the reference §6.
//
// A restriction the paid aim already exceeds is refused rather than quietly reduced. The
// shot is replanned - firing early at the aim actually held is an existing, recorded move.
export function reviewMovingShot({aimActions,allowance,impulse,shooterHexes=0,targetHexes=0,
  shooterMoving=shooterHexes>0,rangeHexes}={}){
  if(!Number.isInteger(aimActions)||aimActions<1)throw new Error('Paid aim must be a whole number of at least one action.');
  for(const [label,hexes] of [['shooter',shooterHexes],['target',targetHexes]])
    if(!Number.isFinite(hexes)||hexes<0)throw new Error(`The ${label}'s hexes this phase must be a number of at least zero.`);
  const reasons=[];
  const shooter=aimTimeRestriction({role:'shooter',moving:shooterMoving});
  const target=aimTimeRestriction({role:'target',speed:targetHexes,rangeHexes});
  for(const [who,restriction,moved] of [['shooter',shooter,`${shooterMoving?'moving':'still'}`],['target',target,`moving at ${targetHexes} hexes this phase`]]){
    if(!restriction.restricted)continue;
    const cap=capMovingAim({allowance,accumulated:aimActions,impulse,impulses:restriction.impulses});
    if(cap.exceeded)reasons.push(`A ${who} ${moved} restricts this shot to ${cap.actions} action${cap.actions===1?'':'s'} of aim; ${aimActions} are paid. Fire early at the aim held, or stop moving.`);
  }
  return {allowed:!reasons.length,reasons,
    derived:{hipFire:shooter.hipFire,shooterRestriction:shooter,targetRestriction:target},
    source:'Small Arms §2.2 PDF 11, §2.5 PDF 13, §3.1 PDF 22; Table 4D PDF 63'};
}
