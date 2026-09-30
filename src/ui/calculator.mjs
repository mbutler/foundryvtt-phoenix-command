import {recordedShotDefaults} from './attack-draft.mjs';
import { coverMenu, coverFromKey } from './cover-menu.mjs';
import { previewFirearm, resolveFirearm, previewMelee, resolveMelee, firearmOptions, meleeArmorFromCoverage } from '../rules/attacks.mjs';

const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
const options = (items, selected) => items.map(([value, label]) => `<option value="${escape(value)}" ${String(value) === String(selected) ? 'selected' : ''}>${escape(label)}</option>`).join('');
const field = (label, control) => `<label><span>${escape(label)}</span>${control}</label>`;
const select = (name, label, values, value) => field(label, `<select name="${name}">${options(values,value)}</select>`);
const num = (name,label,value,min = 0,max = '',step = 'any') => field(label, `<input name="${name}" inputmode="decimal" type="number" min="${min}" max="${max}" step="${step}" value="${escape(value)}">`);

// Shared DOM view: used inside Foundry and in a standalone developer preview.
// No Foundry globals, no persistence, no hidden rolls, no automatic damage application.
export function mountCalculator(root, { roster, onResult = null, demo = false, initialState = {}, rollDice = null, postResult = null }) {
  let state = { kind: 'firearm', attacker: roster[0]?.id ?? '', target: roster[1]?.id ?? '', unit: 'ft', ...initialState };
  let latest = null;
  let revision = 0;

  const actors = () => roster.map(actor => [actor.id, actor.name]);
  const attacker = () => roster.find(a => a.id === state.attacker);
  const target = () => roster.find(a => a.id === state.target);
  function uses() {
    return (attacker()?.items ?? []).filter(i => i.type === 'weapon').flatMap(weapon =>
      Object.entries(weapon.system[state.kind === 'firearm' ? 'firearmModes' : 'meleeModes'] ?? {}).flatMap(([modeId, mode]) =>
        (state.kind === 'firearm' ? ['single'] : Object.keys(mode.attacks)).map(attackId => ({
          id: `${weapon.id}/${modeId}/${attackId}`, label: `${weapon.name} · ${modeId} · ${attackId}`, weapon, modeId, attackId, mode
        }))));
  }
  function armors() {
    const none = { id: 'none', label: 'Confirmed unarmored at hit location', ballisticPF: 0, meleeClass: 'NO' };
    return [none, ...(target()?.items ?? []).filter(i => i.type === 'armor' && i.system.equipped && i.system.carried)
      .flatMap(item => Object.entries(item.system.coverage).map(([id,c]) => ({ ...c, id: `${item.id}/${id}`, label: `${item.name} · ${c.side} ${c.region}` })))];
  }
  function capture(form) { Object.assign(state, Object.fromEntries(new FormData(form))); }
  function read() {
    if (!target()) throw new Error('Choose a target.');
    const use = uses().find(use => use.id === state.use);
    if (!use) throw new Error('Choose an attacker with an available weapon mode.');
    const readNumber = name => state[name] === undefined || state[name] === '' ? null : Number(state[name]);
    const armor = armors().find(a => a.id === state.armor);
    return {
      weapon: use.weapon, modeId: use.modeId, attackId: use.attackId,
      skill: attacker()?.system.skills?.[state.kind === 'firearm' ? 'gun' : 'melee'],
      defenderSkill: target()?.system.skills?.melee,
      distance: { value: readNumber('range'), unit: state.unit },
      aimActions: readNumber('aim'), ammunitionKey: state.ammo,
      targetSize: state.targetSize, visibility: state.visibility ? [state.visibility] : [],
      situations: state.situation ? [state.situation] : [], shooterSpeed: readNumber('shooterSpeed'),
      targetSpeed: readNumber('targetSpeed'),
      cover: coverFromKey(state.cover, state.coverStance),
      armorPF: armor?.ballisticPF, ...meleeArmorFromCoverage(use.mode.attacks?.[use.attackId], armor),
      sets: readNumber('sets'), damageBonus: readNumber('damageBonus'), parryColumn: readNumber('parry'),
      stationary: state.stationary === 'yes'
    };
  }
  function showResult(result, context) {
    const panel = root.querySelector('[data-result]'); panel.replaceChildren();
    const title = document.createElement('h2');
    title.textContent = result.hit === undefined ? `Hit threshold: ${result.threshold === 'hit' ? 'automatic hit' : '00–' + result.threshold}`
      : result.hit ? `${result.physicalDamage} physical damage` : 'Miss';
    panel.append(title);
    if (result.location) {
      const detail = document.createElement('p');
      detail.textContent = `${result.location}${result.disabled ? ` · Disabling injury${result.shockPhysicalDamage ? ` · +${result.shockPhysicalDamage} Shock PD for knockout` : ''}` : ''}`; panel.append(detail);
    }
    const trace = document.createElement('details');
    const summary = document.createElement('summary'); summary.textContent = 'Show calculation'; trace.append(summary);
    const list = document.createElement('dl');
    for (const entry of result.trace) {
      const term = document.createElement('dt'); term.textContent = entry.label;
      const value = document.createElement('dd'); value.textContent = entry.value; list.append(term,value);
    }
    trace.append(list); panel.append(trace);
    const source = document.createElement('p'); source.className = 'pc-muted'; source.textContent = result.source; panel.append(source);
    if (result.hit !== undefined) {
      const note = document.createElement('p'); note.textContent = 'Calculated only. No injury, ammunition or preparation has been changed.'; panel.append(note);
      if (postResult) {
        const button = document.createElement('button'); button.type = 'button'; button.textContent = 'Share result in chat';
        button.addEventListener('click', async () => {
          button.disabled = true;
          try { await postResult(structuredClone(result), structuredClone(context)); button.textContent = 'Shared in chat'; }
          catch (error) { button.disabled = false; root.querySelector('[data-error]').textContent = error.message; }
        });
        panel.append(button);
      }
    }
  }
  function render() {
    const available = uses();
    if (!available.some(u => u.id === state.use)) state.use = available[0]?.id ?? '';
    const use = available.find(u => u.id === state.use);
    const ammo = Object.keys(use?.mode.ammunition ?? {});
    if (!ammo.includes(state.ammo)) state.ammo = ammo[0] ?? '';
    const isGun = state.kind === 'firearm';
    root.innerHTML = `<div class="pc-calculator">
      <header><p class="pc-eyebrow">PHOENIX COMMAND · COMBAT CALCULATOR</p><h1>Resolve an attack</h1>
      <p>Off-encounter calculation and rules inspection.</p></header>
      ${state.measurement ? `<p class="pc-notice" data-measurement>${escape(state.measurement)} Range is captured when opened; reopen from tokens after movement.</p>` : ''}
      <details><summary>Capability status</summary><p class="pc-muted">Single shots and ordinary cutting slashes. Confirm armor at the rolled location; use the combat tracker for timed encounter actions.</p></details>
      ${demo ? '<nav class="pc-actions"><button type="button" data-example="firearm">Load firearm example</button><button type="button" data-example="melee">Load melee example</button></nav>' : ''}
      <form><section class="pc-grid">
      ${select('kind','Attack type',[['firearm','Firearm · single shot'],['melee','Melee · cutting slash']],state.kind)}
      ${select('attacker','Attacker',actors(),state.attacker)}${select('target','Target',[['','Choose target'],...actors()],state.target)}
      ${select('use','Weapon / attack',available.map(u => [u.id,u.label]),state.use)}
      ${num('range','Measured distance',state.range)}${select('unit','Distance unit',[['ft','Feet'],['m','Meters'],['pccsHex','PCCS hexes (6 ft)'],['meleeHex','Melee hexes (2 ft)']],state.unit)}
      </section><p class="pc-muted">Attacker skill: ${escape(attacker()?.system.skills?.[isGun?'gun':'melee'] ?? 'unknown')} · Defender melee skill: ${escape(target()?.system.skills?.melee ?? 'unknown')}</p>
      <fieldset><legend>${isGun ? 'Shot situation' : 'Stroke and defense'}</legend><section class="pc-grid">
      ${isGun ? `${select('ammo','Ammunition',ammo.map(a=>[a,a]),state.ammo)}${num('aim','Aim actions',state.aim,1,'',1)}
      ${select('targetSize','Target exposure',[['','Choose exposure'],...firearmOptions.targetSizes.map(a=>[a,a])],state.targetSize)}
      ${select('visibility','Visibility',[['','Choose visibility'],...firearmOptions.visibility.map(a=>[a,a])],state.visibility)}
      ${select('situation','Shooter situation (one modifier)',[['','None'],...firearmOptions.situations.map(a=>[a,a])],state.situation)}
      ${num('shooterSpeed','Shooter speed (PCCS hex/impulse)',state.shooterSpeed)}${num('targetSpeed','Target speed (PCCS hex/impulse)',state.targetSpeed)}
      ${select('cover','Cover (Table 7C)',[['','Choose cover'],['open','None \u2014 in the open'],...coverMenu],state.cover)}
      ${select('coverStance','Behind cover he is',[['firing-over','Firing over or around it'],['looking-over','Looking over or around it']],state.coverStance??'firing-over')}`
      : `${select('sets','Prepared stroke',[['','Choose preparation'],['0','Short · no set'],['1','Normal · one set'],['2','Long · two sets']],state.sets)}
      ${num('damageBonus','Character damage bonus (manual)',state.damageBonus)}${num('parry','Resolved parry column (manual)',state.parry,1,9,1)}
      ${select('stationary','Stationary for long stroke?',[['','Choose'],['yes','Yes'],['no','No']],state.stationary)}`}
      </section></fieldset>
      <fieldset><legend>Dice and protection</legend><section class="pc-grid">
      ${num('hit','Hit roll (00–99)',state.hit,0,99,1)}${num('location','Location roll (00–99)',state.location,0,99,1)}
      ${isGun ? num('armorRoll','Armor roll (0–9)',state.armorRoll,0,9,1) : num('impact','Impact die',state.impact,1,'',1)}
      ${select('armor','Armor at the rolled hit location',[['','Choose protection'],...armors().map(a=>[a.id,a.label])],state.armor)}
      </section><label class="pc-confirm"><input type="checkbox" name="confirmedArmor" value="yes" ${state.confirmedArmor === 'yes' ? 'checked' : ''}> I confirmed this armor covers the rolled hit location.</label>
      </fieldset><div class="pc-actions"><button type="button" data-command="preview">Preview odds</button>${rollDice ? '<button type="button" data-command="roll">Roll virtual dice</button>' : ''}<button type="submit" class="pc-primary">Resolve with these rolls</button></div></form>
      <p data-error role="alert" class="pc-error"></p><section data-result aria-live="polite" class="pc-result"><p>Your result will appear here.</p></section>
    </div>`;
    const form = root.querySelector('form');
    form.addEventListener('change', event => {
      revision++; state.confirmedArmor = ''; capture(form); latest = null;
      root.querySelector('[data-result]').textContent = 'Inputs changed. Calculate again.';
      if (['kind','attacker','target','use'].includes(event.target.name)) {
        delete state.measurement;
        for (const key of ['range','armor','confirmedArmor','hit','location','impact','armorRoll','targetSize','targetSpeed','cover','coverStance']) delete state[key];
        if (['kind','attacker'].includes(event.target.name)) delete state.use;
        const recorded=recordedShotDefaults(attacker(),target());
        state.targetSize=recorded.exposure;state.situation=recorded.situation;
        render();
      }
    });
    // Clear a stale result as soon as a number is edited, not only on blur.
    form.addEventListener('input', event => {
      revision++;
      if (['range','unit'].includes(event.target.name)) { delete state.measurement; const notice = root.querySelector('[data-measurement]'); notice?.remove(); }
      if (['hit','location','impact','armorRoll'].includes(event.target.name)) state.rollSource = 'entered';
      if (['armor','location','cover','coverStance'].includes(event.target.name)) form.elements.confirmedArmor.checked = false;
      latest = null; root.querySelector('[data-result]').textContent = 'Inputs changed. Calculate again.'; });
    function calculate(resolve) {
      revision++;
      state.confirmedArmor = ''; capture(form);
      try {
        const input = read();
        const preview = isGun ? previewFirearm(input) : previewMelee(input);
        const number = name => state[name] === undefined || state[name] === '' ? null : Number(state[name]);
        const rolls = { hit:number('hit'), location:number('location'), impact:number('impact'), armor:number('armorRoll') };
        const mayHit = preview.threshold === 'hit' || (rolls.hit !== null && rolls.hit <= preview.threshold);
        if (resolve && mayHit && state.confirmedArmor !== 'yes') throw new Error('Confirm the armor at the rolled hit location before resolving.');
        const result = resolve ? (isGun ? resolveFirearm(input,rolls) : resolveMelee(input,rolls)) : (isGun ? previewFirearm(input) : previewMelee(input));
        root.querySelector('[data-error]').textContent = ''; latest = result; showResult(result, { attacker: attacker(), target: target(), input, rollSource: state.rollSource ?? 'entered' });
        if (resolve && onResult) onResult(structuredClone(result));
      } catch (error) { latest = null; root.querySelector('[data-error]').textContent = error.message; root.querySelector('[data-result]').textContent = 'No result. Complete or correct the inputs above.'; }
    }
    form.addEventListener('submit',event=>{ event.preventDefault(); calculate(true); });
    root.querySelector('[data-command="preview"]').addEventListener('click',()=>calculate(false));
    root.querySelector('[data-command="roll"]')?.addEventListener('click', async event => {
      state.confirmedArmor = ''; capture(form);
      const button = event.currentTarget;
      const started = ++revision;
      button.disabled = true;
      try {
        const input = read();
        const preview = isGun ? previewFirearm(input) : previewMelee(input);
        const rolls = await rollDice({ kind: state.kind, dieSides: preview.dieSides, input: structuredClone(input) });
        if (revision !== started) return;
        Object.assign(state, { hit: rolls.hit, location: rolls.location, armorRoll: rolls.armor, impact: rolls.impact, confirmedArmor: '', rollSource: 'Foundry Roll' });
        latest = null; render();
        root.querySelector('[data-result]').textContent = 'Dice rolled. Review the location and confirm protection, then resolve.';
      } catch (error) { if (revision === started) root.querySelector('[data-error]').textContent = error.message; }
      finally { button.disabled = false; }
    });
    root.querySelectorAll('[data-example]').forEach(button=>button.addEventListener('click',()=> {
      const kind = button.dataset.example;
      state = { kind, attacker:roster[0].id, target:roster[1].id, unit:'ft', range:kind==='firearm'?120:4,
        aim:4, targetSize:'Standing Exposed', visibility:'Good Visibility', shooterSpeed:0,targetSpeed:0,cover:'open',coverStance:'firing-over',
        sets:1,damageBonus:1,parry:6,stationary:'yes',hit:40,location:kind==='firearm'?30:62,impact:5,armorRoll:3,
        armor:kind==='firearm'?'rigid/torso':'leatherArms/arms',confirmedArmor:'yes' };
      latest = null; render();
    }));
  }
  const recorded=recordedShotDefaults(attacker(),target());
  state.targetSize??=recorded.exposure;state.situation??=recorded.situation;
  render();
  return { getResult:()=>latest ? structuredClone(latest) : null, destroy:()=>root.replaceChildren() };
}
