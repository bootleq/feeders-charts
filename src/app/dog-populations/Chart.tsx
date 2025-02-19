"use client"

import * as R from 'ramda';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';

import { CITY_MAPPING } from '@/lib/model';
import type { CountryItem, ItemsMeta } from '@/lib/model';
import { makeYearRange } from '@/lib/utils';
import { SERIES_NAMES, computers } from '@/lib/series';
import { buildSeriesMaker } from '@/lib/makeSeries';
import type { SeriesSet } from '@/lib/makeSeries';
import { makeMarkerSeries } from './markers';

import { CitiesInput } from './CitiesInput';
import { YearsInput } from './YearsInput';
import { SeriesControl } from './SeriesControl';
import { RepresentControl } from './RepresentControl';
import { MarkerControl } from './MarkerControl';
import ExportTable from './ExportTable';
import ExportImage from './ExportImage';

import type { CheckboxSet } from './store';
import { defaultOptions, defaultSeriesSettings } from './defaults';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LegendPlainComponent,
  MarkLineComponent,
  MarkAreaComponent,
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
    MarkLineComponent,
    MarkAreaComponent,
    BarChart,
    LineChart,
    CanvasRenderer,
  ]
);

export default function Chart() {
  const [items, setItems] = useState<CountryItem[]>([]);
  const chartRef = useRef<ReactEChartsCore>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formCacheRepresent = useRef('');

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
    fetch('/combined.json')
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

  const updateLegends = useCallback((seriesSet: SeriesSet) => {
    return R.set(
      R.lensPath(['legend', 'data']),
      Object.keys(R.pickBy(R.identity, seriesSet)).map(name => SERIES_NAMES[name])
    );
  }, []);

  const updateRepresent = useCallback((checkboxSet: CheckboxSet) => {
    const { roaming_chart_bar, show_all_labels } = checkboxSet;
    return R.over(
      R.lensPath(['series']),
      R.map(
        R.pipe(
          R.when(
            R.propEq(SERIES_NAMES['roaming'], 'name'),
            R.mergeDeepRight(
              R.assoc(
                'type',
                roaming_chart_bar ? 'bar' : 'line',
                defaultSeriesSettings['roaming'] as object
              )
            )
          ),
          show_all_labels ? R.set(R.lensPath(['label', 'show']), true) : R.identity,
        )
      )
    );
  }, []);

  const updateMarker = useCallback((checkboxSet: CheckboxSet) => {
    return R.modify('series', R.append(makeMarkerSeries(checkboxSet)));
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

    const formData = new FormData(form);
    const seriesString = formData.get('seriesSet')?.toString() || '';
    const seriesSet = JSON.parse(seriesString) as SeriesSet;
    const representString = formData.get('representSet')?.toString() || '';
    const representSet = JSON.parse(representString) as CheckboxSet;
    const markerString = formData.get('markerSet')?.toString() || '';
    const markerSet = JSON.parse(markerString) as CheckboxSet;
    let cities = formData.getAll('cities').map(String);
    let years = formData.getAll('years').map(Number);

    if (!seriesSet || R.type(seriesSet) !== 'Object') {
      console.error('Unexpected seriesSet value');
      return;
    }

    if (!representSet || R.type(representSet) !== 'Object') {
      console.error('Unexpected representSet value');
      return;
    }

    if (!markerSet || R.type(markerSet) !== 'Object') {
      console.error('Unexpected markerSet value');
      return;
    }

    // When select all items, treat as no filters
    if (cities.length === Object.keys(CITY_MAPPING).length) {
      cities = [];
    }
    if (years.length === meta.maxYear - meta.minYear + 1) {
      years = [];
    }

    const newSeries = makeSeries(items, meta, seriesSet, { cities, years })['_'];
    const seriesArray = Object.keys(seriesSet).map(name => newSeries[name]);
    let newOptions = { series: seriesArray };

    const minYear = years.length ? years[0] : meta.minYear;
    const maxYear = years.length ? years[years.length - 1] : meta.maxYear;

    let needUpdateRepresent = false;
    if (formCacheRepresent.current !== representString) {
      needUpdateRepresent = true;
      formCacheRepresent.current = representString;
    }

    newOptions = R.pipe(
      updateYearAxis(minYear, maxYear),
      updateLegends(seriesSet),
      needUpdateRepresent ? updateRepresent(representSet) : R.identity,
      updateMarker(markerSet),
    )(newOptions);

    chart.setOption(newOptions);
  }, [items, meta, makeSeries, updateYearAxis, updateLegends, updateRepresent, updateMarker]);

  const itemsReady = R.isNotEmpty(items) && R.isNotNil(meta);

  return (
    <div className='min-w-lg min-h-80 w-full'>
      <form id='MainForm' ref={formRef} onSubmit={onApply} className='w-min flex flex-wrap items-start justify-start gap-x-4 gap-y-3 my-1 mx-auto max-w-[96vw] text-sm'>
        <div className='w-max max-w-[90vw] md:max-w-full flex flex-wrap gap-x-4'>
          <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
            <legend className='font-bold px-1.5'>縣市</legend>

            <CitiesInput formRef={formRef} />
          </fieldset>

          <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
            <legend className='font-bold px-1.5'>年度</legend>
            <YearsInput min={meta?.minYear || 88} max={meta?.maxYear || 113} formRef={formRef} />
          </fieldset>
        </div>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>資料項目</legend>
          <SeriesControl />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>事件標記</legend>
          <MarkerControl />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>呈現</legend>
          <RepresentControl />
        </fieldset>

        <button type='submit' className='self-center p-3 pl-8 xl:pl-14 pb-4 mx-auto xl:mr-0 rounded hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <CornerDownLeftIcon size={20} className='pl-1 pb-1' />
          套用
        </button>
      </form>

      <div className='flex items-center justify-end gap-x-1'>
        {itemsReady &&
          <>
            <ExportTable chartRef={chartRef} items={items} meta={meta} />
            <ExportImage chartRef={chartRef} />
          </>
        }
      </div>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={defaultOptions}
        lazyUpdate={true}
        style={{ height: '70vh', minHeight: '600px' }}
        className='mt-1 mb-2 px-3 py-4 bg-white resize overflow-hidden min-[1536px]:w-[clamp(1530px,70vw,2600px)]'
      />
    </div>
  );
}
