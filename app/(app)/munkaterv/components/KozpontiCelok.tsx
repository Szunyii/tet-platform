'use client';

import { unstable_rethrow } from 'next/navigation';
import { useRef, useState, useTransition } from 'react';
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
import type { KozpontiCelSor } from '../../../../db/queries/munkaterv';
import { formatDatum } from '../../../../lib/datum';
import { szempontByKulcs } from '../../../../lib/ertekeles-szotar';
import { kozzeteszAction, torolKozpontiCelAction } from '../actions';
import { HATOKOR_OPCIOK, KozpontiCelDialog } from './KozpontiCelDialog';

const hatokorCimke = (h: KozpontiCelSor['hatokor']) => HATOKOR_OPCIOK.find((o) => o.kulcs === h)?.cimke ?? h;

function CelSorElem({
  cel,
  szerkesztheto,
  ev,
  onTorolve,
}: {
  cel: KozpontiCelSor;
  szerkesztheto: boolean;
  ev: number;
  onTorolve: () => void;
}) {
  const modositas = useNyitas();
  const [torlesNyitva, setTorlesNyitva] = useState(false);
  const [pending, startTransition] = useTransition();

  function torol() {
    startTransition(async () => {
      try {
        const res = await torolKozpontiCelAction(cel.id);
        if (res.ok) {
          toast.success('Központi cél törölve.');
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

  return (
    <li className="flex flex-col gap-1.5 border-b border-border/60 px-3 py-2.5 last:border-b-0">
      <div className="min-w-0">
        <p className="text-[13px] font-semibold wrap-anywhere">{cel.megnevezes}</p>
        <p className="text-[11.5px] text-muted-foreground">
          {hatokorCimke(cel.hatokor)} · {szempontByKulcs(cel.szempont).rovid}
        </p>
        <p className="mt-0.5 text-xs wrap-anywhere">{cel.merce}</p>
      </div>
      {szerkesztheto && (
        <div className="flex flex-wrap gap-1">
          <Button type="button" variant="outline" size="sm" onClick={modositas.nyit} aria-label={`Módosítás: ${cel.megnevezes}`}>
            Módosítás
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => setTorlesNyitva(true)} aria-label={`Törlés: ${cel.megnevezes}`}>
            Törlés
          </Button>
        </div>
      )}
      {modositas.kulcs > 0 && (
        <KozpontiCelDialog key={modositas.kulcs} ev={ev} cel={cel} open={modositas.open} onOpenChange={modositas.setOpen} />
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
            <AlertDialogTitle>A központi cél törlése</AlertDialogTitle>
            <AlertDialogDescription>„{cel.megnevezes}” véglegesen törlődik.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={torol}>
              {pending ? 'Törlés…' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </li>
  );
}

/** Az év központi céljai: közzétételig szerkeszthetők, utána csak olvashatók. */
export function KozpontiCelok({
  ev,
  celok,
  kozzetetel,
  tervezheto,
}: {
  ev: number;
  celok: readonly KozpontiCelSor[];
  kozzetetel: { kozzeteveAt: Date; kozzetetteNev: string } | null;
  /** A folyó vagy a következő év: csak ezekre vehetők fel és tehetők közzé célok. */
  tervezheto: boolean;
}) {
  const uj = useNyitas();
  const [megerositesNyitva, setMegerositesNyitva] = useState(false);
  const [hiba, setHiba] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const cim = useRef<HTMLHeadingElement>(null);
  const szerkesztheto = tervezheto && kozzetetel === null;

  // A törölt sorral és a közzététellel a fókuszt tartó gomb is eltűnik: az ablak bezáródása után a címre kerül.
  const fokuszACimre = () => window.setTimeout(() => cim.current?.focus(), 250);

  function kozzetesz() {
    setHiba(null);
    startTransition(async () => {
      try {
        const res = await kozzeteszAction(ev);
        if (res.ok) {
          toast.success('A központi célok közzétéve.');
          fokuszACimre();
        } else setHiba(res.errors?.form ?? 'A közzététel nem sikerült.');
      } catch (err) {
        unstable_rethrow(err);
        setHiba('A művelet nem futott le. Ellenőrizd a kapcsolatot, és próbáld újra.');
      } finally {
        setMegerositesNyitva(false);
      }
    });
  }

  return (
    <section aria-labelledby="kozponti-celok-cim" className="min-w-0 rounded-lg border border-border bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-border px-3 py-2.5">
        <h3 id="kozponti-celok-cim" ref={cim} tabIndex={-1} className="rounded-sm text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          Központi célok
        </h3>
        {szerkesztheto && (
          <Button type="button" variant="outline" size="sm" onClick={uj.nyit}>
            + Új cél
          </Button>
        )}
      </div>

      {celok.length === 0 ? (
        <p className="px-3 py-6 text-center text-xs text-muted-foreground">Erre az évre még nincs központi cél.</p>
      ) : (
        <ul>
          {celok.map((c) => (
            <CelSorElem key={c.id} cel={c} ev={ev} szerkesztheto={szerkesztheto} onTorolve={fokuszACimre} />
          ))}
        </ul>
      )}

      <div className="flex flex-col gap-2 border-t border-border px-3 py-2.5 text-xs text-muted-foreground">
        {kozzetetel ? (
          <p>
            Közzétéve: {formatDatum(kozzetetel.kozzeteveAt)}, {kozzetetel.kozzetetteNev}. A célok már csak olvashatók.
          </p>
        ) : !tervezheto ? (
          <p>Ez az év lezárult, a központi célok már nem módosíthatók.</p>
        ) : (
          <>
            <p>Közzététel után az attasék elkezdhetik a tervüket, a célok pedig már nem módosíthatók.</p>
            <div>
              <Button type="button" size="sm" disabled={pending} onClick={() => setMegerositesNyitva(true)}>
                Közzététel
              </Button>
            </div>
          </>
        )}
        {hiba && (
          <p role="alert" className="wrap-anywhere text-destructive">
            {hiba}
          </p>
        )}
      </div>

      {uj.kulcs > 0 && <KozpontiCelDialog key={uj.kulcs} ev={ev} open={uj.open} onOpenChange={uj.setOpen} />}

      <AlertDialog
        open={megerositesNyitva}
        onOpenChange={(next, details) => {
          // Futó közzététel közben nem záródhat: a művelet nem szakítható meg.
          if (!next && pending) {
            details.cancel();
            return;
          }
          setMegerositesNyitva(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>A(z) {ev}. évi központi célok közzététele</AlertDialogTitle>
            <AlertDialogDescription>
              A közzététel nem vonható vissza: a célok ezután nem módosíthatók, és az attasék elkezdhetik a tervüket.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction disabled={pending} onClick={kozzetesz}>
              {pending ? 'Közzététel…' : 'Közzététel'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
