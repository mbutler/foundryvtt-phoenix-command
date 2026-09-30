import {printedArcs} from '../rules/automatic-fire.mjs';
import {validateBurstArc} from '../foundry/burst-arc-validation.mjs';
let activePicker=null;

// One non-modal map interaction; a rejected commit leaves the selection editable.
export function pickBurstArc({combat,shot,onConfirm}){
 if(!canvas?.ready||canvas.scene.id!==combat.scene?.id)throw new Error('View the encounter scene before choosing the arc.');
 if(combat.timing.reactions)throw new Error('The arc is frozen during reactions. Finish this impulse before changing it.');
 activePicker?.();
 const stage=canvas.stage,grid=combat.scene.grid,view=canvas.app.view;
 const root=document.createElement('section');root.className='pc-burst-picker';root.setAttribute('aria-label','Choose burst arc');
 root.innerHTML=`<header><strong>Choose burst arc</strong><span>1 · Arc → 2 · Reactions → 3 · Resolve</span></header><p>Click adjacent hexes in sweep order. Click a selected hex to remove it.</p><label>Width within one hex<select data-width>${printedArcs.filter(n=>n<=1).map(n=>`<option value="${n}" ${n===1?'selected':''}>${n} hex</option>`).join('')}</select></label><p data-status role="status" aria-live="polite"></p><p data-targets></p><div data-actions><button type="button" data-undo>Undo hex</button><button type="button" data-clear>Clear</button><button type="button" data-confirm disabled>Confirm arc</button><button type="button" data-cancel>Cancel</button></div><small>Green = valid · Amber = needs changes · Numbers = sweep order. Enter confirms; Escape cancels.</small>`;
 document.body.append(root);document.body.classList.add('pc-selecting-arc');
 const layer=new PIXI.Container();layer.eventMode='none';stage.addChild(layer);
 let points=shot.arc?.swept.map(hex=>grid.getCenterPoint(hex))??[],busy=false;
 const width=root.querySelector('[data-width]'),status=root.querySelector('[data-status]'),confirm=root.querySelector('[data-confirm]');
 if(shot.arc?.arcHexes<=1)width.value=String(shot.arc.arcHexes);
 const arcWidth=()=>points.length===1?Number(width.value):points.length;
 function preview(){
  width.disabled=points.length!==1;
  let checked=null,error=null;
  try{checked=validateBurstArc(combat,shot,points,arcWidth());}catch(err){error=err.message;}
  confirm.disabled=busy||!checked;
  root.querySelector('[data-undo]').disabled=busy||!points.length;
  root.querySelector('[data-clear]').disabled=busy||!points.length;
  status.textContent=error?`${points.length} selected · ${error}`:`Valid arc · ${points.length} selected · width ${arcWidth()} · minimum ${checked.minimum} · range ${checked.arc.rangeHexes} hexes`;
  status.dataset.valid=String(!!checked);
  root.querySelector('[data-targets]').textContent=checked?`In arc: ${checked.targets.map(t=>t.name).join(', ')||'nobody'}`:'';
  for(const child of layer.removeChildren())child.destroy();
  const color=checked?0xc0e078:0xf0b35f;
  points.forEach((point,index)=>{
   const shape=new PIXI.Graphics();shape.lineStyle(3,color,1).beginFill(color,.32).drawPolygon(grid.getVertices(point).flatMap(p=>[p.x,p.y])).endFill();layer.addChild(shape);
   const text=new PIXI.Text(String(index+1),{fontFamily:'sans-serif',fontSize:18,fontWeight:'bold',fill:0xffffff,stroke:0x101519,strokeThickness:4});text.anchor.set(.5);text.position.set(point.x,point.y);layer.addChild(text);
  });
  return checked;
 }
 return new Promise(resolve=>{
  const hooks=[];let finished=false;
  const finish=value=>{
   if(finished)return;finished=true;
   view.removeEventListener('pointerdown',onDown,true);window.removeEventListener('keydown',onKey,true);
   for(const [name,id]of hooks)Hooks.off(name,id);
   layer.destroy({children:true});root.remove();document.body.classList.remove('pc-selecting-arc');if(activePicker===cancel)activePicker=null;resolve(value);
  };
  const cancel=()=>{if(!busy)finish(null);};
  const commit=async()=>{
   if(busy||!preview())return;
   busy=true;confirm.disabled=true;confirm.textContent='Saving arc…';
   try{await onConfirm({hexes:points.map(p=>({x:p.x,y:p.y})),arcHexes:arcWidth()});finish(true);}
   catch(error){busy=false;preview();status.textContent=error.message;status.dataset.valid='false';confirm.textContent='Confirm arc';}
  };
  const onDown=event=>{
   if(event.button!==0||busy)return;
   event.preventDefault();event.stopImmediatePropagation();
   const point=grid.getCenterPoint(grid.getOffset(canvas.canvasCoordinatesFromClient({x:event.clientX,y:event.clientY})));
   const index=points.findIndex(p=>p.x===point.x&&p.y===point.y);
   if(index>=0)points.splice(index,1);else points.push(point);
   preview();
  };
  const onKey=event=>{
   if(event.target?.matches?.('input,select,textarea,[contenteditable=true]'))return;
   if(event.key==='Enter'&&event.target?.closest?.('button')&&event.target!==confirm)return;
   if(['Escape','Enter','Backspace'].includes(event.key)){event.preventDefault();event.stopImmediatePropagation();}
   if(event.key==='Escape')cancel();
   else if(event.key==='Enter')void commit();
   else if(event.key==='Backspace'&&!busy){points.pop();preview();}
  };
  root.querySelector('[data-cancel]').onclick=cancel;
  root.querySelector('[data-undo]').onclick=()=>{if(!busy){points.pop();preview();}};
  root.querySelector('[data-clear]').onclick=()=>{if(!busy){points=[];preview();}};
  width.onchange=preview;confirm.onclick=commit;
  view.addEventListener('pointerdown',onDown,true);window.addEventListener('keydown',onKey,true);
  hooks.push(['canvasTearDown',Hooks.on('canvasTearDown',()=>finish(null))]);
  hooks.push(['updateCombat',Hooks.on('updateCombat',doc=>{if(doc.id===combat.id&&!busy){ui.notifications.warn('Encounter changed. Reopen the arc to review it.');finish(null);}})]);
  hooks.push(['updateToken',Hooks.on('updateToken',doc=>{if(doc.parent?.id===combat.scene.id&&!busy){ui.notifications.warn('A token moved or changed. Reopen the arc to review it.');finish(null);}})]);
  activePicker=cancel;preview();
 });
}
