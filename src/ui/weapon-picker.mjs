import {pickerHTML} from './weapon-card.mjs';
import {escapeHTML as e} from '../foundry/context.mjs';

// A catalogue browser: a searchable list on the left, the highlighted weapon's card on the
// right, and one button that adds it. Nothing is created until that button is pressed.
// Arrow keys move through the list from the search box or the list; double-click adds.
// `extra(key)` may return a few form fields for the highlighted entry (a count, say); they are
// shown under its card, and the pick then resolves to {key, values} instead of the key alone.
export async function pickFromCatalog({title,groups,card,noun='weapon',okLabel,intro='',extra=null}){
  const content=document.createElement('div');
  content.innerHTML=`${intro?`<p class="pc-help pc-picker-intro">${e(intro)}</p>`:''}${pickerHTML(groups,{noun})}`;
  return foundry.applications.api.DialogV2.prompt({
    window:{title,resizable:true},position:{width:960,height:760},classes:['pc-weapon-picker-dialog'],
    content,
    ok:{label:okLabel,callback:(_event,_button,dialog)=>{
      const key=dialog.element.querySelector('[name="choice"]').value||null;
      if(!key||!extra)return key;
      const values=Object.fromEntries([...dialog.element.querySelectorAll('[data-extra] [name]')].map(el=>[el.name,el.value]));
      return {key,values};
    }},
    rejectClose:false,
    render:(_event,dialog)=>wire(dialog.element,card,extra)
  });
}

function wire(root,card,extra){
  const list=root.querySelector('.pc-picker-options'),search=root.querySelector('[name="filter"]');
  const choice=root.querySelector('[name="choice"]'),cardEl=root.querySelector('[data-card]');
  const ok=root.querySelector('button[data-action="ok"]');
  const options=[...list.querySelectorAll('[role="option"]')];
  const visible=()=>options.filter(o=>!o.hidden);
  const select=(option,{scroll=true}={})=>{
    for(const o of options)o.setAttribute('aria-selected',String(o===option));
    choice.value=option?.dataset.key??'';
    if(ok)ok.disabled=!option;
    if(!option){cardEl.innerHTML='';list.removeAttribute('aria-activedescendant');return;}
    list.setAttribute('aria-activedescendant',option.id);
    const fields=extra?.(option.dataset.key)??'';
    cardEl.innerHTML=`${card(option.dataset.key)}${fields?`<div class="pc-picker-extra" data-extra>${fields}</div>`:''}`;cardEl.scrollTop=0;
    // Artwork that has not been added yet is simply left out.
    for(const img of cardEl.querySelectorAll('img'))img.addEventListener('error',()=>img.closest('figure')?.remove(),{once:true});
    if(scroll)option.scrollIntoView({block:'nearest'});
  };
  const current=()=>options.find(o=>o.getAttribute('aria-selected')==='true'&&!o.hidden);
  const move=step=>{
    const shown=visible();if(!shown.length)return;
    const at=shown.indexOf(current());
    select(shown[Math.max(0,Math.min(shown.length-1,at<0?0:at+step))]);
  };
  const keys=event=>{
    const step={ArrowDown:1,ArrowUp:-1,PageDown:8,PageUp:-8}[event.key];
    if(step){event.preventDefault();move(step);return;}
    if(event.target===list&&event.key==='Home'){event.preventDefault();select(visible()[0]);}
    if(event.target===list&&event.key==='End'){event.preventDefault();select(visible().at(-1));}
  };
  list.addEventListener('click',event=>{const o=event.target.closest('[role="option"]');if(o)select(o,{scroll:false});});
  list.addEventListener('dblclick',event=>{const o=event.target.closest('[role="option"]');if(o){select(o,{scroll:false});ok?.click();}});
  list.addEventListener('keydown',keys);search.addEventListener('keydown',keys);
  search.addEventListener('input',()=>{
    const words=search.value.toLowerCase().split(/\s+/).filter(Boolean);
    for(const o of options)o.hidden=!words.every(w=>o.dataset.search.includes(w));
    for(const g of list.querySelectorAll('[data-group]'))g.hidden=!g.querySelector('[role="option"]:not([hidden])');
    root.querySelector('[data-empty]').hidden=visible().length>0;
    if(!current())select(visible()[0]??null);
  });
  select(options[0]??null);
  // After the dialog's own focus handling, so typing searches straight away.
  setTimeout(()=>search.focus(),0);
}
