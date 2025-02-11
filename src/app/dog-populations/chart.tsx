"use client"

import * as R from 'ramda';
import { useCallback, useEffect, useRef } from 'react';

import { CITY_MAPPING } from '@/lib/model';
import type { CountryItem } from '@/lib/model';
import { makeYearRange } from '@/lib/utils';
import { makeSeries, SERIES_NAMES } from '@/lib/series';
import type { SeriesSet } from '@/lib/series';
import { makeMarkerSeries } from './markers';

import { CitiesInput } from './CitiesInput';
import { YearsInput } from './YearsInput';
import { SeriesControl } from './SeriesControl';
import { RepresentControl } from './RepresentControl';
import { MarkerControl } from './MarkerControl';

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

export function tooltipClass(className?: string) {
  return `rounded box-border w-max z-[1002] bg-slate-100 ${className || ''}`;
}
export function tooltipMenuCls(className?: string) {
  return [
    'flex flex-col divide-y w-full items-center justify-between',
    'rounded bg-gradient-to-br from-stone-50 to-slate-100 ring-2 ring-offset-1 ring-slate-300',
    className || '',
  ].join(' ');
}

export default function Chart({ items, meta }: {
  items: CountryItem[],
  meta: {
    minYear: number,
    maxYear: number,
  },
}) {
  const chartRef = useRef<ReactEChartsCore>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const formCacheRepresent = useRef('');

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
  }, []);

  const onApply = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

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

    let newOptions = {
      series: makeSeries(items, meta, seriesSet, { cities, years })
    };

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
  }, [items, meta, updateYearAxis, updateLegends, updateRepresent, updateMarker]);

  return (
    <div className='min-w-lg min-h-80 w-full'>
      <form ref={formRef} onSubmit={onApply} className='flex flex-wrap items-start justify-center gap-x-4 gap-y-3 my-1 mx-auto max-w-[96vw] text-sm'>
        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>縣市</legend>

          <CitiesInput formRef={formRef} />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>年度</legend>
          <YearsInput min={meta.minYear} max={meta.maxYear} formRef={formRef} />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>資料項目</legend>
          <SeriesControl />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>呈現</legend>
          <RepresentControl />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>事件標記</legend>
          <MarkerControl />
        </fieldset>

        <button type='submit' className='self-center p-3 pb-4 rounded hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <CornerDownLeftIcon size={20} className='pl-1 pb-1' />
          套用
        </button>
      </form>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={defaultOptions}
        lazyUpdate={true}
        style={{ height: '70vh', minHeight: '600px' }}
        className='mt-8 px-4 py-6 bg-white resize overflow-auto'
      />
    </div>
  );
}
