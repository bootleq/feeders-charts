import * as R from 'ramda';
import { atom } from 'jotai';
import { SERIES_NAMES } from '@/lib/series';
import type { SeriesSet } from '@/lib/series';

const initialExcludeSeries = [
  'human100',
  'room',
];

export const seriesChecksAtom = atom<SeriesSet>(
  Object.keys(SERIES_NAMES).reduce((acc, name) => {
    return R.assoc(name, !initialExcludeSeries.includes(name), acc);
  }, {})
);

export const seriesMenuItemAtom = (key: string) => atom(
  get => get(seriesChecksAtom)[key] ?? false,
  (get, set) => {
    set(seriesChecksAtom, R.over(R.lensProp(key), R.not));
  }
);
