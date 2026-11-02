'use client';

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../../../../components/ui/button';
import { SOR_EGYSEG, SOR_MAX, SOR_MEZOK, type SorLista, type SorMezoSzabaly, type SorTipusok } from '../../../../lib/tudastar-szotar';
import type { MezoHibak } from '../../../../lib/urlap';
import { KartyaMezo, SZOVEG_SUGO } from './KartyaMezo';

/** Egy sor az űrlapon; az `_id` stabil kliens-kulcs (a sorok mozognak és törölhetők), a mentésbe nem kerül. */
export type SorAllapot<T> = T & { _id: number };

/** Mentett lista → űrlap-sorok (1-től számozott `_id`-vel). */
export function sorokbol<T>(lista: readonly T[]): SorAllapot<T>[] {
  return lista.map((x, i) => ({ ...x, _id: i + 1 }));
}

/**
 * Egy dinamikus lista (`szakaszok`, `programok`, `linkek`, `sorok`) szerkesztője; a mezők, a korlát és a
 * feliratok a `SOR_MEZOK`/`SOR_MAX`/`SOR_EGYSEG`-ből jönnek, mint a validátornál. A mezők id-ja és neve
 * `<lista>.<i>.<mezo>` (az `i` a sor aktuális pozíciója – a validátor indexenként olvas). A
 * `RendezvenySorok` mintájára: hozzáadás után a fókusz az új sor első mezőjére, törlés után a
 * hozzáadás-gombra kerül; mozgatás után a mozgatott sor gombjára (a DOM-áthelyezés elvenné a fókuszt).
 * Törlés és mozgatás a következő beküldésig elrejti a pozícióhoz kötött sorhibákat (más sorra mutatnának).
 * A korlátnál a hozzáadás-gomb letiltva, mellette szöveges magyarázattal.
 */
export function SorSzerkeszto<L extends SorLista>({
  lista, value, onChange, errors,
}: {
  lista: L;
  value: SorAllapot<SorTipusok[L]>[];
  onChange: (v: SorAllapot<SorTipusok[L]>[]) => void;
  errors: MezoHibak;
}) {
  const hozzaadGomb = useRef<HTMLButtonElement>(null);
  // Két beküldés között az `errors` ugyanaz az objektum: amíg az, a törlés/mozgatás előtti hibák rejtve maradnak.
  const [elavultHibak, setElavultHibak] = useState<MezoHibak | null>(null);
  const hibak = elavultHibak === errors ? {} : errors;
  const mezok = Object.entries(SOR_MEZOK[lista]) as [keyof SorTipusok[L] & string, SorMezoSzabaly][];
  const egyseg = SOR_EGYSEG[lista];
  const max = SOR_MAX[lista];
  const mezoId = (i: number, kulcs: string) => `${lista}.${i}.${kulcs}`;
  const set = (id: number, kulcs: keyof SorTipusok[L], v: string) =>
    onChange(value.map((s) => (s._id === id ? { ...s, [kulcs]: v } : s)));

  const ujSor = () => {
    // A `SOR_MEZOK` a sortípus minden mezőjét felsorolja, ezért az üres sor teljes.
    const ures = Object.fromEntries(mezok.map(([kulcs]) => [kulcs, ''])) as unknown as SorTipusok[L];
    flushSync(() => onChange([...value, { ...ures, _id: Math.max(0, ...value.map((s) => s._id)) + 1 }]));
    document.getElementById(mezoId(value.length, mezok[0][0]))?.focus();
  };
  const torol = (id: number) => {
    flushSync(() => {
      setElavultHibak(errors);
      onChange(value.filter((s) => s._id !== id));
    });
    hozzaadGomb.current?.focus();
  };
  const mozgat = (i: number, irany: -1 | 1) => {
    const j = i + irany;
    flushSync(() => {
      setElavultHibak(errors);
      const uj = [...value];
      [uj[i], uj[j]] = [uj[j], uj[i]];
      onChange(uj);
    });
    const ugyanaz = document.getElementById(mezoId(j, irany < 0 ? 'fel' : 'le')) as HTMLButtonElement | null;
    (ugyanaz && !ugyanaz.disabled ? ugyanaz : document.getElementById(mezoId(j, irany < 0 ? 'le' : 'fel')))?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      {value.map((s, i) => (
        <fieldset key={s._id} className="flex flex-col gap-3 rounded-lg border border-input p-3">
          <legend className="px-1 text-xs text-muted-foreground">
            {i + 1}. {egyseg}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {mezok.map(([kulcs, sz]) => (
              <KartyaMezo
                key={kulcs}
                id={mezoId(i, kulcs)}
                cimke={sz.cimke}
                value={String(s[kulcs])}
                onChange={(v) => set(s._id, kulcs, v)}
                max={sz.max}
                errors={hibak}
                opcionalis={!sz.kotelezo}
                tobbsoros={sz.tobbsoros}
                sugo={sz.formazott ? SZOVEG_SUGO : undefined}
                placeholder={sz.url ? 'https://…' : undefined}
                inputMode={sz.url ? 'url' : undefined}
                className={sz.tobbsoros ? 'sm:col-span-2' : undefined}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button id={mezoId(i, 'fel')} type="button" variant="outline" size="icon-sm" disabled={i === 0}
              aria-label={`${i + 1}. ${egyseg} feljebb`} onClick={() => mozgat(i, -1)}>
              <ArrowUpIcon aria-hidden />
            </Button>
            <Button id={mezoId(i, 'le')} type="button" variant="outline" size="icon-sm" disabled={i === value.length - 1}
              aria-label={`${i + 1}. ${egyseg} lejjebb`} onClick={() => mozgat(i, 1)}>
              <ArrowDownIcon aria-hidden />
            </Button>
            <Button type="button" variant="outline" size="sm" aria-label={`${i + 1}. ${egyseg} törlése`} onClick={() => torol(s._id)}>
              Törlés
            </Button>
          </div>
        </fieldset>
      ))}
      <div className="flex items-center gap-2">
        <Button ref={hozzaadGomb} type="button" variant="outline" size="sm" disabled={value.length >= max} onClick={ujSor}>
          + Új {egyseg}
        </Button>
        {value.length >= max && (
          <span className="text-xs text-muted-foreground">
            Legfeljebb {max} {egyseg}.
          </span>
        )}
      </div>
    </div>
  );
}
