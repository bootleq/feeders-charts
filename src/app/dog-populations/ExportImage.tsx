import { useCallback } from 'react';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';
import ReactEChartsCore from 'echarts-for-react/lib/core';

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
    <Tooltip placement='bottom' offset={3}>
      <TooltipTrigger>
        <button type='button' onClick={onExportImage} className='p-2 rounded opacity-50 hover:opacity-100 hover:bg-amber-200 transition duration-[50ms] hover:scale-110 hover:drop-shadow active:scale-100'>
          <ImageDownIcon size={20} />
          <span className='sr-only'>下載圖片</span>
        </button>
      </TooltipTrigger>
      <TooltipContent className='px-2 py-1 rounded box-border text-sm leading-relaxed w-fit max-w-[20vw] z-[1002] bg-neutral-50 drop-shadow-xl'>
        下載圖片
      </TooltipContent>
    </Tooltip>
  );
}
