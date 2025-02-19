import type { ResourceEntry } from './resource';

const tainanGovStrayLink = 'https://data.tainan.gov.tw/dataset/straydogs';

export const resources: Record<string, ResourceEntry> = {
  tainan_tnvr_report_108: { title: '108年臺南市各行政區執行流浪犬TNVR成果表', docUrl: tainanGovStrayLink, },
  tainan_tnvr_report_109: { title: '109年臺南市各行政區執行流浪犬TNVR成果表', docUrl: tainanGovStrayLink, },
  tainan_tnvr_report_110: { title: '110年臺南市各行政區執行流浪犬TNVR成果表', docUrl: tainanGovStrayLink, },
  tainan_tnvr_report_111: { title: '111年臺南市各行政區執行流浪犬TNVR成果表', docUrl: tainanGovStrayLink, },
  tainan_tnvr_report_112: { title: '112年臺南市各行政區執行流浪犬TNVR成果表', docUrl: tainanGovStrayLink, },
  combined: {
    title: '整理後的資料',
  },
} as const;
