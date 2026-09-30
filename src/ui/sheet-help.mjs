// Native popovers escape scrolling containers and never change the sheet's layout.
export function bindSheetHelp(root){
  root.querySelectorAll('.pc-inline-help').forEach(wrapper=>{
    const button=wrapper.querySelector('button'),tip=wrapper.querySelector('[popover]');
    let dismissed=false;
    const hide=()=>{if(tip.matches(':popover-open'))tip.hidePopover();};
    const show=()=>{
      if(dismissed)return;
      if(!tip.matches(':popover-open'))tip.showPopover();
      const rect=button.getBoundingClientRect(),bounds=tip.getBoundingClientRect();
      tip.style.left=`${Math.max(8,Math.min(rect.left,innerWidth-bounds.width-8))}px`;
      tip.style.top=`${rect.bottom+bounds.height+8<innerHeight?rect.bottom+6:Math.max(8,rect.top-bounds.height-6)}px`;
    };
    wrapper.addEventListener('pointerenter',()=>{dismissed=false;show();});
    wrapper.addEventListener('pointerleave',()=>{dismissed=false;if(document.activeElement!==button)hide();});
    button.addEventListener('focus',()=>{dismissed=false;show();});
    button.addEventListener('blur',hide);
    button.addEventListener('click',event=>{event.preventDefault();dismissed=false;show();});
    wrapper.addEventListener('keydown',event=>{
      if(event.key==='Escape'){event.stopPropagation();dismissed=true;hide();}
    });
    root.addEventListener('scroll',hide,true);
  });
}
