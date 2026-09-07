'use client';

import { MoreHorizontalIcon } from 'lucide-react';
import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../../../../components/ui/dropdown-menu';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import { banAction, removeFelhasznaloAction, unbanAction, type MuveletState } from '../actions';
import { JelszoDialog } from './JelszoDialog';
import { SzerkesztesDialog } from './SzerkesztesDialog';

type Megerosites = 'tilt' | 'felold' | 'torol' | null;

const MEGEROSITES_SZOVEG: Record<Exclude<Megerosites, null>, { cim: string; leiras: string; gomb: string; siker: string }> = {
  tilt: {
    cim: 'Fiók letiltása',
    leiras: 'A felhasználó nem tud bejelentkezni, amíg fel nem oldod.',
    gomb: 'Letiltás',
    siker: 'Fiók letiltva.',
  },
  felold: {
    cim: 'Tiltás feloldása',
    leiras: 'A felhasználó újra be tud jelentkezni.',
    gomb: 'Feloldás',
    siker: 'Tiltás feloldva.',
  },
  torol: {
    cim: 'Fiók végleges törlése',
    leiras: 'Ez nem vonható vissza. A felhasználó sessionjei is törlődnek.',
    gomb: 'Törlés',
    siker: 'Fiók törölve.',
  },
};

export function FelhasznaloMuveletek({ felhasznalo, sajat }: { felhasznalo: FelhasznaloSor; sajat: boolean }) {
  const [szerkesztes, setSzerkesztes] = useState(false);
  const [jelszo, setJelszo] = useState(false);
  // Minden dialógus-nyitás új key: a dialógus (és az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  const [megerosites, setMegerosites] = useState<Megerosites>(null);
  const [pending, startTransition] = useTransition();

  function nyit(setter: (v: boolean) => void) {
    setNyitas((n) => n + 1);
    setter(true);
  }

  function futtat(kind: Exclude<Megerosites, null>) {
    const fn: (id: string) => Promise<MuveletState> =
      kind === 'tilt' ? banAction : kind === 'felold' ? unbanAction : removeFelhasznaloAction;
    startTransition(async () => {
      try {
        const res = await fn(felhasznalo.id);
        if (res.ok) toast.success(MEGEROSITES_SZOVEG[kind].siker);
        else toast.error(res.errors?.form ?? 'Művelet sikertelen.');
      } catch (err) {
        // A server action dobhat (pl. notFound(), ha közben elveszett az admin jog): a Next
        // control-flow hibáját tovább kell dobni, hogy a not-found boundary kezelje.
        unstable_rethrow(err);
        toast.error('Művelet sikertelen.');
      } finally {
        setMegerosites(null);
      }
    });
  }

  const szoveg = megerosites ? MEGEROSITES_SZOVEG[megerosites] : null;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger render={<Button variant="ghost" size="icon-sm" aria-label={`Műveletek: ${felhasznalo.nev}`} />}>
          <MoreHorizontalIcon />
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => nyit(setSzerkesztes)}>Szerkesztés</DropdownMenuItem>
          <DropdownMenuItem onClick={() => nyit(setJelszo)}>Jelszó-visszaállítás</DropdownMenuItem>
          {!sajat && (
            <>
              <DropdownMenuSeparator />
              {felhasznalo.tiltott ? (
                <DropdownMenuItem onClick={() => setMegerosites('felold')}>Tiltás feloldása</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => setMegerosites('tilt')}>Letiltás</DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => setMegerosites('torol')}>
                Törlés
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <SzerkesztesDialog key={`sz-${nyitas}`} felhasznalo={felhasznalo} open={szerkesztes} onOpenChange={setSzerkesztes} />
      <JelszoDialog key={`j-${nyitas}`} felhasznalo={felhasznalo} sajat={sajat} open={jelszo} onOpenChange={setJelszo} />

      <AlertDialog
        open={megerosites !== null}
        onOpenChange={(next, details) => {
          // Folyamatban lévő művelet alatt nem zárható.
          if (!next && pending) {
            details.cancel();
            return;
          }
          if (!next) setMegerosites(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{szoveg?.cim}</AlertDialogTitle>
            <AlertDialogDescription>
              {felhasznalo.nev} ({felhasznalo.email}). {szoveg?.leiras}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              variant={megerosites === 'torol' ? 'destructive' : 'default'}
              disabled={pending}
              onClick={() => {
                if (megerosites) futtat(megerosites);
              }}
            >
              {pending ? 'Folyamatban…' : szoveg?.gomb}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
