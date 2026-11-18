'use client';

import { useRouter } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';
import { CimkesSelect, type SelectOpcio } from '../../../../components/form/CimkesSelect';
import { felevCimke, parseFelevSzam, type FelevSzam } from '../../../../lib/ertekeles-idoszak';
import { szuroUrl, type ErtekelesSzuro } from '../../../../lib/ertekeles-szuro';

/**
 * Az adatlap félévválasztója: az év a fejléc ciklusválasztójából jön, itt csak a félév váltható. A többi
 * szűrő (a visszalinkhez) változatlanul átmegy az új URL-be.
 */
export function FelevValaszto({
  attaseId,
  ev,
  felev,
  szuro,
}: {
  attaseId: string;
  ev: number;
  /** A megjelenített félév (`?felev=` nélkül az év alapértelmezett féléve). */
  felev: FelevSzam;
  /** A szerveren megtisztított szűrő. */
  szuro: ErtekelesSzuro;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [aktualis, setAktualis] = useOptimistic(felev);
  const opciok: SelectOpcio[] = ([1, 2] as const).map((f) => ({ ertek: String(f), cimke: felevCimke({ ev, felev: f }) }));

  function valaszt(v: string) {
    const szam = parseFelevSzam(v);
    if (szam === null) return;
    startTransition(() => {
      setAktualis(szam);
      router.replace(szuroUrl({ ...szuro, felev: szam }, `/monitoring/${encodeURIComponent(attaseId)}`), { scroll: false });
    });
  }

  return (
    <div aria-busy={pending} className="w-44 max-w-full">
      <CimkesSelect
        id="adatlap-felev"
        cimke="Félév"
        value={String(aktualis)}
        opciok={opciok}
        onChange={valaszt}
        className="w-full"
        errors={null}
      />
    </div>
  );
}
