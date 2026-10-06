import { attaseHely, type OrszagAttase } from '../../lib/attase-orszag';
import { Badge } from '../ui/badge';

/**
 * Az ország aktív attaséi a profil fejléce alatt, a `listOrszagAttasek` sorrendjében (vezető elöl):
 * név · hely, alatta halványan a részterület. A „Relációs vezető” jelzés csak több attasénál
 * látszik – egyszemélyes országban a vezetőség automatikus. A lista csak aktív attasékat
 * tartalmaz: ha egyikük sem vezető (nincs kijelölve, vagy a vezető tiltott), a profilt csak admin
 * szerkesztheti – erre figyelmeztet a lista utáni sor.
 */
export function AttaseLista({ kod, attasek }: { kod: string; attasek: readonly OrszagAttase[] }) {
  if (attasek.length === 0) return <p className="text-sm text-muted-foreground">Nincs aktív attasé.</p>;
  const tobb = attasek.length > 1;
  const cim = tobb ? 'Attasék' : 'Attasé';
  return (
    <div className="flex flex-col gap-1 text-sm">
      <p className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{cim}</p>
      <ul aria-label={cim} className="flex flex-col gap-1.5">
        {attasek.map((a) => {
          const h = attaseHely(a, kod);
          return (
            <li key={a.userId}>
              <span className="font-medium">{a.nev}</span>
              {h && <span className="text-muted-foreground"> · {h}</span>}
              {tobb && a.vezeto && (
                <Badge variant="outline" className="ml-2 bg-background align-middle">Relációs vezető</Badge>
              )}
              {a.reszterulet && (
                <span className="block text-xs break-words whitespace-pre-wrap text-muted-foreground">{a.reszterulet}</span>
              )}
            </li>
          );
        })}
      </ul>
      {!attasek.some((a) => a.vezeto) && (
        <p className="text-amber-800">Nincs aktív relációs vezető – a profilt csak admin szerkesztheti.</p>
      )}
    </div>
  );
}
