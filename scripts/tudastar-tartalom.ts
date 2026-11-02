/**
 * A TéT Tudástár kezdő tartalmának ellenőrzése és migrációvá írása. A tartalom kategóriánként egy fájl:
 * scripts/tudastar-tartalom/<kategoria-slug>.ts (default export: ForrasKategoria).
 *
 *   npx tsx scripts/tudastar-tartalom.ts                      – mind a 9 fájl ellenőrzése (a DB-t meg sem nyitja)
 *   npx tsx scripts/tudastar-tartalom.ts --csak egyetemek,…    – csak a megadott kategóriák fájljai
 *   npx tsx scripts/tudastar-tartalom.ts --sql <migráció.sql> – teljes ellenőrzés után megírja az INSERT-eket
 *
 * Ellenőrzés: a validátor (lib/tudastar-validacio.ts) és szigorúan minden, amit a validátor némán
 * megváltoztatna vagy eldobna – ismeretlen mező, nem kanonikus URL, teljesen üres sor, szélein szóközös
 * szöveg –, valamint a slug alakja, foglaltsága és egyedisége. `--sql` módban a fájlok `leiras`/`bevezeto`
 * szövegének egyeznie kell a lib/tudastar-szotar.ts-belivel. A migráció fájlját előbb a
 * `npx drizzle-kit generate --custom --name tudastar_kezdo_tartalom` hozza létre (a naplóbejegyzéssel).
 */
import { existsSync, readdirSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SLUG_MAX, SLUG_RE } from '../lib/slug';
import {
  FOGLALT_SLUGOK, SOR_MEZOK, TUDASTAR_KATEGORIAK, isKartyaTipus, type KartyaAdat, type SorMezoSzabaly,
} from '../lib/tudastar-szotar';
import { normalizalUrl, validalKartya } from '../lib/tudastar-validacio';
import { tisztitSzoveg } from '../lib/urlap';
import { kartyaFormData, type ForrasKartya, type ForrasKategoria } from './tudastar-tartalom/tipusok';

const MAPPA = resolve(process.cwd(), 'scripts/tudastar-tartalom');
const LEIRAS_MAX = 120;
const BEVEZETO_MAX = 900;

const KOZOS_MEZOK = ['slug', 'tipus', 'nev', 'rovidites', 'osszefoglalo', 'honlap', 'linkek'];
const TIPUS_MEZOK = {
  intezmeny: [...KOZOS_MEZOK, 'profil', 'tevekenyseg', 'kapcsolat', 'szakaszok', 'programok'],
  lista: [...KOZOS_MEZOK, 'sorok'],
};
/** Az objektum-mezők engedett almezői: a kapcsolat, és a dinamikus listák a szótár közös `SOR_MEZOK`-jából. */
const ALMEZOK: Record<string, readonly string[]> = {
  kapcsolat: ['email', 'telefon', 'cim'],
  ...Object.fromEntries(Object.entries(SOR_MEZOK).map(([lista, mezok]) => [lista, Object.keys(mezok)])),
};

interface Ellenorzott {
  kategoria: string;
  slug: string;
  sorrend: number;
  adat: KartyaAdat;
}

function forrasKategoriaE(v: unknown): v is ForrasKategoria {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.leiras === 'string' && typeof o.bevezeto === 'string' && Array.isArray(o.kartyak);
}

/** Minden szöveg a kártyában (útvonallal), a szigorú ellenőrzésekhez. */
function szovegek(v: unknown, ut: string): [string, string][] {
  if (typeof v === 'string') return [[ut, v]];
  if (Array.isArray(v)) return v.flatMap((x, i) => szovegek(x, `${ut}[${i}]`));
  if (typeof v === 'object' && v !== null) return Object.entries(v).flatMap(([k, x]) => szovegek(x, ut ? `${ut}.${k}` : k));
  return [];
}

/** Többsoros-e a mező (útvonal pl. `profil`, `szakaszok[1].szoveg`): ott a sortörés értékes, máshol a validátor szóközre cseréli. */
function tobbsorosE(ut: string): boolean {
  if (['osszefoglalo', 'profil', 'tevekenyseg'].includes(ut)) return true;
  const m = /^(\w+)\[\d+\]\.(\w+)$/.exec(ut);
  const szabalyok = m ? (SOR_MEZOK as Record<string, Record<string, SorMezoSzabaly>>)[m[1]] : undefined;
  return Boolean(m && szabalyok?.[m[2]]?.tobbsoros);
}

function szigoruHibak(k: ForrasKartya): string[] {
  const hibak: string[] = [];
  if (!isKartyaTipus(k.tipus)) return [`tipus: 'intezmeny' vagy 'lista' kell (${String(k.tipus)})`];
  const engedett = TIPUS_MEZOK[k.tipus];
  for (const kulcs of Object.keys(k)) if (!engedett.includes(kulcs)) hibak.push(`ismeretlen vagy a típushoz nem illő mező: ${kulcs}`);
  for (const [lista, mezok] of Object.entries(ALMEZOK)) {
    const ertek = (k as unknown as Record<string, unknown>)[lista];
    const elemek = lista === 'kapcsolat' ? (ertek ? [ertek] : []) : Array.isArray(ertek) ? ertek : [];
    elemek.forEach((e, i) => {
      if (typeof e !== 'object' || e === null) return hibak.push(`${lista}[${i}]: nem objektum`);
      for (const kulcs of Object.keys(e)) if (!mezok.includes(kulcs)) hibak.push(`${lista}[${i}]: ismeretlen mező: ${kulcs}`);
      if (lista !== 'kapcsolat' && Object.values(e).every((x) => x === '' || x === undefined)) {
        hibak.push(`${lista}[${i}]: teljesen üres sor (a validátor némán eldobná)`);
      }
    });
  }
  for (const [ut, v] of szovegek(k, '')) {
    if (tisztitSzoveg(v) !== v) hibak.push(`${ut}: a szöveg szélén szóköz vagy láthatatlan karakter áll`);
    if (v.includes('\n') && !tobbsorosE(ut)) hibak.push(`${ut}: egysoros mezőben sortörés áll (a validátor szóközre cserélné)`);
    if (/(^|\.)url$|^honlap$/.test(ut.replace(/\[\d+\]/g, '')) && v && normalizalUrl(v) !== v) {
      hibak.push(`${ut}: nem kanonikus URL (${v} → ${normalizalUrl(v) ?? 'érvénytelen'})`);
    }
  }
  if (!SLUG_RE.test(k.slug)) hibak.push(`slug: csak kisbetű, számjegy és kötőjel (${k.slug})`);
  if (k.slug.length > SLUG_MAX) hibak.push(`slug: legfeljebb ${SLUG_MAX} karakter (${k.slug.length})`);
  if (FOGLALT_SLUGOK.includes(k.slug)) hibak.push(`slug: foglalt útvonal-szegmens (${k.slug})`);
  return hibak;
}

function sqlSzoveg(v: string | null): string {
  return v === null ? 'NULL' : `'${v.replaceAll("'", "''")}'`;
}

function insert(e: Ellenorzott): string {
  const d = e.adat;
  const ertekek = [
    sqlSzoveg(crypto.randomUUID()), sqlSzoveg(e.kategoria), sqlSzoveg(e.slug), sqlSzoveg(d.tipus), sqlSzoveg(d.nev),
    sqlSzoveg(d.rovidites), sqlSzoveg(d.osszefoglalo), sqlSzoveg(d.honlap), String(e.sorrend), sqlSzoveg(JSON.stringify(d.tartalom)),
  ];
  return (
    'INSERT INTO `tudastar_kartya` (`id`, `kategoria`, `slug`, `tipus`, `nev`, `rovidites`, `osszefoglalo`, `honlap`, `sorrend`, `tartalom`) ' +
    `VALUES (${ertekek.join(', ')});`
  );
}

async function main() {
  const argv = process.argv.slice(2);
  const hasznalat = 'Használat: npx tsx scripts/tudastar-tartalom.ts [--csak <slug,…> | --sql <migráció.sql>]';
  let sqlFajl: string | null = null;
  let csak: Set<string> | null = null;
  if (argv.length === 2 && argv[0] === '--sql') sqlFajl = resolve(process.cwd(), argv[1]);
  else if (argv.length === 2 && argv[0] === '--csak') csak = new Set(argv[1].split(',').map((x) => x.trim()).filter(Boolean));
  else if (argv.length > 0) throw new Error(hasznalat);

  const hibak: string[] = [];
  const vart = new Set(TUDASTAR_KATEGORIAK.map((k) => `${k.slug}.ts`));
  if (csak) {
    for (const c of csak) if (!vart.has(`${c}.ts`)) hibak.push(`--csak: ismeretlen kategória: ${c}`);
  } else {
    for (const b of readdirSync(MAPPA)) {
      if (!vart.has(b) && b !== 'tipusok.ts' && b !== '.DS_Store') hibak.push(`${b}: nem kategória-fájl`);
    }
  }
  const ellenorzott: Ellenorzott[] = [];
  const slugok = new Map<string, string>();
  const osszegzes: string[] = [];
  for (const kat of TUDASTAR_KATEGORIAK) {
    if (csak && !csak.has(kat.slug)) continue;
    const fajl = `${kat.slug}.ts`;
    if (!existsSync(join(MAPPA, fajl))) {
      hibak.push(`${fajl}: hiányzik`);
      continue;
    }
    const mod = (await import(pathToFileURL(join(MAPPA, fajl)).href)) as { default?: unknown };
    if (!forrasKategoriaE(mod.default)) {
      hibak.push(`${fajl}: a default export nem ForrasKategoria (leiras, bevezeto: szöveg; kartyak: tömb)`);
      continue;
    }
    const forras = mod.default;
    if (!forras.leiras || forras.leiras.length > LEIRAS_MAX) hibak.push(`${fajl}: leiras: 1–${LEIRAS_MAX} karakter`);
    if (!forras.bevezeto || forras.bevezeto.length > BEVEZETO_MAX) hibak.push(`${fajl}: bevezeto: 1–${BEVEZETO_MAX} karakter`);
    if (sqlFajl && (forras.leiras !== kat.leiras || forras.bevezeto !== kat.bevezeto)) {
      hibak.push(`${fajl}: a leiras/bevezeto eltér a lib/tudastar-szotar.ts-belitől – előbb azt frissítsd`);
    }
    if (forras.kartyak.length === 0) hibak.push(`${fajl}: nincs egyetlen kártya sem`);
    forras.kartyak.forEach((k, i) => {
      const hol = `${fajl} [${i}] ${k.slug ?? '?'}`;
      for (const h of szigoruHibak(k)) hibak.push(`${hol}: ${h}`);
      const elozo = slugok.get(k.slug);
      if (elozo) hibak.push(`${hol}: a slug már szerepel itt: ${elozo}`);
      slugok.set(k.slug, hol);
      const e = validalKartya(kartyaFormData(kat.slug, k), k.tipus);
      if (!e.ok) {
        for (const [mezo, uzenet] of Object.entries(e.errors)) hibak.push(`${hol}: ${mezo}: ${uzenet}`);
        return;
      }
      ellenorzott.push({ kategoria: kat.slug, slug: k.slug, sorrend: i + 1, adat: e.data });
    });
    const intezmeny = forras.kartyak.filter((k) => k.tipus === 'intezmeny').length;
    osszegzes.push(`${kat.slug}: ${forras.kartyak.length} kártya (${intezmeny} intézmény, ${forras.kartyak.length - intezmeny} lista)`);
  }
  if (sqlFajl && !existsSync(sqlFajl)) {
    hibak.push(`${sqlFajl}: nincs ilyen fájl – előbb: npx drizzle-kit generate --custom --name tudastar_kezdo_tartalom`);
  }
  if (hibak.length > 0) {
    console.error(`${hibak.length} hiba:`);
    for (const h of hibak) console.error(`  ${h}`);
    process.exit(1);
  }
  for (const s of osszegzes) console.log(s);
  console.log(`Összesen ${ellenorzott.length} kártya rendben.`);
  if (!sqlFajl) return;
  const fej = '-- A TéT Tudástár kezdő tartalma: a scripts/tudastar-tartalom.ts --sql írta, kézzel ne szerkeszd.\n';
  writeFileSync(sqlFajl, `${fej}${ellenorzott.map(insert).join('\n--> statement-breakpoint\n')}\n`);
  console.log(`Megírva: ${sqlFajl}`);
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
