'use client';

import { memo, type ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { AGAZATOK, KFI_PRIORITASOK, TAGSAGOK } from '../../../../lib/orszagprofil-szotar';
import { HAZAI_SZIN } from '../../../../lib/osszehasonlitas';
import { SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { ListaMatrix } from './ListaMatrix';
import { MutatoKartya } from './MutatoKartya';
import { OsszehasonlitasFejlec } from './OsszehasonlitasFejlec';

/**
 * Egy szakasz (Mutatók, Listák): kicsi, nagybetűs cím, mellette opcionális egysoros jelmagyarázat. A
 * jelmagyarázat a címsoron kívül van (különben a felolvasó a címsor nevébe olvasná), és `aria-hidden`:
 * csak a szintén rejtett grafikát (jelölő, rombusz) magyarázza.
 */
function Szakasz({ cim, jelmagyarazat, children }: { cim: string; jelmagyarazat?: ReactNode; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
        <h3 className="font-medium tracking-wide uppercase">{cim}</h3>
        {jelmagyarazat && <p aria-hidden className="flex items-center gap-1.5">{jelmagyarazat}</p>}
      </div>
      {children}
    </section>
  );
}

/**
 * Az összehasonlítás a térkép alatt, teljes szélességben (a keskeny jobb panelen nem férne el): fejléc
 * (országkártyák, „+ Ország", Magyarország), számszerű mutatónként egy kártya, és a listák mátrixa.
 * Minden ország saját színt kap (`szinek`); Magyarország – ha legfeljebb a nézett évig van profilja –
 * mindig viszonyítási alap. Címsor-szintek: a panel címe 2-es szintű (az AppShell lapcíme a `h1`), a
 * szakaszok `h3`, a kártyák `h4`. memo: minden propja stabil (useMemo/useCallback a TerkepNezetben és a
 * useTerkepAllapotban), így a kijelölés vagy az iparág-szűrő változása nem rendereli újra a kártyákat és
 * a mátrixokat.
 */
export const OsszehasonlitasPanel = memo(function OsszehasonlitasPanel({
  orszagok, szinek, hazai, jeloltek, mutato, vsTele, onKivalaszt, onKivesz, onHozzaad, onTorol,
}: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha legfeljebb a nézett évig nincs profilja. */
  hazai: TerkepOrszag | null;
  /** A „+ Ország" lista (a halmazban nem lévők, Magyarország nélkül; a hívó rendezi). */
  jeloltek: TerkepOrszag[];
  mutato: Mutato;
  /** A halmaz tele (`TerkepAllapot.vsTele`). */
  vsTele: boolean;
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
          <CardTitle role="heading" aria-level={2}>Összehasonlítás</CardTitle>
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
          vsTele={vsTele}
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
          {/* Legalább 15rem széles oszlopok, de legfeljebb 4 (a 23% miatt): széles képernyőn 4+3 kártya. */}
          <div className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,max(15rem,23%)),1fr))] gap-2.5">
            {SZAM_MUTATOK.map((m) => (
              <MutatoKartya key={m.kulcs} mutato={m} {...kozos} kiemelt={m.kulcs === mutato.kulcs} />
            ))}
          </div>
        </Szakasz>
        <Szakasz
          cim="Listák"
          jelmagyarazat={hazai && (
            <>
              {/* Inline style szándékosan: a rombusz színe a mátrixéval azonos. */}
              <span aria-hidden className="inline-block size-2 rotate-45" style={{ background: HAZAI_SZIN }} />
              Magyarország
            </>
          )}
        >
          <div className="grid grid-cols-[repeat(auto-fit,minmax(min(20rem,100%),1fr))] items-start gap-2.5">
            <ListaMatrix cim="Kiemelt iparágak" sorrend={AGAZATOK} elemek={(o) => o.iparagak} {...kozos} />
            <ListaMatrix cim="KFI-prioritások" sorrend={KFI_PRIORITASOK} elemek={(o) => o.prioritasok} {...kozos} />
            <ListaMatrix cim="Tagságok" sorrend={TAGSAGOK} elemek={(o) => o.alapadatok?.tagsagok ?? []} {...kozos} />
          </div>
        </Szakasz>
      </CardContent>
    </Card>
  );
});
