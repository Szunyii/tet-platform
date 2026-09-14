'use client';

import { X } from 'lucide-react';
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
import { cn } from '../../../../lib/utils';

/** A kiválasztott ország profil-kivonata a térkép mellett. */
export function ProfilKivonat({
  o, szerkeszthetEv, szerkeszthetMost, most, valasztEvAction, onClose,
}: {
  o: TerkepOrszag;
  szerkeszthetEv: boolean;
  szerkeszthetMost: boolean;
  most: number;
  valasztEvAction: (formData: FormData) => Promise<void>;
  onClose: () => void;
}) {
  const a = o.alapadatok;
  const C = MEZO_CIMKEK.alapadatok;
  const poszt = [
    o.poszt?.fovaros,
    o.poszt?.terulet != null ? sz(o.poszt.terulet, ' km²') : null,
    o.poszt?.penznem,
  ].filter(Boolean).join(' · ');
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
        <SzerkesztesGomb
          kod={o.kod}
          most={most}
          szerkeszthetEv={szerkeszthetEv}
          szerkeszthetMost={szerkeszthetMost}
          action={valasztEvAction}
          felirat={o.allapot === 'nincs' ? 'Profil kitöltése' : 'Szerkesztés'}
          className="ml-auto"
        />
      </CardFooter>
    </Card>
  );
}
