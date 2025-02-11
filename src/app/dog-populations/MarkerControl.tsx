import * as R from 'ramda';
import { useMemo } from 'react';
import { useAtom } from 'jotai';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { markerMenuAtom } from './store';
import { CheckboxMenuItem } from './CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from './chart';

import {
  TrendingDownIcon,
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
      gov: makeFn(['垃圾不落地', '零撲殺公告', '零撲殺施行']),
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
                  政府
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <MenuItem Icon={TrashTruckIcon} name='垃圾不落地'>垃圾不落地</MenuItem>
                <MenuItem Icon={TrendingDownIcon} name='零撲殺公告'>零撲殺公布</MenuItem>
                <MenuItem Icon={TrendingDownIcon} name='零撲殺施行'>零撲殺正式施行</MenuItem>
                <MenuItem sub onClick={toggles.gov}>全選／不選</MenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>

      <input type='hidden' name='markerSet' value={JSON.stringify(markerSet)} />
    </div>
  );
}
