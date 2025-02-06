"use client"

import * as R from 'ramda';
import React from 'react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';

import { CITY_MAPPING } from '@/lib/model';
import type { CountryItem } from '@/lib/model';
import { makeYearRange } from '@/lib/utils';
import { makeSeries, SERIES_NAMES } from '@/lib/series';
import type { SeriesSet } from '@/lib/series';

import { seriesChecksAtom, seriesMenuItemAtom } from './store';

import { defaultOptions } from './defaults';

import ReactEChartsCore from 'echarts-for-react/lib/core';
import * as echarts from 'echarts/core';
import {
  LineChart,
  BarChart,
} from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent,
  LegendPlainComponent,
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

import { Tooltip, TooltipTrigger, TooltipContent, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';

import {
  MenuIcon,
  ScaleIcon,
  CornerDownLeftIcon,
  UsersIcon,
  HouseIcon,
  CornerDownRightIcon,
  SkullIcon,
  SyringeIcon,
  DogIcon,
  HousePlusIcon,
  HouseWifiIcon,
  PawPrintIcon,
  HandCoinsIcon,
  SpeechIcon,
} from "lucide-react";
import Years04Icon from '@/assets/year-set-04.svg';
import Years14Icon from '@/assets/year-set-14.svg';

echarts.use(
  [
    GridComponent,
    TooltipComponent,
    TitleComponent,
    LegendComponent,
    LegendPlainComponent,
    BarChart,
    LineChart,
    CanvasRenderer,
  ]
);

function tooltipClass(className?: string) {
  return `rounded box-border w-max z-[1002] bg-slate-100 ${className || ''}`;
}
function tooltipMenuCls(className?: string) {
  return [
    'flex flex-col divide-y w-full items-center justify-between',
    'rounded bg-gradient-to-br from-stone-50 to-slate-100 ring-2 ring-offset-1 ring-slate-300',
    className || '',
  ].join(' ');
}

function CitiesInput({ formRef }: {
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const textCls = [
    'pb-2 border-gray-400/0 border-b-4 text-slate-400',
    'peer-checked:text-slate-900 peer-checked:border-dotted peer-checked:border-stone-400',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  const onToggleAll = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const form = formRef.current;
    if (!form) return;

    const toChecked = e.currentTarget.checked;
    const boxes = form.querySelectorAll<HTMLInputElement>('input[name="cities"]');
    boxes.forEach(box => box.checked = toChecked);
  }, [formRef]);

  return (
    <div className='flex items-center pb-0.5'>
      <label className='cursor-pointer px-1 hover:bg-slate-200/75 rounded self-stretch flex items-center'>
        <input type='checkbox' defaultChecked={true} className='peer sr-only' onClick={onToggleAll} />
        <div className='writing-vertical tracking-[6px] pt-px pb-1.5 text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
          全選
        </div>
      </label>
      <ul className='flex flex-wrap items-center -translate-y-1'>
        {
          Object.entries(CITY_MAPPING).map(([code, name]) => (
            <li key={code} className='writing-vertical relative'>
              <label className='cursor-pointer px-1 py-2 block rounded transition hover:bg-amber-200 hover:-translate-y-1 hover:drop-shadow'>
                <input type='checkbox' name='cities' value={code} defaultChecked={true} className='peer mb-1 sr-only' />
                <span className={textCls}>
                  {name}
                </span>
              </label>
            </li>
          ))
        }
      </ul>
    </div>
  );
}

const YearPresets: Record<string, [any, (value: number) => boolean]> = {
  '2004': [Years04Icon, R.lte(93)],
  '2014': [Years14Icon, R.lte(103)],
  'post12': [ScaleIcon, R.lte(106)],
};

function YearPresetItem({ dataKey, children }: {
  dataKey: string,
  children: React.ReactNode,
}) {
  const Icon = YearPresets[dataKey]?.[0];

  return (
    <button className='p-2 w-full flex items-center rounded hover:bg-amber-200' data-preset={dataKey}>
      {Icon && <Icon className='w-[1.25em] aspect-square box-content pr-1.5 mr-1 border-r ' />}
      {children}
    </button>
  );
}

function YearsInput({ min, max, formRef }: {
  min: number,
  max: number,
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const [handle, setHandle] = useState<number | null>();
  const yearRange = makeYearRange(min, max);
  const textCls = [
    'font-mono text-stone-400',
    'pb-px border-b [border-image-slice:1]',
    'peer-checked:text-slate-900 peer-checked:border-solid',
    'peer-checked:[border-image-source:linear-gradient(to_right,transparent_30%,#888_30%,#888_70%,transparent_70%)]',
    'peer-focus-visible:outline outline-offset-2 outline-blue-400',
  ].join(' ');

  const onToggleAll = useCallback((e: React.MouseEvent<HTMLInputElement>) => {
    const form = formRef.current;
    if (!form) return;

    setHandle(null);

    const toChecked = e.currentTarget.checked;
    const boxes = form.querySelectorAll<HTMLInputElement>('input[name="years"]');
    boxes.forEach(box => box.checked = toChecked);
  }, [formRef]);

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
        boxes.forEach(box => {
          box.checked = cb(Number(box.value));
        });

        form.dispatchEvent(
          new Event("submit", { bubbles: true, cancelable: true })
        );
      }
    }
  }, [formRef]);

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center justify-around flex-wrap max-w-[26rem]'>
        <li>
          <label className='cursor-pointer px-1 py-2 hover:bg-slate-200/75 rounded self-stretch flex items-center'>
            <input type='checkbox' defaultChecked={true} className='peer sr-only' onClick={onToggleAll} />
            <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
              ALL
            </div>
          </label>
        </li>
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
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-1 pt-2 hover:bg-slate-200/75 rounded self-stretch flex items-center' tabIndex={0}>
                <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  <MenuIcon size={20} />
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()} onClick={onPickPreset}>
                <YearPresetItem dataKey='2004'>從 <code className='mx-1'>2004</code> 開始</YearPresetItem>
                <YearPresetItem dataKey='2014'>從 <code className='mx-1'>2014</code> 開始</YearPresetItem>
                <YearPresetItem dataKey='post12'>零撲殺後</YearPresetItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>
    </div>
  );
}

function SeriesMenuItem({ Icon, name, children, sub }: {
  Icon?: any,
  name: string,
  children: React.ReactNode,
  sub?: boolean,
}) {
  const itemAtom = useMemo(() => seriesMenuItemAtom(name), [name]);
  const [checked, toggle] = useAtom(itemAtom);

  const menuBtnCls = 'p-2 w-full cursor-pointer flex items-center rounded hover:bg-amber-200';
  const menuIconCls = 'w-[1.25em] aspect-square box-content pr-1.5 mr-1 border-r';
  const IconElement = Icon || (sub ? CornerDownRightIcon : 'div');

  return (
    <label className={menuBtnCls}>
      <IconElement className={`${menuIconCls} ${sub && 'stroke-slate-400'}`} />
      <input type='checkbox' name='series' checked={checked} onChange={toggle} className='peer mb-1 sr-only' />
      <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
        {children}
      </div>
    </label>
  );
}

function SeriesControl() {
  const seriesSet = useAtomValue(seriesChecksAtom);

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center justify-around gap-2 flex-wrap max-w-[26rem]'>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  人口與家犬
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <SeriesMenuItem Icon={UsersIcon} name='human'>人口數</SeriesMenuItem>
                <SeriesMenuItem sub name='human100'>每百人遊蕩犬數</SeriesMenuItem>
                <SeriesMenuItem Icon={HouseIcon} name='domestic'>家犬估計數</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  公立收容所
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <SeriesMenuItem Icon={HousePlusIcon} name='accept'>收容隻數</SeriesMenuItem>
                <SeriesMenuItem Icon={DogIcon} name='adopt'>認領隻數</SeriesMenuItem>
                <SeriesMenuItem Icon={SyringeIcon} name='kill'>人道處理數</SeriesMenuItem>
                <SeriesMenuItem Icon={SkullIcon} name='die'>所內死亡數</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  熱區政策
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <SeriesMenuItem Icon={HouseWifiIcon} name='h_visit'>有主犬 家訪戶數</SeriesMenuItem>
                <SeriesMenuItem Icon={PawPrintIcon} name='h_roam'>無主犬 清查隻數</SeriesMenuItem>
                <SeriesMenuItem Icon={HandCoinsIcon} name='h_feed'>餵食者人數</SeriesMenuItem>
                <SeriesMenuItem Icon={SpeechIcon} name='h_stop'>疏導餵食成功數</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>

      <input type='hidden' name='seriesSet' value={JSON.stringify(seriesSet)} />
    </div>
  );
}

export default function Chart({ items, meta }: {
  items: CountryItem[],
  meta: {
    minYear: number,
    maxYear: number,
  },
}) {
  const chartRef = useRef<ReactEChartsCore>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const updateYearAxis = useCallback((minYear: number, maxYear: number) => {
    const yearsRange = makeYearRange(minYear, maxYear);

    return R.pipe(
      R.set(
        R.lensPath(['xAxis', 0, 'data']),
        yearsRange
      ),
      R.set(
        R.lensPath(['xAxis', 1, 'data']),
        yearsRange.map(y => y + 1911)
      ),
    );
  }, []);

  const updateLegends = useCallback((seriesSet: SeriesSet) => {
    return R.set(
      R.lensPath(['legend', 'data']),
      Object.keys(R.pickBy(R.identity, seriesSet)).map(name => SERIES_NAMES[name])
    );
  }, []);

  useEffect(() => {
    formRef.current?.dispatchEvent(
      new Event("submit", { bubbles: true, cancelable: true })
    );
  }, []);

  const onApply = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const form = formRef.current;
    if (!form) return;

    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const formData = new FormData(form);
    const seriesString = formData.get('seriesSet')?.toString() || '';
    const seriesSet = JSON.parse(seriesString) as SeriesSet;
    let cities = formData.getAll('cities').map(String);
    let years = formData.getAll('years').map(Number);

    if (!seriesSet || R.type(seriesSet) !== 'Object') {
      console.error('Unexpected seriesSet value');
      return;
    }

    // When select all items, treat as no filters
    if (cities.length === Object.keys(CITY_MAPPING).length) {
      cities = [];
    }
    if (years.length === meta.maxYear - meta.minYear + 1) {
      years = [];
    }

    let newOptions = {
      series: makeSeries(items, meta, seriesSet, { cities, years })
    };

    const minYear = years.length ? years[0] : meta.minYear;
    const maxYear = years.length ? years[years.length - 1] : meta.maxYear;

    newOptions = R.pipe(
      updateYearAxis(minYear, maxYear),
      updateLegends(seriesSet),
    )(newOptions);

    chart.setOption(newOptions);
  }, [items, meta, updateYearAxis, updateLegends]);

  return (
    <div className='min-w-lg min-h-80 w-full'>
      <form ref={formRef} onSubmit={onApply} className='flex flex-wrap items-start justify-center gap-x-4 gap-y-3 my-1 mx-auto max-w-[96vw] text-sm'>
        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>縣市</legend>

          <CitiesInput formRef={formRef} />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>年度</legend>
          <YearsInput min={meta.minYear} max={meta.maxYear} formRef={formRef} />
        </fieldset>

        <fieldset className='flex items-center border-2 border-transparent hover:border-slate-400 rounded p-2'>
          <legend className='font-bold px-1.5'>資料項目</legend>
          <SeriesControl />
        </fieldset>

        <button type='submit' className='self-center p-3 pb-4 rounded hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <CornerDownLeftIcon size={20} className='pl-1 pb-1' />
          套用
        </button>
      </form>

      <ReactEChartsCore
        ref={chartRef}
        echarts={echarts}
        option={defaultOptions}
        lazyUpdate={true}
        style={{ height: '70vh', minHeight: '600px' }}
        className='mt-8 px-4 py-6 bg-white resize overflow-auto'
      />
    </div>
  );
}
