import * as R from 'ramda';
import { atom } from 'jotai';
import type { SeriesSet } from '@/lib/series';

export const seriesChecksAtom = atom<SeriesSet>({
  roaming:  true,  // 遊蕩犬估計
  domestic: true,  // 家犬
  human:    true,  // 人口數
  // human100: false, // 每百人遊蕩犬數
  accept:   true,  // 收容
  adopt:    true,  // 認領
  kill:     true,  // 人道處理
  die:      true,  // 所內死亡
  // h_visit:  true,  // 熱區 家訪戶數
  h_roam:   true,  // 熱區 無主犬清查
  h_feed:   true,  // 熱區 餵食者人數
  h_stop:   true,  // 熱區 疏導餵食成功
});

export const seriesMenuItemAtom = (key: string) => atom(
  get => get(seriesChecksAtom)[key] ?? false,
  (get, set) => {
    set(seriesChecksAtom, R.over(R.lensProp(key), R.not));
  }
);
