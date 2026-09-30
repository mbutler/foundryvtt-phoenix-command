import {rangeALMTable} from '../data/range.mjs';
// Read the next longer printed range, i.e. the lower ALM. The §3.5 worked
// example confirms 15 hexes -> range 16 -> +13; never fit or interpolate cells.
export function rangeALM(hexes){
 if(!Number.isFinite(hexes)||hexes<=0||hexes>rangeALMTable.at(-1).hexes)
  throw new RangeError('Range must be greater than zero and within Table 4A (4350 hexes).');
 return rangeALMTable.find(row=>row.hexes>=hexes).alm;
}
