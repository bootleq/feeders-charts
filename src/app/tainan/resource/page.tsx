import Status from '@/components/Status';
import { resources } from '@/lib/tainan_resource';
import Link from 'next/link';

export default async function Page() {
  return (
    <div className="container min-h-screen mx-auto font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center justify-center h-full min-h-[60vh]">
        <h1 className='pt-3 block text-center w-full text-3xl bold'>
          臺南市遊蕩犬調查情形
          資料狀態
        </h1>

        <div className='flex items-center my-3 mx-auto flex-1'>
          <Status scope='tainan' resources={resources} />
        </div>

        <Link href='/' className='cursor-pointer p-2 mt-2 text-2xl rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
          返回
        </Link>
      </main>
    </div>
  );
}
