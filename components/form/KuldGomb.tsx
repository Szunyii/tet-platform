'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Általános submit gomb pending állapottal (useFormStatus): a `<form action>`-t renderelő hívó így
 * Server Component maradhat (pl. a SzerkesztesGomb form-ága, a tudástár ↑/↓ gombjai). A `disabled` a
 * pending mellett tilt (pl. a lista szélén); az `aria-label` az ikon-feliratú gomboké.
 */
export function KuldGomb({
  children, variant, size, disabled, 'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending || disabled} aria-busy={pending} aria-label={ariaLabel}>
      {children}
    </Button>
  );
}
