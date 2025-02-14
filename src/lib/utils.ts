export function makeYearRange(min: number, max: number) {
  return Array.from(
    {length: max - min + 1},
    (_, i) => min + i
  );
}

const htmlSpecialCharsMap: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&#34;',
  "'": '&#39;'
} as const;

export function escapeHTML(raw: string) {
  return raw.replace(/[&<>"']/g, (char) => htmlSpecialCharsMap[char]);
}
