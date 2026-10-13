'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { deleteRiport, getRiport, setIntezkedes, updateRiport } from '../../../db/queries/riport';
import { fajlokCsatolmannya } from '../../../lib/riport-fajl';
import { canEditRiport, canIntezkedni } from '../../../lib/riport-jog';
import { parseIntezkedes, parseRiportForm } from '../../../lib/riport-validacio';
import { requireSession } from '../../../lib/session';
import type { MuveletState } from '../../../components/form/useMuveletForm';

export type RiportFormState = MuveletState;

const NINCS_JOG = 'Nincs jogosultságod ehhez a bejegyzéshez.';

export async function updateRiportAction(
  id: string,
  _prev: RiportFormState,
  formData: FormData,
): Promise<RiportFormState> {
  const session = await requireSession();
  const meglevo = getRiport(id);
  if (!meglevo || !canEditRiport(session, meglevo)) return { errors: { form: NINCS_JOG } };
  // A validátor csak létező id-t ad vissza (a ténylegesen meglévő csatolmány-id-khoz szűr).
  const parsed = parseRiportForm(
    formData,
    meglevo.csatolmanyok.map((c) => c.id),
  );
  if (!parsed.ok) return { errors: parsed.errors };

  try {
    const ujak = await fajlokCsatolmannya(parsed.fajlok);
    updateRiport(id, parsed.data, ujak, parsed.torlendoCsatolmanyIdk);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] updateRiport sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/jelentesek');
  revalidatePath(`/jelentesek/${id}`);
  revalidatePath(`/jelentesek/${id}/szerkesztes`);
  redirect(`/jelentesek/${id}`);
}

export async function deleteRiportAction(id: string): Promise<RiportFormState> {
  const session = await requireSession();
  const meglevo = getRiport(id);
  if (!meglevo || !canEditRiport(session, meglevo)) return { errors: { form: NINCS_JOG } };
  try {
    deleteRiport(id);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] deleteRiport sikertelen:', err);
    return { errors: { form: 'Törlés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/jelentesek');
  revalidatePath(`/jelentesek/${id}`);
  redirect('/jelentesek');
}

/**
 * A központ „Megtett intézkedése” egy bejegyzéshez. Nem irányít át: a hívó dialógus a
 * `{ ok: true }`-ra zár. A jog hiánya form-szintű hiba (nem 404), mint a többi actionnél.
 */
export async function mentIntezkedesAction(
  id: string,
  _prev: RiportFormState,
  formData: FormData,
): Promise<RiportFormState> {
  const session = await requireSession();
  if (!canIntezkedni(session)) return { errors: { form: NINCS_JOG } };
  const parsed = parseIntezkedes(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  try {
    if (!setIntezkedes(id, parsed.szoveg, session.name)) {
      return { errors: { form: 'A bejegyzés már nem létezik.' } };
    }
  } catch (err) {
    unstable_rethrow(err);
    console.error('[riport] setIntezkedes sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/jelentesek');
  revalidatePath(`/jelentesek/${id}`);
  return { ok: true };
}
