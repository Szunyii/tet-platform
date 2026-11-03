'use client';

import { useRouter } from 'next/navigation';
import type { FormEvent } from 'react';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK } from '../../../../lib/tudastar-szotar';

/**
 * Keskenyebb ablakban (`xl` alatt) a jobb oldali menü helyett: kategória-választó „Ugrás” gombbal, a beküldés
 * navigál a kategória-oldalra. A választás maga nem navigál (WCAG 3.2.2: billentyűzettel már a nyíl is elvinne).
 * `onSubmit`, nem `action`: a React a `<form action>` után `form.reset()`-et hívna. Nem vezérelt; a `key` miatt
 * útvonal-váltás után az új kategóriával indul.
 */
export function KategoriaValto({ aktiv }: { aktiv: string }) {
  const router = useRouter();
  function ugras(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const slug = new FormData(e.currentTarget).get('kategoria');
    if (typeof slug === 'string') router.push(tudastarUrl(slug));
  }
  return (
    <form onSubmit={ugras} className="flex flex-col gap-1.5 xl:hidden">
      <Label htmlFor="tudastar-kategoria">Kategória</Label>
      <div className="flex gap-2">
        <NativeSelect key={aktiv} id="tudastar-kategoria" name="kategoria" defaultValue={aktiv}>
          {TUDASTAR_KATEGORIAK.map((k) => (
            <option key={k.slug} value={k.slug}>
              {k.szam}. {k.rovidCim}
            </option>
          ))}
        </NativeSelect>
        <Button type="submit" variant="outline">
          Ugrás
        </Button>
      </div>
    </form>
  );
}
