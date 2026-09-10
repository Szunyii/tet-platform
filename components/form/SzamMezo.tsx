'use client';

import { Input } from '../ui/input';
import type { MezoHibak } from '../../lib/urlap';
import { leiroAttr } from './MezoHiba';
import { Mezo } from './Mezo';

export function SzamMezo({
  id, name, cimke, sugo, value, onChange, errors, utotag, placeholder, maxHossz = 20,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  errors: MezoHibak; utotag?: string; placeholder?: string;
  /** A nyers szöveg hossza (a domain adja, pl. `SZAM_MAX_HOSSZ`). */
  maxHossz?: number;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <div className="flex items-center gap-2">
        <Input id={id} name={name} inputMode="decimal" maxLength={maxHossz} autoComplete="off" placeholder={placeholder}
          value={value} onChange={(e) => onChange(e.target.value)} className="max-w-48" {...leiroAttr(errors, id, Boolean(sugo))} />
        {utotag && <span className="text-sm text-muted-foreground">{utotag}</span>}
      </div>
    </Mezo>
  );
}
