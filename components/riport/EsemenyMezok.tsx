'use client';

import { Input } from '../ui/input';
import { Mezo } from '../form/Mezo';
import { hibaAttr } from '../form/MezoHiba';
import { HELYSZIN_MAX, RIPORT_MEZO_CIMKEK } from '../../lib/riport-szotar';
import type { MezoHibak } from '../../lib/urlap';

const C = RIPORT_MEZO_CIMKEK;

export function EsemenyMezok({
  datum,
  helyszin,
  onDatum,
  onHelyszin,
  errors,
}: {
  datum: string;
  helyszin: string;
  onDatum: (v: string) => void;
  onHelyszin: (v: string) => void;
  errors: MezoHibak;
}) {
  return (
    <fieldset className="grid gap-3 rounded-xl border border-border bg-muted/30 p-3 animate-in fade-in-0 sm:grid-cols-2">
      <legend className="px-1 text-xs font-medium text-muted-foreground">{C.esemeny}</legend>
      <Mezo id="esemenyDatum" cimke={C.esemenyDatum} errors={errors}>
        <Input
          id="esemenyDatum"
          name="esemenyDatum"
          type="date"
          required
          value={datum}
          onChange={(e) => onDatum(e.target.value)}
          {...hibaAttr(errors, 'esemenyDatum')}
        />
      </Mezo>
      <Mezo id="esemenyHelyszin" cimke={C.esemenyHelyszin} errors={errors}>
        <Input
          id="esemenyHelyszin"
          name="esemenyHelyszin"
          required
          maxLength={HELYSZIN_MAX}
          autoComplete="off"
          placeholder="pl. Szöul, COEX"
          value={helyszin}
          onChange={(e) => onHelyszin(e.target.value)}
          {...hibaAttr(errors, 'esemenyHelyszin')}
        />
      </Mezo>
    </fieldset>
  );
}
