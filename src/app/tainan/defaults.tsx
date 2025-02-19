import * as R from 'ramda';
import { SERIES_NAMES } from '@/lib/tainan_series';

const revertedSeriesNames = R.invertObj(SERIES_NAMES);

export const fontFamily = "'Noto Mono TC', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'";

export const numberFormatter = (number: number) => Intl.NumberFormat("zh-TW").format(number);

function defaultTooltipFormatter(params: any) {
  const { seriesName, marker, value } = params;

  const vFormatter = R.path([revertedSeriesNames[seriesName], 'tooltip', 'valueFormatter'], defaultSeriesSettings) || numberFormatter;
  return [
    `<div style='display:flex;align-items:center'>`,
    marker,
    `<span>${seriesName}</span>`,
    '</div>',
    `<strong style='display:block;text-align:right'>${vFormatter(value)}</strong>`,
  ].join('')
};

export const tooltipOptions = {
  trigger: 'item',
  enterable: true,
  extraCssText: 'user-select: text',  // allow mouse selection
  textStyle: {
    fontFamily: fontFamily,
  },
  padding: [5, 10],
  confine: true,
  transitionDuration: 1.2,
  formatter: defaultTooltipFormatter,
  axisPointer: {
    type: 'cross',
    crossStyle: {
      color: '#999'
    }
  },
  // alwaysShowContent: true,
  // triggerOn: 'click',
};

const commonSeriesSetting = {
  type: 'line',
  connectNulls: true,
  symbolSize: 6,
  emphasis: {
    scale: 1.8,
  },
  label: {
    show: true,
    position: 'top',
    formatter: (params: {data: number}) => numberFormatter(params.data),
    fontFamily: fontFamily,
  },
  z: 14,
};


export const defaultSeriesSettings: Record<string, any> = {
  male: { ...commonSeriesSetting, itemStyle: { color: '#d08700', } },
  female: { ...commonSeriesSetting, itemStyle: { color: '#f6339a', } },
  total: { ...commonSeriesSetting, itemStyle: { color: '#6e11b0', } },
  fallback: commonSeriesSetting,
};

export const defaultOptions = {
  tooltip: tooltipOptions,
  legend: {
    show: true,
  },
  xAxis: [
    {
      type: 'category',
      name: '年',
      axisLabel: {
        fontFamily: fontFamily,
      },
      axisTick: {
        alignWithLabel: true,
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
  yAxis: [
    {
      type: 'value',
      name: '數量（千）',
      min: 0,
      axisLabel: {
        fontFamily: fontFamily,
        formatter: (value: number) => numberFormatter(value / 1000)
      },
      axisPointer: {
        show: false,
      }
    },
  ],
  grid: {
    top: 76,
  },

  series: Object.keys(SERIES_NAMES).map(name => {
    return defaultSeriesSettings[name] || defaultSeriesSettings.fallback
  }),
};
