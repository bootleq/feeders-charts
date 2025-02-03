import * as R from 'ramda';
import { SERIES_NAMES } from '@/lib/series';

export const fontFamily = "'Noto Mono TC', 'ui-monospace', 'SFMono-Regular', 'Menlo', 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', 'monospace'";

export const numberFormatter = (number: number) => Intl.NumberFormat("zh-TW").format(number);

export const tooltipOptions = {
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

export const defaultIncludedSeries = [
  'roaming',
  'domestic',
  'human',
  'accept',
  'adopt',
  'kill',
  'die',
  'h_roam',
  'h_feed',
  'h_stop'
];

export const defaultSeriesSettings: Record<string, any> = {
  roaming: {
    type: 'bar',
    label: {
      show: true,
      position: 'top',
      formatter: (params: {data: number}) => numberFormatter(params.data),
      fontFamily: fontFamily,
    }
  },
  domestic: {
    type: 'line',
    connectNulls: true,
    label: {
      show: true,
      formatter: (params: {data: number}) => numberFormatter(params.data),
      fontFamily: fontFamily,
    },
  },
  fallback: {
    type: 'line',
    connectNulls: true
  },
};

export const defaultOptions = {
  tooltip: tooltipOptions,
  legend: {
    selected: Object.entries({
      roaming: true,
      domestic: false,
      human: false,
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

  series: defaultIncludedSeries.map(name => {
    return defaultSeriesSettings[name] || defaultSeriesSettings.fallback
  }),
};
