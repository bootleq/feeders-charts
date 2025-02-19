import type { PrimitiveAtom } from 'jotai';

export type TableRow = Array<string|number|null>;
export type PrimitiveAtomWithInitial<T> = PrimitiveAtom<T> & { init: T };
