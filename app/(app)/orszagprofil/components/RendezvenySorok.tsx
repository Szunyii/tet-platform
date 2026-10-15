'use client';

import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Mezo, RovidMezo } from '../../../../components/form/Mezo';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import type { MezoHibak } from '../../../../lib/urlap';
import {
  REND_MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK, ROVID_MAX, rendezvenyTipus, type Rendezveny,
} from '../../../../lib/orszagprofil-szotar';

/** Egy rendezvénysor az űrlapon; az `id` stabil kliens-kulcs (a sorok törölhetők, a pozíció változik), a mentésbe nem kerül. */
export interface RendezvenySor extends Rendezveny {
  id: number;
}

const R = REND_MEZO_CIMKEK;

/** Az űrlap kezdősorai a mentett listából. */
export function rendezvenySorok(lista: readonly Rendezveny[]): RendezvenySor[] {
  return lista.map((r, i) => ({ ...r, id: i + 1 }));
}

/**
 * Hozzáadható/törölhető rendezvény-sorok; mezőnevek `rendezveny.<i>.<mezo>`, id-k
 * `rendezvenyek.rendezveny.<i>.<mezo>` (az `i` a sor aktuális pozíciója – a validátor indexenként olvas).
 * A régiós országsorok mintájára (OrszagMezok): hozzáadás után a fókusz az új sor nevére, törlés után a
 * hozzáadás-gombra kerül, és a törlés a következő beküldésig elrejti a pozícióhoz kötött sorhibákat (más
 * sorra mutatnának). A mezők kérdőjeles magyarázata a `REND_MEZO_CIMKEK`-ből jön.
 */
export function RendezvenySorok({
  value, onChange, errors,
}: { value: RendezvenySor[]; onChange: (v: RendezvenySor[]) => void; errors: MezoHibak }) {
  const hozzaadGomb = useRef<HTMLButtonElement>(null);
  // Két beküldés között az `errors` ugyanaz az objektum: amíg az, a törlés előtti hibák rejtve maradnak.
  const [elavultHibak, setElavultHibak] = useState<MezoHibak | null>(null);
  const hibak = elavultHibak === errors ? {} : errors;
  const set = (id: number, patch: Partial<Rendezveny>) => onChange(value.map((r) => (r.id === id ? { ...r, ...patch } : r)));
  const mezoId = (i: number, m: keyof Rendezveny) => `rendezvenyek.rendezveny.${i}.${m}`;
  const ujSor = () => {
    flushSync(() => {
      onChange([
        ...value,
        { id: Math.max(0, ...value.map((r) => r.id)) + 1, nev: '', tipus: RENDEZVENY_TIPUSOK[0].kulcs, idopont: '', megjegyzes: '' },
      ]);
    });
    document.getElementById(mezoId(value.length, 'nev'))?.focus();
  };
  const torolSor = (id: number) => {
    flushSync(() => {
      setElavultHibak(errors);
      onChange(value.filter((r) => r.id !== id));
    });
    hozzaadGomb.current?.focus();
  };
  return (
    <div className="flex flex-col gap-4">
      {value.map((r, i) => (
        <fieldset key={r.id} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs text-muted-foreground">{i + 1}. rendezvény</legend>
          <RovidMezo id={mezoId(i, 'nev')} name={`rendezveny.${i}.nev`} {...R.nev} value={r.nev}
            onChange={(v) => set(r.id, { nev: v })} max={ROVID_MAX} errors={hibak} />
          <Mezo id={mezoId(i, 'tipus')} {...R.tipus} errors={hibak}>
            <NativeSelect id={mezoId(i, 'tipus')} name={`rendezveny.${i}.tipus`} value={r.tipus}
              onChange={(e) => set(r.id, { tipus: rendezvenyTipus(e.target.value) })}>
              {RENDEZVENY_TIPUSOK.map((t) => <option key={t.kulcs} value={t.kulcs}>{t.cimke}</option>)}
            </NativeSelect>
          </Mezo>
          <RovidMezo id={mezoId(i, 'idopont')} name={`rendezveny.${i}.idopont`} {...R.idopont} value={r.idopont}
            onChange={(v) => set(r.id, { idopont: v })} max={ROVID_MAX} errors={hibak} />
          <RovidMezo id={mezoId(i, 'megjegyzes')} name={`rendezveny.${i}.megjegyzes`} {...R.megjegyzes} value={r.megjegyzes}
            onChange={(v) => set(r.id, { megjegyzes: v })} max={ROVID_MAX} errors={hibak} />
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" aria-label={`${i + 1}. rendezvény törlése`} onClick={() => torolSor(r.id)}>
              Sor törlése
            </Button>
          </div>
        </fieldset>
      ))}
      <div>
        <Button ref={hozzaadGomb} type="button" variant="outline" size="sm" disabled={value.length >= RENDEZVENY_MAX} onClick={ujSor}>
          Rendezvény hozzáadása
        </Button>
        {value.length >= RENDEZVENY_MAX && <span className="ml-2 text-xs text-muted-foreground">Legfeljebb {RENDEZVENY_MAX} rendezvény.</span>}
      </div>
    </div>
  );
}
