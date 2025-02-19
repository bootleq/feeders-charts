import * as R from 'ramda';
import { atom } from 'jotai';
import { SERIES_NAMES } from '@/lib/tainan_series';
import type { TableRow, CheckboxSet } from '@/components/types';

export const seriesChecksAtom = atom<CheckboxSet>(
  Object.keys(SERIES_NAMES).reduce((acc, name) => {
    return R.assoc(name, true, acc);
  }, {})
);

export const tableAtom = atom<TableRow[]>([]);
export const tableDialogOpenAtom = atom<boolean>(false);
