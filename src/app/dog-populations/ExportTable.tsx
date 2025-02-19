import * as R from 'ramda';
import { useCallback, useMemo } from 'react';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { useSetAtom } from 'jotai';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { CITY_MAPPING, cityLookup } from '@/lib/model';
import type { CountryItem } from '@/lib/model';
import { SERIES_NAMES, computers } from '@/lib/series';
import { buildSeriesMaker } from '@/lib/makeSeries';

import { CheckboxMenuItem } from './CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from './utils';

import { tableAtom, tableDialogOpenAtom, dummyMenuAtom } from './store';
import type { CheckboxSet } from './store';

import {
  TableIcon,
  ChartColumnBigIcon,
} from "lucide-react";
import IslandIcon from '@/assets/taiwan-island.svg';

type SeriesEntry = {
  name: string,
  data: Array<number|null> | null,
};

type XAxis = {
  data: number[],
};

type ChartOptionPart = {
  series: SeriesEntry[],
  xAxis: Array<XAxis>,
};

const seriesToRows = ({ series, xAxis }: ChartOptionPart) => {
  const years: number[] = xAxis[0].data;
  const columns = series.filter(({ data }) => {
    return R.type(data) === 'Array';
  }).map(({ name, data }) => {
    return [name, ...(data as number[])];
  });

  return R.transpose([
    ['年度', ...years],
    ...columns,
  ]);
};

const clearNullDataSeries = R.mapObjIndexed((obj: Record<string, any>) => {
  return R.pipe(
    R.toPairs,
    R.filter(([, v]) => {
      return R.isNotNil(v.data);
    }),
    R.fromPairs,
  )(obj);
});

const citiesTrendToRows = (
  citiesSeries: Record<string, Record<string, any>>,
  years: number[],
  cities: string[]
) => {
  citiesSeries = clearNullDataSeries(citiesSeries);

  const minYear = Math.min(...years);

  const seriesNames = Object.values(
    Object.values(citiesSeries)[0]
  ).map(R.prop('name'));

  const header = R.flatten([
    '縣市',
    years.map(year => {
      return seriesNames.map(name => `${year} ${name}`);
    })
  ]);

  const rows = cities.map(city => {
    const series = citiesSeries[city];
    const yearCells = years.map(year => {
      const yearIdx = year - minYear;
      return R.pipe(
        R.values,
        R.map(
          R.path(['data', yearIdx])
        ),
      )(series);
    }).flat();

    return [
      cityLookup(city),
      ...(yearCells as number[]),
    ];
  });

  return [header, ...rows];
};

export default function ExportTable({ items, meta, chartRef }: {
  chartRef: React.RefObject<ReactEChartsCore | null>,
  items: CountryItem[],
  meta: {
    minYear: number,
    maxYear: number,
  },
}) {
  const setTable = useSetAtom(tableAtom);
  const setDialogOpened = useSetAtom(tableDialogOpenAtom);

  const makeSeries = useMemo(() => {
    return buildSeriesMaker(SERIES_NAMES, computers);
  }, []);

  const buildByChart = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const options = chart.getOption();
    const rows = seriesToRows(options as ChartOptionPart);
    setTable(rows);
    setDialogOpened(true);
  }, [chartRef, setTable, setDialogOpened]);

  const buildToCities = useCallback(() => {
    const form = document.querySelector<HTMLFormElement>('form#MainForm');
    if (!form) return;

    const formData = new FormData(form);
    const seriesString = formData.get('seriesSet')?.toString() || '';
    const seriesSet = JSON.parse(seriesString) as CheckboxSet;
    const cities = formData.getAll('cities').map(String);
    const years = formData.getAll('years').map(Number);
    // When select all items, treat as no filters
    const citiesFilter = cities.length === Object.keys(CITY_MAPPING).length ? [] : cities;
    const yearsFilter = years.length === meta.maxYear - meta.minYear + 1 ? [] : years;

    let citiesSeries = makeSeries(
      items,
      meta,
      seriesSet,
      { cities: citiesFilter, years: yearsFilter },
      { spreadToCities: Object.keys(CITY_MAPPING) }
    );

    citiesSeries = clearNullDataSeries(citiesSeries);
    const rows = citiesTrendToRows(citiesSeries, years, cities);
    setTable(rows);
    setDialogOpened(true);
  }, [setTable, setDialogOpened, makeSeries, items, meta]);

  const MenuItem = useMemo(() => CheckboxMenuItem(dummyMenuAtom, '_'), []);

  return (
    <Tooltip placement='top-end' offset={3} hoverProps={menuHoverProps}>
      <TooltipTrigger>
        <div className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <TableIcon size={20} tabIndex={0} />
          <span className='sr-only'>製作表格</span>
        </div>
      </TooltipTrigger>
      <TooltipContentMenu className={tooltipClass('text-sm')}>
        <div className={tooltipMenuCls()}>
          <div className='py-2 font-bold'>製作表格</div>
          <MenuItem Icon={ChartColumnBigIcon} name='toTable:chart' onClick={buildByChart}>根據目前圖表</MenuItem>
          <MenuItem Icon={IslandIcon} name='toTable:citiesTrend' onClick={buildToCities}>縣市逐年詳情</MenuItem>
        </div>
      </TooltipContentMenu>
    </Tooltip>
  );
}
