import type { Metadata } from "next";
import Status from '@/components/Status';
import { resources } from '@/lib/resource';
import Link from 'next/link';

export const metadata: Metadata = {
  title: '資料狀態 - 全國遊蕩犬統計',
  description: '全國遊蕩犬相關資料圖表，資料重新整理的時間，以及從資料來源獲取更新的時間',
};

export default async function Page() {
  return (
    <div className="container min-h-screen mx-auto font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center justify-center h-full min-h-[60vh]">
        <h1 className='pt-3 block text-center w-full text-3xl bold'>
          全國遊蕩犬統計 資料狀態
        </h1>

        <div className='flex items-center my-3 mx-auto flex-1'>
          <Status scope='' resources={resources} />
        </div>

        <Link href='/' className='cursor-pointer p-2 mt-2 text-2xl rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
          返回
        </Link>
      </main>
    </div>
  );
}
