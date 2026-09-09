'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import {
  addUzenet,
  closeTicket,
  createTicket,
  getTicket,
  listCimzettJeloltek,
  reopenTicket,
} from '../../../db/queries/ticket';
import { requireAdmin, requireSession } from '../../../lib/session';
import { canViewTicket, canWriteTicket } from '../../../lib/ticket-jog';
import { parseUjTicketForm, parseUzenetForm } from '../../../lib/ticket-validacio';

export type TicketFormState = MuveletState;

// Azonos szöveg hiányzó és idegen ticketre: nem áruljuk el a létezését.
const NINCS_JOG = 'Nincs jogosultságod ehhez a tickethez.';
// Admin-only action: itt nem kell titkolni a hiányt, a hibaüzenet ezt tükrözi.
const NINCS_TICKET = 'Ez a ticket már nem létezik, a lista frissült.';
const MENTES_HIBA = 'Mentés sikertelen, próbáld újra.';
const LEZARVA = 'A ticket le van zárva.';
const LEZARAS_HIBA = 'Lezárás sikertelen, próbáld újra.';
const UJRANYITAS_HIBA = 'Újranyitás sikertelen, próbáld újra.';

// A teljes layout revalidálása: a lista, a beszélgetés és az AppShell menü-számlálója is frissül.
function frissit(): void {
  revalidatePath('/', 'layout');
}

export async function createTicketAction(_prev: TicketFormState, formData: FormData): Promise<TicketFormState> {
  const session = await requireAdmin();
  const parsed = parseUjTicketForm(formData, listCimzettJeloltek());
  if (!parsed.ok) return { errors: parsed.errors };
  let id: string;
  try {
    id = createTicket({ ...parsed.data, nyito: { id: session.userId, nev: session.name, szerep: 'admin' } });
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] createTicket sikertelen:', err);
    return { errors: { form: MENTES_HIBA } };
  }
  frissit();
  redirect(`/kommunikacio?t=${id}`);
}

export async function sendUzenetAction(
  ticketId: string,
  _prev: TicketFormState,
  formData: FormData,
): Promise<TicketFormState> {
  const session = await requireSession();
  const parsed = parseUzenetForm(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const t = getTicket(ticketId, session);
  if (!t || !canViewTicket(session, t)) return { errors: { form: NINCS_JOG } };
  if (!canWriteTicket(session, t)) {
    // Elavult kliens-állapot: a lista/panel is frissüljön.
    frissit();
    return { errors: { form: LEZARVA } };
  }
  try {
    addUzenet(ticketId, { id: session.userId, nev: session.name, szerep: session.role }, parsed.szoveg);
  } catch (err) {
    unstable_rethrow(err);
    // Elavult kliens-állapot (pl. másik fülön közben lezárták): az addUzenet dob, itt űrlap-hiba lesz.
    console.error('[ticket] addUzenet sikertelen:', err);
    return { errors: { form: MENTES_HIBA } };
  }
  frissit();
  return { ok: true };
}

export async function closeTicketAction(ticketId: string): Promise<TicketFormState> {
  const session = await requireAdmin();
  const t = getTicket(ticketId, session);
  if (!t) {
    frissit();
    return { errors: { form: NINCS_TICKET } };
  }
  if (t.statusz === 'lezart') {
    frissit();
    return { ok: true };
  }
  try {
    closeTicket(ticketId);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] closeTicket sikertelen:', err);
    return { errors: { form: LEZARAS_HIBA } };
  }
  frissit();
  return { ok: true };
}

export async function reopenTicketAction(ticketId: string): Promise<TicketFormState> {
  const session = await requireAdmin();
  const t = getTicket(ticketId, session);
  if (!t) {
    frissit();
    return { errors: { form: NINCS_TICKET } };
  }
  if (t.statusz !== 'lezart') {
    frissit();
    return { ok: true };
  }
  try {
    reopenTicket(ticketId);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[ticket] reopenTicket sikertelen:', err);
    return { errors: { form: UJRANYITAS_HIBA } };
  }
  frissit();
  return { ok: true };
}
