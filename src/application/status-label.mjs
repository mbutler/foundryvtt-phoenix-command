export function applicationStatusLabel(status){
  return ({applied:'APPLIED',undone:'UNDONE',cancelled:'CANCELLED',applying:'APPLY INCOMPLETE',undoing:'UNDO INCOMPLETE',prepared:'NOT APPLIED'})[status]??'NOT APPLIED';
}
