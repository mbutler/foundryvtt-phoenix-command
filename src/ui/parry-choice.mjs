import {escapeHTML as e} from '../foundry/context.mjs';

// The defender's full-parry allocation, offered beside Hold and Duck. One toggle per blow he
// can parry; no more can be ticked than he has full parries. Unticked blows take his partial
// or base parry as usual.
export function parryChoiceMarkup(options,{scope=''}={}){
  if(!options)return '';
  return `<fieldset class="pc-parry-choice" data-parry-choice="${e(scope)}" data-available="${options.available}"><legend>Full parry · ${options.available} available</legend>${options.blows.map(b=>`<label class="pc-custom-toggle"><input type="checkbox" data-parry-shot="${e(b.shotId)}"> ${e(b.attacker)}'s blow</label>`).join('')}</fieldset>`;
}
export function readParryChoice(root,scope=''){
  const group=[...root.querySelectorAll('[data-parry-choice]')].find(g=>g.dataset.parryChoice===scope);
  return group?[...group.querySelectorAll('[data-parry-shot]:checked')].map(input=>input.dataset.parryShot):undefined;
}
// Keep the ticks within the number of full parries available.
export function limitParryChoices(root){
  for(const group of root.querySelectorAll('[data-parry-choice]')){
    const limit=Number(group.dataset.available),boxes=[...group.querySelectorAll('[data-parry-shot]')];
    const update=()=>{const ticked=boxes.filter(b=>b.checked).length;for(const b of boxes)b.disabled=!b.checked&&ticked>=limit;};
    for(const b of boxes)b.addEventListener('change',update);
    update();
  }
}

// Ticks survive the frequent re-renders of the tracker and queue until the reaction is sent.
const remembered=new Map();
export function keepParryTicks(root){
  for(const group of root.querySelectorAll('[data-parry-choice]')){
    const scope=group.dataset.parryChoice;
    for(const box of group.querySelectorAll('[data-parry-shot]'))box.checked=remembered.get(scope)?.has(box.dataset.parryShot)??false;
    group.addEventListener('change',()=>remembered.set(scope,new Set(readParryChoice(root,scope))));
  }
  limitParryChoices(root);
}
export const forgetParryTicks=scope=>remembered.delete(scope);
