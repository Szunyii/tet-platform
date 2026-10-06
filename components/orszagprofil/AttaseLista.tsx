import { regionalisE, type OrszagAttase } from '../../lib/attase-orszag';
import { orszagNev } from '../../lib/orszagok';
import { Badge } from '../ui/badge';

/** A hely-felirat: „Város”, régiósnál „regionálisan, székhely: Város, Ország”. */
function hely(a: OrszagAttase, kod: string): string {
  if (regionalisE(a, kod)) {
    return `regionálisan, székhely: ${[a.varos, orszagNev(a.szekhelyKod)].filter(Boolean).join(', ')}`;
  }
  return a.varos ?? '';
}

/**
 * Az ország aktív attaséi a profil fejlécében, a `listOrszagAttasek` sorrendjében (vezető elöl):
 * név · hely, alatta halványan a részterület. A „Relációs vezető” jelzés csak több attasénál
 * látszik – egyszemélyes országban a vezetőség automatikus.
 */
export function AttaseLista({ kod, attasek }: { kod: string; attasek: readonly OrszagAttase[] }) {
  if (attasek.length === 0) return <p className="text-sm text-muted-foreground">Nincs aktív attasé</p>;
  const tobb = attasek.length > 1;
  return (
    <div className="flex flex-col gap-1.5 text-sm">
      {/* A lista csak aktív attasékat tartalmaz: ha egyikük sem vezető (nincs kijelölve, vagy a vezető tiltott), a profilt csak admin szerkesztheti. */}
      {!attasek.some((a) => a.vezeto) && (
        <p className="text-muted-foreground">Nincs kijelölt relációs vezető.</p>
      )}
      <ul className="flex flex-col gap-1.5">
        {attasek.map((a) => {
          const h = hely(a, kod);
          return (
            <li key={a.userId} className="flex flex-col">
              <span className="flex flex-wrap items-center gap-x-2 gap-y-0.5">
                <span className="font-medium">{a.nev}</span>
                {h && <span className="text-muted-foreground">· {h}</span>}
                {tobb && a.vezeto && <Badge variant="secondary">Relációs vezető</Badge>}
              </span>
              {a.reszterulet && (
                <span className="text-xs whitespace-pre-wrap text-muted-foreground">{a.reszterulet}</span>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
