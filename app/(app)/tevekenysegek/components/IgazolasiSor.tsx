'use client';

import Link from 'next/link';
import type { IgazolasKeresSor } from '../../../../db/queries/tevekenyseg';
import { formatDatumIdo } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import { hozzajarulasCimke, szakaszCimke } from '../../../../lib/tevekenyseg-szotar';
import { KulsoLink } from '../../tudastar/components/KulsoLink';
import { AdminUgyGombok, useListaFokusz, useMegjegyzesDialog, type MegjegyzesKeres } from './AdminUgyMuveletek';

function KeresSor({ k, nyit }: { k: IgazolasKeresSor; nyit: (keres: MegjegyzesKeres) => void }) {
  const adatok = [
    k.attaseNev,
    k.varos ?? orszagNev(k.orszagKod),
    hozzajarulasCimke(k.hozzajarulas).toLocaleLowerCase('hu'),
    `${k.tevekenysegDb} tevékenység`,
    `${k.jelentesDb} jelentés`,
  ];
  return (
    <li
      data-sor
      tabIndex={-1}
      className="grid gap-3 p-3 outline-none focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:ring-inset lg:grid-cols-[minmax(0,1fr)_auto] lg:gap-4"
    >
      <div className="flex min-w-0 flex-col items-start gap-1">
        <h3 className="text-[13px] leading-snug font-semibold break-words">
          <Link href={`/tevekenysegek/eredmeny/${encodeURIComponent(k.id)}`} className="underline underline-offset-2">
            {k.megnevezes}
          </Link>
        </h3>
        <p className="text-xs break-words text-muted-foreground">{adatok.join(' · ')}</p>
        {k.kertSzakasz && (
          <p className="rounded-[4px] bg-blue-100 px-1.5 py-0.5 text-[11px] font-semibold text-blue-900">
            {szakaszCimke(k.szakasz)} <span aria-hidden="true">→</span>
            <span className="sr-only">, kért szakasz:</span> {szakaszCimke(k.kertSzakasz)}
          </p>
        )}
        <p className="text-xs text-muted-foreground">Kérve: {formatDatumIdo(k.keres.createdAt)}</p>
        {k.keres.szoveg && (
          <p className="w-full rounded-[4px] bg-muted px-2 py-1.5 text-[13px] break-words whitespace-pre-wrap">{k.keres.szoveg}</p>
        )}
        {k.keres.link && (
          <p className="max-w-full text-xs break-all">
            Link:{' '}
            <KulsoLink href={k.keres.link} className="underline underline-offset-2">
              {k.keres.link}
            </KulsoLink>
          </p>
        )}
        {k.keres.riportId && k.keres.riportTargy && (
          <p className="max-w-full text-xs break-words">
            Kapcsolódó jelentés:{' '}
            <Link href={`/jelentesek/${encodeURIComponent(k.keres.riportId)}`} className="underline underline-offset-2">
              {k.keres.riportTargy}
            </Link>
          </p>
        )}
        {k.kifogas && (
          <p className="w-full rounded-[4px] bg-red-50 px-2 py-1.5 text-xs break-words text-red-950">
            <span className="font-semibold">Kifogásolva{k.kifogasSzerzoNev && ` (${k.kifogasSzerzoNev})`}:</span> {k.kifogas} Az igazolás
            megszünteti a kifogást.
          </p>
        )}
      </div>
      <div className="flex flex-wrap items-start gap-1.5 lg:justify-end">
        <AdminUgyGombok ugy={k} nyit={nyit} />
      </div>
    </li>
  );
}

/** Az igazolásra váró kérések a legrégebbitől kezdve, soronként a döntéshez szükséges adatokkal. */
export function IgazolasiSor({ keresek }: { keresek: readonly IgazolasKeresSor[] }) {
  const fokusz = useListaFokusz(keresek.map((k) => `${k.id}:${k.verzio}`).join());
  const dialog = useMegjegyzesDialog(fokusz.ellenoriz);

  return (
    <div
      ref={fokusz.kontener}
      tabIndex={-1}
      onFocusCapture={fokusz.onFocusCapture}
      className="rounded-lg outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
    >
      {keresek.length === 0 ? (
        <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
          Nincs igazolásra váró kérés.
        </p>
      ) : (
        <ul aria-label="Igazolásra váró kérések" className="divide-y divide-border rounded-lg border border-border bg-card">
          {keresek.map((k) => (
            <KeresSor key={k.id} k={k} nyit={dialog.nyit} />
          ))}
        </ul>
      )}
      {dialog.elem}
    </div>
  );
}
