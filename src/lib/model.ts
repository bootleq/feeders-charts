import * as R from 'ramda';

type CountryDataItem = {
  year: number,     // 年度
  city: string,     // 縣市代碼
  domestic: number, // 家犬估計數
  roaming: number,  // 遊蕩犬估計數
  human: number,    // 人口數

  infant: number,   // 幼犬（幼齡入所）
  seized: number,   // 沒入
  accept: number,   // 收容
  adopt: number,    // 認領
  kill: number,     // 人道處理
  die: number,      // 所內死亡
  return: number,   // 回置
  miss: number,     // 其他出所（逃脫、其他）
  room: number,     // 可留容犬最大值
  occupy: number,   // 在養數

  h_visit: number,  // 熱區 家訪戶數
  h_roam: number,   // 熱區 無主犬清查
  h_feed: number,   // 熱區 餵食者人數
  h_stop: number,   // 熱區 疏導餵食成功
} & {
  // Also keys in offenceTypeKeys like:
  // "照護:0": number,
  // "照護:1": number,
  [K in typeof offenceTypeKeys[number]]: number;
} & {
  [K in typeof workforceTypeKeys[number]]: number;
}

type TainanDataItem = {
  year:   number,   // 年度
  city:   string,   // 行政區
  male:   number,   // 公犬
  female: number,   // 母犬
  total:  number,   // 總數
}

export type CountryItem = CountryDataItem | TainanDataItem;

export type ItemsMeta = {
  minYear: number,
  maxYear: number,
}

export const CITY_MAPPING: Record<string, string> = {
  City000003: "新北市", // 臺北縣 （100 年起臺北縣升直轄市）
  City000002: "臺北市",
  City000009: "臺中市", // 臺中縣 （100 年起與臺中縣合併為直轄市）
  City000014: "臺南市", // 臺南縣 （100 年起與臺南縣合併為直轄市）
  City000015: "高雄市", // 高雄縣 （100 年起與高雄縣合併為直轄市）
  City000004: "桃園市", // 桃園縣 （104 年起桃園縣升直轄市）
  City000019: "宜蘭縣",
  City000005: "新竹縣",
  City000006: "新竹市",
  City000007: "苗栗縣",
  City000010: "彰化縣",
  City000008: "南投縣",
  City000011: "雲林縣",
  City000012: "嘉義縣",
  City000013: "嘉義市",
  City000016: "屏東縣",
  City000017: "臺東縣",
  City000018: "花蓮縣",
  City000020: "澎湖縣",
  City000001: "基隆市",
  City000021: "金門縣",
  City000022: "連江縣",
};

export const TAINAN_DISTRICTS: Record<string, string> = {
  700: "中西區",
  701: "東區",
  702: "南區",
  704: "北區",
  708: "安平區",
  709: "安南區",
  710: "永康區",
  711: "歸仁區",
  712: "新化區",
  713: "左鎮區",
  714: "玉井區",
  715: "楠西區",
  716: "南化區",
  717: "仁德區",
  718: "關廟區",
  719: "龍崎區",
  720: "官田區",
  721: "麻豆區",
  722: "佳里區",
  723: "西港區",
  724: "七股區",
  725: "將軍區",
  726: "學甲區",
  727: "北門區",
  730: "新營區",
  731: "後壁區",
  732: "白河區",
  733: "東山區",
  734: "六甲區",
  735: "下營區",
  736: "柳營區",
  737: "鹽水區",
  741: "善化區",
  742: "大內區",
  743: "山上區",
  744: "新市區",
  745: "安定區",
};

export const LEGACY_CITY_MAPPING = {
  City000003: "臺北縣",
  City000009: "臺中縣",
  City000014: "臺南縣",
  City000015: "高雄縣",
  City000004: "桃園縣",
};

const revertCityMapping = R.invertObj(CITY_MAPPING);

export function cityLookup(nameOrCode: string, silent?: boolean) {
  if (R.has(nameOrCode, CITY_MAPPING)) {
    return CITY_MAPPING[nameOrCode];
  }

  if (R.has(nameOrCode, revertCityMapping)) {
    return revertCityMapping[nameOrCode];
  }

  if (silent) return undefined;

  throw new Error(`Unknown city lookup: ${nameOrCode}`);
}

export const offenceTypeMapping = {
  '飼主照護責任':                     '照護',
  '棄養動物':                         '棄養',
  '虐待、傷害動物':                   '虐待',
  '非經許可展演動物':                 '無照展演',
  '宰殺犬貓或販售犬貓屠體':           '宰殺',
  '不當捕捉方式':                     '捕捉方式', // (含獸鋏、金屬套索等)
  '製造、販賣、陳列或輸出入獸鋏':     '散布獸鋏',
  '未辦理寵物登記':                   '未寵登',
  '犬隻疏縱':                         '疏縱', // (含具攻擊性犬管理)
  '未經許可經營寵物繁殖、買賣及寄養': '無照繁殖',
  '寵物業者管理不善':                 '管理不善',
  '未絕育及未申報':                   '未絕育',
  '寵物食品查驗':                     '食品',
} as const;

// Make actual keys like:
// [
//  "照護:0", "照護:1",
//  "棄養:0", "棄養:1",
//  ...
// ]
export const offenceTypeKeys = Object.values(offenceTypeMapping).flatMap(
  (name) => [`${name}:0`, `${name}:1`] as const
) satisfies readonly string[];

export const workforceTypeMapping = {
  shelter: '收容所管理', // 收容所管理人員
  vet:     '獸醫師',     // 駐公立動物收容處所獸醫師
  inspct:  '檢查員',     // 動物保護檢查員
  etc:     '其他業務',   // 執行其他動物保護業務之人員
} as const;

// Make actual keys as:
// [
//  'ft_shelter', 'pt_shelter',
//  'ft_vet', 'pt_vet',
//  'ft_inspct', 'pt_inspct',
//  'ft_etc', 'pt_etc',
// ]
export const workforceTypeKeys = Object.keys(workforceTypeMapping).flatMap(
  k => [`ft_${k}`, `pt_${k}`] as const
) satisfies readonly string[];
