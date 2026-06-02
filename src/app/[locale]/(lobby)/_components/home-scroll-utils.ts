export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
) {
  if (value <= inMin) return outMin
  if (value >= inMax) return outMax
  return outMin + ((value - inMin) / (inMax - inMin)) * (outMax - outMin)
}

export function phaseOpacity(progress: number, start: number, end: number) {
  const fade = 0.08
  if (progress < start - fade) return 0
  if (progress > end + fade) return 0
  if (progress < start) return (progress - (start - fade)) / fade
  if (progress > end) return 1 - (progress - end) / fade
  return 1
}
