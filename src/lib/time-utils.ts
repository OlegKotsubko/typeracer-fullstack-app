export function secondsToMinutesSeconds(
  seconds: number
): { minutes: number; seconds: number } {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return { minutes, seconds: remainingSeconds };
}

export function minutesSecondsToSeconds(
  minutes: number,
  seconds: number
): number {
  return minutes * 60 + seconds;
}
