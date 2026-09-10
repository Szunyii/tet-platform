'use client';

import type { ReactNode } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { MezoHiba } from './MezoHiba';

/**
 * Közös dialógus-keret a form-műveletekhez: fejléc, <form action>, űrlap-szintű hiba,
 * Mégse / beküldés lábléc. Beküldés közben nem zárható (Esc, háttér, X), különben az
 * eredmény elveszne. A mezők a children-ben jönnek.
 */
export function MuveletDialog({
  open,
  onOpenChange,
  pending,
  cim,
  leiras,
  gomb,
  gombFolyamatban = 'Mentés…',
  formAction,
  errors,
  szeles = false,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  cim: string;
  leiras: ReactNode;
  gomb: string;
  /** A gomb felirata beküldés közben. */
  gombFolyamatban?: string;
  formAction: (formData: FormData) => void;
  errors: MezoHibak;
  /** Szélesebb dialógus (sm:max-w-lg) a többoszlopos űrlapokhoz. */
  szeles?: boolean;
  children: ReactNode;
}) {
  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (!next && pending) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      {/* Kis képernyőn a hosszú űrlap különben nem görgethető: a Base UI zárolja a body görgetést. */}
      <DialogContent
        showCloseButton={!pending}
        className={cn('max-h-[calc(100dvh-2rem)] overflow-y-auto', szeles && 'sm:max-w-lg')}
      >
        <DialogHeader>
          <DialogTitle>{cim}</DialogTitle>
          <DialogDescription>{leiras}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          {children}
          <MezoHiba mezo="form" errors={errors} alert />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Mégse
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? gombFolyamatban : gomb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
