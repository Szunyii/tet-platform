'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { createKartya, deleteKartya, getKartya, mozgatKartya, updateKartya } from '../../../db/queries/tudastar';
import { kartyaUrl, tudastarUrl } from '../../../lib/routes';
import { slugbol } from '../../../lib/slug';
import { canEditTudastar } from '../../../lib/tudastar-jog';
import { isKartyaTipus } from '../../../lib/tudastar-szotar';
import { validalKartya } from '../../../lib/tudastar-validacio';
import { mezo } from '../../../lib/urlap';
import { requireSession } from '../../../lib/session';
import type { MuveletState } from '../../../components/form/useMuveletForm';

const NINCS_JOG = 'Nincs jogosultságod a tudástár szerkesztéséhez.';
const TOROLVE = 'A kártya közben törlődött.';
const ELAVULT = 'A kártyát közben más módosította – töltsd újra az oldalt.';
// A revalidálás a kódbázis többi actionjével azonos: `revalidatePath('/', 'layout')`. A `'/tudastar'` útvonal-tag
// a `(app)` route group miatt egyetlen oldalra sem illeszkedne (a tag `/(app)/tudastar/…` lenne).

/**
 * Új kártya (nincs `id`, a típus a rejtett `tipus` mezőből) vagy meglévő mentése (`id` + `verzio`, a típus a
 * meglévőé). A jog hiánya, a törölt kártya és az elavult verzió form-szintű hiba (nem 404), hogy a nyitott
 * szerkesztő tartalma ne vesszen el. Siker: átirányítás oda, ahol a kártya megjelenik.
 */
export async function mentKartyaAction(_prev: MuveletState, formData: FormData): Promise<MuveletState> {
  const session = await requireSession();
  if (!canEditTudastar(session)) return { errors: { form: NINCS_JOG } };
  const id = mezo(formData, 'id');
  const meglevo = id ? getKartya(id) : null;
  if (id && !meglevo) return { errors: { form: TOROLVE } };
  const tipus = meglevo ? meglevo.tipus : mezo(formData, 'tipus');
  if (!isKartyaTipus(tipus)) return { errors: { form: 'Hibás kérés: ismeretlen kártyatípus.' } };
  const parsed = validalKartya(formData, tipus);
  if (!parsed.ok) return { errors: parsed.errors };

  let slug: string;
  try {
    if (meglevo) {
      const eredmeny = updateKartya(meglevo.id, parsed.data, Number(mezo(formData, 'verzio')), session.userId);
      if (eredmeny === 'nincs') return { errors: { form: TOROLVE } };
      if (eredmeny === 'elavult') return { errors: { form: ELAVULT } };
      slug = meglevo.slug;
    } else {
      // A rövidítésből, ha abból értelmes slug lesz (pl. nem csak írásjel), különben a névből.
      slug = createKartya(parsed.data, slugbol(parsed.data.rovidites ?? '', slugbol(parsed.data.nev)), session.userId);
    }
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] mentés sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/', 'layout');
  redirect(kartyaUrl({ kategoria: parsed.data.kategoria, slug, tipus: parsed.data.tipus }));
}

/** ↑/↓ a kategória-oldalon (bind-olt `<form action>`): a szomszéddal cserél sorrendet. */
export async function mozgatKartyaAction(id: string, irany: 'fel' | 'le'): Promise<void> {
  const session = await requireSession();
  // A bind-olt argumentumok a kliensen át érkeznek vissza: az irányt futásidőben is ellenőrizzük.
  if (!canEditTudastar(session) || (irany !== 'fel' && irany !== 'le')) return;
  try {
    mozgatKartya(id, irany);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] mozgatás sikertelen:', err);
    return;
  }
  revalidatePath('/', 'layout');
}

/** Törlés a szerkesztőből (bind-olt, a dialógus hívja); siker után a kategória-oldalra irányít. */
export async function deleteKartyaAction(id: string): Promise<MuveletState> {
  const session = await requireSession();
  if (!canEditTudastar(session)) return { errors: { form: NINCS_JOG } };
  const meglevo = getKartya(id);
  if (!meglevo) return { errors: { form: TOROLVE } };
  try {
    deleteKartya(id);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] törlés sikertelen:', err);
    return { errors: { form: 'Törlés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/', 'layout');
  redirect(tudastarUrl(meglevo.kategoria));
}
