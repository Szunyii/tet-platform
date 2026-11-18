'use server';

import { revalidatePath } from 'next/cache';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import {
  allitCelAllapot,
  bekuld,
  elutasitModositast,
  feluliCelAllapot,
  jovahagy,
  kerModositast,
  kezdTerv,
  kozzetesz,
  mentCel,
  mentKozpontiCel,
  torolCel,
  torolKozpontiCel,
  tervEve,
  visszakuldTerv,
  visszanyit,
  type TervEredmeny,
} from '../../../db/queries/munkaterv';
import { aktualisEv } from '../../../lib/datum';
import { canJovahagy, canSzerkesztTerv } from '../../../lib/munkaterv-jog';
import { KOZPONTI_MAX, tervEvek } from '../../../lib/munkaterv-szotar';
import {
  parseCelAllapotForm,
  parseCelForm,
  parseKozpontiCelForm,
  parseTervMegjegyzesForm,
} from '../../../lib/munkaterv-validacio';
import { requireSession, type AppSession } from '../../../lib/session';

const HIBAK: Record<Exclude<TervEredmeny, 'ok'>, string> = {
  elavult: 'A tervet közben módosították. Töltsd újra az oldalt.',
  nincs_kozzeteve: 'A központi célok még nem jelentek meg.',
  cel_szam: 'A tervnek 3–5 célt kell tartalmaznia.',
  kozzeteve: 'A közzétett központi célok nem módosíthatók.',
  ervenytelen: 'Ez a művelet most nem végezhető el.',
  nincs: 'A terv nem található.',
};

const HIBAS_KERES: MuveletState = { errors: { form: 'Hibás kérés.' } };

function hiba(e: Exclude<TervEredmeny, 'ok'>): MuveletState {
  return { errors: { form: HIBAK[e] } };
}

/**
 * A párbeszédablakból indított írás eredménye. Csak sikernél revalidál: a friss lap hibánál lecserélhetné az ablakot
 * kiváltó sort, és vele elveszne a hibaüzenet és a beírt szöveg.
 */
function urlapEredmeny(e: TervEredmeny): MuveletState {
  if (e !== 'ok') return hiba(e);
  revalidatePath('/', 'layout');
  return { ok: true };
}

/** A gombbal indított írás eredménye. Hibánál is revalidál: a hibát többnyire elavult lap okozza. */
function azonnaliEredmeny(e: TervEredmeny): MuveletState {
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

/** Tervet és központi célt a folyó és a következő évre lehet készíteni. */
function tervezhetoEv(ev: unknown): ev is number {
  return typeof ev === 'number' && tervEvek(aktualisEv()).includes(ev);
}

/** A múltbeli terv tartalma már nem változik; a jóváhagyott terv céljainak állapota továbbra is rögzíthető. */
function tartalomZarolt(tervId: string): boolean {
  const ev = tervEve(tervId);
  return ev !== null && !tervezhetoEv(ev);
}

/** A központ munkamenete; más szerepkörnél `null`. A lekérdezések nem ellenőriznek szerepkört. */
async function kozpont(): Promise<AppSession | null> {
  const session = await requireSession();
  return canJovahagy(session) ? session : null;
}

/** A saját tervén dolgozó attasé munkamenete; más szerepkörnél `null`. */
async function tervTulajdonos(): Promise<AppSession | null> {
  const session = await requireSession();
  return canSzerkesztTerv(session, session.userId) ? session : null;
}

export async function mentKozpontiCelAction(
  ev: number,
  id: string | null,
  _prev: MuveletState,
  fd: FormData,
): Promise<MuveletState> {
  if (!(await kozpont())) return hiba('ervenytelen');
  if (!tervezhetoEv(ev)) return hiba('ervenytelen');
  if (id !== null && !ervenyesId(id)) return HIBAS_KERES;

  const parsed = parseKozpontiCelForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };

  const { eredmeny, nevek } = mentKozpontiCel(ev, parsed.data, id ?? undefined);
  if (eredmeny === 'cel_szam') {
    return { errors: { form: `Egy attaséra legfeljebb ${KOZPONTI_MAX} központi cél vonatkozhat. Túllépné: ${(nevek ?? []).join(', ')}.` } };
  }
  return urlapEredmeny(eredmeny);
}

export async function torolKozpontiCelAction(id: string): Promise<MuveletState> {
  if (!(await kozpont())) return hiba('ervenytelen');
  if (!ervenyesId(id)) return HIBAS_KERES;
  return azonnaliEredmeny(torolKozpontiCel(id));
}

export async function kozzeteszAction(ev: number): Promise<MuveletState> {
  const session = await kozpont();
  if (!session) return hiba('ervenytelen');
  if (!tervezhetoEv(ev)) return hiba('ervenytelen');

  const { eredmeny, tulSok = [], nincsCel = [] } = kozzetesz(ev, session.name);
  if (eredmeny !== 'cel_szam') return azonnaliEredmeny(eredmeny);
  const reszek = [
    tulSok.length > 0 && `Több mint ${KOZPONTI_MAX} központi cél vonatkozik rájuk: ${tulSok.join(', ')}.`,
    nincsCel.length > 0 && `Egyetlen központi cél sem vonatkozik rájuk: ${nincsCel.join(', ')}.`,
  ].filter(Boolean);
  revalidatePath('/', 'layout');
  return { errors: { form: `A célok nem tehetők közzé. ${reszek.join(' ')}` } };
}

export async function kezdTervAction(ev: number): Promise<MuveletState> {
  const session = await tervTulajdonos();
  if (!session) return hiba('ervenytelen');
  if (!tervezhetoEv(ev)) return hiba('ervenytelen');
  return azonnaliEredmeny(kezdTerv(session.userId, ev).eredmeny);
}

export async function mentCelAction(
  tervId: string,
  verzio: number,
  celId: string | null,
  _prev: MuveletState,
  fd: FormData,
): Promise<MuveletState> {
  const session = await tervTulajdonos();
  if (!session) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio) || (celId !== null && !ervenyesId(celId))) return HIBAS_KERES;
  if (tartalomZarolt(tervId)) return hiba('ervenytelen');

  const parsed = parseCelForm(fd, session.orszagok.map((o) => o.kod));
  if (!parsed.ok) return { errors: parsed.errors };
  return urlapEredmeny(mentCel(tervId, session.userId, parsed.data, verzio, celId ?? undefined));
}

export async function torolCelAction(tervId: string, verzio: number, celId: string): Promise<MuveletState> {
  const session = await tervTulajdonos();
  if (!session) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio) || !ervenyesId(celId)) return HIBAS_KERES;
  if (tartalomZarolt(tervId)) return hiba('ervenytelen');
  return azonnaliEredmeny(torolCel(tervId, session.userId, celId, verzio));
}

export async function bekuldAction(tervId: string, verzio: number): Promise<MuveletState> {
  const session = await tervTulajdonos();
  if (!session) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  if (tartalomZarolt(tervId)) return hiba('ervenytelen');
  return azonnaliEredmeny(bekuld(tervId, session.userId, verzio));
}

export async function jovahagyAction(tervId: string, verzio: number): Promise<MuveletState> {
  const session = await kozpont();
  if (!session) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  return azonnaliEredmeny(jovahagy(tervId, session.name, verzio));
}

export async function visszakuldTervAction(
  tervId: string,
  verzio: number,
  _prev: MuveletState,
  fd: FormData,
): Promise<MuveletState> {
  if (!(await kozpont())) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  // A visszaküldött múltbeli tervet az attasé már nem javíthatná.
  if (tartalomZarolt(tervId)) return hiba('ervenytelen');

  const parsed = parseTervMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return urlapEredmeny(visszakuldTerv(tervId, parsed.data.megjegyzes, verzio));
}

export async function kerModositastAction(
  tervId: string,
  verzio: number,
  _prev: MuveletState,
  fd: FormData,
): Promise<MuveletState> {
  const session = await tervTulajdonos();
  if (!session) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  if (tartalomZarolt(tervId)) return hiba('ervenytelen');

  const parsed = parseTervMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return urlapEredmeny(kerModositast(tervId, session.userId, parsed.data.megjegyzes, verzio));
}

export async function elutasitModositastAction(
  tervId: string,
  verzio: number,
  _prev: MuveletState,
  fd: FormData,
): Promise<MuveletState> {
  if (!(await kozpont())) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio)) return HIBAS_KERES;

  const parsed = parseTervMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return urlapEredmeny(elutasitModositast(tervId, parsed.data.megjegyzes, verzio));
}

export async function visszanyitAction(
  tervId: string,
  verzio: number,
  _prev: MuveletState,
  fd: FormData,
): Promise<MuveletState> {
  if (!(await kozpont())) return hiba('ervenytelen');
  if (!ervenyesId(tervId) || !ervenyesVerzio(verzio)) return HIBAS_KERES;
  // A visszanyitott múltbeli tervet az attasé már nem szerkeszthetné.
  if (tartalomZarolt(tervId)) return hiba('ervenytelen');

  const parsed = parseTervMegjegyzesForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return urlapEredmeny(visszanyit(tervId, parsed.data.megjegyzes, verzio));
}

/** A cél állapota: a központ felülírja, az attasé a saját tervében állítja. Más szerepkör nem írhat. */
export async function allitCelAllapotAction(celId: string, _prev: MuveletState, fd: FormData): Promise<MuveletState> {
  const session = await requireSession();
  const kozponti = canJovahagy(session);
  if (!kozponti && !canSzerkesztTerv(session, session.userId)) return hiba('ervenytelen');
  if (!ervenyesId(celId)) return HIBAS_KERES;

  const parsed = parseCelAllapotForm(fd);
  if (!parsed.ok) return { errors: parsed.errors };
  return urlapEredmeny(
    kozponti
      ? feluliCelAllapot(celId, parsed.data, session.name)
      : allitCelAllapot(celId, session.userId, parsed.data, session.name),
  );
}
