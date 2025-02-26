import type { Metadata } from "next";
import { metadata as layoutMetadata } from "./layout";
import Link from 'next/link';
import RepoLink from './RepoLink';
import BackToFeeders from './BackToFeeders';
import {
  ArrowLeftIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: '圖表頁 目錄',
  description: layoutMetadata.description,
};

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-start justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col min-w-[40vw] gap-8 row-start-1 items-center sm:items-start min-h-[66vh]">
        <h1 className='text-3xl font-bold'>
          圖表頁目錄
        </h1>

        <ul className='list-disc list-outside text-2xl ml-4 sm:ml-0'>
          <li>
            <Link href='dog-populations' className='cursor-pointer p-2 rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
              全國遊蕩犬統計
            </Link>
            <span className='inline-block mx-3 text-slate-400'>
            |
            </span>
            <Link href='dog-populations/resource' className='cursor-pointer p-2 rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
              資料狀態
            </Link>
          </li>
          <li>
            <Link href='tainan' className='cursor-pointer p-2 rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
              臺南市流浪犬 TNVR 成果
            </Link>
            <span className='inline-block mx-3 text-slate-400'>
            |
            </span>
            <Link href='tainan/resource' className='cursor-pointer p-2 rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
              資料狀態
            </Link>
          </li>
        </ul>

        <div className='flex flex-wrap items-center justify-center sm:justify-items-start mt-auto gap-x-12 w-full'>
          <BackToFeeders
            useSiteIcon={true}
            className='group cursor-pointer flex items-center p-2 mt-auto text-2xl rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'
          >
            <span className='text-nowrap px-2'>
              返回 Feeders
            </span>
          </BackToFeeders>
          <RepoLink />
        </div>
      </main>

      <BackToFeeders className='cursor-pointer fixed top-0.5 right-0 px-2 text-slate-800 flex items-center text-md rounded transition hover:bg-amber-200 inline-block hover:-translate-x-1 hover:drop-shadow'>
        <ArrowLeftIcon className='px-1 pb-1 translate-y-px' />
        返回
      </BackToFeeders>
    </div>
  );
}
