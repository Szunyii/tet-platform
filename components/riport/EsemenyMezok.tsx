'use client';

import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { hibaAttr, MezoHiba } from '../form/MezoHiba';
import type { MezoHibak } from '../../lib/urlap';

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
      <legend className="px-1 text-xs font-medium text-muted-foreground">Rendezvény adatai</legend>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="esemenyDatum">Dátum</Label>
        <Input
          id="esemenyDatum"
          name="esemenyDatum"
          type="date"
          required
          value={datum}
          onChange={(e) => onDatum(e.target.value)}
          {...hibaAttr(errors, 'esemenyDatum')}
        />
        <MezoHiba mezo="esemenyDatum" errors={errors} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="esemenyHelyszin">Helyszín</Label>
        <Input
          id="esemenyHelyszin"
          name="esemenyHelyszin"
          required
          maxLength={200}
          autoComplete="off"
          placeholder="pl. Szöul, COEX"
          value={helyszin}
          onChange={(e) => onHelyszin(e.target.value)}
          {...hibaAttr(errors, 'esemenyHelyszin')}
        />
        <MezoHiba mezo="esemenyHelyszin" errors={errors} />
      </div>
    </fieldset>
  );
}
