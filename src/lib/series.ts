import * as R from 'ramda';
import { offenceTypeKeys, workforceTypeMapping } from '@/lib/model';
import type { SeriesData, Computer } from '@/lib/makeSeries';

// Make name mappings like:
// {
//  "照護:0": "照護",
//  "照護:1": "照護（罰",
// }
const enforementSeriesNames = R.reduce(
  (acc: Record<string, any>, key: string) => {
    const [name, type] = key.split(':', 2);
    return R.assoc(key, `${name}${type === '1' ? '（罰' : ''}`, acc);
  }, {}
)(offenceTypeKeys);

const workforceSeriesNames = R.pipe(
  R.toPairs,
  R.reduce(
    (acc: Record<string, string>, pair) => {
      const [key, name] = pair;
      return {
        ...acc,
        [`ft_${String(key)}`]: `${name}`,
        [`pt_${String(key)}`]: `${name}（兼職）`,
      };
    }, {}
  )
)(workforceTypeMapping);

export const SERIES_NAMES: Record<string, string> = {
  roaming: '遊蕩犬估計',
  domestic: '家犬',
  human: '人口',
  human100: '每百人',
  infant: '幼齡',
  seized: '沒入',
  accept: '收容',
  adopt: '認領',
  kill: '人道處理',
  die: '所內死亡',
  return: '回置',
  miss: '逃脫等',
  room: '可收容量',
  occupy: '在養數',
  occupy100: '收容壓力',
  h_visit: '熱區家訪',
  h_roam: '熱區無主犬',
  h_feed: '熱區餵食',
  h_stop: '疏導餵食',
  // _marker: '事件標記', // this will be added in addition to normal data series process

  ...enforementSeriesNames,
  ...workforceSeriesNames,
} as const;

export const computers: Record<string, Computer> = {
  human100: {
    depends: ['roaming', 'human'],
    fn: (roaming: SeriesData, human: SeriesData) => {
      return roaming.map((roamQty, idx) => {
        const humanQty = human[idx];
        if (typeof roamQty === 'number' && typeof humanQty === 'number') {
          return roamQty / humanQty * 100;
        }
        return null;
      });
    },
  },
  occupy100: {
    depends: ['room', 'occupy'],
    fn: (room: SeriesData, occupy: SeriesData) => {
      return room.map((roomQty, idx) => {
        const occupyQty = occupy[idx];
        if (typeof occupyQty  === 'number' && typeof roomQty === 'number') {
          return occupyQty  / roomQty * 100;
        }
        return null;
      });
    },
  },
};
