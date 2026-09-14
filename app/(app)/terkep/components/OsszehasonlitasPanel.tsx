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
import { SKALA_SZINEK, SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';
import { VS_MAX } from './useTerkepAllapot';

/** A kiemelt sor (a térképen választott mutató) háttere: a térkép skálájának legvilágosabb színe. */
const KIEMELT_HATTER = SKALA_SZINEK[0];
/** A sorcímke-oszlop keskeny képernyőn is látszik (sticky), ezért saját, átlátszatlan háttere van. */
const CIMKE_OSZLOP = 'sticky left-0 z-10 w-36 min-w-36 bg-card align-top whitespace-normal';

function Sor({ cimke, kiemelt, orszagok, plusz, children }: {
  cimke: string;
  kiemelt?: boolean;
  orszagok: TerkepOrszag[];
  /** Van-e „+ Ország" oszlop (üres cella kell a sor végére). */
  plusz: boolean;
  children: (o: TerkepOrszag) => ReactNode;
}) {
  // Inline style szándékosan: a kiemelés színe a térkép skálájából jön, és inline-ként a sor hover-hátterét is felülírja
  // (a Tailwind `bg-muted/60` a `hover:bg-muted/50` alatt eltűnt volna). A sticky címke-cellára is kell, mert az saját háttérrel fed.
  const hatter = kiemelt ? { background: KIEMELT_HATTER } : undefined;
  return (
    <TableRow style={hatter}>
      <TableHead scope="row" className={cn(CIMKE_OSZLOP, 'h-auto py-2 font-medium text-muted-foreground')} style={hatter}>
        {cimke}
      </TableHead>
      {orszagok.map((o) => <TableCell key={o.kod} className="align-top whitespace-normal">{children(o)}</TableCell>)}
      {plusz && <TableCell />}
    </TableRow>
  );
}

/**
 * 2–4 ország adatai egymás mellett, a térkép alatt, teljes szélességben (a keskeny jobb panelen nem
 * férne el). A térképen választott számszerű mutató sora kiemelt, soronként a legnagyobb érték félkövér.
 */
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
  const plusz = orszagok.length < VS_MAX && jeloltek.length > 0;
  const felirat = (o: TerkepOrszag) =>
    mutato.tipus === 'szam' ? `${o.nev} · ${formatSzam(mutato.ertek(o), mutato.utotag)}` : o.nev;
  return (
    <Card>
      <CardHeader className="flex items-start gap-2">
        <div className="min-w-0">
          <CardTitle>Összehasonlítás</CardTitle>
          <CardDescription>
            {orszagok.length} ország · a térkép mutatójának sora kiemelve, soronként a legnagyobb érték félkövér
          </CardDescription>
        </div>
        <Button type="button" variant="outline" size="sm" className="ml-auto" onClick={onTorol}>Összehasonlítás törlése</Button>
      </CardHeader>
      <CardContent className="px-0">
        <Table className="text-xs">
          <TableHeader>
            <TableRow>
              <TableHead className={cn(CIMKE_OSZLOP, 'h-10')} />
              {orszagok.map((o) => (
                <TableHead key={o.kod} className="min-w-36 max-w-44">
                  <span className="flex items-center gap-1">
                    <button
                      type="button"
                      title={o.nev}
                      className="min-w-0 truncate rounded-sm font-semibold text-foreground outline-none hover:underline focus-visible:ring-3 focus-visible:ring-ring/50"
                      onClick={() => onKivalaszt(o.kod)}
                    >
                      {o.nev}
                    </button>
                    <Button type="button" variant="ghost" size="icon-xs" aria-label={`${o.nev} kivétele`} onClick={() => onKivesz(o.kod)}>
                      <X />
                    </Button>
                  </span>
                </TableHead>
              ))}
              {plusz && (
                <TableHead className="min-w-44">
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
