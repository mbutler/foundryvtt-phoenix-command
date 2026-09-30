import {actionSchedule} from './timing.mjs';

// When each hex of a planned route is reached. Paid movement spends every action the mover
// has on the hex he is entering and carries on automatically in later impulses, so a hex is
// entered in the impulse its cumulative cost is paid off. This is a forecast for the order
// panel, not a rule: each hex is still priced and paid when it is declared, and anything
// that changes his actions (a wound, another order) changes the arrival.
// `aim` is an aimed attack running alongside the move (timing.mjs, AIM_ACTIONS_WHILE_MOVING):
// the actions of aim still to pay, and whether this impulse's one has already been taken.
export function projectRoute(costs,{allowance,phase,impulse,spent=0,aim=null}){
  if(!Number.isInteger(allowance)||allowance<1||!phase||!impulse)return costs.map(()=>null);
  const schedule=actionSchedule(allowance);
  let aimLeft=aim?.remaining??0;
  const forAim=(budget,takenNow=false)=>{if(aimLeft<1||takenNow||budget<1)return 0;aimLeft--;return 1;};
  let p=phase,i=impulse,available=Math.max(0,schedule[i-1]-spent),offset=0;
  available-=forAim(available,aim?.takenNow);
  const next=()=>{i=i===4?1:i+1;if(i===1)p++;offset++;available=schedule[i-1];available-=forAim(available);};
  return costs.map(cost=>{
    let owed=cost;
    for(let guard=0;guard<400;guard++){
      if(available>=owed){available-=owed;owed=0;break;}
      owed-=available;available=0;next();
    }
    return {phase:p,impulse:i,offset};
  });
}

export function routeSummary(costs,arrivals){
  const total=costs.reduce((sum,c)=>sum+c,0);
  const now=arrivals.filter(a=>a?.offset===0).length;
  const last=arrivals.at(-1);
  return {hexes:costs.length,actions:total,thisImpulse:now,
    arrives:last?{phase:last.phase,impulse:last.impulse,offset:last.offset}:null};
}
