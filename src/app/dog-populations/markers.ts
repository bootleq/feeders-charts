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

function createPattern(strokeStyle: string, style?: 'flip') {
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
  ctx.beginPath();

  if (style === 'flip') {
    ctx.lineWidth = 3;
    ctx.moveTo(0, 0);
    ctx.lineTo(10, 10);
  } else {
    ctx.lineWidth = 2;
    ctx.moveTo(0, 10);
    ctx.lineTo(10, 0);
  }

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

const sharedLabelSetting = {
  '動保法修法': { ...commonLabelSetting, distance: [5, -60], },
  '相信動物': { ...commonLabelSetting, color: '#0a0a0a', distance: [5, -60], position: ['22%', '3%'], },
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
          label: { color: 'rgba(166, 95, 0, 1)', },
          tooltip: { borderColor: 'rgba(166, 95, 0, 1)', },
          emphasis: {
            label: {
              ...commonLabelSetting,
              position: ['22%', '3%'],
            },
          },
        },
        { xAxis: '96' }
      ],
    ],
  },
  '動保法第 6 次修法': {
    type: 'Line',
    data: [{ name: '動保法第 6 次修法', xAxis: '97', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },
  '動保法第 7 次修法': {
    type: 'Line',
    data: [{ name: '動保法第 7 次修法', xAxis: '99', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },
  '動保法第 9 次修法': {
    type: 'Line',
    data: [{ name: '動保法第 9 次修法', xAxis: '104', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },
  '動保法第 11 次修法': {
    type: 'Line',
    data: [{ name: '動保法第 11 次修法', xAxis: '106', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },

  '新北餵養講習': {
    type: 'Area',
    data: [
      [
        {
          name: '新北餵養講習',
          xAxis: '104',
          itemStyle: {
            color: {
              image: createPattern('rgba(21, 93, 252, 0.6)'),
              repeat: 'repeat',
            },
          },
          label: { color: 'rgba(21, 93, 252, 0.6)', position: ['22%', '23%'], },
          tooltip: { borderColor: 'rgba(21, 93, 252, 0.6)', },
          emphasis: {
            label: {
              ...commonLabelSetting,
              position: ['22%', '23%'],
              color: 'rgba(21, 93, 252, 0.6)',
            },
          },
        },
        { xAxis: '108' },
      ],
    ],
  },
  '台南餵養講習': {
    type: 'Area',
    data: [
      [
        {
          name: '台南餵養講習',
          xAxis: '106',
          itemStyle: {
            color: {
              image: createPattern('rgba(166, 95, 0, 0.2)', 'flip'),
              repeat: 'repeat',
            },
          },
          label: { color: 'rgba(166, 95, 0, 1)', position: ['22%', '23%'], },
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: {
              ...commonLabelSetting,
              position: ['22%', '23%'],
              color: 'rgba(166, 95, 0, 1)',
            },
          },
        },
        { xAxis: '112' }
      ],
    ],
  },
  '台南零安樂': {
    type: 'Line',
    data: [{ name: '台南零安樂', xAxis: '104', lineStyle: { color: '#00a63e', }, }],
  },
  '台南工作犬': {
    type: 'Line',
    data: [{ name: '台南工作犬', xAxis: '104', lineStyle: { color: '#005f78', }, label: { ...commonLabelSetting, distance: [5, -50], }, }],
  },
  '統計方式大改': {
    type: 'Line',
    data: [{
      name: '統計方式大改',
      xAxis: '104',
      lineStyle: { color: '#a800b7', },
      label: { ...commonLabelSetting, distance: [15, -80], },
    }],
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
  '遊蕩犬管控精進策略': {
    type: 'Line',
    data: [{ name: '遊蕩犬管控精進策略', xAxis: '108', lineStyle: { color: '#3c6300', }, }],
  },
  '生態熱區': {
    type: 'Line',
    data: [{ name: '生態熱區', xAxis: '112', lineStyle: { color: '#ff6467', }, }],
  },
  '動保司成立': {
    type: 'Line',
    data: [{ name: '動保司成立', xAxis: '112', lineStyle: { color: '#90a1b9', }, label: { ...commonLabelSetting, distance: [15, -60] }, }],
  },
  '悲傷 326 記者會': {
    type: 'Line',
    data: [{ name: '悲傷 326 記者會', xAxis: '98', lineStyle: { color: '#5ea500', }, }],
  },
  '動團安樂死聲明': {
    type: 'Line',
    data: [{ name: '動團安樂死聲明', xAxis: '107', lineStyle: { color: '#314158', }, }],
  },
  '相信動物台北': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物台北',
          xAxis: '106',
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], },
          },
        },
        { xAxis: '108' }
      ],
    ],
  },
  '相信動物新北': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物新北',
          xAxis: '106',
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], },
          },
        },
        { xAxis: '109' }
      ],
    ],
  },
  '相信動物基隆': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物基隆',
          xAxis: '105',
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], },
          },
        },
        { xAxis: '106' }
      ],
    ],
  },
  '相信動物桃園': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物桃園',
          xAxis: '109',
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], },
          },
        },
        { xAxis: '113' }
      ],
    ],
  },
  '相信動物新竹': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物新竹',
          xAxis: '119',
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], },
          },
        },
        { xAxis: 'max' }
      ],
    ],
  },

  '民雄收容所運送事件': {
    type: 'Line',
    data: [{ name: '民雄收容所運送事件', xAxis: '105', lineStyle: { color: '#7f22fe', }, label: { ...commonLabelSetting, distance: [5, -80], }, }],
  },
  '簡稚澄事件': {
    type: 'Line',
    data: [{ name: '簡稚澄事件', xAxis: '105', lineStyle: { color: '#1447e6', }, }],
  },
  '壽山流浪狗倍增': {
    type: 'Line',
    data: [{ name: '壽山流浪狗倍增', xAxis: '106', lineStyle: { color: '#104e64', }, }],
  },
};

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
