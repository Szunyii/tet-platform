'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useRef, useState, type ReactNode } from 'react';
import { useNyitas } from '../../../../components/form/useNyitas';
import { Button } from '../../../../components/ui/button';
import type { FelevSzam } from '../../../../lib/ertekeles-idoszak';
import { tevekenysegUrl } from '../../../../lib/tevekenyseg-szuro';
import { cn } from '../../../../lib/utils';
import { EredmenyDialog } from './EredmenyDialog';
import { TevekenysegDialog, type TevekenysegElotoltes, type TevekenysegUrlapAdat } from './TevekenysegDialog';

export function SzuroLink({ href, aktiv, children }: { href: string; aktiv: boolean; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={aktiv ? 'true' : undefined}
      className={cn(
        'rounded-md border px-2.5 py-1 text-xs no-underline hover:no-underline',
        aktiv ? 'border-foreground bg-foreground font-semibold text-background' : 'border-input bg-background text-foreground',
      )}
    >
      {children}
    </Link>
  );
}

export function FulLink({ href, aktiv, darab, children }: { href: string; aktiv: boolean; darab: number; children: ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={aktiv ? 'page' : undefined}
      className={cn(
        '-mb-px border-b-2 px-3 py-2 text-[13px] no-underline hover:no-underline',
        aktiv ? 'border-foreground font-semibold text-foreground' : 'border-transparent font-medium text-muted-foreground',
      )}
    >
      {children}
      <span className="ml-1.5 rounded-[9px] bg-muted px-1.5 text-[11px] text-foreground">{darab}</span>
    </Link>
  );
}

/** Az attasé nézetének kerete: fejléc az új bejegyzés gombjaival, fülek, szűrők; a fül tartalma a `children`. */
export function AttaseNezet({
  nev,
  allomashely,
  ev,
  ful,
  felev,
  megszakadt,
  eredmenyDb,
  megszakadtDb,
  tevekenysegDb,
  adat,
  ujNyitva,
  elotoltes,
  children,
}: {
  nev: string;
  allomashely: string | null;
  ev: number;
  ful: 'eredmenyek' | 'tevekenysegek';
  felev: FelevSzam | null;
  megszakadt: boolean;
  /** A táblán látható aktív ügyek száma. */
  eredmenyDb: number;
  megszakadtDb: number;
  tevekenysegDb: number;
  adat: TevekenysegUrlapAdat;
  /** A `?uj=tevekenyseg` párbeszédablaka nyitva érkezik. */
  ujNyitva: boolean;
  elotoltes: TevekenysegElotoltes | null;
  children: ReactNode;
}) {
  const router = useRouter();
  const ujEredmeny = useNyitas();
  const ujTevekenyseg = useNyitas();
  const ujGomb = useRef<HTMLButtonElement>(null);
  // Az URL-ből nyitott párbeszédablak: bezáráskor a paraméterek lekerülnek, hogy újratöltéskor vagy a mentés utáni
  // frissítéskor ne nyíljon meg újra. Nincs kiváltó gombja, ezért a fókusz az „Új tevékenység” gombra kerül.
  const [urlbolNyitva, setUrlbolNyitva] = useState(ujNyitva);
  const [elozoUjNyitva, setElozoUjNyitva] = useState(ujNyitva);
  if (elozoUjNyitva !== ujNyitva) {
    setElozoUjNyitva(ujNyitva);
    if (ujNyitva) setUrlbolNyitva(true);
  }

  function urlbolZar(open: boolean) {
    setUrlbolNyitva(open);
    if (open) return;
    router.replace(tevekenysegUrl({ ful: ful === 'tevekenysegek' ? ful : null, felev, megszakadt }), { scroll: false });
    window.setTimeout(() => ujGomb.current?.focus(), 250);
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-start gap-x-4 gap-y-2">
        <div className="min-w-0">
          <h2 className="text-base leading-snug font-semibold">{nev}</h2>
          <p className="text-xs text-muted-foreground">
            {allomashely && `${allomashely} · `}
            {ev}
          </p>
        </div>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button type="button" variant="outline" onClick={ujEredmeny.nyit}>
            + Új eredmény
          </Button>
          <Button ref={ujGomb} type="button" onClick={ujTevekenyseg.nyit}>
            + Új tevékenység
          </Button>
        </div>
      </div>

      <nav aria-label="Nézet" className="flex flex-wrap gap-0.5 border-b border-border">
        <FulLink href={tevekenysegUrl({})} aktiv={ful === 'eredmenyek'} darab={eredmenyDb}>
          Eredmények
        </FulLink>
        <FulLink href={tevekenysegUrl({ ful: 'tevekenysegek', felev })} aktiv={ful === 'tevekenysegek'} darab={tevekenysegDb}>
          Tevékenységek
        </FulLink>
      </nav>

      {ful === 'eredmenyek' ? (
        <div role="group" aria-label="Ügyek szűrése" className="flex flex-wrap gap-1.5">
          <SzuroLink href={tevekenysegUrl({})} aktiv={!megszakadt}>
            Aktív ügyek
          </SzuroLink>
          <SzuroLink href={tevekenysegUrl({ megszakadt: true })} aktiv={megszakadt}>
            Megszakadt ügyek ({megszakadtDb})
          </SzuroLink>
        </div>
      ) : (
        <div role="group" aria-label="Félév szűrése" className="flex flex-wrap gap-1.5">
          <SzuroLink href={tevekenysegUrl({ ful })} aktiv={felev === null}>
            Mind
          </SzuroLink>
          <SzuroLink href={tevekenysegUrl({ ful, felev: 1 })} aktiv={felev === 1}>
            1. félév
          </SzuroLink>
          <SzuroLink href={tevekenysegUrl({ ful, felev: 2 })} aktiv={felev === 2}>
            2. félév
          </SzuroLink>
        </div>
      )}

      {children}

      {ujEredmeny.kulcs > 0 && (
        <EredmenyDialog
          key={`eredmeny-${ujEredmeny.kulcs}`}
          orszagok={adat.orszagok}
          open={ujEredmeny.open}
          onOpenChange={ujEredmeny.setOpen}
        />
      )}
      {ujTevekenyseg.kulcs > 0 && (
        <TevekenysegDialog key={`tevekenyseg-${ujTevekenyseg.kulcs}`} adat={adat} open={ujTevekenyseg.open} onOpenChange={ujTevekenyseg.setOpen} />
      )}
      {ujNyitva && (
        <TevekenysegDialog
          key={`url-${elotoltes?.riportId ?? 'ures'}`}
          adat={adat}
          elotoltes={elotoltes}
          open={urlbolNyitva}
          onOpenChange={urlbolZar}
        />
      )}
    </div>
  );
}
