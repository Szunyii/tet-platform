'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { RiportDetail } from '../../db/queries/riport';
import { csatolmanyElocheck } from '../../lib/riport-validacio';
import {
  kategoriaByKulcs,
  LEIRAS_MAX,
  RIPORT_MEZO_CIMKEK,
  SZOVEG_MAX,
  TARGY_MAX,
  type KategoriaKulcs,
  type Kulcsszo,
} from '../../lib/riport-szotar';
import { cn } from '../../lib/utils';
import { Mezo } from '../form/Mezo';
import { hibaAttr, MezoHiba } from '../form/MezoHiba';
import { NativeSelect } from '../form/NativeSelect';
import { useMuveletForm, type FormAction } from '../form/useMuveletForm';
import { Button, buttonVariants } from '../ui/button';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { CsatolmanyMezo } from './CsatolmanyMezo';
import { EsemenyMezok } from './EsemenyMezok';
import { KategoriaValaszto } from './KategoriaValaszto';
import { KulcsszoValaszto } from './KulcsszoValaszto';

const C = RIPORT_MEZO_CIMKEK;

/** Létrehozásnál nincs `initial`, szerkesztésnél kötelező – a típus is ezt kényszeríti ki. */
export type RiportFormProps = { action: FormAction } & (
  | {
      mode: 'create';
      initial?: undefined;
      /** A beadó saját országai (székhely elöl); több országnál választó jelenik meg. */
      orszagok?: readonly { kod: string; nev: string }[];
    }
  | { mode: 'edit'; initial: RiportDetail; orszagok?: undefined }
);

export function RiportForm({ mode, initial, action, orszagok }: RiportFormProps) {
  // Sikernél az action redirectel a részletoldalra; a hook unstable_rethrow-val továbbengedi,
  // ezért nincs siker-toast.
  const [state, formAction, pending] = useMuveletForm(action);
  const errors = state.errors ?? {};

  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi az értékeket.
  const [orszag, setOrszag] = useState(orszagok?.[0]?.kod ?? '');
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
  const datumKotelezo = kategoria ? kategoriaByKulcs(kategoria).datumKotelezo : false;
  // A hozzáadott fájlokat a csatolmanyElocheck maga számolja bele: itt csak a bejegyzésen
  // megmaradó, korábban feltöltött csatolmányok száma megy át.
  const elocheckHiba = csatolmanyElocheck(fajlok, meglevok.length - torlendo.length);

  return (
    <Card className="max-w-3xl">
      {/* A form `contents`: a kártya rácsa a CardContent/CardFooter-t látja, a mezők és a gombok
          mégis egy <form>-ban vannak (a BlokkForm mintája). */}
      <form action={formAction} className="contents" noValidate>
        <CardContent className="flex flex-col gap-6 pt-2">
          {orszagok && orszagok.length > 1 && (
            <Mezo id="orszag" cimke={C.orszag} errors={errors}>
              <NativeSelect
                id="orszag"
                name="orszag"
                className="max-w-sm"
                value={orszag}
                onChange={(e) => setOrszag(e.target.value)}
                {...hibaAttr(errors, 'orszag')}
              >
                {orszagok.map((o) => (
                  <option key={o.kod} value={o.kod}>
                    {o.nev}
                  </option>
                ))}
              </NativeSelect>
            </Mezo>
          )}

          <section className="flex flex-col gap-2">
            <Label id="kategoria-label">{C.kategoria}</Label>
            <KategoriaValaszto value={kategoria} onChange={setKategoria} invalid={Boolean(errors.kategoria)} />
            <MezoHiba mezo="kategoria" errors={errors} />
          </section>

          <Mezo id="targy" cimke={C.targy} errors={errors}>
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
          </Mezo>

          <Mezo id="leiras" cimke={C.leiras} errors={errors}>
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
          </Mezo>

          <Mezo id="joGyakorlat" cimke={C.joGyakorlat} opcionalis errors={errors}>
            <Textarea
              id="joGyakorlat"
              name="joGyakorlat"
              maxLength={SZOVEG_MAX}
              rows={3}
              value={joGyakorlat}
              onChange={(e) => setJoGyakorlat(e.target.value)}
              {...hibaAttr(errors, 'joGyakorlat')}
            />
          </Mezo>

          <Mezo id="kulcsszavak" cimke={C.kulcsszavak} errors={errors}>
            <KulcsszoValaszto value={kulcsszavak} onChange={setKulcsszavak} invalid={Boolean(errors.kulcsszavak)} />
          </Mezo>

          {datumKotelezo && (
            <EsemenyMezok
              datum={esemenyDatum}
              helyszin={esemenyHelyszin}
              onDatum={setEsemenyDatum}
              onHelyszin={setEsemenyHelyszin}
              errors={errors}
            />
          )}

          <Mezo id="kapcsolodoFeladat" cimke={C.kapcsolodoFeladat} opcionalis errors={errors}>
            <Textarea
              id="kapcsolodoFeladat"
              name="kapcsolodoFeladat"
              maxLength={SZOVEG_MAX}
              rows={3}
              value={kapcsolodoFeladat}
              onChange={(e) => setKapcsolodoFeladat(e.target.value)}
              {...hibaAttr(errors, 'kapcsolodoFeladat')}
            />
          </Mezo>

          <CsatolmanyMezo
            fajlok={fajlok}
            onFajlok={setFajlok}
            meglevok={meglevok}
            torlendo={torlendo}
            onTorlendo={setTorlendo}
            errors={errors}
            elocheckHiba={elocheckHiba}
          />

          <MezoHiba mezo="form" errors={errors} alert />
        </CardContent>

        <CardFooter className="justify-end gap-2">
          {/* Link + buttonVariants (nem Button render={<Link/>}): a Base UI Button natív <button>-t vár. */}
          <Link
            href={mode === 'create' ? '/jelentesek' : `/jelentesek/${initial.id}`}
            className={cn(buttonVariants({ variant: 'outline' }), pending && 'pointer-events-none opacity-50')}
            aria-disabled={pending || undefined}
            tabIndex={pending ? -1 : undefined}
            onClick={(e) => {
              // A pointer-events-none csak egérrel tiltja; billentyűzetről (Enter) is meg kell fogni.
              if (pending) e.preventDefault();
            }}
          >
            Mégse
          </Link>
          <Button type="submit" disabled={pending || Boolean(elocheckHiba)}>
            {pending ? 'Mentés…' : mode === 'create' ? 'Bejegyzés beadása' : 'Módosítások mentése'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
