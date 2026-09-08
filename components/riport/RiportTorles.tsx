'use client';

import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { MuveletState } from '../form/useMuveletForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';

export function RiportTorles({ targy, action }: { targy: string; action: () => Promise<MuveletState> }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function torol() {
    startTransition(async () => {
      try {
        const res = await action();
        // Sikernél az action redirectel (a Next router követi): ha ide visszatérünk, hiba történt.
        // A dialógus nyitva marad, hogy újra lehessen próbálni; a Mégse zárja.
        toast.error(res?.errors?.form ?? 'Törlés sikertelen.');
      } catch (err) {
        unstable_rethrow(err);
        toast.error('Törlés sikertelen.');
      }
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" onClick={() => setOpen(true)}>
        Törlés
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
            <AlertDialogTitle>Bejegyzés törlése</AlertDialogTitle>
            <AlertDialogDescription>
              „{targy}” és a csatolmányai véglegesen törlődnek. Ez nem vonható vissza.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={torol}>
              {pending ? 'Törlés…' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
