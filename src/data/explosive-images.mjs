import {grenades} from './grenades.mjs';
import {launchers} from './launchers.mjs';
import {supplementImageFiles} from './supplements/index.mjs';

// Where the grenade, charge and launcher artwork will go, by catalogue id, in the same place
// and naming as the gun artwork: assets/weapons/<catalog-id>.png. The files have not been
// added yet, so nothing assumes they exist: the picker's card drops a picture that fails to
// load, a new Item takes its picture only once the file is there, and the ready-time repair
// (foundry/weapon-image-repair.mjs) gives existing Items theirs when the files arrive.
// Supplement guns follow the same rule: their pictures arrive a batch at a time.
export const explosiveImageFiles=Object.freeze({...Object.fromEntries(
  [...grenades,...launchers].map(entry=>[entry.id,`assets/weapons/${entry.id}.png`])),...supplementImageFiles});

export function explosiveImagePath(id){
  const file=explosiveImageFiles[id];
  return file?new URL('../../'+file,import.meta.url).pathname:null;
}

// Whether the file is actually there, asked once per path.
const known=new Map();
export async function presentImage(path){
  if(!path)return null;
  if(!known.has(path))known.set(path,fetch(path,{method:'HEAD',cache:'no-store'}).then(r=>r.ok).catch(()=>false));
  return (await known.get(path))?path:null;
}
