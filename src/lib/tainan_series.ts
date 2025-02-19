import type { Computer } from '@/lib/makeSeries';

export const SERIES_NAMES: Record<string, string> = {
  male:   '公犬',
  female: '母犬',
  total:  '總數',
} as const;

export const computers: Record<string, Computer> = {};
