import * as R from 'ramda';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { offenceTypeMapping, offenceTypeKeys, workforceTypeMapping, workforceTypeKeys } from '@/lib/model';
import { seriesChecksAtom } from './store';
import { CheckboxMenuItem } from '@/components/CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from '@/lib/utils';

import WhistleIcon from '@/assets/whistle.svg';
import {
  SigmaIcon,
  UsersIcon,
  HouseIcon,
  SkullIcon,
  SyringeIcon,
  DogIcon,
  HousePlusIcon,
  HouseWifiIcon,
  PawPrintIcon,
  HandCoinsIcon,
  SpeechIcon,
  FootprintsIcon,
  Grid2x2Icon,
  Grid2x2XIcon,
  TruckIcon,
  BabyIcon,
  BanIcon,
  HammerIcon,
  PersonStandingIcon,
  Clock2Icon,
} from "lucide-react";

export function SeriesControl() {
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
      shelter: makeFn(['accept', 'adopt', 'kill', 'die', 'miss', 'room', 'occupy', 'occupy100', 'infant', 'seized', 'return',]),
      heatMap: makeFn(['h_visit', 'h_roam', 'h_feed', 'h_stop']),
      enforcement: makeFn(offenceTypeKeys),
      enforcement0: makeFn(offenceTypeKeys.filter(k => k.endsWith(':0'))),
      enforcement1: makeFn(offenceTypeKeys.filter(k => k.endsWith(':1'))),
      workforce: makeFn(workforceTypeKeys),
      workforceFt: makeFn(workforceTypeKeys.filter(k => k.startsWith('ft_'))),
      workforcePt: makeFn(workforceTypeKeys.filter(k => k.startsWith('pt_'))),
    };
  }, [seriesSet, setSeriesSet]);

  const SeriesMenuItem = useMemo(() => CheckboxMenuItem(seriesChecksAtom, 'series'), []);

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center justify-around gap-2 flex-wrap max-w-[26rem]'>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps} role='menu'>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  狗口
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
              <div className={tooltipMenuCls()}>
                <SeriesMenuItem Icon={SigmaIcon} name='roaming'>遊蕩犬估計</SeriesMenuItem>
                <SeriesMenuItem Icon={UsersIcon} name='human'>人口數</SeriesMenuItem>
                <SeriesMenuItem sub name='human100'>每百人遊蕩犬數</SeriesMenuItem>
                <SeriesMenuItem Icon={HouseIcon} name='domestic'>家犬估計數</SeriesMenuItem>
                <SeriesMenuItem sub onClick={toggles.population}>全選／不選</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps} role='menu'>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  收容所
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
              <div className={tooltipMenuCls()}>
                <SeriesMenuItem Icon={HousePlusIcon} name='accept'>收容隻數</SeriesMenuItem>
                <SeriesMenuItem Icon={DogIcon} name='adopt'>認領隻數</SeriesMenuItem>
                <SeriesMenuItem Icon={SyringeIcon} name='kill'>人道處理數</SeriesMenuItem>
                <SeriesMenuItem Icon={SkullIcon} name='die'>所內死亡數</SeriesMenuItem>
                <SeriesMenuItem Icon={FootprintsIcon} name='miss'>逃脫等</SeriesMenuItem>
                <SeriesMenuItem Icon={Grid2x2Icon} name='room'>可收容量</SeriesMenuItem>
                <SeriesMenuItem Icon={Grid2x2XIcon} name='occupy'>在養數</SeriesMenuItem>
                <SeriesMenuItem sub name='occupy100'>收容壓力</SeriesMenuItem>
                <SeriesMenuItem Icon={BabyIcon} name='infant'>幼齡入所</SeriesMenuItem>
                <SeriesMenuItem Icon={BanIcon} name='seized'>依法沒入</SeriesMenuItem>
                <SeriesMenuItem Icon={TruckIcon} name='return'>回置</SeriesMenuItem>
                <SeriesMenuItem sub onClick={toggles.shelter}>全選／不選</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps} role='menu'>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  熱區
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
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
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps} role='menu'>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  執法
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
              <div className={tooltipMenuCls()}>
                {
                  Object.entries(offenceTypeMapping).map(([, name]) => {
                    return (
                      <div className='grid grid-cols-2 w-full' key={name}>
                        <SeriesMenuItem Icon={WhistleIcon} iconClass='opacity-60' name={`${name}:0`}>
                          {name}：檢舉
                        </SeriesMenuItem>
                        <SeriesMenuItem Icon={HammerIcon} iconClass='opacity-60' name={`${name}:1`}>
                          {name}：裁罰
                        </SeriesMenuItem>
                      </div>
                    );
                  })
                }
                <div className='grid grid-cols-2 w-full'>
                  <SeriesMenuItem sub onClick={toggles.enforcement0}>所有檢舉</SeriesMenuItem>
                  <SeriesMenuItem sub onClick={toggles.enforcement1}>所有裁罰</SeriesMenuItem>
                </div>
                <SeriesMenuItem sub onClick={toggles.enforcement}>全選／不選</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>

        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps} role='menu'>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  人力
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm drop-shadow-md')}>
              <div className={tooltipMenuCls()}>
                {
                  Object.entries(workforceTypeMapping).map(([key, name]) => {
                    return (
                      <div className='grid grid-cols-2 w-full' key={key}>
                        <SeriesMenuItem Icon={PersonStandingIcon} iconClass='opacity-60' name={`ft_${key}`}>
                          {name}
                        </SeriesMenuItem>
                        <SeriesMenuItem Icon={Clock2Icon} iconClass='opacity-50' name={`pt_${key}`}>
                          兼職
                        </SeriesMenuItem>
                      </div>
                    );
                  })
                }
                <div className='grid grid-cols-2 w-full'>
                  <SeriesMenuItem sub onClick={toggles.workforceFt}>所有專任</SeriesMenuItem>
                  <SeriesMenuItem sub onClick={toggles.workforcePt}>所有兼職</SeriesMenuItem>
                </div>
                <SeriesMenuItem sub onClick={toggles.workforce}>全選／不選</SeriesMenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>

      <input type='hidden' name='seriesSet' value={JSON.stringify(seriesSet)} />
    </div>
  );
}
