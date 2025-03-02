export const jsonMetaReviver = (key: string, value: any) => {
  if (['sourceCheckedAt', 'builtAt'].includes(key) && typeof value === 'string') {
    return new Date(value);
  }

  return value;
};

const moaGovShelterLink = 'https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3';

export const shelter_reports_table = [
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

const shelter_reports_resources = shelter_reports_table.reduce((acc, [year, title]) => {
  const name = `shelter_reports_${year}`;
  return {
    ...acc,
    ...{
      [name]: {
        title,
        docUrl: moaGovShelterLink,
      },
    }};
}, {});

const moaGovEnforcementLink = 'https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab11';

export const lawEnforceTable = [
  [111, '111年第4季各縣市政府執行動物保護法案件情形', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/230131023314250066MCVLE.pdf'],
  [112, '112年第4季各縣市政府執行動物保護法案件情形', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/240124025231435389Z2YE9.pdf'],
  [113, '113年第4季各縣市政府執行動物保護法案件情形', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/2501220506217727348RKWP.pdf'],
];

const lawEnforceTableResources = lawEnforceTable.reduce((acc, [year, title]) => {
  const name = `law_enforce_${year}`;
  return {
    ...acc,
    ...{
      [name]: {
        title,
        docUrl: moaGovEnforcementLink,
      },
    }};
}, {});

const moaWorkforceLink = 'https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab4';

export const workForceTable = [
  [110, '110年4月各縣市動物保護業務人力統計表',  'https://animal.moa.gov.tw/public/upload/Know_ListFile/220511094438712076M2B9T.pdf'],
  [111, '111年10月各縣市動物保護業務人力統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/221229103502641266SBXNC.pdf'],
  [112, '112年10月各縣市動物保護業務人力統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/231208043131215611YEHKE.pdf'],
  [113, '113年10月各縣市動物保護業務人力統計表', 'https://animal.moa.gov.tw/public/upload/Know_ListFile/241129061152849406ELCCZ.pdf'],
];

export type ResourceEntry = {
  title: string,
  docUrl?: string
};

export const resources: Record<string, ResourceEntry> = {
  population: {
    title: '年度犬貓統計表',
    docUrl: 'https://data.gov.tw/dataset/41771',
  },
  human_population: {
    title: '戶籍登記人口數(人)',
    docUrl: 'https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx',
  },
  shelter_pet: {
    title: '動物收容統計表（詳表）（108 ~ 113 年）',
    docUrl: 'https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx',
  },
  populations_112: {
    title: '112年度全國家犬貓數量調查結果統計表',
    docUrl: 'https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000817?parentID=Tab0000143',
  },
  populations_113: {
    title: '113年各縣市遊蕩犬估計數調查結果',
    docUrl: 'https://animal.moa.gov.tw/Frontend/Know/Detail/LT00000864?parentID=Tab0000143',
  },
  countrywide: {
    title: '民國 96 年以前的資料',
    docUrl: 'https://docs.google.com/spreadsheets/d/1ajrN-ok3wnSI8X2-ntRRX9W8B2rXIz5ScnZWyUzt-G4/edit?gid=0#gid=0',
  },
  heat_map: {
    title: '遊蕩犬熱區圖 (2023 ~ 2024)',
    docUrl: 'https://www.pet.gov.tw/Wandering/HeatMapV1.aspx',
  },
  combined: {
    title: '整理後的資料',
  },
  ...shelter_reports_resources,
  ...lawEnforceTableResources,
  law_enforce: {
    title: '各縣市政府執行動物保護法案件情形（合併）',
    docUrl: moaGovEnforcementLink,
  },
  workforce: {
    title: '各縣市動物保護業務人力',
    docUrl: moaWorkforceLink,
  },
} as const;
