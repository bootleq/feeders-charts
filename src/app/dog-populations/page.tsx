import * as R from 'ramda';
import type { CountryItem, ItemsMeta } from '@/lib/model';
import Chart from './chart';

const SRC_COUNTRY_URL = process.env.NEXT_PUBLIC_SRC_COUNTRY_URL;

async function fetchResource() {
  const response = await fetch(SRC_COUNTRY_URL!);
  const items = await response.json();
  return items;
}

export default async function Page() {
  const items: CountryItem[] = await fetchResource();
  const years = R.pipe(
    R.pluck('rpt_year'),
    R.uniq,
    R.filter(R.isNotNil),
    R.map(Number),
  )(items);

  const meta: ItemsMeta = {
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1>
          遊蕩犬隻估計數量
        </h1>

        <Chart items={items} meta={meta} />
      </main>
    </div>
  );
}
