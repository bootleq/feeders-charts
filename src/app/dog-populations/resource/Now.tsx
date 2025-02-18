import { useEffect, useRef } from 'react';
import { formatDate } from '@/lib/utils';

export default function Now() {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const $now = ref.current;
    if (!$now) return;

    const timer = setInterval(() => {
      const now = new Date();
      const formatted = formatDate(now, 'week');
      $now.innerText = formatted;
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <span ref={ref}>
      --
    </span>
  );
}
