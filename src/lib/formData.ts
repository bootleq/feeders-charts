import type { CheckboxSet } from '@/components/types';

export function parseChartInputs(form: HTMLFormElement) {
  const formData = new FormData(form);
  const seriesString = formData.get('seriesSet')?.toString() || '';
  const seriesSet = JSON.parse(seriesString) as CheckboxSet;
  const representString = formData.get('representSet')?.toString() || '';
  const representSet = JSON.parse(representString) as CheckboxSet;
  const markerString = formData.get('markerSet')?.toString() || '';
  const markerSet = JSON.parse(markerString) as CheckboxSet;

  const cities = formData.getAll('cities').map(String);
  const years = formData.getAll('years').map(Number);

  return {
    representString,
    seriesSet,
    representSet,
    markerSet,
    cities,
    years,
  };
}
