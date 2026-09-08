'use client';

import { unstable_rethrow } from 'next/navigation';
import { useActionState, useEffect } from 'react';
import { toast } from 'sonner';
import type { MezoHibak } from '../../lib/urlap';

/** Server action visszatérési alakja: `ok` siker, `errors` mezőnév → üzenet (`form` = űrlap-szintű). */
export interface MuveletState {
  ok?: boolean;
  errors?: MezoHibak;
}

/** A hookkal használható server action alakja. */
export type FormAction = (prev: MuveletState, formData: FormData) => Promise<MuveletState>;

/**
 * useActionState + siker-toast + záró callback + hibakezelés egy helyen.
 * - A siker-kezelés az action wrapperben történik, nem useEffect-ben: pontosan egyszer fut,
 *   és nem függ az onKesz referencia-stabilitásától.
 * - A `siker` és az `onKesz` opcionális: ha az action sikernél átirányít (redirect), sosem
 *   tér vissza `{ ok: true }`-val, ilyenkor nincs mit toastolni és nincs mit lezárni.
 * - Ha az action hívása elutasítással tér vissza (hálózati hiba, újraindított szerver, elavult
 *   action id), nem dobjuk tovább – az az egész oldalt hibaképernyőre vinné –, hanem űrlap-
 *   szintű hibát adunk. A Next control-flow kivételeit (redirect/notFound) tovább kell dobni.
 * - Sikertelen beküldés után a fókusz az első hibás mezőre ugrik (a mező id-ja = a hiba
 *   kulcsa), így billentyűzettel és felolvasóval is észlelhető a hiba.
 * Visszaad: [state, formAction, pending].
 */
export function useMuveletForm(action: FormAction, siker?: string, onKesz?: () => void) {
  const result = useActionState<MuveletState, FormData>(
    async (prev, formData) => {
      try {
        const eredmeny = await action(prev, formData);
        if (eredmeny.ok) {
          if (siker) toast.success(siker);
          onKesz?.();
        }
        return eredmeny;
      } catch (err) {
        unstable_rethrow(err);
        return {
          errors: { form: 'A művelet nem futott le. Ellenőrizd a kapcsolatot, és próbáld újra.' },
        };
      }
    },
    {},
  );
  const [state] = result;

  useEffect(() => {
    const elso = state.errors && Object.keys(state.errors).find((k) => k !== 'form');
    if (elso) document.getElementById(elso)?.focus();
  }, [state]);

  return result;
}
