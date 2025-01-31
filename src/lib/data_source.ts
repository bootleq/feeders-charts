import path from "path";

export const BUILD_DIR = 'scripts/build';

export const sources = {
  population: {
    title: '年度犬貓統計表',
    docUrl: 'https://data.gov.tw/dataset/41771',
    name: 'population',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=ccezNvv4oYbO',
  },
  shelter: {
    title: '全國公立動物收容所收容處理情形統計表',
    docUrl: 'https://data.gov.tw/dataset/41236',
    name: 'shelter',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=DyplMIk3U1hf',
  },
  human_population: {
    title: '戶籍登記人口數(人)',
    docUrl: 'https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx',
    name: 'human_population',
    // 中華民國統計資訊網 - 縣市重要統計指標查詢系統
    // 資料來源：內政部
  },
}

export const unusedSources = {
  shelter_details: {
    title: '全國公立動物收容所收容處理情形統計表(細項)',
    docUrl: 'https://data.gov.tw/dataset/73396',
    name: 'shelter_details',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=p9yPwrCs2OtC',
  },
}

export function buildingPath(resourceName: string, extension: string) {
  return path.resolve(`${BUILD_DIR}/${resourceName}.${extension}`);
}
