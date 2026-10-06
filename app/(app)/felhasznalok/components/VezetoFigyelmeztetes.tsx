import type { HianyosOrszag } from '../../../../lib/attase-orszag';
import { orszagNev } from '../../../../lib/orszagok';

/** A vezető nélküli (vagy tiltott vezetőjű) országok a felhasználó-tábla fölött. */
export function VezetoFigyelmeztetes({ orszagok }: { orszagok: readonly HianyosOrszag[] }) {
  return (
    <div role="status" className="rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-950">
      <p className="font-medium">Relációs vezető nélküli országok</p>
      <ul className="mt-1 list-disc pl-5">
        {orszagok.map((o) => (
          <li key={o.kod}>
            {orszagNev(o.kod)} ({o.aktivDb} aktív attasé){o.vezetoTiltott ? ' – a vezető tiltott' : ''}
          </li>
        ))}
      </ul>
      <p className="mt-1 text-amber-900">
        Jelöld ki a vezetőt valamelyik attasé szerkesztésében; addig a profilt csak admin szerkesztheti.
      </p>
    </div>
  );
}
