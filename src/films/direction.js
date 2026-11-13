export function loopDirection(from, to, length) {
  let diff = (to - from) % length;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff > 0 ? 1 : -1;
}
