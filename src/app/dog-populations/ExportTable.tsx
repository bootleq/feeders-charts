import * as R from 'ramda';
import { useCallback, useMemo } from 'react';
import { Tooltip, TooltipTrigger, TooltipContentMenu } from '@/components/Tooltip';
import { useSetAtom } from 'jotai';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { CheckboxMenuItem } from './CheckboxMenuItem';
import { tooltipClass, tooltipMenuCls } from './utils';

import { tableAtom, tableDialogOpenAtom, dummyMenuAtom } from './store';
import { escapeHTML } from '@/lib/utils';

import {
  TableIcon,
  ChartColumnBigIcon,
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

  const MenuItem = useMemo(() => CheckboxMenuItem(dummyMenuAtom, '_'), []);

  return (
    <Tooltip placement='top-end' offset={3}>
      <TooltipTrigger>
        <div className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <TableIcon size={20} tabIndex={0} />
          <span className='sr-only'>製作表格</span>
        </div>
      </TooltipTrigger>
      <TooltipContentMenu className={tooltipClass('text-sm')}>
        <div className={tooltipMenuCls()}>
          <div className='py-2 font-bold'>製作表格</div>
          <MenuItem Icon={ChartColumnBigIcon} name='toTable:chart' onClick={onBuildTable}>根據目前圖表</MenuItem>
        </div>
      </TooltipContentMenu>
    </Tooltip>
  );
}
