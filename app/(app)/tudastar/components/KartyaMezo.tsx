'use client';

import { Mezo } from '../../../../components/form/Mezo';
import { leiroAttr } from '../../../../components/form/MezoHiba';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { MezoHibak } from '../../../../lib/urlap';

/**
 * A szerkesztő egy szöveges mezője (vezérelt): címke, opcionális látható súgósor, egy- vagy többsoros
 * vezérlő, hibasor. Az `id` = a `name` = a hiba kulcsa (egy űrlap van az oldalon). `szamlalo`: „n/max” a mező alatt
 * (az `aria-describedby` része, a felolvasó fókuszáláskor bemondja).
 */
export function KartyaMezo({
  id, cimke, value, onChange, max, errors, opcionalis, tobbsoros, sorok = 4, sugo, szamlalo, placeholder, inputMode, className,
}: {
  id: string;
  cimke: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  errors: MezoHibak;
  opcionalis?: boolean;
  tobbsoros?: boolean;
  sorok?: number;
  sugo?: string;
  szamlalo?: boolean;
  placeholder?: string;
  inputMode?: 'url' | 'email' | 'tel';
  className?: string;
}) {
  const szamlaloId = `${id}-szamlalo`;
  const { 'aria-describedby': leirok, ...attr } = leiroAttr(errors, id, Boolean(sugo));
  const describedby = [leirok, szamlalo && szamlaloId].filter(Boolean).join(' ') || undefined;
  return (
    <Mezo id={id} cimke={cimke} opcionalis={opcionalis} sugo={sugo} errors={errors} className={className}>
      {tobbsoros ? (
        <Textarea id={id} name={id} rows={sorok} maxLength={max} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} {...attr} aria-describedby={describedby} />
      ) : (
        <Input id={id} name={id} maxLength={max} autoComplete="off" inputMode={inputMode} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} {...attr} aria-describedby={describedby} />
      )}
      {szamlalo && (
        <p id={szamlaloId} className="text-right text-xs text-muted-foreground tabular-nums">
          {value.length}/{max}
          <span className="sr-only"> karakter</span>
        </p>
      )}
    </Mezo>
  );
}
