import * as R from 'ramda';
import { makeYearRange } from '@/lib/utils';
import type { CountryItem, ItemsMeta } from '@/lib/model';

type SeriesFilters = {
  cities?: string[] | FormDataEntryValue[],
  years?: number[] | FormDataEntryValue[],
}

export function makeSeries(
  items: CountryItem[],
  meta: ItemsMeta,
  filters?: SeriesFilters
) {
  const validCities = filters?.cities?.length ? filters.cities.map(String) : false;
  const validYears = filters?.years?.length ? filters.years.map(Number) : false;

  const minYear = validYears ? Math.min(...validYears) : meta.minYear;
  const maxYear = validYears ? Math.max(...validYears) : meta.maxYear;
  const yearRange = makeYearRange(minYear, maxYear);
  const initialData: Array<number | null> = Array(yearRange.length).fill(null);
  const initialSeries = {
    roaming: {
      data: initialData,
      type: 'bar',
      smooth: true,
    },
    domestic: {
      data: initialData,
      type: 'line',
    },
    accept: {
      data: initialData,
      type: 'line',
    },
    adopt: {
      data: initialData,
      type: 'line',
    },
    kill: {
      data: initialData,
      type: 'line',
    },
    die: {
      data: initialData,
      type: 'line',
    },
  };

  const series = items.reduce((acc, item) => {
    const { year, city } = item;
    const yearIdx = yearRange.indexOf(year);

    if (validYears && !validYears.includes(year)) return acc;
    if (validCities && !validCities.includes(city)) return acc;

    const qtyKeys: (keyof CountryItem)[] = ['roaming', 'domestic', 'accept', 'adopt', 'kill', 'die'];
    const toAdd = qtyKeys.reduce((memo, key) => {
      const qty = item[key] as number;
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

  return [
    series.roaming,
    series.domestic,
    series.accept,
    series.adopt,
    series.kill,
    series.die,
  ];
}

