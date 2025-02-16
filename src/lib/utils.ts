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

export function makeDownload(dataURL: string, name: string) {
  fetch(dataURL).then(res => res.blob()).then(blob => {
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = name;
    document.body.appendChild(link);
    link.click();

    URL.revokeObjectURL(blobUrl);
    document.body.removeChild(link);
  }).catch(console.error);
}
