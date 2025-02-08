"use client"

import * as R from 'ramda';
import React, { MouseEventHandler } from 'react';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAtom } from 'jotai';

import { CITY_MAPPING, cityLookup } from '@/lib/model';
import type { CountryItem } from '@/lib/model';
import { makeYearRange } from '@/lib/utils';
import { makeSeries, SERIES_NAMES } from '@/lib/series';
import type { SeriesSet } from '@/lib/series';

import { seriesChecksAtom, seriesMenuItemAtom } from './store';

import { MenuDescTooltip } from './MenuDescTooltip';
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
  GrabIcon,
  CircleDollarSignIcon,
  CircleUserIcon,
  FootprintsIcon,
  Grid2x2Icon,
  Grid2x2XIcon,
  TruckIcon,
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

function CitiesInput({ formRef }: {
  formRef: React.RefObject<HTMLFormElement | null>,
}) {
  const textCls = [
    'pb-2 border-gray-400/0 border-b-4 text-slate-400',
    'peer-checked:text-slate-900 peer-checked:border-dotted peer-checked:border-stone-400',
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
                <input type='checkbox' name='cities' value={code} defaultChecked={true} className='peer mb-1 sr-only' />
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
                <YearPresetItem dataKey='all' iconClass='opacity-50'>全選／不選</YearPresetItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>
    </div>
  );
}

function SeriesMenuItem({ Icon, name, iconClass, children, sub, onClick }: {
  Icon?: any,
  name?: string,
  iconClass?: string,
  children: React.ReactNode,
  sub?: boolean,
  onClick?: MouseEventHandler,
}) {
  const itemAtom = useMemo(() => seriesMenuItemAtom(name || 'dummy'), [name]);
  const [checked, toggle] = useAtom(itemAtom);

  const menuBtnCls = 'p-2 w-full cursor-pointer flex items-center rounded hover:bg-amber-200';
  const menuIconCls = 'w-[1.25em] aspect-square box-content';
  const IconElement = Icon || (sub ? CornerDownRightIcon : 'div');

  return (
    <MenuDescTooltip name={name}>
      <label className={menuBtnCls}>
        <div className='pr-1.5 mr-1 border-r'>
          <IconElement className={`${menuIconCls} ${sub ? 'stroke-slate-400' : ''} ${iconClass || ''}`} />
        </div>
        {
          R.isNil(onClick) ?
            <input type='checkbox' name='series' checked={checked} onChange={toggle} className='peer mb-1 sr-only' /> :
            <input type='checkbox' onClick={onClick} defaultChecked className='peer mb-1 sr-only' />
        }
        <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
          {children}
        </div>
      </label>
    </MenuDescTooltip>
  );
}

function SeriesControl() {
  const [seriesSet, setSeriesSet] = useAtom(seriesChecksAtom);

  const toggles = useMemo(() => {
    const makeFn = (keys: string[]) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        const checked = !!seriesSet[keys[0]];
        setSeriesSet(R.mergeLeft(
          R.fromPairs(keys.map(k => [k, !checked]))
        ));
      };
    };
    return {
      population: makeFn(['roaming', 'domestic', 'human', 'human100']),
      shelter: makeFn(['accept', 'adopt', 'kill', 'die']),
      heatMap: makeFn(['h_visit', 'h_roam', 'h_feed', 'h_stop']),
    };
  }, [seriesSet, setSeriesSet]);

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
                <SeriesMenuItem sub onClick={toggles.population}>全選／不選</SeriesMenuItem>
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
                <SeriesMenuItem Icon={FootprintsIcon} name='miss'>逃脫等</SeriesMenuItem>
                <SeriesMenuItem Icon={Grid2x2Icon} name='room'>可收容量</SeriesMenuItem>
                <SeriesMenuItem Icon={Grid2x2XIcon} name='occupy'>在養數</SeriesMenuItem>
                <SeriesMenuItem Icon={TruckIcon} name='return'>回置</SeriesMenuItem>
                <SeriesMenuItem sub onClick={toggles.shelter}>全選／不選</SeriesMenuItem>
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
                <SeriesMenuItem Icon={HandCoinsIcon} name='h_feed' iconClass='rotate-[200deg]'>餵食者人數</SeriesMenuItem>
                <SeriesMenuItem Icon={SpeechIcon} name='h_stop'>疏導餵食成功數</SeriesMenuItem>
                <SeriesMenuItem sub onClick={toggles.heatMap}>全選／不選</SeriesMenuItem>
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
