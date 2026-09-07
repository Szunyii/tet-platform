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
import { formatDatum } from '../../../../lib/datum';
import { SZEREPKOR_CIMKE } from '../../../../lib/felhasznalo-validacio';
import { FelhasznaloMuveletek } from './FelhasznaloMuveletek';

export function FelhasznaloTabla({
  felhasznalok,
  sajatId,
}: {
  felhasznalok: FelhasznaloSor[];
  sajatId: string;
}) {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Név</TableHead>
            <TableHead>E-mail</TableHead>
            <TableHead>Szerepkör</TableHead>
            <TableHead>Ország</TableHead>
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
              <TableCell>{f.orszag ?? <span className="text-muted-foreground">–</span>}</TableCell>
              <TableCell>
                {f.tiltott ? <Badge variant="destructive">Tiltott</Badge> : <Badge variant="outline">Aktív</Badge>}
              </TableCell>
              <TableCell className="text-muted-foreground">{formatDatum(f.letrehozva)}</TableCell>
              <TableCell className="text-right">
                <FelhasznaloMuveletek felhasznalo={f} sajat={f.id === sajatId} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
