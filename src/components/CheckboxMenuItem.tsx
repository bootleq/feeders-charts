import * as R from 'ramda';
import { useMemo } from 'react';
import { atom, useAtom, PrimitiveAtom } from 'jotai';
import type { CheckboxSet } from '@/components/types';
import {
  CornerDownRightIcon,
} from "lucide-react";

import { MenuDescTooltip } from './MenuDescTooltip';

export const dummyMenuAtom = atom<CheckboxSet>({});

const checkboxMenuItemAtom = (boxsetAtom: PrimitiveAtom<CheckboxSet>, key: string) => atom(
  get => get(boxsetAtom)[key] ?? false,
  (get, set) => {
    set(boxsetAtom, R.over(R.lensProp(key), R.not));
  }
);

export function CheckboxMenuItem(boxsetAtom: PrimitiveAtom<CheckboxSet>, inputName: string) {
  return function MenuItem({ Icon, name, iconClass, children, sub, onClick }: {
    Icon?: any,
    name?: string,
    iconClass?: string,
    children: React.ReactNode,
    sub?: boolean,
    onClick?: React.MouseEventHandler,
  }) {
    const itemAtom = useMemo(() => checkboxMenuItemAtom(boxsetAtom, name || 'dummy'), [name]);
    const [checked, toggle] = useAtom(itemAtom);

    const menuBtnCls = 'p-2 w-full cursor-pointer flex items-center rounded hover:bg-amber-200';
    const menuIconCls = 'w-[1.25em] h-auto aspect-square box-content';
    const IconElement = Icon || (sub ? CornerDownRightIcon : 'div');

    return (
      <MenuDescTooltip name={name}>
        <label className={menuBtnCls}>
          <div className='pr-1.5 mr-1 border-r'>
            <IconElement className={`${menuIconCls} ${sub ? 'stroke-slate-400' : ''} ${iconClass || ''}`} />
          </div>
          {
            R.isNil(onClick) ?
              <input type='checkbox' name={inputName} checked={checked} onChange={toggle} className='peer mb-1 sr-only' /> :
              <input type='checkbox' onClick={onClick} defaultChecked className='peer mb-1 sr-only' />
          }
          <div className='text-slate-400 outline-blue-400 peer-checked:text-slate-700 peer-focus-visible:outline'>
            {children}
          </div>
        </label>
      </MenuDescTooltip>
    );
  };
}
