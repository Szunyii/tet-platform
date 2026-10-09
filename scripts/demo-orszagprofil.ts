/**
 * Demó országprofilok az aktuális évre: az attasék országainak valós, kutatott adatai a
 * DATABASE_URL (alapért. ./data/tet.db) DB-be. Országonként egy adatfájl:
 * scripts/demo-orszagprofil/orszagok/<kod>.ts (export default DemoOrszag).
 *
 * Előbb minden blokkot ellenőriz – a `validalBlokk`-kal, ahogy az űrlapot, és szigorúbban is:
 * ismeretlen mezőnév, szótáron kívüli listás opció vagy rendezvénytípus, túl nagy
 * rendezvény-index hiba (a validátor ezeket némán eldobná vagy kicserélné) –, és csak hibátlan
 * adatnál ír, egy tranzakcióban. A meg nem adott blokkhoz nem nyúl (részleges profil).
 * Idempotens; a szerző az első admin.
 *
 * Futtatás: NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts [--csak DE,AT]
 * A --csak csak a megadott országokat ellenőrzi, és meg sem nyitja a DB-t.
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { aktualisEv } from '../lib/datum';
import { orszagByKod } from '../lib/orszagok';
import {
  BLOKK_KULCSOK, GAZDASAGI_AGAZATOK, IPARAGAK, KFI_PRIORITASOK, MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK,
  TAGSAGOK, isBlokkKulcs, type BlokkKulcs, type ProfilBlokkok,
} from '../lib/orszagprofil-szotar';
import { validalBlokk } from '../lib/orszagprofil-validacio';
import { urlapFormData, type DemoOrszag, type Urlap } from './demo-orszagprofil/tipusok';

const MAPPA = resolve(process.cwd(), 'scripts/demo-orszagprofil/orszagok');

/** A listás mezők engedett értékei blokkonként: a validátor a szótáron kívüli opciót némán eldobná. */
const LISTAK: Partial<Record<BlokkKulcs, Record<string, readonly string[]>>> = {
  alapadatok: { tagsagok: TAGSAGOK, agazatok: GAZDASAGI_AGAZATOK },
  kfiRendszer: { prioritasok: KFI_PRIORITASOK, kiemeltIparagak: IPARAGAK },
  vallalati: { kiemeltAgazatok: IPARAGAK },
};
const RENDEZVENY_MEZO = /^rendezveny\.(\d+)\.(nev|tipus|idopont|megjegyzes)$/;
const TIPUS_KULCSOK: readonly string[] = RENDEZVENY_TIPUSOK.map((t) => t.kulcs);

/** A validátoron túli ellenőrzés: amit a validátor némán eldobna vagy kicserélne, az itt hiba. */
function szigoruHibak(blokk: BlokkKulcs, u: Urlap): string[] {
  const hibak: string[] = [];
  const listak = LISTAK[blokk] ?? {};
  const mezok: readonly string[] = Object.keys(MEZO_CIMKEK[blokk]);
  for (const [mezo, ertek] of Object.entries(u)) {
    if (blokk === 'rendezvenyek') {
      const m = RENDEZVENY_MEZO.exec(mezo);
      if (!m) hibak.push(`ismeretlen mező: ${mezo}`);
      else if (Number(m[1]) >= RENDEZVENY_MAX) hibak.push(`${mezo}: legfeljebb ${RENDEZVENY_MAX} rendezvény (index 0–${RENDEZVENY_MAX - 1})`);
      else if (Array.isArray(ertek)) hibak.push(`${mezo}: egy érték kell, nem lista`);
      else if (m[2] === 'tipus' && !TIPUS_KULCSOK.includes(ertek)) {
        hibak.push(`${mezo}: ismeretlen típus „${ertek}” (${TIPUS_KULCSOK.join(', ')})`);
      }
      continue;
    }
    if (!mezok.includes(mezo)) {
      hibak.push(`ismeretlen mező: ${mezo}`);
      continue;
    }
    const engedett = listak[mezo];
    if (!engedett) {
      if (Array.isArray(ertek)) hibak.push(`${mezo}: egy érték kell, nem lista`);
    } else if (!Array.isArray(ertek)) {
      hibak.push(`${mezo}: lista kell`);
    } else {
      for (const x of ertek) if (!engedett.includes(x)) hibak.push(`${mezo}: szótáron kívüli opció „${x}”`);
    }
  }
  return hibak;
}

interface EllenorzottBlokk { blokk: BlokkKulcs; ertek: ProfilBlokkok[BlokkKulcs] }
interface EllenorzottOrszag { kod: string; blokkok: EllenorzottBlokk[] }

/** Egy ország ellenőrzése; a hibák a `hibak` listába kerülnek, „<fájl>: <blokk>.<mező>: <üzenet>” alakban. */
function ellenoriz(fajl: string, o: DemoOrszag, ev: number, hibak: string[]): EllenorzottOrszag {
  const hiba = (s: string) => hibak.push(`${fajl}: ${s}`);
  const elvart = fajl.replace(/\.ts$/, '').toUpperCase();
  if (o.kod !== elvart) hiba(`a kód (${o.kod}) nem egyezik a fájlnévvel (${elvart})`);
  if (!orszagByKod(o.kod)) hiba(`ismeretlen országkód: ${o.kod}`);
  if (Object.keys(o.profil).length === 0) hiba('nincs egyetlen blokk sem');
  for (const k of Object.keys(o.profil)) if (!isBlokkKulcs(k)) hiba(`ismeretlen blokk: ${k}`);
  const blokkok: EllenorzottBlokk[] = [];
  for (const blokk of BLOKK_KULCSOK) {
    const u = o.profil[blokk];
    if (!u) continue;
    for (const h of szigoruHibak(blokk, u)) hiba(`${blokk}: ${h}`);
    const e = validalBlokk(blokk, urlapFormData(u), ev);
    if (e.ok) blokkok.push({ blokk, ertek: e.ertek });
    else for (const [mezo, uzenet] of Object.entries(e.errors)) hiba(`${blokk}.${mezo}: ${uzenet}`);
  }
  return { kod: o.kod, blokkok };
}

/** A `--csak` kódlistája (nagybetűsen), vagy null, ha nincs megadva. */
function csakKodok(): Set<string> | null {
  const i = process.argv.indexOf('--csak');
  if (i < 0) return null;
  const kodok = (process.argv[i + 1] ?? '').split(',').map((k) => k.trim().toUpperCase()).filter(Boolean);
  if (kodok.length === 0) throw new Error('A --csak után vesszős kódlista kell, pl. --csak DE,AT.');
  return new Set(kodok);
}

async function main() {
  const csak = csakKodok();
  const ev = aktualisEv();
  const minden = readdirSync(MAPPA).filter((f) => f.endsWith('.ts')).sort();
  const fajlok = csak ? minden.filter((f) => csak.has(f.replace(/\.ts$/, '').toUpperCase())) : minden;
  const hibak: string[] = [];
  if (csak) {
    for (const k of csak) if (!fajlok.includes(`${k.toLowerCase()}.ts`)) hibak.push(`nincs adatfájl: ${k.toLowerCase()}.ts`);
  }
  const orszagok: EllenorzottOrszag[] = [];
  for (const fajl of fajlok) {
    const mod = (await import(pathToFileURL(join(MAPPA, fajl)).href)) as { default?: DemoOrszag };
    if (!mod.default) hibak.push(`${fajl}: nincs default export`);
    else orszagok.push(ellenoriz(fajl, mod.default, ev, hibak));
  }
  if (hibak.length > 0) {
    console.error(`${hibak.length} hiba, a DB-be nem írtam:`);
    for (const h of hibak) console.error(`  ${h}`);
    process.exit(1);
  }
  if (csak) {
    for (const o of orszagok) console.log(`${o.kod}: ${o.blokkok.length} blokk rendben (${ev}), nem írtam a DB-be`);
    return;
  }
  // A DB-modulok csak íráskor töltődnek be: az ellenőrző mód meg sem nyitja az adatbázist.
  const { eq } = await import('drizzle-orm');
  const { db } = await import('../db');
  const { user } = await import('../db/schema');
  const { upsertBlokk } = await import('../db/queries/orszagprofil');
  // Az első admin: létrehozás szerint, azonos időnél id szerint (determinisztikus).
  const admin = db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, 'admin'))
    .orderBy(user.createdAt, user.id)
    .get();
  if (!admin) throw new Error('Nincs admin felhasználó (npm run db:seed).');
  db.transaction(() => {
    for (const o of orszagok) for (const b of o.blokkok) upsertBlokk(o.kod, ev, b.blokk, b.ertek, admin.id);
  });
  for (const o of orszagok) console.log(`${o.kod}: ${o.blokkok.length} blokk mentve ${ev}-ra (szerző: ${admin.name})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
