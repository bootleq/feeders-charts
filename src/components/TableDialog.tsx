"use client"

import * as R from 'ramda';
import { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import Html from '@/components/Html';
import { escapeHTML, makeDownload } from '@/lib/utils';
import type { TableRow, PrimitiveAtomWithInitial } from '@/components/types';

import styles from './table_dialog.module.scss';

import {
  XIcon,
  LassoSelectIcon,
  CopyIcon,
  CheckIcon,
  FoldHorizontalIcon,
  UnfoldHorizontalIcon,
} from "lucide-react";

const dialogCls = [
  'flex flex-col overscroll-y-contain',
  'min-w-[40vw] min-h-[20vh] rounded drop-shadow-md',
  'max-w-full lg:max-w-screen-lg xl:max-w-screen-xl',
  'bg-gradient-to-br from-stone-50 to-slate-200',
  'backdrop:bg-black/50 backdrop:backdrop-blur-[1px]',
].join(' ');

const buildCSV = (tableData: TableRow[]) =>
  tableData.map(row => {
    return row.map(cell => cell ? JSON.stringify(cell) : '').join(',');
  }).join("\n");

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

export default function TableDialog({ tableAtom, dialogOpenAtom }: {
  tableAtom: PrimitiveAtomWithInitial<TableRow[]>,
  dialogOpenAtom: PrimitiveAtomWithInitial<boolean>,
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const tableData = useAtomValue(tableAtom);
  const compactTable = useRef<TableRow[]>([]);
  const [opened, setOpened] = useAtom(dialogOpenAtom);
  const [showCompact, setShowCompact] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const onClose = () => {
    if (opened) {
      setOpened(false);
    }
    setShowCompact(false);
    compactTable.current = [];
    ref.current?.close();
  };

  const onClick = (e: React.MouseEvent<HTMLElement>) => {
    const el = e.target;
    if (el === ref.current) { // click outside the dialog
      onClose();
    }
  };

  const onToggleCompact = useCallback(() => {
    if (R.isEmpty(compactTable.current)) {
      compactTable.current = R.pipe(
        R.transpose,
        R.reject(([, ...cells]) => R.all(R.isNil, cells)),
        R.transpose,
      )(tableData);
    }
    setShowCompact(R.not);
  }, [tableData]);

  const onSelectAll = useCallback(() => {
    const table = bodyRef.current?.querySelector('table');
    if (!table) return;

    const range = document.createRange();
    range.selectNodeContents(table);
    const selection = window.getSelection();
    if (!selection) {
      console.error('無法操作選取範圍');
      return;
    }
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  const onCopyCSV = useCallback(() => {
    const source = showCompact ? compactTable.current : tableData;
    const csv = buildCSV(source);
    navigator.clipboard.writeText(csv).then(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 1300);
    });
  }, [tableData, showCompact]);

  const onDownloadCSV = useCallback(() => {
    const source = showCompact ? compactTable.current : tableData;
    const csv = buildCSV(source);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    makeDownload(url,  '遊蕩犬隻估計數量.csv');
  }, [tableData, showCompact]);

  const tableHTML = useMemo(() => {
    if (R.isNotEmpty(tableData)) {
      return showCompact ? buildHTML(compactTable.current) : buildHTML(tableData);
    }
  }, [showCompact, tableData]);

  useEffect(() => {
    if (opened) {
      ref.current?.showModal();
    } else {
      ref.current?.close();
    }
  }, [opened]);

  if (!tableHTML) {
    return;
  }

  const ToggleCompactIcon = showCompact ? FoldHorizontalIcon : UnfoldHorizontalIcon;
  const buttonCls = 'text-sm flex items-center p-1 px-2 rounded hover:text-slate-900 hover:bg-yellow-100 hover:drop-shadow';

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

      <div className='flex items-center justify-end mx-4 py-1 gap-x-2 text-slate-700'>
        <button type='button' className={buttonCls} onClick={onToggleCompact}>
          <ToggleCompactIcon className='stroke-current p-px opacity-60' height={22} />
          {showCompact ? '隱藏' : '展開'}空欄
        </button>

        <button type='button' className={buttonCls} onClick={onSelectAll}>
          <LassoSelectIcon className='stroke-current p-px opacity-60' height={22} />
          全選
        </button>

        <button type='button' className={`${buttonCls} relative`} onClick={onCopyCSV}>
          <CopyIcon className='stroke-current p-px' size={18} />
          複製 CSV
          { showTooltip &&
            <CheckIcon className='absolute -top-[1.6em] left-[1em] stroke-green-700 select-none animate-bounce' size={22} />
          }
        </button>

        <button type='button' className={buttonCls} onClick={onDownloadCSV}>
          <CopyIcon className='stroke-current p-px' size={18} />
          下載 CSV
        </button>
      </div>

      <div ref={bodyRef} tabIndex={0} className={`px-2 sm:px-5 pb-6 mt-auto max-h-[80vh] overflow-auto focus-visible:outline-none text-sm ${styles.table}`}>
        <Html html={tableHTML} className='w-fit' />
      </div>
    </dialog>
  );
}
