import {activities} from '../data/activities.mjs';
import {quoteActivity,characterActivity} from '../rules/activity-cost.mjs';
import {projectActivity} from '../rules/activity-projection.mjs';
import {actionBalance} from '../rules/timing.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';
import {itemHandlingIds,itemHandlingTarget} from '../rules/item-handling.mjs';
import {doorIds,doorsInReach} from '../rules/door-handling.mjs';

// Native dialog; commands still pass through the active-GM coordinator and its
// captured revision. Opening/reviewing a plan never spends actions.
export async function selectActivity(state,id,actor=null) {
  const weapons=Array.from(actor?.items??[]).filter(i=>i.type==='weapon'&&i.system.carried).flatMap(i=>Object.entries(i.system.firearmModes??{}).map(([modeId,mode])=>({weaponId:i.id,modeId,label:`${i.name} · ${modeId}`,reloadTime:mode.reloadTimeActions})));
  const root=document.createElement('div');root.className='pc-activity-selector pc-dialog';
  root.innerHTML=`<p class="pc-record-kicker">TACTICAL ORDER · ACTIVITY</p>
    <label>Search <input type="search" data-search placeholder="Window, door, holster…"></label>
    <label>Activity <select data-choice size="7" aria-label="Activity"></select></label>
    <div data-parameters></div><p data-preview role="status" aria-live="polite"></p>
    <p data-effect></p>
    <label class="pc-custom-toggle"><input type="checkbox" data-custom> Custom adjudicated activity</label>
    <label class="pc-custom-toggle"><input type="checkbox" data-continuous checked> Auto-invest available actions</label>
    <div data-manual hidden><label>Activity and reason <input data-label></label><label>Whole-action cost <input data-cost type="number" min="1" step="1"></label></div>`;
  const choice=root.querySelector('[data-choice]'),params=root.querySelector('[data-parameters]'),preview=root.querySelector('[data-preview]');
  let dialog;
  const custom=()=>root.querySelector('[data-custom]').checked;
  const continuation=()=>root.querySelector('[data-continuous]').checked;
  function read(){
    if(custom()){
      const label=root.querySelector('[data-label]').value.trim(),cost=Number(root.querySelector('[data-cost]').value);
      if(!label||!Number.isSafeInteger(cost)||cost<1)throw new Error('Enter an activity, reason and positive whole-action cost.');
      return {label,cost,continuous:continuation()};
    }
    const parameters={};
    for(const input of params.querySelectorAll('[name]')){
      if(input.value==='')throw new Error('Choose the activity details to calculate its cost.');
      parameters[input.name]=input.name==='concealed'?input.value==='yes':input.name==='reloadTime'?Number(input.value):input.value;
    }
    const weapon=weapons[Number(params.querySelector('[data-weapon]')?.value)];
    const handled=itemHandlingIds.includes(choice.value)?{itemId:params.querySelector('[data-handling-item]')?.value||null,
      ...(choice.value==='pick-set-weapon'?{handling:params.querySelector('[data-handling]')?.value||null}:{}),
      ...(choice.value==='selector'?{modeId:params.querySelector('[data-selector-mode]')?.value||null}:{})}:{};
    if(doorIds.includes(choice.value)){
      handled.wallId=params.querySelector('[data-door]')?.value||null;
      if(!handled.wallId)throw new Error(choice.value==='kick-door'?'No closed or locked door is next to this character.':'No closed, unlocked door is next to this character.');
    }
    if(itemHandlingIds.includes(choice.value)&&!handled.itemId)throw new Error(parameters.direction===''?'Choose the activity details to calculate its cost.':'Nothing the character has can be handled this way.');
    const catalog=characterActivity({id:choice.value,parameters,...handled,...(choice.value==='unload-weapon'?{weaponId:weapon?.weaponId,modeId:weapon?.modeId}:{})},actor);
    const quote=quoteActivity(catalog.id,catalog.parameters);
    return {label:quote.label,cost:quote.actions,catalog,continuous:continuation()};
  }
  function update(){
    let valid=false;
    try{
      const plan=read(),entry=state.entries[id];
      let forecast='Complete character data to estimate completion.';
      if(entry?.allowance){
        const end=projectActivity({allowance:entry.allowance,phase:state.phase,impulse:state.impulse,remaining:actionBalance(state,id),cost:plan.cost});
        forecast=continuation()?`Finishes Phase ${end.phase}, Impulse ${end.impulse}`:'Manual progress';
      }
      preview.textContent=`${plan.cost} actions · ${forecast}`;valid=true;
    }catch(error){preview.textContent=error.message;}
    const save=dialog?.element.querySelector('[data-action="ok"]');if(save)save.disabled=!valid;
  }
  function parameters(){
    const row=activities.find(a=>a.id===choice.value);
    const kind=row?.cost.kind;
    params.innerHTML=kind==='holster'?'<label>Holster concealment <select name="concealed"><option value="">Choose…</option><option value="no">Exposed</option><option value="yes">Concealed (+2 actions)</option></select></label>':kind==='equipment-direction'?'<label>Book cost column <select name="direction"><option value="">Choose…</option><option value="in">In</option><option value="out">Out</option></select></label>':kind==='weapon-reload-time'?`<label>Weapon<select data-weapon>${weapons.map((w,i)=>`<option value="${i}">${e(w.label)}</option>`).join('')}</select></label>`:'';
    if(doorIds.includes(row?.id)){
      // Doors within one hex of this character's token, nearest first.
      const token=globalThis.game?.combat?.combatants.get(id)?.token;
      const scene=token?.parent;
      const doors=token&&scene?doorsInReach(row.id,Array.from(scene.walls,w=>({id:w.id,door:w.door,ds:w.ds,c:[...w.c]})),token.getCenterPoint({x:token.x,y:token.y}),scene.grid.size):[];
      params.insertAdjacentHTML('beforeend',`<label>Door <select data-door>${doors.map((door,n)=>`<option value="${e(door.id)}">Door ${n+1} · ${e(door.state)}</option>`).join('')||'<option value="">No door in reach</option>'}</select></label>`);
    }
    if(itemHandlingIds.includes(row?.id)){
      params.insertAdjacentHTML('beforeend',`${row.id==='pick-set-weapon'?'<label>Pick up or set down <select data-handling><option value="set-down">Set down</option><option value="pick-up">Pick up</option></select></label>':''}<label>Item <select data-handling-item></select></label>${row.id==='selector'?'<label>New fire mode <select data-selector-mode></select></label>':''}`);
      handlingWeapons();
    }
    root.querySelector('[data-effect]').textContent=row?.execution==='automatic'
      ? 'Updates the character when completed.'
      : 'Tracks time only. Apply the scene or equipment change manually when completed.';
    update();
  }
  // Only items this row can change: a holstered pistol to draw, a vest that is off to put on.
  function handlingWeapons(keepItem=false){
    const select=params.querySelector('[data-handling-item]');if(!select)return;
    const previous=select.value;
    const handling=choice.value==='pick-set-weapon'?params.querySelector('[data-handling]')?.value:params.querySelector('[name=direction]')?.value;
    const otherModes=item=>Object.keys(item.system.firearmModes??{}).filter(mode=>itemHandlingTarget('selector',mode,item));
    const eligible=Array.from(actor?.items??[]).filter(item=>choice.value==='selector'?otherModes(item).length:itemHandlingTarget(choice.value,handling,item));
    select.innerHTML=eligible.map(item=>`<option value="${e(item.id)}">${e(item.name)}</option>`).join('')||'<option value="">Nothing eligible</option>';
    if(keepItem&&eligible.some(item=>item.id===previous))select.value=previous;
    const modes=params.querySelector('[data-selector-mode]');
    if(modes){const item=eligible.find(i=>i.id===select.value);modes.innerHTML=(item?otherModes(item):[]).map(mode=>`<option value="${e(mode)}">${e(mode)}</option>`).join('');}
  }
  function filter(){
    const previous=choice.value,query=root.querySelector('[data-search]').value.trim().toLowerCase();
    const matches=activities.filter(a=>!['turn','turn-firing'].includes(a.id)&&`${a.label} ${a.group}`.toLowerCase().includes(query));
    const groups={actions:'Posture, cover & interactions',reloading:'Ammunition & reloading',weapon:'Weapon handling',equipment:'Equipment'};
    choice.innerHTML=Object.entries(groups).filter(([group])=>matches.some(a=>a.group===group)).map(([group,label])=>`<optgroup label="${label}">${matches.filter(a=>a.group===group).map(a=>`<option value="${e(a.id)}">${e(a.label)}</option>`).join('')}</optgroup>`).join('');
    choice.value=matches.some(a=>a.id===previous)?previous:matches[0]?.id??'';parameters();
  }
  root.querySelector('[data-search]').addEventListener('input',filter);
  choice.addEventListener('change',parameters);
  root.querySelector('[data-continuous]').addEventListener('change',update);
  params.addEventListener('input',update);
  params.addEventListener('change',event=>{if(event.target.matches('[data-handling],[name=direction],[data-handling-item]'))handlingWeapons(event.target.matches('[data-handling-item]'));update();});
  root.querySelector('[data-manual]').addEventListener('input',update);
  root.querySelector('[data-custom]').addEventListener('change',()=>{
    root.querySelector('[data-manual]').hidden=!custom();params.hidden=custom();choice.disabled=custom();
    root.querySelector('[data-search]').disabled=custom();
    for(const input of params.querySelectorAll('input,select'))input.disabled=custom();update();
  });
  if(!game.user.isGM)root.querySelector('.pc-custom-toggle').hidden=true;
  filter();
  const content=document.createElement('div');content.append(root);
  return foundry.applications.api.DialogV2.prompt({window:{title:'Other actions · Table 7B'},position:{width:480},content,
    render:(_event,app)=>{dialog=app;app.element.querySelector('.pc-activity-selector').replaceWith(root);update();},ok:{label:'Start activity',callback:()=>read()},rejectClose:false});
}
