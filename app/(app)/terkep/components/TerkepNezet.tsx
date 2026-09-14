'use client';

import { useCallback, useState } from 'react';
import WorldMap, { type MapMetric } from '../../../../components/WorldMap';
import { useApp } from '../../../../components/AppShell';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { IPARAGAK, type Iparag } from '../../../../lib/orszagprofil-szotar';
import { ProfilKivonat } from './ProfilKivonat';
import { TerkepUres } from './TerkepUres';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';

export function TerkepNezet({
  adatok, ev, most, kezdoKod, valasztEvAction,
}: {
  adatok: TerkepOrszag[];
  /** A választott (nézett) év. */
  ev: number;
  /** Az aktuális év (a nem szerkeszthető évnézetből ide vált a SzerkesztesGomb). */
  most: number;
  kezdoKod: string | null;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  // A session a contextből: a jog-számítás (canEditProfil) és a „Saját országprofil" gomb is ebből dolgozik.
  const { user } = useApp();
  const sajatKod = user.role === 'attase' ? user.orszag : null;
  const [metric, setMetric] = useState<MapMetric>('iparag');
  const [iparag, setIparag] = useState('');
  const [kod, setKod] = useState<string | null>(
    kezdoKod && adatok.some((o) => o.kod === kezdoKod) ? kezdoKod : null,
  );
  // Évváltáskor az adatok újak, a kiválasztás marad; ha a választott ország az új évben
  // nincs az adatokban, render közben töröljük (a „prop változásra állapot igazítása" minta).
  if (kod && !adatok.some((o) => o.kod === kod)) setKod(null);
  const onSelect = useCallback((k: string) => setKod(k), []);
  const sel = kod ? adatok.find((o) => o.kod === kod) ?? null : null;
  const friss = adatok.filter((o) => o.allapot === 'friss').length;
  const erintett = iparag ? adatok.filter((o) => o.iparagak.includes(iparag as Iparag)).length : null;

  return (
    <div className="flex max-w-[1600px] flex-wrap items-start gap-4">
      <Card className="min-w-0 flex-[1_1_560px] overflow-hidden">
        <CardHeader className="flex flex-wrap items-center gap-3">
          <Tabs value={metric} onValueChange={(v) => setMetric(v as MapMetric)}>
            <TabsList>
              <TabsTrigger value="iparag">Kiemelt iparág</TabsTrigger>
              <TabsTrigger value="allapot">Profil állapota</TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Label id="iparag-szuro-label" htmlFor="iparag-szuro">Iparág</Label>
            {/* A Select onValueChange null-t is adhat (törlés); a „Mind" és a null egyaránt „nincs szűrő". */}
            <Select
              value={iparag || MIND}
              onValueChange={(v) => setIparag(!v || v === MIND ? '' : v)}
              items={{ [MIND]: 'Mind', ...Object.fromEntries(IPARAGAK.map((i) => [i, i])) }}
            >
              <SelectTrigger id="iparag-szuro" aria-labelledby="iparag-szuro-label iparag-szuro" className="w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={MIND}>Mind</SelectItem>
                {IPARAGAK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <span className="ml-auto text-xs text-muted-foreground">
            {erintett !== null ? `${erintett} ország emeli ki ezt az iparágat` : `${adatok.length} poszt · ${friss} profil (${ev})`}
          </span>
          {sajatKod && (
            <SzerkesztesGomb
              kod={sajatKod}
              most={most}
              szerkeszthetEv={canEditProfil(user, sajatKod, ev, most)}
              szerkeszthetMost={canEditProfil(user, sajatKod, most, most)}
              action={valasztEvAction}
              felirat="Saját országprofil"
            />
          )}
        </CardHeader>
        <CardContent className="p-0">
          <WorldMap adatok={adatok} metric={metric} iparag={iparag} selected={kod ?? ''} onSelect={onSelect} />
        </CardContent>
      </Card>
      <div className="flex min-w-0 max-w-[420px] flex-[1_1_330px] flex-col gap-4">
        {sel ? (
          <ProfilKivonat
            o={sel}
            szerkeszthetEv={canEditProfil(user, sel.kod, ev, most)}
            szerkeszthetMost={canEditProfil(user, sel.kod, most, most)}
            most={most}
            valasztEvAction={valasztEvAction}
            onClose={() => setKod(null)}
          />
        ) : (
          <TerkepUres adatok={adatok} onSelect={onSelect} />
        )}
      </div>
    </div>
  );
}
