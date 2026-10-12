'use client';

import { CimkeSor } from '../../../../components/form/CimkeSor';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { MezoHibak } from '../../../../lib/urlap';
import {
  REND_MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK, ROVID_MAX, rendezvenyTipus, type Rendezveny,
} from '../../../../lib/orszagprofil-szotar';

const URES: Rendezveny = { nev: '', tipus: RENDEZVENY_TIPUSOK[0].kulcs, idopont: '', megjegyzes: '' };
const R = REND_MEZO_CIMKEK;

/**
 * Hozzáadható/törölhető rendezvény-sorok; mezőnevek `rendezveny.<i>.<mezo>`, id-k
 * `rendezvenyek.rendezveny.<i>.<mezo>`. Törléskor a sorok indexe eltolódik és a mezőnevek
 * újraszámozódnak – a validátor indexenként olvas, ez rendben van. A mezők kérdőjeles
 * magyarázata a `REND_MEZO_CIMKEK`-ből jön.
 */
export function RendezvenySorok({
  value, onChange, errors,
}: { value: Rendezveny[]; onChange: (v: Rendezveny[]) => void; errors: MezoHibak }) {
  const set = (i: number, patch: Partial<Rendezveny>) => onChange(value.map((r, j) => (j === i ? { ...r, ...patch } : r)));
  const id = (i: number, m: keyof Rendezveny) => `rendezvenyek.rendezveny.${i}.${m}`;
  return (
    <div className="flex flex-col gap-4">
      {value.map((r, i) => (
        <fieldset key={i} className="grid gap-3 rounded-md border border-border p-3 sm:grid-cols-2">
          <legend className="px-1 text-xs text-muted-foreground">{i + 1}. rendezvény</legend>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'nev')} {...R.nev} />
            <Input id={id(i, 'nev')} name={`rendezveny.${i}.nev`} maxLength={ROVID_MAX} autoComplete="off" value={r.nev}
              onChange={(e) => set(i, { nev: e.target.value })} {...hibaAttr(errors, id(i, 'nev'))} />
            <MezoHiba mezo={id(i, 'nev')} errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'tipus')} {...R.tipus} />
            <NativeSelect id={id(i, 'tipus')} name={`rendezveny.${i}.tipus`} value={r.tipus}
              onChange={(e) => set(i, { tipus: rendezvenyTipus(e.target.value) })}>
              {RENDEZVENY_TIPUSOK.map((t) => <option key={t.kulcs} value={t.kulcs}>{t.cimke}</option>)}
            </NativeSelect>
          </div>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'idopont')} {...R.idopont} />
            <Input id={id(i, 'idopont')} name={`rendezveny.${i}.idopont`} maxLength={ROVID_MAX} autoComplete="off"
              value={r.idopont}
              onChange={(e) => set(i, { idopont: e.target.value })} {...hibaAttr(errors, id(i, 'idopont'))} />
            <MezoHiba mezo={id(i, 'idopont')} errors={errors} />
          </div>
          <div className="flex flex-col gap-1.5">
            <CimkeSor htmlFor={id(i, 'megjegyzes')} {...R.megjegyzes} />
            <Input id={id(i, 'megjegyzes')} name={`rendezveny.${i}.megjegyzes`} maxLength={ROVID_MAX} autoComplete="off" value={r.megjegyzes}
              onChange={(e) => set(i, { megjegyzes: e.target.value })} {...hibaAttr(errors, id(i, 'megjegyzes'))} />
            <MezoHiba mezo={id(i, 'megjegyzes')} errors={errors} />
          </div>
          <div className="sm:col-span-2">
            <Button type="button" variant="outline" size="sm" aria-label={`${i + 1}. rendezvény törlése`}
              onClick={() => onChange(value.filter((_, j) => j !== i))}>
              Sor törlése
            </Button>
          </div>
        </fieldset>
      ))}
      <div>
        <Button type="button" variant="outline" size="sm" disabled={value.length >= RENDEZVENY_MAX} onClick={() => onChange([...value, URES])}>
          Rendezvény hozzáadása
        </Button>
        {value.length >= RENDEZVENY_MAX && <span className="ml-2 text-xs text-muted-foreground">Legfeljebb {RENDEZVENY_MAX} rendezvény.</span>}
      </div>
    </div>
  );
}
