'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Button } from '../../../../components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { TevekenysegSor } from '../../../../db/queries/tevekenyseg';
import { formatNaptariDatum } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import { tipusCimke } from '../../../../lib/tevekenyseg-szotar';
import { cn } from '../../../../lib/utils';
import { kifogasolTevekenysegAction, visszavonTevekenysegKifogasAction } from '../actions';
import {
  AzonnaliGomb,
  useAzonnaliMuvelet,
  useListaFokusz,
  useMegjegyzesDialog,
  type MegjegyzesKeres,
} from './AdminUgyMuveletek';

/** A táblázatsoron a `ring` nem látszik megbízhatóan, ezért körvonal jelzi a fókuszt. */
const SOR_FOKUSZ = 'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';
const OSZLOP_DB = 9;

function KifogasGomb({ t, nyit }: { t: TevekenysegSor; nyit: (keres: MegjegyzesKeres) => void }) {
  const { pending, futtat } = useAzonnaliMuvelet();

  if (t.kifogas) {
    return (
      <AzonnaliGomb
        pending={pending}
        variant="outline"
        aria-label={`Kifogás visszavonása: ${t.megnevezes}`}
        onClick={() => futtat(() => visszavonTevekenysegKifogasAction(t.id, t.verzio), 'A kifogás visszavonva.')}
      >
        Kifogás visszavonása
      </AzonnaliGomb>
    );
  }
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      aria-label={`Kifogásolás: ${t.megnevezes}`}
      onClick={() =>
        nyit({
          action: kifogasolTevekenysegAction.bind(null, t.id),
          verzio: t.verzio,
          cim: 'A tevékenység kifogásolása',
          leiras:
            'A kifogásolt tevékenység nem számít a mutatókba, az attasé látja a megjegyzést. A kifogás megszűnik, ha az attasé módosítja a bejegyzést, vagy ha visszavonod.',
          gomb: 'Kifogásolás',
          siker: 'A kifogás rögzítve.',
        })
      }
    >
      Kifogásolás
    </Button>
  );
}

/** A hálózat tevékenységei dátum szerint csökkenően; a kifogásolt sor alatt a központ megjegyzése áll. */
export function AdminTevekenysegLista({ tevekenysegek }: { tevekenysegek: readonly TevekenysegSor[] }) {
  const fokusz = useListaFokusz(tevekenysegek.map((t) => `${t.id}:${t.verzio}`).join());
  const dialog = useMegjegyzesDialog(fokusz.ellenoriz);

  return (
    <div
      ref={fokusz.kontener}
      tabIndex={-1}
      onFocusCapture={fokusz.onFocusCapture}
      className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {tevekenysegek.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Nincs a szűrésnek megfelelő tevékenység.
        </p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table className="min-w-[68rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Dátum</TableHead>
                <TableHead>Típus</TableHead>
                <TableHead>Megnevezés</TableHead>
                <TableHead>Attasé</TableHead>
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
                  <TableRow
                    data-sor
                    tabIndex={-1}
                    className={cn(SOR_FOKUSZ, t.kifogas && 'border-b-0')}
                  >
                    <TableCell className="align-top whitespace-nowrap">{formatNaptariDatum(t.datum)}</TableCell>
                    <TableCell className="align-top whitespace-nowrap">{tipusCimke(t.tipus)}</TableCell>
                    <TableCell className="max-w-56 align-top font-medium break-words whitespace-normal">{t.megnevezes}</TableCell>
                    <TableCell className="max-w-40 align-top break-words whitespace-normal">{t.attaseNev}</TableCell>
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
                    <TableCell className="align-top text-right">
                      <KifogasGomb t={t} nyit={dialog.nyit} />
                    </TableCell>
                  </TableRow>
                  {t.kifogas && (
                    <TableRow>
                      <TableCell colSpan={OSZLOP_DB} className="bg-red-50 text-xs break-words whitespace-normal text-red-950">
                        <span className="font-semibold">Kifogásolva{t.kifogasSzerzoNev && ` (${t.kifogasSzerzoNev})`}:</span> {t.kifogas}
                      </TableCell>
                    </TableRow>
                  )}
                </Fragment>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
      {dialog.elem}
    </div>
  );
}
