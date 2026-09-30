const FEET = Object.freeze({ ft: 1, m: 1 / 0.3048, pccsHex: 6, meleeHex: 2 });

export function distanceInFeet({ value, unit }) {
  if (!Number.isFinite(value) || value < 0) throw new RangeError('Distance must be a nonnegative number.');
  if (!Object.hasOwn(FEET, unit)) throw new RangeError(`Unknown distance unit: ${unit}`);
  return value * FEET[unit];
}

export function convertDistance(distance, unit) {
  if (!Object.hasOwn(FEET, unit)) throw new RangeError(`Unknown distance unit: ${unit}`);
  return distanceInFeet(distance) / FEET[unit];
}
