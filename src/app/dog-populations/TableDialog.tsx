"use client"

import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Html from '@/components/Html';
import { escapeHTML } from '@/lib/utils';
import { tableAtom, tableDialogOpenAtom } from './store';
import styles from './page.module.scss';

import {
  XIcon,
} from "lucide-react";

const dialogCls = [
  'flex flex-col overscroll-y-contain',
  'min-w-[40vw] min-h-[20vh] rounded drop-shadow-md',
  'max-w-full lg:max-w-screen-lg xl:max-w-screen-xl',
  'bg-gradient-to-br from-stone-50 to-slate-200',
  'backdrop:bg-black/50 backdrop:backdrop-blur-[1px]',
].join(' ');

const buildHTML = (records: Array<string|number|null>[]) => {
  const [header, ...bodyRows] = records;
  return [
    '<table>',
    "<thead><tr>\n",
    header.map((h: any) => `<th>${escapeHTML(h)}</th>`).join(''),
    '</tr></thead>',
    '<tbody>',
    bodyRows.map(row => {
      return [
        "<tr>\n",
        row.map(cell => `<td>${cell ? escapeHTML(cell.toString()) : ''}</td>`).join(''),
        '</tr>',
      ].join('');
    }).join(''),
    '</tbody>',
    '</table>',
  ].join('');
}

export default function TableDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const tableData = useAtomValue(tableAtom);
  const [opened, setOpened] = useAtom(tableDialogOpenAtom);

  const onClose = () => {
    if (opened) {
      setOpened(false);
    }
    ref.current?.close();
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.target;
    if (el === ref.current) { // click outside the dialog
      onClose();
    }
  };

  useEffect(() => {
    if (opened) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [opened]);

  if (!tableData) {
    return;
  }

  const tableHTML = buildHTML(tableData);

  return (
    <dialog ref={ref} className={`${dialogCls}  ${opened ? '' : 'hidden'}`} onClose={onClose} onClick={onClick}>
      <div className='sticky top-0 flex items-center flex-wrap p-3 px-2 sm:px-5 gap-y-2 bg-gradient-to-br from-stone-50/80 to-slate-100/80'>
        <div className='leading-tight text-center text-lg font-bold sm:text-start sm:text-balance'>
          資料表格
        </div>


        <button className='btn p-px ml-auto rounded-full hover:scale-125 hover:drop-shadow' aria-label='關閉' onClick={onClose}>
          <XIcon className='stroke-slate-700 stroke-2' height={22} />
        </button>
      </div>

      <div ref={bodyRef} tabIndex={0} className={`px-2 sm:px-5 pb-6 mt-auto max-h-[80vh] overflow-auto focus-visible:outline-none text-sm ${styles['export-table']}`}>
        <Html html={tableHTML} className='w-fit' />
      </div>
    </dialog>
  );
}
