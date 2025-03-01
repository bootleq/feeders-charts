import * as R from 'ramda';
import { useState, useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { makeYearRange } from '@/lib/utils';
import {
  MenuIcon,
  ScaleIcon,
  GrabIcon,
} from "lucide-react";
import Years04Icon from '@/assets/year-set-04.svg';
import Years14Icon from '@/assets/year-set-14.svg';
import { tooltipClass, tooltipMenuCls } from '@/lib/utils';

const YearPresets: Record<string, [any, (value: number) => boolean]> = {
  '2004': [Years04Icon, R.lte(93)],
  '2014': [Years14Icon, R.lte(103)],
  'post12': [ScaleIcon, R.lte(106)],
  'all': [GrabIcon, R.gt(0)],
};

function YearPresetItem({ dataKey, children, iconClass }: {
  dataKey: string,
  children: React.ReactNode,
  iconClass?: string,
}) {
  const Icon = YearPresets[dataKey]?.[0];

  return (
    <button className='p-2 w-full flex items-center rounded hover:bg-amber-200' data-preset={dataKey}>
      {Icon && <Icon className={`w-[1.25em] aspect-square box-content pr-1.5 mr-1 border-r ${iconClass || ''}`} />}
      {children}
    </button>
  );
}

export function YearsInput({ min, max, formRef }: {
  min: number,
  max: number,
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const [handle, setHandle] = useState<number | null>();
  const yearRange = makeYearRange(min, max);
  const textCls = [
    'font-mono text-slate-400',
    'pb-px border-b [border-image-slice:1]',
    'peer-checked:text-slate-900 peer-checked:border-solid',
    'peer-checked:[border-image-source:linear-gradient(to_right,transparent_30%,#888_30%,#888_70%,transparent_70%)]',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  const onClickYear = useCallback((e: React.MouseEvent<HTMLLabelElement>) => {
    const label = e.currentTarget;
    const year = Number(label.dataset.year);
    const form = formRef.current;

    if (handle && e.shiftKey && form) {
      e.preventDefault();
      const [min, max] = [handle, year].toSorted(R.ascend(R.identity));
      const range = makeYearRange(min, max);
      const handleChecked = form.querySelector<HTMLInputElement>(`input[name="years"][value='${handle}']`)?.checked;
      const boxes = form.querySelectorAll<HTMLInputElement>('input[name="years"]');
      boxes.forEach(box => {
        if (range.includes(Number(box.value))) {
          box.checked = !!handleChecked;
        }
      })
    } else {
      setHandle(Number(year));
    }
  }, [handle, formRef]);

  const onPickPreset = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target;
    const form = formRef.current;
    if (!form) return;

    if (target instanceof HTMLElement) {
      const btn = target.closest<HTMLElement>('button[data-preset]');
      if (btn) {
        const key = btn.dataset.preset!;
        const cb = YearPresets[key]?.[1];

        const boxes = form.querySelectorAll<HTMLInputElement>('input[name="years"]');
        if (key === 'all') {
          const checked = !!boxes[0].checked;
          boxes.forEach(box => box.checked = !checked);
        } else {
          boxes.forEach(box => {
            box.checked = cb(Number(box.value));
          });
        }
      }
    }
  }, [formRef]);

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center justify-around flex-wrap max-w-[26rem]'>
        {yearRange.map((year) => {
          return (
            <li key={year} className={handle ? 'select-none' : ''}>
              <label className='cursor-pointer px-1 py-2 block rounded relative transition hover:bg-amber-200 hover:drop-shadow' data-year={year} onClick={onClickYear}>
                { year === handle &&
                  <Tooltip placement='top' hoverProps={menuHoverProps}>
                    <TooltipTrigger className='mb-1 block truncate'>
                      <div className='absolute left-1/2 -translate-x-1/2 -translate-y-1 z-40 bg-blue-400 w-1.5 h-1.5'></div>
                    </TooltipTrigger>
                    <TooltipContent className={tooltipClass('p-1 text-xs ring-1')}>
                      按住 <kbd>SHIFT</kbd> 選擇範圍
                    </TooltipContent>
                  </Tooltip>
                }
                <input type='checkbox' name='years' value={year} defaultChecked={true} className='peer mb-1 sr-only' />
                <span className={textCls}>
                  {year}
                </span>
              </label>
            </li>
          );
        })}
        <li className='ml-auto'>
          <Tooltip placement='right' offset={8} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-1 pt-2 hover:bg-slate-200/75 rounded self-stretch flex items-center' tabIndex={0}>
                <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  <MenuIcon size={20} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
              <div className={tooltipMenuCls()} onClick={onPickPreset}>
                <YearPresetItem dataKey='2004'>從 <code className='mx-1'>2004</code> 開始</YearPresetItem>
                <YearPresetItem dataKey='2014'>從 <code className='mx-1'>2014</code> 開始</YearPresetItem>
                <YearPresetItem dataKey='post12'>零撲殺後</YearPresetItem>
                <YearPresetItem dataKey='all' iconClass='opacity-50'>全選／不選</YearPresetItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>
    </div>
  );
}
