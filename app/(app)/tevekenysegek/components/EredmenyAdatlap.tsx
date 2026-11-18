import Link from 'next/link';
import type { ReactNode } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { EredmenyReszlet } from '../../../../db/queries/tevekenyseg';
import { formatNaptariDatum } from '../../../../lib/datum';
import { orszagNev } from '../../../../lib/orszagok';
import { hozzajarulasCimke, tipusCimke, UGY_ALLAPOT_CIMKE } from '../../../../lib/tevekenyseg-szotar';
import { tevekenysegUrl } from '../../../../lib/tevekenyseg-szuro';
import { EsemenyIdovonal, visszakuldesMegjegyzes } from './EsemenyIdovonal';
import { IgazolasJelveny } from './IgazolasJelveny';
import { SzakaszLanc } from './SzakaszLanc';

function Adat({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-xs text-muted-foreground">{cimke}</dt>
      <dd className="text-sm break-words">{children}</dd>
    </div>
  );
}

/** Az ügyhöz kapcsolódó jelentések egyszer felsorolva: az igazoláskérések és a kapcsolódó tevékenységek hivatkozásai. */
function kapcsolodoJelentesek(ugy: EredmenyReszlet): { id: string; targy: string }[] {
  const m = new Map<string, string>();
  for (const e of ugy.esemenyek) if (e.riportId && e.riportTargy) m.set(e.riportId, e.riportTargy);
  for (const t of ugy.tevekenysegek) if (t.riportId && t.riportTargy) m.set(t.riportId, t.riportTargy);
  return [...m].map(([id, targy]) => ({ id, targy }));
}

/**
 * Az eredmény adatlapja. A `muveletek` a nézőnek megfelelő műveleteket hozza. `admin`: a visszalépés az admin füleire
 * mutat. `kifogasModosithato`: a gazda attasé módosíthatja az ügyet, ezért az útmutató neki szól.
 */
export function EredmenyAdatlap({
  ugy,
  muveletek,
  admin = false,
  kifogasModosithato = false,
}: {
  ugy: EredmenyReszlet;
  muveletek?: ReactNode;
  admin?: boolean;
  kifogasModosithato?: boolean;
}) {
  const megjegyzes = ugy.igazolas === 'visszakuldott' ? visszakuldesMegjegyzes(ugy.esemenyek) : null;
  const jelentesek = kapcsolodoJelentesek(ugy);
  // Az admin alapértelmezett füle az igazolási sor: ide csak a függő kérés adatlapjáról lép vissza.
  const sorba = admin && ugy.kertSzakasz !== null;
  return (
    <article className="flex max-w-4xl flex-col gap-4">
      <Link
        href={admin && !sorba ? tevekenysegUrl({ ful: 'eredmenyek' }) : tevekenysegUrl({})}
        className="w-fit text-xs underline underline-offset-2"
      >
        {sorba ? 'Vissza az igazolási sorhoz' : 'Vissza az eredményekhez'}
      </Link>
      <header className="flex flex-col gap-2">
        <h2 className="text-xl leading-snug font-semibold break-words">{ugy.megnevezes}</h2>
        <div className="flex flex-wrap items-center gap-2">
          {ugy.allapot === 'megszakadt' ? (
            <span className="inline-flex rounded-[10px] bg-muted px-2 py-0.5 text-[11px] font-semibold text-muted-foreground">
              {UGY_ALLAPOT_CIMKE.megszakadt}
            </span>
          ) : (
            <IgazolasJelveny igazolas={ugy.igazolas} />
          )}
        </div>
        <SzakaszLanc ugy={ugy} />
      </header>

      {megjegyzes && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
          <p className="font-medium">Visszaküldve, a központ megjegyzése:</p>
          <p className="break-words whitespace-pre-wrap">{megjegyzes}</p>
        </div>
      )}
      {ugy.kifogas && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-950">
          <p className="font-medium">A központ kifogása{ugy.kifogasSzerzoNev && ` (${ugy.kifogasSzerzoNev})`}</p>
          <p className="break-words whitespace-pre-wrap">{ugy.kifogas}</p>
          {kifogasModosithato && <p className="mt-1 text-xs">A kifogás megszűnik, ha módosítod az ügyet.</p>}
        </div>
      )}

      {muveletek}

      <Card size="sm">
        <CardHeader>
          <CardTitle role="heading" aria-level={3}>
            Az ügy adatai
          </CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 sm:grid-cols-2">
            <Adat cimke="Ország">{orszagNev(ugy.orszagKod)}</Adat>
            <Adat cimke="Partner">{ugy.partner}</Adat>
            <Adat cimke="Magyar szereplő">{ugy.magyarSzereplo ?? '–'}</Adat>
            <Adat cimke="Hozzájárulás">{hozzajarulasCimke(ugy.hozzajarulas)}</Adat>
            <Adat cimke="Attasé">{ugy.attaseNev}</Adat>
            {ugy.leiras && (
              <div className="min-w-0 sm:col-span-2">
                <dt className="text-xs text-muted-foreground">Leírás</dt>
                <dd className="text-sm break-words whitespace-pre-wrap">{ugy.leiras}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle role="heading" aria-level={3}>
            Kapcsolódó tevékenységek ({ugy.tevekenysegek.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {ugy.tevekenysegek.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ehhez az ügyhöz még nem kapcsolódik tevékenység.</p>
          ) : (
            <ul className="flex flex-col divide-y divide-border">
              {ugy.tevekenysegek.map((t) => (
                <li key={t.id} className="flex flex-col gap-0.5 py-2 first:pt-0 last:pb-0">
                  <span className="text-sm font-medium break-words">{t.megnevezes}</span>
                  <span className="text-xs break-words text-muted-foreground">
                    {formatNaptariDatum(t.datum)} · {tipusCimke(t.tipus)} · {orszagNev(t.orszagKod)} · {t.partner}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle role="heading" aria-level={3}>
            Kapcsolódó jelentések ({jelentesek.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {jelentesek.length === 0 ? (
            <p className="text-sm text-muted-foreground">Ehhez az ügyhöz még nem kapcsolódik jelentés.</p>
          ) : (
            <ul className="flex flex-col gap-1.5 text-sm">
              {jelentesek.map((j) => (
                <li key={j.id} className="break-words">
                  <Link href={`/jelentesek/${encodeURIComponent(j.id)}`} className="underline underline-offset-2">
                    {j.targy}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card size="sm">
        <CardHeader>
          <CardTitle role="heading" aria-level={3}>
            Előzmények
          </CardTitle>
        </CardHeader>
        <CardContent>
          <EsemenyIdovonal esemenyek={ugy.esemenyek} />
        </CardContent>
      </Card>
    </article>
  );
}
