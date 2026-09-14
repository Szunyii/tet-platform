'use client';

import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, TERKEP_SZINEK, type Csoport, type Mutato, type Tartomany } from '../../../../lib/terkep-mutatok';

// Inline style szándékosan: a színek a térképpel közös szótárból (TERKEP_SZINEK, SKALA_SZINEK) jönnek.
// A sraffozás sűrűsége a térkép <pattern>-jével azonos: 2 px csík 6 px-enként.
function Negyzet({ szin, sraff, keret }: { szin?: string; sraff?: boolean; keret?: boolean }) {
  return (
    <i
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-[2px]"
      style={{
        background: sraff ? undefined : szin,
        backgroundImage: sraff
          ? `repeating-linear-gradient(45deg, ${TERKEP_SZINEK.nincsAdat} 0 2px, ${TERKEP_SZINEK.szarazfold} 2px 6px)`
          : undefined,
        border: keret || sraff ? `1px solid ${TERKEP_SZINEK.gombKontur}` : undefined,
      }}
    />
  );
}

/**
 * Lebegő jelmagyarázat a térkép bal alsó sarkában: gradiens (számszerű) vagy kategória-lista.
 * Legfeljebb a térkép magasságának 45 %-a, azon túl görgethető (sok kiemelt iparágnál).
 */
export function Jelmagyarazat({ mutato, tartomany, csoportok, iparag }: {
  mutato: Mutato;
  /** Csak számszerű mutatónál; null, ha egyetlen ország sem ad értéket. */
  tartomany: Tartomany | null;
  /** Csak kategorikus mutatónál (a szűrt, használt kategóriák). */
  csoportok: Csoport[];
  /** Az aktív iparág-szűrő ('' = nincs); ha van, a kizárt posztos ország halvány színe is szerepel. */
  iparag: string;
}) {
  const kozos = (
    <>
      {iparag && <span className="flex items-center gap-1.5"><Negyzet szin={TERKEP_SZINEK.halvany} /> nem felel meg a szűrőnek</span>}
      <span className="flex items-center gap-1.5"><Negyzet szin={TERKEP_SZINEK.szarazfold} keret /> nincs poszt</span>
    </>
  );
  return (
    <div className="absolute bottom-2.5 left-2.5 max-h-[45%] max-w-80 overflow-y-auto rounded-md border bg-background/95 px-2.5 py-2 text-[11px] text-muted-foreground shadow-sm">
      {mutato.tipus === 'szam' ? (
        <>
          <p className="font-semibold text-foreground">
            {mutato.cimke}
            {mutato.skala === 'log' && <span className="ml-1 font-normal text-muted-foreground">(logaritmikus skála)</span>}
          </p>
          {tartomany && (
            <>
              <div className="my-1 h-2 rounded-sm" style={{ background: `linear-gradient(90deg, ${SKALA_SZINEK.join(', ')})` }} />
              <div className="flex justify-between gap-3 font-mono">
                <span>{formatSzam(tartomany.min, mutato.utotag)}</span>
                <span>{formatSzam(tartomany.max, mutato.utotag)}</span>
              </div>
            </>
          )}
          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5">
            <span className="flex items-center gap-1.5"><Negyzet sraff /> nincs adat</span>
            {kozos}
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {csoportok.map((cs) => (
            <span key={cs.kategoria ?? '__nincs'} className="flex items-center gap-1.5"><Negyzet szin={cs.szin} /> {cs.cimke}</span>
          ))}
          {kozos}
        </div>
      )}
    </div>
  );
}
