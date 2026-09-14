'use client';

import { Check, Plus } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { formatSzam } from '../../../../lib/szam';
import { arany, SKALA_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany } from '../../../../lib/terkep-mutatok';
import { VS_MAX } from './useTerkepAllapot';

const SAV_SZIN = SKALA_SZINEK[3];

function OrszagSor({ o, hely, sav, ertek, benne, vsTele, onKivalaszt, onVsToggle }: {
  o: TerkepOrszag;
  hely?: number;
  /** 0–1, a sáv szélessége; nincs → nincs sáv. */
  sav?: number;
  ertek?: string;
  benne: boolean;
  vsTele: boolean;
  onKivalaszt: (kod: string) => void;
  onVsToggle: (kod: string) => void;
}) {
  return (
    <li className="flex items-center gap-1.5 py-0.5">
      {hely !== undefined && <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{hely}.</span>}
      <button
        type="button"
        onClick={() => onKivalaszt(o.kod)}
        className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm hover:bg-muted/60"
      >
        <span className={sav !== undefined ? 'w-28 shrink-0 truncate font-medium' : 'min-w-0 flex-1 truncate font-medium'}>{o.nev}</span>
        {sav !== undefined && (
          <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-sm bg-muted">
            {/* Inline style szándékosan: a sáv színe a térkép skálájából jön. */}
            <span className="block h-full" style={{ width: `${Math.round(sav * 100)}%`, background: SAV_SZIN }} />
          </span>
        )}
        {ertek !== undefined && <span className="ml-auto shrink-0 font-mono text-xs text-muted-foreground">{ertek}</span>}
      </button>
      <Button
        type="button"
        variant="ghost"
        size="icon-xs"
        aria-label={benne ? `${o.nev} kivétele az összehasonlításból` : `${o.nev} hozzáadása az összehasonlításhoz`}
        title={!benne && vsTele ? `Legfeljebb ${VS_MAX} ország` : undefined}
        disabled={!benne && vsTele}
        onClick={() => onVsToggle(o.kod)}
      >
        {benne ? <Check /> : <Plus />}
      </Button>
    </li>
  );
}

/** A térkép melletti panel kijelölés nélkül: rangsor (számszerű mutató) vagy csoportosított lista (kategorikus). */
export function RangsorPanel({ mutato, rangsor, csoportok, tartomany, szamlalo, vs, vsTele, onKivalaszt, onVsToggle }: {
  mutato: Mutato;
  rangsor: Rangsor | null;
  csoportok: Csoport[];
  tartomany: Tartomany | null;
  /** A fejléc számláló szövege (pl. „14 ország adattal · 4 adat nélkül"). */
  szamlalo: string;
  vs: readonly string[];
  /** A halmaz tele (VS_MAX): a „+" gombok letiltva. */
  vsTele: boolean;
  onKivalaszt: (kod: string) => void;
  onVsToggle: (kod: string) => void;
}) {
  // A sáv ugyanazt a (lineáris vagy symlog) arányt használja, mint a térkép színe.
  const sav = mutato.tipus === 'szam' && tartomany ? arany(mutato, tartomany) : () => 1;
  const sor = (o: TerkepOrszag, extra: { hely?: number; sav?: number; ertek?: string } = {}) => (
    <OrszagSor key={o.kod} o={o} {...extra} benne={vs.includes(o.kod)} vsTele={vsTele} onKivalaszt={onKivalaszt} onVsToggle={onVsToggle} />
  );
  return (
    <Card>
      <CardHeader>
        <CardTitle>Rangsor · {mutato.cimke}</CardTitle>
        <CardDescription>{szamlalo}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {mutato.tipus === 'szam' && rangsor ? (
          <>
            {rangsor.sorok.length === 0 ? (
              <p className="text-sm text-muted-foreground">Ehhez a mutatóhoz még nincs adat.</p>
            ) : (
              <ul className="divide-y divide-border">
                {rangsor.sorok.map((s) => sor(s.o, { hely: s.hely, sav: sav(s.ertek), ertek: formatSzam(s.ertek, mutato.utotag) }))}
              </ul>
            )}
            {rangsor.adatNelkul.length > 0 && (
              <div>
                <p className="mb-1 text-xs font-medium tracking-wide text-muted-foreground uppercase">Nincs adat</p>
                <ul className="divide-y divide-border">{rangsor.adatNelkul.map((o) => sor(o))}</ul>
              </div>
            )}
          </>
        ) : (
          csoportok.map((cs) => (
            <div key={cs.kategoria ?? '__nincs'}>
              <p className="mb-1 flex items-center gap-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
                {/* Inline style szándékosan: a szín a térképpel közös szótárból jön. */}
                <span className="size-2.5 shrink-0 rounded-sm" style={{ background: cs.szin }} />
                <span className="truncate">{cs.cimke}</span>
                <span className="ml-auto shrink-0 font-mono normal-case">{cs.orszagok.length} ország</span>
              </p>
              {cs.orszagok.length > 0 && <ul className="divide-y divide-border">{cs.orszagok.map((o) => sor(o))}</ul>}
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
