'use client';

import type { ReactNode } from 'react';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { cn } from '../../lib/utils';
import type { MezoHibak } from '../../lib/urlap';
import { CimkeSor } from './CimkeSor';
import { leiroAttr, MezoHiba } from './MezoHiba';

/**
 * Címke (+ opcionális kérdőjeles magyarázat) + opcionális látható súgósor + mező + hibaüzenet; a
 * hiba kulcsa a mező id-ja. Konvenció az országprofil-űrlapokon: az `id` = `<blokk>.<mezo>`
 * (egyedi a több blokkos oldalon, erre fókuszál a useMuveletForm), a `name` = a puszta mezőnév
 * (ezt olvassa a validátor). Az országprofil `magyarazat`/`pelda` propot használ; a `sugo`
 * (mindig látható sor) a többi űrlapé.
 */
export function Mezo({
  id, cimke, sugo, magyarazat, pelda, errors, children, className,
}: {
  id: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string; errors: MezoHibak;
  children: ReactNode; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <CimkeSor id={`${id}-label`} htmlFor={id} cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
      {sugo && <p id={`${id}-sugo`} className="text-xs text-muted-foreground">{sugo}</p>}
      {children}
      <MezoHiba mezo={id} errors={errors} />
    </div>
  );
}

/** Többsoros szövegmező (vezérelt). */
export function SzovegMezo({
  id, name, cimke, sugo, magyarazat, pelda, value, onChange, max, errors, sorok = 4, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string;
  value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; sorok?: number; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} magyarazat={magyarazat} pelda={pelda} errors={errors}>
      <Textarea id={id} name={name} rows={sorok} maxLength={max} placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} {...leiroAttr(errors, id, Boolean(sugo))} />
    </Mezo>
  );
}

/** Egysoros szövegmező (vezérelt). */
export function RovidMezo({
  id, name, cimke, sugo, magyarazat, pelda, value, onChange, max, errors, placeholder,
}: {
  id: string; name: string; cimke: string; sugo?: string; magyarazat?: string; pelda?: string;
  value: string; onChange: (v: string) => void;
  max: number; errors: MezoHibak; placeholder?: string;
}) {
  return (
    <Mezo id={id} cimke={cimke} sugo={sugo} magyarazat={magyarazat} pelda={pelda} errors={errors}>
      <Input id={id} name={name} maxLength={max} autoComplete="off" placeholder={placeholder} value={value}
        onChange={(e) => onChange(e.target.value)} {...leiroAttr(errors, id, Boolean(sugo))} />
    </Mezo>
  );
}
