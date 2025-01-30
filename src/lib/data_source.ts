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
    title: '全國公立動物收容所收容處理情形統計表(細項)',
    docUrl: 'https://data.gov.tw/dataset/73396',
    name: 'shelter',
    url: 'https://data.moa.gov.tw/Service/OpenData/TransService.aspx?UnitId=p9yPwrCs2OtC',
  },
}

export function buildingPath(resourceName: string, extension: string) {
  return path.resolve(`${BUILD_DIR}/${resourceName}.${extension}`);
}
