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

type Megerosites = 'tilt' | 'felold' | 'torol';

interface MegerositesLeiras {
  cim: string;
  leiras: string;
  gomb: string;
  siker: string;
  veszelyes: boolean;
  fn: (userId: string) => Promise<MuveletState>;
}

const MEGEROSITES: Record<Megerosites, MegerositesLeiras> = {
  tilt: {
    cim: 'Fiók letiltása',
    leiras: 'A felhasználó nem tud bejelentkezni, amíg fel nem oldod.',
    gomb: 'Letiltás',
    siker: 'Fiók letiltva.',
    veszelyes: false,
    fn: banAction,
  },
  felold: {
    cim: 'Tiltás feloldása',
    leiras: 'A felhasználó újra be tud jelentkezni.',
    gomb: 'Feloldás',
    siker: 'Tiltás feloldva.',
    veszelyes: false,
    fn: unbanAction,
  },
  torol: {
    cim: 'Fiók végleges törlése',
    leiras:
      'Ez nem vonható vissza. A felhasználó sessionjei és az összes bejegyzése (riportja) a csatolmányaival együtt is törlődik. Távozó attasénál a tiltás a javasolt művelet.',
    gomb: 'Törlés',
    siker: 'Fiók törölve.',
    veszelyes: true,
    fn: removeFelhasznaloAction,
  },
};

export function FelhasznaloMuveletek({ felhasznalo, sajat }: { felhasznalo: FelhasznaloSor; sajat: boolean }) {
  const [szerkesztes, setSzerkesztes] = useState(false);
  const [jelszo, setJelszo] = useState(false);
  // Minden dialógus-nyitás új key: a dialógus (és az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  const [megerosites, setMegerosites] = useState<Megerosites | null>(null);
  // A szöveg külön state-ben marad, hogy a záró animáció alatt is az utolsó kérdés látsszon
  // (különben a cím és a gomb üresen tűnne el).
  const [szoveg, setSzoveg] = useState<MegerositesLeiras>(MEGEROSITES.tilt);
  const [pending, startTransition] = useTransition();

  function nyit(setter: (v: boolean) => void) {
    setNyitas((n) => n + 1);
    setter(true);
  }

  function kerdez(kind: Megerosites) {
    setSzoveg(MEGEROSITES[kind]);
    setMegerosites(kind);
  }

  function futtat(kind: Megerosites) {
    const { fn, siker } = MEGEROSITES[kind];
    startTransition(async () => {
      try {
        const res = await fn(felhasznalo.id);
        if (res.ok) toast.success(siker);
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
                <DropdownMenuItem onClick={() => kerdez('felold')}>Tiltás feloldása</DropdownMenuItem>
              ) : (
                <DropdownMenuItem onClick={() => kerdez('tilt')}>Letiltás</DropdownMenuItem>
              )}
              <DropdownMenuItem variant="destructive" onClick={() => kerdez('torol')}>
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
            <AlertDialogTitle>{szoveg.cim}</AlertDialogTitle>
            <AlertDialogDescription>
              {felhasznalo.nev} ({felhasznalo.email}). {szoveg.leiras}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction
              variant={szoveg.veszelyes ? 'destructive' : 'default'}
              disabled={pending}
              onClick={() => {
                if (megerosites) futtat(megerosites);
              }}
            >
              {pending ? 'Folyamatban…' : szoveg.gomb}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
