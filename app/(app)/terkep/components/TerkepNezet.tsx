'use client';

import { useMemo } from 'react';
import { useApp } from '../../../../components/AppShell';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { Card, CardContent, CardHeader } from '../../../../components/ui/card';
import { Label } from '../../../../components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '../../../../components/ui/select';
import type { TerkepOrszag } from '../../../../db/queries/orszagprofil';
import { canEditProfil } from '../../../../lib/orszagprofil-jog';
import { IPARAGAK } from '../../../../lib/orszagprofil-szotar';
import {
  csoportok as szamolCsoportok, jeloltek, KATEGORIA_MUTATOK, MUTATOK, rangsor as szamolRangsor, szures, SZAM_MUTATOK,
  tartomany as szamolTartomany,
} from '../../../../lib/terkep-mutatok';
import { OsszehasonlitasPanel } from './OsszehasonlitasPanel';
import { TerkepPanel } from './TerkepPanel';
import { useTerkepAllapot, VS_MIN } from './useTerkepAllapot';
import { VilagTerkep } from './VilagTerkep';

/** A „Mind" opció értéke: a Base UI Select üres stringet nem tud választható értékként kezelni. */
const MIND = '__mind';
const MUTATO_ITEMS: Record<string, string> = Object.fromEntries(MUTATOK.map((m) => [m.kulcs, m.cimke]));
const IPARAG_ITEMS: Record<string, string> = { [MIND]: 'Mind', ...Object.fromEntries(IPARAGAK.map((i) => [i, i])) };

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
  const allapot = useTerkepAllapot(adatok, kezdoKod);
  const { mutato, iparag, vs } = allapot;

  // A rangsor/csoportok a szűrt halmazon, a tartomány (színskála) szándékosan a szűretlenen.
  const rangsor = useMemo(() => (mutato.tipus === 'szam' ? szamolRangsor(adatok, mutato, iparag) : null), [adatok, mutato, iparag]);
  const csoportok = useMemo(() => (mutato.tipus === 'kategoria' ? szamolCsoportok(adatok, mutato, iparag) : []), [adatok, mutato, iparag]);
  const tartomany = useMemo(() => (mutato.tipus === 'szam' ? szamolTartomany(adatok, mutato) : null), [adatok, mutato]);
  // Az összehasonlítás-halmaz rekordjai és a „+ Ország" jelöltjei; a `vs` csak tényleges változásnál új példány.
  const vsOrszagok = useMemo(
    () => vs.map((k) => adatok.find((o) => o.kod === k)).filter((o): o is TerkepOrszag => !!o),
    [adatok, vs],
  );
  const jeloltLista = useMemo(() => jeloltek(adatok, vs, mutato), [adatok, vs, mutato]);
  const szamlalo = rangsor
    ? `${rangsor.sorok.length} ország adattal · ${rangsor.adatNelkul.length} adat nélkül`
    : iparag
      ? `${szures(adatok, iparag).length} ország emeli ki ezt az iparágat`
      : `${adatok.length} poszt · ${adatok.filter((o) => o.allapot === 'friss').length} profil (${ev})`;

  return (
    <div className="flex max-w-[1600px] flex-col gap-4">
      <div className="flex flex-wrap items-start gap-4">
        <Card className="min-w-0 flex-[1_1_560px] overflow-hidden">
          <CardHeader className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <Label id="mutato-label" htmlFor="mutato">Mutató</Label>
              <Select value={mutato.kulcs} onValueChange={(v) => allapot.setMutatoKulcs(v ?? '')} items={MUTATO_ITEMS}>
                <SelectTrigger id="mutato" aria-labelledby="mutato-label mutato" className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Kategória</SelectLabel>
                    {KATEGORIA_MUTATOK.map((m) => <SelectItem key={m.kulcs} value={m.kulcs}>{m.cimke}</SelectItem>)}
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Számszerű</SelectLabel>
                    {SZAM_MUTATOK.map((m) => <SelectItem key={m.kulcs} value={m.kulcs}>{m.cimke}</SelectItem>)}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label id="iparag-szuro-label" htmlFor="iparag-szuro">Iparág</Label>
              {/* A Select onValueChange null-t is adhat (törlés); a „Mind" és a null egyaránt „nincs szűrő". */}
              <Select value={iparag || MIND} onValueChange={(v) => allapot.setIparag(!v || v === MIND ? '' : v)} items={IPARAG_ITEMS}>
                <SelectTrigger id="iparag-szuro" aria-labelledby="iparag-szuro-label iparag-szuro" className="w-64">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={MIND}>Mind</SelectItem>
                  {IPARAGAK.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            {/* A számláló szöveg a rangsor-panel alcíme (nem duplázzuk a fejlécben). */}
            {sajatKod && (
              <SzerkesztesGomb
                kod={sajatKod}
                most={most}
                szerkeszthetEv={canEditProfil(user, sajatKod, ev, most)}
                szerkeszthetMost={canEditProfil(user, sajatKod, most, most)}
                action={valasztEvAction}
                felirat="Saját országprofil"
                className="ml-auto"
              />
            )}
          </CardHeader>
          <CardContent className="p-0">
            <VilagTerkep
              adatok={adatok}
              mutato={mutato}
              iparag={iparag}
              kivalasztott={allapot.kod}
              osszehasonlitas={vs}
              tartomany={tartomany}
              csoportok={csoportok}
              rangsor={rangsor}
              onSelect={allapot.kivalaszt}
            />
          </CardContent>
        </Card>
        <div className="flex min-w-0 max-w-[420px] flex-[1_1_330px] flex-col gap-4">
          <TerkepPanel
            adatok={adatok}
            allapot={allapot}
            vsOrszagok={vsOrszagok}
            rangsor={rangsor}
            csoportok={csoportok}
            tartomany={tartomany}
            szamlalo={szamlalo}
            ev={ev}
            most={most}
            valasztEvAction={valasztEvAction}
          />
        </div>
      </div>
      {/* Az összehasonlító tábla a térkép alatt, teljes szélességben: 2–4 oszlop a keskeny panelen nem férne el. */}
      {vsOrszagok.length >= VS_MIN && (
        <OsszehasonlitasPanel
          orszagok={vsOrszagok}
          jeloltek={jeloltLista}
          mutato={mutato}
          onKivalaszt={allapot.kivalaszt}
          onKivesz={allapot.vsKivesz}
          onHozzaad={allapot.vsHozzaad}
          onTorol={allapot.vsTorol}
        />
      )}
    </div>
  );
}
