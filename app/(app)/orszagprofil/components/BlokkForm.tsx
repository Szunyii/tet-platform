'use client';

import type { ReactNode } from 'react';
import { MezoHiba } from '../../../../components/form/MezoHiba';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../../../components/ui/card';
import type { MezoHibak } from '../../../../lib/urlap';
import { blokkCim, type BlokkKulcs } from '../../../../lib/orszagprofil-szotar';

export interface BlokkFormProps {
  kod: string;
  ev: number;
  blokk: BlokkKulcs;
  /** „Mentve: 2026. 09. 10. 14:02" vagy null, ha még nincs mentve. */
  mentve: string | null;
  action: FormAction;
  /** A mezők; a render-prop az aktuális hibatérképet kapja. */
  children: (errors: MezoHibak) => ReactNode;
}

/**
 * Egy blokk közös kártya-váza: fejléc (cím, mentés ideje), `<form action>` a
 * `useMuveletForm`-mal, rejtett kod/ev/blokk, űrlap-szintű hiba (ide jön a jogosultsági
 * hiba is), Mentés gomb. A mezők vezéreltek: a React 19 sikeres action után az
 * uncontrolled mezőket alaphelyzetbe állítaná.
 */
export function BlokkForm({ kod, ev, blokk, mentve, action, children }: BlokkFormProps) {
  const [state, formAction, pending] = useMuveletForm(action, 'Blokk mentve');
  const errors = state.errors ?? {};
  return (
    <Card>
      <form action={formAction} className="contents">
        <input type="hidden" name="kod" value={kod} />
        <input type="hidden" name="ev" value={ev} />
        <input type="hidden" name="blokk" value={blokk} />
        <CardHeader>
          <CardTitle>{blokkCim(blokk)}</CardTitle>
          <CardDescription>{mentve ? `Mentve: ${mentve}` : 'Még nincs kitöltve'}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">{children(errors)}</CardContent>
        <CardFooter className="flex items-center gap-3">
          <Button type="submit" disabled={pending}>{pending ? 'Mentés…' : 'Mentés'}</Button>
          <MezoHiba mezo="form" errors={errors} alert />
        </CardFooter>
      </form>
    </Card>
  );
}

/**
 * A mező id-ja `<blokk>.<mezo>`: egyedi a 8 blokkos DOM-ban, erre fókuszál a
 * `useMuveletForm`, és a mentés action ilyen kulccsal adja vissza a hibát. A `name` a
 * puszta mezőnév marad (azt olvassa a validátor).
 */
export function mezoId(blokk: BlokkKulcs, name: string): string {
  return `${blokk}.${name}`;
}

/** Szám → űrlap-string (tizedesvesszővel); null → ''. */
export function szamStr(n: number | null): string {
  return n === null ? '' : String(n).replace('.', ',');
}
