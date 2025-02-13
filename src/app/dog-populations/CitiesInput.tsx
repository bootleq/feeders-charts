import { useCallback, useEffect } from 'react';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { CITY_MAPPING, cityLookup } from '@/lib/model';
import { tooltipClass, tooltipMenuCls } from './utils';
import styles from './page.module.scss';

import {
  MenuIcon,
  GrabIcon,
  CircleDollarSignIcon,
  CircleUserIcon,
} from "lucide-react";

const CityPresets: Record<string, [any, string[]]> = {
  '六都': [CircleDollarSignIcon, ['新北市', '臺北市', '臺中市', '臺南市', '高雄市', '桃園市'].map(cityLookup)],
  '北北基桃': [CircleUserIcon, ['新北市', '臺北市', '基隆市', '桃園市'].map(cityLookup)],
  '宜花東': [CircleUserIcon, ['宜蘭縣', '花蓮縣', '臺東縣'].map(cityLookup)],
  '中臺灣': [CircleUserIcon, ['苗栗縣', '臺中市', '彰化縣', '南投縣', '雲林縣'].map(cityLookup)],
  '南臺灣': [CircleUserIcon, ['嘉義縣', '嘉義市', '臺南市', '高雄市', '屏東縣', '澎湖縣'].map(cityLookup)],
  '外島': [CircleUserIcon, ['澎湖縣', '金門縣', '連江縣'].map(cityLookup)],
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


export function CitiesInput({ formRef }: {
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const textCls = [
    'pb-2 border-gray-400/0 border-b-4 text-slate-400',
    'peer-checked:text-slate-900 font-sans',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  useEffect(() => {
    const box = document.querySelector('li.writing-vertical')?.closest('ul');
    if (box && box.offsetHeight > 400) {
      box.style.flexFlow = 'initial'; // workaround for Firefox
    }
  }, []);

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
        } else {
          const cities = CityPresets[key]?.[1];
          boxes.forEach(box => {
            box.checked = cities.includes(box.value);
          });
        }
      }
    }
  }, [formRef]);

  return (
    <div className='flex items-center pb-0.5'>
      <ul className='flex flex-wrap items-center'>
        {
          Object.entries(CITY_MAPPING).map(([code, name]) => (
            <li key={code} className='writing-vertical relative'>
              <label className='cursor-pointer px-1 py-2 block rounded transition hover:bg-amber-200 hover:-translate-y-1 hover:drop-shadow'>
                <input type='checkbox' name='cities' value={code} defaultChecked={true} className={`peer mb-1 sr-only ${styles['city-btn']}`} />
                <span className={textCls}>
                  {name}
                </span>
              </label>
            </li>
          ))
        }
      </ul>

      <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
        <TooltipTrigger className='block truncate'>
          <div className='cursor-help p-1 ml-0.5 hover:bg-slate-200/75 rounded self-stretch flex items-end' tabIndex={0}>
            <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
              <MenuIcon size={20} />
            </div>
          </div>
        </TooltipTrigger>
        <TooltipContentMenu className={tooltipClass('text-sm')}>
          <div className={tooltipMenuCls()} onClick={onPickPreset}>
            <CityPresetItem dataKey='六都'>六都</CityPresetItem>
            <CityPresetItem dataKey='北北基桃'>北北基桃</CityPresetItem>
            <CityPresetItem dataKey='中臺灣'>中臺灣</CityPresetItem>
            <CityPresetItem dataKey='南臺灣'>南臺灣</CityPresetItem>
            <CityPresetItem dataKey='宜花東'>宜花東</CityPresetItem>
            <CityPresetItem dataKey='外島'>外島</CityPresetItem>
            <CityPresetItem dataKey='all' iconClass='opacity-50'>全選／不選</CityPresetItem>
          </div>
        </TooltipContentMenu>
      </Tooltip>
    </div>
  );
}
