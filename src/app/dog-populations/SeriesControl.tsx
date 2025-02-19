import * as R from 'ramda';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { seriesChecksAtom } from './store';
import { CheckboxMenuItem } from '@/components/CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from '@/lib/utils';

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
    };
  }, [seriesSet, setSeriesSet]);

  const SeriesMenuItem = useMemo(() => CheckboxMenuItem(seriesChecksAtom, 'series'), []);

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
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  公立收容所
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
                <SeriesMenuItem Icon={BabyIcon} name='infant'>幼犬入所</SeriesMenuItem>
                <SeriesMenuItem Icon={BanIcon} name='seized'>依法沒入</SeriesMenuItem>
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
      </ul>

      <input type='hidden' name='seriesSet' value={JSON.stringify(seriesSet)} />
    </div>
  );
}
