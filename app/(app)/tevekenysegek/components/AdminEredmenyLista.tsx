'use client';

import Link from 'next/link';
import { Fragment } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { EredmenySor } from '../../../../db/queries/tevekenyseg';
import { orszagNev } from '../../../../lib/orszagok';
import { szakaszCimke, UGY_ALLAPOT_CIMKE } from '../../../../lib/tevekenyseg-szotar';
import { cn } from '../../../../lib/utils';
import { AdminUgyGombok, useListaFokusz, useMegjegyzesDialog } from './AdminUgyMuveletek';
import { IgazolasJelveny } from './IgazolasJelveny';

/** A táblázatsoron a `ring` nem látszik megbízhatóan, ezért körvonal jelzi a fókuszt. */
const SOR_FOKUSZ = 'outline-none focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-ring';
const OSZLOP_DB = 7;

/** A hálózat összes ügye a szűrők szerint; a sorban az állapotgép által engedett központi műveletek. */
export function AdminEredmenyLista({ eredmenyek }: { eredmenyek: readonly EredmenySor[] }) {
  const fokusz = useListaFokusz(eredmenyek.map((u) => `${u.id}:${u.verzio}`).join());
  const dialog = useMegjegyzesDialog(fokusz.ellenoriz);

  return (
    <div
      ref={fokusz.kontener}
      tabIndex={-1}
      onFocusCapture={fokusz.onFocusCapture}
      className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {eredmenyek.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Nincs a szűrésnek megfelelő ügy.
        </p>
      ) : (
        <div className="rounded-lg border border-border bg-card">
          <Table className="min-w-[60rem]">
            <TableHeader>
              <TableRow>
                <TableHead>Ügy</TableHead>
                <TableHead>Attasé</TableHead>
                <TableHead>Ország</TableHead>
                <TableHead>Szakasz</TableHead>
                <TableHead>Állapot</TableHead>
                <TableHead>Tevékenység</TableHead>
                <TableHead className="text-right">Műveletek</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {eredmenyek.map((u) => (
                <Fragment key={u.id}>
                  <TableRow
                    data-sor
                    tabIndex={-1}
                    className={cn(SOR_FOKUSZ, u.kifogas && 'border-b-0')}
                  >
                    <TableCell className="max-w-64 align-top break-words whitespace-normal">
                      <Link
                        href={`/tevekenysegek/eredmeny/${encodeURIComponent(u.id)}`}
                        className="font-medium underline underline-offset-2"
                      >
                        {u.megnevezes}
                      </Link>
                      <div className="text-xs text-muted-foreground">{u.partner}</div>
                    </TableCell>
                    <TableCell className="max-w-44 align-top break-words whitespace-normal">
                      {u.attaseNev}
                      <div className="text-xs text-muted-foreground">{u.varos ?? orszagNev(u.orszagKod)}</div>
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">{orszagNev(u.orszagKod)}</TableCell>
                    <TableCell className="align-top whitespace-nowrap">
                      {szakaszCimke(u.szakasz)}
                      {u.kertSzakasz && <div className="text-xs text-muted-foreground">Kért: {szakaszCimke(u.kertSzakasz)}</div>}
                    </TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-col items-start gap-1">
                        {u.allapot === 'megszakadt' ? (
                          <span className="inline-flex rounded-[10px] bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
                            {UGY_ALLAPOT_CIMKE.megszakadt}
                          </span>
                        ) : (
                          <IgazolasJelveny igazolas={u.igazolas} />
                        )}
                        {u.kifogas && (
                          <span className="inline-flex rounded-[10px] bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-900">
                            <span aria-hidden="true" className="mr-1">
                              !
                            </span>
                            Kifogásolva
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="align-top whitespace-nowrap">{u.tevekenysegDb}</TableCell>
                    <TableCell className="align-top">
                      <div className="flex flex-wrap justify-end gap-1">
                        <AdminUgyGombok ugy={u} nyit={dialog.nyit} />
                      </div>
                    </TableCell>
                  </TableRow>
                  {u.kifogas && (
                    <TableRow>
                      <TableCell colSpan={OSZLOP_DB} className="bg-red-50 text-xs break-words whitespace-normal text-red-950">
                        <span className="font-semibold">Kifogásolva{u.kifogasSzerzoNev && ` (${u.kifogasSzerzoNev})`}:</span> {u.kifogas}
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
