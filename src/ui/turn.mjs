import {planTurn} from '../foundry/facing.mjs';
import {bearingBetween} from '../foundry/hex-move.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

export async function selectTurn(combat,id){
  const c=combat.combatants.get(id),token=c?.token;
  if(!token||!c.actor)throw new Error('Select a character token in this encounter.');
  if(combat.timing.entries[id]?.movement?.pending)throw new Error('Finish or abandon the current hex before turning in place.');
  const choices=[[-120,'Left 120°'],[-60,'Left 60°'],[60,'Right 60°'],[120,'Right 120°'],[180,'Turn around']]
    .map(([delta,label])=>({label,facing:token.rotation+delta}));
  const target=[...game.user.targets??[]][0]?.document;
  if(target&&target.uuid!==token.uuid)choices.unshift({label:'Face selected target',facing:bearingBetween(
    token.getCenterPoint({x:token.x,y:token.y}),target.getCenterPoint({x:target.x,y:target.y}))});
  const options=choices.flatMap(choice=>{
    try{const plan=planTurn(token,c.actor,choice.facing);return [{...choice,cost:plan.cost}];}catch{return [];}
  });
  if(!options.length)throw new Error('This character cannot turn now.');
  return foundry.applications.api.DialogV2.prompt({window:{title:`Turn · ${c.name}`},position:{width:420},
    content:`<div class="pc-dialog"><p>Facing ${Math.round(token.rotation)}° · ${c.actor.system.condition.firingStance?'Maintaining firing stance':'Unprepared stance'}</p>
    <label>Direction<select name="facing">${options.map(o=>`<option value="${o.facing}">${e(o.label)} · ${o.cost} action${o.cost===1?'':'s'}</option>`).join('')}<option value="custom">Custom facing…</option></select></label><label data-custom hidden>Facing in degrees (0 = north)<input name="customFacing" type="number" step="any" value="${token.rotation}"></label><p data-cost role="status"></p>
    <p>The token turns when the action is complete. Smaller turns made as part of moving remain in Move.</p></div>`,
    render:(_event,app)=>{
      const root=app.element,select=root.querySelector('[name=facing]'),custom=root.querySelector('[name=customFacing]');
      const update=()=>{
        root.querySelector('[data-custom]').hidden=select.value!=='custom';
        let valid=false;
        try{
          const cost=planTurn(token,c.actor,Number(select.value==='custom'?(custom.value||NaN):select.value)).cost;
          root.querySelector('[data-cost]').textContent=`${cost} action${cost===1?'':'s'}`;valid=true;
        }catch(error){root.querySelector('[data-cost]').textContent=error.message;}
        root.querySelector('[data-action=ok]').disabled=!valid;
      };
      select.addEventListener('change',update);custom.addEventListener('input',update);update();
    },
    ok:{label:'Plan turn',callback:(_event,_button,dialog)=>{
      const root=dialog.element,choice=root.querySelector('[name=facing]').value;
      const turnFacing=Number(choice==='custom'?(root.querySelector('[name=customFacing]').value||NaN):choice);
      planTurn(token,c.actor,turnFacing);
      return {turnFacing,continuous:true};
    }},rejectClose:false});
}
