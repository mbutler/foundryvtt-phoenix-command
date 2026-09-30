// Small Arms Combat System LEG10200, PDF 67, Table 7B.
// Printed costs; execution records whether the coordinator also applies the effect.
export const activitySource=Object.freeze({book:'LEG10200',pdfPage:67,table:'7B',revision:1,status:'visual-transcription'});
const rows=[];
function fixed(group,id,label,actions,extra={}) {
  rows.push({id,group,label,cost:{kind:'fixed',actions},...extra});
}
for(const [id,label,cost] of [
  ['firing-stance','Assume firing stance over or around cover',2],
  ['hip-stance','Assume hip firing stance over or around cover',1],
  ['look-cover','Look over or around cover',1],
  ['duck-cover','Duck from firing stance or looking',1],
  ['brace','Brace weapon',1],
  ['turn','Change facing 60–120 degrees',1],
  ['turn-firing','Change facing 60 degrees in firing stance',2],
  ['stand-kneel','Standing to kneeling',1],
  ['stand-prone','Standing to prone',2],
  ['kneel-stand','Kneeling to standing',1],
  ['kneel-prone','Kneeling to prone',1],
  ['prone-kneel','Prone to kneeling',2],
  ['prone-stand','Prone to standing',3],
  ['kick-door','Kick open door',2],
  ['open-door','Open door',3],
  ['open-window','Open window with two hands',6],
  ['clear-window','Break and clear window glass',6],
  ['climb-window','Climb through window',6],
  ['leave-trench','Get out of trench or foxhole',6]
])fixed('actions',id,label,cost);
for(const [id,label,cost] of [
  ['cock','Cock revolver or pistol',1],
  ['take-ammo','Take bullet or magazine from pouch',4],
  ['stow-ammo','Replace bullet or magazine into pouch',6],
  ['link-belt','Link ammunition belt',8],
  ['load-round','Load round into magazine',4],
  ['load-strip','Load charging strip into magazine',7],
  ['open-ammo-can','Open hinged ammunition can',4],
  ['open-ammo-box','Open paper ammunition box',4]
])fixed('reloading',id,label,cost);
rows.push({id:'unload-weapon',group:'reloading',label:'Unload weapon',cost:{kind:'weapon-reload-time'}});
for(const [id,label,cost] of [
  ['selector','Operate safety or fire selector',1],
  ['pick-set-weapon','Pick up or set down weapon',4],
  ['grab-slung','Grab unheld weapon slung across front of chest',3],
  ['throw-object','Throw small object',2],
  ['pick-object','Pick up grenade or small object',2]
])fixed('weapon',id,label,cost);
for(const [id,label,cost] of [
  ['shoulder','Shoulder holster',3],['belt','Belt holster',3],
  ['police','Police holster',2],['old-west','Old West fast draw holster',2],
  ['modern','Modern fast draw holster',1]
])rows.push({id:`draw-${id}`,group:'weapon',label:`Draw pistol: ${label}`,cost:{kind:'holster',actions:cost,concealedExtra:2}});
for(const [id,label,inActions,outActions] of [
  ['backpack','Backpack with quick release',16,7],
  ['bandolier','Bandolier or belt',6,4],
  ['scabbard','Bayonet or knife from scabbard',3,2],
  ['bayonet','Bayonet to weapon',3,3],
  ['bipod','Bipod',5,8],
  ['armor','Body armor (external vest)',24,13],
  ['harness','Climbing harness',18,10],
  ['stock','Folding stock',6,4],
  ['mask','Gas mask',12,5],
  ['scope','Optical scope',12,4],
  ['parachute','Parachute with quick release',20,8],
  ['pistol-stock','Pistol shoulder stock',8,6],
  ['silencer','Silencer',9,9],
  ['sling','Sling weapon over shoulder',3,2],
  ['tripod','Tripod and weapon',12,8]
])rows.push({id:`equipment-${id}`,group:'equipment',label,cost:{kind:'equipment-direction',inActions,outActions}});
const automatic=new Set(['stand-kneel','stand-prone','kneel-stand','kneel-prone','prone-kneel','prone-stand','firing-stance','hip-stance','brace','unload-weapon',
  'draw-shoulder','draw-belt','draw-police','draw-old-west','draw-modern','grab-slung','pick-set-weapon',
  'equipment-armor','equipment-backpack','equipment-bandolier','equipment-harness','equipment-mask','equipment-parachute',
  'equipment-scabbard','equipment-sling','pick-object','throw-object','selector','open-door','kick-door','look-cover','duck-cover']);
export const activities=Object.freeze(rows.map(row=>Object.freeze({...row,cost:Object.freeze(row.cost),source:activitySource,execution:automatic.has(row.id)?'automatic':['turn','turn-firing'].includes(row.id)?'dedicated-turn':'manual'})));
