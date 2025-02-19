"use client"

import TableDialog from '@/components/TableDialog';
import { tableAtom, tableDialogOpenAtom } from './store';

export default function TableDialogWrapper() {
  return <TableDialog tableAtom={tableAtom} dialogOpenAtom={tableDialogOpenAtom} />;
}
