/**
 * A TéT Tudástár kezdő tartalmának ellenőrzése és migrációvá írása. A tartalom kategóriánként egy fájl:
 * scripts/tudastar-tartalom/<kategoria-slug>.ts (default export: ForrasKategoria).
 *
 *   npx tsx scripts/tudastar-tartalom.ts                      – mind a 9 fájl ellenőrzése (a DB-t meg sem nyitja)
 *   npx tsx scripts/tudastar-tartalom.ts --csak egyetemek,…    – csak a megadott kategóriák fájljai (a slugok
 *                                                               egyediségét is csak ezeken belül nézi)
 *   npx tsx scripts/tudastar-tartalom.ts --sql <migráció.sql> – teljes ellenőrzés után megírja az INSERT-eket
 *
 * Ellenőrzés: a validátor (lib/tudastar-validacio.ts) és szigorúan minden, amit a validátor némán
 * megváltoztatna vagy eldobna – ismeretlen vagy nem szöveges mező, nem kanonikus URL, teljesen üres sor, üres
 * listakártya, szélein szóközös vagy vezérlőkaraktert tartalmazó szöveg, sortörés egysoros mezőben –, valamint
 * a slug alakja, foglaltsága és egyedisége. `--sql` módban a fájlok `leiras`/`bevezeto` szövegének egyeznie kell
 * a lib/tudastar-szotar.ts-belivel, és csak a legutolsó, `drizzle-kit generate --custom` által létrehozott (vagy
 * e futtató által korábban megírt) migrációs fájlba ír – egy régebbi migrációt így nem írhat felül. A legutolsót
 * akkor is újraírhatja, ha helyben már lefutott: ez a push előtti javítás útja (lásd a tervet), push után tilos.
 */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { SLUG_MAX, SLUG_RE } from '../lib/slug';
import {
  FOGLALT_SLUGOK, SOR_MEZOK, TUDASTAR_KATEGORIAK, isKartyaTipus, type KartyaAdat, type SorMezoSzabaly,
} from '../lib/tudastar-szotar';
import { normalizalUrl, validalKartya } from '../lib/tudastar-validacio';
import { tisztitSzoveg } from '../lib/urlap';
import { kartyaFormData, type ForrasIntezmeny, type ForrasKartya, type ForrasKategoria, type ForrasLista } from './tudastar-tartalom/tipusok';

const MAPPA = resolve(process.cwd(), 'scripts/tudastar-tartalom');
const DRIZZLE = resolve(process.cwd(), 'drizzle');
const LEIRAS_MAX = 120;
const BEVEZETO_MAX = 900;
const HASZNALAT = 'Használat: npx tsx scripts/tudastar-tartalom.ts [--csak <slug,…> | --sql <migráció.sql>]';
const MIGRACIO_FEJ = '-- A TéT Tudástár kezdő tartalma: a scripts/tudastar-tartalom.ts --sql írta, kézzel ne szerkeszd.\n';
const DRIZZLE_URES = '-- Custom SQL migration file, put your code below! --';
const BREAKPOINT = '--> statement-breakpoint';

const KOZOS_MEZOK = ['slug', 'tipus', 'nev', 'rovidites', 'osszefoglalo', 'honlap', 'linkek'] as const;
const TIPUS_MEZOK = {
  intezmeny: [...KOZOS_MEZOK, 'profil', 'tevekenyseg', 'kapcsolat', 'szakaszok', 'programok'] satisfies (keyof ForrasIntezmeny)[],
  lista: [...KOZOS_MEZOK, 'sorok'] satisfies (keyof ForrasLista)[],
};
/** A többsoros felső szintű mezők; a sorok többsoros mezőit a `SOR_MEZOK` `tobbsoros` jelzője adja. */
const TOBBSOROS_MEZOK: readonly string[] = ['osszefoglalo', 'profil', 'tevekenyseg'];
/** Az objektum-mezők engedett almezői: a kapcsolat, és a dinamikus listák a szótár közös `SOR_MEZOK`-jából. */
const ALMEZOK: Record<string, readonly string[]> = {
  kapcsolat: ['email', 'telefon', 'cim'],
  ...Object.fromEntries(Object.entries(SOR_MEZOK).map(([lista, mezok]) => [lista, Object.keys(mezok)])),
};
const SOR_SZABALYOK = SOR_MEZOK as Record<string, Record<string, SorMezoSzabaly>>;

/** Használati hiba (rossz argumentum): csak az üzenetet írjuk ki, hívási lánc nélkül. */
class HasznalatiHiba extends Error {}

interface Ellenorzott {
  kategoria: string;
  slug: string;
  sorrend: number;
  adat: KartyaAdat;
}

/** Elfogadott: nincs argumentum, `--csak <lista>` / `--csak=<lista>`, `--sql <fájl>` / `--sql=<fájl>`. */
function argumentumok(argv: string[]): { csak: Set<string> | null; sqlFajl: string | null } {
  let csak: Set<string> | null = null;
  let sqlFajl: string | null = null;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    const [kapcsolo, egyben] = a.includes('=') ? [a.slice(0, a.indexOf('=')), a.slice(a.indexOf('=') + 1)] : [a, undefined];
    const ertek = egyben ?? argv[++i];
    if (kapcsolo === '--csak') {
      const lista = (ertek ?? '').split(',').map((x) => x.trim()).filter(Boolean);
      if (lista.length === 0) throw new HasznalatiHiba(`A --csak után vesszős kategória-lista kell.\n${HASZNALAT}`);
      csak = new Set(lista);
    } else if (kapcsolo === '--sql') {
      if (!ertek) throw new HasznalatiHiba(`A --sql után a migrációs fájl útvonala kell.\n${HASZNALAT}`);
      sqlFajl = resolve(process.cwd(), ertek);
    } else {
      throw new HasznalatiHiba(`Ismeretlen argumentum: ${a}\n${HASZNALAT}`);
    }
  }
  if (csak && sqlFajl) throw new HasznalatiHiba('A --sql csak teljes ellenőrzéssel futhat (--csak nélkül).');
  return { csak, sqlFajl };
}

/** A betöltési (fordítási vagy futásidejű) hiba első érdemi sora, a mappa útvonala nélkül. */
function betoltesiHiba(err: unknown): string {
  const sorok = (err instanceof Error ? err.message : String(err)).split('\n').map((s) => s.trim()).filter(Boolean);
  const sor = sorok.find((s) => s.includes('ERROR:')) ?? sorok[0] ?? 'ismeretlen hiba';
  return sor.replace(`${MAPPA}/`, '');
}

function forrasKategoriaE(v: unknown): v is ForrasKategoria {
  if (typeof v !== 'object' || v === null) return false;
  const o = v as Record<string, unknown>;
  return typeof o.leiras === 'string' && typeof o.bevezeto === 'string' && Array.isArray(o.kartyak);
}

/** Minden levél-érték a kártyában (útvonallal), a szigorú ellenőrzésekhez. */
function levelek(v: unknown, ut: string): [string, unknown][] {
  if (Array.isArray(v)) return v.flatMap((x, i) => levelek(x, `${ut}[${i}]`));
  if (typeof v === 'object' && v !== null) return Object.entries(v).flatMap(([k, x]) => levelek(x, ut ? `${ut}.${k}` : k));
  return [[ut, v]];
}

/** A mező szabálya az útvonalából (pl. `sorok[0].url` → a `sorok.url` szabálya); felső szintű mezőre undefined. */
function sorSzabaly(ut: string): SorMezoSzabaly | undefined {
  const m = /^(\w+)\[\d+\]\.(\w+)$/.exec(ut);
  return m ? SOR_SZABALYOK[m[1]]?.[m[2]] : undefined;
}

function szigoruHibak(k: ForrasKartya): string[] {
  const r = k as unknown as Record<string, unknown>;
  if (typeof r.slug !== 'string') return ['slug: kötelező szöveg'];
  if (!isKartyaTipus(r.tipus)) return [`tipus: 'intezmeny' vagy 'lista' kell (${String(r.tipus)})`];
  const hibak: string[] = [];
  const engedett: readonly string[] = TIPUS_MEZOK[k.tipus];
  for (const kulcs of Object.keys(r)) if (!engedett.includes(kulcs)) hibak.push(`ismeretlen vagy a típushoz nem illő mező: ${kulcs}`);
  for (const [lista, mezok] of Object.entries(ALMEZOK)) {
    const ertek = r[lista];
    if (ertek === undefined) continue;
    if (lista === 'kapcsolat') {
      if (typeof ertek !== 'object' || ertek === null || Array.isArray(ertek)) hibak.push('kapcsolat: objektum kell');
      else for (const kulcs of Object.keys(ertek)) if (!mezok.includes(kulcs)) hibak.push(`kapcsolat: ismeretlen mező: ${kulcs}`);
      continue;
    }
    if (!Array.isArray(ertek)) {
      hibak.push(`${lista}: tömb kell`);
      continue;
    }
    ertek.forEach((e, i) => {
      if (typeof e !== 'object' || e === null || Array.isArray(e)) return hibak.push(`${lista}[${i}]: objektum kell`);
      for (const kulcs of Object.keys(e)) if (!mezok.includes(kulcs)) hibak.push(`${lista}[${i}]: ismeretlen mező: ${kulcs}`);
      if (Object.values(e).every((x) => x === '' || x === undefined)) hibak.push(`${lista}[${i}]: teljesen üres sor (a validátor némán eldobná)`);
    });
  }
  if (k.tipus === 'lista' && !(k.sorok?.length || k.linkek?.length)) hibak.push('üres listakártya: nincs egy sora és egy linkje sem');
  for (const [ut, v] of levelek(r, '')) {
    // Az ismeretlen mezőt fent már jeleztük; a levelei itt nem adnak újabb hibát.
    if (v === undefined || !engedett.includes(ut.split(/[.[]/)[0])) continue;
    if (typeof v !== 'string') {
      hibak.push(`${ut}: szöveg kell (${typeof v})`);
      continue;
    }
    if (tisztitSzoveg(v) !== v) hibak.push(`${ut}: a szöveg szélén szóköz áll, vagy láthatatlan/vezérlőkarakter (pl. CR) van benne`);
    const szabaly = sorSzabaly(ut);
    const tobbsoros = TOBBSOROS_MEZOK.includes(ut) || Boolean(szabaly?.tobbsoros);
    if (v.includes('\n') && !tobbsoros) hibak.push(`${ut}: egysoros mezőben sortörés áll (a validátor szóközre cserélné)`);
    if (v.includes(BREAKPOINT)) hibak.push(`${ut}: a szöveg nem tartalmazhatja a migráció-elválasztó „${BREAKPOINT}” jelet`);
    // Érvénytelen URL-t a validátor jelez; itt csak az érvényes, de nem kanonikus alak hiba.
    const url = (ut === 'honlap' || szabaly?.url) && v ? normalizalUrl(v) : null;
    if (url !== null && url !== v) hibak.push(`${ut}: nem kanonikus URL (${v} → ${url})`);
  }
  if (!SLUG_RE.test(k.slug)) hibak.push(`slug: csak kisbetű, számjegy és kötőjel (${k.slug})`);
  if (k.slug.length > SLUG_MAX) hibak.push(`slug: legfeljebb ${SLUG_MAX} karakter (${k.slug.length})`);
  if (FOGLALT_SLUGOK.includes(k.slug)) hibak.push(`slug: foglalt útvonal-szegmens (${k.slug})`);
  return hibak;
}

/**
 * Az `--sql` célfájlja: csak a napló legutolsó migrációja lehet, és csak akkor, ha még a drizzle-kit üres
 * helykitöltője, vagy e futtató írta (újragenerálás a commit előtt). Hibánál az üzenet, egyébként null.
 */
function sqlCelHiba(sqlFajl: string): string | null {
  const naplo = JSON.parse(readFileSync(join(DRIZZLE, 'meta/_journal.json'), 'utf8')) as { entries: { tag: string }[] };
  const utolso = naplo.entries.at(-1)?.tag;
  const vart = utolso ? join(DRIZZLE, `${utolso}.sql`) : null;
  if (sqlFajl !== vart) {
    return `--sql: csak a napló legutolsó migrációjába írhat (${vart ? relative(process.cwd(), vart) : 'üres napló'}); előbb: npx drizzle-kit generate --custom --name tudastar_kezdo_tartalom`;
  }
  if (!existsSync(sqlFajl)) return `${relative(process.cwd(), sqlFajl)}: nincs ilyen fájl`;
  const tartalom = readFileSync(sqlFajl, 'utf8');
  if (tartalom.trim() !== DRIZZLE_URES && !tartalom.startsWith(MIGRACIO_FEJ)) {
    return `${relative(process.cwd(), sqlFajl)}: nem üres egyedi migráció és nem e futtató írta – nem írom felül`;
  }
  return null;
}

function sqlSzoveg(v: string | null): string {
  return v === null ? 'NULL' : `'${v.replaceAll("'", "''")}'`;
}

/** Determinisztikus id a slugból (UUID-alakú): az újragenerált migráció így csak a valóban változott sorokban tér el. */
function kartyaId(slug: string): string {
  const h = createHash('sha256').update(`tudastar:${slug}`).digest('hex');
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20, 32)}`;
}

function insert(e: Ellenorzott): string {
  const d = e.adat;
  const ertekek = [
    sqlSzoveg(kartyaId(e.slug)), sqlSzoveg(e.kategoria), sqlSzoveg(e.slug), sqlSzoveg(d.tipus), sqlSzoveg(d.nev),
    sqlSzoveg(d.rovidites), sqlSzoveg(d.osszefoglalo), sqlSzoveg(d.honlap), String(e.sorrend), sqlSzoveg(JSON.stringify(d.tartalom)),
  ];
  return (
    'INSERT INTO `tudastar_kartya` (`id`, `kategoria`, `slug`, `tipus`, `nev`, `rovidites`, `osszefoglalo`, `honlap`, `sorrend`, `tartalom`) ' +
    `VALUES (${ertekek.join(', ')});`
  );
}

async function main() {
  const { csak, sqlFajl } = argumentumok(process.argv.slice(2));
  const hibak: string[] = [];
  const vart = new Set(TUDASTAR_KATEGORIAK.map((k) => `${k.slug}.ts`));
  if (csak) {
    for (const c of csak) if (!vart.has(`${c}.ts`)) hibak.push(`--csak: ismeretlen kategória: ${c}`);
  } else {
    for (const b of readdirSync(MAPPA).sort()) {
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
    let mod: { default?: unknown };
    try {
      mod = (await import(pathToFileURL(join(MAPPA, fajl)).href)) as { default?: unknown };
    } catch (err) {
      // Egy nem betölthető fájl nem takarhatja el a többi fájl hibáit.
      hibak.push(`${fajl}: nem tölthető be: ${betoltesiHiba(err)}`);
      continue;
    }
    if (mod.default === undefined) {
      hibak.push(`${fajl}: nincs default export`);
      continue;
    }
    if (!forrasKategoriaE(mod.default)) {
      hibak.push(`${fajl}: a default export nem ForrasKategoria (leiras, bevezeto: szöveg; kartyak: tömb)`);
      continue;
    }
    const forras = mod.default;
    if (!forras.leiras || forras.leiras.length > LEIRAS_MAX) hibak.push(`${fajl}: leiras: 1–${LEIRAS_MAX} karakter (most ${forras.leiras.length})`);
    if (!forras.bevezeto || forras.bevezeto.length > BEVEZETO_MAX) hibak.push(`${fajl}: bevezeto: 1–${BEVEZETO_MAX} karakter (most ${forras.bevezeto.length})`);
    if (sqlFajl) {
      const elter = [forras.leiras !== kat.leiras && 'leiras', forras.bevezeto !== kat.bevezeto && 'bevezeto'].filter(Boolean);
      if (elter.length > 0) hibak.push(`${fajl}: a ${elter.join(' és a ')} eltér a lib/tudastar-szotar.ts-belitől – előbb azt frissítsd`);
    }
    if (forras.kartyak.length === 0) hibak.push(`${fajl}: nincs egyetlen kártya sem`);
    forras.kartyak.forEach((k, i) => {
      const hol = `${fajl} [${i}] ${typeof k?.slug === 'string' ? k.slug : '?'}`;
      if (typeof k !== 'object' || k === null) return hibak.push(`${hol}: a kártya nem objektum`);
      for (const h of szigoruHibak(k)) hibak.push(`${hol}: ${h}`);
      if (typeof k.slug === 'string') {
        const elozo = slugok.get(k.slug);
        if (elozo) hibak.push(`${hol}: a slug már szerepel itt: ${elozo}`);
        slugok.set(k.slug, hol);
      }
      if (!isKartyaTipus(k.tipus)) return;
      const e = validalKartya(kartyaFormData(kat.slug, k), k.tipus);
      if (!e.ok) {
        for (const [mezo, uzenet] of Object.entries(e.errors)) hibak.push(`${hol}: ${mezo}: ${uzenet}`);
        return;
      }
      ellenorzott.push({ kategoria: kat.slug, slug: k.slug, sorrend: i + 1, adat: e.data });
    });
    const intezmeny = forras.kartyak.filter((k) => k?.tipus === 'intezmeny').length;
    osszegzes.push(`${kat.slug}: ${forras.kartyak.length} kártya (${intezmeny} intézmény, ${forras.kartyak.length - intezmeny} lista)`);
  }
  if (sqlFajl) {
    const h = sqlCelHiba(sqlFajl);
    if (h) hibak.push(h);
  }
  if (hibak.length > 0) {
    console.error(`${hibak.length} hiba:`);
    for (const h of hibak) console.error(`  ${h}`);
    process.exit(1);
  }
  for (const s of osszegzes) console.log(s);
  console.log(`Összesen ${ellenorzott.length} kártya rendben.`);
  if (!sqlFajl) return;
  writeFileSync(sqlFajl, `${MIGRACIO_FEJ}${ellenorzott.map(insert).join(`\n${BREAKPOINT}\n`)}\n`);
  console.log(`Megírva: ${relative(process.cwd(), sqlFajl)}`);
}

main().catch((err) => {
  console.error(err instanceof HasznalatiHiba ? err.message : err);
  process.exit(1);
});
