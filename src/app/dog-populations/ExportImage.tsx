import { useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';
import ReactEChartsCore from 'echarts-for-react/lib/core';
import { tooltipClass } from './utils';

import {
  ImageDownIcon,
} from "lucide-react";

export default function ExportImage({ chartRef }: {
  chartRef: React.RefObject<ReactEChartsCore | null>,
}) {
  const onExportImage = useCallback(() => {
    const chart = chartRef.current?.getEchartsInstance();
    if (!chart) return;

    const base64Img = chart.getDataURL({ pixelRatio: 2, backgroundColor: 'white' });
    fetch(base64Img).then(res => res.blob()).then(blob => {
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = '遊蕩犬隻估計數量.png';
      document.body.appendChild(link);
      link.click();

      URL.revokeObjectURL(blobUrl);
      document.body.removeChild(link);
    }).catch(console.error);
  }, [chartRef]);

  return (
    <Tooltip placement='top' offset={3}>
      <TooltipTrigger>
        <button type='button' onClick={onExportImage} className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <ImageDownIcon size={20} />
          <span className='sr-only'>下載圖片</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className={tooltipClass('p-2 drop-shadow-md')}>
        下載圖片
      </TooltipContent>
    </Tooltip>
  );
}
