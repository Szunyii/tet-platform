'use client';

import { unstable_rethrow } from 'next/navigation';
import Link from 'next/link';
import { Fragment, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import { useNyitas } from '../../../../components/form/useNyitas';
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { TevekenysegSor } from '../../../../db/queries/tevekenyseg';
import { formatNaptariDatum } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import { tipusCimke } from '../../../../lib/tevekenyseg-szotar';
import { torolTevekenysegAction } from '../actions';
import { TevekenysegDialog, type TevekenysegUrlapAdat } from './TevekenysegDialog';

const OSZLOP_DB = 8;

function SorMuveletek({ t, adat, onTorolve }: { t: TevekenysegSor; adat: TevekenysegUrlapAdat; onTorolve: () => void }) {
  const modositas = useNyitas();
  const [torlesNyitva, setTorlesNyitva] = useState(false);
  const [pending, startTransition] = useTransition();

  function torol() {
    startTransition(async () => {
      try {
        const res = await torolTevekenysegAction(t.id);
        if (res.ok) {
          toast.success('Tevékenység törölve.');
          onTorolve();
        } else toast.error(res.errors?.form ?? 'A törlés nem sikerült.');
      } catch (err) {
        unstable_rethrow(err);
        toast.error('A törlés nem sikerült.');
      } finally {
        setTorlesNyitva(false);
      }
    });
  }

  if (t.zarolt) return <span className="text-xs whitespace-nowrap text-muted-foreground">A félév lezárult</span>;

  return (
    <div className="flex justify-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={modositas.nyit} aria-label={`Módosítás: ${t.megnevezes}`}>
        Módosítás
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => setTorlesNyitva(true)}
        aria-label={`Törlés: ${t.megnevezes}`}
      >
        Törlés
      </Button>
      {modositas.kulcs > 0 && (
        <TevekenysegDialog
          key={modositas.kulcs}
          tevekenyseg={t}
          adat={adat}
          open={modositas.open}
          onOpenChange={modositas.setOpen}
        />
      )}
      <AlertDialog
        open={torlesNyitva}
        onOpenChange={(next, details) => {
          // Futó törlés közben nem záródhat: a művelet nem szakítható meg.
          if (!next && pending) {
            details.cancel();
            return;
          }
          setTorlesNyitva(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A tevékenység törlése</AlertDialogTitle>
            <AlertDialogDescription>„{t.megnevezes}” véglegesen törlődik.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={torol}>
              {pending ? 'Törlés…' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/** A tevékenységek dátum szerint csökkenően; a kifogásolt sor alatt a központ megjegyzése áll. */
export function TevekenysegTabla({
  tevekenysegek,
  adat,
}: {
  tevekenysegek: readonly TevekenysegSor[];
  adat: TevekenysegUrlapAdat;
}) {
  const doboz = useRef<HTMLDivElement>(null);
  // A törölt sorral a fókuszt tartó gomb is eltűnik: a párbeszédablak bezáródása után a táblára kerül.
  const torlesUtan = () => window.setTimeout(() => doboz.current?.focus(), 250);

  if (tevekenysegek.length === 0) {
    return (
      <div ref={doboz} tabIndex={-1} className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Ebben az időszakban nincs rögzített tevékenység.
        </p>
      </div>
    );
  }
  return (
    <div
      ref={doboz}
      tabIndex={-1}
      className="rounded-lg border border-border bg-card outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      <Table className="min-w-[60rem]">
        <TableHeader>
          <TableRow>
            <TableHead>Dátum</TableHead>
            <TableHead>Típus</TableHead>
            <TableHead>Megnevezés</TableHead>
            <TableHead>Ország</TableHead>
            <TableHead>Partner</TableHead>
            <TableHead>Magyar szereplő</TableHead>
            <TableHead>Kapcsolódó eredmény</TableHead>
            <TableHead className="text-right">Műveletek</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tevekenysegek.map((t) => (
            <Fragment key={t.id}>
              <TableRow className={t.kifogas ? 'border-b-0' : undefined}>
                <TableCell className="align-top whitespace-nowrap">{formatNaptariDatum(t.datum)}</TableCell>
                <TableCell className="align-top whitespace-nowrap">{tipusCimke(t.tipus)}</TableCell>
                <TableCell className="max-w-56 align-top font-medium break-words whitespace-normal">{t.megnevezes}</TableCell>
                <TableCell className="align-top whitespace-nowrap">{orszagNev(t.orszagKod)}</TableCell>
                <TableCell className="max-w-44 align-top break-words whitespace-normal">{t.partner}</TableCell>
                <TableCell className="max-w-44 align-top break-words whitespace-normal">{t.magyarSzereplo ?? '–'}</TableCell>
                <TableCell className="max-w-44 align-top break-words whitespace-normal">
                  {t.eredmenyId && t.eredmenyNev ? (
                    <Link href={`/tevekenysegek/eredmeny/${encodeURIComponent(t.eredmenyId)}`} className="underline underline-offset-2">
                      {t.eredmenyNev}
                    </Link>
                  ) : (
                    '–'
                  )}
                </TableCell>
                <TableCell className="align-top">
                  <SorMuveletek t={t} adat={adat} onTorolve={torlesUtan} />
                </TableCell>
              </TableRow>
              {t.kifogas && (
                <TableRow>
                  <TableCell colSpan={OSZLOP_DB} className="bg-red-50 text-xs break-words whitespace-normal text-red-950">
                    <span className="font-semibold">Kifogásolva{t.kifogasSzerzoNev && ` (${t.kifogasSzerzoNev})`}:</span> {t.kifogas}{' '}
                    A kifogás megszűnik, ha módosítod a bejegyzést.
                  </TableCell>
                </TableRow>
              )}
            </Fragment>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
