import {
  listAdminSzuroOpciok,
  listEredmenyek,
  listIgazolasraVar,
  listTevekenysegek,
} from '../../../../db/queries/tevekenyseg';
import { orszagRegio } from '../../../../lib/orszagok';
import { tevekenysegUrl, type TevekenysegOldalSzuro } from '../../../../lib/tevekenyseg-szuro';
import { AdminEredmenyLista } from './AdminEredmenyLista';
import { AdminSzurok } from './AdminSzurok';
import { AdminTevekenysegLista } from './AdminTevekenysegLista';
import { FulLink } from './AttaseNezet';
import { IgazolasiSor } from './IgazolasiSor';

/** A központ nézete: igazolási sor, a hálózat ügyei és tevékenységei. A fülek a közös szűrőket megtartják. */
export function AdminNezet({ szuro, ev }: { szuro: TevekenysegOldalSzuro; ev: number }) {
  const ful = szuro.ful ?? 'igazolas';
  const opciok = listAdminSzuroOpciok();

  // Az opciók között nem szereplő érték kimarad: a legördülőben nyers azonosító vagy kód állna.
  const attase = opciok.attasek.some((a) => a.id === szuro.attase) ? szuro.attase : undefined;
  const orszag =
    szuro.orszag && opciok.orszagok.includes(szuro.orszag) && (!szuro.regio || orszagRegio(szuro.orszag) === szuro.regio)
      ? szuro.orszag
      : undefined;
  const kozos = { attase, regio: szuro.regio, orszag };
  const lekerdezes = { attaseId: attase, regio: szuro.regio, orszag };

  const keresek = listIgazolasraVar();
  const eredmenyek = listEredmenyek({ ...lekerdezes, szakasz: szuro.szakasz });
  const tevekenysegek = listTevekenysegek({ ...lekerdezes, ev, felev: szuro.felev ?? undefined });

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="min-w-0">
        <h2 className="text-base leading-snug font-semibold">A teljes hálózat</h2>
        <p className="text-xs text-muted-foreground">Admin nézet · {ev}</p>
      </div>

      <nav aria-label="Nézet" className="flex flex-wrap gap-0.5 border-b border-border">
        <FulLink href={tevekenysegUrl({})} aktiv={ful === 'igazolas'} darab={keresek.length}>
          Igazolásra vár
        </FulLink>
        <FulLink
          href={tevekenysegUrl({ ful: 'eredmenyek', ...kozos, szakasz: szuro.szakasz })}
          aktiv={ful === 'eredmenyek'}
          darab={eredmenyek.length}
        >
          Eredmények
        </FulLink>
        <FulLink
          href={tevekenysegUrl({ ful: 'tevekenysegek', ...kozos, felev: szuro.felev })}
          aktiv={ful === 'tevekenysegek'}
          darab={tevekenysegek.length}
        >
          Tevékenységek
        </FulLink>
      </nav>

      {ful !== 'igazolas' && (
        <AdminSzurok
          ful={ful}
          ertekek={{ ...kozos, szakasz: ful === 'eredmenyek' ? szuro.szakasz : undefined, felev: ful === 'tevekenysegek' ? szuro.felev : null }}
          attasek={opciok.attasek}
          orszagok={opciok.orszagok}
        />
      )}

      {ful === 'igazolas' && <IgazolasiSor keresek={keresek} />}
      {ful === 'eredmenyek' && <AdminEredmenyLista eredmenyek={eredmenyek} />}
      {ful === 'tevekenysegek' && <AdminTevekenysegLista tevekenysegek={tevekenysegek} />}
    </div>
  );
}
