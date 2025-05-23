import * as R from 'ramda';
import { useCallback, useMemo } from 'react';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { useSetAtom } from 'jotai';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import type { CountryItem } from '@/lib/model';
import type { MakeSeriesFn } from '@/lib/makeSeries';
import { parseChartInputs } from '@/lib/formData';

import { CheckboxMenuItem, dummyMenuAtom } from '@/components/CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls, roundNumber } from '@/lib/utils';
import type { TableRow, PrimitiveAtomWithInitial } from '@/components/types';

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
    const formatted = data?.map(v => roundNumber(2, v));
    return [name, ...(formatted as number[])];
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
  cities: string[],
  cityLookup: Record<string, string>,
) => {
  const minYear = Math.min(...years);

  const seriesNames = Object.values(
    Object.values(citiesSeries)[0]
  ).map(R.prop('name'));

  const header = R.flatten([
    '區域',
    years.map(year => {
      return seriesNames.map(name => `${year} ${name}`);
    })
  ]);

  const rows = [...cities, '_'].map(city => {
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

    const formattedCells = yearCells.map(cell => roundNumber(2, cell));

    return [
      city === '_' ? '總計' : cityLookup[city],
      ...formattedCells,
    ];
  });

  return [header, ...rows];
};

export default function ExportTable({ items, meta, makeSeriesFn, allCities, tableAtom, dialogOpenAtom, chartRef }: {
  chartRef: React.RefObject<ReactEChartsCore | null>,
  tableAtom: PrimitiveAtomWithInitial<TableRow[]>,
  dialogOpenAtom: PrimitiveAtomWithInitial<boolean>,
  items: CountryItem[],
  meta: {
    minYear: number,
    maxYear: number,
  },
  makeSeriesFn: MakeSeriesFn,
  allCities: string[] | Record<string, string>,
}) {
  const setTable = useSetAtom(tableAtom);
  const setDialogOpened = useSetAtom(dialogOpenAtom);

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

    const { seriesSet, cities, years } = parseChartInputs(form);
    const allCityNames = Array.isArray(allCities) ? allCities : Object.keys(allCities);

    if (!seriesSet) {
      throw new Error('Missing seriesSet input value.');
    }

    // When select all items, treat as no filters
    const citiesFilter = cities.length === allCityNames.length ? [] : cities;
    const yearsFilter = years.length === meta.maxYear - meta.minYear + 1 ? [] : years;

    let citiesSeries = makeSeriesFn(
      items,
      meta,
      seriesSet,
      { cities: citiesFilter, years: yearsFilter },
      { spreadToCities: allCityNames }
    );

    citiesSeries = clearNullDataSeries(citiesSeries);
    const rows = citiesTrendToRows(citiesSeries, years, cities, Array.isArray(allCities) ? {} : allCities);
    setTable(rows);
    setDialogOpened(true);
  }, [setTable, setDialogOpened, items, meta, makeSeriesFn, allCities]);

  const MenuItem = useMemo(() => CheckboxMenuItem(dummyMenuAtom, '_'), []);

  return (
    <Tooltip placement='top-end' offset={3} hoverProps={menuHoverProps} role='menu'>
      <TooltipTrigger>
        <div aria-label='製作表格' className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <TableIcon size={20} tabIndex={0} />
          <span className='sr-only'>製作表格</span>
        </div>
      </TooltipTrigger>
      <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
        <div className={tooltipMenuCls()}>
          <div className='py-2 font-bold'>製作表格</div>
          <MenuItem Icon={ChartColumnBigIcon} name='toTable:chart' onClick={buildByChart}>根據目前圖表</MenuItem>
          <MenuItem Icon={IslandIcon} name='toTable:citiesTrend' onClick={buildToCities}>區域逐年詳情</MenuItem>
        </div>
      </TooltipContentMenu>
    </Tooltip>
  );
}
