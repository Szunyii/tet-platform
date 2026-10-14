'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import {
  HAZAI_SAV_SZIN, HAZAI_SZIN, nullaVonal, savHelye, savSkala, skalaHely, type SavSkala,
} from '../../../../lib/osszehasonlitas';
import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, type SzamMutato } from '../../../../lib/terkep-mutatok';

/** A térkép mutatójának kártyája: a skála legvilágosabb színe (mint a kivonat mutató-sora). */
const KIEMELT_HATTER = SKALA_SZINEK[0];

/** Egy sáv a sávháttéren; a helyek 0 és 1 közöttiek, a nem nulla érték sávja legalább 2 px. */
function Sav({ v, skala, szin, nulla, jelolo }: {
  v: number | null;
  skala: SavSkala;
  szin: string;
  /** A nullavonal helye, ha a skála negatívba nyúlik. */
  nulla: number | null;
  /** Magyarország szintje a jelölőhöz; `null` = nincs jelölő. */
  jelolo: number | null;
}) {
  const s = v === null || v === 0 ? null : savHelye(v, skala);
  // Inline style szándékosan: a hely a skálából számolt, a szín az ország színe.
  return (
    <span aria-hidden className="relative mt-1 block h-2 rounded-sm bg-muted">
      {s && (
        <span
          className="absolute inset-y-0 rounded-sm"
          style={{ left: `${s.bal * 100}%`, width: `${s.szel * 100}%`, minWidth: 2, background: szin }}
        />
      )}
      {nulla !== null && (
        <span className="absolute -inset-y-0.5 w-px bg-muted-foreground/60" style={{ left: `${nulla * 100}%` }} />
      )}
      {jelolo !== null && (
        <span
          className="absolute -inset-y-1 w-0.5 -translate-x-1/2 rounded-full"
          style={{ left: `${jelolo * 100}%`, background: HAZAI_SZIN }}
        />
      )}
    </span>
  );
}

/**
 * Egy számszerű mutató az összehasonlításban: országonként egy sáv közös, nulláról induló skálán (a
 * kiválasztottak és Magyarország értékeiből, a mutató `felsoHatar`-ával), a halmaz sorrendjében – így
 * minden kártyán ugyanott áll az ország. Kétsoros sorok, mint a RangsorPanel-en: fent a név és az
 * érték, alatta a sáv. Alul Magyarország szürke sávja; a fekete jelölő minden ország sávján a magyar
 * szintet mutatja.
 */
export function MutatoKartya({ mutato, orszagok, szinek, hazai, kiemelt }: {
  mutato: SzamMutato;
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: readonly TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha nincs a nézett évre. */
  hazai: TerkepOrszag | null;
  /** Ez a térkép mutatója: a kártya kiemelt hátteret kap. */
  kiemelt: boolean;
}) {
  const hazaiErtek = hazai ? mutato.ertek(hazai) : null;
  const skala = savSkala([...orszagok.map((o) => mutato.ertek(o)), hazaiErtek], mutato.felsoHatar);
  const nulla = skala && nullaVonal(skala);
  const jelolo = skala && hazaiErtek !== null ? skalaHely(hazaiErtek, skala) : null;
  return (
    // Inline style szándékosan: a kiemelés színe a térkép skálájából jön.
    <section
      className="flex flex-col gap-2 rounded-lg border p-3"
      style={kiemelt ? { background: KIEMELT_HATTER } : undefined}
    >
      <h3 className="flex flex-wrap items-baseline gap-x-2 text-sm font-medium">
        {mutato.cimke}
        {kiemelt && <span className="text-xs font-normal text-muted-foreground">a térkép mutatója</span>}
      </h3>
      {skala === null ? (
        <p className="text-sm text-muted-foreground">Nincs adat.</p>
      ) : (
        <ul className="flex flex-col gap-1.5">
          {orszagok.map((o) => {
            const v = mutato.ertek(o);
            return (
              <li key={o.kod}>
                <span className="flex items-baseline gap-2 text-xs">
                  <span className="min-w-0 flex-1 truncate" title={o.nev}>{o.nev}</span>
                  <span className="shrink-0 font-mono">{formatSzam(v, mutato.utotag)}</span>
                </span>
                <Sav v={v} skala={skala} szin={szinek[o.kod]} nulla={nulla} jelolo={jelolo} />
              </li>
            );
          })}
          {hazai && (
            <li className="mt-1 border-t border-dashed pt-2 text-muted-foreground">
              <span className="flex items-baseline gap-2 text-xs">
                <span className="min-w-0 flex-1 truncate">
                  Magyarország<span className="sr-only"> (viszonyítási alap)</span>
                </span>
                <span className="shrink-0 font-mono">{formatSzam(hazaiErtek, mutato.utotag)}</span>
              </span>
              <Sav v={hazaiErtek} skala={skala} szin={HAZAI_SAV_SZIN} nulla={nulla} jelolo={null} />
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
