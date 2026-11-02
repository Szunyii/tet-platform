'use client';

import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { MuveletAction } from '../../../../components/form/useMuveletForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Button } from '../../../../components/ui/button';

/**
 * A kártya törlése megerősítéssel (a `RiportTorles` mintája); sikernél az action a kategória-oldalra irányít.
 * `tiltva`: a szerkesztő mentése közben nem indítható (a mentés és a törlés ne versenyezzen).
 */
export function KartyaTorles({ nev, action, tiltva = false }: { nev: string; action: MuveletAction; tiltva?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function torol() {
    startTransition(async () => {
      try {
        const res = await action();
        // Sikernél az action redirectel (a Next router követi): ha ide visszatérünk, hiba történt.
        toast.error(res?.errors?.form ?? 'Törlés sikertelen.');
      } catch (err) {
        unstable_rethrow(err);
        toast.error('Törlés sikertelen.');
      }
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" disabled={tiltva} onClick={() => setOpen(true)}>
        Kártya törlése
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(next, details) => {
          // Futó törlés közben nem záródhat (Escape, kattintás): a művelet nem szakítható meg.
          if (!next && pending) {
            details.cancel();
            return;
          }
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kártya törlése</AlertDialogTitle>
            <AlertDialogDescription>„{nev}” véglegesen törlődik a tudástárból. Ez nem vonható vissza.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            {/* focusableWhenDisabled: törlés közben a fókusz a gombon marad (különben a body-ra esne). Ilyenkor natív
                disabled nincs, csak aria-disabled, ezért a letiltott kinézetet az aria-disabled: osztályok adják. */}
            <AlertDialogAction variant="destructive" disabled={pending} focusableWhenDisabled onClick={torol}
              className="aria-disabled:pointer-events-none aria-disabled:opacity-50">
              {pending ? 'Törlés…' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
