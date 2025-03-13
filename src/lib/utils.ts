import * as R from 'ramda';
import { format } from 'date-fns';
import { zhTW } from 'date-fns/locale';

const appURLCfg = process.env.NEXT_PUBLIC_APP_URL;

export const SITE_NAME = 'Feeders';
export const APP_URL = appURLCfg && new URL(appURLCfg);
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const present = R.both(R.isNotNil, R.isNotEmpty);
export const blank = R.complement(present);

export function makeYearRange(min: number, max: number) {
  return Array.from(
    {length: max - min + 1},
    (_, i) => min + i
  );
}

export function roundNumber(digits: number, value: any) {
  if (typeof value === 'number') {
    const fixed = value.toFixed(2);
    if (fixed.replace(/\.?0+$/, '') === value.toString()) {
      return value;
    }
    return Number(fixed);
  }
  return value;
}

export const numberFormatter = (number: number) => Intl.NumberFormat("zh-TW").format(number);

export function tooltipClass(className?: string) {
  return `rounded box-border w-max z-[1002] bg-slate-100 ${className || ''}`;
}
export function tooltipMenuCls(className?: string) {
  return [
    'flex flex-col divide-y w-full items-center justify-between',
    'rounded bg-gradient-to-br from-stone-50 to-slate-100 ring-2 ring-offset-1 ring-slate-300',
    className || '',
  ].join(' ');
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

export function formatDate(date: Date, fmt?: string) {
  let str;

  switch (fmt) {
    case 'week':
      str = format(date, 'yyyy-MM-dd (EE) HH:mm:ss', { locale: zhTW });
      return str.replace('週', '');

    default:
      return format(date, 'yyyy-MM-dd HH:mm:ss');
  }
}
