export type CountryItem = {
  year: number,     // 年度
  city: string,     // 縣市代碼
  domestic: number, // 家犬估計數
  roaming: number,  // 遊蕩犬估計數
  accept: number,   // 收容
  adopt: number,    // 認領
  kill: number,     // 人道處理
  die: number,      // 所內死亡
}

export type ItemsMeta = {
  minYear: number,
  maxYear: number,
}

export const CITY_MAPPING = {
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
