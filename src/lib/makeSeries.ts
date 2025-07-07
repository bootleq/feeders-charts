import * as R from 'ramda';
import { makeYearRange } from '@/lib/utils';
import type { CountryItem, ItemsMeta } from '@/lib/model';
import type { CheckboxSet } from '@/components/types';

type Series = Record<string, any>;
export type SeriesData = Array<number|null>;

type SeriesFilters = {
  cities?: string[] | FormDataEntryValue[],
  years?: number[] | FormDataEntryValue[],
}

export type Computer = {
  depends: string[],
  fn: (...args: SeriesData[]) => SeriesData,
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
      const cityArgs = computer.depends.map(key => {
        if (obj[key]) {
          return obj[key].data;
        } else {
          return [];
        }
      });

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

export type MakeSeriesFn = ReturnType<typeof buildSeriesMaker>;
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
    seriesSet: CheckboxSet,
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

    const initialSeries = Object.keys(seriesSet).reduce((acc: CheckboxSet, name) => {
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
