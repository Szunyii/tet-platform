'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import {
  createEredmeny,
  createTevekenyseg,
  deleteEredmeny,
  deleteTevekenyseg,
  getEredmeny,
  igazol,
  kapcsolatbaLep,
  kerIgazolast,
  kifogasolEredmeny,
  kifogasolTevekenyseg,
  megszakit,
  ujraindit,
  updateEredmeny,
  updateTevekenyseg,
  visszakuld,
  visszavon,
  visszavonEredmenyKifogas,
  visszavonTevekenysegKifogas,
  type IrasEredmeny,
} from '../../../db/queries/tevekenyseg';
import { maiNaptariNap } from '../../../lib/datum';
import { requireAdmin, requireSession, type AppSession } from '../../../lib/session';
import { mezokZarolvaE } from '../../../lib/tevekenyseg-allapot';
import { canModosit, canRogzit } from '../../../lib/tevekenyseg-jog';
import { tevekenysegUrl } from '../../../lib/tevekenyseg-szuro';
import {
  parseEredmenyForm,
  parseIgazolasKeresForm,
  parseMegjegyzesForm,
  parseTevekenysegForm,
  parseVerzio,
} from '../../../lib/tevekenyseg-validacio';

const HIBAK: Record<Exclude<IrasEredmeny, 'ok'>, string> = {
  elavult: 'Ezt a bejegyzést közben módosították. Töltsd újra az oldalt.',
  lezart_felev: 'A félév már lezárult, ide nem rögzíthető tevékenység.',
  ervenytelen: 'Ez a művelet most nem végezhető el.',
  nincs: 'A bejegyzés nem található.',
};

const HIBAS_KERES: MuveletState = { errors: { form: 'Hibás kérés.' } };

function hiba(e: Exclude<IrasEredmeny, 'ok'>): MuveletState {
  return { errors: { form: HIBAK[e] } };
}

/**
 * Az írás eredménye űrlap-állapotként. A revalidálás a sikertelen ágakon is fut: a hibát többnyire elavult nézet
 * okozza, így a lap a friss állapotot mutatja.
 */
function eredmenybol(e: IrasEredmeny): MuveletState {
  revalidatePath('/', 'layout');
  return e === 'ok' ? { ok: true } : hiba(e);
}

/** A bind-olt argumentumok a kliensen át érkeznek, ezért futásidőben is ellenőrizzük őket. */
function ervenyesId(id: unknown): id is string {
  return typeof id === 'string' && id.length > 0;
}

function ervenyesVerzio(verzio: unknown): verzio is number {
  return typeof verzio === 'number' && Number.isSafeInteger(verzio) && verzio > 0;
}

function sajatOrszagok(session: AppSession): string[] {
  return session.orszagok.map((o) => o.kod);
}

export async function mentTevekenysegAction(id: string | null, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (id !== null && !ervenyesId(id)) return HIBAS_KERES;

  const parsed = parseTevekenysegForm(fd, maiNaptariNap(), sajatOrszagok(session));
  if (!parsed.ok) return { errors: parsed.errors };

  if (id === null) return eredmenybol(createTevekenyseg(session.userId, parsed.data).eredmeny);
  const verzio = parseVerzio(fd);
  if (verzio === null) return HIBAS_KERES;
  return eredmenybol(updateTevekenyseg(id, session.userId, parsed.data, verzio));
}

export async function torolTevekenysegAction(id: string): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (!ervenyesId(id)) return HIBAS_KERES;
  return eredmenybol(deleteTevekenyseg(id, session.userId));
}

export async function mentEredmenyAction(id: string | null, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (id !== null && !ervenyesId(id)) return HIBAS_KERES;

  const orszagok = sajatOrszagok(session);
  const verzio = parseVerzio(fd);
  if (id !== null) {
    if (verzio === null) return HIBAS_KERES;
    const ugy = getEredmeny(id);
    if (!ugy || !canModosit(session, ugy)) return hiba('nincs');
    // A megnyitás óta változott ügynél a zárolás is más lehet: a letiltott mezők hiánya nem mezőhiba.
    if (ugy.verzio !== verzio) return eredmenybol('elavult');
    // Zárolt ügynél csak a leírás változhat: a letiltott mezők nem érkeznek meg, ezért a tárolt értékek számítanak,
    // az országé akkor is, ha az attasé már nem fedi le.
    if (mezokZarolvaE(ugy)) {
      fd.set('megnevezes', ugy.megnevezes);
      fd.set('orszag', ugy.orszagKod);
      fd.set('partner', ugy.partner);
      fd.set('magyarSzereplo', ugy.magyarSzereplo ?? '');
      fd.set('hozzajarulas', ugy.hozzajarulas);
      orszagok.push(ugy.orszagKod);
    }
  }

  const parsed = parseEredmenyForm(fd, orszagok);
  if (!parsed.ok) return { errors: parsed.errors };

  if (id === null || verzio === null) return eredmenybol(createEredmeny(session.userId, parsed.data, session.name).eredmeny);
  return eredmenybol(updateEredmeny(id, session.userId, parsed.data, verzio));
}

/** Sikeres törlés után az adatlap már nem létezik, ezért az action a táblára irányít. */
export async function torolEredmenyAction(id: string): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (!ervenyesId(id)) return HIBAS_KERES;
  const eredmeny = deleteEredmeny(id, session.userId);
  revalidatePath('/', 'layout');
  if (eredmeny !== 'ok') return hiba(eredmeny);
  redirect(tevekenysegUrl({}));
}

export async function kapcsolatbaLepAction(id: string, verzio: number): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (!ervenyesId(id) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  return eredmenybol(kapcsolatbaLep(id, session.userId, session.name, verzio));
}

export async function kerIgazolastAction(id: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (!ervenyesId(id)) return HIBAS_KERES;
  const parsed = parseIgazolasKeresForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return eredmenybol(kerIgazolast(id, session.userId, parsed.data, session.name));
}

export async function megszakitAction(id: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (!ervenyesId(id)) return HIBAS_KERES;
  const parsed = parseMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return eredmenybol(megszakit(id, session.userId, parsed.data, session.name));
}

export async function ujrainditAction(id: string, verzio: number): Promise<MuveletState> {
  const session = await requireSession();
  if (!canRogzit(session)) return hiba('ervenytelen');
  if (!ervenyesId(id) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  return eredmenybol(ujraindit(id, session.userId, session.name, verzio));
}

const ELAVULT_DONTES = 'Ezt a kérést közben más már elbírálta. Töltsd újra az oldalt.';

/** A központ döntésének eredménye: az elavult verzió azt jelenti, hogy egy másik admin már döntött. */
function dontesbol(e: IrasEredmeny): MuveletState {
  revalidatePath('/', 'layout');
  if (e === 'ok') return { ok: true };
  return { errors: { form: e === 'elavult' ? ELAVULT_DONTES : HIBAK[e] } };
}

/** A tevékenységnek nincs verzió-ellenőrzése: az `ervenytelen` itt azt jelenti, hogy a kifogásról közben más döntött. */
function tevekenysegDontesbol(e: IrasEredmeny): MuveletState {
  return dontesbol(e === 'ervenytelen' ? 'elavult' : e);
}

export async function igazolAction(id: string, verzio: number): Promise<MuveletState> {
  const session = await requireAdmin();
  if (!ervenyesId(id) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  return dontesbol(igazol(id, session.name, verzio));
}

export async function visszakuldAction(id: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireAdmin();
  if (!ervenyesId(id)) return HIBAS_KERES;
  const parsed = parseMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return dontesbol(visszakuld(id, parsed.data, session.name));
}

export async function visszavonAction(id: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireAdmin();
  if (!ervenyesId(id)) return HIBAS_KERES;
  const parsed = parseMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return dontesbol(visszavon(id, parsed.data, session.name));
}

export async function kifogasolTevekenysegAction(id: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireAdmin();
  if (!ervenyesId(id)) return HIBAS_KERES;
  const parsed = parseMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return tevekenysegDontesbol(kifogasolTevekenyseg(id, parsed.data.megjegyzes, session.name));
}

export async function visszavonTevekenysegKifogasAction(id: string): Promise<MuveletState> {
  await requireAdmin();
  if (!ervenyesId(id)) return HIBAS_KERES;
  return tevekenysegDontesbol(visszavonTevekenysegKifogas(id));
}

export async function kifogasolEredmenyAction(id: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireAdmin();
  if (!ervenyesId(id)) return HIBAS_KERES;
  const parsed = parseMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return dontesbol(kifogasolEredmeny(id, parsed.data, session.name));
}

export async function visszavonEredmenyKifogasAction(id: string, verzio: number): Promise<MuveletState> {
  await requireAdmin();
  if (!ervenyesId(id) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  return dontesbol(visszavonEredmenyKifogas(id, verzio));
}
