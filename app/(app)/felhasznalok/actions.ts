'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { auth } from '../../../lib/auth';
import {
  parseJelszo,
  parseSzerkesztes,
  parseUjFelhasznalo,
  type MezoHibak,
} from '../../../lib/felhasznalo-validacio';
import { requireAdmin } from '../../../lib/session';

export interface MuveletState {
  ok?: boolean;
  errors?: MezoHibak;
}

const SAJAT_FIOK_HIBA = 'Saját fiókodon ez a művelet nem végezhető.';

// A Better Auth APIError-nak body.code mezője van; duck-typing, hogy ne függjünk
// a better-call osztálypéldányától.
function apiKod(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'body' in err) {
    const body = (err as { body?: { code?: string } }).body;
    return body?.code;
  }
  return undefined;
}

// Better Auth hiba → mezőhibák. Ami mezőhöz köthető (e-mail), az a mező kulcsára megy,
// a többi a `form` kulcsra.
function hibaMezok(err: unknown): MezoHibak {
  switch (apiKod(err)) {
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return { email: 'Ezzel az e-mail címmel már van felhasználó.' };
    case 'INVALID_EMAIL':
      // A saját validátorunk megengedőbb a Better Auth zod-szabályánál (pl. ékezetes cím).
      return { email: 'Érvénytelen e-mail cím.' };
    case 'YOU_CANNOT_BAN_YOURSELF':
    case 'YOU_CANNOT_REMOVE_YOURSELF':
      return { form: SAJAT_FIOK_HIBA };
    default:
      console.error('[felhasznalok] művelet sikertelen:', err);
      return { form: 'Művelet sikertelen.' };
  }
}

// A teljes layout revalidálása: a lista és az AppShell fejléce is frissül (pl. az admin
// a saját nevét módosítja), és a kliens-oldali router cache is ürül.
function kesz(): MuveletState {
  revalidatePath('/', 'layout');
  return { ok: true };
}

export async function createFelhasznaloAction(
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  await requireAdmin();
  const parsed = parseUjFelhasznalo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, email, jelszo, szerepkor, orszag } = parsed.data;
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        name: nev,
        email,
        password: jelszo,
        role: szerepkor,
        data: orszag ? { orszag } : undefined,
      },
    });
  } catch (err) {
    return { errors: hibaMezok(err) };
  }
  return kesz();
}

export async function updateFelhasznaloAction(
  userId: string,
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  const me = await requireAdmin();
  const parsed = parseSzerkesztes(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, szerepkor, orszag } = parsed.data;
  if (userId === me.userId && szerepkor !== 'admin') {
    return { errors: { szerepkor: 'Saját admin szerepkörödet nem veheted el.' } };
  }
  try {
    const h = await headers();
    await auth.api.adminUpdateUser({ headers: h, body: { userId, data: { name: nev, orszag } } });
    await auth.api.setRole({ headers: h, body: { userId, role: szerepkor } });
  } catch (err) {
    return { errors: hibaMezok(err) };
  }
  return kesz();
}

export async function setJelszoAction(
  userId: string,
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  await requireAdmin();
  const parsed = parseJelszo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  try {
    await auth.api.setUserPassword({
      headers: await headers(),
      body: { userId, newPassword: parsed.data.jelszo },
    });
  } catch (err) {
    return { errors: hibaMezok(err) };
  }
  return kesz();
}

export async function banAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.banUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return { errors: hibaMezok(err) };
  }
  return kesz();
}

export async function unbanAction(userId: string): Promise<MuveletState> {
  await requireAdmin();
  try {
    await auth.api.unbanUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return { errors: hibaMezok(err) };
  }
  return kesz();
}

export async function removeFelhasznaloAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return { errors: hibaMezok(err) };
  }
  return kesz();
}
