import type { Metadata } from "next";
import Status from '@/components/Status';
import { resources } from '@/lib/resource';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';
import Link from 'next/link';

import {
  ArrowLeftIcon,
  InfoIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: '資料狀態 - 全國遊蕩犬統計',
  description: '全國遊蕩犬相關資料圖表，資料重新整理的時間，以及從資料來源獲取更新的時間',
};

export default async function Page() {
  const revisionTitleLinkCls = 'rounded-md w-fit text-cyan-800 hover:text-slate-900 hover:bg-purple-100';
  const revisionLinkCls = 'inline-flex items-center gap-x-1 p-1 rounded-md w-fit text-blue-900 opacity-80 hover:opacity-100 hover:bg-purple-200';

  return (
    <div className="container min-h-screen mx-auto font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center justify-center h-full min-h-[60vh]">
        <h1 className='pt-3 block text-center w-full text-3xl bold'>
          全國遊蕩犬統計 資料狀態
        </h1>

        <div className=''>
          <h2 id='revisions' className='mt-3 mb-2 text-2xl py-1 text-center flex items-center justify-center'>
            修訂記錄
            <Tooltip>
              <TooltipTrigger>
                <div className='cursor-help p-1 ml-0.5 rounded self-stretch flex'>
                  <InfoIcon size={24} className='stroke-slate-600 cursor-help' />
                </div>
              </TooltipTrigger>
              <TooltipContent className='p-2 rounded box-border w-max z-[1002] bg-slate-100 drop-shadow-xl'>
                比較重大的數值變動（主要是既有資料勘誤，而不是新增資料）會列在這裡
              </TooltipContent>
            </Tooltip>
          </h2>

          <ol reversed className='font-mixed list-decimal list-inside md:list-outside px-3 md:px-0'>
            <li>
              <div className='inline'>
                <span className='mr-1'>2025-07-07</span>
                政府資料開放平台<Link href='https://data.gov.tw/dataset/41771' className={revisionTitleLinkCls}>年度犬貓統計表</Link>提供的 109 年數字有 6 個縣市錯置

              </div>
              <div className='flex items-center text-sm p-1 px-2 my-1 ring-1 ring-slate-300 bg-gray-200 rounded'>
                澎湖縣、連江縣、金門縣、嘉義市、新竹市、基隆市 109 年的數字顛倒，詳見
                <Link
                  target='_blank' className={revisionLinkCls}
                  href='https://github.com/bootleq/feeders-charts/issues/3'
                >
                  issue #3
                </Link>
              </div>
            </li>
            <li>
              <div className='inline'>
                <span className='mr-1'>2025-04-06</span>
                <Link href='https://www.pet.gov.tw/AnimalApp/ReportAnimalsAcceptFront.aspx' className={revisionTitleLinkCls}>全國動物收容管理系統</Link>提供的「可留容最大值」歷史數字錯誤
              </div>
              <div className='flex items-center text-sm p-1 px-2 my-1 ring-1 ring-slate-300 bg-gray-200 rounded'>
                較早年度的最大收容量被高估了，導致看起來收容壓力沒那麼大，詳見
                <Link
                  target='_blank' className={revisionLinkCls}
                  href='https://github.com/bootleq/feeders-charts/issues/1'
                >
                  issue #1
                </Link>
              </div>
            </li>
          </ol>
        </div>

        <div className='flex items-center my-3 mx-auto flex-1'>
          <Status scope='' resources={resources} />
        </div>

        <Link href='/' className='cursor-pointer p-2 mt-2 text-2xl rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
          返回
        </Link>
      </main>

      <Link href='/' className='cursor-pointer fixed top-0.5 right-0 px-2 text-slate-800 flex items-center text-md rounded transition hover:bg-amber-200 inline-block hover:-translate-x-1 hover:drop-shadow'>
        <ArrowLeftIcon className='px-1 pb-1 translate-y-px' />
        返回
      </Link>
    </div>
  );
}
