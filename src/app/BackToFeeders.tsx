"use client"

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Button({ children, className }: {
  children: React.ReactNode,
  className?: string,
}) {
  const [url, setUrl] = useState('/')

  useEffect(() => {
    const origin = window.location.origin;
    setUrl(`${origin}/`);
  }, []);

  return (
    <Link href={url} className={className || ''}>
      {children}
    </Link>
  );
}
