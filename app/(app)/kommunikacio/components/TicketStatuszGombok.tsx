'use client';

import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { MuveletState } from '../../../../components/form/useMuveletForm';
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

type Muvelet = () => Promise<MuveletState>;

/** Lezárás megerősítéssel, újranyitás egy kattintással. A bind-olt action-öket a page adja. */
export function TicketStatuszGombok({
  lezart,
  targy,
  lezarAction,
  ujranyitAction,
}: {
  lezart: boolean;
  targy: string;
  lezarAction: Muvelet;
  ujranyitAction: Muvelet;
}) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  // Az action elutasítását (hálózat, elavult action id) nem dobjuk tovább – toast lesz belőle;
  // a Next control-flow kivételeit (redirect/notFound) viszont tovább kell dobni.
  function futtat(action: Muvelet, siker: string, hiba: string) {
    startTransition(async () => {
      try {
        const res = await action();
        if (res.ok) {
          toast.success(siker);
          setOpen(false);
        } else {
          toast.error(res.errors?.form ?? hiba);
        }
      } catch (err) {
        unstable_rethrow(err);
        toast.error(hiba);
      }
    });
  }

  if (lezart) {
    return (
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() => futtat(ujranyitAction, 'Ticket újranyitva.', 'Újranyitás sikertelen.')}
      >
        {pending ? 'Újranyitás…' : 'Újranyitás'}
      </Button>
    );
  }

  return (
    <>
      <Button type="button" variant="outline" size="sm" onClick={() => setOpen(true)}>
        Lezárás
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(next, details) => {
          // Futó művelet közben nem záródhat (Escape, kattintás).
          if (!next && pending) {
            details.cancel();
            return;
          }
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ticket lezárása</AlertDialogTitle>
            <AlertDialogDescription>
              „{targy}” lezárul, a szálba nem lehet többé írni. Később újranyitható.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              disabled={pending}
              onClick={() => futtat(lezarAction, 'Ticket lezárva.', 'Lezárás sikertelen.')}
            >
              {pending ? 'Lezárás…' : 'Lezárás'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
