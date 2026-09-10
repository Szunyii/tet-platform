'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import { unstable_rethrow } from 'next/navigation';
import type { MuveletState } from '../../../components/form/useMuveletForm';
import { auth } from '../../../lib/auth';
import {
  parseJelszo,
  parseSzerkesztes,
  parseUjFelhasznalo,
  type AttaseAdatok,
  type Szerepkor,
} from '../../../lib/felhasznalo-validacio';
import { requireAdmin } from '../../../lib/session';

export type { MuveletState };

/** A Better Auth `user` rekord általunk írt mezői (createUser / adminUpdateUser `data`). */
interface FelhasznaloAdatok extends AttaseAdatok {
  name?: string;
  role?: Szerepkor;
}

const SAJAT_FIOK_HIBA = 'Saját fiókodon ez a művelet nem végezhető.';

// A Better Auth APIError-nak body.code mezője van; duck-typing, hogy ne függjünk a
// better-call osztálypéldányától (a validációs hiba pl. sima Error, de body.code-dal).
function apiKod(err: unknown): string | undefined {
  if (typeof err === 'object' && err !== null && 'body' in err) {
    const body = (err as { body?: { code?: string } }).body;
    return body?.code;
  }
  return undefined;
}

// A teljes layout revalidálása: a lista és az AppShell fejléce is frissül (pl. az admin
// a saját nevét módosítja), és a kliens-oldali router cache is ürül.
function kesz(): MuveletState {
  revalidatePath('/', 'layout');
  return { ok: true };
}

// Hiba → MuveletState. Ami mezőhöz köthető, a mező kulcsára megy, a többi a `form`-ra.
// A Next control-flow kivételeit (redirect/notFound) tovább kell dobni, nem elnyelni.
function hiba(err: unknown, muvelet: string): MuveletState {
  unstable_rethrow(err);
  switch (apiKod(err)) {
    case 'USER_ALREADY_EXISTS':
    case 'USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL':
      return { errors: { email: 'Ezzel az e-mail címmel már van felhasználó.' } };
    case 'INVALID_EMAIL':
      // A saját validátorunk megengedőbb a Better Auth zod-szabályánál (pl. ékezetes cím).
      return { errors: { email: 'Érvénytelen e-mail cím.' } };
    case 'PASSWORD_TOO_SHORT':
    case 'PASSWORD_TOO_LONG':
      // A validátorunk 8–128 karaktert enged (a Better Auth alapértelmezése); ha a
      // lib/auth.ts min/maxPasswordLength változna, ez a fallback marad.
      return { errors: { jelszo: 'A jelszó hossza nem megfelelő (8–128 karakter).' } };
    case 'USER_NOT_FOUND':
      // Elavult lista (másik admin közben törölte): frissítjük, hogy a sor eltűnjön.
      revalidatePath('/', 'layout');
      return { errors: { form: 'Ez a felhasználó már nem létezik, a lista frissült.' } };
    case 'YOU_CANNOT_BAN_YOURSELF':
    case 'YOU_CANNOT_REMOVE_YOURSELF':
      return { errors: { form: SAJAT_FIOK_HIBA } };
    default:
      console.error(`[felhasznalok] ${muvelet} sikertelen:`, err);
      return { errors: { form: 'Művelet sikertelen.' } };
  }
}

export async function createFelhasznaloAction(
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  await requireAdmin();
  const parsed = parseUjFelhasznalo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  const { nev, email, jelszo, szerepkor, ...adatok } = parsed.data;
  try {
    await auth.api.createUser({
      headers: await headers(),
      body: {
        name: nev,
        email,
        password: jelszo,
        role: szerepkor,
        data: adatok satisfies FelhasznaloAdatok,
      },
    });
  } catch (err) {
    return hiba(err, 'createUser');
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
  const { nev, szerepkor, ...adatok } = parsed.data;
  if (userId === me.userId && szerepkor !== 'admin') {
    return { errors: { szerepkor: 'Saját admin szerepkörödet nem veheted el.' } };
  }
  try {
    // Egyetlen hívás (név, poszt-adatok, elérhetőségek, szerepkör együtt): az
    // adminUpdateUser a data.role-t maga ellenőrzi és menti, így nincs részlegesen
    // mentett állapot. A null értékek törlik a mezőt (adminra váltásnál a poszt-adatokat).
    await auth.api.adminUpdateUser({
      headers: await headers(),
      body: { userId, data: { name: nev, role: szerepkor, ...adatok } satisfies FelhasznaloAdatok },
    });
  } catch (err) {
    return hiba(err, 'adminUpdateUser');
  }
  return kesz();
}

export async function setJelszoAction(
  userId: string,
  _prev: MuveletState,
  formData: FormData,
): Promise<MuveletState> {
  const me = await requireAdmin();
  const parsed = parseJelszo(formData);
  if (!parsed.ok) return { errors: parsed.errors };
  try {
    const h = await headers();
    await auth.api.setUserPassword({ headers: h, body: { userId, newPassword: parsed.data.jelszo } });
    // Jelszó-visszaállítás = fiók-helyreállítás: a célfelhasználó régi sessionjei is
    // érvénytelenek legyenek. Saját jelszónál a saját sessiont megtartjuk.
    if (userId !== me.userId) {
      await auth.api.revokeUserSessions({ headers: h, body: { userId } });
    }
  } catch (err) {
    return hiba(err, 'setUserPassword');
  }
  return kesz();
}

export async function banAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.banUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'banUser');
  }
  return kesz();
}

export async function unbanAction(userId: string): Promise<MuveletState> {
  await requireAdmin();
  try {
    await auth.api.unbanUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'unbanUser');
  }
  return kesz();
}

export async function removeFelhasznaloAction(userId: string): Promise<MuveletState> {
  const me = await requireAdmin();
  if (userId === me.userId) return { errors: { form: SAJAT_FIOK_HIBA } };
  try {
    await auth.api.removeUser({ headers: await headers(), body: { userId } });
  } catch (err) {
    return hiba(err, 'removeUser');
  }
  return kesz();
}
