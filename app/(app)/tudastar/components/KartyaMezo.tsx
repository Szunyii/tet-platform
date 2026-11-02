'use client';

import type { ReactNode } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { leiroAttr } from '../../../../components/form/MezoHiba';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { MezoHibak } from '../../../../lib/urlap';

/** A szöveges mezők súgója: a megjelenítés két szabálya (lib/tudastar-szoveg.ts). */
export const SZOVEG_SUGO = 'Üres sor: új bekezdés · „- ” kezdetű sor: felsorolás.';

/**
 * A szerkesztő egy szöveges mezője (vezérelt): címke, opcionális látható súgósor, egy- vagy többsoros
 * vezérlő, hibasor. Az `id` = a `name` = a hiba kulcsa (egy űrlap van az oldalon). `szamlalo`: „n/max”.
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
  const attr = leiroAttr(errors, id, Boolean(sugo));
  return (
    <Mezo id={id} cimke={cimke} opcionalis={opcionalis} sugo={sugo} errors={errors} className={className}>
      {tobbsoros ? (
        <Textarea id={id} name={id} rows={sorok} maxLength={max} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} {...attr} />
      ) : (
        <Input id={id} name={id} maxLength={max} autoComplete="off" inputMode={inputMode} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} {...attr} />
      )}
      {szamlalo && (
        <p className="text-right text-xs text-muted-foreground tabular-nums">
          {value.length}/{max}
        </p>
      )}
    </Mezo>
  );
}

/** A szerkesztő egy blokkja: kártya címmel, opcionális leírással. */
export function UrlapBlokk({ cim, leiras, children }: { cim: string; leiras?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          {cim}
        </CardTitle>
        {leiras && <CardDescription>{leiras}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
