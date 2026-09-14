'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

/**
 * Form submit gomb pending állapottal (useFormStatus). A SzerkesztesGomb form-ága és a profil oldal
 * évugró gombja használja, hogy a hívó maga szerver-kompatibilis maradjon.
 */
export function KuldGomb({ children, variant }: { children: React.ReactNode; variant?: React.ComponentProps<typeof Button>['variant'] }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} disabled={pending} aria-busy={pending}>{children}</Button>;
}
