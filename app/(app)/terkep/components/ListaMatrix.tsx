'use client';

import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { HAZAI_SZIN, listaMatrix } from '../../../../lib/osszehasonlitas';
import { cn } from '../../../../lib/utils';

/** A magyar oszlop: halvány háttér és szaggatott bal szegély (fejléc és cellák). */
const HU_OSZLOP = 'w-8 border-l border-dashed bg-muted/40 text-center';

/** Az elem szerepel a listában: pötty az ország színében (Magyarországnál rombusz), felolvasónak „van”. */
function Van({ szin, rombusz }: { szin: string; rombusz?: boolean }) {
  // Inline style szándékosan: a szín az összehasonlítás palettájából jön.
  return (
    <>
      <span
        aria-hidden
        className={cn('inline-block align-middle', rombusz ? 'size-2 rotate-45' : 'size-2.5 rounded-full')}
        style={{ background: szin }}
      />
      <span className="sr-only">van</span>
    </>
  );
}

/** Az elem nem szerepel: apró halvány pötty (a rács olvasható marad), felolvasónak „nincs”. */
function Nincs() {
  return (
    <>
      <span aria-hidden className="inline-block size-1 rounded-full bg-muted-foreground/30 align-middle" />
      <span className="sr-only">nincs</span>
    </>
  );
}

/**
 * Egy lista (kiemelt iparágak, KFI-prioritások, tagságok) mátrixa: elemenként egy sor, országonként
 * egy oszlop (pötty az ország színében), magyar rekord mellett egy magyar oszlop (rombusz). A sorok a
 * `listaMatrix()` csoportjaiban állnak, fölöttük az összegző sor.
 */
export function ListaMatrix<T extends string>({ cim, sorrend, elemek, orszagok, szinek, hazai }: {
  cim: string;
  /** A szótár (pl. `AGAZATOK`): a csoporton belüli sorrend. */
  sorrend: readonly T[];
  /** Az ország listája (pl. `(o) => o.iparagak`). */
  elemek: (o: TerkepOrszag) => readonly T[];
  /** A halmaz rekordjai a hozzáadás sorrendjében (Magyarország nélkül). */
  orszagok: readonly TerkepOrszag[];
  /** Kód → az ország színe az összehasonlításban. */
  szinek: Readonly<Record<string, string>>;
  /** A magyar rekord (viszonyítási alap); `null`, ha legfeljebb a nézett évig nincs profilja. */
  hazai: TerkepOrszag | null;
}) {
  const matrix = listaMatrix(
    sorrend,
    orszagok.map((o) => ({ kod: o.kod, nev: o.nev, elemek: elemek(o) })),
    hazai ? elemek(hazai) : null,
  );
  const oszlopSzam = 1 + orszagok.length + (hazai ? 1 : 0);
  return (
    <section className="flex min-w-0 flex-col gap-1 rounded-lg border p-3">
      <h3 className="text-sm font-medium">{cim}</h3>
      {matrix.csoportok.length === 0 ? (
        <p className="text-sm text-muted-foreground">Nincs adat.</p>
      ) : (
        <>
          <p className="text-xs text-muted-foreground">{matrix.osszegzes}</p>
          {/* Keskeny kártyán a táblázat a kártyán belül görgethető. */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-xs">
              <caption className="sr-only">{cim}</caption>
              <thead>
                <tr>
                  <td />
                  {orszagok.map((o) => (
                    <th key={o.kod} scope="col" className="w-7 px-0.5 pb-1 text-center font-mono text-[11px] font-semibold">
                      {/* Inline style szándékosan: a kód az ország színében, mint a fejléc-kártyán. */}
                      <span aria-hidden style={{ color: szinek[o.kod] }}>{o.kod}</span>
                      <span className="sr-only">{o.nev}</span>
                    </th>
                  ))}
                  {hazai && (
                    <th scope="col" className={cn(HU_OSZLOP, 'px-0.5 pb-1 font-mono text-[11px] font-semibold')}>
                      <span aria-hidden>HU</span>
                      <span className="sr-only">Magyarország</span>
                    </th>
                  )}
                </tr>
              </thead>
              {matrix.csoportok.map((cs) => (
                <tbody key={cs.cimke}>
                  <tr>
                    <th
                      scope="rowgroup"
                      colSpan={oszlopSzam}
                      className="pt-2.5 pb-0.5 text-left text-[11px] font-medium tracking-wide text-muted-foreground uppercase"
                    >
                      {cs.cimke}
                    </th>
                  </tr>
                  {cs.sorok.map((s) => (
                    <tr key={s.elem}>
                      <th scope="row" className="py-0.5 pr-2 text-left font-normal">{s.elem}</th>
                      {orszagok.map((o, i) => (
                        <td key={o.kod} className="text-center">
                          {s.benne[i] ? <Van szin={szinek[o.kod]} /> : <Nincs />}
                        </td>
                      ))}
                      {hazai && <td className={HU_OSZLOP}>{s.hazai ? <Van szin={HAZAI_SZIN} rombusz /> : <Nincs />}</td>}
                    </tr>
                  ))}
                </tbody>
              ))}
            </table>
          </div>
        </>
      )}
    </section>
  );
}
