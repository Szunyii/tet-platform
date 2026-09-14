'use client';

import { Check, Plus, X } from 'lucide-react';
import Link from 'next/link';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { AllapotBadge } from '../../../../components/orszagprofil/AllapotBadge';
import { IparagBadge } from '../../../../components/orszagprofil/IparagBadge';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Badge } from '../../../../components/ui/badge';
import { Button, buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import { BLOKK_KULCSOK, MEZO_CIMKEK } from '../../../../lib/orszagprofil-szotar';
import { formatSzam as sz } from '../../../../lib/szam';
import { ertekEsHely, SKALA_SZINEK, type Mutato, type Rangsor } from '../../../../lib/terkep-mutatok';
import { cn } from '../../../../lib/utils';

/** A kiválasztott ország profil-kivonata a térkép mellett. */
export function ProfilKivonat({
  o, szerkeszthetEv, szerkeszthetMost, most, valasztEvAction, onClose,
  mutato, rangsor, benneVs, vsTele, onVs,
}: {
  o: TerkepOrszag;
  szerkeszthetEv: boolean;
  szerkeszthetMost: boolean;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
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
}) {
  const a = o.alapadatok;
  const C = MEZO_CIMKEK.alapadatok;
  const poszt = [
    o.poszt?.fovaros,
    o.poszt?.terulet != null ? sz(o.poszt.terulet, ' km²') : null,
    o.poszt?.penznem,
  ].filter(Boolean).join(' · ');
  // A térképen választott számszerű mutató értéke és helyezése (a szűrt rangsorban); undefined = kategorikus mutató.
  const ertek = mutato.tipus === 'szam' ? ertekEsHely(o, mutato, rangsor) : undefined;
  // Van-e helyezése (a szűrő által kizárt ország nincs a rangsorban, de értéke lehet).
  const helyezett = !!rangsor?.sorok.some((s) => s.o.kod === o.kod);
  return (
    <Card>
      <CardHeader>
        <div className="flex items-start gap-2">
          <div className="min-w-0">
            <CardTitle>{o.nev}</CardTitle>
            <CardDescription>
              {o.attase ?? 'nincs aktív attasé'}{poszt ? ` · ${poszt}` : ''}
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
          // összehasonlító tábla kiemelt sora) – ez köti a sort a térkép aktuális színezéséhez. Érték
          // nélkül nincs sáv: a térkép sem színezi az országot, és a halvány szöveg a színen nem olvasható.
          <p className="rounded-md px-2 py-1 text-sm text-foreground" style={ertek === null ? undefined : { background: SKALA_SZINEK[0] }}>
            <span>{mutato.cimke}: </span>
            {ertek === null ? (
              <span className="text-muted-foreground">nincs adat</span>
            ) : (
              <span
                className="font-mono font-medium"
                title={helyezett ? 'Érték és helyezés a jelenlegi szűrés szerinti rangsorban' : 'Érték – a szűrés miatt az ország nincs a rangsorban'}
              >
                {ertek}
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
                <dt className="text-muted-foreground">{C.lakossag.cimke}</dt><dd>{sz(a.lakossag)}</dd>
                <dt className="text-muted-foreground">{C.gdp.cimke}</dt><dd>{sz(a.gdp)}</dd>
                <dt className="text-muted-foreground">{C.gdpEgyFore.cimke}</dt><dd>{sz(a.gdpEgyFore)}</dd>
                <dt className="text-muted-foreground">{C.gdpNovekedes.cimke}</dt><dd>{sz(a.gdpNovekedes, ' %')}</dd>
                {a.adatEv != null && (
                  <><dt className="text-muted-foreground">{C.adatEv.cimke}</dt><dd>{a.adatEv}{a.forras ? ` · ${a.forras}` : ''}</dd></>
                )}
                {a.tagsagok.length > 0 && (
                  <><dt className="text-muted-foreground">{C.tagsagok.cimke}</dt><dd>{a.tagsagok.join(', ')}</dd></>
                )}
              </dl>
            )}
            {o.iparagak.length > 0 && (
              <div>
                <p className="mb-1.5 text-xs font-medium tracking-wide text-muted-foreground uppercase">Kiemelt iparágak</p>
                <div className="flex flex-wrap gap-1.5">{o.iparagak.map((i) => <IparagBadge key={i} iparag={i} />)}</div>
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
        <Link href={`/orszagprofil/${o.kod}`} className={cn(buttonVariants({ variant: 'outline' }))}>Teljes profil</Link>
        <Link href="/kommunikacio" className={cn(buttonVariants({ variant: 'outline' }))}>Üzenet a poszttal</Link>
        {/* Letiltott gombon a title nem jelenik meg (natív disabled + pointer-events-none); a korlátot az OsszehasonlitasCsik írja ki. */}
        <Button
          type="button"
          variant="outline"
          disabled={!benneVs && vsTele}
          onClick={onVs}
        >
          {benneVs ? <><Check /> Összehasonlításban</> : <><Plus /> Összehasonlítás</>}
        </Button>
        <SzerkesztesGomb
          kod={o.kod}
          most={most}
          szerkeszthetEv={szerkeszthetEv}
          szerkeszthetMost={szerkeszthetMost}
          action={valasztEvAction}
          felirat={o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés'}
          feliratMost="Szerkesztés"
          className="ml-auto"
        />
      </CardFooter>
    </Card>
  );
}
