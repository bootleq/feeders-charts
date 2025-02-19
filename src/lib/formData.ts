import type { CheckboxSet } from '@/components/types';

export function parseChartInputs(form: HTMLFormElement) {
  const formData = new FormData(form);
  const seriesString = formData.get('seriesSet')?.toString();
  const representString = formData.get('representSet')?.toString();
  const markerString = formData.get('markerSet')?.toString();

  let seriesSet, representSet, markerSet;

  try {
    if (seriesString) {
      seriesSet = JSON.parse(seriesString) as CheckboxSet;
    }
    if (representString) {
      representSet = JSON.parse(representString) as CheckboxSet;
    }
    if (markerString) {
      markerSet = JSON.parse(markerString) as CheckboxSet;
    }
  } catch (error) {
    console.error('Fail parsing form fields');
    throw error;
  }

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
