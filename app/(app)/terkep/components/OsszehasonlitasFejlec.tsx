'use client';

import { X } from 'lucide-react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { Button } from '../../../../components/ui/button';
import { attaseNelkulFelirat, attasekRovid } from '../../../../lib/attase-orszag';
import { HAZAI_SZIN } from '../../../../lib/osszehasonlitas';
import { formatSzam } from '../../../../lib/szam';
import type { Mutato } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';
import { VS_MAX } from './useTerkepAllapot';

/** A fejléc-kártyák közös kerete; balra a színcsík (`Csik`) helye. */
const KARTYA = 'relative flex flex-col items-start gap-1.5 overflow-hidden rounded-lg border py-2.5 pr-2.5 pl-4';

/** A kártya bal szélén az ország színe – ugyanez a sávoké és a mátrix-pöttyöké. */
function Csik({ szin }: { szin: string }) {
  // Inline style szándékosan: a szín az összehasonlítás palettájából jön.
  return <span aria-hidden className="absolute inset-y-0 left-0 w-1" style={{ background: szin }} />;
}

/** Az országnév gombként: a jobb panelen megnyitja az ország kivonatát. */
function NevGomb({ o, onKivalaszt }: { o: TerkepOrszag; onKivalaszt: (kod: string) => void }) {
  return (
    <button
      type="button"
      className="min-w-0 rounded-sm text-left font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
      onClick={() => onKivalaszt(o.kod)}
    >
      {o.nev}
    </button>
  );
}

/**
 * Az összehasonlítás fejléce: országonként egy kártya (név → kivonat; a kód a saját színben – ez köti a
 * mátrix oszlopfejlécéhez –; kivétel; attasé; állapot), utána a „+ Ország" választó, ha van még hely és
 * jelölt, végül Magyarország viszonyítási kártyája (kivétel-gomb nélkül).
 */
export function OsszehasonlitasFejlec({ orszagok, szinek, hazai, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: readonly TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha nincs a nézett évre. */
  hazai: TerkepOrszag | null;
  /** A „+ Ország" lista (a halmazban nem lévők, Magyarország nélkül; a hívó rendezi). */
  jeloltek: readonly TerkepOrszag[];
  /** A térkép mutatója: számszerűnél a „+ Ország" opciói az értéket is mutatják. */
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
}) {
  const plusz = orszagok.length < VS_MAX && jeloltek.length > 0;
  const felirat = (o: TerkepOrszag) =>
    mutato.tipus === 'szam' ? `${o.nev} · ${formatSzam(mutato.ertek(o), mutato.utotag)}` : o.nev;
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(min(11rem,100%),1fr))] gap-2.5">
      {orszagok.map((o) => (
        <div key={o.kod} className={KARTYA}>
          <Csik szin={szinek[o.kod]} />
          <span className="flex w-full items-start gap-1.5">
            <NevGomb o={o} onKivalaszt={onKivalaszt} />
            {/* Inline style szándékosan: a kód a saját színben, mint a mátrix oszlopfejlécében. */}
            <span className="mt-0.5 font-mono text-[11px] font-semibold" style={{ color: szinek[o.kod] }}>{o.kod}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-xs"
              className="ml-auto shrink-0"
              aria-label={`${o.nev} kivétele`}
              onClick={() => onKivesz(o.kod)}
            >
              <X />
            </Button>
          </span>
          <span className="text-xs text-muted-foreground">{attasekRovid(o.attasek, o.kod) ?? attaseNelkulFelirat(o.kod)}</span>
          <AllapotBadge allapot={o.allapot} ev={o.ev} />
        </div>
      ))}
      {plusz && (
        <div className={cn(KARTYA, 'justify-center border-dashed pl-2.5')}>
          <NativeSelect
            aria-label="Ország hozzáadása"
            value=""
            onChange={(e) => {
              if (e.target.value) onHozzaad(e.target.value);
            }}
          >
            <option value="">+ Ország</option>
            {jeloltek.map((o) => <option key={o.kod} value={o.kod}>{felirat(o)}</option>)}
          </NativeSelect>
        </div>
      )}
      {hazai && (
        <div className={cn(KARTYA, 'border-dashed bg-muted/40')}>
          <Csik szin={HAZAI_SZIN} />
          <span className="flex w-full flex-wrap items-start gap-1.5">
            <NevGomb o={hazai} onKivalaszt={onKivalaszt} />
            <span className="ml-auto rounded-full bg-muted px-2 text-[11px] text-muted-foreground">viszonyítási alap</span>
          </span>
          <span className="text-xs text-muted-foreground">{attaseNelkulFelirat(hazai.kod)}</span>
          <AllapotBadge allapot={hazai.allapot} ev={hazai.ev} />
        </div>
      )}
    </div>
  );
}
