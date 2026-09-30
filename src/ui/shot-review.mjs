import {preparationDefaults} from '../rules/shot-situation.mjs';
import {firearmOptions,damageModifierTable} from '../rules/attacks.mjs';
import {coverProtectionFactor} from '../data/cover.mjs';
import {coverMenu,coverFromKey} from './cover-menu.mjs';
import {savedCoverStance} from '../rules/cover.mjs';
import {sceneCover} from '../foundry/cover-scene.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import { movedThisPhase } from '../rules/timing.mjs';
import {strikeReviewContext,strikeChoices,explosiveChoices} from '../foundry/strike-review.mjs';

function readCover(form){
  const key=form.querySelector('[name=cover]').value;
  const stance=form.querySelector('[name=coverStance]').value;
  if(key==='scene')return undefined;
  if(key!=='adjudicated')return coverFromKey(key,stance);
  const pf=Number(form.querySelector('[name=coverPF]').value);
  const reason=form.querySelector('[name=coverReason]').value;
  return {...coverProtectionFactor({adjudicated:pf,reason}),stance};
}

// The strike's adjustable fields, prefilled from the derivation. Used inline by the fire
// queue and in the review dialog.
export function strikeFields(ctx){
  const d=ctx.defaults,o=field=>ctx.open.some(x=>x.field===field);
  return `<label>Damage bonus <input name="bonus" type="number" step="0.1" value="${e(d.damageBonus??'')}" required></label>
      ${ctx.charge?`<label>Weapon Class for this charge <input name="chargeWc" type="number" step="1" value="${e(d.chargeWc)}" required></label>`:''}
      ${ctx.sixFoot?`<label>Range in 2-foot melee hexes <input name="range" type="number" min="1" step="1" value="${e(d.rangeHexes)}" required></label>`:''}
      ${o('field')?fieldSelect(d):''}${o('parry')?parrySelect(ctx):''}
      <details><summary>Damage modifiers (§3.5)</summary>
        <label>Height<select name="dmLevel"><option value="">Level</option>${['strikingDown','strikingUp','fromKnees','prone'].map(id=>`<option value="${id}" ${id===d.dmLevel?'selected':''}>×${damageModifierTable[id].factor} ${e(damageModifierTable[id].label)}</option>`).join('')}</select></label>
        ${ctx.charge?'':`<label>Closing speed<select name="dmClosing"><option value="">None</option>${Object.keys(damageModifierTable).filter(id=>damageModifierTable[id].closing).map(id=>`<option value="${id}" ${id===d.dmClosing?'selected':''}>×${damageModifierTable[id].factor} ${e(damageModifierTable[id].label)}</option>`).join('')}</select></label>`}
        <label class="pc-custom-toggle"><input name="dmBraced" type="checkbox" ${d.dmBraced?'checked':''}> ×2 ${e(damageModifierTable.braced.label)}</label>
        <label class="pc-custom-toggle"><input name="dmGrasp" type="checkbox" ${d.dmGrasp?'checked':''}> ×.5 ${e(damageModifierTable.grasp.label)}</label></details>
      <details><summary>GM overrides</summary>${o('field')?'':fieldSelect(d)}${o('parry')?'':parrySelect(ctx)}</details>`;
}
const fieldSelect=d=>`<label>Field of Attack <select name="field">${[['derived','Use token facing'],['inside','Force inside'],['outside','Force outside']].map(([k,v])=>`<option value="${k}" ${k===d.field?'selected':''}>${v}</option>`).join('')}</select></label>`;
const parrySelect=ctx=>`<label>Parry column <select name="parry"><option value="">Use derived${ctx.defaultColumn?` · ${ctx.defaultColumn}`:''}</option>${[1,2,3,4,5,6,7,8,9].map(n=>`<option value="${n}" ${String(n)===String(ctx.defaults.parry)?'selected':''}>Override · ${n}</option>`).join('')}</select></label>`;
export function readStrikeFields(root){
  const q=name=>root.querySelector(`[name=${name}]`);
  return {damageBonus:q('bonus')?.value,chargeWc:q('chargeWc')?.value,rangeHexes:q('range')?.value,
    field:q('field')?.value,parry:q('parry')?.value,dmLevel:q('dmLevel')?.value,dmClosing:q('dmClosing')?.value,
    dmBraced:q('dmBraced')?.checked===true,dmGrasp:q('dmGrasp')?.checked===true};
}

export async function reviewShot(combat,combatantId){
  const shot=combat.getFlag('phoenix-command',`shots.${combat.timing.entries[combatantId]?.activity?.shotId}`);
  if(!shot||shot.status!=='ready')throw new Error('Complete paid aim before reviewing this shot.');
  const moving=movedThisPhase(combat.timing,combatantId);
  const previous={...preparationDefaults(combat.combatants.get(combatantId)?.actor?.system.condition,moving),
    ...shot.adjudication?.choices,...(moving?{firingStance:false,braced:false}:{})};
  if(shot.plan.kind==='strike'){
    const ctx=strikeReviewContext(combat,combatantId,shot.adjudication?.choices??{}),d=ctx.defaults;
    return foundry.applications.api.DialogV2.prompt({window:{title:'Review strike'},content:`
      <div class="pc-dialog"><p class="pc-record-kicker">TACTICAL REVIEW · STRIKE</p>
      <div class="pc-telemetry"><span class="pc-chip" data-state="ready">${e(ctx.stroke)}</span><span class="pc-chip">${ctx.sets} SET${ctx.sets===1?'':'S'} PAID</span><span class="pc-chip" data-tone="${ctx.stationary?'good':'warn'}">${ctx.stationary?'STATIONARY':'MOVED'}</span>${ctx.defaultColumn?`<span class="pc-chip" data-state="ready">PARRY ${ctx.defaultColumn}</span>`:''}</div>
      <p><strong>${e(ctx.defender?.name??'Defender')}</strong> · ${e(ctx.loadout.resolved?ctx.loadout.label:ctx.loadout.reason)}</p>
      <p class="pc-help">${ctx.defence?`${e(ctx.defence.label)} is active and supplies Column ${ctx.defence.parryColumn}.`:`Ledger: ${ctx.activity.parryActions} parry, ${ctx.activity.recoverActions} recover, ${ctx.activity.setActions} set action(s). ${ctx.available} full parr${ctx.available===1?'y':'ies'} for the defender to allocate.`}</p>
      <p class="pc-help">${ctx.field.outside===null?`Facing unresolved: ${e(ctx.field.error)}`:`Attacker is ${Math.round(ctx.field.difference)}° off defender facing · ${ctx.field.outside?'outside':'inside'} the Field of Attack.`}</p>
      ${strikeFields(ctx)}</div>`,
      ok:{label:'Save review',callback:(event,button,dialog)=>strikeChoices(ctx,readStrikeFields(dialog.element))},rejectClose:false});
  }
  if(shot.plan.kind==='grenade'||shot.plan.kind==='launcher'||shot.plan.explosive){
    // Surroundings (Table 5B) depend on where the round lands, so they are confirmed after
    // the hit and scatter roll, for the people it reaches. Only the throw is reviewed here.
    const intro=shot.plan.explosive
      ?`<p class="pc-help">Aim is paid; the burst's rounds land spread across the chosen arc.</p>`
      :shot.plan.kind==='launcher'
      ?`<p class="pc-help">Aim is paid; the launcher targets the selected token's hex.</p>`
      :`<p class="pc-help">Arm time and aim are paid; the grenade targets the selected token's hex.</p>`;
    return foundry.applications.api.DialogV2.prompt({window:{title:shot.plan.explosive?'Review grenade burst':shot.plan.kind==='launcher'?'Review launcher shot':'Review grenade throw'},content:`
      <div class="pc-dialog"><p class="pc-record-kicker">TACTICAL REVIEW · EXPLOSIVE</p>${intro}
      <label>Visibility<select name="visibility" required>${firearmOptions.visibility.map(v=>`<option value="${e(v)}" ${v===(previous.visibility?.[0]??'Good Visibility')?'selected':''}>${e(v)}</option>`).join('')}</select></label>
      <label class="pc-custom-toggle"><input name="elevated" type="checkbox" ${previous.elevatedHex?'checked':''}> Highly elevated hex (+15)</label>
      <label class="pc-custom-toggle"><input name="shrapnelSize" type="checkbox" ${previous.applyShrapnelSize?'checked':''}> Adjust shrapnel for target size (§3.7)</label>
      <p class="pc-help">Cover and surroundings are confirmed after it lands, for the people the blast reaches.</p></div>`,
      ok:{label:'Save review',callback:(event,button,dialog)=>{
        const form=dialog.element;
        return explosiveChoices({visibility:form.querySelector('[name=visibility]').value,elevatedHex:form.querySelector('[name=elevated]').checked,
          applyShrapnelSize:form.querySelector('[name=shrapnelSize]').checked});
      }},rejectClose:false});
  }
  const reaction=combat.reactionInputForShot(shot);
  // What the map says, before anyone is asked anything. A mapped scene answers for itself;
  // an unmapped one says so, and the GM states the cover as he did before.
  const shooterToken=combat.combatants.get(combatantId)?.token?.object;
  const targetToken=combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid)?.token?.object;
  const reading=shooterToken&&targetToken
    ?sceneCover(combat.scene,shooterToken.center,targetToken.center)
    :{mapped:false,cover:null,ambiguous:false,detail:'Both tokens must be on the viewed scene for the map to be read.'};
  const sceneAnswers=reading.mapped&&!reading.ambiguous;
  const reactionNote=reaction?`<p class="pc-help">Reactions: shooter ${reaction.shooterDucking?'ducking (−10)':'holding'}, target ${reaction.targetDucking?'ducking (−5)':'holding'}.</p>`:'<p class="pc-help">No ducking penalty on this shot.</p>';
  const select=(name,label,rows,value)=>`<label>${label}<select name="${name}" required><option value="">Choose…</option>${rows.map(([k,v])=>`<option value="${e(k)}" ${k===value?'selected':''}>${e(v)}</option>`).join('')}</select></label>`;
  return foundry.applications.api.DialogV2.prompt({window:{title:'Review shot for owner roll'},content:`
    <div class="pc-dialog"><p class="pc-record-kicker">TACTICAL REVIEW · FIRE</p><p class="pc-help">Aim, ammunition, range, posture, movement, reactions, and target size are derived. Confirm only environmental state.</p>
    ${reactionNote}
    ${shot.plan.kind==='shot'?`<label>Aim at<select name="calledShot"><option value="">Whole exposed target</option>${['Head','Body','Legs'].map(name=>`<option value="${name}" ${previous.calledShot===name?'selected':''}>${name}</option>`).join('')}</select></label>`:''}
    <p>${sceneAnswers?`<strong>Read from the map:</strong> ${e(reading.cover?`${reading.cover.label}, PF ${reading.cover.pf}`:'no cover \u2014 he is in the open')}. ${e(reading.detail)}`:`<strong>The map cannot answer:</strong> ${e(reading.detail)}`}</p>
    ${select('cover','Cover (Table 7C)',[...(sceneAnswers?[['scene','Use what the map says']]:[]),['open','None \u2014 the target is in the open'],...coverMenu,['adjudicated','Not on Table 7C \u2014 adjudicate']],previous.coverKey??(sceneAnswers?'scene':'open'))}
    ${select('coverStance','Behind that cover he is',[['firing-over','Firing over or around it'],['looking-over','Looking over or around it']],previous.cover?.stance??savedCoverStance(targetToken?.actor?.system.condition,{moving:movedThisPhase(combat.timing,combat.combatants.find(c=>c.token?.uuid===shot.plan.targetUuid)?.id)}))}
    <details><summary>Adjudicated cover</summary><label>Protection Factor<input name="coverPF" type="number" min="0" step="any" value="${e(previous.cover?.pf??'')}"></label><label>What it is<input name="coverReason" value="${e(previous.cover?.label??'')}"></label>
    <p>\u00a73.8 compares the round\u2019s PEN with this Protection Factor. Greater PEN means the cover is nonblocking: the round goes through it, the whole target area is used for the Target Size ALM, and the cover\u2019s PF comes out of the round\u2019s penetration. PEN equal or less means the cover blocks, and only what he shows over it can be struck.</p></details>
    ${select('stance','Firing stance',[['hip','Unprepared: hip fire (−6)'],['prepared','GM confirms prepared stance']],previous.firingStance?'prepared':'hip')}
    <label><input name="braced" type="checkbox" ${previous.braced?'checked':''}> GM confirms braced</label>
    ${select('visibility','Visibility',firearmOptions.visibility.map(v=>[v,v]),previous.visibility?.[0]??'Good Visibility')}
    ${shot.plan.kind==='shotgun'?`<label class="pc-custom-toggle"><input name="pelletWidth" type="checkbox" ${previous.applyPelletWidth?'checked':''}> Apply pellet width</label>
    <label class="pc-custom-toggle"><input name="grouping" type="checkbox" ${previous.pelletGrouping==='random'?'checked':''}> Randomize later pellets</label>
    <details><summary>Shotgun options</summary><p class="pc-help">Width off uses the weapon's Base Pellet Hit Chance. Grouping off rolls each pellet on its own.</p></details>`:''}
    ${shot.plan.kind==='shot'?'<label><input name="reuse" type="checkbox" checked> Reuse these conditions for this unchanged weapon and sightline</label><p class="pc-help">Review again after movement, posture, cover or lighting changes. Use Review shot to change approved visibility or stance.</p>':''}
    <p class="pc-help">Defaults: unbraced hip fire, good visibility. Unknown or overlapping armor requires confirmation after a hit.</p></div>`,
    ok:{label:'Save review',callback:(event,button,dialog)=>{
      const form=dialog.element,read=n=>form.querySelector(`[name=${n}]`).value;
      const stated=readCover(form);
      // `undefined` means "leave it to the map"; anything else is the GM saying otherwise,
      // and an override against a map that has an answer is recorded as one.
      return {calledShot:form.querySelector('[name=calledShot]')?.value||null,reuseConditions:form.querySelector('[name=reuse]')?.checked===true,cover:stated,coverKey:read('cover'),coverStance:read('coverStance'),
        ...(stated!==undefined&&sceneAnswers?{coverOverride:true}:{}),
        firingStance:read('stance')==='prepared',braced:form.querySelector('[name=braced]').checked,visibility:[read('visibility')],
        ...(shot.plan.kind==='shotgun'?{applyPelletWidth:form.querySelector('[name=pelletWidth]').checked,pelletGrouping:form.querySelector('[name=grouping]').checked?'random':false}:{})};
    }},rejectClose:false});
}

const armorChoices = {
  cutting: [['NO', 'NO'], ['LT', 'LT'], ['ML', 'ML'], ['BR', 'BR'], ['PL', 'PL']],
  stabbing: [['NO', 'NO'], ['LT', 'LT'], ['ML', 'ML'], ['BR', 'BR'], ['PL', 'PL']],
  flange: [['0', 'BPF 0'], ['1', 'BPF 1'], ['2', 'BPF 2'], ['3', 'BPF 3'], ['3+', 'BPF 3+']],
  blunt: [['0', 'BPF 0'], ['1', 'BPF 1'], ['2', 'BPF 2'], ['3', 'BPF 3'], ['3+', 'BPF 3+']]
};

export async function confirmMeleeArmor(location, family = 'cutting', reason = null) {
  const lines = [...(armorChoices[family] ?? armorChoices.cutting), ['I', 'Impenetrable — divide the ID by its BPF and read the blunt table']];
  const answer = await foundry.applications.api.DialogV2.prompt({
    window: { title: 'Armor at the strike' }, position: { width: 460 },
    content: `<div class="pc-dialog"><p class="pc-record-kicker">IMPACT PROTECTION</p><p>${e(location)}</p>${reason ? `<p role="status">${e(reason)}</p>` : ''}<p class="pc-help">${family === 'flange' || family === 'blunt' ? 'Choose the BPF at this location.' : 'Choose the armor class at this location.'}</p>
      <label>Protection<select name="armorClass">${lines.map(([id, label]) => `<option value="${e(id)}">${e(label)}</option>`).join('')}</select></label>
      <label>BPF, if impenetrable<input name="bpf" type="number" min="1" step="1" value="3"></label></div>`,
    ok: { label: 'Confirm', callback: (_event, _button, dialog) => {
      const armorClass = dialog.element.querySelector('[name=armorClass]').value;
      if (armorClass !== 'I') return { armorClass };
      return { armorClass, bluntProtectionFactor: Number(dialog.element.querySelector('[name=bpf]').value) };
    } },
    rejectClose: false
  });
  if (!answer || !lines.some(([id]) => id === answer.armorClass)) throw new Error('Choose the protection on the location that was struck.');
  if (answer.armorClass === 'I' && !(answer.bluntProtectionFactor >= 1)) throw new Error('Impenetrable armor needs its BPF.');
  return answer;
}

export async function openSavedShot(combat,combatantId){
  if(game.combat?.id!==combat.id)throw new Error('Activate this encounter before opening its saved shot.');
  const c=combat.combatants.get(combatantId),shot=combat.getFlag('phoenix-command',`shots.${combat.timing.entries[combatantId]?.activity?.shotId}`);
  const target=combat.combatants.find(c=>c.token?.uuid===shot?.plan.targetUuid)?.token?.object;
  if(!c?.token?.object||!target)throw new Error('View the encounter scene first.');
  c.token.object.control({releaseOthers:true});
  target.setTarget(true,{releaseOthers:true});
  const {PhoenixAttackFlow}=await import('./foundry-calculator.mjs');
  return new PhoenixAttackFlow({actor:c.actor,selection:{itemId:shot.plan.weaponId,modeId:shot.plan.modeId,kind:'firearm'}}).render({force:true});
}
