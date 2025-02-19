import * as R from 'ramda';
import { useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { tooltipClass, tooltipMenuCls } from '@/lib/utils';
import { TAINAN_DISTRICTS } from '@/lib/model';

import {
  MenuIcon,
  GrabIcon,
} from "lucide-react";

const CityPresets: Record<string, [any, string[]]> = {
  'all': [GrabIcon, []],
};

function CityPresetItem({ dataKey, children, iconClass }: {
  dataKey: string,
  children: React.ReactNode,
  iconClass?: string,
}) {
  const Icon = CityPresets[dataKey]?.[0];

  return (
    <button className='p-2 w-full flex items-center rounded hover:bg-amber-200' data-preset={dataKey}>
      {Icon && <Icon className={`w-[1.25em] aspect-square box-content pr-1.5 mr-1 border-r opacity-50 ${iconClass || ''}`} />}
      {children}
    </button>
  );
}

export function DistrictsInput({ formRef }: {
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const textCls = [
    'pb-2 border-gray-400/0 border-b-4 text-slate-400',
    'peer-checked:text-slate-900 font-mixed',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  const onPickPreset = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const target = e.target;
    const form = formRef.current;
    if (!form) return;

    if (target instanceof HTMLElement) {
      const btn = target.closest<HTMLElement>('button[data-preset]');
      if (btn) {
        const key = btn.dataset.preset!;

        const boxes = form.querySelectorAll<HTMLInputElement>('input[name="cities"]');
        if (key === 'all') {
          const checked = !!boxes[0].checked;
          boxes.forEach(box => box.checked = !checked);
        }
      }
    }
  }, [formRef]);

  return (
    <div className='flex items-center pb-0.5'>
      <ul className='grid grid-cols-10 gap-x-1'>
        {
          R.toPairs(TAINAN_DISTRICTS).map(([code, name]) => (
            <li key={code} className='relative'>
              <label className='cursor-pointer px-1 py-2 block rounded transition hover:bg-amber-200 hover:-translate-y-1 hover:drop-shadow'>
                <input type='checkbox' name='cities' value={code} defaultChecked={true} className={`peer mb-1 sr-only`} />
                <span className={textCls}>
                  {code} {name}
                </span>
              </label>
            </li>
          ))
        }
        <li className='-col-start-1'>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger>
              <div className='cursor-help hover:bg-slate-200/75 rounded h-full flex items-center justify-center' tabIndex={0}>
                <div className='text-slate-400 outline-blue-400 peer-focus-visible:outline'>
                  <MenuIcon size={20} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
              <div className={tooltipMenuCls()} onClick={onPickPreset}>
                <CityPresetItem dataKey='all' iconClass='opacity-50'>全選／不選</CityPresetItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>

    </div>
  );
}
