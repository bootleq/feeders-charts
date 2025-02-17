import * as R from 'ramda';
import fsp from 'node:fs/promises';
import fetch from 'node-fetch';
import https from 'https';
import chalk from 'chalk';
import { cityLookup } from '@/lib/model';
import { buildingPath, checkUpdateHash, writeSourceTime } from '@/lib/data_source';
import { testSamplesExist } from './utils';

const basename = 'shelter_pet';

const API_URL = 'https://www.pet.gov.tw/handler/AnimalsCore.ashx';

const unsafeAgent = new https.Agent({
  rejectUnauthorized: false,
});

const REPORT_FIELDS = {
  // There is no API doc available, we wrote this by observation
  3: { // 詳表，110年2月前舊版
    cityName: 'city',      // 縣市別
    MaxAmls:  'room',      // (犬) 可留容最大值
    nI1:      null,        // 入所：政府捕捉
    nI2:      null,        // 入所：拾獲送交
    nI3:      null,        // 入所：不擬續養
    nI4:      null,        // 入所：動物救援
    nI5:      null,        // 入所：依法沒入
    nI6:      null,        // 入所：其他
    nITotal:  'accept',    // 合計入所數
    nO1:      'adopt[1]',  // 出所：認領
    nO2:      'adopt[2]',  // 出所：認養：個人認養
    nO3:      'adopt[3]',  // 出所：認養：民間狗場
    nO4:      'adopt[4]',  // 出所：認養：動保團體
    nO5:      'kill[1]',   // 出所：依法人道處理：第 12 條第 1 項第 3 款
    nO6:      'kill[2]',   // 出所：依法人道處理：第 12 條第 1 項第 5 款
    nO7:      'kill[3]',   // 出所：依法人道處理：第 12 條第 1 項第 7 款
    nO8:      'kill[4]',   // 出所：依法人道處理：其他授權
    nO9:      'die[1]',    // 出所：所內死亡：疾病死亡
    nO10:     'die[2]',    // 出所：所內死亡：生理耗弱死亡
    nO11:     'return',    // 飭回原地
    nO12:     'miss[1]',   // 逃脫
    nO13:     'miss[2]',   // 其他
    nOTotal:  null,        // 合計出所數
    A2:       null,        // 在養數：收容所
    AT2:      null,        // 在養數：委託代養
    nTotal:   null,        // 在養數：小計（以上 3 項為年末的值）
    per1:     'occupy[1]', // (犬) 在養占可留容比例
    per2:     null,        // (貓) 在養占可留容比例
  },

  4: { // 詳表，110年3月後新版
    cityName: 'city',      // 縣市別
    MaxAmls:  'room',      // (犬) 可留容最大值
    G1:       null,        // 入所：政府處理案件：民眾通報
    G2:       null,        // 入所：政府處理案件：傷、病、老、弱、殘疾
    G3:       null,        // 入所：政府處理案件：幼齡無自理能力
    G4:       null,        // 入所：政府處理案件：協助脫困(無生理狀況)
    G5:       null,        // 入所：政府處理案件：其他
    F1:       null,        // 入所：拾獲送交：動物救援
    F2:       null,        // 入所：拾獲送交：幼齡無自理能力
    F3:       null,        // 入所：拾獲送交：健全
    F4:       null,        // 入所：拾獲送交：其他
    N1:       null,        // 入所：不擬續養：生理因素
    N2:       null,        // 入所：不擬續養：行為問題
    N3:       null,        // 入所：不擬續養：個人因素
    SP1:      'accept[1]', // 入所：入所絕育：公
    SP2:      'accept[2]', // 入所：入所絕育：母
    E:        null,        // 入所：依法沒入
    Ot:       null,        // 入所：其他
    TotalIn:  'accept[3]', // 入所：合計入所數
    O1:       'adopt[1]',  // 出所：認領
    O21:      'adopt[2]',  // 出所：認養：個人認養
    O22:      'adopt[3]',  // 出所：認養：大量飼養戶
    O23:      'adopt[4]',  // 出所：認養：動保團體
    O24:      'adopt[5]',  // 出所：認養：其他
    L1:       'kill[1]',   // 出所：依法人道處理：第 12 條第 1 項第 3 款
    L2:       'kill[2]',   // 出所：依法人道處理：第 12 條第 1 項第 5 款
    L3:       'kill[3]',   // 出所：依法人道處理：第 12 條第 1 項第 7 款
    L4:       'kill[4]',   // 出所：依法人道處理：其他授權
    D1:       'die[1]',    // 出所：所內死亡：入所已瀕危
    D2:       'die[2]',    // 出所：所內死亡：疾病死亡
    D3:       'die[3]',    // 出所：所內死亡：生理耗弱死亡
    SPO1:     'return[1]', // 出所：絕育後回置：公
    SPO2:     'return[2]', // 出所：絕育後回置：母
    O32:      'miss[1]',   // 出所：逃脫
    O33:      'miss[2]',   // 出所：其他
    TotalOut: null,        // 合計出所數
    A2:       null,        // 在養數：收容所
    AT2:      null,        // 在養數：委託代養
    TotalA2:  null,        // 在養數：小計（以上 3 項為年末的值）
    APD:      'occupy[1]', // (犬) 在養占可留容比例
    APC:      null,        // (貓) 在養占可留容比例
  },
};

async function request(params) {
  let result;

  const fetchOptions = {
    agent: unsafeAgent,
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: `Method=AnimalsFront&Param=${JSON.stringify(params)}`,
    method: 'POST',
  };

  const response = await fetch(API_URL, fetchOptions);

  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);

  try {
    result = await response.json();
  } catch (error) {
    console.error(`Fail parsing response：`, error.message);
    throw error;
  }

  if (result['Success']) {
    return JSON.parse(result['Message']);
  } else {
    console.error('Request failed, message:', result['ErrorMessage']);
    throw new Error('Request failed')
  }

  return result;
}

function translateFields(reportItems, year, reportType) {
  return reportItems.reduce((acc, item) => {
    let occupyRatio;
    const obj = {};
    const rocYear = year - 1911;

    Object.entries(item).forEach(([key, value]) => {
      const field = REPORT_FIELDS[reportType][key];
      if (field && value) {
        if (field === 'city') {
          try {
            const cityCode = cityLookup(value.replace(/^\d+\.\s*/, ''));
            if (cityCode) {
              obj.city = cityCode;
            }
          } catch {
            // no matching city, skip
          }
        } else if (/\[.*]$/.test(field)) { // fields like `kill[1]` require special handling
          const prefix = field.split('[', 2)[0];

          if (R.type(value) === 'Number') {
            if (!R.has(prefix, obj)) {
              obj[prefix] = 0;
            }

            if (prefix === 'accept') {
              // Per definition, accept (收容隻數) is 合計入所數 excluding 入所絕育數
              obj[prefix] = field === 'accept[3]' ?
                obj[prefix] + value :
                obj[prefix] - value;
            } else {
              obj[prefix] += value;
            }
          } else {
            if (prefix === 'occupy') {
              occupyRatio = Number(value.replace('%', ''));
            } else {
              throw new Error(`Unexpected String value for field ${field}`);
            }
          }
        } else {
          obj[field] = value;
        }
      }
    });

    // 2nd pass
    if (obj['room'] && occupyRatio) {
      obj['occupy'] = obj['room'] * occupyRatio / 100;
    }

    if (R.has('city', obj) && R.isNotEmpty(obj)) {
      acc.push({ ...obj, year: rocYear });
    }

    return acc;
  }, []);
}

function validate(data) {
  let valid = true;

  const samples = [
    { year: 107, city: 'City000004', room: 652, accept: 3725, adopt: 2233, kill: 26, die: 120, return:  884, miss: 288, occupy: 534.64 }, // 桃園市 2018，犬在養率 82% (652 * .82 = 534.64)
    { year: 108, city: 'City000016', room: 580, accept:  883, adopt:  453, kill:  6, die:   6, return:  426, occupy: 127.6 },             // 屏東縣 2019，犬在養率 22% (580 * .22 = 127.6)
    { year: 109, city: 'City000009', room: 800, accept: 7610, adopt: 3417, kill: 25, die: 351, return: 3921, miss: 38, occupy: 344 },     // 臺中市 2020，犬在養率 43% (800 * .43 = 344)

    // { year: 110, city: 'City000015', room: 900, accept:  486, adopt:  247, die:  25, return:  60, miss: 114, occupy: 1008 },  // 舊版）高雄市 2011，犬在養率 112% (900 * 1.12 = 1008)
    // { year: 110, city: 'City000015', room: 900, accept: 3103, adopt: 1813, die: 129, return: 825, miss: 591, occupy: 747 },   // 新版）高雄市 2011，犬在養率  83% (900 *  .83 =  747)
    {    year: 110, city: 'City000015', room: 900, accept: 3589, adopt: 2060, die: 154, return: 885, miss: 705, occupy: 747 },   // 新舊版合併

    { year: 113, city: 'City000002', room: 840, accept: 2147, adopt: 1883, die: 255, miss: 3, occupy: 722.4 }, // 臺北市 2024，犬在養率 86% (840 * .86 = 722.4)
    { year: 113, city: 'City000014', room: 700, accept: 6729 - 2785,
      adopt: 1687, die: 236, miss: 29, occupy: 1302 }, // 臺南市 2024，犬在養率 186% (700 * 1.86 = 1302)，注意 "accept"（收容隻數）需減去「入所絕育」公母共 2785 隻
  ];

  valid = testSamplesExist(samples, data);

  return valid;
}

// reportType:
//  3: 全國公立動物收容所收容處理情形統計表(詳表，110年2月前舊版)
//  4. 全國公立動物收容所收容處理情形統計表(詳表，110年3月後新版)
async function fetchYearData(year, reportType) {
  const beginDate = [year,
    (year === 2021 && reportType === 4) ? '03-01' : '01-01'
  ].join('-');

  const endDate = [year,
    (year === 2021 && reportType === 3) ? '02-28' : '12-31'
  ].join('-');

  const params = {
    action: 'AnimalsAccepReportFront',
    rType: reportType.toString(),
    DataS: beginDate,
    DataE: endDate,
  };

  console.log(`Getting data ${year}, params:`, params);
  const res = await request(params);
  const data = translateFields(res, year, reportType);

  return data;
}

async function fetchYears(years, reportType) {
  const results = [];
  for (const year of years) {
    results.push(await fetchYearData(year, reportType));
  }
  return R.unnest(results);
}

(async function main() {
  console.log("Fetch shelter detail data from pet.gov.tw ...\n");

  const head = await fetchYears([2018, 2019, 2020], 3);
  const tail = await fetchYears([2022, 2023, 2024], 4);

  // 110 年資料改版特殊處理，需分為三月前後
  const mixHead = await fetchYearData(2021, 3);
  const mixTail = await fetchYearData(2021, 4);
  const mix = R.pipe(
    R.map(R.omit(['room', 'occupy'])), // 舊版留容占用不算，以年底為準
    R.concat(mixTail),
    R.groupBy(({ year, city }) => `${year}:${city}`),
    R.mapObjIndexed((grouped) =>
      R.mergeWithKey(
        (key, l, r) => (['city', 'year'].includes(key) ? r : l + r),
        ...grouped
      )
    ),
    R.values,
    R.flatten,
  )(mixHead);
  const data = [...head, ...tail, ...mix];

  // DEBUG: to validate saved data:
  // const data = JSON.parse(fs.readFileSync('data/build/shelter_pet.json'));

  if (!validate(data)) {
    throw new Error('Validation failed')
  }

  const newContent = JSON.stringify(data);
  const needsUpdate = await checkUpdateHash(basename, newContent);
  if (needsUpdate) {
    await writeSourceTime(basename);
  } else {
    console.log(`Source data for '${basename}' has no change.`);
    if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
      console.log(chalk.yellow.bold('but still process per request.') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
    } else {
      return;
    }
  }

  const outFile = buildingPath(basename, 'json');
  await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
  console.log(`Successfully wrote file to ${outFile}\n`);
})();

