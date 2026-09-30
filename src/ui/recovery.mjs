import {serialized,requireCoordinator} from '../application/coordinator.mjs';
import {recovery,resolveRecoveryRoll,healingTime,incapacitationTime,woundedCapability,
  careAvailableIn} from '../rules/medical.mjs';
import {careLevels,careLabels,techLevels,medicalSource} from '../data/medical.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {criticalTime,formatRemaining} from '../rules/critical-time.mjs';

// GM recovery uses an Actor journal so repeated confirmation or a failed final
// save reuses the recorded dice. An interruption before a die is durable fails
// closed; the reconcile UI records the observed result or abandons the attempt.
// It must not silently buy a new survival roll.

const option=(value,label,selected)=>`<option value="${e(value)}" ${value===selected?'selected':''}>${e(label)}</option>`;
const dieFaces={recovery:100,incapacitation:10};
const dieLabel={recovery:'Recovery Roll (00–99)',incapacitation:'Incapacitation die (0–9)'};

export function readRecoveryAttempt(actor){
  return structuredClone(actor.getFlag('phoenix-command','recoveryAttempt')??null);
}

export function recoveryAttemptStatus(attempt){
  if(!attempt||attempt.status==='complete')return null;
  if(attempt.status!=='pending')return {kind:'unknown',detail:'Recovery journal is in an unexpected state. The coordinating GM must inspect it.'};
  if(attempt.rolling){
    return {kind:'interrupted-die',die:attempt.rolling,
      detail:`Recovery stopped while saving the ${attempt.rolling} die. Retrying will not reroll it. The coordinating GM must record the observed result or abandon this attempt.`};
  }
  const saved=Object.keys(attempt.rolls??{});
  return {kind:'pending',
    detail:saved.length
      ?`A recovery is unfinished. Saved dice (${saved.join(', ')}) will be reused when it continues.`
      :'A recovery was started but no dice have been saved yet.'};
}

/** Encounter knockout outcomes already written for this character, when known. */
export function recordedKnockoutState(actor){
  const receipts=actor.getFlag?.('phoenix-command','impulseReceipts');
  if(receipts&&Object.keys(receipts).length)
    return {known:true,made:false,detail:'An encounter knockout check incapacitated this character.'};
  const combats=globalThis.game?.combats??[];
  let latest=null;
  for(const combat of combats){
    const batches=combat.getFlag?.('phoenix-command','impulseBatches')??{};
    for(const [stamp,batch] of Object.entries(batches)){
      if(!batch?.complete||!batch.knockout)continue;
      for(const [combatantId,outcome] of Object.entries(batch.knockout)){
        const combatant=combat.combatants?.get?.(combatantId);
        if(!combatant||(combatant.actor?.uuid!==actor.uuid&&combatant.actorId!==actor.id))continue;
        if(!outcome.checked)continue;
        latest={known:true,made:!outcome.incapacitated,
          detail:outcome.incapacitated
            ?`Impulse ${stamp}: knockout failed (rolled ${outcome.roll}).`
            :`Impulse ${stamp}: knockout made (rolled ${outcome.roll}).`};
      }
    }
  }
  return latest??{known:false,made:null,detail:'No recorded encounter knockout for this character.'};
}

function parseAttemptChoices(attempt){
  try{return JSON.parse(attempt.key);}
  catch{throw new Error('The interrupted recovery journal cannot be read. Abandon it before starting another.');}
}

function assertDieValue(name,value){
  const faces=dieFaces[name];
  if(!faces)throw new Error('Unsupported recovery die.');
  if(!Number.isInteger(value)||value<0||value>=faces)
    throw new Error(`Enter a whole number from 0 to ${faces-1} for the ${name} die.`);
}

export function recordInterruptedRecoveryDie(actor,{name,value}){
  return serialized(()=>recordInterruptedRecoveryDieOnce(actor,{name,value}));
}
async function recordInterruptedRecoveryDieOnce(actor,{name,value}){
  requireCoordinator();
  const attempt=readRecoveryAttempt(actor);
  const status=recoveryAttemptStatus(attempt);
  if(status?.kind!=='interrupted-die')throw new Error('There is no interrupted recovery die to record.');
  if(name!==attempt.rolling)throw new Error(`This interruption is waiting for the ${attempt.rolling} die, not ${name}.`);
  assertDieValue(name,value);
  attempt.rolls[name]=value;attempt.rolling=null;
  await actor.update({'flags.phoenix-command.recoveryAttempt':foundry.data.operators.ForcedReplacement.create(attempt)});
  return attempt;
}

export function abandonRecoveryAttempt(actor){
  return serialized(()=>abandonRecoveryAttemptOnce(actor));
}
async function abandonRecoveryAttemptOnce(actor){
  requireCoordinator();
  const attempt=readRecoveryAttempt(actor);
  if(!attempt||attempt.status==='complete')throw new Error('There is no unfinished recovery to abandon.');
  await actor.update({'flags.phoenix-command.recoveryAttempt':foundry.data.operators.ForcedReplacement.create(null)});
  return null;
}

export async function openRecovery(actor){
  if(!game.user.isGM)throw new Error('Medical aid and recovery is a GM control: whether a character survives is not his owner’s decision.');
  const system=actor.system;
  const health=system.attributes.health;
  if(!Number.isFinite(health)||health<=0)throw new Error(`${actor.name} has no Health characteristic, and §2.9 divides by it. Record Health before resolving a recovery.`);
  const physicalDamage=system.summary.physicalDamage;
  const previous=system.recovery??{};
  const attempt=readRecoveryAttempt(actor);
  const blocked=recoveryAttemptStatus(attempt);
  if(blocked?.kind==='interrupted-die')return openRecoveryReconciliation(actor,attempt,blocked);
  if(blocked?.kind==='pending'){
    const resume=await foundry.applications.api.DialogV2.confirm({
      window:{title:`Unfinished recovery · ${actor.name}`},
      content:`<div class="pc-dialog"><p class="pc-record-kicker">MEDICAL · UNFINISHED</p>
        <p>${e(blocked.detail)}</p>
        <p>Continue with the saved dice, or abandon this attempt and start over.</p></div>`,
      yes:{label:'Continue'},no:{label:'Abandon attempt'},rejectClose:false});
    if(resume===null)return null;
    if(!resume){await abandonRecoveryAttempt(actor);ui.notifications?.info(`${actor.name}: unfinished recovery abandoned.`);return null;}
    const choices=parseAttemptChoices(attempt);
    return resolveRecovery(actor,{care:choices.care,techLevel:choices.techLevel??null,
      firstThird:!!choices.firstThird,knockoutRollMade:choices.knockoutRollMade!==false});
  }

  const preview=recovery({physicalDamage,health,care:'none'});
  if(preview.belowTable){
    await foundry.applications.api.DialogV2.prompt({window:{title:`Recovery · ${actor.name}`},
      content:`<div class="pc-dialog"><p class="pc-record-kicker">MEDICAL · RECOVERY</p><p>${e(actor.name)} · ${e(physicalDamage)} PD · Health ${e(health)} · DT ${e(preview.damageTotal.toFixed(2))}</p>
        <p class="pc-help">${e(preview.detail)}</p></div>`,ok:{label:'Close'},rejectClose:false});
    return null;
  }

  let era=null;
  try{const year=game.settings.get('phoenix-command','campaignYear');if(Number.isInteger(year))era=careAvailableIn(year);}
  catch{/* the setting is absent in an older world; Table 8C simply says nothing */}
  // Prefill with the care recorded as reached for these wounds, else the last resolution's.
  const critical=criticalTime({injuries:system.injuries,recovery:system.recovery,health,physicalDamage,aid:system.aid,now:game.time.worldTime});
  const reached=critical.care&&critical.state!=='none'?{care:critical.care,techLevel:critical.techLevel}
    :{care:previous.care&&previous.care!=='unknown'?previous.care:'none',techLevel:previous.techLevel??null};
  const knockout=recordedKnockoutState(actor);
  const defaultKnockout=knockout.known?(knockout.made?'made':'failed'):'made';
  const ladder=preview.options.map(o=>`<tr><td>${e(o.label)}</td>
    <td>${e(o.criticalTimePeriod?.printed??'—')}</td>
    <td>${o.recoveryRoll===null?'<strong>no roll — dies</strong>':e(o.recoveryRoll)}${o.shaded?' <span class="pc-sheet-muted">(shaded)</span>':''}</td></tr>`).join('');

  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:`Medical aid and recovery · ${actor.name}`,resizable:true},position:{width:640},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">MEDICAL · RECOVERY</p><p>${e(actor.name)} · ${e(physicalDamage)} PD · Health ${e(health)} · <strong>DT ${e(preview.damageTotal.toFixed(2))}</strong></p>
      <p>Healing time for this Table 8A line: <strong>${e(preview.healingTimeDays)} days</strong>.</p>
      ${era?`<p>${e(era.detail)}</p>`:'<p class="pc-sheet-muted">No campaign year is set, so Table 8C cannot say what care the period can offer.</p>'}
      <details><summary>Care levels for this wound</summary>
        <table><thead><tr><th>Care</th><th>Critical Time Period</th><th>Recovery Roll</th></tr></thead><tbody>${ladder}</tbody></table>
        <p class="pc-sheet-muted">A blank Recovery Roll means automatic death when the Critical Time Period ends, unless better aid arrives. The Critical Time Period starts at the injury, not when aid arrives.</p></details>
      ${critical.state==='running'||critical.state==='due'?`<p ${critical.state==='due'?'role="alert"':''}>${e(critical.detail)}${critical.state==='running'?` ${e(formatRemaining(critical.remainingSeconds))} left.`:''}</p>`:''}
      <label>Care received<select name="care">${careLevels.map(level=>option(level,careLabels[level],reached.care)).join('')}</select></label>
      <label>Trauma centre technology<select name="techLevel"><option value="">Not a trauma centre</option>${techLevels.map(level=>option(String(level),`Level ${level}`,reached.techLevel?String(reached.techLevel):'')).join('')}</select></label>
      <label><input type="checkbox" name="firstThird" ${previous.healingReducedByDays?'checked':''}> Stayed in a trauma centre through the first third of healing (−20%)</label>
      <fieldset><legend>Knockout check in the fight</legend>
        <p class="pc-help">${e(knockout.detail)}</p>
        <label><input type="radio" name="knockout" value="made" ${defaultKnockout==='made'?'checked':''}> Made it — disabling injuries only</label>
        <label><input type="radio" name="knockout" value="failed" ${defaultKnockout==='failed'?'checked':''}> Failed it — roll Table 8B for how long he is out</label></fieldset>
      <p class="pc-sheet-muted">Dice and inputs are saved on the character. An interrupted save opens reconciliation instead of rerolling.</p></div>`,
    ok:{label:'Resolve recovery',callback:(event,button,dialog)=>{
      const form=dialog.element,read=n=>form.querySelector(`[name="${n}"]`).value;
      return {care:read('care'),techLevel:read('techLevel')===''?null:Number(read('techLevel')),
        firstThird:form.querySelector('[name=firstThird]').checked,
        knockoutRollMade:form.querySelector('[name=knockout]:checked').value==='made'};
    }},rejectClose:false});
  if(!answer)return null;
  try{return await resolveRecovery(actor,answer);}
  catch(error){
    const next=recoveryAttemptStatus(readRecoveryAttempt(actor));
    if(next?.kind==='interrupted-die'){
      ui.notifications?.warn(error.message);
      return openRecoveryReconciliation(actor,readRecoveryAttempt(actor),next);
    }
    throw error;
  }
}

async function openRecoveryReconciliation(actor,attempt,status){
  const die=status.die;
  const faces=dieFaces[die];
  const saved=Object.entries(attempt.rolls??{}).map(([name,value])=>`${name}: ${value}`).join(' · ')||'None yet';
  const answer=await foundry.applications.api.DialogV2.prompt({window:{title:`Reconcile recovery · ${actor.name}`},position:{width:520},
    content:`<div class="pc-dialog"><p class="pc-record-kicker">MEDICAL · RECONCILE</p>
      <p role="alert">${e(status.detail)}</p>
      <p>Saved dice: <strong>${e(saved)}</strong></p>
      <fieldset><legend>GM action</legend>
        <label><input type="radio" name="action" value="record" checked> Record the ${e(dieLabel[die]??die)} that was rolled</label>
        <label><input type="radio" name="action" value="abandon"> Abandon this attempt (next resolution rolls new dice)</label></fieldset>
      <label data-die>Observed result (0–${faces-1})<input name="value" type="number" min="0" max="${faces-1}" step="1" required></label>
      <p class="pc-sheet-muted">Do not invent a new roll here. Enter the die already produced, or abandon and start cleanly.</p></div>`,
    render:(_event,app)=>{
      const root=app.element.querySelector('.pc-dialog');
      const dieField=root.querySelector('[data-die]');
      const sync=()=>{dieField.hidden=root.querySelector('[name=action]:checked')?.value!=='record';};
      root.addEventListener('change',sync);sync();
    },
    ok:{label:'Apply',callback:(_event,_button,dialog)=>{
      const action=dialog.element.querySelector('[name=action]:checked').value;
      if(action==='abandon')return {action};
      const value=Number(dialog.element.querySelector('[name=value]').value);
      assertDieValue(die,value);
      return {action:'record',name:die,value};
    }},rejectClose:false});
  if(!answer)return null;
  if(answer.action==='abandon'){
    await abandonRecoveryAttempt(actor);
    ui.notifications?.info(`${actor.name}: recovery attempt abandoned. Resolve recovery again when ready.`);
    return null;
  }
  await recordInterruptedRecoveryDie(actor,{name:answer.name,value:answer.value});
  const choices=parseAttemptChoices(attempt);
  return resolveRecovery(actor,{care:choices.care,techLevel:choices.techLevel??null,
    firstThird:!!choices.firstThird,knockoutRollMade:choices.knockoutRollMade!==false});
}

// The resolution itself: the dice, the Actor write and the GM's record. Separated from the
// dialog above so that a native check drives exactly the path a GM does, rather than a
// re-implementation of it that could drift.
export function resolveRecovery(actor,choices){
  return serialized(()=>resolveRecoveryOnce(actor,choices));
}
async function resolveRecoveryOnce(actor,{care,techLevel=null,firstThird=false,knockoutRollMade=true}){
  requireCoordinator();
  const health=actor.system.attributes.health,physicalDamage=actor.system.summary.physicalDamage;
  const resolved=recovery({physicalDamage,health,care,techLevel});
  if(resolved.belowTable)throw new Error(resolved.detail);
  const key=JSON.stringify({health,physicalDamage,care,techLevel,firstThird,knockoutRollMade,
    injuries:Object.entries(actor.system.injuries??{}).filter(([,injury])=>injury.status==='active').sort(([a],[b])=>a.localeCompare(b))});
  let attempt=structuredClone(actor.getFlag('phoenix-command','recoveryAttempt')??null);
  if(attempt?.key===key&&attempt.status==='complete')return attempt.record;
  if(attempt?.status==='pending'&&attempt.key!==key)throw new Error('A recovery is already pending with different wounds or care. Reconcile or abandon that recovery before starting another.');
  if(attempt?.status==='pending'&&attempt.rolling)throw new Error('Recovery was interrupted before a die result was saved. Open Reconcile recovery on the character sheet; retrying will not reroll it.');
  const saveAttempt=()=>actor.update({'flags.phoenix-command.recoveryAttempt':foundry.data.operators.ForcedReplacement.create(attempt)});
  if(attempt?.key!==key){attempt={key,status:'pending',rolls:{},rolling:null};await saveAttempt();}
  const savedDie=async(name,faces,flavor)=>{
    if(Number.isInteger(attempt.rolls[name]))return attempt.rolls[name];
    if(attempt.rolling)throw new Error('Recovery was interrupted before a die result was saved. Open Reconcile recovery on the character sheet; retrying will not reroll it.');
    attempt.rolling=name;await saveAttempt();
    const rolled=await new foundry.dice.Roll(`1d${faces}-1`).evaluate();
    attempt.rolls[name]=rolled.total;attempt.rolling=null;await saveAttempt();
    await rolled.toMessage({flavor},{rollMode:CONST.DICE_ROLL_MODES.PRIVATE});
    return rolled.total;
  };
  const roll=await savedDie('recovery',100,`Recovery Roll · ${actor.name}`);
  const survival=resolveRecoveryRoll(resolved.outcome,roll);
  const healing=healingTime({healingTimeDays:resolved.healingTimeDays,traumaCentreFirstThird:firstThird});
  const capability=woundedCapability({recent:true,knockoutRollMade,
    healingTimeDays:knockoutRollMade?null:healing.days});
  const incapacitation=knockoutRollMade?null
    :incapacitationTime({physicalDamage,roll:await savedDie('incapacitation',10,`Incapacitation time · ${actor.name}`)});

  const woundTimes=Object.values(actor.system.injuries??{}).filter(injury=>injury.status==='active'&&Number.isFinite(injury.worldTime)).map(injury=>injury.worldTime);
  const record={
    resolvedAtWorldTime:game.time.worldTime,
    injuredAtWorldTime:woundTimes.length?Math.min(...woundTimes):null,
    physicalDamage,damageTotal:resolved.damageTotal,tableLine:resolved.row.damageTotal,
    care,techLevel,
    criticalTimePeriod:resolved.outcome.criticalTimePeriod?.printed??'',
    recoveryRoll:resolved.outcome.recoveryRoll,roll,
    outcome:survival.survives?'survived':'died',
    healingTimeDays:healing.days,healingReducedByDays:healing.reducedBy,
    incapacitationTime:incapacitation?.time.printed??'',incapacitationRoll:attempt.rolls.incapacitation??null,
    actionPenalty:capability.actionPenalty,penaltyCategory:capability.category,
    source:`LEG10200 \u00a72.9/\u00a72.10, Tables 8A/8B/8C, PDF ${medicalSource.pdfPage}`,
    notes:[resolved.detail,survival.detail,healing.detail,capability.detail,incapacitation?.detail].filter(Boolean).join(' ')};

  // `ForcedReplacement` writes the whole recovery block rather than merging into it, so a
  // previous resolution's technology level or incapacitation time cannot survive into a
  // later one. It replaces THIS subtree only. Passing `recursive:false` to the update
  // instead would replace `system` entire and take the character's attributes with it -
  // which is exactly what happened the first time, and what the native run caught.
  const update={'system.recovery':foundry.data.operators.ForcedReplacement.create(record),
    'flags.phoenix-command.recoveryAttempt':foundry.data.operators.ForcedReplacement.create({...attempt,status:'complete',record})};
  // A man who did not survive is not merely unconscious, and the sheet should not go on
  // showing him as able to act.
  if(!survival.survives)update['system.condition.consciousness']='incapacitated';
  await actor.update(update);

  await foundry.documents.ChatMessage.create({
    whisper:foundry.documents.ChatMessage.getWhisperRecipients('GM').map(u=>u.id),
    content:`<section class="phoenix-command"><p class="pc-record-kicker">MEDICAL RESULT</p><h2>${e(actor.name)}</h2>
      <p>${e(physicalDamage)} PD / Health ${e(health)} = <strong>DT ${e(resolved.damageTotal.toFixed(2))}</strong>, read on Table 8A's ${e(resolved.row.damageTotal)} line.</p>
      <p>${e(resolved.outcome.label)} \u00b7 ${e(resolved.outcome.criticalTimePeriod?.printed??'no Critical Time Period')} \u00b7 ${resolved.outcome.recoveryRoll===null?'no Recovery Roll printed':`Recovery Roll ${e(resolved.outcome.recoveryRoll)}`}</p>
      <p><strong>${survival.survives?'Survives':'Dies'}</strong> \u2014 ${e(survival.detail)}</p>
      ${survival.survives?`<p>Healing time ${e(healing.days)} days${healing.reducedBy?` (${e(healing.reducedBy)} days less for the trauma centre stay)`:''}.</p>
        ${incapacitation?`<p>Out of it for ${e(incapacitation.time.printed)} \u00b7 ${e(incapacitation.detail)}</p>`:''}
        <p>Combat Action penalty while he heals: <strong>${e(capability.actionPenalty)}</strong> \u00b7 ${e(capability.detail)}</p>`:''}
      <details><summary>Source</summary><p>${e(record.source)}</p></details></section>`,
    flags:{'phoenix-command':{recovery:{actorUuid:actor.uuid,record}}}});

  return record;
}
