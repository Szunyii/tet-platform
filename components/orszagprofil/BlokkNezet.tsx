import type { ReactNode } from 'react';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  blokkCim, MEZO_CIMKEK, rendezvenyTipusCimke, type BlokkKulcs, type Iparag, type ProfilBlokkok,
} from '../../lib/orszagprofil-szotar';
import { IparagBadge } from './IparagBadge';

const HU = new Intl.NumberFormat('hu-HU');
function szam(n: number | null, utotag = ''): string {
  return n === null ? '–' : `${HU.format(n)}${utotag}`;
}

function Ures() {
  return <span className="text-muted-foreground">–</span>;
}

function Sor({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[220px_1fr]">
      <dt className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{cimke}</dt>
      <dd className="text-sm whitespace-pre-wrap">{children}</dd>
    </div>
  );
}
function Szoveg({ v }: { v: string }) {
  return v ? <>{v}</> : <Ures />;
}
function Cimkek({ lista, egyeb }: { lista: readonly string[]; egyeb?: string }) {
  if (lista.length === 0 && !egyeb) return <Ures />;
  return (
    <span className="flex flex-wrap gap-1.5">
      {lista.map((x) => <Badge key={x} variant="secondary">{x}</Badge>)}
      {egyeb && <span className="text-sm">{egyeb}</span>}
    </span>
  );
}
/** Iparág-jelvények színnel (KFI kiemelt iparágak, vállalati kiemelt ágazatok) + „egyéb" szabadszöveg. */
function Iparagak({ lista, egyeb }: { lista: readonly Iparag[]; egyeb: string }) {
  if (lista.length === 0 && !egyeb) return <Ures />;
  return (
    <span className="flex flex-wrap gap-1.5">
      {lista.map((i) => <IparagBadge key={i} iparag={i} />)}
      {egyeb && <span className="text-sm">{egyeb}</span>}
    </span>
  );
}

/** A blokk tartalma mezőnként; `null` tartalom = „Még nincs kitöltve". */
export function BlokkNezet<K extends BlokkKulcs>({ kulcs, tartalom }: { kulcs: K; tartalom: ProfilBlokkok[K] | null }) {
  return (
    <Card id={kulcs}>
      <CardHeader>
        <CardTitle>{blokkCim(kulcs)}</CardTitle>
        {!tartalom && <CardDescription>Még nincs kitöltve</CardDescription>}
      </CardHeader>
      {tartalom && (
        <CardContent>
          {/* A rendezvény-blokk táblázat, nem címke–érték párok: annak nem <dl> a kerete. */}
          {kulcs === 'rendezvenyek'
            ? mezok(kulcs, tartalom)
            : <dl className="flex flex-col gap-3">{mezok(kulcs, tartalom)}</dl>}
        </CardContent>
      )}
    </Card>
  );
}

// A MEZO_CIMKEK mezőnév szerint szigorúan típusos, ezért a `C` minden ágban a szűkített
// blokk-kulccsal jön (a switch előtt unió lenne, és nem lehetne mezőre indexelni).
function mezok(kulcs: BlokkKulcs, t: ProfilBlokkok[BlokkKulcs]): ReactNode {
  switch (kulcs) {
    case 'alapadatok': {
      const C = MEZO_CIMKEK.alapadatok;
      const b = t as ProfilBlokkok['alapadatok'];
      return (
        <>
          <Sor cimke={C.lakossag.cimke}>{szam(b.lakossag)}</Sor>
          <Sor cimke={C.gdp.cimke}>{szam(b.gdp)}</Sor>
          <Sor cimke={C.gdpEgyFore.cimke}>{szam(b.gdpEgyFore)}</Sor>
          <Sor cimke={C.gdpNovekedes.cimke}>{szam(b.gdpNovekedes, ' %')}</Sor>
          <Sor cimke={C.adatEv.cimke}>{b.adatEv ?? '–'}</Sor>
          <Sor cimke={C.forras.cimke}><Szoveg v={b.forras} /></Sor>
          <Sor cimke={C.tagsagok.cimke}><Cimkek lista={b.tagsagok} egyeb={b.tagsagEgyeb} /></Sor>
          <Sor cimke={C.agazatok.cimke}><Cimkek lista={b.agazatok} egyeb={b.agazatEgyeb} /></Sor>
        </>
      );
    }
    case 'kfiRendszer': {
      const C = MEZO_CIMKEK.kfiRendszer;
      const b = t as ProfilBlokkok['kfiRendszer'];
      return (
        <>
          <Sor cimke={C.teljesitmeny.cimke}><Szoveg v={b.teljesitmeny} /></Sor>
          <Sor cimke={C.gerd.cimke}>{szam(b.gerd, ' %')}</Sor>
          <Sor cimke={C.strategia.cimke}><Szoveg v={b.strategia} /></Sor>
          <Sor cimke={C.prioritasok.cimke}><Cimkek lista={b.prioritasok} egyeb={b.prioritasEgyeb} /></Sor>
          <Sor cimke={C.kiemeltIparagak.cimke}><Iparagak lista={b.kiemeltIparagak} egyeb={b.iparagEgyeb} /></Sor>
          <Sor cimke={C.erossegek.cimke}><Szoveg v={b.erossegek} /></Sor>
          <Sor cimke={C.kihivasok.cimke}><Szoveg v={b.kihivasok} /></Sor>
        </>
      );
    }
    case 'intezmenyek': {
      const C = MEZO_CIMKEK.intezmenyek;
      const b = t as ProfilBlokkok['intezmenyek'];
      return (['iranyitoSzervek', 'egyetemek', 'kutatokozpontok', 'infrastrukturak'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
    case 'vallalati': {
      const C = MEZO_CIMKEK.vallalati;
      const b = t as ProfilBlokkok['vallalati'];
      return (
        <>
          <Sor cimke={C.kiemeltAgazatok.cimke}><Iparagak lista={b.kiemeltAgazatok} egyeb={b.agazatEgyeb} /></Sor>
          <Sor cimke={C.topVallalatok.cimke}>
            {b.topVallalatok.length
              ? <ol className="list-decimal pl-5">{b.topVallalatok.map((v, i) => <li key={i}>{v}</li>)}</ol>
              : <Ures />}
          </Sor>
          <Sor cimke={C.startupok.cimke}><Szoveg v={b.startupok} /></Sor>
          <Sor cimke={C.klaszterek.cimke}><Szoveg v={b.klaszterek} /></Sor>
          <Sor cimke={C.technologiatranszfer.cimke}><Szoveg v={b.technologiatranszfer} /></Sor>
        </>
      );
    }
    case 'programok': {
      const C = MEZO_CIMKEK.programok;
      const b = t as ProfilBlokkok['programok'];
      return (['palyazatok', 'tamogatasiProgramok', 'finanszirozasiEszkozok', 'nemzetkoziReszvetel'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
    case 'rendezvenyek': {
      const b = t as ProfilBlokkok['rendezvenyek'];
      if (b.lista.length === 0) return <span className="text-sm text-muted-foreground">Nincs rendezvény.</span>;
      return (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-left text-xs text-muted-foreground uppercase">
              <tr>
                <th className="py-1 pr-3 font-medium">Név</th>
                <th className="py-1 pr-3 font-medium">Típus</th>
                <th className="py-1 pr-3 font-medium">Időpont</th>
                <th className="py-1 font-medium">Megjegyzés</th>
              </tr>
            </thead>
            <tbody>
              {b.lista.map((r, i) => (
                <tr key={i} className="border-t border-border align-top">
                  <td className="py-1.5 pr-3 font-medium">{r.nev}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{rendezvenyTipusCimke(r.tipus)}</td>
                  <td className="py-1.5 pr-3 whitespace-nowrap">{r.idopont || '–'}</td>
                  <td className="py-1.5">{r.megjegyzes || '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case 'kapcsolatok': {
      const C = MEZO_CIMKEK.kapcsolatok;
      const b = t as ProfilBlokkok['kapcsolatok'];
      return (['euMultilateralis', 'partnerorszagok', 'egyezmeny', 'ketoldalu', 'mobilitas'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
    case 'magyarErtekeles': {
      const C = MEZO_CIMKEK.magyarErtekeles;
      const b = t as ProfilBlokkok['magyarErtekeles'];
      return (['osszegzes', 'egyuttmukodesiLehetosegek', 'joGyakorlatok', 'diplomaciaiPrioritasok'] as const).map((k) => (
        <Sor key={k} cimke={C[k].cimke}><Szoveg v={b[k]} /></Sor>
      ));
    }
  }
}
