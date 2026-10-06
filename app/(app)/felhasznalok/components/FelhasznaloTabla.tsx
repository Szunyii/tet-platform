import { Fragment } from 'react';
import { Badge } from '../../../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../../../components/ui/table';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { AttaseOrszag, OrszagTagok } from '../../../../lib/attase-orszag';
import { formatDatum } from '../../../../lib/datum';
import { SZEREPKOR_CIMKE } from '../../../../lib/felhasznalo-validacio';
import { orszagNev } from '../../../../lib/orszagok';
import { FelhasznaloMuveletek } from './FelhasznaloMuveletek';

export function FelhasznaloTabla({
  felhasznalok,
  sajatId,
  orszagTagok,
}: {
  felhasznalok: FelhasznaloSor[];
  sajatId: string;
  orszagTagok: OrszagTagok;
}) {
  // A ★ csak ott jelzi a vezetőt, ahol egynél több attasé van (egyszemélyes országban automatikus).
  const tobbAttase = new Set(Object.entries(orszagTagok).filter(([, t]) => t.length > 1).map(([kod]) => kod));
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Név</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Szerepkör</TableHead>
            <TableHead>Országok</TableHead>
            <TableHead>Telefon</TableHead>
            <TableHead>Állapot</TableHead>
            <TableHead>Létrehozva</TableHead>
            <TableHead className="w-12"><span className="sr-only">Műveletek</span></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {felhasznalok.map((f) => (
            <TableRow key={f.id}>
              <TableCell className="font-medium">
                {f.nev}
                {f.id === sajatId && <span className="ml-2 text-xs text-muted-foreground">(te)</span>}
              </TableCell>
              <TableCell className="text-muted-foreground">{f.email}</TableCell>
              <TableCell>
                <Badge variant={f.szerepkor === 'admin' ? 'default' : 'secondary'}>
                  {SZEREPKOR_CIMKE[f.szerepkor]}
                </Badge>
              </TableCell>
              <TableCell className="min-w-48 whitespace-normal">
                <OrszagCella orszagok={f.orszagok} tobbAttase={tobbAttase} />
              </TableCell>
              <TableCell className="whitespace-nowrap">
                {f.telefon ?? <span className="text-muted-foreground">–</span>}
              </TableCell>
              <TableCell>
                {f.tiltott ? <Badge variant="destructive">Tiltott</Badge> : <Badge variant="outline">Aktív</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDatum(f.letrehozva)}</TableCell>
              <TableCell className="text-right">
                <FelhasznaloMuveletek felhasznalo={f} sajat={f.id === sajatId} orszagTagok={orszagTagok} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

/** Első sor: székhely · város (★ vezető); második, halvány sor: a régiós országok. */
function OrszagCella({ orszagok, tobbAttase }: { orszagok: readonly AttaseOrszag[]; tobbAttase: ReadonlySet<string> }) {
  const szekhely = orszagok.find((o) => o.szekhely);
  const regio = orszagok.filter((o) => !o.szekhely);
  if (!szekhely && regio.length === 0) return <span className="text-muted-foreground">–</span>;
  const csillag = (o: AttaseOrszag) =>
    o.vezeto && tobbAttase.has(o.kod) ? (
      <>
        <span aria-hidden className="text-amber-600"> ★</span>
        <span className="sr-only"> (relációs vezető)</span>
      </>
    ) : null;
  return (
    <div className="flex flex-col">
      {szekhely && (
        <span>
          {orszagNev(szekhely.kod)}
          {szekhely.varos ? ` · ${szekhely.varos}` : ''}
          {csillag(szekhely)}
        </span>
      )}
      {regio.length > 0 && (
        <span className="text-xs text-muted-foreground">
          régió:{' '}
          {regio.map((o, i) => (
            <Fragment key={o.kod}>
              {i > 0 && ', '}
              {orszagNev(o.kod)}
              {csillag(o)}
            </Fragment>
          ))}
        </span>
      )}
    </div>
  );
}
