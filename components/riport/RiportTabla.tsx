import { PaperclipIcon } from 'lucide-react';
import Link from 'next/link';
import type { RiportListItem } from '../../db/queries/riport';
import { formatDatum, formatNaptariDatum } from '../../lib/datum';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/badge';
import { buttonVariants } from '../ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { KategoriaBadge } from './KategoriaBadge';

export function RiportTabla({
  sorok,
  admin,
  vanSzuro,
}: {
  sorok: RiportListItem[];
  admin: boolean;
  vanSzuro: boolean;
}) {
  if (sorok.length === 0) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border p-10 text-center">
        <p className="text-sm text-muted-foreground">
          {vanSzuro ? 'Nincs a szűrőknek megfelelő bejegyzés.' : 'Még nincs bejegyzés.'}
        </p>
        {!vanSzuro && (
          <Link href="/uj-riport" className={cn(buttonVariants())}>
            Első bejegyzés
          </Link>
        )}
      </div>
    );
  }
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-28">Beadva</TableHead>
            <TableHead className="w-32">Kategória</TableHead>
            <TableHead>Tárgy</TableHead>
            <TableHead className="w-44">{admin ? 'Ország · szerző' : 'Ország'}</TableHead>
            <TableHead>Kulcsszavak</TableHead>
            <TableHead className="w-12 text-right">
              <span className="sr-only">Csatolmány</span>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorok.map((r) => (
            <TableRow key={r.id}>
              <TableCell className="text-muted-foreground">{formatDatum(r.createdAt)}</TableCell>
              <TableCell>
                <KategoriaBadge kulcs={r.kategoria} />
              </TableCell>
              <TableCell className="max-w-md">
                <Link
                  href={`/riportok/${r.id}`}
                  title={r.targy}
                  className="block truncate font-medium underline-offset-2 hover:underline"
                >
                  {r.targy}
                </Link>
                {r.esemenyDatum && (
                  <span className="text-xs text-muted-foreground">
                    Esemény: {formatNaptariDatum(r.esemenyDatum)}
                  </span>
                )}
              </TableCell>
              <TableCell>
                <div>{r.orszag}</div>
                {admin && <div className="text-xs text-muted-foreground">{r.szerzoNev}</div>}
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {r.kulcsszavak.slice(0, 3).map((k) => (
                    <Badge key={k} variant="secondary">
                      {k}
                    </Badge>
                  ))}
                  {r.kulcsszavak.length > 3 && (
                    <Badge variant="outline">+{r.kulcsszavak.length - 3}</Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right text-muted-foreground">
                {r.csatolmanyDb > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-xs"
                    aria-label={`${r.csatolmanyDb} csatolmány`}
                  >
                    <PaperclipIcon className="size-3.5" />
                    {r.csatolmanyDb}
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
