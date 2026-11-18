import Link from 'next/link';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import type { TervAttekintesSor } from '../../../../db/queries/munkaterv';
import { munkatervUrl } from '../../../../lib/munkaterv-szuro';
import { TablaDoboz, TervStatuszJelveny } from './TervReszek';

/** Az aktív attasék névsorban, az év tervének állapotával. Pontszám és rangsor nincs. */
export function TervAttekintes({ sorok, ev }: { sorok: readonly TervAttekintesSor[]; ev: number }) {
  if (sorok.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-border bg-card px-4 py-8 text-center text-sm text-muted-foreground">
        Nincs aktív attasé.
      </p>
    );
  }
  return (
    <TablaDoboz cimke="Az attasék tervei">
      <Table className="min-w-[32rem]">
        <TableHeader>
          <TableRow>
            <TableHead>Attasé</TableHead>
            <TableHead>Terv állapota</TableHead>
            <TableHead>Célok</TableHead>
            <TableHead>Teljesült</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sorok.map((s) => (
            <TableRow key={s.attaseId}>
              <TableCell className="align-top whitespace-normal">
                <Link href={munkatervUrl(ev, s.attaseId)} className="font-medium underline underline-offset-2">
                  {s.nev}
                </Link>
                {s.varos && <p className="text-xs text-muted-foreground">{s.varos}</p>}
              </TableCell>
              <TableCell className="align-top">
                <div className="flex flex-col items-start gap-1">
                  <TervStatuszJelveny statusz={s.statusz} />
                  {s.modositasKerve && <span className="text-[11px] font-medium text-amber-900">Módosítást kért</span>}
                </div>
              </TableCell>
              <TableCell className="align-top">{s.statusz === null ? '–' : s.celDb}</TableCell>
              <TableCell className="align-top whitespace-nowrap">
                {s.statusz === 'jovahagyott' ? `${s.teljesultDb} / ${s.celDb}` : '–'}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TablaDoboz>
  );
}
