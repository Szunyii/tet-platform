'use server';

import { revalidatePath } from 'next/cache';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import {
  kihagyAttase,
  lezarIdoszak,
  megnyitIdoszak,
  mentOssz,
  mentSzempont,
  ujranyitIdoszak,
  type MentesEredmeny,
} from '../../../db/queries/ertekeles';
import { maiNaptariNap } from '../../../lib/datum';
import { parseFelevSzam, type Felev } from '../../../lib/ertekeles-idoszak';
import { parseKihagyasForm, parseOsszForm, parseSzempontForm } from '../../../lib/ertekeles-validacio';
import { requireAdmin } from '../../../lib/session';

/** A munkalap mentésének eredménye: sikernél az új verzió, ehhez hasonlít a következő mentés. */
export interface MentesState extends MuveletState {
  verzio?: number;
}

const NINCS_FELEV = 'A félév nem található.';
const NINCS_ERTEKELES = 'Az értékelés nem található.';
const LEZART_FELEV = 'A félév közben lezárult.';

const MENTES_HIBAK: Record<Exclude<MentesEredmeny, 'ok'>, string> = {
  elavult: 'Ezt a minősítést közben más módosította. A szövegedet másold ki, majd töltsd újra az oldalt.',
  lezart: LEZART_FELEV,
  kihagyott: 'Az attasét közben kihagyták ebből a félévből.',
  automatikus: 'Ez a szempont ennél az attasénál automatikusan nem értékelhető.',
  hianyos: 'Összminősítés csak mind az öt szempont minősítése után adható.',
  nincs: NINCS_ERTEKELES,
};

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

// A munkalap műveletei csak sikernél revalidálnak: a friss nézet a hibás űrlapot lecserélné (lezárt félév, kihagyott
// attasé), és vele eltűnne a hibaüzenet és a be nem mentett szöveg, amelyet az admin még ki akar másolni.

function mentesEredmeny({ eredmeny, verzio }: { eredmeny: MentesEredmeny; verzio?: number }): MentesState {
  if (eredmeny !== 'ok') return hiba(MENTES_HIBAK[eredmeny]);
  revalidatePath('/', 'layout');
  return { ok: true, verzio };
}

export async function mentSzempontAction(ertekelesId: string, _prev: MentesState, fd: FormData): Promise<MentesState> {
  const session = await requireAdmin();
  const input = parseSzempontForm(fd);
  if (!input.ok) return { errors: input.errors };
  return mentesEredmeny(mentSzempont(ertekelesId, input.data, session.name));
}

export async function mentOsszAction(ertekelesId: string, _prev: MentesState, fd: FormData): Promise<MentesState> {
  const session = await requireAdmin();
  const input = parseOsszForm(fd);
  if (!input.ok) return { errors: input.errors };
  return mentesEredmeny(mentOssz(ertekelesId, input.data, session.name));
}

function kihagyasEredmeny(eredmeny: ReturnType<typeof kihagyAttase>): MuveletState {
  if (eredmeny === 'nincs') return hiba(NINCS_ERTEKELES);
  if (eredmeny === 'lezart') return hiba(LEZART_FELEV);
  if (eredmeny === 'inaktiv') return hiba('Az attasé már nem aktív, ezért nem vehető vissza az értékelésbe.');
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function kihagyAttaseAction(ertekelesId: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  await requireAdmin();
  const input = parseKihagyasForm(fd);
  if (!input.ok) return { errors: input.errors };
  return kihagyasEredmeny(kihagyAttase(ertekelesId, input.data.ok));
}

export async function visszaveszAttaseAction(ertekelesId: string): Promise<MuveletState> {
  await requireAdmin();
  return kihagyasEredmeny(kihagyAttase(ertekelesId, null));
}
