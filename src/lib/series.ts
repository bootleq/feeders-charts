import * as R from 'ramda';
import { makeYearRange } from '@/lib/utils';
import type { CountryItem, ItemsMeta } from '@/lib/model';

export type SeriesSet = Record<string, boolean>;

type SeriesFilters = {
  cities?: string[] | FormDataEntryValue[],
  years?: number[] | FormDataEntryValue[],
}

type Series = Record<string, any>;

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
  infant: '幼犬',
  seized: '沒入',
  accept: '收容',
  adopt: '認領',
  kill: '人道處理',
  die: '所內死亡',
  return: '回置',
  miss: '逃脫等',
  room: '可收容量',
  occupy: '在養數',
  occupy100: '收容壓力',
  h_visit: '熱區家訪',
  h_roam: '熱區無主犬',
  h_feed: '熱區餵食',
  h_stop: '疏導餵食',
  // _marker: '事件標記', // this will be added in addition to normal data series process
} as const;

export const computers: Record<string, Computer> = {
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
  occupy100: {
    depends: ['room', 'occupy'],
    fn: (room: SeriesData, occupy: SeriesData) => {
      return room.map((roomQty, idx) => {
        const occupyQty = occupy[idx];
        if (typeof occupyQty  === 'number' && typeof roomQty === 'number') {
          return occupyQty  / roomQty * 100;
        }
        return null;
      });
    },
  },
};

function collect({ items, yearRange, validYears, validCities, computers, requiredRawSeries, computedSeries, checkedSeries, citiesSeries }: {
  items: CountryItem[],
  yearRange: number[],
  validYears: false | number[],
  validCities: false | string[],
  computers: Record<string, Computer>,
  requiredRawSeries: string[],
  computedSeries: string[],
  checkedSeries: string[],
  citiesSeries: Record<string, Series>,
}) {
  // 1st pass, collect simple "raw" qty from items
  items.forEach(item => {
    const { year, city } = item;
    const yearIdx = yearRange.indexOf(year);

    if (validYears && !validYears.includes(year)) return;
    if (validCities && !validCities.includes(city)) return;

    const toAdd = requiredRawSeries.reduce((memo, key) => {
      const qty = item[key as keyof CountryItem] as number;
      if (qty > 0) return R.assoc(key, qty, memo);
      return memo;
    }, {});

    for (const [key, qty] of Object.entries(toAdd)) {
      citiesSeries = R.over(
        R.lensPath([city, key, 'data', yearIdx]),
        R.pipe(Number, R.add(qty as number)),
        citiesSeries
      );

      if (city !== '_') { // Still add to '_' for cross-cities total
        citiesSeries = R.over(
          R.lensPath(['_', key, 'data', yearIdx]),
          R.pipe(Number, R.add(qty as number)),
          citiesSeries
        );
      }
    }
  });

  // 2nd pass, compute special series from previous result
  computedSeries.forEach(name => {
    const computer = computers[name];

    citiesSeries = R.mapObjIndexed((obj: Series) => {
      const cityArgs = computer.depends.map(key => obj[key]?.data);

      return R.set(
        R.lensPath([name, 'data']),
        computer.fn(...cityArgs)
      )(obj);
    })(citiesSeries);
  });

  // 3rd pass, clear not selected series (which were added only for 2nd pass)
  R.difference(requiredRawSeries, checkedSeries).forEach(name => {
    citiesSeries = R.mapObjIndexed(
      R.set(
        R.lensPath([name, 'data']),
        null
      )
    )(citiesSeries);
  });

  return citiesSeries;
}

export function buildSeriesMaker(
  seriesNameMap: Record<string, string>,
  computers: Record<string, Computer>,
) {
  const customComputeSeries = Object.keys(computers);

  // Return named "series" data grouped by "city", where '_' is a pseudo key means "ALL cities".
  // Cities other than '_' are not included unless `extraOptions.spreadToCities` present.
  //
  // {
  //  '_': {
  //    roaming: {
  //      name: '遊蕩犬估計',
  //      data: [...],
  //    },
  //  },
  //  'City000002': {
  //    roaming: {
  //      ...
  //    },
  //  },
  // }
  return function makeSeries(
    items: CountryItem[],
    meta: ItemsMeta,
    seriesSet: SeriesSet,
    filters?: SeriesFilters,
    extraOptions?: {
      spreadToCities: string[]
    },
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
        name: seriesNameMap[name],
        data: requiredRawSeries.includes(name) ? initialData : null,
      };
      return R.assoc(name, obj, acc);
    }, {});

    const makeToCities = ['_']; // '_' means "ALL" cities, no distinguish
    if (extraOptions?.spreadToCities) {
      makeToCities.push(...extraOptions.spreadToCities);
    }

    const citiesSeries = R.fromPairs(makeToCities.map(city => [city, initialSeries]));

    return collect({
      items,
      yearRange,
      validYears,
      validCities,
      computers,
      requiredRawSeries,
      computedSeries,
      checkedSeries,
      citiesSeries,
    });
  }
}
