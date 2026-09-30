// Cube coordinates for a hex map. Foundry's own grid speaks this system (`getCube` returns
// `{q, r, s}`), and the rounding below is the same one Foundry's HexagonalGrid.cubeRound
// uses, so a cube read off a scene stays on the lines this module draws.
//
// q + r + s = 0. Distance is half the sum of absolute differences, which is the hex steps
// between two cells — the same count `measurePath(...).spaces` reports.

const whole = n => Number.isSafeInteger(n);

export function cube(q, r, s) {
  if (![q, r, s].every(whole) || q + r + s !== 0) throw new Error('A hex needs three integers that sum to zero.');
  return { q, r, s };
}

export function asCube(value) {
  if (!value || typeof value !== 'object') throw new Error('A hex cube is required.');
  return cube(value.q, value.r, value.s);
}

export const sameHex = (a, b) => a.q === b.q && a.r === b.r && a.s === b.s;

export function cubeDistance(a, b) {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.s - b.s)) / 2;
}

export function cubeRound(frac) {
  let q = Math.round(frac.q), r = Math.round(frac.r), s = Math.round(frac.s);
  const dq = Math.abs(q - frac.q), dr = Math.abs(r - frac.r), ds = Math.abs(s - frac.s);
  if (dq > dr && dq > ds) q = -r - s;
  else if (dr > ds) r = -q - s;
  else s = -q - r;
  return { q, r, s };
}

// Inclusive hex line from a to b. A zero-length line is the one hex.
export function hexLine(a, b) {
  const from = asCube(a), to = asCube(b);
  const n = cubeDistance(from, to);
  if (n === 0) return [from];
  const line = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    line.push(cubeRound({
      q: from.q + (to.q - from.q) * t,
      r: from.r + (to.r - from.r) * t,
      s: from.s + (to.s - from.s) * t
    }));
  }
  return line;
}

// The hex `extra` steps past `through`, on the bearing from `origin` through it.
export function extendRay(origin, through, extra) {
  const from = asCube(origin), via = asCube(through);
  const n = cubeDistance(from, via);
  if (n < 1) throw new Error('A ray starts at the shooter and passes through another hex.');
  if (!whole(extra) || extra < 0) throw new Error('A ray extends a whole number of hexes.');
  const scale = (n + extra) / n;
  return cubeRound({
    q: from.q + (via.q - from.q) * scale,
    r: from.r + (via.r - from.r) * scale,
    s: from.s + (via.s - from.s) * scale
  });
}
