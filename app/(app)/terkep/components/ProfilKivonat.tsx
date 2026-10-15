'use client';

import { Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { AgazatBadge } from '../../../../components/orszagprofil/AgazatBadge';
import { Badge } from '../../../../components/ui/badge';
import { Button, buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { attaseFelirat, attaseNelkulFelirat, vezetoJelzes } from '../../../../lib/attase-orszag';
import { hazaiE } from '../../../../lib/orszagok';
import { BLOKK_KULCSOK, MEZO_CIMKEK } from '../../../../lib/orszagprofil-szotar';
import { formatSzam as sz } from '../../../../lib/szam';
import { ertekEsHely, SKALA_SZINEK, type Mutato, type Rangsor } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';

/** A Szerkesztés-gomb előállítója: a TerkepNezet köti meg a joggal (canEditProfil) és az évekkel; a hívó az országot és a feliratokat adja. */
export type SzerkesztesGombFn = (kod: string, opciok: { felirat: string; feliratMost?: string; className?: string }) => ReactNode;

/** Az Alapadatok egy sora: címke és érték. */
function Sor({ cimke, children }: { cimke: string; children: ReactNode }) {
  return <><dt className="text-muted-foreground">{cimke}</dt><dd>{children}</dd></>;
}

/** A kiválasztott ország profil-kivonata a térkép mellett. */
export function ProfilKivonat({
  o, szerkesztesGomb, onClose,
  mutato, rangsor, benneVs, vsTele, onVs, viszonyitasiAlap,
}: {
  o: TerkepOrszag;
  szerkesztesGomb: SzerkesztesGombFn;
  onClose: () => void;
  /** A térképen választott mutató; számszerűnél egy sor az értékkel és a helyezéssel. */
  mutato: Mutato;
  rangsor: Rangsor | null;
  /** Benne van-e az ország az összehasonlításban. */
  benneVs: boolean;
  /** Tele a halmaz (`VS_MAX`) – ilyenkor a hozzáadás letiltva. */
  vsTele: boolean;
  /** Hozzáadás / kivétel (a hívó dönti el `benneVs` alapján). */
  onVs: () => void;
  /** Ez az ország az összehasonlítás viszonyítási alapja (`TerkepAllapot.hazai`, a `hazaiRekord` szerint). */
  viszonyitasiAlap: boolean;
}) {
  const a = o.alapadatok;
  const C = MEZO_CIMKEK.alapadatok;
  // A térképen választott számszerű mutató értéke és helyezése (a szűrt rangsorban); undefined = kategorikus
  // mutató. A szűrő által kizárt ország nincs a rangsorban (`helyezett` hamis), de értéke lehet.
  const ertek = mutato.tipus === 'szam' ? ertekEsHely(o, mutato, rangsor) : undefined;
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <CardTitle>{o.nev}</CardTitle>
            <CardDescription className="flex flex-col gap-1">
              {o.attasek.length === 0 ? (
                <span>{attaseNelkulFelirat(o.kod)}</span>
              ) : (
                o.attasek.map((at) => (
                  <span key={at.userId}>
                    {attaseFelirat(at, o.kod)}
                    {vezetoJelzes(o.attasek, at) ? ' · relációs vezető' : ''}
                    {/* A teljes részterület (a tooltip csak 2 sort mutat); a beírt sortörések megmaradnak, mint a profil oldalán. */}
                    {at.reszterulet && (
                      <span className="block text-xs break-words whitespace-pre-wrap">{at.reszterulet}</span>
                    )}
                  </span>
                ))
              )}
            </CardDescription>
          </div>
          <Button type="button" variant="ghost" size="icon" className="ml-auto" aria-label="Bezárás" onClick={onClose}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          <AllapotBadge allapot={o.allapot} ev={o.ev} />
          {o.allapot !== 'nincs' && (
            <Badge variant="secondary">{o.mentettDb}/{BLOKK_KULCSOK.length} blokk · {o.rendezvenyDb} rendezvény</Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {ertek !== undefined && (
          // Inline style szándékosan: a sáv színe a térkép skálájának legvilágosabb fokozata (mint az
          // összehasonlítás kiemelt mutatókártyája) – ez köti a sort a térkép aktuális színezéséhez. Érték
          // nélkül nincs sáv: a térkép sem színezi az országot, és a halvány szöveg a színen nem olvasható.
          <p className="rounded-md px-2 py-1 text-sm text-foreground" style={ertek === null ? undefined : { background: SKALA_SZINEK[0] }}>
            <span>{mutato.cimke}: </span>
            {ertek === null ? (
              <span className="text-muted-foreground">nincs adat</span>
            ) : (
              <span
                className="font-mono font-medium"
                title={ertek.helyezett ? 'Érték és helyezés a jelenlegi szűrés szerinti rangsorban' : 'Érték – a szűrés miatt az ország nincs a rangsorban'}
              >
                {ertek.szoveg}
              </span>
            )}
          </p>
        )}
        {o.allapot === 'nincs' ? (
          <p className="text-sm text-muted-foreground">Ehhez az évhez még nincs országprofil.</p>
        ) : (
          <>
            {a && (
              <dl className="grid grid-cols-2 gap-x-3 gap-y-2 text-sm">
                {a.fovaros && <Sor cimke={C.fovaros.cimke}>{a.fovaros}</Sor>}
                {a.terulet != null && <Sor cimke={C.terulet.cimke}>{sz(a.terulet)}</Sor>}
                {a.penznem && <Sor cimke={C.penznem.cimke}>{a.penznem}</Sor>}
                <Sor cimke={C.lakossag.cimke}>{sz(a.lakossag)}</Sor>
                <Sor cimke={C.gdp.cimke}>{sz(a.gdp)}</Sor>
                <Sor cimke={C.gdpEgyFore.cimke}>{sz(a.gdpEgyFore)}</Sor>
                <Sor cimke={C.gdpNovekedes.cimke}>{sz(a.gdpNovekedes, ' %')}</Sor>
                {a.adatEv != null && <Sor cimke={C.adatEv.cimke}>{a.adatEv}{a.forras ? ` · ${a.forras}` : ''}</Sor>}
                {a.tagsagok.length > 0 && <Sor cimke={C.tagsagok.cimke}>{a.tagsagok.join(', ')}</Sor>}
              </dl>
            )}
            {o.iparagak.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Kiemelt iparágak</p>
                <div className="flex flex-wrap gap-1.5">{o.iparagak.map((i) => <AgazatBadge key={i} agazat={i} />)}</div>
              </div>
            )}
            {o.osszegzes && (
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Összegzés</p>
                <p className="text-sm leading-relaxed">{o.osszegzes}</p>
              </div>
            )}
          </>
        )}
      </CardContent>
      <CardFooter className="flex flex-wrap gap-2">
        {/* A cn() nem fölösleges: a tailwind-merge kiveszi az alap `border-transparent`-et, ami a CSS-ben a
            `border-border` után áll, így nélküle az outline link kerete eltűnne. */}
        <Link href={`/orszagprofil/${o.kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Teljes profil</Link>
        {/* Attasé nélkül (pl. a hazai profilnál) nincs poszt, akinek írni lehetne. */}
        {o.attasek.length > 0 && (
          <Link href="/kommunikacio" className={cn(buttonVariants({ variant: 'outline' }))}>Üzenet a poszttal</Link>
        )}
        {/* Magyarország a halmazba nem vehető fel; ha viszonyítási alap (a hívó `hazai`-jából, tehát a
            `hazaiRekord` szerint), a gomb helyén tájékoztató szöveg, különben (pl. csak attasé-hozzárendelés
            miatt van rekordja) semmi. Letiltott gombon a title nem jelenik meg (natív disabled +
            pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        {hazaiE(o.kod) ? (
          viszonyitasiAlap && (
            <span className="text-xs text-muted-foreground">Az összehasonlításban mindig szerepel viszonyítási alapként.</span>
          )
        ) : (
          <Button
            type="button"
            variant="outline"
            disabled={!benneVs && vsTele}
            onClick={onVs}
          >
            {benneVs ? <><Check /> Összehasonlításban</> : <><Plus /> Összehasonlítás</>}
          </Button>
        )}
        {szerkesztesGomb(o.kod, {
          felirat: o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés', feliratMost: 'Szerkesztés', className: 'ml-auto',
        })}
      </CardFooter>
    </Card>
  );
}
