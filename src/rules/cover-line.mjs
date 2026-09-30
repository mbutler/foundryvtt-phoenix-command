// Which recorded cover lies on a line of fire. Pure geometry over plain descriptors; the
// Foundry adapter in `../foundry/cover-scene.mjs` turns Wall and Region documents into them.
//
// §3.8 is about the cover a target is BEHIND, so that is the only thing looked for here: a
// barrier the shot crosses on its way to him, or an area he is standing in. Cover the round
// merely passes through on its way to a man in the open is a different rule, and Table 7C's
// "Woods (per 10 hexes)" is its only hint; it stays out, as it does in the cover reference.
export const coverLineSource='LEG10200 §3.8 PDF 37; Table 7C PDF 67';

const finite=value=>typeof value==='number'&&Number.isFinite(value);
const point=(value,name)=>{
  if(!value||!finite(value.x)||!finite(value.y))throw new Error(`${name} needs finite x and y.`);
  return {x:value.x,y:value.y};
};

// Do segments AB and CD cross? Orientation test with the collinear cases handled, so a shot
// that grazes exactly along a wall's line still reads as crossing it.
const orient=(a,b,c)=>Math.sign((b.x-a.x)*(c.y-a.y)-(b.y-a.y)*(c.x-a.x));
const within=(a,b,c)=>Math.min(a.x,b.x)<=c.x&&c.x<=Math.max(a.x,b.x)
  &&Math.min(a.y,b.y)<=c.y&&c.y<=Math.max(a.y,b.y);
export function segmentsCross(a,b,c,d){
  for(const [value,name] of [[a,'the first point'],[b,'the second point'],[c,'the third point'],[d,'the fourth point']])point(value,name);
  const o1=orient(a,b,c),o2=orient(a,b,d),o3=orient(c,d,a),o4=orient(c,d,b);
  if(o1!==o2&&o3!==o4)return true;
  if(o1===0&&within(a,b,c))return true;
  if(o2===0&&within(a,b,d))return true;
  if(o3===0&&within(c,d,a))return true;
  if(o4===0&&within(c,d,b))return true;
  return false;
}

// How far a point lies from a segment. Needed because a line of fire crosses a barrier in
// BOTH directions, and §3.8 asks only about the cover the TARGET is behind.
export function distanceToSegment(p,a,b){
  for(const [value,name] of [[p,'the point'],[a,'a segment end'],[b,'a segment end']])point(value,name);
  const dx=b.x-a.x,dy=b.y-a.y,len=dx*dx+dy*dy;
  if(len===0)return Math.hypot(p.x-a.x,p.y-a.y);
  const t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/len));
  return Math.hypot(p.x-(a.x+t*dx),p.y-(a.y+t*dy));
}

// RULED AT THIS TABLE, and recorded here rather than left to be rediscovered: **a barrier is
// the cover of whichever man is nearer to it.**
//
// §3.8 is written about "the cover a target hides behind" and never says how to tell whose
// cover a given thing is, because a person at a table can see it. Geometry cannot: a wall
// between two men is crossed by the line of fire in both directions, so a defender shooting
// OUT from behind his own wall would otherwise be treated as shooting at a man sheltered by
// it. He is not; the man in the open is in the open.
//
// Nearer-is-behind is the reading in force. It matches the fiction - you are behind the thing
// at your elbow, not the thing across the field - and it needs no judgement per shot. A
// barrier exactly equidistant from both is genuinely no one's, and is refused rather than
// awarded to either.
export const nearestRuling='Ruled: a barrier is the cover of whichever man stands nearer to it. §3.8 does not print a test, and a line of fire crosses a wall in both directions.';
const EQUIDISTANT=1e-6;

// A barrier is {id, label, pf, a:{x,y}, b:{x,y}}; an area is {id, label, pf, contains(point)}.
// Both carry whatever `coverProtectionFactor` returned, so the Table 7C provenance travels
// with them rather than being looked up twice.
function validate(entry,kind){
  if(!entry||typeof entry!=='object')throw new Error(`A recorded ${kind} must be an object.`);
  if(typeof entry.pf!=='number'||!Number.isFinite(entry.pf)||entry.pf<0)
    throw new Error(`Recorded cover "${entry.label??entry.id??'unnamed'}" has no Table 7C Protection Factor.`);
  return entry;
}

// Everything the scene can say about one shot's cover. It deliberately does NOT decide
// whether the cover blocks: that needs the round's PEN, which belongs to the weapon, and
// `coverSituation` in `./cover.mjs` is where the two meet.
export function coverOnLine({mapped,from,to,barriers=[],areas=[]}){
  if(typeof mapped!=='boolean')throw new Error('Say whether this scene has been mapped for cover.');
  if(!mapped)return {mapped:false,cover:null,candidates:[],ambiguous:false,
    detail:'This scene has not been marked up for cover, so nothing can be read from it. An unmarked map is not an empty field: state the cover, or mark the map.',
    source:coverLineSource};
  const shooter=point(from,'The shooter’s position'),target=point(to,'The target’s position');
  const candidates=[];

  // An area the target stands in is cover he is behind, from the point of view of anyone
  // outside it. If the shooter is standing in the same one, neither of them is behind it.
  for(const area of areas){
    validate(area,'area');
    if(typeof area.contains!=='function')throw new Error(`Recorded area "${area.label??area.id}" cannot be tested for a point.`);
    if(!area.contains(target))continue;
    if(area.contains(shooter)){
      candidates.push({...area,kind:'area',shared:true,applies:false,
        detail:`${area.label}: both men are inside it, so neither is behind it.`});
      continue;
    }
    candidates.push({...area,kind:'area',shared:false,applies:true,
      detail:`${area.label}: the target is inside it and the shooter is not.`});
  }

  // A barrier the line of fire crosses - and which of the two men it belongs to.
  for(const barrier of barriers){
    validate(barrier,'barrier');
    const a=point(barrier.a,'A barrier end'),b=point(barrier.b,'A barrier end');
    if(!segmentsCross(shooter,target,a,b))continue;
    const toShooter=distanceToSegment(shooter,a,b),toTarget=distanceToSegment(target,a,b);
    const gap=toShooter-toTarget;
    if(Math.abs(gap)<=EQUIDISTANT){
      candidates.push({...barrier,kind:'barrier',applies:false,equidistant:true,
        detail:`${barrier.label}: it stands the same distance from both men, so whose cover it is cannot be read off the map.`});
      continue;
    }
    if(gap<0){
      candidates.push({...barrier,kind:'barrier',applies:false,shooters:true,
        detail:`${barrier.label}: it is the shooter's own cover, nearer to him than to his target, so it shelters nobody from him.`});
      continue;
    }
    candidates.push({...barrier,kind:'barrier',applies:true,
      detail:`${barrier.label}: the line of fire crosses it, and the target stands nearer to it than the shooter does.`});
  }

  const applying=candidates.filter(entry=>entry.applies);
  const equidistant=candidates.filter(entry=>entry.equidistant);
  if(!applying.length&&equidistant.length)return {mapped:true,cover:null,candidates,ambiguous:true,
    detail:`${equidistant.map(entry=>entry.detail).join(' ')} State this shot's cover.`,
    source:coverLineSource};
  if(!applying.length)return {mapped:true,cover:null,candidates,ambiguous:false,
    detail:candidates.length
      ?'The line of fire crosses no cover the target is behind. '+candidates.map(entry=>entry.detail).join(' ')
      :'The line of fire crosses no recorded cover, and the target stands in none.',
    source:coverLineSource};
  // Two barriers between two men is two layers of cover, and §3.8 prices one. Rather than
  // pick the thicker or add them together - neither of which the book says - the reading is
  // reported as ambiguous and the GM says which one the man is actually behind.
  if(applying.length>1)return {mapped:true,cover:null,candidates,ambiguous:true,
    detail:`The line of fire crosses ${applying.length} recorded covers (${applying.map(entry=>entry.label).join(', ')}). §3.8 prices one, and the book says nothing about layers, so which one he is behind is yours to state.`,
    source:coverLineSource};
  const [only]=applying;
  return {mapped:true,cover:{pf:only.pf,label:only.label,basis:only.basis??'table',
    from:only.kind,documentId:only.id},candidates,ambiguous:false,
    detail:only.detail,source:coverLineSource};
}
