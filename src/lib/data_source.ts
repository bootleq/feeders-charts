import path from "path";

export const DATA_DIR = 'data';

const shelter_reports_table = [
  // NOTE: 107 年之後改用「動物收容統計表（詳表）」資料，這邊不採用
  // [113, '113年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/250117114614324698T87CD.xlsx'],
  // [112, '112年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2402191131342031173DCLA.xlsx'],
  // [111, '111年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2304270146565611513V5GC2JATE.xlsx'],
  // [110, '110年度全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/220315063424098101XYJV5.xls'],
  // [109,   '109年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/210513043948020470N5CB8.xls'],
  // [108,   '108年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200215115223422925LT732.ods'],
  [107,   '107年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/download/resources/A20190100004_exl.xlsx'],
  [106,   '106年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/download/resources/A20170700007_exl.xlsx'],
  [105,   '105年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/1912170324497935458R4FW.xlsx'],
  [104,   '104年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/191217032334835687JFPVG.xlsx'],
  [103,   '103年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/1912170322142536496NFME.xlsx'],
  [102,   '102年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/191219102621856549UFLL6.xlsx'],
  [101,   '101年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200102112119455694TXAHC.xlsx'],
  [100,   '100年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200102112001361784JQJW1.xlsx'],
  [ 99,    '99年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2001021116496582852GF9V.xlsx'],
  [ 98,    '98年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/200102111608251945H65FM.xlsx'],
  [ 97,    '97年全國公立動物收容所收容處理情形統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2001021115231581118SZFC.xlsx'],
] as const;

const shelter_reports = shelter_reports_table.reduce((acc, [year, title, url]) => {
  const name = `shelter_reports_${year}`;
  return {
    ...acc,
    ...{
      [name]: {
        title,
          docUrl: 'https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3',
          name,
          url,
          extname: path.extname(url).replace(/^\./, ''),
          normalizer: 'shelter_xlsx',
      },
    }};
}, {});

type Sources = Record<string, {
  title: string,
  docUrl: string,
  name: string,
  url?: string,
  extname: string,
  normalizer?: string,
}>;

// NOTE: Not all data were defined in `sources`, see README for full resource list.
export const sources: Sources = {
  population: {
    title: '年度犬貓統計表',
    docUrl: 'https://data.gov.tw/dataset/41771',
    name: 'population',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=ccezNvv4oYbO',
    extname: 'json',
    normalizer: 'population_jq',
  },
  human_population: {
    title: '戶籍登記人口數(人)',
    docUrl: 'https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx',
    name: 'human_population',
    extname: 'csv',
    // 中華民國統計資訊網 - 縣市重要統計指標查詢系統
    // 資料來源：內政部
  },
  ...shelter_reports,
}

export const unusedSources = {
  shelter: {
    title: '全國公立動物收容所收容處理情形統計表',
    docUrl: 'https://data.gov.tw/dataset/41236',
    name: 'shelter',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=DyplMIk3U1hf',
    extname: 'json',
    normalizer: 'jq',
  },
  shelter_details: {
    title: '全國公立動物收容所收容處理情形統計表(細項)',
    docUrl: 'https://data.gov.tw/dataset/73396',
    name: 'shelter_details',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=p9yPwrCs2OtC',
    extname: 'json',
    normalizer: 'jq',
  },
}

export function downloadPath(resourceName: string, extension: string) {
  return path.resolve(`${DATA_DIR}/download/${resourceName}.${extension}`);
}

export function buildingPath(resourceName: string, extension: string) {
  return path.resolve(`${DATA_DIR}/build/${resourceName}.${extension}`);
}
