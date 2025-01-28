"use client"

import * as R from 'ramda';
import React from 'react';
import { useCallback, useEffect, useRef } from 'react';

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
    }
  };

  const series = items.reduce((acc, item) => {
    const {
      rpt_year: year,
      rpt_country_code: cityCode,
      calcu_dog_num: domestic,
      stray_dog_num: roaming,
      // els_note: notes,
    } = item;

    const yearIdx = yearRange.indexOf(year);

    if (yearIdx > -1 && (!validCities || validCities.includes(cityCode))) {
      if (roaming > 0) {
        acc = R.over(
          R.lensPath(['roaming', 'data', yearIdx]),
          R.pipe(Number, R.add(roaming)),
          acc
        );
      }
      if (domestic > 0) {
        acc = R.over(
          R.lensPath(['domestic', 'data', yearIdx]),
          R.pipe(Number, R.add(domestic)),
          acc
        );
      }
    }

    return acc;
  }, initialSeries);

  return [
    series.roaming,
    series.domestic,
  ];
}

function YearsInput({ min, max }: {
  min: number,
  max: number,
}) {
  const yearRange = makeYearRange(min, max);

  return (
    <div>
      {yearRange.map((year) => {
        return (
          <label key={year}>
            <input type='checkbox' name='years' value={year} />
            {year}
          </label>
        );
      })}
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
    <div className='min-w-lg min-h-80'>
      <form ref={formRef} onSubmit={onApply} className={`flex flex-wrap items-center gap-x-1 my-1 text-sm`}>
        <fieldset>
          <legend>縣市</legend>

          <div>
            <label>
              <input type='checkbox' name='cities' value='City000014' /> 台南市
            </label>
            <label>
              <input type='checkbox' name='cities' value='City000001' /> 基隆市
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>年度</legend>

          <YearsInput min={meta.minYear} max={meta.maxYear} />
        </fieldset>


        <button type='submit'>套用</button>
      </form>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={defaultOptions}
        notMerge={true}
        lazyUpdate={true}
      />
    </div>
  );
}
