import * as R from 'ramda';
import { makeYearRange } from '@/lib/utils';
import type { CountryItem, ItemsMeta } from '@/lib/model';

export type SeriesSet = Record<string, boolean>;

type SeriesFilters = {
  cities?: string[] | FormDataEntryValue[],
  years?: number[] | FormDataEntryValue[],
}

export const SERIES_NAMES: Record<string, string> = {
  domestic: '家犬',
  roaming: '遊蕩犬估計',
  accept: '收容',
  adopt: '認領',
  kill: '人道處理',
  die: '所內死亡',
  h_visit: '熱區家訪',
  h_roam: '熱區無主犬',
  h_feed: '熱區餵食',
  h_stop: '疏導餵食',
  human: '人口',
} as const;

export function makeSeries(
  items: CountryItem[],
  meta: ItemsMeta,
  seriesSet: SeriesSet,
  filters?: SeriesFilters,
) {
  const validCities = filters?.cities?.length ? filters.cities.map(String) : false;
  const validYears = filters?.years?.length ? filters.years.map(Number) : false;

  const minYear = validYears ? Math.min(...validYears) : meta.minYear;
  const maxYear = validYears ? Math.max(...validYears) : meta.maxYear;
  const yearRange = makeYearRange(minYear, maxYear);
  const initialData: Array<number | null> = Array(yearRange.length).fill(null);
  const checkedSeries = Object.keys(R.pickBy(R.identity, seriesSet));

  const initialSeries = Object.entries(seriesSet).reduce((acc: SeriesSet, [name, checked]: [string, boolean]) => {
    const obj = {
      name: SERIES_NAMES[name],
      data: checked ? initialData : null,
    };
    return R.assoc(name, obj, acc);
  }, {});

  const series: Record<string, any> = items.reduce((acc, item) => {
    const { year, city } = item;
    const yearIdx = yearRange.indexOf(year);

    if (validYears && !validYears.includes(year)) return acc;
    if (validCities && !validCities.includes(city)) return acc;

    const toAdd = checkedSeries.reduce((memo, key) => {
      const qty = item[key as keyof CountryItem] as number;
      if (qty > 0) return R.assoc(key, qty, memo);
      return memo;
    }, {});

    for (const [key, qty] of Object.entries(toAdd)) {
      acc = R.over(
        R.lensPath([key, 'data', yearIdx]),
        R.pipe(Number, R.add(qty as number)),
        acc
      );
    }

    return acc;
  }, initialSeries);

  const result = Object.keys(seriesSet).map(name => series[name]);

  return result;
}

