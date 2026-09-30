import {coverBlocks,targetSizeRow} from './cover.mjs';
// Derive the situational modifiers of a stationary shot from state the system already
// stores, and name what it cannot derive. Design goal: a routine attack should not ask
// again for anything calculable. Rules goal: never quietly invent a modifier.
//
// Three kinds of answer, kept distinct because they carry different authority:
//   derived      - read from stored state; no one had to decide it.
//   assumed      - the source states a default for the unprepared or unmodelled case.
//                  Visible, sourced and overridable, never silent.
//   adjudications- genuinely undecidable here. The caller must supply them.
//
// Lighting and firing stance are not modelled, and cover is stated rather than read from
// the scene. Foundry walls and scene darkness must not be silently equated with Phoenix
// Command cover and visibility.

const shooterPostureRows=Object.freeze({standing:'Standing',kneeling:'Kneeling',prone:'Prone'});
const bracedRows=Object.freeze({standing:'Standing & Braced',kneeling:'Kneeling & Braced',prone:'Prone & Braced'});
export const shotSituationSource='Small Arms §2.5 PDF 13 (stance, hip fire), §3.1 PDF 22 (moving shooter must hip fire), §3.8 PDF 37 (cover); Tables 4B/4C/4E/7C';

// `cover` is null for a target stated to be in the open, or {pf, label, stance} with the
// Protection Factor from Table 7C. `penetration` is the round's PEN: §3.8 cannot say how big
// the target is without it, because cover the round goes through does not hide him at all.
export function deriveShotSituation({shooterPosture,targetPosture,cover,penetration=null,
  firingStance=null,braced=false,visibility=null,shooterMoving=false}={}){
  const derived={},assumed=[],adjudications=[];
  if(typeof braced!=='boolean')adjudications.push({field:'braced',detail:'Bracing must be explicitly true or false.'});
  if(typeof shooterMoving!=='boolean')adjudications.push({field:'shooterMoving',detail:'Whether the shooter moved this impulse must be true or false.'});
  if(firingStance!==null&&typeof firingStance!=='boolean')adjudications.push({field:'firingStance',detail:'Firing stance must be true, false or unknown.'});

  // Shooter stance, Table 4B. Unbraced is the plain case and the lower modifier, so
  // defaulting to it needs no adjudication: it can only understate the shooter.
  const postureRow=(braced?bracedRows:shooterPostureRows)[shooterPosture];
  if(!postureRow)adjudications.push({field:'shooterPosture',
    detail:`Shooter posture "${shooterPosture??'unknown'}" has no Table 4B row. Supported: ${Object.keys(shooterPostureRows).join(', ')}.`});
  const situations=postureRow?[postureRow]:[];

  // Section 2.5: "If no preparation is made before a combatant begins aiming, he is said
  // to be Firing From The Hip". Absent a recorded firing stance,
  // the source default is hip fire. This understates the shooter rather than
  // flattering him, and it is reported so a GM can override it.
  //
  // Once movement is tracked this stops being a default at all. Section 2.5: a firing
  // stance lasts "until he moves", and §3.1 says a moving shooter "must Hip Fire" - so for
  // a shooter who moved this impulse, hip fire is read from state like any other fact, and
  // a claimed firing stance is a contradiction rather than an override.
  if(shooterMoving===true){
    if(firingStance===true)adjudications.push({field:'firingStance',
      detail:'A shooter who moved this impulse cannot hold a firing stance (§2.5, PDF 13); §3.1 requires him to hip fire.'});
    // Hip fire now reaches `derived.situations` without an `assumed` entry, which is the
    // whole difference: nobody decided it, and there is nothing here for a GM to override.
    situations.push('Firing from the Hip');
  }else if(firingStance===true){/* a recorded stance adds no penalty */}
  else if(firingStance===false||firingStance===null){
    situations.push('Firing from the Hip');
    assumed.push({field:'firingStance',value:'Firing from the Hip',
      detail:'No firing stance is recorded. Section 2.5 applies hip fire (−6) until a firing stance is prepared.'});
  }
  if(situations.length)derived.situations=situations;

  // Target size, Table 4E, decided by §3.8 rather than asked for. Cover itself is still
  // stated by the GM - nothing reads it from the scene - but once it is stated, which row
  // applies is a rule, not a second judgement: cover the round goes straight through leaves
  // the whole man as the target.
  // Unstated and stated-as-none are different answers, and the difference matters: treating
  // an unstated target as being in the open would flatter the shooter, which is the one
  // direction this module never defaults in.
  if(cover===undefined){
    adjudications.push({field:'cover',
      detail:'Cover is not read from the scene, so it must be stated: null for a target in the open, or a Table 7C Protection Factor with whether he is firing over it or looking over it.'});
  }else if(cover===null){
    derived.cover=null;
    try{derived.targetSize=targetSizeRow({behindCover:false,targetPosture}).row;}
    catch(error){adjudications.push({field:'targetPosture',detail:error.message});}
  }else if(typeof cover!=='object'||typeof cover.pf!=='number'||!Number.isFinite(cover.pf)||cover.pf<0){
    adjudications.push({field:'cover',
      detail:'State the cover\u2019s Protection Factor from Table 7C, or an adjudicated one, and whether the target is firing over it or looking over it.'});
  }else if(!Number.isFinite(penetration)){
    adjudications.push({field:'penetration',
      detail:'§3.8 decides both the target size and the hit-location column by comparing the round\u2019s PEN with the cover\u2019s Protection Factor, so the ballistic band is needed before either can be derived.'});
  }else{
    try{
      const blocking=coverBlocks(penetration,cover.pf);
      const size=targetSizeRow({behindCover:true,stance:cover.stance,blocking,targetPosture});
      derived.targetSize=size.row;
      derived.cover={pf:cover.pf,stance:cover.stance,...(cover.label?{label:cover.label}:{})};
      if(size.basis==='behind-nonblocking-cover')assumed.push({field:'targetSize',value:size.row,detail:size.detail});
    }catch(error){adjudications.push({field:'cover',detail:error.message});}
  }

  // Visibility, Table 4C. Lighting is not modelled; good visibility is the unmodified case.
  if(Array.isArray(visibility)&&visibility.length)derived.visibility=[...visibility];
  else{
    derived.visibility=['Good Visibility'];
    assumed.push({field:'visibility',value:'Good Visibility',
      detail:'Lighting, smoke and optics are not modelled. Good visibility is the unmodified Table 4C row; state it explicitly when conditions differ.'});
  }

  return {derived,assumed,adjudications,ready:adjudications.length===0,source:shotSituationSource};
}

// A player may be handed the roll only when nothing is left to adjudicate. Assumptions do
// not block it - they are sourced defaults - but they travel with the result so the shot
// records what was taken for granted.
export function playerRollable(situation){
  // The reason carries each adjudication's own detail, not just its field name. A GM who is
  // told only "cover" has to go and find out what about it; one who is told the Protection
  // Factor is missing can fix it where he stands.
  if(!situation.ready)return {allowed:false,
    reason:`This shot still needs GM adjudication. ${situation.adjudications.map(a=>`${a.field}: ${a.detail}`).join(' ')}`};
  return {allowed:true,assumed:situation.assumed};
}


// A partially paid hex already counts as moving. Do not offer stale Actor preparation
// as the default while waiting for the completed hex's document effect.
export function preparationDefaults(condition={},moving=false){
  return {firingStance:moving?false:condition.firingStance??false,
    braced:moving?false:condition.braced??false};
}
