'use client';

import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, TERKEP_SZINEK, type Csoport, type Mutato } from '../../../../lib/terkep-mutatok';

// Inline style szándékosan: a színek a térképpel közös szótárból (TERKEP_SZINEK, SKALA_SZINEK) jönnek.
function Negyzet({ szin, sraff }: { szin?: string; sraff?: boolean }) {
  return (
    <i
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-[2px]"
      style={sraff
        ? { backgroundImage: `repeating-linear-gradient(45deg, ${TERKEP_SZINEK.nincsAdat} 0 2px, ${TERKEP_SZINEK.szarazfold} 2px 4px)` }
        : { background: szin, border: szin === TERKEP_SZINEK.szarazfold ? `1px solid ${TERKEP_SZINEK.gombKontur}` : undefined }}
    />
  );
}

/** Lebegő jelmagyarázat a térkép bal alsó sarkában: gradiens (számszerű) vagy kategória-lista. */
export function Jelmagyarazat({ mutato, tartomany, csoportok }: {
  mutato: Mutato;
  /** Csak számszerű mutatónál; null, ha egyetlen ország sem ad értéket. */
  tartomany: { min: number; max: number } | null;
  /** Csak kategorikus mutatónál (a szűrt, használt kategóriák). */
  csoportok: Csoport[];
}) {
  return (
    <div className="absolute bottom-2.5 left-2.5 max-w-80 rounded-md border bg-background/95 px-2.5 py-2 text-[11px] text-muted-foreground shadow-sm">
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
            <span className="flex items-center gap-1.5"><Negyzet szin={TERKEP_SZINEK.szarazfold} /> nincs poszt</span>
          </div>
        </>
      ) : (
        <div className="flex flex-wrap gap-x-3 gap-y-0.5">
          {csoportok.map((cs) => (
            <span key={cs.kategoria ?? '__nincs'} className="flex items-center gap-1.5"><Negyzet szin={cs.szin} /> {cs.cimke}</span>
          ))}
          <span className="flex items-center gap-1.5"><Negyzet szin={TERKEP_SZINEK.szarazfold} /> nincs poszt</span>
        </div>
      )}
    </div>
  );
}
