// Portable per-document transaction runner. Receipts and effects share one document update.
export const getPath=(object,path)=>path.split('.').reduce((v,k)=>v?.[k],object) ?? null;
export const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export async function executeTransaction(plan,direction,{read,write,save,authorize}) {
  if(!['apply','undo'].includes(direction))throw new Error('Unknown application direction.');
  if(plan.status==='undone')return plan;
  if(plan.status==='applied'&&direction==='apply')return plan;
  if(plan.direction&&plan.direction!==direction&&plan.status!=='applied')throw new Error('Finish the interrupted operation first.');
  await authorize();
  const steps=direction==='undo'?[...plan.steps].reverse():plan.steps;
  const desired=direction==='undo'?'undone':'applied';
  // Validate all remaining writes before starting. Completed receipts survive partial failures.
  async function pending(step) {
    const doc=await read(step.uuid);
    const receipt=getPath(doc,`flags.phoenix-command.receipts.${plan.id}.${step.key}`);
    if(receipt===desired)return false;
    if(direction==='undo'&&receipt!=='applied')throw new Error('Cannot undo an unapplied step. Resume application first.');
    if(direction==='apply'&&receipt)throw new Error('This application has already been reversed.');
    const expected=direction==='undo'?step.after:step.before;
    for(const [path,value] of expected)if(!equal(getPath(doc,path),value))throw new Error(`${step.label} changed. Manual reconciliation is required; no conflicting value was overwritten.`);
    return true;
  }
  for(const step of steps)await pending(step);
  plan.direction=direction;plan.status=direction==='undo'?'undoing':'applying';plan.error=null;await save(plan);
  try {
    for(const step of steps) {
      await authorize();
      if(!await pending(step))continue;
      const patch={...Object.fromEntries(direction==='undo'?step.undo:step.after),[`flags.phoenix-command.receipts.${plan.id}.${step.key}`]:desired};
      await write(step.uuid,patch);
    }
    plan.status=direction==='undo'?'undone':'applied';await save(plan);return plan;
  }catch(error){plan.error=error.message;try{await save(plan);}catch{/* Receipts remain the recovery authority. */}throw error;}
}
