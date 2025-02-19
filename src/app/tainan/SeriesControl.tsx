import * as R from 'ramda';
import { useCallback } from 'react';
import { useAtom } from 'jotai';
import { SERIES_NAMES } from '@/lib/tainan_series';
import { seriesChecksAtom } from './store';

export function SeriesControl() {
  const [seriesSet, setSeriesSet] = useAtom(seriesChecksAtom);
  const toggle = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const code = e.currentTarget.value;
    setSeriesSet(R.over(R.lensProp(code), R.not));
  }, [setSeriesSet]);

  const textCls = [
    'pb-2 border-gray-400/0 border-b-4 text-slate-400',
    'peer-checked:text-slate-900 font-mixed',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  return (
    <div className='flex flex-wrap items-center justify-center w-full pb-0.5'>
      <ul className='flex items-center justify-around gap-2 flex-wrap max-w-[26rem]'>
        {R.toPairs(SERIES_NAMES).map(([code, name]) => {
          const checked = seriesSet[code];

          return (
            <li key={code}>
              <label className='cursor-pointer px-1 py-2 block rounded transition hover:bg-amber-200 hover:-translate-y-1 hover:drop-shadow'>
                <input type='checkbox' name='series' value={code} checked={checked} onChange={toggle} className='peer mb-1 sr-only' />
                <span className={textCls}>
                  {name}
                </span>
              </label>
            </li>
          );
        })}
      </ul>

      <input type='hidden' name='seriesSet' value={JSON.stringify(seriesSet)} />
    </div>
  );
}
