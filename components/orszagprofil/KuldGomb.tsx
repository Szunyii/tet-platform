'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

/** Form submit gomb pending állapottal (useFormStatus); a SzerkesztesGomb form-ága használja, hogy a SzerkesztesGomb maga szerver-kompatibilis maradjon. */
export function KuldGomb({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return <Button type="submit" disabled={pending} aria-busy={pending}>{children}</Button>;
}
