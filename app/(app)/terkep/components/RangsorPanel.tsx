'use client';

import { Check, Plus } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { formatSzam } from '../../../../lib/szam';
import { arany, SKALA_SZINEK, type Csoport, type Mutato, type Rangsor, type Tartomany } from '../../../../lib/terkep-mutatok';

const SAV_SZIN = SKALA_SZINEK[3];
/** A legkisebb érték sávja se tűnjön el: a térképen a minimum is kap (a legvilágosabb) színt. */
const SAV_MIN_SZAZALEK = 2;

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
    // Két soros: fent hely + név + érték, alatta a teljes szélességű sáv – a keskeny panelen (~330–420 px)
    // a három elem egy sorban nem fér el, a hosszú országnevek csonkolódnának.
    <li className="rounded-md hover:bg-muted/60">
      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onKivalaszt(o.kod)}
          className="flex min-w-0 flex-1 items-center gap-2 rounded-md px-1 py-1 text-left text-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
        >
          {hely !== undefined && <span className="w-6 shrink-0 text-right font-mono text-xs text-muted-foreground">{hely}.</span>}
          <span className="min-w-0 flex-1 truncate font-medium" title={o.nev}>{o.nev}</span>
          {ertek !== undefined && <span className="shrink-0 font-mono text-xs text-muted-foreground">{ertek}</span>}
        </button>
        {/* A letiltott gombon a title nem jelenne meg (natív disabled + pointer-events-none); a korlátot a csík írja ki. */}
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          aria-label={benne ? `${o.nev} kivétele az összehasonlításból` : `${o.nev} hozzáadása az összehasonlításhoz`}
          disabled={!benne && vsTele}
          onClick={() => onVsToggle(o.kod)}
        >
          {benne ? <Check /> : <Plus />}
        </Button>
      </div>
      {sav !== undefined && (
        <span className="mx-1 mb-1 block h-1.5 overflow-hidden rounded-sm bg-muted">
          {/* Inline style szándékosan: a sáv színe a térkép skálájából jön. */}
          <span className="block h-full" style={{ width: `${Math.max(SAV_MIN_SZAZALEK, Math.round(sav * 100))}%`, background: SAV_SZIN }} />
        </span>
      )}
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
  const sav = mutato.tipus === 'szam' && tartomany ? arany(mutato, tartomany) : () => 0;
  const sor = (o: TerkepOrszag, extra: { hely?: number; sav?: number; ertek?: string } = {}) => (
    <OrszagSor key={o.kod} o={o} {...extra} benne={vs.includes(o.kod)} vsTele={vsTele} onKivalaszt={onKivalaszt} onVsToggle={onVsToggle} />
  );
  const nincsTalalat = <p className="text-sm text-muted-foreground">Egy ország sem felel meg a szűrőnek.</p>;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{mutato.tipus === 'szam' ? 'Rangsor' : 'Országok'} · {mutato.cimke}</CardTitle>
        <CardDescription>{szamlalo}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {mutato.tipus === 'szam' && rangsor ? (
          <>
            {rangsor.sorok.length === 0 ? (
              rangsor.adatNelkul.length === 0
                ? nincsTalalat
                : <p className="text-sm text-muted-foreground">Ehhez a mutatóhoz még nincs adat.</p>
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
        ) : csoportok.length === 0 ? (
          nincsTalalat
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
