"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';
import SiteIcon from '@/assets/bowl.svg'

export default function Button({ children, className, useSiteIcon }: {
  children: React.ReactNode,
  className?: string,
  useSiteIcon?: boolean,
}) {
  const [url, setUrl] = useState('/')

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(`${origin}/`);
  }, []);

  return (
    <Link href={url} className={className || ''}>
      {useSiteIcon && <SiteIcon width={55} height={55} className='px-2 pb-1 -translate-y-[3px] group-hover:translate-y-[14px]' />}
      {children}
    </Link>
  );
}
