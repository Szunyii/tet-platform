/** A Better Auth tiltás-szabálya: a lejárt banExpires nem tiltás. Tiszta függvény, a query-modulok közös alapja. */
export function tiltottE(u: { banned: boolean | null; banExpires: Date | null }, now = Date.now()): boolean {
  return Boolean(u.banned) && (!u.banExpires || u.banExpires.getTime() > now);
}

/** Aktív attasé: nem admin és nem tiltott (az admin attasé-sora a kétlépéses mentés maradéka lehet). */
export function aktivAttaseE(
  u: { role: string | null; banned: boolean | null; banExpires: Date | null },
  now = Date.now(),
): boolean {
  return u.role !== 'admin' && !tiltottE(u, now);
}
