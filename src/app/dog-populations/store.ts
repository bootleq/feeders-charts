import * as R from 'ramda';
import { atom } from 'jotai';

export type Toggles = Record<string, boolean>;

export const seriesMenuItemsAtom = atom<Toggles>({});

export const seriesChecksAtom = atom<{ [key: string]: boolean }>({
  human: false,     // 人口數
  human100: false,  // 每百人遊蕩犬數
  domestic: false,  // 家犬估計數
});

export const seriesMenuItemAtom = (key: string) => atom(
  get => get(seriesChecksAtom)[key] ?? false,
  (get, set) => {
    set(seriesChecksAtom, R.over(R.lensProp(key), R.not));
  }
);
