import {escapeHTML as e} from '../foundry/context.mjs';

// One click on the map for one hex: the centre of the hex clicked, or null if cancelled.
// A small non-modal prompt keeps the map usable; Escape or Cancel gives up.
let active=null;
export function pickHex({title,prompt}){
  active?.();
  if(!canvas.ready)throw new Error('View the encounter scene first.');
  const panel=document.createElement('section');panel.className='pc-hex-picker phoenix-command';panel.setAttribute('role','dialog');panel.setAttribute('aria-label',title);
  panel.innerHTML=`<strong>${e(title)}</strong><p>${e(prompt)}</p><button type="button" data-cancel>Cancel</button>`;
  document.body.append(panel);
  return new Promise(resolve=>{
    const finish=value=>{canvas.stage.off('pointerdown',onDown);window.removeEventListener('keydown',onKey,true);panel.remove();if(active===cancel)active=null;resolve(value);};
    const cancel=()=>finish(null);
    const onDown=event=>{
      if(event.button!==undefined&&event.button!==0)return;
      const client=event.nativeEvent??event;
      const point=Number.isFinite(client.clientX)?canvas.canvasCoordinatesFromClient({x:client.clientX,y:client.clientY}):event.getLocalPosition(canvas.stage);
      finish(canvas.grid.getCenterPoint(canvas.grid.getOffset(point)));
    };
    const onKey=event=>{if(event.key==='Escape'){event.preventDefault();event.stopPropagation();cancel();}};
    panel.querySelector('[data-cancel]').addEventListener('click',cancel);
    canvas.stage.on('pointerdown',onDown);window.addEventListener('keydown',onKey,true);
    active=cancel;
  });
}
