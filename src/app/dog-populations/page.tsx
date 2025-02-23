import type { Metadata } from "next";
import Link from 'next/link';
import Chart from './Chart';
import TableDialogWrapper from './TableDialogWrapper';
import {
  ArrowLeftIcon,
} from "lucide-react";

export const metadata: Metadata = {
  title: '全國遊蕩犬統計',
  description: '全國遊蕩犬相關資料圖表，整理來自政府等來源的公開資料，包括各縣市數量統計、公立收容所出入狀況、熱區餵養數字等，提供選項操作並視覺化，也可以輸出表格',
};

export default async function Page() {
  return (
    <div className="container items-center justify-items-center min-h-screen mx-auto font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center sm:items-start">
        <h1 className='pt-3 block text-center w-full text-3xl bold'>
          全國遊蕩犬統計
        </h1>

        <Chart />
      </main>

      <Link href='/' className='cursor-pointer fixed top-0.5 right-0 px-2 text-slate-800 flex items-center text-md rounded transition hover:bg-amber-200 inline-block hover:-translate-x-1 hover:drop-shadow'>
        <ArrowLeftIcon className='px-1 pb-1 translate-y-px' />
        返回
      </Link>

      <TableDialogWrapper />
    </div>
  );
}
