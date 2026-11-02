'use client';

import { useRouter } from 'next/navigation';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Label } from '../../../../components/ui/label';
import { tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK } from '../../../../lib/tudastar-szotar';

/**
 * Keskenyebb ablakban (`xl` alatt) a jobb oldali menü helyett: kategória-választó, váltáskor a kategória-oldalra
 * navigál. Nem vezérelt; a `key` miatt útvonal-váltás után az új kategóriával indul.
 */
export function KategoriaValto({ aktiv }: { aktiv: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-1.5 xl:hidden">
      <Label htmlFor="tudastar-kategoria">Kategória</Label>
      <NativeSelect
        key={aktiv}
        id="tudastar-kategoria"
        defaultValue={aktiv}
        onChange={(e) => router.push(tudastarUrl(e.target.value))}
      >
        {TUDASTAR_KATEGORIAK.map((k) => (
          <option key={k.slug} value={k.slug}>
            {k.szam}. {k.rovidCim}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
