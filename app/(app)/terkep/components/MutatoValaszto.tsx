'use client';

import { Label } from '../../../../components/ui/label';
import {
  Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue,
} from '../../../../components/ui/select';
import { KATEGORIA_MUTATOK, MUTATOK, SZAM_MUTATOK, type Mutato } from '../../../../lib/terkep-mutatok';

const MUTATO_ITEMS: Record<string, string> = Object.fromEntries(MUTATOK.map((m) => [m.kulcs, m.cimke]));

/** A térkép színezésének mutatója, két csoportban (Kategória, Számszerű); ismeretlen kulcsot a hívó (mutatoByKulcs) kezel. */
export function MutatoValaszto({ mutato, onChange }: { mutato: Mutato; onChange: (kulcs: string) => void }) {
  return (
    <div className="flex items-center gap-2">
      <Label id="mutato-label" htmlFor="mutato">Mutató</Label>
      <Select value={mutato.kulcs} onValueChange={(v) => onChange(v ?? '')} items={MUTATO_ITEMS}>
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
  );
}
