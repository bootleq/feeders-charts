import * as R from 'ramda';
import type { CountryItem, ItemsMeta } from '@/lib/model';
import Chart from './Chart';
import TableDialog from './TableDialog';

const RESOURCE_URL = process.env.NEXT_PUBLIC_RESOURCE_URL;

async function fetchResource() {
  const response = await fetch(RESOURCE_URL!);
  const items = await response.json();
  return items;
}

export default async function Page() {
  const items: CountryItem[] = await fetchResource();
  const years = R.pipe(
    R.pluck('year'),
    R.uniq,
    R.filter(R.isNotNil),
    R.map(Number),
  )(items);

  const meta: ItemsMeta = {
    minYear: Math.min(...years),
    maxYear: Math.max(...years),
  };

  return (
    <div className="container items-center justify-items-center min-h-screen mx-auto font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-2 items-center sm:items-start">
        <h1 className='pt-3 block text-center w-full text-3xl bold'>
          遊蕩犬隻估計數量
        </h1>

        <Chart items={items} meta={meta} />
      </main>

      <TableDialog />
    </div>
  );
}
