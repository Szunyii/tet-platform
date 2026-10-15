'use client';

import type { ReactNode } from 'react';
import type { MezoHibak } from '../../lib/urlap';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { hibaAttr, MezoHiba } from './MezoHiba';

export interface SelectOpcio {
  ertek: string;
  cimke: string;
}

/**
 * Címkés legördülő (Base UI Select) a megadott sorrendű opciókkal. A trigger `role=combobox` gomb, amire a
 * `<label for>` nem minden AT-nél számít névnek, ezért `aria-labelledby`: a címke id-ja + a sajátja (a név
 * így „címke + aktuális érték”). `name` megadásával a Base UI rejtett inputot renderel, így az érték a
 * FormData-ban is megjelenik. Üres `value` = nincs kiválasztva (a `placeholder` látszik). A hiba kulcsa az
 * `id`; `errors` nélkül nincs hibasor. A `children` a hibasor alá kerül (pl. megjegyzés).
 */
export function CimkesSelect({
  id, cimke, value, onChange, opciok, name, placeholder, required, errors, className, children,
}: {
  id: string;
  cimke: string;
  value: string;
  onChange: (v: string) => void;
  opciok: readonly SelectOpcio[];
  name?: string;
  placeholder?: string;
  required?: boolean;
  errors?: MezoHibak;
  /** A trigger osztályai (pl. szélesség). */
  className?: string;
  children?: ReactNode;
}) {
  const items = Object.fromEntries(opciok.map((o) => [o.ertek, o.cimke]));
  return (
    <div className="flex flex-col gap-1.5">
      <Label id={`${id}-label`} htmlFor={id}>
        {cimke}
      </Label>
      <Select name={name} value={value === '' ? null : value} onValueChange={(v) => onChange(v ?? '')} items={items} required={required}>
        <SelectTrigger id={id} aria-labelledby={`${id}-label ${id}`} {...(errors ? hibaAttr(errors, id) : {})} className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {opciok.map((o) => (
            <SelectItem key={o.ertek} value={o.ertek}>
              {o.cimke}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {errors && <MezoHiba mezo={id} errors={errors} />}
      {children}
    </div>
  );
}
