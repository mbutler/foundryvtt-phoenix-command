// One active-GM client serializes encounter and application writes together.
// This is not a cross-client or server-side lock.
let queue=Promise.resolve();
let session=null;
export const localCoordinatorSession=()=>session;
export const setCoordinatorSession=value=>{session=value;};
export function serialized(task){const next=queue.then(task);queue=next.catch(()=>{});return next;}
export function requireCoordinator(){
  if(!game.user.isGM||game.users.activeGM?.id!==game.user.id)throw new Error('The active coordinating GM must apply or undo results. Use one GM client for applications.');
  const published=game.settings.get('phoenix-command','intentSession');
  if(!session||published?.nonce!==session||published?.userId!==game.user.id)throw new Error('This GM client has no current coordinator session. Reload Foundry to take over; pending requests are not replayed.');
}
