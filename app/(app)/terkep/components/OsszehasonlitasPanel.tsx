'use client';

import { X } from 'lucide-react';
import type { ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { IparagBadge } from '../../../../components/orszagprofil/IparagBadge';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../../components/ui/table';
import { formatSzam } from '../../../../lib/szam';
import { SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';
import { VS_MAX } from './useTerkepAllapot';

function Sor({ cimke, kiemelt, orszagok, plusz, children }: {
  cimke: string;
  kiemelt?: boolean;
  orszagok: TerkepOrszag[];
  /** Van-e „+ Ország" oszlop (üres cella kell a sor végére). */
  plusz: boolean;
  children: (o: TerkepOrszag) => ReactNode;
}) {
  return (
    <TableRow className={cn(kiemelt && 'bg-muted/60')}>
      <TableCell className="font-medium whitespace-normal text-muted-foreground">{cimke}</TableCell>
      {orszagok.map((o) => <TableCell key={o.kod} className="align-top whitespace-normal">{children(o)}</TableCell>)}
      {plusz && <TableCell />}
    </TableRow>
  );
}

/** 2–4 ország adatai egymás mellett; a térképen választott számszerű mutató sora kiemelt, soronként a legnagyobb érték félkövér. */
export function OsszehasonlitasPanel({ orszagok, jeloltek, mutato, onKivalaszt, onKivesz, onHozzaad, onTorol }: {
  /** A halmaz rekordjai a hozzáadás sorrendjében (2–4). */
  orszagok: TerkepOrszag[];
  /** A „+ Ország" lista (a halmazban nem lévők, a hívó rendezi). */
  jeloltek: TerkepOrszag[];
  mutato: Mutato;
  onKivalaszt: (kod: string) => void;
  onKivesz: (kod: string) => void;
  onHozzaad: (kod: string) => void;
  onTorol: () => void;
}) {
  const plusz = orszagok.length < VS_MAX;
  const felirat = (o: TerkepOrszag) =>
    mutato.tipus === 'szam' ? `${o.nev} · ${formatSzam(mutato.ertek(o), mutato.utotag)}` : o.nev;
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>{orszagok.length} ország · a térkép mutatójának sora kiemelve</CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Törlés</Button>
      </CardHeader>
      <CardContent className="overflow-x-auto px-0">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className="w-28" />
              {orszagok.map((o) => (
                <TableHead key={o.kod} className="min-w-32">
                  <span className="flex items-center gap-1">
                    <button type="button" className="truncate font-semibold text-foreground hover:underline" onClick={() => onKivalaszt(o.kod)}>
                      {o.nev}
                    </button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`${o.nev} kivétele`} onClick={() => onKivesz(o.kod)}>
                      <X />
                    </Button>
                  </span>
                </TableHead>
              ))}
              {plusz && (
                <TableHead className="min-w-40">
                  <NativeSelect aria-label="Ország hozzáadása" value="" onChange={(e) => { if (e.target.value) onHozzaad(e.target.value); }}>
                    <option value="">+ Ország</option>
                    {jeloltek.map((o) => <option key={o.kod} value={o.kod}>{felirat(o)}</option>)}
                  </NativeSelect>
                </TableHead>
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            <Sor cimke="Attasé" orszagok={orszagok} plusz={plusz}>
              {(o) => (
                <>
                  {o.attase ?? '–'}
                  {o.poszt?.fovaros && <span className="block text-muted-foreground">{o.poszt.fovaros}</span>}
                </>
              )}
            </Sor>
            <Sor cimke="Állapot" orszagok={orszagok} plusz={plusz}>
              {(o) => <AllapotBadge allapot={o.allapot} ev={o.ev} />}
            </Sor>
            <Sor cimke="Kiemelt iparágak" orszagok={orszagok} plusz={plusz}>
              {(o) => (o.iparagak.length ? <span className="flex flex-wrap gap-1">{o.iparagak.map((i) => <IparagBadge key={i} iparag={i} />)}</span> : '–')}
            </Sor>
            {SZAM_MUTATOK.map((m) => {
              const legjobb = Math.max(...orszagok.map((o) => m.ertek(o) ?? -Infinity));
              return (
                <Sor key={m.kulcs} cimke={m.cimke} kiemelt={m.kulcs === mutato.kulcs} orszagok={orszagok} plusz={plusz}>
                  {(o) => {
                    const v = m.ertek(o);
                    return <span className={cn('font-mono', v !== null && v === legjobb && 'font-semibold')}>{formatSzam(v, m.utotag)}</span>;
                  }}
                </Sor>
              );
            })}
            <Sor cimke="Tagságok" orszagok={orszagok} plusz={plusz}>
              {(o) => (o.alapadatok?.tagsagok.length ? o.alapadatok.tagsagok.join(', ') : '–')}
            </Sor>
            <Sor cimke="KFI-prioritások" orszagok={orszagok} plusz={plusz}>
              {(o) => (o.prioritasok.length ? o.prioritasok.join(', ') : '–')}
            </Sor>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
