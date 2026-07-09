/**
 * Calculate overtime in hours from check-in and check-out times.
 * Standard workday = 8 hours. Returns a string like "2h" or "—".
 */
export function calculateOvertime(checkIn, checkOut) {
  if (!checkIn || !checkOut) return '\u2014';
  const partsIn = checkIn.split(':').map(Number);
  const partsOut = checkOut.split(':').map(Number);
  if (partsIn.length < 2 || partsOut.length < 2 || isNaN(partsIn[0]) || isNaN(partsOut[0])) return '\u2014';
  const inMinutes = partsIn[0] * 60 + (partsIn[1] || 0);
  const outMinutes = partsOut[0] * 60 + (partsOut[1] || 0);
  const diff = outMinutes - inMinutes;
  if (diff <= 8 * 60) return '0h';
  const overtimeMinutes = diff - 8 * 60;
  const hours = Math.floor(overtimeMinutes / 60);
  const minutes = overtimeMinutes % 60;
  if (minutes === 0) return `${hours}h`;
  return `${hours}h${minutes}m`;
}