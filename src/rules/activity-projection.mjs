import {actionSchedule} from './timing.mjs';

// Capacity forecast only: Small Arms §2.2, PDF 16. This does not grant
// eligibility, reserve actions, resolve effects, or model MPC shot ordering.
// All future capacity is assigned to this activity, with a constant allowance.
export function projectActivity({allowance,phase,impulse,remaining,cost,invested=0}) {
  const schedule=actionSchedule(allowance);
  if(!Number.isSafeInteger(phase)||phase<1||!Number.isInteger(impulse)||impulse<1||impulse>4)
    throw new Error('A started phase and impulse are required.');
  if(!Number.isSafeInteger((phase-1)*4+impulse))throw new Error('Projection exceeds safe clock precision.');
  if(!Number.isInteger(remaining)||remaining<0||remaining>schedule[impulse-1])
    throw new Error('Supply the actual remaining capacity, including zero.');
  if(!Number.isSafeInteger(cost)||cost<1||!Number.isSafeInteger(invested)||invested<0||invested>=cost)
    throw new Error('Supply an unfinished whole-action activity.');
  let needed=cost-invested;
  if(needed<=remaining)return {phase,impulse,remaining:remaining-needed};
  needed-=remaining;
  let index=(phase-1)*4+impulse; // Next impulse, zero-based.
  // Every four consecutive impulses have the same total capacity. Skip full
  // cycles while retaining the cycle containing the final action.
  const cycles=Math.floor((needed-1)/allowance);
  index+=cycles*4;needed-=cycles*allowance;
  for(let i=0;i<4;i++,index++) {
    const capacity=schedule[index%4];
    if(needed<=capacity) {
      const completionPhase=Math.floor(index/4)+1;
      if(!Number.isSafeInteger(index)||!Number.isSafeInteger(completionPhase))throw new Error('Projection exceeds safe clock precision.');
      return {phase:completionPhase,impulse:index%4+1,remaining:capacity-needed};
    }
    needed-=capacity;
  }
  throw new Error('Invalid action schedule.');
}
