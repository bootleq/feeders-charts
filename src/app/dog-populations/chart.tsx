"use client"

import * as R from 'ramda';
import React from 'react';
import { useState, useCallback, useEffect, useRef } from 'react';

import { CITY_MAPPING } from '@/lib/model';
import type { CountryItem, ItemsMeta } from '@/lib/model';

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
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use(
  [
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    LegendPlainComponent,
    BarChart,
    LineChart,
    CanvasRenderer,
  ]
);

const fontFamily = "'Noto Mono TC', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'";

const numberFormatter = (number: number) => Intl.NumberFormat("zh-TW").format(number);

const tooltipOptions = {
  trigger: 'item',
  enterable: true,
  extraCssText: 'user-select: text',  // allow mouse selection
  textStyle: {
    fontFamily: fontFamily,
  },
  axisPointer: {
    type: 'cross',
    crossStyle: {
      color: '#999'
    }
  }
};

const defaultOptions = {
  tooltip: tooltipOptions,
  legend: {
    selected: {
      '遊蕩犬估計': true,
      '家犬估計': false,
      '收容': true,
      '認領': true,
    },
  },
  xAxis: [
    {
      type: 'category',
      axisLabel: {
        fontFamily: fontFamily,
      },
    },
    {
      // 西元年
      type: 'category',
      position: 'bottom',
      offset: 22,
      axisLine: { show: false },
      axisTick: { show: false },
      splitLine: { show: false },
      axisPointer: { show: false },
      axisLabel: {
        fontFamily,
        fontStyle: 'italic',
        color: '#aab',
      },
    },
  ],
  yAxis: {
    type: 'value',
    name: '數量（萬）',
    min: 0,
    axisLabel: {
      fontFamily: fontFamily,
      formatter: (value: number) => numberFormatter(value / 10000)
    },
    axisPointer: {
      show: false,
    }
  },

  series: [
    {
      name: '遊蕩犬估計',
      data: [],
      type: 'bar',
      label: {
        show: true,
        position: 'top',
        formatter: (params: {data: number}) => numberFormatter(params.data),
        fontFamily: fontFamily,
      },
    },
    {
      name: '家犬估計',
      type: 'line',
      connectNulls: true,
      label: {
        show: true,
        formatter: (params: {data: number}) => numberFormatter(params.data),
        fontFamily: fontFamily,
      },
    },
    { name: '收容', type: 'line', },
    { name: '認領', type: 'line', },
  ],
};

function makeYearRange(min: number, max: number) {
  return Array.from(
    {length: max - min + 1},
    (_, i) => min + i
  );
}

type SeriesFilters = {
  cities?: string[] | FormDataEntryValue[],
  years?: number[] | FormDataEntryValue[],
}

function makeSeries(
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
    s_in: {
      data: initialData,
      type: 'line',
    },
    adp: {
      data: initialData,
      type: 'line',
    },
  };

  const series = items.reduce((acc, item) => {
    const { year, city } = item;
    const yearIdx = yearRange.indexOf(year);

    if (yearIdx > -1 && (!validCities || validCities.includes(city))) {
      const qtyKeys: (keyof CountryItem)[] = ['roaming', 'domestic', 's_in', 'adp'];
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
    }

    return acc;
  }, initialSeries);

  return [
    series.roaming,
    series.domestic,
    series.s_in,
    series.adp,
  ];
}

function CitiesInput({ formRef }: {
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const textCls = [
    'pb-2 border-gray-400/0 border-b-4 text-slate-400',
    'peer-checked:text-slate-900 peer-checked:border-dotted peer-checked:border-stone-400',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  const onToggleAll = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const form = formRef.current;
    if (!form) return;

    const toChecked = e.currentTarget.checked;
    const boxes = form.querySelectorAll<HTMLInputElement>('input[name="cities"]');
    boxes.forEach(box => box.checked = toChecked);
  }, [formRef]);

  return (
    <div className='flex items-center pb-0.5'>
      <label className='cursor-pointer px-1 hover:bg-slate-200/75 rounded self-stretch flex items-center'>
        <input type='checkbox' defaultChecked={true} className='peer sr-only' onClick={onToggleAll} />
        <div className='writing-vertical tracking-[6px] pt-px pb-1.5 text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
          全選
        </div>
      </label>
      <ul className='flex flex-wrap items-center -translate-y-1'>
        {
          Object.entries(CITY_MAPPING).map(([code, name]) => (
            <li key={code} className='writing-vertical relative'>
              <label className='cursor-pointer px-1 py-2 block rounded transition hover:bg-amber-200 hover:-translate-y-1 hover:drop-shadow'>
                <input type='checkbox' name='cities' value={code} defaultChecked={true} className='peer mb-1 sr-only' />
                <span className={textCls}>
                  {name}
                </span>
              </label>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

function YearsInput({ min, max, formRef }: {
  min: number,
  max: number,
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const [handle, setHandle] = useState<number | null>();
  const yearRange = makeYearRange(min, max);
  const textCls = [
    'font-mono text-stone-400',
    'pb-px border-b [border-image-slice:1]',
    'peer-checked:text-slate-900 peer-checked:border-solid',
    'peer-checked:[border-image-source:linear-gradient(to_right,transparent_30%,#888_30%,#888_70%,transparent_70%)]',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  const onToggleAll = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const form = formRef.current;
    if (!form) return;

    setHandle(null);

    const toChecked = e.currentTarget.checked;
    const boxes = form.querySelectorAll<HTMLInputElement>('input[name="years"]');
    boxes.forEach(box => box.checked = toChecked);
  }, [formRef]);

  const onClickYear = useCallback((e: React.MouseEvent<HTMLLabelElement>) => {
    const label = e.currentTarget;
    const year = Number(label.dataset.year);
    const form = formRef.current;

    if (handle && e.shiftKey && form) {
      e.preventDefault();
      const [min, max] = [handle, year].toSorted(R.ascend(R.identity));
      const range = makeYearRange(min, max);
      const handleChecked = form.querySelector<HTMLInputElement>(`input[name="years"][value='${handle}']`)?.checked;
      const boxes = form.querySelectorAll<HTMLInputElement>('input[name="years"]');
      boxes.forEach(box => {
        if (range.includes(Number(box.value))) {
          box.checked = !!handleChecked;
        }
      })
    } else {
      setHandle(Number(year));
    }
  }, [handle, formRef]);

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center flex-wrap max-w-96'>
        <li>
          <label className='cursor-pointer px-1 py-2 hover:bg-slate-200/75 rounded self-stretch flex items-center'>
            <input type='checkbox' defaultChecked={true} className='peer sr-only' onClick={onToggleAll} />
            <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
              ALL
            </div>
          </label>
        </li>
        {yearRange.map((year) => {
          return (
            <li key={year} className={handle ? 'select-none' : ''}>
              <label className='cursor-pointer px-1 py-2 block rounded relative transition hover:bg-amber-200 hover:drop-shadow' data-year={year} onClick={onClickYear}>
                { year === handle &&
                  <div className='absolute left-1/2 translate-x-1/2 z-40 ring ring-blue-400'></div>
                }
                <input type='checkbox' name='years' value={year} defaultChecked={true} className='peer mb-1 sr-only' />
                <span className={textCls}>
                  {year}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
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

  useEffect(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (chart) {
      chart.setOption(
        updateYearAxis(meta.minYear, meta.maxYear)(
          { series: makeSeries(items, meta) }
        )
      );
    }
  }, [items, meta, updateYearAxis]);

  const onApply = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const formData = new FormData(form);
    const cities = formData.getAll('cities').map(String);
    const years = formData.getAll('years').map(Number);

    let newOptions = {
      series: makeSeries(items, meta, { cities, years })
    };

    const minYear = years.length ? years[0] : meta.minYear;
    const maxYear = years.length ? years[years.length - 1] : meta.maxYear;
    newOptions = updateYearAxis(minYear, maxYear)(newOptions);

    chart.setOption(newOptions);
  }, [items, meta, updateYearAxis]);

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

        <button type='submit' className='self-center p-3 pb-4 rounded hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>↵<br />套用</button>
      </form>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={defaultOptions}
        notMerge={true}
        lazyUpdate={true}
        style={{ height: '70vh', minHeight: '600px' }}
        className='mt-8 px-4 py-6 bg-white resize overflow-auto'
      />
    </div>
  );
}
