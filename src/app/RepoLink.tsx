"use client"

import Link from 'next/link';
import HubIcon from '@/assets/github-mark.svg';

export default function RepoLink() {
  return (
    <Link
      className='flex items-center gap-x-1 p-2 sm:ml-auto rounded-md w-fit text-slate-900 opacity-50 hover:opacity-100 hover:bg-purple-100'
      href='https://github.com/bootleq/feeders-charts'
      target='_blank'
      title='bootleq/feeders-charts: Interactive charts in feeders.fyi'
    >
      <HubIcon className='w-6 h-6' viewBox='0 0 98 98' />
      bootleq/feeders-charts
    </Link>
  );
}
