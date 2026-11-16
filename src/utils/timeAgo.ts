export function formatUdhaarElapsed(sinceMs: number | null): {
  roman: string;
  urdu: string;
} {
  if (!sinceMs) {
    return { roman: 'Clear', urdu: 'صاف' };
  }
  const diffMs = Math.max(0, Date.now() - sinceMs);
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) {
    const m = Math.max(1, mins);
    return { roman: `${m} min pehly`, urdu: `${m} منٹ پہلے` };
  }
  const hours = Math.floor(mins / 60);
  if (hours < 24) {
    return { roman: `${hours} ghante pehly`, urdu: `${hours} گھنٹے پہلے` };
  }
  const days = Math.floor(hours / 24);
  if (days < 7) {
    return { roman: `${days} din pehly`, urdu: `${days} دن پہلے` };
  }
  const weeks = Math.floor(days / 7);
  if (weeks < 5) {
    return { roman: `${weeks} hafte pehly`, urdu: `${weeks} ہفتے پہلے` };
  }
  const months = Math.floor(days / 30);
  return { roman: `${months} mah pehly`, urdu: `${months} ماہ پہلے` };
}
