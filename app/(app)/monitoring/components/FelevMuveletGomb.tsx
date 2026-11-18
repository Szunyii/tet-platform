'use client';

import { unstable_rethrow, useRouter } from 'next/navigation';
import { useId, useState, useTransition } from 'react';
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

export type FelevMuvelet = 'megnyitas' | 'lezaras' | 'ujranyitas';

interface MuveletSzoveg {
  gomb: string;
  folyamatban: string;
  siker: string;
  hiba: string;
  /** Ha van, a művelet megerősítést kér. */
  megerosites?: { cim: string; leiras: (felev: string) => string };
}

const SZOVEGEK: Record<FelevMuvelet, MuveletSzoveg> = {
  megnyitas: {
    gomb: 'Félév megnyitása',
    folyamatban: 'Megnyitás…',
    siker: 'Félév megnyitva.',
    hiba: 'A félév megnyitása sikertelen.',
  },
  lezaras: {
    gomb: 'Félév lezárása',
    folyamatban: 'Lezárás…',
    siker: 'Félév lezárva.',
    hiba: 'A félév lezárása sikertelen.',
    megerosites: {
      cim: 'Félév lezárása',
      leiras: (felev) =>
        `A(z) ${felev} lezárásakor rögzülnek a mutatók és az attasék adatai. A minősítések ezután csak újranyitással módosíthatók.`,
    },
  },
  ujranyitas: {
    gomb: 'Újranyitás',
    folyamatban: 'Újranyitás…',
    siker: 'Félév újranyitva.',
    hiba: 'A félév újranyitása sikertelen.',
    megerosites: {
      cim: 'Félév újranyitása',
      leiras: (felev) =>
        `A(z) ${felev} minősítései újra szerkeszthetők lesznek. A rögzített mutatók nem változnak, új attasé nem kerül a félévbe.`,
    },
  },
};

/**
 * A félév életciklus-gombja. Lezárás és újranyitás előtt megerősítést kér, megnyitás előtt nem. A `tiltasOka`
 * letiltja a gombot, és szövegként mellette áll.
 */
export function FelevMuveletGomb({
  muvelet,
  action,
  felev,
  felevUrl,
  tiltasOka,
}: {
  muvelet: FelevMuvelet;
  action: MuveletAction;
  /** A félév felirata a megerősítő szöveghez. */
  felev: string;
  /** A nézet URL-je a megjelenített félévvel. */
  felevUrl: string;
  tiltasOka?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const okId = useId();
  const szoveg = SZOVEGEK[muvelet];
  const { megerosites } = szoveg;

  function futtat() {
    startTransition(async () => {
      // A művelet előtt rögzítjük a félévet az URL-ben: `?felev=` nélkül az alapértelmezett félév a lezárt
      // félévekből adódik, így az újranyitás után a nézet másik félévre váltana.
      router.replace(felevUrl, { scroll: false });
      try {
        const res = await action();
        if (res.ok) toast.success(szoveg.siker);
        else toast.error(res.errors?.form ?? szoveg.hiba);
        setOpen(false);
      } catch (err) {
        unstable_rethrow(err);
        // A dialógus nyitva marad, hogy újra lehessen próbálni; a Mégse zárja.
        toast.error(szoveg.hiba);
      }
    });
  }

  return (
    <div className="flex max-w-full min-w-0 flex-col items-start gap-1.5 @3xl:max-w-md @3xl:items-end">
      <Button
        type="button"
        variant={muvelet === 'ujranyitas' ? 'outline' : 'default'}
        // Fókuszálható marad: a művelet után letiltott gombról nem vész el a fókusz, és billentyűzettel is
        // elérhető a tiltás oka. Ilyenkor nincs natív `disabled`, ezért a kinézetet az `aria-disabled` adja.
        disabled={pending || tiltasOka !== undefined}
        focusableWhenDisabled
        aria-describedby={tiltasOka !== undefined ? okId : undefined}
        className="h-auto min-h-8 max-w-full py-1 whitespace-normal aria-disabled:pointer-events-none aria-disabled:opacity-50"
        onClick={() => (megerosites ? setOpen(true) : futtat())}
      >
        {pending ? szoveg.folyamatban : szoveg.gomb}
      </Button>
      {tiltasOka !== undefined && (
        <p id={okId} className="text-[12px] wrap-anywhere text-muted-foreground @3xl:text-right">
          {tiltasOka}
        </p>
      )}
      {megerosites && (
        <AlertDialog
          open={open}
          onOpenChange={(next, details) => {
            // Futó művelet közben nem záródhat (Escape, kattintás): a művelet nem szakítható meg.
            if (!next && pending) {
              details.cancel();
              return;
            }
            setOpen(next);
          }}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{megerosites.cim}</AlertDialogTitle>
              <AlertDialogDescription>{megerosites.leiras(felev)}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
              <AlertDialogAction disabled={pending} onClick={futtat}>
                {pending ? szoveg.folyamatban : szoveg.gomb}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}
