"use client"

import { Tooltip, TooltipTrigger, TooltipContent, menuHoverProps } from '@/components/Tooltip';

// 遊蕩犬
const tipRoaming = (<>
  <strong>歷年遊蕩犬數量統計</strong>，請留意：
  <ul className='list-inside list-disc my-1'>
    <li>統計方式有變動，109 年起才比較穩定</li>
    <li>此為估計值，非實數</li>
    <li>統計範圍不含野犬 (feral dog)</li>
  </ul>
  <p className='mt-2'>
    88 年只有全國數字，未取得縣市資料
  </p>
</>);

// 人口
const tipHuman = (<>
  前一年 12 月的人口數
  <br />
  取自<a href='https://winstacity.dgbas.gov.tw/DgbasWeb/ZWeb/StateFile_ZWeb.aspx' target='_blank'>中華民國統計資訊網</a>「戶籍登記人口數(人)」
</>);

// 每百人
const tipHuman100 = (<>
  平均每百人遊蕩犬數
  <br />
  <code className='font-mono text-green-900'>（遊蕩犬數 / 人口數 × 100）</code>
</>);

// 家犬
const tipDomestic = (<>
  每兩年統計一次，估計值，非實數
</>);

// 幼犬
const tipInfant = (<>
  <strong>幼犬入所數</strong>，在入所原因「政府處理案件」和「拾獲送交」中，分類為「幼齡無自理能力」者
  <br />
  110 年 3 月後才有這個欄位
</>);

// 沒入
const tipSeized = (<>
  <strong>依法沒入</strong>的入所數
</>);

// 收容
const tipAccept = (<>
  <strong>總入所數</strong>，依動保資訊網定義為：
  <br />
  <q cite='https://animal.moa.gov.tw/Frontend/Know/PageTabList?TabID=31B05CB46007226417F0F5FB8A80096E#tab3' className='text-sm text-yellow-700 [quotes:none]'>
    *收容隻數 = 當年進入收容所之動物量(包含政府處理案件、拾獲送交、不擬續養、依法沒入等)，不含入所絕育數
  </q>
</>);

// 認領
const tipAdopt = (<>
  <strong>認領</strong>、<strong>認養</strong>的出所總數
  <br />
  認養包含個人、大量飼養戶（民間狗場）、動保團體及其他
</>);

// 人道處理
const tipKill = '依法人道處理（安樂死）執行數';

// 所內死亡
const tipDie = (<>
  死亡，原因：
  <ul className='list-inside list-disc'>
    <li>入所已瀕危</li>
    <li>疾病死亡</li>
    <li>生理耗弱死亡</li>
  </ul>
</>);

// 逃脫等
const tipMiss = '逃脫及「其他原因」出所數';

// 可收容量
const tipRoom = (<>
  （犬）<strong>可留容最大值</strong>
  <br />
  各縣市提報的容量，多假設在養犬屬大型犬時的最大容許值；
  <br />
  依欄舍設計不同，實際也可能彈性運用
</>);

// 在養數
const tipOccupy = (<>
  由「在養占可留容比例」與「可容留最大值」推算出當年的在養數（只算犬，貓不算）
  <br />
  其中「在養數」也包含「委託代養」
</>);
const tipOccupy100 = (<>
  「在養數」占「可收容量」的比例
</>);

// 回置
const tipReturn = (<>
  釋放出所的數量
  <br />
  2011 年三月前叫「飭回原地」，之後叫「絕育後回置」
</>);

// 遊蕩犬估計 chart 類型
const tipRoamingChartBar = (<>
  切換「遊蕩犬估計」圖表類型：
  <br />
  「長條圖」或「折線圖」
</>);

// 直接顯示數字
const tipShowAllLabels = (<>
  標出每個資料的數值，而不是滑鼠移上去才顯示
</>);

const tipToTableChart = (<>
  單純將圖表中的年度與各項數值轉為表格
</>);
const tipToTableCitiesTrend = (<>
  根據表單選項整理資料：區分各區域，展開各年度詳細數值
</>);

const tip12Announce = (<>
  動保法修法「廢除 12 夜」，緩衝期兩年
</>);
const tipLaw6 = (<>
  禁止肉用宰殺犬貓、虐待入刑罰等
</>);
const tipLaw7 = (<>
  7 夜改成 12 夜、買賣必須先植入晶片等
</>);
const tipLaw9 = (<>
  廢除 12 夜、飼主必須植晶片登記等
</>);
const tipLaw11 = (<>
  明確禁止狗肉、未絕育不再勸導等
</>);
const tipHeatMap = (<>
  督促地方政府提出「熱區」集中資源改善
</>);
const tipHeatMapEco = (<>
  針對野生動物、生態保育的「熱區」
</>);
const tipTainanZero = (<>
  台南市比全國更早實施零安樂
</>);
const tipFeederPass = (<>
  餵食證、乾淨餵食講習
</>);
const tipEast326 = (<>
  公布全台 326 縣市鄉鎮流浪犬貓處境
</>);
const tipShelterShip = (<>
  嘉義公立收容所運送犬貓，集體熱死
</>);
const tipEuthSuicide = (<>
  桃園市動保教育園區園長死諫
</>);
const tipShoushanInc = (<>
  高雄壽山調查遊蕩犬增加 <code>318%</code>
</>);

const dict: Record<string, React.JSX.Element|string> = {
  roaming: tipRoaming,
  human: tipHuman,
  human100: tipHuman100,
  domestic: tipDomestic,

  infant: tipInfant,
  seized: tipSeized,
  accept: tipAccept,
  adopt: tipAdopt,
  kill: tipKill,
  die: tipDie,
  miss: tipMiss,
  room: tipRoom,
  occupy: tipOccupy,
  occupy100: tipOccupy100,
  return: tipReturn,

  roaming_chart_bar: tipRoamingChartBar,
  show_all_labels: tipShowAllLabels,

  'toTable:chart': tipToTableChart,
  'toTable:citiesTrend': tipToTableCitiesTrend,

  '零撲殺公告': tip12Announce,
  '動保法第 6 次修法': tipLaw6,
  '動保法第 7 次修法': tipLaw7,
  '動保法第 9 次修法': tipLaw9,
  '動保法第 11 次修法': tipLaw11,
  '遊蕩犬管控精進策略': tipHeatMap,
  '生態熱區': tipHeatMapEco,
  '台南零安樂': tipTainanZero,
  '新北餵養講習': tipFeederPass,
  '悲傷 326 記者會': tipEast326,
  '民雄收容所運送事件': tipShelterShip,
  '簡稚澄事件': tipEuthSuicide,
  '壽山流浪狗倍增': tipShoushanInc,
};

export const MenuDescTooltip = ({ name, children }: { name: string|undefined, children: React.ReactNode }) => {
  const body = name && dict[name];
  const hoverProps = {
    ...menuHoverProps,
    restMs: 300,
  }

  if (body) {
    return (
      <Tooltip placement='left' offset={-5} hoverProps={hoverProps}>
        <TooltipTrigger>
          {children}
        </TooltipTrigger>
        <TooltipContent className='px-2 py-1 rounded box-border text-sm leading-relaxed w-fit max-w-[20vw] z-[1002] bg-neutral-50 drop-shadow-xl'>
          {body}
        </TooltipContent>
      </Tooltip>
    );
  }

  return children;
}
