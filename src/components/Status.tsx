"use client"

import * as R from 'ramda';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/Tooltip';
import { jsonMetaReviver } from '@/lib/resource';
import type { ResourceEntry } from '@/lib/resource';
import { formatDate, BASE_PATH } from '@/lib/utils';
import Spinner from '@/assets/spinner.svg';
import commonStyles from '@/app/common.module.scss';
import Now from './Now';
import {
  ExternalLinkIcon,
  InfoIcon,
} from "lucide-react";

function transform(meta: any) {
  const { combined, ...rc } = meta;
  let rcList = R.toPairs(rc);
  rcList = rcList.map(([name, obj]) => {
    return [name, obj.sourceCheckedAt];
  });

  return {
    combined: combined['builtAt'],
    sources: rcList,
  };
}

type MetaScope = '' | 'tainan';

type Data = {
  combined: Date,
  sources: [string, any][],
};

export default function Status({ scope, resources }: {
  scope: MetaScope,
  resources: Record<string, ResourceEntry>,
}) {
  const [data, setData] = useState<Data|null>(null);

  useEffect(() => {
    if (!['', 'tainan'].includes(scope)) {
      throw new Error(`Unexpected scope '${scope}'`);
    }

    fetch(`${BASE_PATH}/${scope ? `${scope}.` : ''}meta.json`)
      .then((res) => res.text())
      .then((text) => JSON.parse(text, jsonMetaReviver))
      .then(data => setData(transform(data)));
  }, [scope]);

  if (!data) {
    return (
      <div className='flex items-center gap-x-8'>
        <Spinner className={`scale-[2] transition-opacity opacity-0 ${commonStyles.spinner}`} width={24} height={24} aria-label='讀取中' />
        <p className='text-3xl text-slate-700'>
          載入中
        </p>
      </div>
    );
  }

  const { combined, sources } = data;
  const rowCls = 'grid sm:grid-cols-2 py-1 gap-x-2 hover:bg-amber-200 place-items-center ';
  const dtCls = 'flex items-center px-2';
  const ddCls = 'text-center';

  return (
    <div>
      <h2 className='mt-4 mb-2 text-2xl py-1 text-center flex items-center justify-center'>
        資料組合時間
        <Tooltip>
          <TooltipTrigger>
            <div className='cursor-help p-1 ml-0.5 rounded self-stretch flex'>
              <InfoIcon size={24} className='stroke-slate-600 cursor-help' />
            </div>
          </TooltipTrigger>
          <TooltipContent className='p-2 rounded box-border w-max z-[1002] bg-slate-100 drop-shadow-xl'>
            目前是由人工發動資料的重整，發動時間會顯示在這裡
          </TooltipContent>
        </Tooltip>
      </h2>

      <dl className='font-mixed'>
        <div className={`${rowCls}`}>
          <dt className={dtCls}>
            現在時間
          </dt>
          <dd className={ddCls}>
            <Now />
          </dd>
        </div>

        <div className={`${rowCls}`}>
          <dt className={`${dtCls} font-bold`}>
            資料組合時間
          </dt>
          <dd className={`${ddCls} font-bold`}>
            {formatDate(combined, 'week')}
          </dd>
        </div>
      </dl>

      <h2 className='mt-8 mb-2 text-2xl py-1 text-center flex items-center justify-center'>
        各資料來源的更新時間
        <Tooltip>
          <TooltipTrigger>
            <div className='cursor-help p-1 ml-0.5 rounded self-stretch flex'>
              <InfoIcon size={24} className='stroke-slate-600 cursor-help' />
            </div>
          </TooltipTrigger>
          <TooltipContent className='p-2 rounded box-border w-max z-[1002] bg-slate-100 drop-shadow-xl'>
            並非原始資料的更新時間，而是最後一次發現更新，或因程式調整而使結果改變的時間
          </TooltipContent>
        </Tooltip>
      </h2>

      <dl className='font-mixed'>
        {sources.map(([name, checkedAt]) => {
          const link = resources[name]?.docUrl;
          const reminder = resources[name]?.reminder;
          return (
            <div key={name} className={rowCls}>
              <dt className={dtCls}>
                {resources[name]?.title}
                { reminder &&
                  <span className='text-red-800 text-sm'>
                    （{reminder}）
                  </span>
                }
                { link &&
                  <Link href={link} target='_blank' className='inline-block px-2 opacity-70 hover:opacity-100 hover:scale-110'>
                    <ExternalLinkIcon size={18} />
                  </Link>
                }
              </dt>
              <dd className={ddCls}>
                {formatDate(checkedAt, 'week')}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
