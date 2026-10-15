'use client';

import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty,
  ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor,
} from '../ui/combobox';
import { Input } from '../ui/input';
import { useState } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { CimkeSor } from './CimkeSor';
import { hibaAttr, leiroAttr, MezoHiba } from './MezoHiba';

/**
 * Többes választás fix listából (Combobox chips) + opcionális „egyéb" szabadszöveg. A
 * kiválasztott értékek egyenként rejtett inputban mennek (`name` többször) → a validátor
 * `fd.getAll(name)`-mel olvassa. A beviteli mező id-ja = `id` (ide fókuszál a hook).
 *
 * A `name`-et szándékosan NEM kapja meg maga a `<Combobox>` – a Base UI akkor saját rejtett
 * inputokat is renderelne, és az értékek duplán mennének be a submitba.
 */
export function CimkeValaszto<T extends string>({
  id, name, cimke, magyarazat, pelda, items, value, onChange, errors, egyeb,
}: {
  id: string; name: string; cimke: string; magyarazat?: string; pelda?: string;
  items: readonly T[]; value: T[]; onChange: (v: T[]) => void; errors: MezoHibak;
  /** „Egyéb" mező: id/name + vezérelt érték; a `magyarazat`/`pelda` a kérdőjeles felugrót adja. */
  egyeb?: {
    id: string; name: string; cimke: string; magyarazat?: string; pelda?: string;
    value: string; onChange: (v: string) => void; max: number;
  };
}) {
  const anchor = useComboboxAnchor();
  const [nyitva, setNyitva] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <CimkeSor id={`${id}-label`} htmlFor={id} cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
      {value.map((v) => <input key={v} type="hidden" name={name} value={v} />)}
      <Combobox multiple items={items} value={value} onValueChange={(v) => onChange(v as T[])} onOpenChange={setNyitva}>
        <ComboboxChips ref={anchor} id={`${id}-doboz`} tabIndex={-1} className="cursor-text">
          <ComboboxValue>
            {(kivalasztott: T[]) => (
              <>
                {kivalasztott.map((k) => (
                  <ComboboxChip key={k} aria-label={k} aria-description="Backspace vagy Delete az eltávolításhoz" removeLabel={`${k} eltávolítása`}>
                    {k}
                  </ComboboxChip>
                ))}
                <ComboboxChipsInput
                  id={id}
                  placeholder={kivalasztott.length === 0 ? 'Válassz a listából…' : ''}
                  aria-labelledby={`${id}-label`}
                  {...leiroAttr(errors, id)}
                  onKeyDown={(e) => { if (e.key === 'Escape' && !nyitva) e.preventBaseUIHandler(); }}
                />
              </>
            )}
          </ComboboxValue>
        </ComboboxChips>
        <ComboboxContent anchor={anchor}>
          <ComboboxEmpty>Nincs ilyen elem.</ComboboxEmpty>
          <ComboboxList>{(k: T) => <ComboboxItem key={k} value={k}>{k}</ComboboxItem>}</ComboboxList>
        </ComboboxContent>
      </Combobox>
      <MezoHiba mezo={id} errors={errors} />
      {egyeb && (
        <div className="flex flex-col gap-1.5">
          <CimkeSor htmlFor={egyeb.id} cimke={egyeb.cimke} magyarazat={egyeb.magyarazat} pelda={egyeb.pelda}
            labelClassName="text-xs text-muted-foreground" />
          <Input id={egyeb.id} name={egyeb.name} maxLength={egyeb.max} autoComplete="off" value={egyeb.value}
            onChange={(e) => egyeb.onChange(e.target.value)} {...hibaAttr(errors, egyeb.id)} />
          <MezoHiba mezo={egyeb.id} errors={errors} />
        </div>
      )}
    </div>
  );
}
