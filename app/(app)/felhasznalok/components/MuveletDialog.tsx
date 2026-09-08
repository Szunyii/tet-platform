'use client';

import type { ReactNode } from 'react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import type { MezoHibak } from '../../../../lib/felhasznalo-validacio';
import { MezoHiba } from '../../../../components/form/MezoHiba';

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
  formAction,
  errors,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pending: boolean;
  cim: string;
  leiras: ReactNode;
  gomb: string;
  formAction: (formData: FormData) => void;
  errors: MezoHibak;
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
      <DialogContent showCloseButton={!pending}>
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
              {pending ? 'Mentés…' : gomb}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
