'use client';

import { useCallback, useState } from 'react';
import WorldMap, { type MapMetric } from '../../../../components/WorldMap';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../../components/ui/select';
import { Tabs, TabsList, TabsTrigger } from '../../../../components/ui/tabs';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { IPARAGAK, type Iparag } from '../../../../lib/orszagprofil-szotar';
import { ProfilKivonat } from './ProfilKivonat';
import { TerkepUres } from './TerkepUres';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';

export function TerkepNezet({
  adatok, ev, most, sajatKod, admin, kezdoKod, valasztEvAction,
}: {
  adatok: TerkepOrszag[];
  /** A választott (nézett) év és az aktuális év. */
  ev: number;
  most: number;
  sajatKod: string | null;
  admin: boolean;
  kezdoKod: string | null;
  valasztEvAction: (formData: FormData) => Promise<void>;
}) {
  const [metric, setMetric] = useState<MapMetric>('iparag');
  const [iparag, setIparag] = useState('');
  const [kod, setKod] = useState<string | null>(
    kezdoKod && adatok.some((o) => o.kod === kezdoKod) ? kezdoKod : null,
  );
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
          {sajatKod && !admin && (
            <SzerkesztesGomb
              kod={sajatKod}
              most={most}
              szerkeszthetEv={ev === most}
              szerkeszthetMost
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
            szerkeszthetEv={admin || (sel.kod === sajatKod && ev === most)}
            szerkeszthetMost={admin || sel.kod === sajatKod}
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
