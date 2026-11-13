export function loopOffset(from, to, length) {
  let diff = (to - from) % length;
  if (diff > length / 2) diff -= length;
  if (diff < -length / 2) diff += length;
  return diff;
}

export function loopDirection(from, to, length) {
  return loopOffset(from, to, length) > 0 ? 1 : -1;
}
