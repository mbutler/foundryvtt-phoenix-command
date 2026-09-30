// Two passes are essential: every die and protection decision is frozen before
// the first injury/resource write. Each adapter retains its persistent receipts.
export async function finishFireSequence(ids,{prepare,apply,total}){
  const prepared=[];
  for(const id of ids)prepared.push(await prepare(id));
  for(const result of prepared)if(result)await apply(result);
  return total();
}
