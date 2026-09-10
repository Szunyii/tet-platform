/** A Better Auth tiltás-szabálya: a lejárt banExpires nem tiltás. Tiszta függvény, a query-modulok közös alapja. */
export function tiltottE(u: { banned: boolean | null; banExpires: Date | null }, now = Date.now()): boolean {
  return Boolean(u.banned) && (!u.banExpires || u.banExpires.getTime() > now);
}
