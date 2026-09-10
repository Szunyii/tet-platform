'use client';

import type { ReactNode } from 'react';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import type { MezoHibak } from '../../lib/urlap';
import { hibaAttr, MezoHiba } from './MezoHiba';

/**
 * Címke + opcionális súgó + mező + hibaüzenet; a hiba kulcsa a mező id-ja. Konvenció az
 * országprofil-űrlapokon: az `id` = `<blokk>.<mezo>` (egyedi a több blokkos oldalon, erre
 * fókuszál a useMuveletForm), a `name` = a puszta mezőnév (ezt olvassa a validátor).
 */
export function Mezo({
  id, cimke, sugo, errors, children, className,
}: {
  id: string; cimke: string; sugo?: string; errors: MezoHibak; children: ReactNode; className?: string;
}) {
  return (
    <div className={className ?? 'flex flex-col gap-1.5'}>
      <Label id={`${id}-label`} htmlFor={id}>{cimke}</Label>
      {sugo && <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p>}
      {children}
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}

/** Többsoros szövegmező (vezérelt). */
export function SzovegMezo({
  id, name, cimke, sugo, value, onChange, max, errors, sorok = 4,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; sorok?: number;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <Textarea id={id} name={name} rows={sorok} maxLength={max} value={value}
        onChange={(e) => onChange(e.target.value)} {...hibaAttr(errors, id)} />
    </Mezo>
  );
}

/** Egysoros szövegmező (vezérelt). */
export function RovidMezo({
  id, name, cimke, sugo, value, onChange, max, errors, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} errors={errors}>
      <Input id={id} name={name} maxLength={max} autoComplete="off" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} {...hibaAttr(errors, id)} />
    </Mezo>
  );
}
