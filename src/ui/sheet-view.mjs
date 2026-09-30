import {weaponRof} from './weapon-rof.mjs';
import {woundDiagram} from './wound-diagram.mjs';
import {armorDiagram} from './armor-diagram.mjs';
import {weaponImage} from '../data/weapon-images.mjs';
import {ammunitionPackageCount} from '../rules/ammunition-weight.mjs';
import {situationLabel} from './situation.mjs';
import {recoveryClock} from '../rules/recovery-clock.mjs';
import {criticalTime,formatRemaining} from '../rules/critical-time.mjs';
import { escapeHTML as e } from '../foundry/context.mjs';
import { playsMelee } from '../rules/attacks.mjs';
import { summarizeInjuries, summarizeInventory, inspectLoadout } from '../rules/summary.mjs';
import { generateCharacter, shotAccuracy, describeCharacteristic } from '../rules/character-creation.mjs';
import { recoveryAttemptStatus } from './recovery.mjs';
export const attributeLabels = { strength: 'Strength', intelligence: 'Intelligence', will: 'Will', health: 'Health', agility: 'Agility' };
export const skillLabels = { gun: 'Gun combat', melee: 'Hand-to-hand', unarmed: 'Unarmed' };
const display = value => value === null || value === undefined || value === '' ? '—' : e(value);
const titleCase = text => String(text).replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, c => c.toUpperCase());
const openItem = item => `<button type="button" class="pc-link" data-action="item" data-item-id="${e(item.id)}">${e(item.name)}</button>`;
let helpId=0;
const help = (label, text) => {
  const id=`pc-sheet-help-${++helpId}`;
  return `<span class="pc-inline-help"><button type="button" aria-label="${e(label)}" aria-describedby="${id}">ⓘ</button><span id="${id}" class="pc-help-tooltip" role="tooltip" popover="auto">${e(text)}</span></span>`;
};
const metric = (label, value) => `<div class="pc-metric"><span>${e(label)}</span><strong>${display(value)}</strong></div>`;
const table = (head, rows) => `<div class="pc-table-scroll"><table><thead><tr>${head.map(h=>`<th scope="col">${e(h)}</th>`).join('')}</tr></thead><tbody>${rows.join('')}</tbody></table></div>`;
const row = values => `<tr>${values.map(v=>`<td>${v}</td>`).join('')}</tr>`;

// LEG10204 §1.2 Steps 5-7 beside the small-arms factors. Shown once a Hand-to-Hand skill is
// recorded; a gun-only character is not asked for one.
export function handToHandFactors(hand, skill) {
  if (skill === null || skill === undefined) return '';
  if (!hand?.resolved) return `<p class="pc-sheet-muted">Hand-to-hand: ${e(hand?.detail ?? 'not yet known')}</p>`;
  return `<div class="pc-combat-factors pc-hand-factors" aria-label="Hand-to-hand factors">${metric('Hand-to-hand · CA', `${hand.combatActions}/phase`)}${metric('H2H impulses', hand.schedule.join(' / '))}${metric('Damage bonus · DB', hand.damageBonus)}${metric('Combat effectiveness · CE', hand.combatEffectiveness)}${metric('Agility skill factor · ASF', hand.agilitySkillFactor)}</div>`;
}

// §2.10 as it stands on the world clock now, not as it was when recovery was resolved.
const clockStates={incapacitated:'Incapacitated',recent:'Recently wounded',healing:'Healing',healed:'Healed',unknown:'Healing'};
export function recoveryNow(recovery,now=globalThis.game?.time?.worldTime){
  const clock=recoveryClock(recovery,now);
  const days=Number.isFinite(clock.daysRemaining)?Number(clock.daysRemaining.toFixed(1)):recovery.healingTimeDays;
  const status=clock.state==='incapacitated'?`${clockStates.incapacitated} · ${Math.ceil(clock.remainingSeconds/60)} min left`:clockStates[clock.state]??'';
  return `<p class="pc-recovery-status">${e(status)}</p><div class="pc-recovery-metrics">${metric('Healing · days left',days)}${metric('Action penalty now',clock.woundPenalty)}</div>${clock.detail?`<p class="pc-sheet-muted">${e(clock.detail)}${clock.basis?` Counted ${e(clock.basis)}.`:''}</p>`:''}`;
}

// §2.9's Critical Time Period for wounds not yet resolved, counted from the wound on the world
// clock against the care the GM recorded as reached.
export function criticalTimeBlock(system,physicalDamage,{now=globalThis.game?.time?.worldTime,gm=globalThis.game?.user?.isGM===true,editable=false}={}){
  const ct=criticalTime({injuries:system.injuries,recovery:system.recovery,health:system.attributes?.health,physicalDamage,aid:system.aid,now});
  if(['none','superficial'].includes(ct.state))return '';
  const control=gm&&editable?'<button type="button" data-action="careReached">Care reached…</button>':'';
  if(ct.state==='unknown')return `<div class="pc-critical-time"><p class="pc-sheet-muted">${e(ct.detail)}</p>${control}</div>`;
  const heading=ct.state==='due'?`<p role="alert"><strong>Critical time ended</strong> · ${e(ct.label)}</p>`
    :ct.state==='no-ctp'?`<p><strong>${e(ct.label)}</strong> · no Critical Time Period</p>`
    :`<p><strong>Critical time · ${e(formatRemaining(ct.remainingSeconds))} left</strong> · ${e(ct.label)} (${e(ct.criticalTimePeriod)})</p>`;
  return `<div class="pc-critical-time" data-tone="${ct.state==='due'||ct.automaticDeath?'danger':'warn'}">${heading}<p class="pc-sheet-muted">${e(ct.detail)}</p>${control}</div>`;
}

// §2.9 and §2.10's aftermath. Nothing is shown as a number until a recovery is actually
// resolved: an unresolved recovery is not a survival, and the panel says so rather than
// printing zeroes.
function recoveryPanel(recovery, physicalDamage, offerControl, attemptStatus=null) {
  const interrupted=attemptStatus?.kind==='interrupted-die';
  const pending=attemptStatus?.kind==='pending';
  const control = offerControl
    ? `<button type="button" data-action="recovery">${interrupted?'Reconcile interrupted recovery':pending?'Continue unfinished recovery':recovery?.outcome && recovery.outcome !== 'unknown' ? 'Resolve again' : 'Resolve recovery'}</button>`
    : '';
  if (interrupted||pending) {
    return `<p role="alert">${e(attemptStatus.detail)}</p>
      <p class="pc-sheet-muted">Only the coordinating GM can repair this. Recording the observed die continues without a new roll; abandoning clears the attempt.</p>${control}`;
  }
  if (!recovery || recovery.outcome === 'unknown' || !recovery.outcome) {
    return `<p class="pc-sheet-muted">${physicalDamage > 0
      ? 'Recovery not resolved.'
      : 'No wounds recorded.'}</p>${control}`;
  }
  // A man who did not survive has no healing time and no action penalty to speak of. The
  // record keeps them because they were part of the resolution; the panel does not show
  // them, because they no longer describe him.
  const survived = recovery.outcome === 'survived';
  const facts = [
    ['Medical care', recovery.care && recovery.care !== 'unknown' ? `${titleCase(recovery.care.replace(/-/g, ' '))}${recovery.techLevel ? ` · technology ${recovery.techLevel}` : ''}` : 'Not recorded'],
    ['Critical time', recovery.criticalTimePeriod || 'Not recorded'],
    ...(survived ? [['Incapacitated for',recovery.incapacitationTime || 'Not recorded']] : [])
  ];
  return `<p class="pc-recovery-outcome">${e(titleCase(recovery.outcome))}</p>
    ${survived ? recoveryNow(recovery) : ''}
    <dl class="pc-recovery-facts">${facts.map(([label,value])=>`<div><dt>${e(label)}</dt><dd>${e(value)}</dd></div>`).join('')}</dl>
    ${control}
    <details><summary>Recovery calculation & source</summary>
      <p>Damage total: ${display(Number.isFinite(recovery.damageTotal) ? Number(recovery.damageTotal.toFixed(2)) : null)} · Table 8A line ${display(recovery.tableLine)}</p>
      <p>${recovery.recoveryRoll === null ? 'No roll printed — automatic death.' : `Rolled ${display(recovery.roll)} against ${display(recovery.recoveryRoll)}.`}</p>
      ${survived && recovery.healingReducedByDays ? `<p>Trauma centre care reduced healing by ${display(recovery.healingReducedByDays)} days.</p>` : ''}
      <p class="pc-sheet-muted">${e(recovery.source || '')}</p></details>`;
}

// §1.3's chain on the sheet. Every line says which step of the book produced it, and an
// unresolved step says why rather than showing a dash that could be mistaken for a zero.
function derivationPanel(made) {
  const line = (entry, format = v => v) => {
    const label = `${e(entry.title)} <span class="pc-sheet-muted">\u00b7 Step ${entry.step}</span>`;
    return entry.resolved === false
      ? `<div class="pc-stat-row pc-unresolved"><span>${label}</span><strong title="${e(entry.detail ?? '')}">\u2014</strong></div>
         <p class="pc-sheet-muted">${e(entry.detail ?? 'Not yet derivable.')}</p>`
      : `<div class="pc-stat-row"><span>${label}</span><strong>${display(format(entry.value))}</strong></div>`;
  };
  const { steps } = made;
  return `${line(steps.encumbrance, v => `${Number(v.toFixed(2))} lb`)}
    ${line(steps.baseSpeed)}${line(steps.maximumSpeed)}
    ${line(steps.skillAccuracyLevel)}${line(steps.intelligenceSkillFactor)}
    ${line(steps.combatActions)}${line(steps.knockoutValue)}
    <div class="pc-rule-note">
      <p class="pc-sheet-muted">§1.3 · Tables 1A–1E. Calculated from characteristics, gun skill, and carried weight.</p></div>
`;
}

// §1.3 Step 9: "Shot Accuracy = Aim Time Mod (Weapon Data Table) + SAL (Step 5)". The status
// sheet shows the adjusted result by aim time, and explicitly labels raw modifiers
// when the Skill Accuracy Level is not yet known.
function shotAccuracyTable(aimModifiers, sal) {
  const rows = Object.entries(aimModifiers ?? {});
  if (!rows.length) return '<p class="pc-sheet-muted">No aim time modifiers recorded for this mode.</p>';
  if (!sal.resolved) return `${table(['Aim actions', ...rows.map(([n])=>n)], [row(['Aim modifier', ...rows.map(([,v])=>display(v))])])}
    <p class="pc-rule-note">Record a gun skill to calculate shot accuracy.</p>`;
  const column = shotAccuracy({ aimModifiers, skillAccuracyLevel: sal.value });
  return `${table(['Aim actions', ...column.rows.map(r=>String(r.aimActions))],
    [row(['Shot accuracy', ...column.rows.map(r=>`<strong>${display(r.shotAccuracy)}</strong>`)])])}
    <p class="pc-rule-note">Includes SAL ${sal.value>=0?'+':''}${e(sal.value)}</p>`;
}

export function actorSheetHTML(actor, { editing = false, editable = false } = {}) {
  const s = actor.system, items = actor.items;
  const injury = summarizeInjuries(s.injuries, s.attributes.health);
  const inventory = summarizeInventory(items), issues = inspectLoadout(items);
  // §1.3's nine steps, run over what the sheet already knows. Encumbrance is Step 3, which
  // is the carried weight the inventory has already totalled.
  const made = generateCharacter({ characteristics: s.attributes, gunCombatSkill: s.skills.gun,
    handToHandSkill: s.skills.melee, unarmedSkill: s.skills.unarmed, encumbranceLb: inventory.totalWeightLb });
  const armor = items.filter(i=>i.type==='armor' && i.system.carried && i.system.equipped);
  const weapons = items.filter(i=>i.type==='weapon');
  const action = (item, kind, modeId, attackId, label, supported) => {
    const ready = editable && supported && item.system.carried && item.system.equipped && !editing;
    const control = ready
      ? `<button type="button" class="pc-attack" data-action="attack" data-item-id="${e(item.id)}" data-kind="${kind}" data-mode-id="${e(modeId)}" data-attack-id="${e(attackId)}">${e(label)} <span aria-hidden="true">↗</span></button>`
      : `<span class="pc-sheet-muted">${e(label)} · ${!editable ? 'View only' : supported ? (editing ? 'Save to use' : 'Equip to use') : 'Not yet supported'}</span>`;
    return control;
  };
  const firearmRows = weapons.flatMap(item=>Object.entries(item.system.firearmModes ?? {}).map(([id,mode])=>`<article class="pc-weapon pc-firearm-card">
    <div class="pc-weapon-overview ${weaponImage(item)?'pc-has-art':''}">
    ${weaponImage(item)?`<div class="pc-weapon-art"><img src="${e(weaponImage(item))}" alt="${e(item.name)}" loading="lazy"></div>`:''}
    <div class="pc-weapon-heading"><div><p class="pc-weapon-eyebrow">${item.system.carried && item.system.equipped ? 'Equipped' : 'Stowed'} · ${e(id)}</p>${openItem(item)}<p>${e(item.system.loaded?.chamber==='ready'?'Round chambered':'')}</p></div>${action(item,'firearm',id,'single','Single shot',mode.fireTypes?.includes('single'))}</div>
    <div class="pc-weapon-stats">${metric('Loaded',item.system.loaded?.rounds)}${editable && !editing ? `<button type="button" data-action="loadGun" data-item-id="${e(item.id)}" data-mode-id="${e(id)}">Load gun</button>` : ''}${metric('Reload · actions',mode.reloadTimeActions)}${metric('ROF',weaponRof(mode).value)}${help('About rate of fire',weaponRof(mode).detail)}${metric('Weight · lb',item.system.weightLb)}</div></div>
    <div class="pc-aim-reference"><div class="pc-help-heading"><h3>Aim & shot accuracy</h3>${help('About shot accuracy','Aim modifiers include your Skill Accuracy Level (SAL). Range, target exposure, and other modifiers are applied when firing.')}</div>${shotAccuracyTable(mode.aimModifiers, made.steps.skillAccuracyLevel)}</div>
    <details><summary>Range, penetration & damage tables</summary>
    ${Object.entries(mode.ammunition ?? {}).map(([ammo,data])=>`<h4>${e(ammo)}</h4>${table(['Range · ft','PEN','DC'],Object.values(data.ranges ?? {}).sort((a,b)=>a.distanceFeet-b.distanceFeet).map(b=>row([display(b.distanceFeet),display(b.penetration),display(b.damageClass)])))}`).join('')}</details></article>`));
  const meleeRows = weapons.flatMap(item=>Object.entries(item.system.meleeModes ?? {}).map(([id,mode])=>`<article class="pc-weapon">
    <div class="pc-weapon-heading"><div>${openItem(item)}<p>${e(mode.grip || id)}</p></div><div class="pc-attack-list">${Object.entries(mode.attacks ?? {}).map(([attackId,a])=>action(item,'melee',id,attackId,titleCase(a.motion),mode.skill==='melee' && playsMelee(a))).join('')}</div></div>
    <div class="pc-weapon-stats">${metric('Speed · WS',mode.weaponSpeed)}${metric('Class · WC',mode.weaponClass)}${metric('Reach · ft',`${mode.reachMinFeet ?? '—'}–${mode.reachMaxFeet ?? '—'}${mode.tipReachFeet != null ? ` · tip ${mode.tipReachFeet}` : ''}`)}${metric('Prepared sets',mode.preparation?.sets)}</div>
    <p class="pc-sheet-muted">${mode.preparation?.recoveryRequired ? 'Recover before the next strike.' : ''}</p>
    <details><summary>Inspect attack data</summary>${table(['Attack','Damage family','Impact'],Object.entries(mode.attacks ?? {}).map(([key,a])=>row([e(key),e(a.damageFamily),e(a.impactFormula)])))}</details></article>`));
  const ammunition = items.filter(i => i.type === 'ammunition');
  return `<div class="pc-record pc-character-record">
    <header class="pc-record-header">${editable?`<button type="button" class="pc-portrait-button" data-action="portrait" aria-label="Change character portrait" title="Change character portrait"><img src="${e(actor.img)}" alt="Character portrait" data-edit="img"></button>`:`<img src="${e(actor.img)}" alt="Character portrait">`}<div><p class="pc-record-kicker">PHOENIX COMMAND <span>CHARACTER RECORD</span></p>${editing ? '<div data-field="name"></div>' : `<h1>${e(actor.name)}</h1>`}${actor.identity?`<div class="pc-sheet-muted"><strong>${e(actor.identity.label)}</strong>${help('About this character record',actor.identity.detail)}</div>`:''}</div><div class="pc-record-tools">${editable ? editing ? '<button type="button" disabled title="Save or cancel your edits before generating characteristics.">Generate characteristics…</button><button type="button" data-action="cancelEdit">Cancel</button><button type="submit" class="pc-save">Save character</button>' : '<button type="button" data-action="generate">Generate characteristics…</button><button type="button" data-action="editCharacter">Edit character</button>' : '<span class="pc-sheet-muted">View only</span>'}</div></header>
    <section class="pc-record-panel pc-play" aria-label="Combat quick reference">
      <div class="pc-combat-heading"><div class="pc-help-heading"><h2>Combat actions per impulse</h2>${help('About combat actions','Base allowance across four impulses. The combat tracker shows encounter adjustments and actions remaining.')}</div><span class="pc-phase-total">${made.allowance.resolved ? `${display(made.allowance.value)} actions / phase` : 'Allowance not yet known'}</span></div>
      <div class="pc-impulse-schedule">${[1,2,3,4].map((impulse,index)=>`<div><span>Impulse ${impulse}</span><strong>${display(made.allowance.resolved ? made.allowance.schedule[index] : null)}</strong><small>actions</small></div>`).join('')}</div>
      ${!made.allowance.resolved ? `<p class="pc-sheet-warning">${inventory.missingWeightIds.length ? `Set weight or turn off Carried: ${inventory.missingWeightIds.map(id=>openItem(items.find(item=>item.id===id))).join(', ')}.` : e(made.allowance.detail ?? 'Complete characteristics and gun skill to calculate actions.')}</p>` : ''}
      <div class="pc-combat-factors">${metric('Skill accuracy · SAL',made.steps.skillAccuracyLevel.resolved ? made.steps.skillAccuracyLevel.value : null)}${metric('Maximum speed',made.steps.maximumSpeed.resolved ? made.steps.maximumSpeed.value : null)}${metric('Knockout value',made.steps.knockoutValue.resolved ? made.steps.knockoutValue.value : null)}${metric('Physical damage · PD',injury.physicalDamage)}</div>
      ${handToHandFactors(made.handToHand, s.skills.melee)}
      <div class="pc-telemetry">${editable&&!editing?`<button type="button" data-action="situation">Situation · ${e(situationLabel(s.condition)??'Choose')}</button>`:`<span class="pc-chip">${e(situationLabel(s.condition)??'Situation not recorded')}</span>`}<span class="pc-chip">${e(titleCase(s.condition.consciousness))}</span>${injury.disabledRegions.length ? `<span class="pc-chip" data-tone="danger">Disabled: ${injury.disabledRegions.map(r => e(titleCase(r))).join(' · ')}</span>` : ''}${s.condition.actionPenalty ? `<span class="pc-chip" data-tone="warn">Manual action penalty: ${display(s.condition.actionPenalty)}</span>` : ''}${recoveryClock(s.recovery,globalThis.game?.time?.worldTime).woundPenalty ? `<span class="pc-chip" data-tone="warn">Wound action penalty: ${display(recoveryClock(s.recovery,globalThis.game?.time?.worldTime).woundPenalty)}</span>` : ''}</div>
    </section>
    <div class="pc-record-columns"><div class="pc-primary-column">
    <section class="pc-record-panel pc-weapons"><div class="pc-section-heading"><h2>Weapons & attacks</h2>${editable && !editing ? '<button type="button" data-action="gunCatalog">Choose a gun</button><button type="button" data-action="meleeCatalog">Choose a hand weapon</button>' : ''}</div>${firearmRows.join('') || '<p class="pc-empty">Choose a gun to get started.</p>'}${meleeRows.length ? `<h3>Hand-to-hand</h3>${meleeRows.join('')}` : ''}
      <div class="pc-ammo-stock"><h3>Ammunition · total rounds</h3>${ammunition.map(item => `<div class="pc-stat-row">${openItem(item)}<strong>${e(item.system.quantity)}</strong>${editable && !editing ? `<button type="button" class="pc-remove-item" data-action="removeItem" data-item-id="${e(item.id)}" aria-label="Remove ${e(item.name)} from character">Remove</button>` : ''}</div>`).join('') || '<p class="pc-empty">No ammunition recorded.</p>'}<p class="pc-rule-note">Includes loaded rounds.</p>${editable && !editing ? '<button type="button" data-action="addItem" data-type="ammunition">Add ammunition</button>' : ''}</div>
    </section>
      <section class="pc-record-panel pc-status"><h2>Condition & recovery</h2>
        <div class="pc-condition-layout">
          <div class="pc-condition-injuries"><div class="pc-help-heading"><h3>Injuries</h3>${help('About damage total','Damage total = PD × 10 ÷ Health. Recovery uses the next lower printed line in Table 8A.')}</div>
            <div class="pc-condition-metrics">${metric('Physical damage · PD',injury.physicalDamage)}${metric('Damage total · DT',Number.isFinite(injury.damageTotal)?Number(injury.damageTotal.toFixed(1)):null)}</div>
            ${woundDiagram(s.injuries)}
            <div class="pc-disability-summary"><h4>Disabled regions</h4>${injury.disabledRegions.length ? `<div class="pc-telemetry">${injury.disabledRegions.map(r=>`<span class="pc-chip" data-tone="danger">${e(titleCase(r))}</span>`).join('')}</div>` : '<p class="pc-sheet-muted">None recorded</p>'}</div>
          </div>
          <div class="pc-condition-recovery"><h3>Medical aid & recovery</h3>${criticalTimeBlock(s,injury.physicalDamage,{editable:editable&&!editing})}${recoveryPanel(s.recovery, injury.physicalDamage, editable && !editing, recoveryAttemptStatus(actor.recoveryAttempt))}</div>
        </div>
        ${Object.keys(s.injuries).length ? `<details class="pc-injury-history"><summary>Injury history · ${Object.keys(s.injuries).length}</summary>${table(['Location','Side','PD','Status'],Object.values(s.injuries).map(i=>row([e(i.location),e(i.side),display(i.physicalDamage),e(titleCase(i.status))])))}</details>` : ''}
        ${editing ? '<div class="pc-condition-edit"><h3>Current condition</h3><div data-field="system.condition.posture"></div><div data-field="system.condition.consciousness"></div><div data-field="system.condition.speedFeetPerSecond"></div><div data-field="system.condition.actionPenalty"></div><div data-field="system.hands.dominant"></div></div>' : (s.condition.speedFeetPerSecond!=null?`<div class="pc-movement-note"><span>Movement note</span><strong>${display(s.condition.speedFeetPerSecond)} ft / second</strong>${help('About movement notes','Reference only. Encounter movement is tracked separately.')}</div>`:'')}
      </section>
    </div><aside class="pc-support-column" aria-label="Character and loadout">
      <section class="pc-record-panel pc-characteristics"><h2>Characteristics</h2>
        ${Object.entries(attributeLabels).map(([key,label])=>editing ? `<div data-field="system.attributes.${key}"></div>` : `<div class="pc-stat-row pc-characteristic-row" title="${e(describeCharacteristic(s.attributes[key]) ?? 'Not recorded')}"><span>${label}</span><strong>${display(s.attributes[key])}</strong> <span class="pc-sheet-muted">${e(describeCharacteristic(s.attributes[key]) ?? '')}</span></div>`).join('')}
        <h3>Combat skills</h3>${Object.entries(skillLabels).map(([key,label])=>editing ? `<div data-field="system.skills.${key}"></div>` : `<div class="pc-stat-row"><span>${label}</span><strong>${display(s.skills[key])}</strong></div>`).join('')}
        ${editable && editing ? '<p class="pc-rule-note">Save edits before generating characteristics.</p>' : ''}<details class="pc-calculation-reference"><summary>How combat values are calculated · §1.3</summary>${derivationPanel(made)}</details>
      </section>
      <section class="pc-record-panel pc-loadout"><h2>Armor & equipment</h2>
        ${armorDiagram(items)}<details class="pc-armor-profiles"><summary>Armor profiles · ${armor.length}</summary>${armor.length ? armor.map(item=>`<div class="pc-armor-entry">${openItem(item)}${Object.values(item.system.coverage ?? {}).map(c=>`<p>${e(titleCase(c.region))} · ${e(c.side)} <span>PF ${display(c.ballisticPF)} · Melee ${display(c.meleeClass)} · BPF ${display(c.bpf)}</span></p>`).join('')}</div>`).join('') : '<p class="pc-empty">No armor equipped.</p>'}</details>
        <div class="pc-help-heading"><h3>Inventory</h3>${help('About inventory','Open an item to change Carried or Equipped. Only carried items contribute to encumbrance.')}</div><ul class="pc-equipment-list">${items.map(item=>`<li data-item-id="${e(item.id)}" class="draggable">${openItem(item)}<span>${item.type==='ammunition'&&item.system.packageCapacity?`${e(item.system.quantity)} rounds · ${ammunitionPackageCount(item.system)} ${e(item.system.packageUnit)}(s) × ${display(item.system.weightLb)} lb`:`${e(item.system.quantity)} × ${display(item.system.weightLb)} lb`} · ${item.system.carried ? 'Carried' : 'Not carried'}${item.system.equipped ? ' · Equipped' : ''}</span>${editable && !editing ? `<button type="button" class="pc-remove-item" data-action="removeItem" data-item-id="${e(item.id)}" aria-label="Remove ${e(item.name)} from character">Remove</button>` : ''}</li>`).join('') || '<li class="pc-empty">No equipment yet.</li>'}</ul>
        <div class="pc-weight">${metric('Carried weight · lb',inventory.totalWeightLb === null ? `${inventory.knownWeightLb.toFixed(2)} + unknown` : Number(inventory.totalWeightLb.toFixed(2)))}</div>
        ${editable && !editing ? `<div class="pc-equipment-controls"><button type="button" data-action="armorCatalog">Choose armor</button><button type="button" data-action="catalog">Choose equipment</button><details><summary>Create a custom item</summary><div class="pc-add-equipment">${['weapon','ammunition','armor','shield','equipment'].map(type=>`<button type="button" data-action="addItem" data-type="${type}">${titleCase(type)}</button>`).join('')}</div><p class="pc-sheet-muted">Choose a gun above or use the equipment and armor catalog. You can also drag existing world Items onto this sheet.</p></details></div>` : ''}
        ${issues.length ? `<details open class="pc-sheet-warning"><summary>${issues.length} loadout issue(s)</summary><ul>${issues.map(issue=>`<li>${e(items.find(i=>i.id===issue.itemId)?.name)}: ${e(titleCase(issue.code))}</li>`).join('')}</ul></details>` : ''}
      </section>
    </aside></div>
    <footer class="pc-record-footer">PHOENIX COMMAND · TACTICAL RECORD</footer>
  </div>`;
}
