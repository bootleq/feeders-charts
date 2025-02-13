
export function tooltipClass(className?: string) {
  return `rounded box-border w-max z-[1002] bg-slate-100 ${className || ''}`;
}
export function tooltipMenuCls(className?: string) {
  return [
    'flex flex-col divide-y w-full items-center justify-between',
    'rounded bg-gradient-to-br from-stone-50 to-slate-100 ring-2 ring-offset-1 ring-slate-300',
    className || '',
  ].join(' ');
}

