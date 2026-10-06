'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { createRiport } from '../../../db/queries/riport';
import { fajlokCsatolmannya } from '../../../lib/riport-fajl';
import { parseRiportForm } from '../../../lib/riport-validacio';
import { requireSession } from '../../../lib/session';
import { mezo } from '../../../lib/urlap';
import type { MuveletState } from '../../../components/form/useMuveletForm';

export type RiportFormState = MuveletState;

const NINCS_ORSZAG = 'A fiókodhoz nincs ország rendelve, ezért nem adhatsz be bejegyzést.';

export async function createRiportAction(_prev: RiportFormState, formData: FormData): Promise<RiportFormState> {
  const session = await requireSession();
  if (session.orszagok.length === 0) return { errors: { form: NINCS_ORSZAG } };
  // Egy országnál nincs választó: az az ország. Többnél a beküldött értéknek a saját országok közt kell lennie.
  const orszag = session.orszagok.length === 1 ? session.orszagok[0].kod : mezo(formData, 'orszag');
  const orszagHiba = session.orszagok.some((o) => o.kod === orszag) ? null : 'Válassz a saját országaid közül.';
  const parsed = parseRiportForm(formData);
  if (!parsed.ok || orszagHiba) {
    return { errors: { ...(parsed.ok ? {} : parsed.errors), ...(orszagHiba ? { orszag: orszagHiba } : {}) } };
  }

  let id: string;
  try {
    const csatolmanyok = await fajlokCsatolmannya(parsed.fajlok);
    id = createRiport({ ...parsed.data, szerzoId: session.userId, orszag }, csatolmanyok);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] createRiport sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/riportok');
  redirect(`/riportok/${id}`);
}
