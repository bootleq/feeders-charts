import * as R from 'ramda';
import type { CheckboxSet } from '@/components/types';
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
  formatter: '{b}',
};

export const defaultMarkerSeries = {
  type: 'line',
  name: '事件標記',
  yAxisIndex: 2,
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
    emphasis: {
      label: {
        color: 'black',
        backgroundColor: 'white',
      },
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
  '相信動物': { ...commonLabelSetting, color: '#0a0a0a', distance: [5, -10], position: ['10%', '66%'], },
};

type MARK = {
  type?: 'Line' | 'Area',
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
    data: [{ name: '動保法第 6 次修法', xAxis: '97', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },
  '動保法第 7 次修法': {
    data: [{ name: '動保法第 7 次修法', xAxis: '99', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },
  '動保法第 9 次修法': {
    data: [{ name: '動保法第 9 次修法', xAxis: '104', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },
  '動保法第 11 次修法': {
    data: [{ name: '動保法第 11 次修法', xAxis: '106', lineStyle: { color: '#8ec5ff', }, label: sharedLabelSetting['動保法修法'], }],
  },

  '新北餵養講習': {
    type: 'Area',
    data: [
      [
        {
          name: '新北餵養講習',
          xAxis: '104', yAxis: 80,
          itemStyle: {
            color: {
              image: createPattern('rgba(21, 93, 252, 0.6)'),
              repeat: 'repeat',
            },
          },
          label: { color: 'rgba(21, 93, 252, 0.6)', position: ['22%', '23%'], },
          tooltip: { borderColor: 'rgba(21, 93, 252, 0.6)', },
          emphasis: {
            label: { ...commonLabelSetting, position: ['22%', '23%'], },
          },
        },
        { xAxis: '108', yAxis: 60 },
      ],
    ],
  },
  '台南餵養講習': {
    type: 'Area',
    data: [
      [
        {
          name: '台南餵養講習',
          xAxis: '106', yAxis: 70,
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
            label: { ...commonLabelSetting, position: ['22%', '23%'], },
          },
        },
        { xAxis: '112', yAxis: 50 }
      ],
    ],
  },
  '台南零安樂': {
    data: [{ name: '台南零安樂', xAxis: '104', lineStyle: { color: '#00a63e', }, label: { ...commonLabelSetting, distance: [5, -50], }, }],
  },
  '台南工作犬': {
    data: [{ name: '台南工作犬', xAxis: '104', lineStyle: { color: '#005f78', }, label: { ...commonLabelSetting, distance: [5, -80], }, }],
  },
  '統計方式大改': {
    data: [{ name: '統計方式大改', xAxis: '104', lineStyle: { color: '#a800b7', }, label: { ...commonLabelSetting, distance: [15, -90], }, }],
  },
  '零撲殺公告': {
    data: [
      {
        name: '零撲殺公告',
        xAxis: '104',
        lineStyle: { color: '#e7000b', },
      },
    ],
  },
  '零撲殺施行': {
    data: [
      {
        name: '零撲殺施行',
        xAxis: '106',
        lineStyle: { color: '#d08700', },
      },
    ],
  },
  '遊蕩犬管控精進策略': {
    data: [{ name: '遊蕩犬管控精進策略', xAxis: '108', lineStyle: { color: '#3c6300', }, }],
  },
  '生態熱區': {
    data: [{ name: '生態熱區', xAxis: '112', lineStyle: { color: '#ff6467', }, }],
  },
  '動保司成立': {
    data: [{ name: '動保司成立', xAxis: '112', lineStyle: { color: '#90a1b9', }, label: { ...commonLabelSetting, distance: [15, -60] }, }],
  },
  '悲傷 326 記者會': {
    data: [{ name: '悲傷 326 記者會', xAxis: '98', lineStyle: { color: '#5ea500', }, }],
  },
  '動團安樂死聲明': {
    data: [{ name: '動團安樂死聲明', xAxis: '107', lineStyle: { color: '#ff637e', }, }],
  },
  '相信動物台北': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物台北',
          xAxis: '106', yAxis: 90,
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], color: 'darkblue', backgroundColor: 'gold' },
          },
        },
        { xAxis: '108', yAxis: 80 }
      ],
    ],
  },
  '相信動物新北': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物新北',
          xAxis: '106', yAxis: 80,
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], color: 'darkblue', backgroundColor: 'gold' },
          },
        },
        { xAxis: '109', yAxis: 70 }
      ],
    ],
  },
  '相信動物基隆': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物基隆',
          xAxis: '105', yAxis: 60,
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], color: 'darkblue', backgroundColor: 'gold' },
          },
        },
        { xAxis: '106', yAxis: 50 }
      ],
    ],
  },
  '相信動物桃園': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物桃園',
          xAxis: '109', yAxis: 70,
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], color: 'darkblue', backgroundColor: 'gold' },
          },
        },
        { xAxis: '113', yAxis: 60 }
      ],
    ],
  },
  '相信動物新竹': {
    type: 'Area',
    data: [
      [
        {
          name: '相信動物新竹',
          xAxis: '112', yAxis: 60,
          itemStyle: {
            color: { image: createPattern('rgba(255, 241, 102, 0.95)'), repeat: 'repeat', },
          },
          label: sharedLabelSetting['相信動物'],
          tooltip: {
            borderColor: 'rgba(166, 95, 0, 1)',
          },
          emphasis: {
            label: { ...sharedLabelSetting['相信動物'], color: 'darkblue', backgroundColor: 'gold' },
          },
        },
        { xAxis: 'max', yAxis: 50 }
      ],
    ],
  },

  '電影《十二夜》上映': {
    data: [{ name: '電影《十二夜》上映', xAxis: '102', lineStyle: { color: '#00b8db', }, label: { ...commonLabelSetting, distance: [5, -60], }, }],
  },
  '民雄收容所運送事件': {
    data: [{ name: '民雄收容所運送事件', xAxis: '105', lineStyle: { color: '#7f22fe', }, label: { ...commonLabelSetting, distance: [5, -80], }, }],
  },
  '簡稚澄事件': {
    data: [{ name: '簡稚澄事件', xAxis: '105', lineStyle: { color: '#1447e6', }, }],
  },
  '壽山流浪狗倍增': {
    data: [{ name: '壽山流浪狗倍增', xAxis: '106', lineStyle: { color: '#104e64', }, label: { ...commonLabelSetting, distance: [5, -90], }, }],
  },
};

export function makeMarkerSeries(
  markerSet: CheckboxSet,
) {
  const markers = Object.keys(R.pickBy(R.identity, markerSet));

  const config = markers.reduce((acc, name) => {
    const markCfg = MARKS[name];
    if (!markCfg) { return acc; }

    const { type = 'Line', data } = markCfg;
    return R.over(
      R.lensPath([`mark${type}`, 'data']),
      R.concat(data)
    )(acc);
  }, defaultMarkerSeries);

  return config;
}
