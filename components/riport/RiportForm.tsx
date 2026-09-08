'use client';

import { ChevronDownIcon } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import type { RiportDetail } from '../../db/queries/riport';
import { csatolmanyElocheck } from '../../lib/riport-validacio';
import {
  kategoriaByKulcs,
  LEIRAS_MAX,
  SZOVEG_MAX,
  TARGY_MAX,
  type KategoriaKulcs,
  type Kulcsszo,
} from '../../lib/riport-szotar';
import { cn } from '../../lib/utils';
import { hibaAttr, MezoHiba } from '../form/MezoHiba';
import { useMuveletForm, type MuveletState } from '../form/useMuveletForm';
import { Button, buttonVariants } from '../ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CsatolmanyMezo } from './CsatolmanyMezo';
import { EsemenyMezok } from './EsemenyMezok';
import { KategoriaValaszto } from './KategoriaValaszto';
import { KulcsszoValaszto } from './KulcsszoValaszto';

type FormAction = (prev: MuveletState, formData: FormData) => Promise<MuveletState>;

export function RiportForm({
  mode,
  initial,
  action,
}: {
  mode: 'create' | 'edit';
  initial?: RiportDetail;
  action: FormAction;
}) {
  // Sikernél az action redirectel a részletoldalra; a hook unstable_rethrow-val továbbengedi,
  // ezért nincs siker-toast.
  const [state, formAction, pending] = useMuveletForm(action);
  const errors = state.errors ?? {};

  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi az értékeket.
  const [kategoria, setKategoria] = useState<KategoriaKulcs | null>(initial?.kategoria ?? null);
  const [targy, setTargy] = useState(initial?.targy ?? '');
  const [leiras, setLeiras] = useState(initial?.leiras ?? '');
  const [kulcsszavak, setKulcsszavak] = useState<Kulcsszo[]>(initial?.kulcsszavak ?? []);
  const [esemenyDatum, setEsemenyDatum] = useState(initial?.esemenyDatum ?? '');
  const [esemenyHelyszin, setEsemenyHelyszin] = useState(initial?.esemenyHelyszin ?? '');
  const [joGyakorlat, setJoGyakorlat] = useState(initial?.joGyakorlat ?? '');
  const [kapcsolodoFeladat, setKapcsolodoFeladat] = useState(initial?.kapcsolodoFeladat ?? '');
  const [fajlok, setFajlok] = useState<File[]>([]);
  const [torlendo, setTorlendo] = useState<string[]>([]);

  const meglevok = initial?.csatolmanyok ?? [];
  const vanOpcionalis = Boolean(joGyakorlat || kapcsolodoFeladat || fajlok.length || meglevok.length);
  const vanOpcionalisHiba = Boolean(errors.joGyakorlat || errors.kapcsolodoFeladat || errors.csatolmany);
  const [tovabbiNyitva, setTovabbiNyitva] = useState(vanOpcionalis);
  const datumKotelezo = kategoria ? kategoriaByKulcs(kategoria).datumKotelezo : false;
  // A hozzáadott fájlokat a csatolmanyElocheck maga számolja bele: itt csak a bejegyzésen
  // megmaradó, korábban feltöltött csatolmányok száma megy át.
  const elocheckHiba = csatolmanyElocheck(fajlok, meglevok.length - torlendo.length);

  // Szerverhibánál egyszer kinyitjuk az opcionális szekciót (különben a hiba láthatatlan
  // maradna); utána a felhasználó szabadon becsukhatja. Render közbeni állapot-igazítás
  // (nem useEffect): így a panel már a beküldés utáni commitban nyitva van, és a
  // useMuveletForm fókusz-effektje a `csatolmany` mezőre is rá tud ugrani – egy rejtett
  // (hidden) elem nem fókuszálható.
  const [latottState, setLatottState] = useState(state);
  if (latottState !== state) {
    setLatottState(state);
    if (vanOpcionalisHiba) setTovabbiNyitva(true);
  }

  return (
    <form action={formAction} className="flex max-w-3xl flex-col gap-6" noValidate>
      <section className="flex flex-col gap-2">
        <Label id="kategoria-label">Kategória</Label>
        <KategoriaValaszto value={kategoria} onChange={setKategoria} invalid={Boolean(errors.kategoria)} />
        <MezoHiba mezo="kategoria" errors={errors} />
      </section>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="targy">Tárgy</Label>
        <Input
          id="targy"
          name="targy"
          required
          maxLength={TARGY_MAX}
          autoComplete="off"
          placeholder="Egy sorban: miről szól a bejegyzés"
          value={targy}
          onChange={(e) => setTargy(e.target.value)}
          {...hibaAttr(errors, 'targy')}
        />
        <MezoHiba mezo="targy" errors={errors} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="leiras">Leírás</Label>
        <Textarea
          id="leiras"
          name="leiras"
          required
          maxLength={LEIRAS_MAX}
          rows={6}
          placeholder="Egy bekezdés: a lényeg, kontextus, mit érdemes tudni róla."
          value={leiras}
          onChange={(e) => setLeiras(e.target.value)}
          {...hibaAttr(errors, 'leiras')}
        />
        <p className="text-xs text-muted-foreground">
          {leiras.length}/{LEIRAS_MAX}
        </p>
        <MezoHiba mezo="leiras" errors={errors} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label id="kulcsszavak-label" htmlFor="kulcsszavak">
          Kulcsszavak (1–5)
        </Label>
        <KulcsszoValaszto value={kulcsszavak} onChange={setKulcsszavak} invalid={Boolean(errors.kulcsszavak)} />
        <MezoHiba mezo="kulcsszavak" errors={errors} />
      </div>

      {datumKotelezo && (
        <EsemenyMezok
          datum={esemenyDatum}
          helyszin={esemenyHelyszin}
          onDatum={setEsemenyDatum}
          onHelyszin={setEsemenyHelyszin}
          errors={errors}
        />
      )}

      <Collapsible open={tovabbiNyitva} onOpenChange={setTovabbiNyitva}>
        <CollapsibleTrigger render={<Button type="button" variant="ghost" size="sm" className="-ml-2" />}>
          <ChevronDownIcon className={cn('transition-transform', tovabbiNyitva && 'rotate-180')} />
          További adatok (opcionális): jó gyakorlat, kapcsolódó feladat, csatolmány
        </CollapsibleTrigger>
        {/* keepMounted: becsukott állapotban a panel tartalma alapból unmountolódik, és a benne
            lévő mezők (jó gyakorlat, kapcsolódó feladat, a csatolmányok rejtett file-inputja)
            kimaradnának a beküldött FormData-ból – a felhasználó által megadott adat némán
            elveszne. Így a mezők a DOM-ban maradnak (hidden), és beküldésre kerülnek. */}
        <CollapsibleContent keepMounted className="mt-3 flex flex-col gap-4">
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="joGyakorlat">Magyarország számára átvehető jó gyakorlat</Label>
            <Textarea
              id="joGyakorlat"
              name="joGyakorlat"
              maxLength={SZOVEG_MAX}
              rows={3}
              value={joGyakorlat}
              onChange={(e) => setJoGyakorlat(e.target.value)}
              {...hibaAttr(errors, 'joGyakorlat')}
            />
            <MezoHiba mezo="joGyakorlat" errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="kapcsolodoFeladat">Kapcsolódó feladat, kérés</Label>
            <Textarea
              id="kapcsolodoFeladat"
              name="kapcsolodoFeladat"
              maxLength={SZOVEG_MAX}
              rows={3}
              value={kapcsolodoFeladat}
              onChange={(e) => setKapcsolodoFeladat(e.target.value)}
              {...hibaAttr(errors, 'kapcsolodoFeladat')}
            />
            <MezoHiba mezo="kapcsolodoFeladat" errors={errors} />
          </div>
          <CsatolmanyMezo
            fajlok={fajlok}
            onFajlok={setFajlok}
            meglevok={meglevok}
            torlendo={torlendo}
            onTorlendo={setTorlendo}
            errors={errors}
            elocheckHiba={elocheckHiba}
          />
        </CollapsibleContent>
      </Collapsible>

      <MezoHiba mezo="form" errors={errors} alert />

      <div className="flex items-center justify-end gap-2 border-t border-border pt-4">
        {/* Link + buttonVariants (nem Button render={<Link/>}): a Base UI Button natív <button>-t vár. */}
        <Link
          href={mode === 'create' ? '/riportok' : `/riportok/${initial?.id}`}
          className={cn(buttonVariants({ variant: 'outline' }), pending && 'pointer-events-none opacity-50')}
        >
          Mégse
        </Link>
        <Button type="submit" disabled={pending || Boolean(elocheckHiba)}>
          {pending ? 'Mentés…' : mode === 'create' ? 'Bejegyzés beadása' : 'Módosítások mentése'}
        </Button>
      </div>
    </form>
  );
}
