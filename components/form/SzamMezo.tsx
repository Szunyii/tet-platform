'use client';

import { Input } from '../ui/input';
import type { MezoHibak } from '../../lib/urlap';
import { hibaAttr } from './MezoHiba';
import { Mezo } from './Mezo';

export function SzamMezo({
  id, name, cimke, sugo, value, onChange, errors, utotag, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  errors: MezoHibak; utotag?: string; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <div className="flex items-center gap-2">
        <Input id={id} name={name} inputMode="decimal" maxLength={20} autoComplete="off" placeholder={placeholder}
          value={value} onChange={(e) => onChange(e.target.value)} className="max-w-48" {...hibaAttr(errors, id)} />
        {utotag && <span className="text-sm text-muted-foreground">{utotag}</span>}
      </div>
    </Mezo>
  );
}
