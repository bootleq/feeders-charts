import * as R from 'ramda';
import type { CheckboxSet } from './store';
import { MarkerTips } from './MarkerTips';
import styles from './page.module.scss';

const fontFamily = "'Noto Mono TC', var(--font-geist-mono), 'Monaco', 'Consolas', 'Liberation Mono', 'Courier New', monospace";

export const markerFormatter = (marker: string, name: string) => {
  const predefined = MarkerTips[name];
  if (predefined) return `<div class='${styles['marker-tip']}'>${predefined}</div>`;

  return [`<div style='display:flex;align-items:center'>`, name, '</div>'].join('')
}

function createPattern(strokeStyle: string) {
  if (typeof document === 'undefined') {
    return null;
  }

  const canvas = document.createElement('canvas');
  canvas.width = 10;
  canvas.height = 10;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    console.error("Can't create <canvas> and getContext.");
    return null;
  }

  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.lineTo(10, 0);
  ctx.stroke();

  return canvas;
}

const commonLabelSetting = {
  show: true,
  position: 'end',
  padding: 1,
  align: 'left',
  rotate: 30,
  fontSize: 16,
  fontFamily,
  color: 'inherit',
  backgroundColor: 'rgba(255,255,255,0.95)',
  formatter: '{b}',
};

export const defaultMarkerSeries = {
  type: 'line',
  name: '事件標記',
  data: null,
  markLine: {
    symbol: 'none',
    animationDuration: 200,
    lineStyle: {
      width: 2,
      type: 'dashed',
    },
    label: {
      ...commonLabelSetting,
      distance: [5, -20],
    },
    data: [],
  },
  markArea: {
    animationDuration: 200,
    label: {
      ...commonLabelSetting,
      position: ['22%', '3%'],
    },
    emphasis: {
      label: {
        ...commonLabelSetting,
        position: ['22%', '3%'],
      },
    },
    data: [],
  },
};

type MARK = {
  type: 'Line' | 'Area',
  data: object[],
};

const MARKS: Record<string, MARK> = {
  '垃圾不落地': {
    type: 'Area',
    data: [
      [
        {
          name: '垃圾不落地',
          xAxis: 'min',
          itemStyle: {
            color: {
              image: createPattern('rgba(166, 95, 0, 0.2)'),
              repeat: 'repeat',
            },
          },
          label: {
            color: 'rgba(166, 95, 0, 1)',
          },
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: {
              ...commonLabelSetting,
              position: ['22%', '3%'],
              color: 'rgba(166, 95, 0, 1)',
            },
          },
        },
        { xAxis: '96' }
      ],
    ],
  },
  '零撲殺公告': {
    type: 'Line',
    data: [
      {
        name: '零撲殺公告',
        xAxis: '104',
        lineStyle: { color: '#e7000b', },
      },
    ],
  },
  '零撲殺施行': {
    type: 'Line',
    data: [
      {
        name: '零撲殺施行',
        xAxis: '106',
        lineStyle: { color: '#d08700', },
      },
    ],
  },
}

export function makeMarkerSeries(
  markerSet: CheckboxSet,
) {
  const markers = Object.keys(R.pickBy(R.identity, markerSet));

  const config = markers.reduce((acc, name) => {
    const markCfg = MARKS[name];
    if (!markCfg) { return acc; }

    const { type, data } = markCfg;
    return R.over(
      R.lensPath([`mark${type}`, 'data']),
      R.concat(data)
    )(acc);
  }, defaultMarkerSeries);

  return config;
}
