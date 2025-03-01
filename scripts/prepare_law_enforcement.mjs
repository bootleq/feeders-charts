import * as R from 'ramda';
import fsp from 'node:fs/promises';
import fetch from 'node-fetch';
import pdfTableExtractor from 'pdf-table-extractor';
import chalk from 'chalk';
import { cityLookup, offenceTypeMapping } from '@/lib/model';
import { lawEnforceTable } from '@/lib/resource';
import { testSamplesExist } from './utils';
import {
  downloadPath,
  buildingPath,
  checkUpdateHash,
  writeSourceTime,
} from './data_source';

const resourceName = 'law_enforce';

async function extractPDFTable(file) {
  return new Promise((resolve, reject) => {
    pdfTableExtractor(
      file,
      (result) => resolve(result),
      (error) => reject(error),
    );
  });
}

function toNumber(str) {
  return Number(str.trim().replaceAll(',', ''));
}

function validate(data) {
  let valid = true;

  const samples = [
    {
      year: 111,
      city: 'City000003',
      "照護:0":  563 + 258 + 433 + 378, // 1632
      "照護:1":    2 +   2 +   2 +   2, // 8
      "棄養:0":   39 +  69 + 118 +  69, // 295
      "棄養:1":   10 +  20 +  81 +  23, // 134
      "食品:0":    1
    }, // 新北市 111
    {
      year: 111,
      city: 'City000011',
      "照護:0":  29 + 27 + 31 + 41, // 128
      "宰殺:0": 1,
      "宰殺:1": 1,
      "捕捉方式:0": 3 + 9, // 12
      "疏縱:0": 1 + 1 + 3, // 5
      "疏縱:1": 1 + 1 + 3, // 5
    }, // 雲林縣 111，唯一的宰殺裁罰
    {
      year: 112,
      city: 'City000014',
      "照護:0":  151 + 140 + 135 + 355, // 781
      "捕捉方式:0":      9 +  10 +   4, // 23
      "捕捉方式:1":      1 +   1,       // 2
      "疏縱:0":   85 +  84 +  65 +  84, // 318
      "疏縱:1":    5 +   6 +   1 +   1, // 13
      "未絕育:0":  8 +  13 +   7 +  11, // 39
      "未絕育:1":  2,
    }, // 臺南市 112
    {
      year: 113,
      city: 'City000009',
      "虐待:0":  47 + 46 + 46 + 45, // 184
      "虐待:1":  12 +  4 + 13 +  4, // 33
      "無照展演:0":  4 + 4 + 9 + 2, // 19
      "無照展演:1":  2 + 2 + 3 + 1, // 8
      "散布獸鋏:0":  1 + 1 + 2 + 1, // 5
      "散布獸鋏:1":  1,
      "未寵登:0": 8 + 7 + 4 + 1, // 20
      "未寵登:1": 2 + 4,         // 6
      "疏縱:0": 223 + 194 + 177 + 203, // 797
      "疏縱:1":  31 +  28 +  24 +  34, // 117
      "無照繁殖:0": 11 + 10 + 18 +  9, // 48
      "無照繁殖:1":  5 +  3 +  3 +  3, // 14
      "管理不善:0": 13 + 17 + 24 + 18, // 72
      "管理不善:1":  9 + 22 + 11 + 30, // 72
      "未絕育:0":   17 + 48 + 90 + 50,  // 205
      "未絕育:1":    7 +  1 + 14,       // 22
    }, // 臺中市 113
  ];

  valid = testSamplesExist(samples, data);
  return valid;
}

const offenceTypeQuirks = [
  ['屠體', '無照繁殖'],
  ['套索等)', '捕捉方式'],
  ['獸鋏', '散布獸鋏'],
  ['犬管理)', '疏縱'],
  ['及寄養', '無照繁殖'],
];

function normalizeOffenceName(str) {
  const trimmed = str.trim().replaceAll(/[\r\n]/g, '').split('(')[0];
  let name = offenceTypeMapping[trimmed];

  // 案件類型中的 \n 可能造成解析混亂，誤判為第二行的首欄，
  // 誤判的首欄查表會失敗，此處再嘗試以句尾判斷
  if (!name && trimmed) {
    for (const [tail, mapTo] of offenceTypeQuirks) {
      if (trimmed.endsWith(tail)) {
        name = mapTo;
        break;
      }
    }
  }

  return name || '';
}

function parseSeason4(pageTables) {
  let data = [];
  for (const page of pageTables) {
    const { tables: rows } = page;
    const [header, ...bodyRows] = rows;

    // Columns were laid like:
    //  新北市                     臺北市
    //  第4季 第3季 第2季 第1季 x  ...
    let currentCity = '';
    let seasonCount = 0;
    const headerOffset = 3;

    // Store column info in shape: [ [citycode, columnIndex], ... ]
    const cityIdxes = header.slice(headerOffset).reduce((acc, name, idx) => {
      if (name.length && name !== '全國') {
        currentCity = cityLookup(name);
        seasonCount = 0;
      }
      if (currentCity.length && seasonCount < 4) { // 只收 4 ~ 1 季，忽略多餘的「與前一季相比」欄位
        acc.push([currentCity, idx + headerOffset]);
        seasonCount += 1;
      }
      return acc;
    }, []);

    bodyRows.forEach((row, idx) => {
      let offenceName = normalizeOffenceName(row[0]); // 案件類型
      const step = row[2]; // 檢舉 / 裁處

      // 表格解析問題，「案件類型」可能自成一行，而和資料行對不上（資料皆為空），
      // 解法：跳過非資料的行，缺少類型時，由「檢舉」～「裁處」之間的行尋找
      if (R.isEmpty(step)) {
        return;
      }
      if (R.isEmpty(offenceName)) {
        let findingIdx = idx;
        switch (step) {
          case '檢舉':
            while(R.isEmpty(offenceName)) {
              findingIdx += 1;
              const [tOffenceName, tStep] = bodyRows[findingIdx].slice(0, 2)
              if (tStep === '檢舉') break;
              const name = normalizeOffenceName(tOffenceName);
              if (name) offenceName = name;
            }
            break;
          case '裁處':
            while(R.isEmpty(offenceName)) {
              findingIdx -= 1;
              const [tOffenceName, tStep] = bodyRows[findingIdx].slice(0, 2)
              if (tStep === '裁處') break;
              const name = normalizeOffenceName(tOffenceName);
              if (name) offenceName = name;
            }
            break;
          default:
            break;
        }
      }

      if (R.isEmpty(offenceName)) {
        throw new Error(`Missing 案件類型 in row ${idx},\n${JSON.stringify(row, null, 2)}`);
      }

      cityIdxes.forEach(([city, colIdx]) => {
        const qty = toNumber(row[colIdx]);
        if (qty > 0) {
          const offenceNameKey = `${offenceName}:${step === '裁處' ? 1 : 0}`;
          const obj = {
            city,
            [offenceNameKey]: qty,
          };
          data.push(obj);
        }
      });
    });
  }

  return data;
}

async function parsePDF(file, year) {
  let data = [];
  const { pageTables } = await extractPDFTable(file);

  data = parseSeason4(pageTables);
  return data.map(obj => ({ year, ...obj }));
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return response.arrayBuffer();
}

async function download(subResourceName, url, pdfPath) {
  console.log(`Download data for ${subResourceName} ...`);

  let forced = false;

  const remoteData = await fetchData(url);
  const needsUpdate = await checkUpdateHash(subResourceName, remoteData);

  if (needsUpdate) {
    try {
      const buffer = Buffer.from(remoteData);
      await fsp.writeFile(pdfPath, buffer);
      await writeSourceTime(subResourceName);
      console.log(`Data saved in ${pdfPath}`);
    } catch (error) {
      console.error(`Fail saving resource for ${subResourceName}：`, error.message);
      throw error;
    }
  } else {
    console.log(`Remote data for '${subResourceName}' has no change.`);

    if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
      forced = true;
      console.log(chalk.yellow.bold('but still save data per request ') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
    }
  }

  return [needsUpdate, forced];
}

(async function main() {
  console.log("Prepare law_enforce data...\n");

  let data = [];
  let hasChange = false;
  let hasForced = false;
  let valid = true;

  for (const [year,, url] of lawEnforceTable) {
    const basename = `law_enforce_${year}`;
    const pdfPath = downloadPath(basename, `raw.pdf`);
    const [stale, forced] = await download(basename, url, pdfPath);

    if (forced) hasForced = true;
    if (stale) hasChange = true;

    let seasonData = await parsePDF(pdfPath, year);
    data = [...data, ...seasonData];
  }

  if (hasChange) {
    await writeSourceTime(resourceName);
  }

  if (!hasForced && !hasChange) {
    console.log("\nAll sources have no change, aborted.");
    return;
  }

  const sparseFile = buildingPath(resourceName, 'raw.json'); // keep intermediate data for debug
  await fsp.writeFile(sparseFile, JSON.stringify(data, null, 2));

  data = R.pipe(
    R.groupBy(R.props(['city', 'year'])),
    R.values,
    R.map(
      R.reduce((acc, obj) =>
        R.mergeWithKey(
          (key, a, b) => {
            if (['city', 'year'].includes(key)) {
              return a;
            } else {
              return (R.is(Number, a) && R.is(Number, b) ? a + b : a);
            }
          },
          acc,
          R.omit(['season'], obj),
        ),
        {}
      ))
    )(data);

  if (!validate(data)) {
    console.error('Aborted, validation failed.');
    valid = false;
  }

  if (valid) {
    const outFile = buildingPath(resourceName, 'json');
    await fsp.writeFile(outFile, JSON.stringify(data, null, 2));
    console.log(`Successfully wrote file to ${outFile}\n`);

    console.log("\nDone.");
  }
})();
