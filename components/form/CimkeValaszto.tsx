'use client';

import {
  Combobox, ComboboxChip, ComboboxChips, ComboboxChipsInput, ComboboxContent, ComboboxEmpty,
  ComboboxItem, ComboboxList, ComboboxValue, useComboboxAnchor,
} from '../ui/combobox';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import type { MezoHibak } from '../../lib/urlap';
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
  id, name, cimke, sugo, items, value, onChange, errors, egyeb,
}: {
  id: string; name: string; cimke: string; sugo?: string; items: readonly T[];
  value: T[]; onChange: (v: T[]) => void; errors: MezoHibak;
  /** „Egyéb" mező: id/name + vezérelt érték. */
  egyeb?: { id: string; name: string; cimke: string; value: string; onChange: (v: string) => void; max: number };
}) {
  const anchor = useComboboxAnchor();
  const [nyitva, setNyitva] = useState(false);
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>{cimke}</Label>
      {sugo && <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p>}
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
                  {...leiroAttr(errors, id, Boolean(sugo))}
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
          <Label htmlFor={egyeb.id} className="text-xs text-muted-foreground">{egyeb.cimke}</Label>
          <Input id={egyeb.id} name={egyeb.name} maxLength={egyeb.max} autoComplete="off" value={egyeb.value}
            onChange={(e) => egyeb.onChange(e.target.value)} {...hibaAttr(errors, egyeb.id)} />
          <MezoHiba mezo={egyeb.id} errors={errors} />
        </div>
      )}
    </div>
  );
}
