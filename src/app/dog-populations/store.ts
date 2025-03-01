import * as R from 'ramda';
import { atom } from 'jotai';
import { SERIES_NAMES } from '@/lib/series';
import { offenceTypeKeys } from '@/lib/model';
import type { TableRow, CheckboxSet } from '@/components/types';

const initialExcludeSeries = [
  'human',
  'room',
  'infant',
  'miss',
  'seized',
  'occupy',
  'h_stop',
  ...offenceTypeKeys,
];

export const seriesChecksAtom = atom<CheckboxSet>(
  Object.keys(SERIES_NAMES).reduce((acc, name) => {
    return R.assoc(name, !initialExcludeSeries.includes(name), acc);
  }, {})
);

export const representMenuAtom = atom<CheckboxSet>({
  roaming_chart_bar: true,
  show_all_labels: false,
});

export const markerMenuAtom = atom<CheckboxSet>({
  '垃圾不落地': false,
  '零撲殺公告': false,
  '零撲殺施行': true,
});

export const tableAtom = atom<TableRow[]>([]);
export const tableDialogOpenAtom = atom<boolean>(false);
