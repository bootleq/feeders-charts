import * as R from 'ramda';
import { makeYearRange } from '@/lib/utils';
import type { CountryItem, ItemsMeta } from '@/lib/model';

export type SeriesSet = Record<string, boolean>;

type SeriesFilters = {
  cities?: string[] | FormDataEntryValue[],
  years?: number[] | FormDataEntryValue[],
}

type SeriesData = Array<number|null>;

type Computer = {
  depends: string[],
  fn: (...args: SeriesData[]) => SeriesData,
};

export const SERIES_NAMES: Record<string, string> = {
  roaming: '遊蕩犬估計',
  domestic: '家犬',
  human: '人口',
  human100: '每百人',
  accept: '收容',
  adopt: '認領',
  kill: '人道處理',
  die: '所內死亡',
  return: '回置',
  miss: '逃脫等',
  room: '可收容量',
  occupy: '在養數',
  h_visit: '熱區家訪',
  h_roam: '熱區無主犬',
  h_feed: '熱區餵食',
  h_stop: '疏導餵食',
  // _marker: '事件標記', // this will be added in addition to normal data series process
} as const;

const computers: Record<string, Computer> = {
  human100: {
    depends: ['roaming', 'human'],
    fn: (roaming: SeriesData, human: SeriesData) => {
      return roaming.map((roamQty, idx) => {
        const humanQty = human[idx];
        if (typeof roamQty === 'number' && typeof humanQty === 'number') {
          return roamQty / humanQty * 100;
        }
        return null;
      });
    },
  },
};

const customComputeSeries = Object.keys(computers);

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
  const [rawSeries, computedSeries] = R.partition((key) => !customComputeSeries.includes(key), checkedSeries);
  const dependsSeries = computedSeries.map(key => computers[key].depends).flat();
  const requiredRawSeries = R.union(rawSeries, dependsSeries);

  const initialSeries = Object.keys(seriesSet).reduce((acc: SeriesSet, name) => {
    const obj = {
      name: SERIES_NAMES[name],
      data: requiredRawSeries.includes(name) ? initialData : null,
    };
    return R.assoc(name, obj, acc);
  }, {});

  // 1st pass, collect simple "raw" qty from items
  let series: Record<string, any> = items.reduce((acc, item) => {
    const { year, city } = item;
    const yearIdx = yearRange.indexOf(year);

    if (validYears && !validYears.includes(year)) return acc;
    if (validCities && !validCities.includes(city)) return acc;

    const toAdd = requiredRawSeries.reduce((memo, key) => {
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

  // 2nd pass, compute special series from previous result
  computedSeries.forEach(name => {
    const computer = computers[name];
    const args = computer.depends.map(key => series[key].data);

    series = R.set(
      R.lensPath([name, 'data']),
      computer.fn(...args)
    )(series);
  });

  // 3rd pass, clear not selected series (which were added only for 2nd pass)
  R.difference(requiredRawSeries, checkedSeries).forEach(name => {
    series = R.set(
      R.lensPath([name, 'data']),
      null
    )(series);
  });

  const result = Object.keys(seriesSet).map(name => series[name]);

  return result;
}
