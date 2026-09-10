'use client';

import type { ChangeEvent, ReactNode } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { MezoHibak } from '../../../../lib/urlap';
import { EMAIL_MAX, TELEFON_MAX, type Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { ORSZAGOK } from '../../../../lib/orszagok';

/** A dialógusok vezérelt attasé-mezői (mind string: az űrlap nyers értéke; az ország ISO-kód). */
export interface AttaseMezoErtekek {
  orszag: string;
  fovaros: string;
  terulet: string;
  penznem: string;
  telefon: string;
  kapcsolatEmail: string;
}

export const URES_ATTASE_MEZOK: AttaseMezoErtekek = {
  orszag: '',
  fovaros: '',
  terulet: '',
  penznem: '',
  telefon: '',
  kapcsolatEmail: '',
};

/**
 * Elérhetőség (telefon, kapcsolattartási e-mail) és TéT poszt (ország, főváros, terület,
 * pénznem) blokk az új-felhasználó és a szerkesztés dialógusban. A poszt-blokk csak
 * attasénál látszik; a vezérelt értékek megmaradnak, ha a szerepkör-váltás elrejti.
 * A mezők id-ja = name = a validátor hibakulcsa (a useMuveletForm erre fókuszál).
 */
export function AttaseMezok({
  ertekek,
  onChange,
  szerepkor,
  errors,
}: {
  ertekek: AttaseMezoErtekek;
  onChange: (ertekek: AttaseMezoErtekek) => void;
  szerepkor: Szerepkor;
  errors: MezoHibak;
}) {
  const set = (kulcs: keyof AttaseMezoErtekek) => (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    onChange({ ...ertekek, [kulcs]: e.target.value });

  return (
    <>
      <Blokk cim="Elérhetőség">
        <div className="grid gap-3 sm:grid-cols-2">
          <Mezo id="telefon" cimke="Telefon" errors={errors}>
            <Input
              id="telefon"
              name="telefon"
              type="tel"
              inputMode="tel"
              maxLength={TELEFON_MAX}
              autoComplete="off"
              placeholder="pl. +82 2 1234 5678"
              value={ertekek.telefon}
              onChange={set('telefon')}
              {...hibaAttr(errors, 'telefon')}
            />
          </Mezo>
          <Mezo id="kapcsolatEmail" cimke="Kapcsolattartási e-mail" errors={errors}>
            <Input
              id="kapcsolatEmail"
              name="kapcsolatEmail"
              type="email"
              maxLength={EMAIL_MAX}
              autoComplete="off"
              value={ertekek.kapcsolatEmail}
              onChange={set('kapcsolatEmail')}
              {...hibaAttr(errors, 'kapcsolatEmail')}
            />
          </Mezo>
        </div>
      </Blokk>
      {szerepkor === 'attase' && (
        <Blokk cim="TéT poszt">
          <div className="grid gap-3 sm:grid-cols-2">
            <Mezo id="orszag" cimke="Ország" errors={errors}>
              <select
                id="orszag"
                name="orszag"
                required
                value={ertekek.orszag}
                onChange={set('orszag')}
                className="h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 aria-invalid:border-destructive"
                {...hibaAttr(errors, 'orszag')}
              >
                <option value="">Válassz országot…</option>
                {ORSZAGOK.map((o) => (
                  <option key={o.kod} value={o.kod}>
                    {o.nev}
                  </option>
                ))}
              </select>
            </Mezo>
            <Mezo id="fovaros" cimke="Főváros" errors={errors}>
              <Input
                id="fovaros"
                name="fovaros"
                maxLength={100}
                autoComplete="off"
                placeholder="pl. Szöul"
                value={ertekek.fovaros}
                onChange={set('fovaros')}
                {...hibaAttr(errors, 'fovaros')}
              />
            </Mezo>
            <Mezo id="terulet" cimke="Terület (km²)" errors={errors}>
              <Input
                id="terulet"
                name="terulet"
                inputMode="numeric"
                maxLength={12}
                autoComplete="off"
                placeholder="pl. 100 210"
                value={ertekek.terulet}
                onChange={set('terulet')}
                {...hibaAttr(errors, 'terulet')}
              />
            </Mezo>
            <Mezo id="penznem" cimke="Pénznem" errors={errors}>
              <Input
                id="penznem"
                name="penznem"
                maxLength={100}
                autoComplete="off"
                placeholder="pl. dél-koreai von (KRW)"
                value={ertekek.penznem}
                onChange={set('penznem')}
                {...hibaAttr(errors, 'penznem')}
              />
            </Mezo>
          </div>
        </Blokk>
      )}
    </>
  );
}

/** Egy űrlap-blokk: felső elválasztó vonal, a cím a vonalon ül (fieldset + legend). */
function Blokk({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-2 border-t border-border pt-3">
      <legend className="pr-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{cim}</legend>
      {children}
    </fieldset>
  );
}

/** Címke + mező + hibaüzenet; a hiba kulcsa a mező id-ja. */
function Mezo({
  id,
  cimke,
  errors,
  children,
}: {
  id: string;
  cimke: string;
  errors: MezoHibak;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label htmlFor={id}>{cimke}</Label>
      {children}
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}
