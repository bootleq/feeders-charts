"use client"

import * as R from 'ramda';
import { useState, useCallback, useMemo, useEffect, useRef } from 'react';

import { TAINAN_DISTRICTS } from '@/lib/model';
import type { CountryItem, ItemsMeta } from '@/lib/model';
import { makeYearRange } from '@/lib/utils';
import { parseChartInputs } from '@/lib/formData';
import { SERIES_NAMES, computers } from '@/lib/tainan_series';
import { buildSeriesMaker } from '@/lib/makeSeries';
import type { CheckboxSet } from '@/components/types';

import { DistrictsInput } from './DistrictsInput';
import { YearsInput } from './YearsInput';
import { SeriesControl } from './SeriesControl';
import ExportTable from '@/components/ExportTable';
import ExportImage from '@/components/ExportImage';

import { defaultOptions } from './defaults';
import { tableAtom, tableDialogOpenAtom } from './store';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LegendPlainComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import {
  CornerDownLeftIcon,
} from "lucide-react";

echarts.use(
  [
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    LegendPlainComponent,
    LineChart,
    CanvasRenderer,
  ]
);

export default function Chart() {
  const [items, setItems] = useState<CountryItem[]>([]);
  const chartRef = useRef<ReactEChartsCore>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const years = useMemo(() => {
    return R.pipe(
      R.pluck('year'),
      R.uniq,
      R.filter(R.isNotNil),
      R.map(Number),
    )(items);
  }, [items]);

  const meta: ItemsMeta|null = useMemo(() => {
    if (!years) {
      return null;
    }
    return {
      minYear: Math.min(...years),
      maxYear: Math.max(...years),
    }
  }, [years]);

  useEffect(() => {
    fetch('/tainan.json')
      .then((res) => res.json())
      .then(setItems);
  }, []);

  const updateYearAxis = useCallback((minYear: number, maxYear: number) => {
    const yearsRange = makeYearRange(minYear, maxYear);

    return R.pipe(
      R.set(
        R.lensPath(['xAxis', 0, 'data']),
        yearsRange
      ),
      R.set(
        R.lensPath(['xAxis', 1, 'data']),
        yearsRange.map(y => y + 1911)
      ),
    );
  }, []);

  const updateLegends = useCallback((seriesSet: CheckboxSet) => {
    console.log('???', seriesSet);
    return R.set(
      R.lensPath(['legend', 'data']),
      Object.keys(R.pickBy(R.identity, seriesSet)).map(name => SERIES_NAMES[name])
    );
  }, []);

  useEffect(() => {
    formRef.current?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
  }, [meta, years]);

  const makeSeries = useMemo(() => {
    return buildSeriesMaker(SERIES_NAMES, computers);
  }, []);

  const onApply = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!meta) return;

    const form = formRef.current;
    if (!form) return;

    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const { seriesSet, cities, years } = parseChartInputs(form);
    if (!seriesSet || R.type(seriesSet) !== 'Object') {
      console.error('Unexpected seriesSet value');
      return;
    }

    const newSeries = makeSeries(items, meta, seriesSet, { cities, years })['_'];
    const seriesArray = Object.keys(seriesSet).map(name => newSeries[name]);
    let newOptions = { series: seriesArray };

    const minYear = years.length ? years[0] : meta.minYear;
    const maxYear = years.length ? years[years.length - 1] : meta.maxYear;

    newOptions = R.pipe(
      updateYearAxis(minYear, maxYear),
      updateLegends(seriesSet),
    )(newOptions);

    chart.setOption(newOptions);
  }, [items, meta, makeSeries, updateYearAxis, updateLegends]);

  const itemsReady = R.isNotEmpty(items) && R.isNotNil(meta);

  return (
    <div className='min-w-lg min-h-80 w-full max-w-[100vw]'>
      <form id='MainForm' ref={formRef} onSubmit={onApply} className='flex flex-wrap items-start justify-evenly gap-x-4 gap-y-3 my-1 mx-auto max-w-[96vw] text-sm'>
        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>行政區</legend>

          <DistrictsInput formRef={formRef} />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>年度</legend>
          <YearsInput min={meta?.minYear || 108} max={meta?.maxYear || 112} formRef={formRef} />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>資料項目</legend>
          <SeriesControl />
        </fieldset>

        <button type='submit' className='self-center p-3 pl-8 xl:pl-14 pb-4 xl:mr-0 rounded hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <CornerDownLeftIcon size={20} className='pl-1 pb-1' />
          套用
        </button>
      </form>

      <div className='flex items-center justify-end gap-x-1'>
        {itemsReady &&
          <>
            <ExportTable
              chartRef={chartRef}
              items={items}
              meta={meta}
              makeSeriesFn={makeSeries}
              allCities={TAINAN_DISTRICTS}
              tableAtom={tableAtom}
              dialogOpenAtom={tableDialogOpenAtom}
            />
            <ExportImage chartRef={chartRef} />
          </>
        }
      </div>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={defaultOptions}
        lazyUpdate={true}
        style={{ height: '66vh', minHeight: '600px' }}
        className='mt-1 mb-2 px-3 py-4 bg-white resize overflow-hidden min-[1536px]:w-[clamp(1530px,70vw,2600px)]'
      />
    </div>
  );
}
