'use client';

import type { ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { HAZAI_SZIN } from '../../../../lib/osszehasonlitas';
import { SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { MutatoKartya } from './MutatoKartya';
import { OsszehasonlitasFejlec } from './OsszehasonlitasFejlec';

/** Egy szakasz (Mutatók, Listák): kicsi, nagybetűs cím, mellette opcionális egysoros jelmagyarázat. */
function Szakasz({ cim, jelmagyarazat, children }: { cim: string; jelmagyarazat?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">
        {cim}
        {jelmagyarazat && (
          <span className="flex items-center gap-1.5 font-normal tracking-normal normal-case">{jelmagyarazat}</span>
        )}
      </h2>
      {children}
    </section>
  );
}

/**
 * Az összehasonlítás a térkép alatt, teljes szélességben (a keskeny jobb panelen nem férne el): fejléc
 * (országkártyák, „+ Ország", Magyarország), számszerű mutatónként egy kártya, és a listák mátrixa.
 * Minden ország saját színt kap (`szinek`); Magyarország – ha van rekordja a nézett évre – mindig
 * viszonyítási alap.
 */
export function OsszehasonlitasPanel({ orszagok, szinek, hazai, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad, onTorol }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha nincs a nézett évre. */
  hazai: TerkepOrszag | null;
  /** A „+ Ország" lista (a halmazban nem lévők, Magyarország nélkül; a hívó rendezi). */
  jeloltek: TerkepOrszag[];
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
  onTorol: () => void;
}) {
  const kozos = { orszagok, szinek, hazai };
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>
            {orszagok.length} ország ·{' '}
            {hazai ? 'viszonyítási alap: Magyarország' : 'viszonyítási alap nélkül (Magyarországnak nincs profilja erre az évre)'}
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Összehasonlítás törlése</Button>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <OsszehasonlitasFejlec
          {...kozos}
          jeloltek={jeloltek}
          mutato={mutato}
          onKivalaszt={onKivalaszt}
          onKivesz={onKivesz}
          onHozzaad={onHozzaad}
        />
        <Szakasz
          cim="Mutatók"
          jelmagyarazat={hazai && (
            <>
              {/* Inline style szándékosan: a jelölő színe a mutatókártyákéval azonos. */}
              <span aria-hidden className="inline-block h-3 w-0.5 rounded-full" style={{ background: HAZAI_SZIN }} />
              Magyarország szintje
            </>
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(15rem,100%),1fr))] gap-2.5">
            {SZAM_MUTATOK.map((m) => (
              <MutatoKartya key={m.kulcs} mutato={m} {...kozos} kiemelt={m.kulcs === mutato.kulcs} />
            ))}
          </div>
        </Szakasz>
      </CardContent>
    </Card>
  );
}
