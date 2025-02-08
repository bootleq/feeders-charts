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

// 回置
const tipReturn = (<>
  釋放出所的數量
  <br />
  2011 年三月前叫「飭回原地」，之後叫「絕育後回置」
</>);

const dict: Record<string, React.JSX.Element|string> = {
  roaming: tipRoaming,
  human: tipHuman,
  human100: tipHuman100,
  domestic: tipDomestic,

  accept: tipAccept,
  adopt: tipAdopt,
  kill: tipKill,
  die: tipDie,
  miss: tipMiss,
  room: tipRoom,
  occupy: tipOccupy,
  return: tipReturn,
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
