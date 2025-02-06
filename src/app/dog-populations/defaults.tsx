import * as R from 'ramda';
import { SERIES_NAMES } from '@/lib/series';

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
};

export const defaultSeriesSettings: Record<string, any> = {
  roaming: {
    type: 'bar',
    label: {
      show: true,
      position: 'top',
      formatter: (params: {data: number}) => numberFormatter(params.data),
      fontFamily: fontFamily,
    },
    itemStyle: { color: '#5470c6' },
  },
  domestic: {
    ...commonSeriesSetting,
    label: {
      show: true,
      formatter: (params: {data: number}) => numberFormatter(params.data),
      fontFamily: fontFamily,
    },
    itemStyle: { color: '#445577' },
  },
  human: {
    ...commonSeriesSetting,
    itemStyle: { color: '#73c0de' },
    tooltip: {
      ...tooltipOptions,
      textStyle: {
        fontFamily: 'var(--font-geist-mono)',
      },
      valueFormatter: (num: number) => {
        const wan = numberFormatter(Math.floor(num / 10000));
        const remainder = numberFormatter(num % 10000);
        return [
          "<div style='font-weight:normal; display:flex; flex-direction:column; align-items:center; justify-content:center; margin-top:2px'>",
          '<div>',
          wan !== '0' ? `${wan}<span style='font-family:var(--font-geist-sans);opacity:0.7;'> 萬</span>` : '',
          '</div>',
          remainder,
          '</div>',
        ].join('');
      },
    },
  },
  human100: {
    ...commonSeriesSetting,
    yAxisIndex: 1,
    symbol: 'rect',
    symbolSize: 8,
    lineStyle: {
      type: 'dotted',
    },
    itemStyle: { color: '#fc8452' },
    tooltip: {
      ...tooltipOptions,
      textStyle: {
        fontFamily: 'var(--font-geist-mono)',
      },
      valueFormatter: (number: number) => {
        return `${number.toFixed(2)}<span style='font-family:var(--font-geist-sans)'> 隻</span>`
      },
    },
  },
  accept: { ...commonSeriesSetting, itemStyle: { color: '#91cc75', } },
  adopt: { ...commonSeriesSetting, itemStyle: { color: '#ea7ccc', } },
  kill: { ...commonSeriesSetting, itemStyle: { color: '#ee6666', } },
  die: { ...commonSeriesSetting, itemStyle: { color: '#994444', } },
  h_visit: { ...commonSeriesSetting, itemStyle: { color: '#3ba272', } },
  h_feed: { ...commonSeriesSetting, itemStyle: { color: '#883333', } },
  h_stop: { ...commonSeriesSetting, itemStyle: { color: '#3ba272', } },
  fallback: commonSeriesSetting,
};

export const defaultOptions = {
  tooltip: tooltipOptions,
  legend: {
    selected: Object.entries({
      roaming: true,
      domestic: false,
      human: false,
      human100: true,
      accept: true,
      adopt: true,
      kill: true,
      die: true,
      h_roam: true,
      h_feed: true,
      h_stop: true,
    }).reduce((acc, [k, v]) => {
      return R.assoc(SERIES_NAMES[k], v, acc);
    }, {}),
  },
  xAxis: [
    {
      type: 'category',
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
    {
      type: 'value',
      min: 0,
      boundaryGap: [0, '5%'],
      axisLabel: {
        show: false,
      },
      axisPointer: {
        show: false,
      },
      splitLine: {
        show: false,
      },
    },
  ],

  series: Object.keys(SERIES_NAMES).map(name => {
    return defaultSeriesSettings[name] || defaultSeriesSettings.fallback
  }),
};
