import * as R from 'ramda';
import { useCallback, useMemo } from 'react';
import { atom, useAtom, PrimitiveAtom, useSetAtom } from 'jotai';
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

const focusItemAtom = (boxsetAtom: PrimitiveAtom<CheckboxSet>) => atom(
  null,
  (get, set, key: string, menuValues: string[]) => {
    const obj = get(boxsetAtom);
    obj[key] = true;
    set(
      boxsetAtom, R.mapObjIndexed(
        (v, k) => k === key ? v : (menuValues.includes(k) ? false : v),
        obj
      )
    );
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

    const focusAtom = useMemo(() => focusItemAtom(boxsetAtom), []);
    const focus = useSetAtom(focusAtom);

    const onMiddleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
      if (e.button !== 1 || !name) return; // "middle" click only
      const $target = e.target as HTMLElement;
      const $menu = $target.closest('[role="menu"]');
      if ($menu) {
        e.preventDefault();
        const allValues = Array.from($menu.querySelectorAll('input[type="checkbox"][value]')).map(i => (i as HTMLInputElement).value);
        focus(name, allValues);
      }
    }, [focus, name]);

    const menuBtnCls = 'p-2 w-full cursor-pointer flex items-center rounded hover:bg-amber-200';
    const menuIconCls = 'w-[1.25em] h-auto aspect-square box-content';
    const IconElement = Icon || (sub ? CornerDownRightIcon : 'div');

    return (
      <MenuDescTooltip name={name}>
        <label className={menuBtnCls} onMouseDown={onMiddleClick}>
          <div className='pr-1.5 mr-1 border-r'>
            <IconElement className={`${menuIconCls} ${sub ? 'stroke-slate-400' : ''} ${iconClass || ''}`} />
          </div>
          {
            R.isNil(onClick) ?
              <input type='checkbox' name={inputName} checked={checked} onChange={toggle} className='peer mb-1 sr-only' {...(name ? {value: name} : {})} /> :
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
