'use client';

import { unstable_rethrow } from 'next/navigation';
import { useOptimistic, useTransition } from 'react';

export type ValasztEvAction = (formData: FormData) => Promise<void>;

/**
 * A fejléc ciklusválasztója. Évváltás: server action írja a cookie-t és revalidálja a layoutot. A
 * kiválasztás a teljes kör-út alatt (action + revalidálás) késne, ezért useOptimistic-kal a select
 * azonnal az új évet mutatja; a szerver válasza (a layout újrarenderelése) felülírja az `ev` propot,
 * az optimista érték pedig ezzel automatikusan visszaáll rendes állapotba. Az állapot itt él, nem az
 * AppShellben: az évváltás közbeni renderek nem érintik a shell többi részét.
 */
export function CiklusValaszto({ ev, evek, action }: { ev: number; evek: readonly number[]; action: ValasztEvAction }) {
  const [optimistaEv, setOptimistaEv] = useOptimistic(ev);
  const [fut, startValtas] = useTransition();
  const valaszt = (uj: string) => {
    const fd = new FormData();
    fd.set('ev', uj);
    startValtas(async () => {
      setOptimistaEv(Number(uj));
      // Hálózati/origin hiba esetén az évváltás egyszerűen nem történik meg; nem dobjuk az error boundary-ig.
      try {
        await action(fd);
      } catch (err) {
        unstable_rethrow(err);
        console.error('[ciklus] évváltás sikertelen:', err);
      }
    });
  };
  return (
    <label className="flex items-center gap-[7px] text-[11.5px] text-[#6b7684]">
      Ciklus
      <select className="input" value={optimistaEv} aria-busy={fut} onChange={(e) => valaszt(e.target.value)}>
        {evek.map((y) => (
          <option key={y} value={y}>
            {y}
          </option>
        ))}
      </select>
    </label>
  );
}
