"use client"

const latestRevDate = new Date('2025-07-07T16:44:44+08:00'); // 最後勘誤時間，需手動維護

import * as R from 'ramda';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';
import { formatDistanceToNow } from 'date-fns';
import { zhTW } from 'date-fns/locale';

import { CITY_MAPPING } from '@/lib/model';
import type { CountryItem, ItemsMeta } from '@/lib/model';
import { present, makeYearRange, BASE_PATH } from '@/lib/utils';
import { parseChartInputs } from '@/lib/formData';
import { SERIES_NAMES, computers } from '@/lib/series';
import { buildSeriesMaker } from '@/lib/makeSeries';
import type { CheckboxSet } from '@/components/types';
import { makeMarkerSeries } from './markers';

import { CitiesInput } from './CitiesInput';
import { YearsInput } from './YearsInput';
import { SeriesControl } from './SeriesControl';
import { RepresentControl } from './RepresentControl';
import { MarkerControl } from './MarkerControl';
import ExportTable from '@/components/ExportTable';
import ExportImage from '@/components/ExportImage';

import { defaultOptions, defaultSeriesSettings } from './defaults';
import { tableAtom, tableDialogOpenAtom } from './store';

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
  XIcon,
  CircleAlertIcon,
  MoveLeftIcon,
  CornerDownLeftIcon,
  LibraryBigIcon,
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

const notedRevDateAtom = atomWithStorage('feeders.chart.notedRevDate', new Date(2024, 1, 1));

export default function Chart() {
  const [items, setItems] = useState<CountryItem[]>([]);
  const [showAlert, setShowAlert] = useState(false);
  const [formError, setFormError] = useState<string|null>(null);
  const [revSince, setRevSince] = useState('');
  const [notedRevDate, setNotedRevDate] = useAtom(notedRevDateAtom);
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
    fetch(`${BASE_PATH}/combined.json`)
      .then((res) => res.json())
      .then(setItems);
  }, []);

  useEffect(() => {
    if (!notedRevDate || notedRevDate < latestRevDate) {
      const v = formatDistanceToNow(
        latestRevDate,
        {
          locale: zhTW,
          addSuffix: true,
        }
      ).replace('大約', '').trim();
      setRevSince(v);
    } else {
      setRevSince('');
    }
  }, [notedRevDate]);

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
          R.ifElse(
            R.propEq(SERIES_NAMES['roaming'], 'name'),
            R.mergeDeepRight(
              R.assoc(
                'type',
                roaming_chart_bar ? 'bar' : 'line',
                defaultSeriesSettings['roaming'] as object
              )
            ),
            R.assocPath(['label', 'show'], show_all_labels),
          ),
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

    const formParsed = parseChartInputs(form);
    const { representString, seriesSet, representSet, markerSet } = formParsed;
    let { cities, years } = formParsed;

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

    let newOptions;

    try {
      const newSeries = makeSeries(items, meta, seriesSet, { cities, years })['_'];
      const seriesArray = Object.keys(seriesSet).map(name => newSeries[name]);
      newOptions = { series: seriesArray };
    } catch (error) {
      console.error('makeSeries failed', error);
      setFormError(error instanceof Error ? error.message : '未知的錯誤');
      return;
    }

    const minYear = years.length ? years[0] : meta.minYear;
    const maxYear = years.length ? years[years.length - 1] : meta.maxYear;

    let needUpdateRepresent = false;
    if (representString && formCacheRepresent.current !== representString) {
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

  const onCloseAlert = () => {
    setShowAlert(false);
  };
  const onCloseRevNote = () => {
    setNotedRevDate(latestRevDate);
  };
  const onCloseFormError = () => {
    setFormError(null);
  };

  const itemsReady = R.isNotEmpty(items) && R.isNotNil(meta);

  return (
    <div className='min-w-lg min-h-80 w-full max-w-[100vw]'>
      <form id='MainForm' ref={formRef} onSubmit={onApply} className={`relative w-min flex flex-wrap items-start justify-start gap-x-4 gap-y-3 my-1 mx-auto max-w-full text-sm ${formError && 'cursor-not-allowed'}`}>
        <div className='w-max max-w-[90vw] md:max-w-[90vw] flex flex-wrap gap-x-4'>
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

        {formError &&
          <div className='absolute z-[1003] flex flex-wrap items-center justify-center w-full h-full'>
            <div className='flex items-center justify-center gap-3 w-full h-full md:w-3/5 md:h-4/5 max-h-[40vh] px-6 py-4 shadow-[10px_20px_20px_14px_rgba(0,0,0,0.5)] text-lg bg-pink-100/70 backdrop-blur-sm ring ring-3 ring-offset-1 rounded cursor-auto'>
              <CircleAlertIcon size={32} className='flex-shrink-0' />
              <p className='leading-loose'>
                發生未預期的錯誤，敬請見諒。
                <span className='text-slate-500'>（錯誤訊息會顯示在主控台）</span>
                <br />
                您可前往 Issues 回報問題：<Link href='https://github.com/bootleq/feeders-charts' className='underline' target='_blank'>GitHub 專案網址</Link>
              </p>

              <button className='btn p-px ml-auto rounded-full hover:scale-125 hover:drop-shadow' aria-label='關閉' onClick={onCloseFormError}>
                <XIcon className='stroke-slate-700 stroke-2' height={22} />
              </button>
            </div>
          </div>
        }
      </form>

      {showAlert &&
        <div className='flex items-center gap-x-2 w-fit bg-red-200 rounded-lg p-2 mx-2 md:mx-auto'>
          <CircleAlertIcon size={22} className='flex-shrink-0' />
          <p>
            由於
            <Link href='https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx' className='underline' title='全國動物收容管理系統'>動物收容統計表（詳表）</Link>
            在 2024 之前的「可收容量」和「在養佔比」資料來源錯誤，以致這裡的「可收容量」「在養數」「收容壓力」也連帶錯誤（比實際低），近期會進行修正。
          </p>
          <button className='btn p-px ml-auto rounded-full hover:scale-125 hover:drop-shadow' aria-label='關閉' onClick={onCloseAlert}>
            <XIcon className='stroke-slate-700 stroke-2' height={22} />
          </button>
        </div>
      }

      <div role='menu' aria-label='圖表工具列' className='flex items-center justify-end gap-x-1'>

        <div className='flex items-center mr-auto'>
          <Tooltip offset={3}>
            <TooltipTrigger>
              <Link href='/dog-populations/resource/#revisions' className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
                <LibraryBigIcon size={20} tabIndex={0} />
                <span className='sr-only'>修訂記錄</span>
              </Link>
            </TooltipTrigger>
            <TooltipContent className='font-mixed px-2 py-1 rounded box-border text-sm leading-relaxed w-fit max-w-[55vw] sm:max-w-[20vw] z-[1002] bg-neutral-50 drop-shadow-xl'>
              前往「資料狀態」頁面，檢視較重要的變更記錄
            </TooltipContent>
          </Tooltip>

          {present(revSince) &&
            <div className='mr-auto flex items-center gap-x-1 w-fit bg-red-200 rounded-lg py-1 px-2'>
              <MoveLeftIcon size={20} className='flex-shrink-0 hidden sm:block' />
              <p className='font-bold text-balance text-center text-sm sm:text-base'>
                資料勘誤於：{revSince}
              </p>
              <button className='flex items-center text-sm btn bg-neutral-50 p-px px-1.5 sm:text-nowrap ml-1 sm:ml-3 rounded-lg drop-shadow hover:bg-white hover:drop-shadow-lg' aria-label='不要再顯示' onClick={onCloseRevNote}>
                不再顯示
              </button>
            </div>
          }
        </div>

        {itemsReady &&
          <>
            <ExportTable
              chartRef={chartRef}
              items={items}
              meta={meta}
              makeSeriesFn={makeSeries}
              allCities={CITY_MAPPING}
              tableAtom={tableAtom}
              dialogOpenAtom={tableDialogOpenAtom}
            />
            <ExportImage chartRef={chartRef} />
          </>
        }
      </div>

      <div id='MainChart' aria-label='主圖表' className='mt-1 mb-2 px-3 py-4 bg-white resize overflow-hidden min-[1536px]:w-[clamp(1530px,70vw,2600px)]'>
        <ReactEChartsCore
          ref={chartRef}
          echarts={echarts}
          option={defaultOptions}
          lazyUpdate={true}
          style={{ height: '70vh', minHeight: '600px' }}
        />
      </div>
    </div>
  );
}
