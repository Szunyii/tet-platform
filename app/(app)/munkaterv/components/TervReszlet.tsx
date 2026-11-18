import Link from 'next/link';
import type { TervNezet } from '../../../../db/queries/munkaterv';
import { CEL_MAX, CEL_MIN } from '../../../../lib/munkaterv-szotar';
import { munkatervUrl } from '../../../../lib/munkaterv-szuro';
import { CelTabla } from './CelTabla';
import { EvValaszto } from './EvValaszto';
import { AdminTervMuveletek } from './TervMuveletek';
import { Tajekoztato, TervFejlec, TervUzenetek } from './TervReszek';

/** A központ nézete egy attasé tervéről: döntések és célállapot-felülírás. */
export function TervReszlet({
  terv,
  attaseId,
  nev,
  varos,
  ev,
  evek,
  tartalomNyitva,
}: {
  terv: TervNezet | null;
  attaseId: string;
  nev: string;
  varos: string | null;
  ev: number;
  evek: readonly number[];
  /** A folyó és a következő év terve szerkesztésre visszaadható; a múltbelié már nem. */
  tartalomNyitva: boolean;
}) {
  const hely = [nev, varos].filter(Boolean).join(' · ');
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <Link href={munkatervUrl(ev)} className="w-fit text-[12.5px]">
        <span aria-hidden="true">← </span>Munkatervek
      </Link>
      <TervFejlec
        cim={`${nev} munkaterve · ${ev}`}
        alcim={terv ? `${hely} · ${terv.celok.length} cél (${CEL_MIN}–${CEL_MAX} lehet)` : hely}
        terv={terv}
        jobbra={<EvValaszto ev={ev} evek={evek} attaseId={attaseId} />}
      />
      {terv ? (
        <>
          <TervUzenetek terv={terv} />
          <CelTabla
            celok={terv.celok}
            mod={terv.statusz === 'jovahagyott' ? 'felulir' : 'olvas'}
            terv={{ id: terv.id, verzio: terv.verzio }}
          />
          <AdminTervMuveletek terv={terv} tartalomNyitva={tartalomNyitva} />
        </>
      ) : (
        <Tajekoztato>
          <p>Az attasénak erre az évre nincs munkaterve.</p>
        </Tajekoztato>
      )}
    </div>
  );
}
