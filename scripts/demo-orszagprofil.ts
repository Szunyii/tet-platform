/**
 * Demó országprofilok a 2026-os évre: az attasék országainak valós, kutatott adatai a
 * DATABASE_URL (alapért. ./data/tet.db) DB-be. Országonként egy adatfájl:
 * scripts/demo-orszagprofil/orszagok/<kod>.ts (két kisbetű; export default DemoOrszag).
 *
 * Három mód; alapból csak ellenőriz, írni kizárólag az --ir-rel lehet:
 *   (nincs argumentum)  az összes országfájlt ellenőrzi, a DB-t meg sem nyitja; hibátlan adatnál
 *                       az „Íráshoz: --ir” tippet írja ki
 *   --csak DE,AT        csak a megadott országokat ellenőrzi, a DB-t meg sem nyitja (a --csak=DE,AT
 *                       alak is jó); a többi fájl hibáit nem látja, így a párhuzamos csomagok
 *                       nem zavarják egymást
 *   --ir                az összes országfájlt ellenőrzi, és csak hibátlan adatnál ír, egyetlen
 *                       tranzakcióban; a --csak mellé nem adható, mert írni csak az összes ország
 *                       együttes ellenőrzése után szabad
 * Bármi más argumentum használati hiba: egy elgépelt kapcsoló (pl. -csak) nem okozhat írást.
 *
 * Az ellenőrzés a `validalBlokk` (ahogy az űrlapot) és szigorúbb is: ami a validátornak némán
 * elveszne, kicserélődne vagy félreolvasódna, az itt hiba:
 *   - ismeretlen mezőnév;
 *   - szótáron kívüli listás opció vagy rendezvénytípus;
 *   - hibás rendezvény-index (nem 0–9, vagy vezető nullával) vagy hiányos rendezvénysor (a nev és
 *     a tipus is kell, üres sor nincs);
 *   - nem szöveg (vagy szöveglista) érték;
 *   - pontot tartalmazó szám (magyar formátum kell: tizedesvessző, ezres tagolás szóközzel);
 *   - üres blokk (mentve kitöltöttnek számítana a térképen; adat nélkül hagyd ki a blokkot).
 * Teljes ellenőrzésnél az orszagok/ mappában minden bejegyzés (a .DS_Store kivételével) <kod>.ts
 * (két kisbetű) nevű országfájl kell legyen, és a benne lévő kód egyezzen a fájlnévvel; egy nem
 * betölthető fájl nem takarja el a többi hibáit.
 *
 * Az írás blokkonként upsert: a meg nem adott blokkhoz nem nyúl (részleges profil), és blokkot
 * sosem töröl – ezért az --ir figyelmeztet, ha a DB-ben van olyan mentett blokk, ami a fájlban
 * nincs. Idempotens; a szerző az első admin. Az év rögzített (EV): a kutatás a 2026-os állapotot
 * rögzíti, egy későbbi újrafuttatás nem datálhatja át.
 *
 * Futtatás: NODE_OPTIONS="--conditions=react-server" npx tsx scripts/demo-orszagprofil.ts [--csak DE,AT | --ir]
 */
import { readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { orszagByKod } from '../lib/orszagok';
import {
  AGAZATOK, BLOKK_KULCSOK, KFI_PRIORITASOK, MEZO_CIMKEK, RENDEZVENY_MAX, RENDEZVENY_TIPUSOK,
  TAGSAGOK, isBlokkKulcs, type BlokkKulcs, type ProfilBlokkok,
} from '../lib/orszagprofil-szotar';
import { validalBlokk } from '../lib/orszagprofil-validacio';
import { tisztitSzoveg } from '../lib/urlap';
import { urlapFormData, type DemoOrszag } from './demo-orszagprofil/tipusok';

/** A profilok éve: a kutatás a 2026-os állapotot rögzíti, ezért nem az aktuális évből számoljuk. */
const EV = 2026;
const MAPPA = resolve(process.cwd(), 'scripts/demo-orszagprofil/orszagok');
const ORSZAGFAJL = /^[a-z]{2}\.ts$/;

/**
 * Listás mezők engedett opciói blokkonként: a validátor a szótáron kívülit némán eldobná. A kulcsok típusosak.
 * A három ágazat-mezőnél a régi név (`REGI_AGAZAT_NEVEK`) is hiba: a validátor megfeleltetné, de az
 * országfájlokban csak a közös lista nevei állhatnak.
 */
const LISTAK: { [K in BlokkKulcs]?: Partial<Record<keyof ProfilBlokkok[K], readonly string[]>> } = {
  alapadatok: { tagsagok: TAGSAGOK, agazatok: AGAZATOK },
  kfiRendszer: { prioritasok: KFI_PRIORITASOK, kiemeltIparagak: AGAZATOK },
  vallalati: { kiemeltAgazatok: AGAZATOK },
};
/** Számmezők blokkonként: magyar formátum kell, a validátor az „1.234”-et némán 1234-nek venné. A kulcsok típusosak. */
const SZAM_MEZOK: { [K in BlokkKulcs]?: readonly (keyof ProfilBlokkok[K])[] } = {
  alapadatok: ['terulet', 'lakossag', 'gdp', 'gdpEgyFore', 'gdpNovekedes', 'adatEv'],
  kfiRendszer: ['gerd'],
};
/** A rendezvény-index vezető nulla nélkül: a validátor csak a `rendezveny.1.*`-t olvassa, a `.01.`-et nem. */
const RENDEZVENY_MEZO = /^rendezveny\.(0|[1-9]\d*)\.(nev|tipus|idopont|megjegyzes)$/;
const TIPUS_KULCSOK: readonly string[] = RENDEZVENY_TIPUSOK.map((t) => t.kulcs);
const URES_BLOKK = 'üres blokk (egyetlen mező sincs kitöltve), mentve mégis kitöltöttnek számítana: hagyd ki a blokkot';

/** Használati hiba (rossz argumentum): csak az üzenetet írjuk ki, hívási lánc nélkül. */
class HasznalatiHiba extends Error {}

const HASZNALAT = 'Használat: npx tsx scripts/demo-orszagprofil.ts [--csak DE,AT | --ir]';

interface Argumentumok {
  /** A --csak kódjai nagybetűsen, vagy null: minden országfájl. */
  csak: Set<string> | null;
  /** Igaz, ha írni kell a DB-be (--ir). */
  ir: boolean;
}

/** Elfogadott: nincs argumentum, `--csak <kódok>`, `--csak=<kódok>`, `--ir`; minden más használati hiba. */
function argumentumok(argv: string[]): Argumentumok {
  let csak: Set<string> | null = null;
  let ir = false;
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--ir') {
      if (ir) throw new HasznalatiHiba('Az --ir kétszer szerepel.');
      ir = true;
    } else if (a === '--csak' || a.startsWith('--csak=')) {
      if (csak) throw new HasznalatiHiba('A --csak kétszer szerepel.');
      let lista = a.slice('--csak='.length);
      if (a === '--csak') {
        // A következő argumentum a lista, ha van és nem kapcsoló (a „--csak --ir” üres lista, nem kód).
        const kovetkezo = argv[i + 1];
        lista = kovetkezo !== undefined && !kovetkezo.startsWith('-') ? kovetkezo : '';
        if (lista) i++;
      }
      const kodok = lista.split(',').map((k) => k.trim().toUpperCase()).filter(Boolean);
      if (kodok.length === 0) throw new HasznalatiHiba('A --csak után vesszős kódlista kell, pl. --csak DE,AT.');
      csak = new Set(kodok);
    } else {
      throw new HasznalatiHiba(`Ismeretlen argumentum: ${a}\n${HASZNALAT}`);
    }
  }
  if (ir && csak) {
    throw new HasznalatiHiba('Az --ir nem adható a --csak mellé: írni csak az összes ország együttes ellenőrzése után szabad.');
  }
  return { csak, ir };
}

/** Egy hiba: a mező neve (blokk-szintű hibánál üres) és az üzenet. */
type Hiba = [mezo: string, uzenet: string];

/** A mező értéke, ha szöveg vagy szöveglista; különben null (a FormData mást szöveggé alakítana: undefined → „undefined”). */
function szovegesErtek(v: unknown): string | string[] | null {
  if (typeof v === 'string') return v;
  if (Array.isArray(v) && v.every((x): x is string => typeof x === 'string')) return v;
  return null;
}

function nemSzoveg(v: unknown): string {
  if (Array.isArray(v)) return 'a lista minden eleme szöveg kell legyen';
  return `szöveg (vagy szöveglista) kell, nem ${v === null ? 'null' : typeof v}`;
}

/** Igaz, ha az érték sehol nem hordoz adatot: üres szöveg, null, üres lista (rekurzívan); a 0 szám adat. */
function uresE(v: unknown): boolean {
  if (v === null || v === undefined) return true;
  if (typeof v === 'string') return v === '';
  if (Array.isArray(v)) return v.every(uresE);
  if (typeof v === 'object') return Object.values(v).every(uresE);
  return false;
}

/** Egy rendezvény-blokk szigorú ellenőrzése: index, típus, a sorok teljessége. */
function rendezvenyHibak(u: Record<string, unknown>): Hiba[] {
  const hibak: Hiba[] = [];
  // Index → a megadott mezők tisztított értéke (nem szöveges értéknél '': arra már külön hibát jelzünk).
  const sorok = new Map<number, Record<string, string>>();
  for (const [mezo, nyers] of Object.entries(u)) {
    const m = RENDEZVENY_MEZO.exec(mezo);
    if (!m) {
      hibak.push([mezo, 'ismeretlen mező']);
      continue;
    }
    const index = Number(m[1]);
    if (index >= RENDEZVENY_MAX) {
      hibak.push([mezo, `legfeljebb ${RENDEZVENY_MAX} rendezvény (index 0–${RENDEZVENY_MAX - 1})`]);
      continue;
    }
    const sor = sorok.get(index) ?? {};
    sorok.set(index, sor);
    const ertek = szovegesErtek(nyers);
    sor[m[2]] = typeof ertek === 'string' ? tisztitSzoveg(ertek) : '';
    if (ertek === null) hibak.push([mezo, nemSzoveg(nyers)]);
    else if (Array.isArray(ertek)) hibak.push([mezo, 'egy érték kell, nem lista']);
    else if (m[2] === 'tipus' && !TIPUS_KULCSOK.includes(ertek)) {
      hibak.push([mezo, `ismeretlen típus „${ertek}” (${TIPUS_KULCSOK.join(', ')})`]);
    }
  }
  // A validátor minden megadott sort a nev, idopont és megjegyzes alapján tart meg vagy dob el, a hiányzó
  // tipus-t pedig forum-ra cseréli: ezért minden sornál mindkét kulcs kell, és a sor nem lehet üres.
  for (const [index, sor] of [...sorok].sort(([a], [b]) => a - b)) {
    const p = `rendezveny.${index}.`;
    if (!('nev' in sor)) hibak.push([p + 'nev', 'hiányzik: a sorhoz név kell, különben a validátor eldobja']);
    else if (!sor.nev && !sor.idopont && !sor.megjegyzes) {
      hibak.push([p + 'nev', 'üres rendezvénysor (név, időpont és megjegyzés nélkül): a validátor eldobja']);
    }
    if (!('tipus' in sor)) hibak.push([p + 'tipus', 'hiányzik: típus nélkül a validátor forum-ra cserélné']);
  }
  return hibak;
}

/** Egy (nem rendezvény) blokk szigorú ellenőrzése: mezőnév, érték típusa, listás opciók, számformátum. */
function mezoHibak(blokk: BlokkKulcs, u: Record<string, unknown>): Hiba[] {
  const hibak: Hiba[] = [];
  const mezok: readonly string[] = Object.keys(MEZO_CIMKEK[blokk]);
  const listak: Record<string, readonly string[] | undefined> = LISTAK[blokk] ?? {};
  const szamok: readonly string[] = SZAM_MEZOK[blokk] ?? [];
  for (const [mezo, nyers] of Object.entries(u)) {
    if (!mezok.includes(mezo)) {
      hibak.push([mezo, 'ismeretlen mező']);
      continue;
    }
    const ertek = szovegesErtek(nyers);
    if (ertek === null) {
      hibak.push([mezo, nemSzoveg(nyers)]);
      continue;
    }
    const engedett = listak[mezo];
    if (engedett) {
      if (!Array.isArray(ertek)) hibak.push([mezo, 'lista kell']);
      else for (const x of ertek) if (!engedett.includes(x)) hibak.push([mezo, `szótáron kívüli opció „${x}”`]);
    } else if (Array.isArray(ertek)) {
      hibak.push([mezo, 'egy érték kell, nem lista']);
    } else if (szamok.includes(mezo) && ertek.includes('.')) {
      hibak.push([mezo, `a szám pontot tartalmaz („${ertek}”): magyar formátum kell, tizedesvesszővel és szóközös ezres tagolással`]);
    }
  }
  return hibak;
}

/** A validátoron túli ellenőrzés: amit a validátor némán eldobna, kicserélne vagy félreolvasna, az itt hiba. */
function szigoruHibak(blokk: BlokkKulcs, u: Record<string, unknown>): Hiba[] {
  return blokk === 'rendezvenyek' ? rendezvenyHibak(u) : mezoHibak(blokk, u);
}

interface EllenorzottBlokk { blokk: BlokkKulcs; ertek: ProfilBlokkok[BlokkKulcs] }
interface EllenorzottOrszag { kod: string; blokkok: EllenorzottBlokk[] }

/** A default export alakja; ennél mélyebbre a blokkonkénti ellenőrzés lát. */
function demoOrszagE(v: unknown): v is DemoOrszag {
  if (typeof v !== 'object' || v === null) return false;
  const { kod, profil } = v as { kod?: unknown; profil?: unknown };
  return typeof kod === 'string' && typeof profil === 'object' && profil !== null && !Array.isArray(profil);
}

/** Egy ország ellenőrzése; a hibák a `hibak` listába kerülnek, „<fájl>: <blokk>.<mező>: <üzenet>” alakban. */
function ellenoriz(fajl: string, o: DemoOrszag, hibak: string[]): EllenorzottOrszag {
  // hely: üres (fájl-szintű hiba), „<blokk>” vagy „<blokk>.<mező>”.
  const hiba = (hely: string, uzenet: string) => hibak.push(hely ? `${fajl}: ${hely}: ${uzenet}` : `${fajl}: ${uzenet}`);
  const elvart = fajl.slice(0, 2).toUpperCase();
  if (o.kod !== elvart) hiba('', `a kód (${o.kod}) nem egyezik a fájlnévvel (${elvart})`);
  if (!orszagByKod(o.kod)) hiba('', `ismeretlen országkód: ${o.kod}`);
  for (const k of Object.keys(o.profil)) if (!isBlokkKulcs(k)) hiba(k, 'ismeretlen blokk');
  if (!BLOKK_KULCSOK.some((k) => o.profil[k] != null)) hiba('', 'nincs egyetlen blokk sem');
  const blokkok: EllenorzottBlokk[] = [];
  for (const blokk of BLOKK_KULCSOK) {
    const u = o.profil[blokk];
    if (u == null) continue;
    if (typeof u !== 'object' || Array.isArray(u)) {
      hiba(blokk, 'objektum kell (mezőnév → érték)');
      continue;
    }
    const blokkHibak = szigoruHibak(blokk, u);
    const e = validalBlokk(blokk, urlapFormData(u), EV);
    if (!e.ok) blokkHibak.push(...Object.entries(e.errors));
    else if (blokkHibak.length === 0) {
      // Üres blokkot csak akkor jelzünk, ha más baja nincs: egy elgépelt mezőnév miatt üresen maradó blokk
      // gyökérokát (az ismeretlen mezőt) már jeleztük.
      if (uresE(e.ertek)) blokkHibak.push(['', URES_BLOKK]);
      else blokkok.push({ blokk, ertek: e.ertek });
    }
    for (const [mezo, uzenet] of blokkHibak) hiba(mezo ? `${blokk}.${mezo}` : blokk, uzenet);
  }
  return { kod: o.kod, blokkok };
}

/** A betöltési hiba beszédes sora: esbuild-hibánál az `ERROR:` sor (az első sor csak „Transform failed…”), különben az első sor. */
function betoltesiHiba(err: unknown): string {
  const sorok = (err instanceof Error ? err.message : String(err)).split('\n').map((s) => s.trim()).filter(Boolean);
  const sor = sorok.find((s) => s.includes('ERROR:')) ?? sorok[0] ?? 'ismeretlen hiba';
  return sor.replace(`${MAPPA}/`, '');
}

async function main() {
  const { csak, ir } = argumentumok(process.argv.slice(2));
  const bejegyzesek = readdirSync(MAPPA).sort();
  const hibak: string[] = [];
  // Teljes ellenőrzésnél minden idegen bejegyzés hiba; --csak módban a párhuzamos csomagok furcsaságai nem látszanak.
  if (!csak) {
    for (const b of bejegyzesek) {
      if (!ORSZAGFAJL.test(b) && b !== '.DS_Store') hibak.push(`${b}: nem országfájl (két kisbetű + .ts kell, pl. de.ts)`);
    }
  }
  const orszagFajlok = bejegyzesek.filter((b) => ORSZAGFAJL.test(b));
  const fajlok = csak ? orszagFajlok.filter((f) => csak.has(f.slice(0, 2).toUpperCase())) : orszagFajlok;
  if (csak) {
    for (const k of csak) if (!fajlok.includes(`${k.toLowerCase()}.ts`)) hibak.push(`nincs adatfájl: ${k.toLowerCase()}.ts`);
  } else if (fajlok.length === 0) {
    hibak.push('nincs egyetlen országfájl sem');
  }
  const orszagok: EllenorzottOrszag[] = [];
  for (const fajl of fajlok) {
    let mod: { default?: unknown };
    try {
      mod = (await import(pathToFileURL(join(MAPPA, fajl)).href)) as { default?: unknown };
    } catch (err) {
      hibak.push(`${fajl}: nem tölthető be: ${betoltesiHiba(err)}`);
      continue;
    }
    if (mod.default === undefined) hibak.push(`${fajl}: nincs default export`);
    else if (!demoOrszagE(mod.default)) hibak.push(`${fajl}: a default export nem DemoOrszag (kod: szöveg és profil: objektum kell)`);
    else orszagok.push(ellenoriz(fajl, mod.default, hibak));
  }
  if (hibak.length > 0) {
    console.error(`${hibak.length} hiba, a DB-be nem írtam:`);
    for (const h of hibak) console.error(`  ${h}`);
    process.exit(1);
  }
  if (!ir) {
    for (const o of orszagok) console.log(`${o.kod}: ${o.blokkok.length} blokk rendben (${EV}), nem írtam a DB-be`);
    if (!csak) console.log('Íráshoz: --ir');
    return;
  }
  // A DB-modulok csak íráskor töltődnek be: az ellenőrző módok meg sem nyitják az adatbázist.
  const { eq } = await import('drizzle-orm');
  const { db } = await import('../db');
  const { user } = await import('../db/schema');
  const { getProfil, upsertBlokk } = await import('../db/queries/orszagprofil');
  // Az első admin: létrehozás szerint, azonos időnél id szerint (determinisztikus).
  const admin = db
    .select({ id: user.id, name: user.name })
    .from(user)
    .where(eq(user.role, 'admin'))
    .orderBy(user.createdAt, user.id)
    .get();
  if (!admin) throw new Error('Nincs admin felhasználó (npm run db:seed).');
  db.transaction(() => {
    for (const o of orszagok) for (const b of o.blokkok) upsertBlokk(o.kod, EV, b.blokk, b.ertek, admin.id);
  });
  for (const o of orszagok) {
    console.log(`${o.kod}: ${o.blokkok.length} blokk mentve ${EV}-ra (szerző: ${admin.name})`);
    // A futtató nem töröl blokkot: a fájlból kimaradt, de a DB-ben már mentett blokk elavultan maradna.
    const fajlban = new Set<BlokkKulcs>(o.blokkok.map((b) => b.blokk));
    const maradt = (getProfil(o.kod, EV)?.mentett ?? []).filter((k) => !fajlban.has(k));
    if (maradt.length > 0) console.log(`  FIGYELEM: ${o.kod}: a DB-ben ez is mentett, de a fájlban nincs: ${maradt.join(', ')}`);
  }
}

main().catch((err) => {
  console.error(err instanceof HasznalatiHiba ? err.message : err);
  process.exit(1);
});
