import type { ComponentProps } from 'react';
import { Badge } from '../../../../components/ui/badge';
import type { IdoszakSor } from '../../../../db/queries/ertekeles';
import { formatDatum } from '../../../../lib/datum';
import { felevBefejezodott, felevCimke, megnyithato, type Felev } from '../../../../lib/ertekeles-idoszak';
import { hianyzoAttasek, osszesit, type ErtekelesSor } from '../../../../lib/ertekeles-osszesites';
import { lezarFelevAction, megnyitFelevAction, ujranyitFelevAction } from '../actions';
import { FelevMuveletGomb } from './FelevMuveletGomb';

type GombAdat = Omit<ComponentProps<typeof FelevMuveletGomb>, 'felev' | 'felevUrl'>;

/** A félév állapotához tartozó művelet; `null`, ha a félév nem nyitható meg. */
function felevGomb(
  f: Felev,
  idoszak: IdoszakSor | null,
  sorok: readonly ErtekelesSor[],
  ma: string,
  figyelmeztetes: string | undefined,
): GombAdat | null {
  if (idoszak === null) {
    return megnyithato(f, ma) ? { muvelet: 'megnyitas', action: megnyitFelevAction.bind(null, f.ev, f.felev) } : null;
  }
  if (idoszak.statusz === 'lezart') {
    return { muvelet: 'ujranyitas', action: ujranyitFelevAction.bind(null, f.ev, f.felev) };
  }
  const hianyzok = hianyzoAttasek(sorok);
  let tiltasOka: string | undefined;
  if (!felevBefejezodott(f, ma)) tiltasOka = 'A félév még nem ért véget.';
  else if (hianyzok.length > 0) tiltasOka = `Hiányzó minősítés: ${hianyzok.join(', ')}.`;
  return { muvelet: 'lezaras', action: lezarFelevAction.bind(null, f.ev, f.felev), tiltasOka, figyelmeztetes };
}

function allapotFelirat(idoszak: IdoszakSor | null): string {
  if (idoszak === null) return 'Nincs megnyitva';
  return idoszak.statusz === 'lezart' ? 'Lezárva' : 'Nyitott';
}

/** A félév állapota, az elkészült attasék száma (a szűrőktől függetlenül) és az életciklus-művelet. */
export function AllapotSav({
  felev,
  idoszak,
  sorok,
  torlendoAttasek,
  ma,
  felevUrl,
}: {
  felev: Felev;
  idoszak: IdoszakSor | null;
  /** A félév összes sora, szűrés nélkül: a lezárhatóság a teljes félévre vonatkozik. */
  sorok: readonly ErtekelesSor[];
  /** A lezáráskor törlődő, hiányos sorok attaséi magyar névsorban. */
  torlendoAttasek: readonly string[];
  ma: string;
  /** A nézet URL-je a megjelenített félévvel: a művelet után is ez a félév marad látható. */
  felevUrl: string;
}) {
  const { kesz, osszes } = osszesit(sorok);
  const figyelmeztetes =
    torlendoAttasek.length > 0 ? `Lezáráskor törlődik a hiányos értékelése: ${torlendoAttasek.join(', ')}.` : undefined;
  const gomb = felevGomb(felev, idoszak, sorok, ma, figyelmeztetes);
  const cimke = felevCimke(felev);
  return (
    <section
      aria-label="A félév állapota"
      className="flex flex-col items-start gap-3 rounded-xl border border-border bg-card p-3 @3xl:flex-row @3xl:justify-between"
    >
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-[15px] font-semibold">{cimke}</h2>
          <Badge variant={idoszak?.statusz === 'nyitott' ? 'default' : 'secondary'}>{allapotFelirat(idoszak)}</Badge>
        </div>
        {idoszak !== null && (
          <p className="mt-1 text-[12px] text-muted-foreground">
            <span className="font-medium text-foreground">
              {kesz} / {osszes}
            </span>{' '}
            értékelt attasé
            {idoszak.statusz === 'lezart' && idoszak.lezarvaAt !== null && (
              <>
                {' · '}Lezárta: {idoszak.lezartaNev ?? 'ismeretlen'}, {formatDatum(idoszak.lezarvaAt)}
              </>
            )}
          </p>
        )}
        {figyelmeztetes !== undefined && (
          <p className="mt-1 text-[12px] font-medium wrap-anywhere text-amber-800">{figyelmeztetes}</p>
        )}
      </div>
      {gomb && <FelevMuveletGomb {...gomb} felev={cimke} felevUrl={felevUrl} />}
    </section>
  );
}
