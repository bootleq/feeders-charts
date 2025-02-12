import * as R from 'ramda';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { markerMenuAtom } from './store';
import { CheckboxMenuItem } from './CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from './chart';

import {
  DotIcon,
  EqualNotIcon,
  IdCardIcon,
  LocateFixedIcon,
  MicIcon,
  NetworkIcon,
  PawPrintIcon,
  ScaleIcon,
  SliceIcon,
  TrendingDownIcon,
  TruckIcon,
  UserIcon,
} from "lucide-react";
import TrashTruckIcon from '@/assets/truck-trash.svg';

export function MarkerControl() {
  const [markerSet, setMarkerSet] = useAtom(markerMenuAtom);

  const toggles = useMemo(() => {
    const makeFn = (keys: string[]) => {
      return (e: React.MouseEvent) => {
        e.preventDefault();
        const checked = !!markerSet[keys[0]];
        setMarkerSet(R.mergeLeft(
          R.fromPairs(keys.map(k => [k, !checked]))
        ));
      };
    };
    return {
      govCentral: makeFn([
        '垃圾不落地',
        '統計方式大改',
        '零撲殺公告',
        '零撲殺施行',
        '動保法第 6 次修法',
        '動保法第 7 次修法',
        '動保法第 9 次修法',
        '動保法第 11 次修法',
        '遊蕩犬管控精進策略',
        '生態熱區',
        '動保司成立',
      ]),
      govLocal: makeFn([
        '台南零安樂',
        '台南工作犬',
        '新北餵養講習',
        '台南餵養講習',
      ]),
      org: makeFn([
        '悲傷 326 記者會',
        '相信動物台北',
        '相信動物新北',
        '相信動物基隆',
        '相信動物桃園',
        '相信動物新竹',
        '動團安樂死聲明',
      ]),
      event: makeFn([
        '民雄收容所運送事件',
        '簡稚澄事件',
        '壽山流浪狗倍增',
      ]),
    };
  }, [markerSet, setMarkerSet]);

  const MenuItem = useMemo(() => CheckboxMenuItem(markerMenuAtom, 'marker'), []);

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center justify-around gap-2 flex-wrap max-w-[26rem]'>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  中央
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <MenuItem Icon={TrashTruckIcon} name='垃圾不落地'>垃圾不落地</MenuItem>
                <MenuItem Icon={EqualNotIcon} name='統計方式大改'>遊蕩犬統計方式大改</MenuItem>

                <MenuItem Icon={TrendingDownIcon} name='零撲殺公告'>零撲殺公布</MenuItem>
                <MenuItem Icon={TrendingDownIcon} name='零撲殺施行'>零撲殺正式施行</MenuItem>

                <MenuItem Icon={ScaleIcon} name='動保法第 6 次修法'>動保法第 6 次修法</MenuItem>
                <MenuItem sub name='動保法第 7 次修法'>動保法第 7 次修法</MenuItem>
                <MenuItem sub name='動保法第 9 次修法'>動保法第 9 次修法</MenuItem>
                <MenuItem sub name='動保法第 11 次修法'>動保法第 11 次修法</MenuItem>

                <MenuItem Icon={LocateFixedIcon} name='遊蕩犬管控精進策略'>遊蕩犬管控精進策略</MenuItem>
                <MenuItem sub name='生態熱區'>生態熱區</MenuItem>
                <MenuItem Icon={NetworkIcon} name='動保司成立'>農業部動保司成立</MenuItem>
                <MenuItem sub onClick={toggles.govCentral}>全選／不選</MenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  地方政府
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <MenuItem Icon={IdCardIcon} name='新北餵養講習'>新北市乾淨餵養講習</MenuItem>
                <MenuItem sub name='台南餵養講習'>台南市乾淨餵養講習</MenuItem>
                <MenuItem Icon={DotIcon} name='台南零安樂'>台南率先施行零安樂</MenuItem>
                <MenuItem sub name='台南工作犬'>台南工作犬</MenuItem>
                <MenuItem sub onClick={toggles.govLocal}>全選／不選</MenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  民間團體
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <MenuItem Icon={MicIcon} name='悲傷 326 記者會'>動社「悲傷326」記者會</MenuItem>
                <MenuItem Icon={SliceIcon} name='相信動物台北'>相信動物 台北市</MenuItem>
                <MenuItem sub name='相信動物新北'>相信動物 新北市</MenuItem>
                <MenuItem sub name='相信動物基隆'>相信動物 基隆市</MenuItem>
                <MenuItem sub name='相信動物桃園'>相信動物 桃園市</MenuItem>
                <MenuItem sub name='相信動物新竹'>相信動物 新竹縣市</MenuItem>
                <MenuItem Icon={MicIcon} name='動團安樂死聲明'>動團聲明落實安樂死</MenuItem>
                <MenuItem sub onClick={toggles.org}>全選／不選</MenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  傷害
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <MenuItem Icon={TruckIcon} name='民雄收容所運送事件'>民雄收容所運送事件</MenuItem>
                <MenuItem Icon={UserIcon} name='簡稚澄事件'>簡稚澄事件</MenuItem>
                <MenuItem Icon={PawPrintIcon} name='壽山流浪狗倍增'>壽山流浪狗倍增</MenuItem>
                <MenuItem sub onClick={toggles.event}>全選／不選</MenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>

      <input type='hidden' name='markerSet' value={JSON.stringify(markerSet)} />
    </div>
  );
}
