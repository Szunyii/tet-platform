'use server';

import { revalidatePath } from 'next/cache';
import { notFound, unstable_rethrow } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import { upsertBlokk } from '../../../db/queries/orszagprofil';
import { aktualisEv } from '../../../lib/datum';
import { orszagByKod } from '../../../lib/orszagok';
import { canEditProfil } from '../../../lib/orszagprofil-jog';
import { isBlokkKulcs } from '../../../lib/orszagprofil-szotar';
import { validalBlokk } from '../../../lib/orszagprofil-validacio';
import { requireSession } from '../../../lib/session';
import { mezo } from '../../../lib/urlap';

export type { MuveletState };

const NINCS_JOG = 'Nincs jogosultságod ehhez a profilhoz.';

/**
 * Egy blokk mentése. Rejtett mezők: kod, ev, blokk. Sorrend: session → kód/blokk létezik
 * → jog → validálás → upsert. Az ismeretlen országkód/blokk-kulcs 404 (mint a
 * `requireAdmin()`-nál: ez csak manipulált kéréssel jöhet létre). A jogosultsági hiba
 * viszont űrlap-szintű hiba, nem 404: a szerkesztő oldal nyitva tartása közben is
 * érvénytelenné válhat (évváltás Európa/Budapest éjfélkor, vagy admin átírja az attasé
 * országát/szerepkörét) – a 404 az egész oldalt lecserélné, elveszítve a még nem mentett
 * blokkokat.
 */
export async function mentBlokkAction(_prev: MuveletState, formData: FormData): Promise<MuveletState> {
  const session = await requireSession();
  const kod = mezo(formData, 'kod');
  const blokk = mezo(formData, 'blokk');
  const ev = Number.parseInt(mezo(formData, 'ev'), 10);
  if (!orszagByKod(kod)) notFound();
  if (!isBlokkKulcs(blokk)) notFound();
  const most = aktualisEv();
  if (!canEditProfil(session, kod, ev, most)) return { errors: { form: NINCS_JOG } };

  const eredmeny = validalBlokk(blokk, formData, most);
  // A szerkesztő oldalon 8 blokk van egy DOM-ban, a mező id-ja ezért `<blokk>.<mezo>`
  // (a name a puszta mezőnév). A hibakulcs = id, hogy a useMuveletForm a jó blokkra fókuszáljon.
  if (!eredmeny.ok) {
    return { errors: Object.fromEntries(Object.entries(eredmeny.errors).map(([k, v]) => [`${blokk}.${k}`, v])) };
  }

  try {
    upsertBlokk(kod, ev, blokk, eredmeny.ertek, session.userId);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[orszagprofil] upsertBlokk sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/terkep');
  revalidatePath(`/orszagprofil/${kod}`);
  revalidatePath(`/orszagprofil/${kod}/szerkesztes`);
  return { ok: true };
}
