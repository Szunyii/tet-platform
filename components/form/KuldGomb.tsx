'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

/**
 * Általános submit gomb pending állapottal (useFormStatus): a `<form action>`-t renderelő hívó így
 * Server Component maradhat (pl. a SzerkesztesGomb form-ága).
 */
export function KuldGomb({ children, variant }: { children: React.ReactNode; variant?: React.ComponentProps<typeof Button>['variant'] }) {
  const { pending } = useFormStatus();
  return <Button type="submit" variant={variant} disabled={pending} aria-busy={pending}>{children}</Button>;
}
