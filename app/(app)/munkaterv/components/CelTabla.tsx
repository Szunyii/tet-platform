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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { CelSor } from '../../../../db/queries/munkaterv';
import { szempontByKulcs } from '../../../../lib/ertekeles-szotar';
import { orszagNev } from '../../../../lib/orszagok';
import { torolCelAction } from '../actions';
import { CelAllapotDialog } from './CelAllapotDialog';
import { CelDialog } from './CelDialog';
import { CelAllapotJelveny, TablaDoboz, TORDELHETO_GOMB } from './TervReszek';

/**
 * A táblázat üzemmódja: `szerkeszt` a szerkeszthető terv, `allapot` az attasé jóváhagyott terve, `felulir` a központ
 * jóváhagyott terv nézete, `olvas` minden más.
 */
export type CelTablaMod = 'szerkeszt' | 'allapot' | 'felulir' | 'olvas';

interface TervAdat {
  id: string;
  verzio: number;
}

function SzerkesztoGombok({
  cel,
  terv,
  celDb,
  orszagok,
  onTorolve,
}: {
  cel: CelSor;
  terv: TervAdat;
  celDb: number;
  orszagok: readonly string[];
  onTorolve: () => void;
}) {
  const modositas = useNyitas();
  const [torlesNyitva, setTorlesNyitva] = useState(false);
  const [pending, startTransition] = useTransition();
  const kozponti = cel.kozpontiCelId !== null;

  function torol() {
    startTransition(async () => {
      try {
        const res = await torolCelAction(terv.id, terv.verzio, cel.id);
        if (res.ok) {
          toast.success('Cél törölve.');
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
    <div className="flex justify-end gap-1">
      <Button type="button" variant="outline" size="sm" onClick={modositas.nyit} aria-label={`${kozponti ? 'Ország módosítása' : 'Módosítás'}: ${cel.megnevezes}`}>
        {kozponti ? 'Ország' : 'Módosítás'}
      </Button>
      {!kozponti && (
        <Button type="button" variant="outline" size="sm" onClick={() => setTorlesNyitva(true)} aria-label={`Törlés: ${cel.megnevezes}`}>
          Törlés
        </Button>
      )}
      {modositas.kulcs > 0 && (
        <CelDialog
          key={modositas.kulcs}
          tervId={terv.id}
          verzio={terv.verzio}
          cel={cel}
          celDb={celDb}
          orszagok={orszagok}
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
            <AlertDialogTitle>A cél törlése</AlertDialogTitle>
            <AlertDialogDescription>„{cel.megnevezes}” kikerül a tervből.</AlertDialogDescription>
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

function AllapotGomb({ cel, felulir }: { cel: CelSor; felulir: boolean }) {
  const nyitas = useNyitas();
  const felirat = felulir ? 'Felülírás' : 'Állapot módosítása';
  return (
    <div className="flex justify-end">
      <Button type="button" variant="outline" size="sm" onClick={nyitas.nyit} aria-label={`${felirat}: ${cel.megnevezes}`}>
        {felirat}
      </Button>
      {nyitas.kulcs > 0 && (
        <CelAllapotDialog key={nyitas.kulcs} cel={cel} felulir={felulir} open={nyitas.open} onOpenChange={nyitas.setOpen} />
      )}
    </div>
  );
}

/** Az állapot, a megjegyzés és aki utoljára rögzítette; a központ felülírása külön felirattal látszik. */
function AllapotCella({ cel }: { cel: CelSor }) {
  return (
    <div className="flex flex-col items-start gap-1">
      <CelAllapotJelveny allapot={cel.allapot} />
      {cel.allapotMegjegyzes && <p className="text-xs wrap-anywhere whitespace-pre-line">{cel.allapotMegjegyzes}</p>}
      {cel.allapotModositottaNev && (
        <p className="text-[11px] text-muted-foreground">
          {cel.allapotFelulirva ? 'A központ felülírta' : 'Rögzítette'}: {cel.allapotModositottaNev}
        </p>
      )}
    </div>
  );
}

/** A terv céljai. A széles táblázat a saját dobozában görget, a lap nem szélesedik. */
export function CelTabla({
  celok,
  mod,
  terv,
  orszagok = [],
}: {
  celok: readonly CelSor[];
  mod: CelTablaMod;
  terv: TervAdat;
  /** Az attasé országainak kódjai; csak szerkesztésnél kell. */
  orszagok?: readonly string[];
}) {
  const uj = useNyitas();
  const doboz = useRef<HTMLDivElement>(null);
  // A törölt sorral a fókuszt tartó gomb is eltűnik: a párbeszédablak bezáródása után a táblára kerül.
  const torlesUtan = () => window.setTimeout(() => doboz.current?.focus(), 250);
  const vanMuvelet = mod !== 'olvas';

  return (
    <section aria-labelledby="celok-cim" className="flex min-w-0 flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id="celok-cim" className="text-sm font-semibold">
          Célok
        </h3>
        {mod === 'szerkeszt' && (
          <Button type="button" variant="outline" size="sm" className={TORDELHETO_GOMB} onClick={uj.nyit}>
            + Új cél
          </Button>
        )}
      </div>

      {celok.length === 0 ? (
        <div ref={doboz} tabIndex={-1} className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
          <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
            A tervben még nincs cél.
          </p>
        </div>
      ) : (
        <TablaDoboz ref={doboz} cimke="A terv céljai">
          <Table className="min-w-[56rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Cél</TableHead>
                <TableHead>Ország</TableHead>
                <TableHead>Szempont</TableHead>
                <TableHead>Mérce</TableHead>
                <TableHead>Állapot</TableHead>
                {vanMuvelet && <TableHead className="text-right">Műveletek</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {celok.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="max-w-64 align-top font-medium break-words whitespace-normal">
                    {c.kozpontiCelId !== null && (
                      <span className="mr-1.5 inline-block rounded bg-foreground px-1.5 py-px text-[10.5px] font-semibold text-background">
                        Központi
                      </span>
                    )}
                    {c.megnevezes}
                  </TableCell>
                  <TableCell className="align-top whitespace-nowrap">{orszagNev(c.orszagKod)}</TableCell>
                  <TableCell className="align-top whitespace-nowrap">{szempontByKulcs(c.szempont).rovid}</TableCell>
                  <TableCell className="max-w-64 align-top break-words whitespace-normal">{c.merce}</TableCell>
                  <TableCell className="max-w-56 min-w-36 align-top whitespace-normal">
                    <AllapotCella cel={c} />
                  </TableCell>
                  {vanMuvelet && (
                    <TableCell className="align-top">
                      {mod === 'szerkeszt' && (
                        <SzerkesztoGombok cel={c} terv={terv} celDb={celok.length} orszagok={orszagok} onTorolve={torlesUtan} />
                      )}
                      {mod === 'felulir' && <AllapotGomb cel={c} felulir />}
                      {mod === 'allapot' &&
                        (c.allapotFelulirva ? (
                          <p className="text-right text-xs text-muted-foreground">A központ rögzítette, nem módosítható.</p>
                        ) : (
                          <AllapotGomb cel={c} felulir={false} />
                        ))}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TablaDoboz>
      )}

      {uj.kulcs > 0 && (
        <CelDialog
          key={uj.kulcs}
          tervId={terv.id}
          verzio={terv.verzio}
          celDb={celok.length}
          orszagok={orszagok}
          open={uj.open}
          onOpenChange={uj.setOpen}
        />
      )}
    </section>
  );
}
