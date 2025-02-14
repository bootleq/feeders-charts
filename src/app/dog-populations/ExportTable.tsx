import * as R from 'ramda';
import { useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';
import { useSetAtom } from 'jotai';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { tooltipClass} from './utils';
import { tableAtom, tableDialogOpenAtom } from './store';
import { escapeHTML } from '@/lib/utils';

import {
  TableIcon,
} from "lucide-react";

type SeriesEntry = {
  name: string,
  data: Array<number|null> | null,
};

type XAxis = {
  data: number[],
};

type ChartOptionPart = {
  series: SeriesEntry[],
  xAxis: Array<XAxis>,
};

const seriesToRows = ({ series, xAxis }: ChartOptionPart) => {
  const years: number[] = xAxis[0].data;
  const columns = series.filter(({ data }) => {
    return R.type(data) === 'Array';
  }).map(({ name, data }) => {
    return [name, ...(data as number[])];
  });

  return R.transpose([
    ['年度', ...years],
    ...columns,
  ]);
};

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

export default function ExportTable({ chartRef }: {
  chartRef: React.RefObject<ReactEChartsCore | null>,
}) {
  const setTableHTML = useSetAtom(tableAtom);
  const setDialogOpened = useSetAtom(tableDialogOpenAtom);

  const onBuildTable = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const options = chart.getOption();
    const rows = seriesToRows(options as ChartOptionPart);
    const html = buildHTML(rows);
    setTableHTML(html);
    setDialogOpened(true);
  }, [chartRef, setTableHTML, setDialogOpened]);

  return (
    <Tooltip placement='top' offset={3}>
      <TooltipTrigger>
        <button type='button' onClick={onBuildTable} className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <TableIcon size={20} />
          <span className='sr-only'>製作表格</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className={tooltipClass('p-2 drop-shadow-md')}>
        製作表格
      </TooltipContent>
    </Tooltip>
  );
}
