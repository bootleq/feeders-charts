import { useCallback, RefObject } from 'react';

function useListToggleFocus<T extends HTMLElement>(listRef: RefObject<T | null>) {
  const onMiddleClick = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (e.button !== 1) return; // "middle" click only

    const $target = e.target as HTMLElement;
    const $currentInput = $target.closest('li')?.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
    if (!$currentInput) return;

    e.preventDefault();

    const $inputs = listRef.current?.querySelectorAll('input[type="checkbox"]') as NodeListOf<HTMLInputElement> | null;
    const value = $currentInput.value;

    $currentInput.checked = true;
    $inputs?.forEach(($i) => {
      if ($i.checked && $i.value !== value) {
        $i.checked = false;
      }
    });
  }, [listRef]);

  return onMiddleClick;
}

export default useListToggleFocus;
