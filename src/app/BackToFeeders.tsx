"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Icon from '@/assets/bowl.svg'

export default function Button() {
  const [url, setUrl] = useState('/')

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(`${origin}/`);
  }, []);

  return (
    <Link href={url} className='group cursor-pointer flex items-center p-2 mt-auto text-2xl rounded transition hover:bg-amber-200 inline-block hover:-translate-y-1 hover:drop-shadow'>
      <Icon width={55} height={55} className='px-2 pb-1 -translate-y-[3px] group-hover:translate-y-[14px]' />
      <span className='text-nowrap px-2'>
        返回 Feeders
      </span>
    </Link>
  );
}
