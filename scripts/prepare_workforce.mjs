import * as R from 'ramda';
import fsp from 'node:fs/promises';
import fetch from 'node-fetch';
import pdfTableExtractor from 'pdf-table-extractor';
import chalk from 'chalk';
import { cityLookup } from '@/lib/model';
import { blank } from '@/lib/utils';
import { workForceTable } from '@/lib/resource';
import { testSamplesExist } from './utils';
import {
  downloadPath,
  buildingPath,
  checkUpdateHash,
  writeSourceTime,
} from './data_source';

const resourceName = 'workforce';

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
  const samples = [
    {
      year: 110,
      city: 'City000006',
      ft_shelter: 7,
      pt_shelter: 3,
      ft_vet: 1,
      pt_vet: 3,
      ft_inspct: 2,
      pt_inspct: 0,
    }, // 新竹市 110
    {
      year: 111,
      city: 'City000022',
      ft_shelter: 3,
      pt_shelter: 3,
      ft_vet: 1,
      pt_vet: 1,
      ft_inspct: 2,
      pt_inspct: 0,
    }, // 連江縣 111
    {
      year: 112,
      city: 'City000017',
      ft_shelter: 6,
      pt_shelter: 4,
      ft_vet: 1,
      pt_vet: 2,
      ft_inspct: 5,
      pt_inspct: 4
    }, // 臺東縣 112
    {
      year: 113,
      city: 'City000005',
      ft_shelter: 6,
      pt_shelter: 1,
      ft_vet: 1,
      pt_vet: 2,
      ft_inspct: 6,
      pt_inspct: 2,
      ft_etc: 9,
      pt_etc: 2,
    }, // 新竹縣 113
  ];

  return testSamplesExist(samples, data);
}

function parseTable(pageTables, year) {
  let data = [];

  for (const page of pageTables) {
    const { tables: rows } = page;
    const [header1, header2, ...bodyRows] = rows;

    if (year >= 113) {
      if (
        header1[1] !== '收容所管理人員' ||
        R.not(/收容處所獸醫師$/.test(header1[3].replace(/\n/, ''))) ||
        header1[5] !== '動物保護檢查員' ||
        R.not(/其他動物保護業務/.test(header1[7].replace(/\n/, '')))
      ) {
        throw new Error(`Unexpected table header1: ${JSON.stringify(header1)}`);
      }
    } else {
      if (JSON.stringify(header1) !== JSON.stringify(['縣市別', '收容所管理人員', '',  '駐場獸醫師', '', '動物保護檢查員', ''])) {
        throw new Error(`Unexpected table header1: ${JSON.stringify(header1)}`);
      }
    }

    if (JSON.stringify(header2.slice(0, 7)) !== JSON.stringify(['', '專職', '兼職', '專職', '兼職', '專職', '兼職'])) {
      throw new Error(`Unexpected table header2: ${JSON.stringify(header2)}`);
    }

    bodyRows.forEach((row) => {
      const [cityName, ...values] = row;
      const city = cityLookup(cityName, true);
      if (blank(city)) return;

      data.push({
        city: city,
        ...R.zipObj([
          'ft_shelter',
          'pt_shelter',
          'ft_vet',
          'pt_vet',
          'ft_inspct',
          'pt_inspct',
          'ft_etc',
          'pt_etc',
        ], values.map(toNumber))
      });
    });
  }

  return data;
}

async function parsePDF(file, year) {
  let data = [];
  const { pageTables } = await extractPDFTable(file);

  data = parseTable(pageTables, year);
  return data.map(obj => ({ year, ...obj }));
}

async function fetchData(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to fetch ${url}: ${response.statusText}`);
  return response.arrayBuffer();
}

async function download(subResourceName, url, pdfPath) {
  console.log(`Download data for ${subResourceName} ...`);

  const remoteData = await fetchData(url);
  const buffer = Buffer.from(remoteData);
  await fsp.writeFile(pdfPath, buffer);
}

(async function main() {
  console.log("Prepare workforce data...\n");

  let data = [];

  for (const [year,, url] of workForceTable) {
    const basename = `${resourceName}_${year}`;
    const pdfPath = downloadPath(basename, `raw.pdf`);
    await download(basename, url, pdfPath);

    let seasonData = await parsePDF(pdfPath, year);
    data = [...data, ...seasonData];
  }

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
          obj
        ),
        {}
      ))
    )(data);

  if (!validate(data)) {
    console.error('Aborted, validation failed.');
    return;
  }

  const newContent = JSON.stringify(data, null, 2);
  const needsUpdate = await checkUpdateHash(resourceName, newContent);

  if (needsUpdate) {
    await writeSourceTime(resourceName);
  } else {
    console.log(`Source data for '${resourceName}' has no change.`);

    if (Number(process.env.DATA_CONTINUE_WHEN_SAME_HASH)) {
      console.log(chalk.yellow.bold('but still process per request.') + chalk.red.bold('(DATA_CONTINUE_WHEN_SAME_HASH)'));
    } else {
      return;
    }
  }

  const outFile = buildingPath(resourceName, 'json');
  await fsp.writeFile(outFile, newContent);
  console.log(`Successfully wrote file to ${outFile}\n`);

  console.log("\nDone.");
})();
