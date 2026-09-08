'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { createRiport } from '../../../db/queries/riport';
import { fajlokCsatolmannya } from '../../../lib/riport-fajl';
import { parseRiportForm } from '../../../lib/riport-validacio';
import { requireSession } from '../../../lib/session';
import type { MuveletState } from '../../../components/form/useMuveletForm';

export type RiportFormState = MuveletState;

const NINCS_ORSZAG = 'A fiókodhoz nincs ország rendelve, ezért nem adhatsz be bejegyzést. Kérd az admint.';

export async function createRiportAction(_prev: RiportFormState, formData: FormData): Promise<RiportFormState> {
  const session = await requireSession();
  if (!session.orszag) return { errors: { form: NINCS_ORSZAG } };
  const parsed = parseRiportForm(formData);
  if (!parsed.ok) return { errors: parsed.errors };

  let id: string;
  try {
    const csatolmanyok = await fajlokCsatolmannya(parsed.fajlok);
    id = createRiport({ ...parsed.data, szerzoId: session.userId, orszag: session.orszag }, csatolmanyok);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] createRiport sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/riportok');
  redirect(`/riportok/${id}`);
}
