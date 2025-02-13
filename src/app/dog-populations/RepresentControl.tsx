import { useMemo } from 'react';
import { useAtomValue } from 'jotai';
import { Tooltip, TooltipTrigger, TooltipContentMenu, menuHoverProps } from '@/components/Tooltip';
import { representMenuAtom } from './store';
import { CheckboxMenuItem } from './CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from './utils';

import Dot44Icon from '@/assets/dot-label-44.svg';
import {
  ChartColumnBigIcon,
} from "lucide-react";

export function RepresentControl() {
  const checkboxSet = useAtomValue(representMenuAtom);

  const MenuItem = useMemo(() => CheckboxMenuItem(representMenuAtom, 'represent'), []);

  const roamingChartType = checkboxSet['roaming_chart_bar'] ? '長條圖' : '折線圖';

  return (
    <div className='flex flex-wrap items-center pb-0.5'>
      <ul className='flex items-center justify-around gap-2 flex-wrap max-w-[26rem]'>
        <li>
          <Tooltip placement='bottom-end' offset={0} hoverProps={menuHoverProps}>
            <TooltipTrigger className='mb-1 block truncate'>
              <div className='cursor-help p-2 hover:bg-slate-100/75 hover:drop-shadow rounded self-stretch flex items-center' tabIndex={0}>
                <div className='outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
                  雜項
                </div>
              </div>
            </TooltipTrigger>
            <TooltipContentMenu className={tooltipClass('text-sm')}>
              <div className={tooltipMenuCls()}>
                <MenuItem Icon={ChartColumnBigIcon} name='roaming_chart_bar'><span className='text-stone-700'>遊蕩犬估計</span> <strong className='text-slate-900'>{roamingChartType}</strong></MenuItem>
                <MenuItem Icon={Dot44Icon} name='show_all_labels'>直接顯示數字</MenuItem>
              </div>
            </TooltipContentMenu>
          </Tooltip>
        </li>
      </ul>

      <input type='hidden' name='representSet' value={JSON.stringify(checkboxSet)} />
    </div>
  );
}

