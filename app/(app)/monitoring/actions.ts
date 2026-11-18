'use server';

import { revalidatePath } from 'next/cache';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import { lezarIdoszak, megnyitIdoszak, ujranyitIdoszak } from '../../../db/queries/ertekeles';
import { maiNaptariNap } from '../../../lib/datum';
import { parseFelevSzam, type Felev } from '../../../lib/ertekeles-idoszak';
import { requireAdmin } from '../../../lib/session';

const NINCS_FELEV = 'A félév nem található.';

function hiba(form: string): MuveletState {
  return { errors: { form } };
}

/** A bind-olt argumentumok a kliensen át érkeznek, ezért futásidőben is ellenőrizzük őket. */
function felevBol(ev: number, felev: number): Felev | null {
  const szam = parseFelevSzam(felev);
  return Number.isInteger(ev) && szam !== null ? { ev, felev: szam } : null;
}

// A revalidálás a sikertelen ágakon is fut: a hibát elavult nézet okozza (másik admin közben módosított),
// így a gomb és a tiltás oka is a friss állapotot mutatja.

export async function megnyitFelevAction(ev: number, felev: number): Promise<MuveletState> {
  await requireAdmin();
  const f = felevBol(ev, felev);
  if (!f) return hiba(NINCS_FELEV);
  const eredmeny = megnyitIdoszak(f, maiNaptariNap());
  revalidatePath('/', 'layout');
  return eredmeny === 'nem_nyithato' ? hiba('Ez a félév nem nyitható meg.') : { ok: true };
}

export async function lezarFelevAction(ev: number, felev: number): Promise<MuveletState> {
  const session = await requireAdmin();
  const f = felevBol(ev, felev);
  if (!f) return hiba(NINCS_FELEV);
  const lezaras = lezarIdoszak(f, session.name);
  revalidatePath('/', 'layout');
  switch (lezaras.eredmeny) {
    case 'ok':
    case 'mar_lezart':
      return { ok: true };
    case 'nincs':
      return hiba(NINCS_FELEV);
    case 'nem_ert_veget':
      return hiba('A félév még nem ért véget.');
    case 'hianyos':
      return hiba(`Hiányzó minősítés: ${lezaras.hianyzok.join(', ')}.`);
  }
}

export async function ujranyitFelevAction(ev: number, felev: number): Promise<MuveletState> {
  await requireAdmin();
  const f = felevBol(ev, felev);
  if (!f) return hiba(NINCS_FELEV);
  const eredmeny = ujranyitIdoszak(f);
  revalidatePath('/', 'layout');
  // A `nem_lezart`: a félév már nyitott, a kért állapot fennáll.
  return eredmeny === 'nincs' ? hiba(NINCS_FELEV) : { ok: true };
}
