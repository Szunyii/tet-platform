'use client';

import { formatSzam } from '../../../../lib/szam';
import { SKALA_SZINEK, TERKEP_SZINEK, type Csoport, type Mutato, type Tartomany } from '../../../../lib/terkep-mutatok';

// Inline style szándékosan: a színek a térképpel közös szótárból (TERKEP_SZINEK, SKALA_SZINEK) jönnek.
// A sraffozás iránya és sűrűsége a térkép <pattern>-jével azonos: 2 px csík 6 px-enként, „/" irányban.
function Negyzet({ szin, sraff, keret }: { szin?: string; sraff?: boolean; keret?: boolean }) {
  return (
    <i
      aria-hidden
      className="inline-block size-2.5 shrink-0 rounded-[2px]"
      style={{
        backgroundColor: sraff ? undefined : szin,
        backgroundImage: sraff
          ? `repeating-linear-gradient(135deg, ${TERKEP_SZINEK.nincsAdat} 0 2px, ${TERKEP_SZINEK.szarazfold} 2px 6px)`
          : undefined,
        border: keret || sraff ? `1px solid ${TERKEP_SZINEK.gombKontur}` : undefined,
      }}
    />
  );
}

/**
 * Jelmagyarázat a térkép alatt, normál folyásban (nem lebegő kártya, hogy ne takarja a térkép
 * bal alsó sarkát): gradiens + min/max (számszerű) vagy kategória-lista.
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
    <div role="group" aria-label="Jelmagyarázat" className="flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t px-3 py-2 text-[11px] text-muted-foreground">
      {mutato.tipus === 'szam' ? (
        <>
          <span className="font-semibold text-foreground">
            {mutato.cimke}
            {mutato.skala === 'log' && <span className="ml-1 font-normal text-muted-foreground">(logaritmikus skála)</span>}
          </span>
          {tartomany && (
            <span className="flex min-w-0 items-center gap-2 font-mono">
              <span>{formatSzam(tartomany.min, mutato.utotag)}</span>
              <span className="h-2 w-32 shrink rounded-sm" style={{ background: `linear-gradient(90deg, ${SKALA_SZINEK.join(', ')})` }} />
              <span>{formatSzam(tartomany.max, mutato.utotag)}</span>
            </span>
          )}
          <span className="flex items-center gap-1.5"><Negyzet sraff /> nincs adat</span>
          {kozos}
        </>
      ) : (
        <>
          <span className="font-semibold text-foreground">{mutato.cimke}</span>
          {csoportok.map((cs) => (
            <span key={cs.kategoria ?? '__nincs'} className="flex items-center gap-1.5"><Negyzet szin={cs.szin} /> {cs.cimke}</span>
          ))}
          {kozos}
        </>
      )}
    </div>
  );
}
