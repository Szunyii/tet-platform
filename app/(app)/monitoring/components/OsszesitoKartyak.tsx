import type { ReactNode } from 'react';
import type { Osszesito } from '../../../../lib/ertekeles-osszesites';
import {
  FOKOZAT_OSZTALY,
  fokozatNev,
  fokozatRovid,
  type OsszFokozat,
} from '../../../../lib/ertekeles-szotar';
import { cn } from '../../../../lib/utils';

const SAV_SORREND: readonly OsszFokozat[] = [4, 3, 2, 1];

function Kartya({ cimke, className, children }: { cimke: string; className?: string; children: ReactNode }) {
  return (
    <div className={cn('min-w-0 rounded-lg border border-border bg-card px-3 py-2.5', className)}>
      <dt className="mb-1 text-[11px] text-muted-foreground">{cimke}</dt>
      <dd>{children}</dd>
    </div>
  );
}

function Szam({ children }: { children: ReactNode }) {
  return <span className="text-[20px] leading-tight font-semibold">{children}</span>;
}

/** Az összminősítés megoszlása színezett sávon; a darabszámok felolvasónak és szín nélkül is elérhetők. */
function MegoszlasSav({ megoszlas }: { megoszlas: Osszesito['megoszlas'] }) {
  const tagok = SAV_SORREND.filter((f) => megoszlas[f] > 0);
  if (tagok.length === 0) return <p className="text-[12px] text-muted-foreground">Még nincs összminősítés.</p>;
  const leiras = SAV_SORREND.map((f) => `${fokozatNev(f)}: ${megoszlas[f]}`).join(', ');
  return (
    <>
      <div role="img" aria-label={leiras} className="flex h-5 gap-px overflow-hidden rounded">
        {tagok.map((f) => (
          <span
            key={f}
            style={{ flexGrow: megoszlas[f] }}
            className={cn(
              'flex min-w-[18px] basis-0 items-center justify-center text-[11px] font-semibold',
              FOKOZAT_OSZTALY[f],
            )}
          >
            {megoszlas[f]}
          </span>
        ))}
      </div>
      <p aria-hidden="true" className="mt-1 text-[11px] text-muted-foreground">
        {tagok.map((f) => `${fokozatRovid(f)} ${megoszlas[f]}`).join(' · ')}
      </p>
    </>
  );
}

/** Az összesítő kártyák: a szűrt halmazra számolnak. */
export function OsszesitoKartyak({ osszesito }: { osszesito: Osszesito }) {
  return (
    <dl className="grid grid-cols-1 gap-2 @xl:grid-cols-3 @4xl:grid-cols-[11rem_minmax(15rem,1fr)_11rem_11rem]">
      <Kartya cimke="Értékelt attasék">
        <Szam>
          {osszesito.kesz} / {osszesito.osszes}
        </Szam>
      </Kartya>
      <Kartya cimke="Összminősítés megoszlása" className="@xl:order-last @xl:col-span-3 @4xl:order-none @4xl:col-span-1">
        <MegoszlasSav megoszlas={osszesito.megoszlas} />
      </Kartya>
      <Kartya cimke="Javult az előző félévhez képest">
        <Szam>{osszesito.javult} fő</Szam>
      </Kartya>
      <Kartya cimke="Romlott az előző félévhez képest">
        <Szam>{osszesito.romlott} fő</Szam>
      </Kartya>
    </dl>
  );
}
