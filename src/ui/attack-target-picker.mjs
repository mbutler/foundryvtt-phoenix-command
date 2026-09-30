import {visibleEncounterTarget} from '../rules/target-eligibility.mjs';
let cancelActive=null;
export async function pickAttackTarget(combat,attacker){
  cancelActive?.();
  const previousTool=game.activeTool;
  const previousTargets=Array.from(game.user.targets,t=>t.id);
  const panel=document.createElement('div');
  panel.className='pc-map-move pc-dialog pc-weapon-order';
  panel.setAttribute('role','region');panel.setAttribute('aria-label','Choose attack target');
  panel.innerHTML='<p class="pc-record-kicker">ATTACK · CHOOSE TARGET</p><p>Click an enemy token on the map.</p><p>Your character stays selected. Escape cancels without spending actions.</p><button type="button">Cancel</button>';
  document.body.append(panel);
  // Clear existing targets so clicking one again selects it instead of toggling it off.
  for(const token of Array.from(game.user.targets))token.setTarget(false);
  return new Promise(resolve=>{
    const hooks=[];let finished=false;
    const finish=async token=>{
      if(finished)return;finished=true;
      for(const [name,id]of hooks)Hooks.off(name,id);
      window.removeEventListener('keydown',onKey,true);panel.remove();
      if(cancelActive===cancel)cancelActive=null;
      if(!token&&canvas.ready){
        for(const current of Array.from(game.user.targets))current.setTarget(false);
        for(const id of previousTargets)canvas.tokens.get(id)?.setTarget(true,{releaseOthers:false});
      }
      if(canvas.ready){await ui.controls.activate({control:'tokens',tool:previousTool==='target'?'target':'select'});}
      resolve(token?.document.uuid??null);
    };
    const cancel=()=>finish(null);
    const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancel();}};
    panel.querySelector('button').addEventListener('click',cancel);
    window.addEventListener('keydown',onKey,true);
    hooks.push(['targetToken',Hooks.on('targetToken',(user,token,targeted)=>{
      if(user.id!==game.user.id||!targeted)return;
      const target=combat.combatants.find(c=>c.token?.uuid===token.document.uuid);
      if(target?.id===attacker.id||!visibleEncounterTarget(target,game.user)){
        token.setTarget(false);ui.notifications.warn('Choose a visible enemy token in this encounter.');return;
      }
      finish(token);
    })]);
    for(const name of ['canvasTearDown','updateCombat','deleteCombat'])hooks.push([name,Hooks.on(name,doc=>{if(name==='canvasTearDown'||doc.id===combat.id)cancel();})]);
    cancelActive=cancel;
    ui.controls.activate({control:'tokens',tool:'target'}).catch(error=>{ui.notifications.warn(error.message);cancel();});
  });
}
