# TéT Tudástár – megvalósítási terv

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Cél:** a mai demó tudástár helyett a „TéT Tudástár”: 9 rögzített kategória, alattuk admin által szerkeszthető intézmény- és listakártyák a DB-ben, kategória- és részletoldalakkal, jobb oldali kategória-menüvel és kereséssel; utána kutatott kezdő tartalom egyszeri migrációval.

**Architektúra:** a 9 kategória a kódban (`lib/tudastar-szotar.ts`), a kártyák egy táblában (`tudastar_kartya`), típusonként más alakú JSON `tartalom` oszloppal és olvasáskori normalizálóval – az országprofil mintája. Server Component oldalak (`/tudastar`, `/tudastar/[kategoria]`, `/tudastar/[kategoria]/[slug]`), egy kliens-oldali szerkesztő (`KartyaForm`) és egy `actions.ts`. A keresés tiszta JS-függvény a betöltött kártyákon.

**Tech stack:** Next.js 16 App Router (Server Components, server actions, `next/form`), React 19, TypeScript, Drizzle + better-sqlite3, shadcn/ui (Base UI), Tailwind v4.

**Spec:** `docs/superpowers/specs/2026-11-02-tet-tudastar-design.md` (a terv végén lévő „Eltérések a spectől” szakaszt a 7. task átvezeti a specbe).

---

## Tudnivalók a végrehajtóknak

- **Ág:** `tet-tudastar` (már létezik, a spec commitja rajta van). Minden commit ide megy; `main`-re nem.
- **CLAUDE.md kötelező olvasmány** (a projekt gyökerében): konvenciók, relatív importok, magyar azonosítók, a shadcn `Link` + `buttonVariants()` + `cn()` minta, a React 19 form-reset és a `NativeSelect` viselkedése.
- **Nincs tesztkeretrendszer.** A „teszt” lépések eldobható tsx-scriptek (`scripts/_proba-*.ts`) `node:assert`-tel. Ezeket **soha ne add hozzá a gitbe** (a commitoknál mindig explicit fájllistát adj meg, ne `git add -A`/`git add .`); a 7. task törli őket.
- **Típusellenőrzés:** `npx tsc --noEmit` (a kimenet üres, ha rendben). **Build:** `npm run build` – figyelem: ez előbb `db:init`-et és `drizzle-kit migrate`-et futtat a helyi `data/tet.db`-re; ez rendben van, de a `data/tet.db`-t a 12. taskig **nem commitoljuk**. Ha a build nem létező `app/...` modulra panaszkodik, az a futó dev szerver elavult `.next/dev/types/validator.ts`-e: `rm .next/dev/types/validator.ts`, majd újra build.
- **A felhasználó dev szerverét ne állítsd le és ne indíts sajátot.**
- **Commit üzenet** a meglévő stílusban (`feat(tudastar): …`, magyarul), a végén:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Fájltérkép

| Fájl | Felelősség | Task |
| --- | --- | --- |
| `lib/tudastar-szotar.ts` | 9 kategória, típusok, korlátok, `FOGLALT_SLUGOK`, normalizáló | 1 |
| `lib/slug.ts` | slug-képzés, szabad slug | 1 |
| `lib/tudastar-szoveg.ts` | `tagolSzoveg`, `megjelenoHoszt` | 1 |
| `lib/tudastar-kereses.ts` | `normalizal`, `keresoSzavak`, `keres` | 1 |
| `lib/tudastar-validacio.ts` | `normalizalUrl`, `validalKartya` | 2 |
| `lib/tudastar-jog.ts` | `canEditTudastar` | 2 |
| `lib/routes.ts` (bővítés) | `tudastarUrl`, `kartyaHorgony`, `kartyaUrl`, `kartyaSzerkesztoUrl`, `ujKartyaUrl` | 2 |
| `db/schema/tudastar.ts`, `db/schema/index.ts`, `drizzle/0012_tudastar.sql` (+ meta) | tábla és migráció | 3 |
| `db/queries/tudastar.ts` | `listKartyak`, `getKartya`, `createKartya`, `updateKartya`, `deleteKartya`, `mozgatKartya` | 3 |
| `lib/navigacio.ts` | a menü és a fejléc feliratai | 4 |
| `app/(app)/tudastar/page.tsx` + `components/{SzamJelveny,KeresoMezo,KategoriaCsempek,KeresesiTalalatok}.tsx` | nyitólap | 4 |
| `lib/knowledge.ts` | **törlés** | 4 |
| `components/form/KuldGomb.tsx` | `size`, `disabled`, `aria-label` propok | 5 |
| `app/(app)/tudastar/[kategoria]/page.tsx`, `[kategoria]/[slug]/page.tsx` | kategória- és részletoldal | 5 |
| `app/(app)/tudastar/components/{Morzsa,KulsoLink,Szoveg,KategoriaMenu,KategoriaValto,TudastarElrendezes,KartyaLablec,TudastarKartya,IntezmenyReszlet}.tsx` | megjelenítés | 5 |
| `app/(app)/tudastar/actions.ts` | `mozgatKartyaAction` (5), majd `mentKartyaAction`, `deleteKartyaAction` (6) | 5, 6 |
| `app/(app)/tudastar/components/{KartyaMezo,SorSzerkeszto,KartyaForm,KartyaTorles}.tsx`, `[kategoria]/uj/page.tsx`, `[kategoria]/[slug]/szerkesztes/page.tsx` | szerkesztő | 6 |
| `CLAUDE.md`, a spec | dokumentáció | 7, 9, 11 |
| `scripts/tudastar-tartalom/tipusok.ts`, `scripts/tudastar-tartalom.ts` | B fázis: tartalom-futtató | 9 |
| `scripts/tudastar-tartalom/<kategoria>.ts` (9 fájl) | B fázis: kutatott tartalom | 10 |
| `drizzle/0013_tudastar_kezdo_tartalom.sql` (+ meta) | B fázis: egyszeri tartalom-migráció | 11 |
| `data/tet.db` | a demó DB a két migrációval | 12 |

---

# A fázis – funkció

### Task 1: Szótár, slug, szöveg-tagolás, keresés (tiszta függvények)

**Fájlok:**
- Létrehoz: `lib/tudastar-szotar.ts`, `lib/slug.ts`, `lib/tudastar-szoveg.ts`, `lib/tudastar-kereses.ts`
- Teszt (eldobható, nem commitolandó): `scripts/_proba-tudastar.ts`

- [ ] **1. lépés: az ellenőrző script megírása**

`scripts/_proba-tudastar.ts`:

```ts
// Eldobható ellenőrzés a tudástár tiszta függvényeire (nincs tesztkeretrendszer). Futtatás:
//   npx tsx scripts/_proba-tudastar.ts
// Nem commitolandó.
import assert from 'node:assert/strict';
import { slugbol, szabadSlug } from '../lib/slug';
import { keres, keresoSzavak, normalizal } from '../lib/tudastar-kereses';
import { normalizalTartalom, uresTartalom, type Kartya } from '../lib/tudastar-szotar';
import { megjelenoHoszt, tagolSzoveg } from '../lib/tudastar-szoveg';

// slug
assert.equal(slugbol('Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal'), 'nemzeti-kutatasi-fejlesztesi-es-innovacios-hivatal');
assert.equal(slugbol('NKFIH'), 'nkfih');
assert.equal(slugbol('Szellemi Tulajdon Nemzeti Hivatala (SZTNH)'), 'szellemi-tulajdon-nemzeti-hivatala-sztnh');
assert.equal(slugbol('Őrség – Ünnepi Űrkutatás'), 'orseg-unnepi-urkutatas');
assert.equal(slugbol('!!!'), 'kartya');
assert.ok(slugbol('a'.repeat(100)).length <= 60);
assert.equal(slugbol(`${'a'.repeat(59)} b`), 'a'.repeat(59));
assert.equal(szabadSlug('nkfih', () => false), 'nkfih');
assert.equal(szabadSlug('nkfih', (s) => s === 'nkfih' || s === 'nkfih-2'), 'nkfih-3');
assert.equal(szabadSlug('uj', (s) => ['uj'].includes(s)), 'uj-2');
assert.equal(slugbol('ﬁnanszírozás'), 'finanszirozas', 'NFKD: a ligatúra felbomlik');

// szöveg-tagolás
assert.deepEqual(tagolSzoveg('Első sor\nmásodik sor\n\n- egy\n- kettő\n• három\nZáró'), [
  { tipus: 'bekezdes', sorok: ['Első sor', 'második sor'] },
  { tipus: 'lista', elemek: ['egy', 'kettő', 'három'] },
  { tipus: 'bekezdes', sorok: ['Záró'] },
]);
assert.deepEqual(tagolSzoveg(''), []);
assert.deepEqual(tagolSzoveg('-nincs szóköz'), [{ tipus: 'bekezdes', sorok: ['-nincs szóköz'] }]);
assert.deepEqual(tagolSzoveg('– nagykötőjel\n- \n- második'), [{ tipus: 'lista', elemek: ['nagykötőjel', 'második'] }]);
assert.equal(megjelenoHoszt('https://www.nkfih.gov.hu/palyazatok'), 'nkfih.gov.hu');
assert.equal(megjelenoHoszt('https://www.'), 'https://www.');

// normalizáló
assert.deepEqual(normalizalTartalom('lista', null), { sorok: [], linkek: [] });
assert.deepEqual(normalizalTartalom('lista', { sorok: [{ nev: 'BME' }, 'x', null, {}], linkek: 'rossz' }), {
  sorok: [{ nev: 'BME', megjegyzes: '', url: '' }],
  linkek: [],
});
assert.deepEqual(uresTartalom('intezmeny').kapcsolat, { email: '', telefon: '', cim: '' });

// keresés
assert.equal(normalizal('Pályázatok ŐSZ'), 'palyazatok osz');
assert.deepEqual(keresoSzavak('  NKFI   pályázat '), ['nkfi', 'palyazat']);
const kartya = (k: Partial<Kartya> & Pick<Kartya, 'tipus' | 'tartalom'>): Kartya =>
  ({ id: k.nev ?? 'x', slug: 'x', kategoria: 'finanszirozas', nev: 'X', rovidites: null, osszefoglalo: 'Összefoglaló szöveg.',
    honlap: null, sorrend: 1, updatedAt: new Date(0), ...k }) as Kartya;
const niu = kartya({
  nev: 'Nemzeti Innovációs Ügynökség', rovidites: 'NIÜ', tipus: 'intezmeny',
  tartalom: { ...uresTartalom('intezmeny'), programok: [{ nev: 'XPAND', leiras: 'Piacra lépési program', url: '' }] },
});
const egyetemek = kartya({
  nev: 'Kutatóegyetemek', tipus: 'lista',
  tartalom: { sorok: [{ nev: 'Budapesti Műszaki és Gazdaságtudományi Egyetem', megjegyzes: 'BME', url: '' }], linkek: [] },
});
assert.deepEqual(keres([niu, egyetemek], ''), []);
const t1 = keres([niu, egyetemek], 'xpand niu');
assert.equal(t1.length, 1);
assert.equal(t1[0].hol, 'Programok');
assert.ok(t1[0].reszlet.includes('XPAND'));
const t2 = keres([niu, egyetemek], 'muszaki');
assert.equal(t2[0].kartya.nev, 'Kutatóegyetemek');
assert.equal(t2[0].hol, 'Lista');
const t3 = keres([niu, egyetemek], 'ugynokseg');
assert.equal(t3[0].hol, '', 'csak a névben talált');
assert.equal(t3[0].reszlet, 'Összefoglaló szöveg.');
assert.equal(keres([niu, egyetemek], 'xpand bme').length, 0, 'minden szónak egy kártyában kell lennie');
assert.deepEqual(keresoSzavak('„XPAND”, (NKFIH). k+f+i –'), ['xpand', 'nkfih', 'k+f+i']);
assert.equal(keres([niu, egyetemek], 'NIÜ, „XPAND”').length, 1, 'a szó szélén álló írásjel nem számít');
assert.equal(keres([niu, egyetemek], '–').length, 0, 'a csak írásjelből álló kifejezés nem keres');
const tti = kartya({
  nev: 'Tudományos és Technológiai Minisztérium', tipus: 'intezmeny',
  tartalom: { ...uresTartalom('intezmeny'), szakaszok: [{ cim: 'Prioritások', szoveg: 'A kormány KFI-prioritásai: ﬁnanszírozás.' }] },
});
const t4 = keres([tti], 'prioritasok');
assert.deepEqual([t4[0].hol, t4[0].reszlet], ['Szakasz', 'Prioritások'], 'címre talált: a cím nem ismétlődik');
const t5 = keres([tti], 'kormany');
assert.deepEqual([t5[0].hol, t5[0].reszlet], ['Prioritások', 'A kormány KFI-prioritásai: ﬁnanszírozás.']);
assert.equal(keres([tti], 'finanszirozas').length, 1, 'NFKD: a ligatúrás szövegben is talál');
const emoji = kartya({ nev: 'E', tipus: 'lista', osszefoglalo: `${'😀'.repeat(80)} cél`, tartalom: uresTartalom('lista') });
assert.ok(!/[\ud800-\udbff](?![\udc00-\udfff])/.test(keres([emoji], 'cel')[0].reszlet), 'a kivágás nem vág UTF-16 párt');

console.log('tudástár: minden ellenőrzés rendben');
```

- [ ] **2. lépés: futtatás – el kell buknia**

Futtatás: `npx tsx scripts/_proba-tudastar.ts`
Várt: hiba, „Cannot find module '../lib/slug'” (vagy hasonló, a modulok még nem léteznek).

- [ ] **3. lépés: `lib/tudastar-szotar.ts`**

A 9 kategória `leiras`/`bevezeto` szövege itt a dokumentum szereplőtípusaiból írt vázlat; a B fázis (11. task) cseréli a kutatott változatra.

```ts
/**
 * TéT Tudástár: a 9 rögzített kategória, a kártyatípusok, a kártya-tartalom alakja, a korlátok és a
 * normalizáló. Framework-mentes (nincs React, nincs DB). A kategóriák a kódban vannak (a 9-es szerkezet
 * rögzített), a kártyák a `tudastar_kartya` táblában (db/schema/tudastar.ts).
 */

export interface TudastarKategoria {
  slug: string;
  szam: number;
  cim: string;
  /** A jobb oldali menübe és a keskeny ablak kategória-választójába. */
  rovidCim: string;
  /** Egy sor a nyitólap csempéjére. */
  leiras: string;
  /** 2–4 mondatos eligazító összefoglaló a kategória-oldal tetején. */
  bevezeto: string;
}

export const TUDASTAR_KATEGORIAK = [
  {
    slug: 'szakpolitika',
    szam: 1,
    cim: 'Szakpolitikai irányítás és koordináció',
    rovidCim: 'Szakpolitikai irányítás',
    leiras: 'A KFI-politikát alakító minisztériumok, koordinációs és tanácsadó testületek.',
    bevezeto:
      'A magyar kutatás-, fejlesztés- és innovációpolitika irányítói: a Tudományos és Technológiai Minisztérium, az innovációhoz kapcsolódó ágazati minisztériumok, valamint a koordinációs, stratégiai és tanácsadó testületek. A minisztérium kártyáján a KFI-stratégia, a prioritások és a kiemelt ágazatok összefoglalója olvasható.',
  },
  {
    slug: 'finanszirozas',
    szam: 2,
    cim: 'Kutatás-fejlesztési és innovációs finanszírozás',
    rovidCim: 'K+F+I finanszírozás',
    leiras: 'Az NKFI Hivatal, a hazai és uniós források kezelői, a nemzeti kapcsolattartók.',
    bevezeto:
      'Kik döntenek a hazai KFI-forrásokról, és kihez fordulhat a külföldi partner pályázati együttműködésért. Itt található a Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal, a hazai és európai uniós támogatások kezelői, a Horizont Európa nemzeti kapcsolattartói, valamint az EUREKA, a Eurostars, a COST és más programok hazai felelősei.',
  },
  {
    slug: 'innovacios-szolgaltatasok',
    szam: 3,
    cim: 'Innovációs szolgáltatások és vállalkozásfejlesztés',
    rovidCim: 'Innovációs szolgáltatások',
    leiras: 'A Nemzeti Innovációs Ügynökség, inkubátorok, akcelerátorok, klaszterek.',
    bevezeto:
      'Az innovatív vállalkozásokat és startupokat segítő szervezetek: a Nemzeti Innovációs Ügynökség és programjai, az országos vállalkozásfejlesztési szervezetek, az inkubátorok, akcelerátorok és klaszterek, valamint a vállalati innovációs központok és a nyílt innovációs programok működtetői.',
  },
  {
    slug: 'kutatohalozat',
    szam: 4,
    cim: 'Kutatóhálózat és kutatóintézetek',
    rovidCim: 'Kutatóhálózat',
    leiras: 'A HUN-REN hálózat, nemzeti laboratóriumok, kutatási infrastruktúrák.',
    bevezeto:
      'A magyar kutatóhálózat: a HUN-REN Magyar Kutatási Hálózat és kutatóközpontjai, a támogatott kutatócsoportok, a nemzeti laboratóriumok, a kutatási infrastruktúrák és az önálló állami vagy nonprofit kutatóhelyek.',
  },
  {
    slug: 'egyetemek',
    szam: 5,
    cim: 'Egyetemek és technológiatranszfer',
    rovidCim: 'Egyetemek és TT',
    leiras: 'Kutatóegyetemek, technológiatranszfer-irodák, science parkok, spin-offok.',
    bevezeto:
      'A kutatóegyetemek és a tudás hasznosításának szereplői: innovációs igazgatóságok, technológiatranszfer-irodák és -cégek, egyetemi inkubátorok, kompetenciaközpontok, science parkok, egyetemi kutatási infrastruktúrák és spin-off portfóliók.',
  },
  {
    slug: 'szellemi-tulajdon',
    szam: 6,
    cim: 'Szellemi tulajdon, szabályozás és minősítés',
    rovidCim: 'Szellemi tulajdon',
    leiras: 'Az SZTNH, szabványosítás, akkreditáció, ágazati hatóságok.',
    bevezeto:
      'A szellemi tulajdon védelmének, a szabályozásnak és a minősítésnek a szereplői: a Szellemi Tulajdon Nemzeti Hivatala, a szabványosítási, akkreditációs és megfelelőségértékelési szervezetek, az ágazati hatóságok, a szabályozói tesztkörnyezetek, valamint a kutatásbiztonsági és technológiabiztonsági kapcsolattartók.',
  },
  {
    slug: 'befektetok',
    szam: 7,
    cim: 'Finanszírozók és befektetők',
    rovidCim: 'Finanszírozók, befektetők',
    leiras: 'Állami és magán kockázati tőke, üzleti angyalok, banki finanszírozás.',
    bevezeto:
      'Az innováció tőkeoldala: az állami és állami hátterű finanszírozók, a kockázatitőke-alapok, az üzleti angyal hálózatok, a banki innovációfinanszírozás, a corporate venture capital szereplők, az inkubációs és akcelerációs befektetők, a deep tech finanszírozók, valamint az egyetemi és proof-of-concept alapok.',
  },
  {
    slug: 'vallalatok',
    szam: 8,
    cim: 'Kiemelt vállalati, piaci szereplők',
    rovidCim: 'Vállalati szereplők',
    leiras: 'Innovatív nagyvállalatok, KFI-központok, kkv-k, startupok, kamarák.',
    bevezeto:
      'A magyar gazdaság innovatív szereplői: a legnagyobb innovatív vállalatok és a jelentős KFI-központtal rendelkező cégek, a nyílt innovációs programokat működtető vállalatok, a kiemelt innovatív kkv-k, startupok és scale-upok, valamint az ágazati szövetségek, kamarák és klaszterek.',
  },
  {
    slug: 'nemzetkozi-programok',
    szam: 9,
    cim: 'Nemzetközi programok magyar kapcsolódási pontjai',
    rovidCim: 'Nemzetközi programok',
    leiras: 'Horizont Európa, EIC, EIT, EUREKA, COST, EEN, EURAXESS és társaik.',
    bevezeto:
      'A nemzetközi KFI-programok magyar kapcsolódási pontjai: Horizont Európa, EIC, EIT és a KIC-ek, EUREKA, Eurostars, COST, Enterprise Europe Network, EURAXESS, a kétoldalú TéT-programok, a nemzetközi kutatási infrastruktúrák, az EU-partnerségek és a Widening-programok.',
  },
] as const satisfies readonly TudastarKategoria[];

/** Egy kategória a szótárból (a `slug` itt a szűk `KategoriaSlug`). */
export type Kategoria = (typeof TUDASTAR_KATEGORIAK)[number];
export type KategoriaSlug = Kategoria['slug'];

const KATEGORIA_SLUGOK: readonly string[] = TUDASTAR_KATEGORIAK.map((k) => k.slug);

export function isKategoriaSlug(v: string): v is KategoriaSlug {
  return KATEGORIA_SLUGOK.includes(v);
}

export function kategoriaBySlug(slug: string): Kategoria | undefined {
  return TUDASTAR_KATEGORIAK.find((k) => k.slug === slug);
}

/** A kategória helye a 9-es sorrendben (rendezéshez); ismeretlenre a lista vége. */
export function kategoriaIndex(slug: string): number {
  const i = KATEGORIA_SLUGOK.indexOf(slug);
  return i === -1 ? KATEGORIA_SLUGOK.length : i;
}

/**
 * Statikus útvonal-szegmensek a `/tudastar/[kategoria]/` alatt: ilyen slugú kártya elérhetetlen lenne, mert
 * a statikus szegmens (`uj`) elsőbbséget élvez a dinamikus `[slug]`-gal szemben.
 */
export const FOGLALT_SLUGOK: readonly string[] = ['uj'];

export const KARTYA_TIPUSOK = ['intezmeny', 'lista'] as const;
export type KartyaTipus = (typeof KARTYA_TIPUSOK)[number];

export function isKartyaTipus(v: unknown): v is KartyaTipus {
  return typeof v === 'string' && (KARTYA_TIPUSOK as readonly string[]).includes(v);
}

export const TIPUS_CIMKE: Record<KartyaTipus, string> = { intezmeny: 'Intézmény', lista: 'Lista' };

export interface Kapcsolat {
  email: string;
  telefon: string;
  cim: string;
}
export interface Szakasz {
  cim: string;
  szoveg: string;
}
export interface Program {
  nev: string;
  leiras: string;
  url: string;
}
export interface HasznosLink {
  felirat: string;
  url: string;
}
export interface ListaSor {
  nev: string;
  megjegyzes: string;
  url: string;
}

export interface IntezmenyTartalom {
  profil: string;
  tevekenyseg: string;
  kapcsolat: Kapcsolat;
  /** Szabad, címzett szakaszok (pl. a minisztériumnál: KFI-stratégia, prioritások, kiemelt ágazatok). */
  szakaszok: Szakasz[];
  programok: Program[];
  linkek: HasznosLink[];
}
export interface ListaTartalom {
  sorok: ListaSor[];
  linkek: HasznosLink[];
}
export interface KartyaTartalmak {
  intezmeny: IntezmenyTartalom;
  lista: ListaTartalom;
}
export type KartyaTartalom = KartyaTartalmak[KartyaTipus];

/** A kártya közös mezői (a kártyán ezek látszanak). */
export interface KartyaAlap {
  kategoria: KategoriaSlug;
  nev: string;
  rovidites: string | null;
  osszefoglalo: string;
  honlap: string | null;
}
/** A típus és a tartalom együtt: a `tipus` szűkíti a `tartalom`-ot. */
export type KartyaTorzs =
  | { tipus: 'intezmeny'; tartalom: IntezmenyTartalom }
  | { tipus: 'lista'; tartalom: ListaTartalom };

/** A validált űrlap (mentéskor) – a DB-sor azonosítók és időbélyeg nélkül. */
export type KartyaAdat = KartyaAlap & KartyaTorzs;

/** Egy kártya, ahogy a lekérdezés adja. */
export type Kartya = KartyaAdat & {
  id: string;
  slug: string;
  sorrend: number;
  updatedAt: Date;
};

/** Adott típusú kártya (a komponensek propjaihoz). */
export type KartyaTipusu<T extends KartyaTipus> = Extract<Kartya, { tipus: T }>;

// Korlátok: a validátor, a szerkesztő maxLength-jei és a tartalomfuttató is ezeket használja.
export const NEV_MAX = 200;
export const ROVIDITES_MAX = 40;
export const OSSZEFOGLALO_MAX = 600;
export const URL_MAX = 500;
export const SZOVEG_MAX = 5000;
export const SZAKASZ_CIM_MAX = 120;
export const PROGRAM_LEIRAS_MAX = 300;
export const FELIRAT_MAX = 120;
export const MEGJEGYZES_MAX = 200;
export const EMAIL_MAX = 200;
export const TELEFON_MAX = 60;
export const CIM_MAX = 200;

/** A dinamikus listák sortípusai (a `<lista>.<i>.<mezo>` mezőnevek első tagja). */
export interface SorTipusok {
  szakaszok: Szakasz;
  programok: Program;
  linkek: HasznosLink;
  sorok: ListaSor;
}
export type SorLista = keyof SorTipusok;
// Típusszintű őr: a dinamikus listák minden mezője szöveg (a validátor és a sorszerkesztő stringként kezeli,
// a `SOR_MEZOK` kimerítőségére épülő cast így teljes és helyes típusú sort ad). Nem szöveges mezőnél a
// `MindSzoveg` `boolean` lesz, és az `Igaz<…>` fordítási hibát ad.
type MindSzoveg = { [L in SorLista]: SorTipusok[L][keyof SorTipusok[L]] extends string ? true : false }[SorLista];
type Igaz<T extends true> = T;
export type SorMezokSzovegesek = Igaz<MindSzoveg>;

export const SOR_MAX: Record<SorLista, number> = { szakaszok: 12, programok: 30, linkek: 20, sorok: 150 };
/** A lista egy sorának neve (a szerkesztő sorcímkéje, a „+ Új …” gomb és a darabszám-hiba szövege). */
export const SOR_EGYSEG: Record<SorLista, string> = { szakaszok: 'szakasz', programok: 'program', linkek: 'link', sorok: 'sor' };

/** A formázható szöveges mezők súgója a szerkesztőben: a megjelenítés két szabálya (lib/tudastar-szoveg.ts). */
export const SZOVEG_SUGO = 'Üres sor: új bekezdés · „- ” kezdetű sor: felsorolás.';

/** Egy sor-mező szabálya: a szerkesztő és a validátor közös forrása. */
export interface SorMezoSzabaly {
  cimke: string;
  max: number;
  kotelezo?: true;
  /** Webcím: a validátor normalizálja (lib/tudastar-validacio.ts `normalizalUrl`). */
  url?: true;
  /** Többsoros szöveg; `formazott`: a szerkesztő a bekezdés/felsorolás súgóját is mutatja. */
  tobbsoros?: true;
  formazott?: true;
}

/**
 * A dinamikus listák mezői, listánként a szerkesztőbeli sorrendben. Mezőnév szerint kimerítő: új almező
 * fordítási hiba, amíg itt nincs szabálya (különben a normalizáló beolvasná, de a mentés csendben eldobná).
 */
export const SOR_MEZOK: { [L in SorLista]: { [K in keyof SorTipusok[L]]-?: SorMezoSzabaly } } = {
  szakaszok: {
    cim: { cimke: 'Cím', max: SZAKASZ_CIM_MAX, kotelezo: true },
    szoveg: { cimke: 'Szöveg', max: SZOVEG_MAX, kotelezo: true, tobbsoros: true, formazott: true },
  },
  programok: {
    nev: { cimke: 'Név', max: NEV_MAX, kotelezo: true },
    url: { cimke: 'Webcím', max: URL_MAX, url: true },
    leiras: { cimke: 'Egysoros leírás', max: PROGRAM_LEIRAS_MAX },
  },
  linkek: {
    felirat: { cimke: 'Felirat', max: FELIRAT_MAX, kotelezo: true },
    url: { cimke: 'Webcím', max: URL_MAX, kotelezo: true, url: true },
  },
  sorok: {
    nev: { cimke: 'Név', max: NEV_MAX, kotelezo: true },
    url: { cimke: 'Webcím', max: URL_MAX, url: true },
    megjegyzes: { cimke: 'Megjegyzés', max: MEGJEGYZES_MAX },
  },
};

/** A kártya egyszerű mezőinek feliratai (szerkesztő, validátor); a név és az összefoglaló típusonként más. */
export const KARTYA_CIMKEK = {
  kategoria: 'Kategória',
  rovidites: 'Rövidítés',
  honlap: 'Honlap',
  profil: 'Profil',
  tevekenyseg: 'Tevékenység',
  email: 'E-mail',
  telefon: 'Telefon',
  cim: 'Cím',
} as const;
export const NEV_CIMKE: Record<KartyaTipus, string> = { intezmeny: 'Név', lista: 'Lista címe' };
export const OSSZEFOGLALO_CIMKE: Record<KartyaTipus, string> = { intezmeny: 'Összefoglaló', lista: 'Bevezető' };

function szoveg(v: unknown): string {
  return typeof v === 'string' ? v : '';
}

function objektum(v: unknown): Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v) ? (v as Record<string, unknown>) : {};
}

/**
 * Objektumok listája; a nem objektum elemet eldobja, a többit a `sor` egészíti ki. A kiegészítés után
 * teljesen üres sort is eldobja, mint a validátor (különben üres szakasz, link vagy listasor jelenne meg).
 */
function objLista<T extends object>(v: unknown, sor: (r: Record<string, unknown>) => T): T[] {
  return Array.isArray(v)
    ? v
        .filter((x) => typeof x === 'object' && x !== null && !Array.isArray(x))
        .map((x) => sor(x as Record<string, unknown>))
        .filter((s) => Object.values(s).some((m) => m !== ''))
    : [];
}

const linkSor = (r: Record<string, unknown>): HasznosLink => ({ felirat: szoveg(r.felirat), url: szoveg(r.url) });

/**
 * A DB-ből olvasott JSON kiegészítése: hiányzó vagy rossz típusú almező → üres alapérték, nem objektum
 * listaelem → kimarad. Új almezőhöz így nem kell migráció; almező átnevezése viszont adatmigrációt igényel
 * (a régi kulcson tárolt értéket a normalizáló nem látja, a következő mentés pedig eldobja). Kimerítő a
 * `KartyaTipus` unión, cast nélkül.
 */
const NORMALIZALOK: { [T in KartyaTipus]: (r: Record<string, unknown>) => KartyaTartalmak[T] } = {
  intezmeny: (r) => {
    const k = objektum(r.kapcsolat);
    return {
      profil: szoveg(r.profil),
      tevekenyseg: szoveg(r.tevekenyseg),
      kapcsolat: { email: szoveg(k.email), telefon: szoveg(k.telefon), cim: szoveg(k.cim) },
      szakaszok: objLista(r.szakaszok, (s) => ({ cim: szoveg(s.cim), szoveg: szoveg(s.szoveg) })),
      programok: objLista(r.programok, (p) => ({ nev: szoveg(p.nev), leiras: szoveg(p.leiras), url: szoveg(p.url) })),
      linkek: objLista(r.linkek, linkSor),
    };
  },
  lista: (r) => ({
    sorok: objLista(r.sorok, (s) => ({ nev: szoveg(s.nev), megjegyzes: szoveg(s.megjegyzes), url: szoveg(s.url) })),
    linkek: objLista(r.linkek, linkSor),
  }),
};

export function normalizalTartalom<T extends KartyaTipus>(tipus: T, nyers: unknown): KartyaTartalmak[T] {
  return NORMALIZALOK[tipus](objektum(nyers));
}

/** Üres tartalom típusonként (a normalizáló üres bemenetre adott értéke); az új kártya űrlapja ebből indul. */
export function uresTartalom<T extends KartyaTipus>(tipus: T): KartyaTartalmak[T] {
  return NORMALIZALOK[tipus]({});
}
```

- [ ] **4. lépés: `lib/slug.ts`**

```ts
/**
 * URL-azonosító (slug) képzése: ékezet nélkül, kisbetűvel, a nem alfanumerikus szakaszok helyén egy
 * kötőjellel. A tudástár kártyáinak URL-je (`/tudastar/<kategoria>/<slug>`) használja.
 */

export const SLUG_MAX = 60;
export const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/**
 * Az ékezetjelek elhagyása (NFKD után a kombinált jelek; az „ő”, „ű” kettős ékezete is). Az NFKD a
 * kompatibilitási alakokat is felbontja: a PDF-ből másolt „ﬁ” ligatúra „fi”, a teljes szélességű betű
 * közönséges lesz.
 */
export function ekezetNelkul(s: string): string {
  return s.normalize('NFKD').replace(/\p{Diacritic}/gu, '');
}

/** Slug a szövegből; ha semmi nem marad (pl. csak írásjel), a `tartalek`. */
export function slugbol(s: string, tartalek = 'kartya'): string {
  const alap = ekezetNelkul(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  const vagott = alap.slice(0, SLUG_MAX).replace(/-+$/, '');
  return vagott || tartalek;
}

/** Az első szabad slug: az `alap`, vagy `-2`, `-3`… utótaggal. A `foglalt` a már használt (és a tiltott) slugokra igaz. */
export function szabadSlug(alap: string, foglalt: (s: string) => boolean): string {
  if (!foglalt(alap)) return alap;
  for (let i = 2; ; i++) {
    const s = `${alap}-${i}`;
    if (!foglalt(s)) return s;
  }
}
```

- [ ] **5. lépés: `lib/tudastar-szoveg.ts`**

```ts
/**
 * A tudástár szövegeinek megjelenítési segédei (tiszta függvények). A szöveges mezők sima szövegek két
 * szabállyal: üres sor = új bekezdés, „- ” (vagy a bemásolt szövegekben gyakori „– ”, „• ”) kezdetű sor =
 * felsoroláspont. HTML-t nem értelmezünk.
 */

export type SzovegBlokk = { tipus: 'bekezdes'; sorok: string[] } | { tipus: 'lista'; elemek: string[] };

const LISTA_SOR = /^\s*[-–•]\s+/;

/** A szöveg bekezdésekre és felsorolásokra bontva, a beírás sorrendjében. */
export function tagolSzoveg(s: string): SzovegBlokk[] {
  const blokkok: SzovegBlokk[] = [];
  let aktualis: SzovegBlokk | null = null;
  for (const sor of s.split('\n')) {
    if (sor.trim() === '') {
      aktualis = null;
      continue;
    }
    if (LISTA_SOR.test(sor)) {
      const elem = sor.replace(LISTA_SOR, '').trim();
      if (!elem) continue;
      if (aktualis?.tipus !== 'lista') {
        aktualis = { tipus: 'lista', elemek: [] };
        blokkok.push(aktualis);
      }
      aktualis.elemek.push(elem);
    } else {
      if (aktualis?.tipus !== 'bekezdes') {
        aktualis = { tipus: 'bekezdes', sorok: [] };
        blokkok.push(aktualis);
      }
      aktualis.sorok.push(sor.trim());
    }
  }
  return blokkok;
}

/** Az URL megjelenő rövid alakja: a hoszt „www.” nélkül (pl. „nkfih.gov.hu”); érvénytelen vagy hoszt nélküli URL-re maga a szöveg. */
export function megjelenoHoszt(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '') || url;
  } catch {
    return url;
  }
}
```

- [ ] **6. lépés: `lib/tudastar-kereses.ts`**

```ts
/**
 * A tudástár keresése (tiszta függvények): kis- és nagybetűre, valamint ékezetre érzéketlen; több szónál
 * minden szónak szerepelnie kell a kártyában (ÉS). A kártyák száma kicsi (~100), ezért JS-ben szűrünk.
 */
import { ekezetNelkul } from './slug';
import type { Kartya } from './tudastar-szotar';

export const KERESES_MAX = 200;
const RESZLET_HOSSZ = 120;
const RESZLET_ELOTTE = 40;
// A szó elején és végén álló írásjelek („NKFIH,”, „„XPAND””, „(NKFIH)”); a szó belsejében maradnak (k+f+i, kfi-strategia).
const SZELI_IRASJEL = /^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu;

/** Egy karakter összehasonlítási alakja; az ASCII ágon gyors (a `^` és a `` ` `` is ékezetjel, mint az `ekezetNelkul`-ban). */
function karakterAlak(ch: string): string {
  if (ch < '\x80') return ch === '^' || ch === '`' ? '' : ch.toLowerCase();
  return ekezetNelkul(ch).toLowerCase();
}

/** Ékezet nélküli kisbetűs alak, és minden normalizált karakterhez az eredeti szövegbeli indexe. */
function normalizalTerkeppel(s: string): { norm: string; eredeti: number[] } {
  let norm = '';
  const eredeti: number[] = [];
  let i = 0;
  for (const ch of s) {
    const n = karakterAlak(ch);
    norm += n;
    for (let j = 0; j < n.length; j++) eredeti.push(i);
    i += ch.length;
  }
  return { norm, eredeti };
}

/** Ékezet nélküli kisbetűs alak (az összehasonlításhoz). */
export function normalizal(s: string): string {
  return normalizalTerkeppel(s).norm;
}

/** A keresőkifejezés szavai normalizálva, a szélükön álló írásjelek nélkül; a kifejezés legfeljebb `KERESES_MAX` karakter. */
export function keresoSzavak(q: string): string[] {
  return normalizal(q.slice(0, KERESES_MAX))
    .split(/\s+/)
    .map((w) => w.replace(SZELI_IRASJEL, ''))
    .filter(Boolean);
}

interface Resz {
  /** A találati sorban megjelenő név (pl. „Programok”, a szakasz címe). */
  hol: string;
  szoveg: string;
  /** A név és a rövidítés: az ÉS-feltételbe beleszámít, de a `hol`/`reszlet` nem lehet (a találati sorban amúgy is látszik). */
  nevResz?: true;
}

/** A kártya kereshető részei a megjelenítés sorrendjében. */
function reszek(k: Kartya): Resz[] {
  const r: Resz[] = [
    { hol: '', szoveg: k.nev, nevResz: true },
    { hol: '', szoveg: k.rovidites ?? '', nevResz: true },
    { hol: 'Összefoglaló', szoveg: k.osszefoglalo },
  ];
  if (k.tipus === 'intezmeny') {
    const t = k.tartalom;
    r.push({ hol: 'Profil', szoveg: t.profil }, { hol: 'Tevékenység', szoveg: t.tevekenyseg });
    // A szakasz szövege és címe külön rész: a címre talált keresés „Szakasz: <cím>”, a szövegre talált
    // „<cím>: <kivágás>” sort ad (a cím így nem ismétlődik). A szöveg áll elöl, holtversenyben az nyer.
    for (const sz of t.szakaszok) r.push({ hol: sz.cim, szoveg: sz.szoveg }, { hol: 'Szakasz', szoveg: sz.cim });
    for (const p of t.programok) r.push({ hol: 'Programok', szoveg: p.leiras ? `${p.nev} – ${p.leiras}` : p.nev });
  } else {
    for (const s of k.tartalom.sorok) r.push({ hol: 'Lista', szoveg: s.megjegyzes ? `${s.nev} – ${s.megjegyzes}` : s.nev });
  }
  for (const l of k.tartalom.linkek) r.push({ hol: 'Hasznos linkek', szoveg: l.felirat });
  return r;
}

/** Igaz, ha az `i` index egy UTF-16 pár második fele (a kivágás nem kezdődhet és nem végződhet a pár közepén). */
function parKozepe(s: string, i: number): boolean {
  const c = s.charCodeAt(i);
  return c >= 0xdc00 && c <= 0xdfff;
}

/** Legfeljebb `RESZLET_HOSSZ` karakteres kivágás az `index` körül, egy sorba vonva, „…” jellel a vágott végeken. */
function kivagas(szoveg: string, index: number): string {
  let kezdet = Math.max(0, index - RESZLET_ELOTTE);
  let veg = Math.min(szoveg.length, kezdet + RESZLET_HOSSZ);
  if (kezdet > 0 && parKozepe(szoveg, kezdet)) kezdet++;
  if (veg < szoveg.length && parKozepe(szoveg, veg)) veg--;
  const resz = szoveg.slice(kezdet, veg).replace(/\s+/g, ' ').trim();
  return `${kezdet > 0 ? '…' : ''}${resz}${veg < szoveg.length ? '…' : ''}`;
}

export interface Talalat {
  kartya: Kartya;
  /**
   * Hol talált: „Összefoglaló”, „Profil”, „Tevékenység”, „Programok”, „Lista”, „Hasznos linkek”, egy szakasz
   * címe (a szakasz szövegére talált) vagy „Szakasz” (a címére); üres, ha csak a névben vagy a rövidítésben (vagy
   * – csak kézzel módosított adatnál – egy cím nélküli szakasz szövegében).
   */
  hol: string;
  /** Rövid kivágás a találat körül; ha csak a névben talált, az összefoglaló eleje. */
  reszlet: string;
}

/**
 * A kártyák, amelyekben a kifejezés minden szava előfordul, a bemenet sorrendjében. A `hol`/`reszlet` a
 * legtöbb szót tartalmazó rész (holtversenyben a korábbi); a név és a rövidítés helyett – ezek a találati
 * sorban amúgy is látszanak – a következő legjobb rész, vagy annak híján az összefoglaló eleje.
 */
export function keres(kartyak: readonly Kartya[], q: string): Talalat[] {
  const szavak = keresoSzavak(q);
  if (szavak.length === 0) return [];
  const talalatok: Talalat[] = [];
  for (const kartya of kartyak) {
    const r = reszek(kartya).map((x) => ({ ...x, ...normalizalTerkeppel(x.szoveg) }));
    const egesz = r.map((x) => x.norm).join('\n');
    if (!szavak.every((s) => egesz.includes(s))) continue;
    let legjobb: (typeof r)[number] | null = null;
    let legjobbDb = 0;
    for (const x of r) {
      if (x.nevResz) continue;
      const db = szavak.filter((s) => x.norm.includes(s)).length;
      if (db > legjobbDb) {
        legjobb = x;
        legjobbDb = db;
      }
    }
    if (!legjobb) {
      talalatok.push({ kartya, hol: '', reszlet: kivagas(kartya.osszefoglalo, 0) });
      continue;
    }
    const elsoSzo = szavak.find((s) => legjobb.norm.includes(s)) ?? szavak[0];
    const index = legjobb.eredeti[legjobb.norm.indexOf(elsoSzo)] ?? 0;
    talalatok.push({ kartya, hol: legjobb.hol, reszlet: kivagas(legjobb.szoveg, index) });
  }
  return talalatok;
}
```

- [ ] **7. lépés: futtatás – át kell mennie**

Futtatás: `npx tsx scripts/_proba-tudastar.ts`
Várt: `tudástár: minden ellenőrzés rendben`

- [ ] **8. lépés: típusellenőrzés**

Futtatás: `npx tsc --noEmit`
Várt: üres kimenet.

- [ ] **9. lépés: commit** (a `_proba` script nélkül)

```bash
git add lib/tudastar-szotar.ts lib/slug.ts lib/tudastar-szoveg.ts lib/tudastar-kereses.ts
git commit -m "feat(tudastar): szótár (9 kategória, kártya-típusok, normalizáló), slug, szöveg-tagolás és keresés

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Validátor, jog, útvonal-segédek

**Fájlok:**
- Létrehoz: `lib/tudastar-validacio.ts`, `lib/tudastar-jog.ts`
- Módosít: `lib/routes.ts` (típus-import + a fájl végére), `lib/urlap.ts` (`EMAIL_RE`, `nevelovel`), `lib/felhasznalo-validacio.ts` (az `EMAIL_RE` innen költözik a `lib/urlap.ts`-be)
- Teszt (eldobható): `scripts/_proba-tudastar-validacio.ts`

(A validátor a `lib/tudastar-szotar.ts` közös felirat- és sorszabály-tábláit – `KARTYA_CIMKEK`, `NEV_CIMKE`, `OSSZEFOGLALO_CIMKE`, `SOR_MEZOK`, `SOR_EGYSEG` – használja; ezek az 1. task szótárában vannak.)

- [ ] **1. lépés: az ellenőrző script**

`scripts/_proba-tudastar-validacio.ts`:

```ts
// Eldobható ellenőrzés a tudástár validátorára (nincs tesztkeretrendszer). Futtatás:
//   npx tsx scripts/_proba-tudastar-validacio.ts
// Nem commitolandó.
import assert from 'node:assert/strict';
import { normalizalUrl, validalKartya } from '../lib/tudastar-validacio';

// URL
assert.equal(normalizalUrl('nkfih.gov.hu'), 'https://nkfih.gov.hu/');
assert.equal(normalizalUrl('https://nkfih.gov.hu/palyazatok'), 'https://nkfih.gov.hu/palyazatok');
assert.equal(normalizalUrl('http://example.com'), 'http://example.com/');
assert.equal(normalizalUrl('javascript:alert(1)'), null);
assert.equal(normalizalUrl('mailto:info@nkfih.gov.hu'), null);
assert.equal(normalizalUrl('valami szöveg'), null);
assert.equal(normalizalUrl('https://localhost'), null);
assert.equal(normalizalUrl('info@nkfih.gov.hu'), null, 'e-mail a honlap mezőben');
assert.equal(normalizalUrl('https://nkfih.gov.hu@masik.hu/'), null, 'felhasználónév a címben');
assert.equal(normalizalUrl('https://a.'), null);
assert.equal(normalizalUrl('https://localhost.'), null);

// validátor
function fd(ertekek: Record<string, string>): FormData {
  const f = new FormData();
  for (const [k, v] of Object.entries(ertekek)) f.append(k, v);
  return f;
}
const jo = validalKartya(
  fd({
    kategoria: 'finanszirozas', nev: '  NKFI Hivatal ', rovidites: 'NKFIH', osszefoglalo: 'Az NKFI Alap kezelője.', honlap: 'nkfih.gov.hu',
    profil: 'Profil', email: 'info@nkfih.gov.hu',
    'szakaszok.0.cim': 'Feladat', 'szakaszok.0.szoveg': '- egy\n- kettő',
    'szakaszok.1.cim': '', 'szakaszok.1.szoveg': '',
    'programok.0.nev': 'Kétoldalú TéT', 'programok.0.leiras': '', 'programok.0.url': 'nkfih.gov.hu/tet',
    'linkek.0.felirat': 'Pályázatok', 'linkek.0.url': 'https://nkfih.gov.hu/palyazatok',
  }),
  'intezmeny',
);
assert.ok(jo.ok);
assert.equal(jo.data.nev, 'NKFI Hivatal');
assert.equal(jo.data.honlap, 'https://nkfih.gov.hu/');
assert.equal(jo.data.tipus, 'intezmeny');
if (jo.data.tipus === 'intezmeny') {
  assert.equal(jo.data.tartalom.szakaszok.length, 1, 'a teljesen üres sor kimarad');
  assert.equal(jo.data.tartalom.programok[0].url, 'https://nkfih.gov.hu/tet');
}
const rossz = validalKartya(
  fd({
    kategoria: 'nincs-ilyen', nev: '', osszefoglalo: 'x', honlap: 'javascript:alert(1)', email: 'nem-email',
    'szakaszok.0.cim': 'Cím szöveg nélkül', 'linkek.0.felirat': 'Felirat', 'linkek.0.url': '',
  }),
  'intezmeny',
);
assert.ok(!rossz.ok);
assert.deepEqual(Object.keys(rossz.errors).sort(), ['email', 'honlap', 'kategoria', 'linkek.0.url', 'nev', 'szakaszok.0.szoveg'].sort());
assert.equal(rossz.errors.nev, 'A név kötelező.');
assert.equal(rossz.errors.email, 'Érvénytelen e-mail cím.');
assert.equal(rossz.errors['linkek.0.url'], 'A webcím kötelező.');
const listaHiba = validalKartya(fd({ kategoria: 'egyetemek', nev: '', osszefoglalo: '', 'sorok.0.megjegyzes': 'x' }), 'lista');
assert.ok(!listaHiba.ok);
assert.deepEqual(
  [listaHiba.errors.nev, listaHiba.errors.osszefoglalo, listaHiba.errors['sorok.0.nev']],
  ['A lista címe kötelező.', 'A bevezető kötelező.', 'A név kötelező.'],
  'a feliratok a szerkesztőéi (típusonként)',
);
const hosszuUrl = validalKartya(fd({ kategoria: 'egyetemek', nev: 'L', osszefoglalo: 'x', honlap: `a.hu/${'é'.repeat(100)}` }), 'lista');
assert.ok(!hosszuUrl.ok && hosszuUrl.errors.honlap.startsWith('A honlap kódolva'));
const nagyIndex = validalKartya(fd({ kategoria: 'egyetemek', nev: 'L', osszefoglalo: 'x', 'linkek.99999.felirat': 'F', 'linkek.99999.url': 'a.hu' }), 'lista');
assert.ok(nagyIndex.ok && nagyIndex.data.tartalom.linkek.length === 0, 'az 5+ jegyű index nem sor');
const tulSok = new FormData();
tulSok.append('kategoria', 'egyetemek');
tulSok.append('nev', 'Lista');
tulSok.append('osszefoglalo', 'x');
for (let i = 0; i < 21; i++) {
  tulSok.append(`linkek.${i}.felirat`, `L${i}`);
  tulSok.append(`linkek.${i}.url`, 'https://a.hu');
}
const tulSokE = validalKartya(tulSok, 'lista');
assert.ok(!tulSokE.ok && tulSokE.errors.form === 'Legfeljebb 20 link adható meg.');
for (let i = 0; i < 151; i++) tulSok.append(`sorok.${i}.nev`, `S${i}`);
const ketLista = validalKartya(tulSok, 'lista');
assert.ok(!ketLista.ok && ketLista.errors.form === 'Legfeljebb 20 link adható meg. Legfeljebb 150 sor adható meg.', 'mindkét túllépés látszik');

const sortores = validalKartya(
  fd({ kategoria: 'egyetemek', nev: 'Első\nmásodik', osszefoglalo: 'Egy\n\nkettő', 'sorok.0.nev': 'BME', 'sorok.0.megjegyzes': 'a\nb' }),
  'lista',
);
assert.ok(sortores.ok);
assert.equal(sortores.data.nev, 'Első második', 'egysoros mezőben a sortörés szóköz');
assert.equal(sortores.data.osszefoglalo, 'Egy\n\nkettő', 'a többsoros mező megtartja');
assert.equal(sortores.data.tipus === 'lista' && sortores.data.tartalom.sorok[0].megjegyzes, 'a b');
console.log('tudástár validátor: minden ellenőrzés rendben');
```

- [ ] **2. lépés: futtatás – el kell buknia**

Futtatás: `npx tsx scripts/_proba-tudastar-validacio.ts`
Várt: hiba, a `../lib/tudastar-validacio` modul nem található.

- [ ] **3. lépés: `lib/tudastar-validacio.ts`**

```ts
/**
 * A tudástár-kártya szerkesztőjének szerver-oldali validátora. A hibakulcs a mező `id`-ja (a szerkesztőben
 * id = name, egy űrlap van az oldalon); a dinamikus sorok mezői `<lista>.<i>.<mezo>` (pl. `szakaszok.0.cim`).
 * A teljesen üres sor kimarad, a félig kitöltött sor hibát kap. A feliratok és a korlátok a szerkesztővel
 * közösek (lib/tudastar-szotar.ts `KARTYA_CIMKEK`, `SOR_MEZOK`).
 */
import { EMAIL_RE, mezo, nevelovel, type MezoHibak, type ParseResult } from './urlap';
import {
  CIM_MAX, EMAIL_MAX, KARTYA_CIMKEK, NEV_CIMKE, NEV_MAX, OSSZEFOGLALO_CIMKE, OSSZEFOGLALO_MAX, ROVIDITES_MAX,
  SOR_EGYSEG, SOR_MAX, SOR_MEZOK, SZOVEG_MAX, TELEFON_MAX, URL_MAX, isKategoriaSlug,
  type KartyaAdat, type KartyaTipus, type KartyaTorzs, type SorLista, type SorMezoSzabaly, type SorTipusok,
} from './tudastar-szotar';

const SEMA_RE = /^[a-z][a-z0-9+.-]*:/i;
// A hosztnév két, nem üres címkéje között pont áll (a „valami”, a „localhost” és a „localhost.” is kiesik).
const PONTOS_HOSZT_RE = /[^.]\.[^.]/;
const URL_HIBA = 'Érvényes webcímet adj meg (pl. https://nkfih.gov.hu).';

/**
 * Egy URL ellenőrzése és normalizálása: séma nélkül `https://` kerül elé; csak `http:`/`https:` séma,
 * felhasználónév/jelszó nélkül (a honlap-mezőbe tévedt `info@nkfih.gov.hu` és a megtévesztő
 * `https://nkfih.gov.hu@masik.hu` így kiesik), pontot tartalmazó hosztnévvel. Siker: a `new URL()`
 * normalizált `href`-je; hiba: `null`. A hosszkorlátot a hívó nézi.
 */
export function normalizalUrl(nyers: string): string | null {
  const s = SEMA_RE.test(nyers) ? nyers : `https://${nyers}`;
  let u: URL;
  try {
    u = new URL(s);
  } catch {
    return null;
  }
  if (u.protocol !== 'http:' && u.protocol !== 'https:') return null;
  if (u.username || u.password) return null;
  if (!PONTOS_HOSZT_RE.test(u.hostname)) return null;
  return u.href;
}

/** Űrlap-szintű hiba; ha már van, hozzáfűzi (több lista is túllépheti a korlátját). */
function formHiba(errors: MezoHibak, uzenet: string): void {
  errors.form = errors.form ? `${errors.form} ${uzenet}` : uzenet;
}

/**
 * Szöveges érték ellenőrzése: kötelezőség és hossz; a hibát az `errors`-ba írja, az értéket visszaadja. Az
 * egysoros mezőben (`tobbsoros` nélkül) a sortörés szóköz lesz: a szerkesztő `<input>`-ja a következő mentéskor
 * szóköz nélkül dobná el, és a szavak egybefolynának.
 */
function szoveg(
  nyers: string, id: string, cimke: string, max: number, kotelezo: boolean, errors: MezoHibak, tobbsoros = false,
): string {
  const v = tobbsoros ? nyers : nyers.replace(/\s*\n\s*/g, ' ');
  if (kotelezo && !v) errors[id] = `${nevelovel(cimke)} kötelező.`;
  else if (v.length > max) errors[id] = `${nevelovel(cimke)} legfeljebb ${max} karakter.`;
  return v;
}

/** Webcím: üresen `''` (vagy hiba, ha kötelező); különben a normalizált URL, hibánál a beírt érték. */
function webcim(v: string, id: string, cimke: string, max: number, kotelezo: boolean, errors: MezoHibak): string {
  if (!v || v.length > max) return szoveg(v, id, cimke, max, kotelezo, errors);
  const url = normalizalUrl(v);
  if (url === null) errors[id] = URL_HIBA;
  else if (url.length > max) errors[id] = `${nevelovel(cimke)} kódolva (az ékezetes betűk és a szóközök kódolásával) hosszabb ${max} karakternél.`;
  else return url;
  return v;
}

// A sorindex legfeljebb 4 jegyű, vezető nulla nélkül (a `SOR_MAX` ennél jóval kisebb); a hosszabb indexű mezőt nem olvassuk.
const sorIndexRe = (lista: SorLista) => new RegExp(`^${lista}\\.(0|[1-9]\\d{0,3})\\.`);

/** A dinamikus sorok indexei a FormData-ban (`<lista>.<i>.<mezo>`), növekvő sorrendben. */
function sorIndexek(fd: FormData, lista: SorLista): number[] {
  const re = sorIndexRe(lista);
  const halmaz = new Set<number>();
  for (const k of fd.keys()) {
    const m = re.exec(k);
    if (m) halmaz.add(Number(m[1]));
  }
  return [...halmaz].sort((a, b) => a - b);
}

/**
 * Egy dinamikus lista sorai a `SOR_MEZOK` szabályaival: a teljesen üres sor kimarad, a többit mezőnként
 * ellenőrzi. Ha a beküldött sorok száma a korlát fölött van, egy sort sem olvas (a szerkesztő ennél többet
 * nem küld; a sok kulcsos kérés így sem lassítja a feldolgozást).
 */
function sorok<L extends SorLista>(fd: FormData, lista: L, errors: MezoHibak): SorTipusok[L][] {
  const indexek = sorIndexek(fd, lista);
  if (indexek.length > SOR_MAX[lista]) {
    formHiba(errors, `Legfeljebb ${SOR_MAX[lista]} ${SOR_EGYSEG[lista]} adható meg.`);
    return [];
  }
  const mezok = Object.entries(SOR_MEZOK[lista]) as [string, SorMezoSzabaly][];
  const eredmeny: SorTipusok[L][] = [];
  for (const i of indexek) {
    const ertekek = mezok.map(([kulcs, sz]) => ({ kulcs, sz, v: mezo(fd, `${lista}.${i}.${kulcs}`) }));
    if (ertekek.every((e) => e.v === '')) continue;
    const sor: Record<string, string> = {};
    for (const { kulcs, sz, v } of ertekek) {
      const id = `${lista}.${i}.${kulcs}`;
      sor[kulcs] = sz.url
        ? webcim(v, id, sz.cimke, sz.max, Boolean(sz.kotelezo), errors)
        : szoveg(v, id, sz.cimke, sz.max, Boolean(sz.kotelezo), errors, Boolean(sz.tobbsoros));
    }
    // A `SOR_MEZOK` a sortípus minden mezőjét kimerítően felsorolja, ezért a sor teljes.
    eredmeny.push(sor as unknown as SorTipusok[L]);
  }
  return eredmeny;
}

/** A szerkesztő űrlapja; a `tipus` a meglévő kártyáé (szerkesztés) vagy a rejtett mezőé (létrehozás). */
export function validalKartya(fd: FormData, tipus: KartyaTipus): ParseResult<KartyaAdat> {
  const errors: MezoHibak = {};
  const C = KARTYA_CIMKEK;
  const kategoria = mezo(fd, 'kategoria');
  if (!isKategoriaSlug(kategoria)) errors.kategoria = 'Válassz kategóriát.';
  const nev = szoveg(mezo(fd, 'nev'), 'nev', NEV_CIMKE[tipus], NEV_MAX, true, errors);
  const rovidites = szoveg(mezo(fd, 'rovidites'), 'rovidites', C.rovidites, ROVIDITES_MAX, false, errors);
  const osszefoglalo = szoveg(mezo(fd, 'osszefoglalo'), 'osszefoglalo', OSSZEFOGLALO_CIMKE[tipus], OSSZEFOGLALO_MAX, true, errors, true);
  const honlap = webcim(mezo(fd, 'honlap'), 'honlap', C.honlap, URL_MAX, false, errors);
  const linkek = sorok(fd, 'linkek', errors);

  let torzs: KartyaTorzs;
  if (tipus === 'intezmeny') {
    const email = szoveg(mezo(fd, 'email'), 'email', C.email, EMAIL_MAX, false, errors);
    if (email && !errors.email && !EMAIL_RE.test(email)) errors.email = 'Érvénytelen e-mail cím.';
    torzs = {
      tipus,
      tartalom: {
        profil: szoveg(mezo(fd, 'profil'), 'profil', C.profil, SZOVEG_MAX, false, errors, true),
        tevekenyseg: szoveg(mezo(fd, 'tevekenyseg'), 'tevekenyseg', C.tevekenyseg, SZOVEG_MAX, false, errors, true),
        kapcsolat: {
          email,
          telefon: szoveg(mezo(fd, 'telefon'), 'telefon', C.telefon, TELEFON_MAX, false, errors),
          cim: szoveg(mezo(fd, 'cim'), 'cim', C.cim, CIM_MAX, false, errors),
        },
        szakaszok: sorok(fd, 'szakaszok', errors),
        programok: sorok(fd, 'programok', errors),
        linkek,
      },
    };
  } else {
    torzs = { tipus, tartalom: { sorok: sorok(fd, 'sorok', errors), linkek } };
  }
  if (Object.keys(errors).length > 0 || !isKategoriaSlug(kategoria)) return { ok: false, errors };
  return { ok: true, data: { kategoria, nev, rovidites: rovidites || null, osszefoglalo, honlap: honlap || null, ...torzs } };
}
```

- [ ] **4. lépés: `lib/tudastar-jog.ts`**

```ts
import type { AppSession } from './session';

/** A tudástár kártyáit csak a központ (admin) szerkeszti; olvasni minden bejelentkezett felhasználó tud. */
export function canEditTudastar(session: AppSession): boolean {
  return session.role === 'admin';
}
```

- [ ] **5. lépés: `lib/routes.ts`** – a fejkomment alá: `import type { KartyaTipus } from './tudastar-szotar';` (üres sorral), és a fájl végére:

```ts
// A slugok csak [a-z0-9-] karakterek (lib/slug.ts), ezért kódolás nélkül kerülnek az URL-be.

/** A tudástár nyitólapja, vagy egy kategória-oldala. */
export function tudastarUrl(kategoria?: string): string {
  return kategoria ? `/tudastar/${kategoria}` : '/tudastar';
}

/** A tudástár-kártya horgonyának id-ja a kategória-oldalon. */
export function kartyaHorgony(slug: string): string {
  return `k-${slug}`;
}

/** Ahol a kártya megjelenik: az intézménynek saját oldala van, a lista a kategória-oldalon, a horgonyánál. */
export function kartyaUrl(k: { kategoria: string; slug: string; tipus: KartyaTipus }): string {
  return k.tipus === 'intezmeny' ? `/tudastar/${k.kategoria}/${k.slug}` : `${tudastarUrl(k.kategoria)}#${kartyaHorgony(k.slug)}`;
}

/** A kártya szerkesztője (mindkét típusnál a `[slug]` alatt). */
export function kartyaSzerkesztoUrl(k: { kategoria: string; slug: string }): string {
  return `/tudastar/${k.kategoria}/${k.slug}/szerkesztes`;
}

/** Új kártya szerkesztője a kategóriában. */
export function ujKartyaUrl(kategoria: string, tipus: KartyaTipus): string {
  return `/tudastar/${kategoria}/uj?tipus=${tipus}`;
}
```

- [ ] **5b. lépés: `lib/urlap.ts` – a fájl végére** (az `EMAIL_RE` a `lib/felhasznalo-validacio.ts`-ből költözik ide, a két validátor közös):

```ts
// Közel a Better Auth (zod) e-mail szabályához: nincs vezető/záró/dupla pont a helyi
// részben, a domain végén legalább 2 betűs TLD. Ami itt átmegy, de a Better Auth elutasít
// (pl. ékezetes cím), azt a felhasználó-kezelés server actionje INVALID_EMAIL hibaként az email mezőre teszi.
export const EMAIL_RE = /^(?!.*\.\.)[^\s@.](?:[^\s@]*[^\s@.])?@[^\s@]+\.[A-Za-z]{2,}$/;

const MAGANHANGZO_RE = /^[aáeéiíoóöőuúüű]/i;

/**
 * A mezőcímke névelővel, mondat elejére: „Név” → „A név”, „Összefoglaló” → „Az összefoglaló”. Közönséges,
 * nagybetűvel kezdődő szóra való (az első betűt kisbetűsíti); rövidítéssel, számmal vagy tulajdonnévvel kezdődő
 * címkére nem.
 */
export function nevelovel(cimke: string): string {
  const kis = cimke.charAt(0).toLowerCase() + cimke.slice(1);
  return `${MAGANHANGZO_RE.test(kis) ? 'Az' : 'A'} ${kis}`;
}
```

A `lib/felhasznalo-validacio.ts`-ből töröld a helyi `EMAIL_RE`-t a fölötte álló háromsoros kommenttel együtt, és az importot cseréld: `import { EMAIL_RE, mezo, type MezoHibak, type ParseResult } from './urlap';`. Ellenőrzés: `grep -rn "EMAIL_RE =" lib` – csak a `lib/urlap.ts`.

- [ ] **6. lépés: futtatás – át kell mennie**

Futtatás: `npx tsx scripts/_proba-tudastar-validacio.ts && npx tsx scripts/_proba-tudastar.ts`
Várt: `tudástár validátor: minden ellenőrzés rendben`, majd `tudástár: minden ellenőrzés rendben`

- [ ] **7. lépés: `npx tsc --noEmit`** – várt: üres kimenet.

- [ ] **8. lépés: commit**

```bash
git add lib/tudastar-validacio.ts lib/tudastar-jog.ts lib/routes.ts lib/urlap.ts lib/felhasznalo-validacio.ts
git commit -m "feat(tudastar): kártya-validátor (URL-normalizálás, dinamikus sorok), jog és útvonal-segédek

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Tábla, migráció, lekérdezések

**Fájlok:**
- Létrehoz: `db/schema/tudastar.ts`, `db/queries/tudastar.ts`, `drizzle/0012_tudastar.sql` (generált), `drizzle/meta/0012_snapshot.json` (generált)
- Módosít: `db/schema/index.ts`, `drizzle/meta/_journal.json` (generált)
- Teszt (eldobható): `scripts/_proba-tudastar-db.ts` – **csak DB-másolaton**

- [ ] **1. lépés: `db/schema/tudastar.ts`**

```ts
import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';
import type { KartyaTartalom } from '../../lib/tudastar-szotar';

// TéT Tudástár: egy sor = egy kártya. A `kategoria` a lib/tudastar-szotar.ts TUDASTAR_KATEGORIAK slugja,
// a `tipus` 'intezmeny' | 'lista' (létrehozás után nem változik). A `tartalom` típusonként más alakú JSON;
// olvasáskor a normalizalTartalom() egészíti ki (régi sor, új almező). A `szerzo_id` az utolsó módosító.
// A CHECK-ek a kézi DB-módosítás ellen védenek: hibás JSON-nál a Drizzle JSON.parse-a minden tudástár-oldalt
// eldöntené (a normalizáló ezt már nem tudja elkapni). A kategóriára nincs CHECK, mert a lista a kódban él.
export const tudastarKartya = sqliteTable(
  'tudastar_kartya',
  {
    id: text('id').primaryKey(),
    kategoria: text('kategoria').notNull(),
    slug: text('slug').notNull(),
    tipus: text('tipus').notNull(),
    nev: text('nev').notNull(),
    rovidites: text('rovidites'),
    osszefoglalo: text('osszefoglalo').notNull(),
    honlap: text('honlap'),
    sorrend: integer('sorrend').notNull(),
    tartalom: text('tartalom', { mode: 'json' }).$type<KartyaTartalom>().notNull(),
    szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('tudastar_kartya_slug_idx').on(table.slug),
    index('tudastar_kartya_kategoria_idx').on(table.kategoria, table.sorrend),
    check('tudastar_kartya_tipus_check', sql`${table.tipus} in ('intezmeny', 'lista')`),
    check('tudastar_kartya_tartalom_check', sql`json_valid(${table.tartalom})`),
  ],
);
```

- [ ] **2. lépés: `db/schema/index.ts` – a végére új sor**

```ts
export * from './tudastar';
```

- [ ] **3. lépés: migráció generálása**

Futtatás: `npx drizzle-kit generate --name tudastar`
Várt: `drizzle/0012_tudastar.sql` (és a meta-fájlok) a következő tartalommal:

```sql
CREATE TABLE `tudastar_kartya` (
	`id` text PRIMARY KEY NOT NULL,
	`kategoria` text NOT NULL,
	`slug` text NOT NULL,
	`tipus` text NOT NULL,
	`nev` text NOT NULL,
	`rovidites` text,
	`osszefoglalo` text NOT NULL,
	`honlap` text,
	`sorrend` integer NOT NULL,
	`tartalom` text NOT NULL,
	`szerzo_id` text,
	`created_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	`updated_at` integer DEFAULT (cast(unixepoch('subsecond') * 1000 as integer)) NOT NULL,
	FOREIGN KEY (`szerzo_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE set null,
	CONSTRAINT "tudastar_kartya_tipus_check" CHECK("tudastar_kartya"."tipus" in ('intezmeny', 'lista')),
	CONSTRAINT "tudastar_kartya_tartalom_check" CHECK(json_valid("tudastar_kartya"."tartalom"))
);
--> statement-breakpoint
CREATE UNIQUE INDEX `tudastar_kartya_slug_idx` ON `tudastar_kartya` (`slug`);--> statement-breakpoint
CREATE INDEX `tudastar_kartya_kategoria_idx` ON `tudastar_kartya` (`kategoria`,`sorrend`);
```

Ha a sorszám nem 0012 (közben más migráció került a `main`-re), a későbbi lépésekben a tényleges számot használd.

- [ ] **4. lépés: az ellenőrző script (DB-másolaton fut)**

`scripts/_proba-tudastar-db.ts`:

```ts
// Eldobható ellenőrzés a tudástár lekérdezéseire egy DB-MÁSOLATON (a hívó állítja a DATABASE_URL-t). Futtatás:
//   cp data/tet.db <másolat> && DATABASE_URL=<másolat> npx drizzle-kit migrate
//   DATABASE_URL=<másolat> NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_proba-tudastar-db.ts
// Nem commitolandó; a valódi data/tet.db-n ne futtasd.
import assert from 'node:assert/strict';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { tudastarKartya, user } from '../db/schema';
import { createKartya, deleteKartya, getKartya, listKartyak, mozgatKartya, updateKartya } from '../db/queries/tudastar';
import { TUDASTAR_KATEGORIAK, uresTartalom, type KartyaAdat } from '../lib/tudastar-szotar';

const url = process.env.DATABASE_URL ?? '';
assert.ok(url && !url.endsWith('data/tet.db'), 'csak DB-másolaton fut (DATABASE_URL)');
const admin = db.select({ id: user.id }).from(user).where(eq(user.role, 'admin')).get();
const sqlite = db.$client;
assert.ok(admin, 'nincs admin a DB-ben');

const lista = (nev: string, kategoria: KartyaAdat['kategoria'] = 'egyetemek'): KartyaAdat => ({
  kategoria, nev, rovidites: null, osszefoglalo: 'x', honlap: null, tipus: 'lista', tartalom: uresTartalom('lista'),
});
const egyetemek = () => listKartyak().filter((k) => k.kategoria === 'egyetemek');
const kezdo = egyetemek().length;

// létrehozás: slug-ütközés és a foglalt „uj”
const s1 = createKartya(lista('Próba A'), 'proba', admin.id);
const s2 = createKartya(lista('Próba B'), 'proba', admin.id);
const s3 = createKartya(lista('Új'), 'uj', admin.id);
assert.deepEqual([s1, s2, s3], ['proba', 'proba-2', 'uj-2']);

// a listKartyak React.cache-e tsx-ben (kérés-kontextus nélkül) nem cache-el: minden hívás friss
const most = egyetemek();
assert.equal(most.length, kezdo + 3);
assert.deepEqual(most.slice(-3).map((k) => k.slug), ['proba', 'proba-2', 'uj-2'], 'új kártya a kategória végére');
const sorrendek = listKartyak().map((k) => TUDASTAR_KATEGORIAK.findIndex((c) => c.slug === k.kategoria));
assert.deepEqual(sorrendek, [...sorrendek].sort((a, b) => a - b), 'a 9 kategória sorrendjében');

// mozgatás: az updatedAt nem változik
const a = most.at(-3)!;
const b = most.at(-2)!;
const c = most.at(-1)!;
mozgatKartya(b.id, 'fel');
const utana = egyetemek();
assert.deepEqual(utana.slice(-3).map((k) => k.slug), ['proba-2', 'proba', 'uj-2']);
assert.equal(getKartya(b.id)!.updatedAt.getTime(), b.updatedAt.getTime(), 'a mozgatás nem lépteti az updatedAt-ot');
mozgatKartya(utana.at(-1)!.id, 'le'); // az utolsó lejjebb: nem csinál semmit
assert.equal(egyetemek().at(-1)!.slug, 'uj-2');

// mentés verzióval: jó verzió → ok; régi verzió → elavult; kategóriaváltás → az új kategória végére
const varakozasVege = Date.now() + 5;
while (Date.now() < varakozasVege); // az updatedAt ms-felbontású: a mentés ideje biztosan más legyen
assert.equal(updateKartya(a.id, { ...lista('Próba A2'), honlap: 'https://a.hu/' }, a.updatedAt.getTime(), admin.id), 'ok');
assert.equal(updateKartya(a.id, lista('Próba A3'), a.updatedAt.getTime(), admin.id), 'elavult');
const a2 = getKartya(a.id)!;
assert.equal(a2.nev, 'Próba A2');
assert.equal(updateKartya(a.id, lista('Próba A', 'befektetok'), a2.updatedAt.getTime(), admin.id), 'ok');
assert.equal(listKartyak().filter((k) => k.kategoria === 'befektetok').at(-1)!.id, a.id);

// a hívó objektumának többi kulcsa nem kerül a DB-be: a slug marad, az updatedAt lép (a verzió nem kerülhető meg)
const a3 = getKartya(a.id)!;
const varakozas2 = Date.now() + 5;
while (Date.now() < varakozas2);
const elavultObjektum = { ...a3, nev: 'Próba A4', slug: 'eltereles' }; // Kartya: a típus engedi (KartyaAdat-ként adható át)
assert.equal(updateKartya(a.id, elavultObjektum, a3.updatedAt.getTime(), admin.id), 'ok');
const a4 = getKartya(a.id)!;
assert.equal(a4.slug, a3.slug);
assert.ok(a4.updatedAt.getTime() > a3.updatedAt.getTime(), 'a mentés lépteti az updatedAt-ot');
assert.equal(updateKartya(a.id, lista('x'), a3.updatedAt.getTime(), admin.id), 'elavult');
assert.throws(() => updateKartya(a.id, { ...lista('x'), tipus: 'intezmeny', tartalom: uresTartalom('intezmeny') }, a4.updatedAt.getTime(), admin.id), /típusa nem változhat/);
assert.throws(() => createKartya(lista('x'), '', admin.id), /érvénytelen slug-alap/);

// azonos sorrend-értékek (kézi módosításból): a mozgatás újraszámoz, és cserél
db.update(tudastarKartya).set({ sorrend: 50 }).where(eq(tudastarKartya.kategoria, 'egyetemek')).run();
const azonosak = egyetemek().map((k) => k.id);
mozgatKartya(azonosak[1], 'fel');
assert.deepEqual(egyetemek().map((k) => k.id), [azonosak[1], azonosak[0], ...azonosak.slice(2)]);
assert.deepEqual(egyetemek().map((k) => k.sorrend), azonosak.map((_, i) => i + 1));

// a CHECK-ek: hibás JSON és ismeretlen típus nem kerülhet a táblába
assert.throws(() => sqlite.prepare("update tudastar_kartya set tartalom = '{' where id = ?").run(a.id), /CHECK constraint failed/);
assert.throws(() => sqlite.prepare("update tudastar_kartya set tipus = 'x' where id = ?").run(a.id), /CHECK constraint failed/);

// törlés
for (const k of [a, b, c]) assert.ok(deleteKartya(k.id));
assert.equal(updateKartya(a.id, lista('x'), 0, admin.id), 'nincs');
assert.equal(egyetemek().length, kezdo);
console.log('tudástár DB: minden ellenőrzés rendben');
```

- [ ] **5. lépés: futtatás – el kell buknia**

```bash
T=$(mktemp -d) && cp data/tet.db "$T/proba.db" && DATABASE_URL="$T/proba.db" npx drizzle-kit migrate
DATABASE_URL="$T/proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_proba-tudastar-db.ts
```

Várt: a migráció lefut a másolaton, a script hibát ad: a `../db/queries/tudastar` modul nem található. (A `data/tet.db` WAL-ja a futó dev szerver mellett nem kerül a másolatba – ez itt nem számít, a másolatnak csak a sémája és egy admin felhasználója kell.)

- [ ] **6. lépés: `db/queries/tudastar.ts`**

```ts
import 'server-only';
import { asc, eq, like, max, or, sql } from 'drizzle-orm';
import { cache } from 'react';
import { db } from '../index';
import { tudastarKartya } from '../schema';
import { SLUG_RE, szabadSlug } from '../../lib/slug';
import {
  FOGLALT_SLUGOK, isKategoriaSlug, kategoriaIndex, normalizalTartalom, type Kartya, type KartyaAdat, type KategoriaSlug,
} from '../../lib/tudastar-szotar';

type Tx = Parameters<Parameters<typeof db.transaction>[0]>[0];
type Sor = typeof tudastarKartya.$inferSelect;

// Az írás előtti olvasás miatt `immediate`: egy másik folyamat (pl. migráció ugyanazon a DB-n) írása így a
// busy_timeout-ig várakoztat, nem SQLITE_BUSY_SNAPSHOT-tal bukik el.
const IRAS = { behavior: 'immediate' } as const;

/** A kártya-sorrend a kategórián belül: a megjelenítéssel azonos (sorrend, név, id) – a mozgatás is ezt követi. */
const KATEGORIA_SORREND = [asc(tudastarKartya.sorrend), asc(tudastarKartya.nev), asc(tudastarKartya.id)];

/** DB-sor → kártya; ismeretlen kategória vagy típus (csak kézi DB-módosításból lehet) → null, logolva. */
function kartyabol(r: Sor): Kartya | null {
  if (!isKategoriaSlug(r.kategoria)) {
    console.warn(`[tudastar] ismeretlen kategória, a kártya kimarad: ${r.id} (${r.kategoria})`);
    return null;
  }
  const alap = {
    id: r.id, slug: r.slug, kategoria: r.kategoria, nev: r.nev, rovidites: r.rovidites,
    osszefoglalo: r.osszefoglalo, honlap: r.honlap, sorrend: r.sorrend, updatedAt: r.updatedAt,
  };
  if (r.tipus === 'intezmeny') return { ...alap, tipus: 'intezmeny', tartalom: normalizalTartalom('intezmeny', r.tartalom) };
  if (r.tipus === 'lista') return { ...alap, tipus: 'lista', tartalom: normalizalTartalom('lista', r.tartalom) };
  console.warn(`[tudastar] ismeretlen típus, a kártya kimarad: ${r.id} (${r.tipus})`);
  return null;
}

/**
 * Minden kártya a 9 kategória sorrendjében, azon belül a `KATEGORIA_SORREND` szerint. React.cache: a page egy kérésen
 * belül egyszer kérdez le; a visszaadott tömböt ne mutáld.
 */
export const listKartyak = cache((): Kartya[] => {
  const sorok = db.select().from(tudastarKartya).orderBy(...KATEGORIA_SORREND).all();
  return sorok
    .map(kartyabol)
    .filter((k): k is Kartya => k !== null)
    .sort((a, b) => kategoriaIndex(a.kategoria) - kategoriaIndex(b.kategoria));
});

export function getKartya(id: string): Kartya | null {
  const r = db.select().from(tudastarKartya).where(eq(tudastarKartya.id, id)).get();
  return r ? kartyabol(r) : null;
}

/** A kategória következő szabad sorrend-értéke (a végére). */
function kovetkezoSorrend(tx: Tx, kategoria: KategoriaSlug): number {
  const r = tx.select({ m: max(tudastarKartya.sorrend) }).from(tudastarKartya).where(eq(tudastarKartya.kategoria, kategoria)).get();
  return (r?.m ?? 0) + 1;
}

/** A tárolt mezők a validált adatból, explicit felsorolással (a hívó objektumának többi kulcsa nem kerül a DB-be). */
function taroltMezok(adat: KartyaAdat) {
  const { kategoria, nev, rovidites, osszefoglalo, honlap, tartalom } = adat;
  return { kategoria, nev, rovidites, osszefoglalo, honlap, tartalom };
}

/** Új kártya a kategória végére; a slug az `alap`-ból, ütközésnél `-2`, `-3`… utótaggal. Visszaadja a slugot. */
export function createKartya(adat: KartyaAdat, alap: string, szerzoId: string): string {
  if (!SLUG_RE.test(alap)) throw new Error(`[tudastar] érvénytelen slug-alap: ${alap}`);
  return db.transaction((tx) => {
    const foglalt = new Set(
      tx
        .select({ slug: tudastarKartya.slug })
        .from(tudastarKartya)
        .where(or(eq(tudastarKartya.slug, alap), like(tudastarKartya.slug, `${alap}-%`)))
        .all()
        .map((r) => r.slug),
    );
    const slug = szabadSlug(alap, (s) => foglalt.has(s) || FOGLALT_SLUGOK.includes(s));
    tx.insert(tudastarKartya)
      .values({
        ...taroltMezok(adat),
        id: crypto.randomUUID(),
        tipus: adat.tipus,
        slug,
        sorrend: kovetkezoSorrend(tx, adat.kategoria),
        szerzoId,
      })
      .run();
    return slug;
  }, IRAS);
}

export type ModositasEredmeny = 'ok' | 'nincs' | 'elavult';

/**
 * A kártya mentése, ha a `verzio` (a szerkesztő megnyitásakori `updatedAt`, ms) még érvényes: különben
 * `elavult` (közben más mentette), törölt kártyánál `nincs`. Csak a tartalmi mezőket írja (a slug, a típus
 * és az `updatedAt` nem jöhet a hívótól; az utóbbit a séma `$onUpdate`-je lépteti). A típus nem változhat:
 * eltérésnél hibát dob (programhiba – az action a meglévő kártya típusát adja át). Kategóriaváltáskor a
 * kártya az új kategória végére kerül; különben a `sorrend` nem változik.
 */
export function updateKartya(id: string, adat: KartyaAdat, verzio: number, szerzoId: string): ModositasEredmeny {
  return db.transaction((tx) => {
    const r = tx
      .select({ kategoria: tudastarKartya.kategoria, tipus: tudastarKartya.tipus, updatedAt: tudastarKartya.updatedAt })
      .from(tudastarKartya)
      .where(eq(tudastarKartya.id, id))
      .get();
    if (!r) return 'nincs';
    if (r.tipus !== adat.tipus) throw new Error(`[tudastar] a kártya típusa nem változhat: ${id} (${r.tipus} → ${adat.tipus})`);
    if (r.updatedAt.getTime() !== verzio) return 'elavult';
    const sorrend = r.kategoria === adat.kategoria ? {} : { sorrend: kovetkezoSorrend(tx, adat.kategoria) };
    tx.update(tudastarKartya).set({ ...taroltMezok(adat), ...sorrend, szerzoId }).where(eq(tudastarKartya.id, id)).run();
    return 'ok';
  }, IRAS);
}

export function deleteKartya(id: string): boolean {
  return db.delete(tudastarKartya).where(eq(tudastarKartya.id, id)).run().changes > 0;
}

/**
 * Csere a kategórián belüli szomszéddal (`fel`: az előzővel, `le`: a következővel), a megjelenítés
 * sorrendjében. A kategória sorrendjét közben 1..n-re számozza újra, így az azonos `sorrend`-ű (kézi
 * módosításból származó) kártyák is mozgathatók. Az `updatedAt` nem változik: a „Frissítve” dátum a
 * tartalomra vonatkozik, és a nyitott szerkesztő verziója sem avul el tőle.
 */
export function mozgatKartya(id: string, irany: 'fel' | 'le'): void {
  db.transaction((tx) => {
    const r = tx.select({ kategoria: tudastarKartya.kategoria }).from(tudastarKartya).where(eq(tudastarKartya.id, id)).get();
    if (!r) return;
    const sorok = tx
      .select({ id: tudastarKartya.id, sorrend: tudastarKartya.sorrend })
      .from(tudastarKartya)
      .where(eq(tudastarKartya.kategoria, r.kategoria))
      .orderBy(...KATEGORIA_SORREND)
      .all();
    const i = sorok.findIndex((s) => s.id === id);
    const j = irany === 'fel' ? i - 1 : i + 1;
    if (j < 0 || j >= sorok.length) return;
    [sorok[i], sorok[j]] = [sorok[j], sorok[i]];
    sorok.forEach((s, k) => {
      if (s.sorrend === k + 1) return;
      tx.update(tudastarKartya)
        .set({ sorrend: k + 1, updatedAt: sql`${tudastarKartya.updatedAt}` })
        .where(eq(tudastarKartya.id, s.id))
        .run();
    });
  }, IRAS);
}
```

- [ ] **7. lépés: futtatás – át kell mennie**

Futtatás (ugyanazzal a `$T`-vel): `DATABASE_URL="$T/proba.db" NODE_OPTIONS="--conditions=react-server" npx tsx scripts/_proba-tudastar-db.ts`
Várt: a `[db] …` sor után `tudástár DB: minden ellenőrzés rendben`. Utána: `rm -r "${T:?}"`.

- [ ] **8. lépés: `npx tsc --noEmit`** – várt: üres kimenet.

- [ ] **9. lépés: commit** (a `data/tet.db` nélkül)

```bash
git add db/schema/tudastar.ts db/schema/index.ts db/queries/tudastar.ts drizzle/0012_tudastar.sql drizzle/meta/0012_snapshot.json drizzle/meta/_journal.json
git commit -m "feat(tudastar): tudastar_kartya tábla (0012) és lekérdezések – verziós mentés, mozgatás updatedAt nélkül

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Menü, nyitólap (csempék, keresés), a régi demó törlése

**Fájlok:**
- Módosít: `lib/navigacio.ts`, `app/(app)/tudastar/page.tsx` (teljes csere)
- Létrehoz: `app/(app)/tudastar/components/SzamJelveny.tsx`, `KeresoBemenet.tsx`, `KeresoMezo.tsx`, `KategoriaCsempek.tsx`, `KeresesiTalalatok.tsx`
- Töröl: `lib/knowledge.ts` (csak a régi `page.tsx` importálta – ellenőrizd: `grep -rn "knowledge" app components lib db scripts --include='*.ts' --include='*.tsx'` a csere után üres)

- [ ] **1. lépés: `lib/navigacio.ts` – a Tudástár sor**

Cseréld:

```ts
    href: '/tudastar',
    cim: 'Tudástár',
    alcim: 'Magyarországról ajánlható programok, partnerek és együttműködési formák',
    menu: { ikon: '◫', felirat: 'Tudástár ??' },
```

erre:

```ts
    href: '/tudastar',
    cim: 'TéT Tudástár',
    alcim: 'A magyar innovációs ökoszisztéma szereplői és kapcsolódó programok',
    menu: { ikon: '◫', felirat: 'TéT Tudástár' },
```

- [ ] **2. lépés: `app/(app)/tudastar/components/SzamJelveny.tsx`**

```tsx
/** A kategória sorszáma négyzetes jelvényben (csempe, címsor, találati csoport). */
export function SzamJelveny({ szam }: { szam: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
    >
      {szam}
    </span>
  );
}
```

- [ ] **3. lépés: `app/(app)/tudastar/components/KeresoBemenet.tsx` és `KeresoMezo.tsx`**

A `next/form` `Form`-ja GET-űrlapnál kliens-oldali navigációt ad (lásd `node_modules/next/dist/docs/01-app/03-api-reference/02-components/form.md`). A beviteli mező külön kliens-komponens: render közben igazodik a `q`-hoz, hogy kereséskor a fókusz megmaradjon.

```tsx
'use client';

import { useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { KERESES_MAX } from '../../../../lib/tudastar-kereses';

/**
 * A keresőmező vezérelt beviteli eleme. Az oldal kliens-állapota a `?q=` változásakor megmarad (a Next
 * állapot-kulcsában nincs benne a keresési paraméter), ezért a mező a szerverről jövő `q`-hoz render közben
 * igazodik (a „Keresés törlése” és a Vissza gomb után is): `key`-es újracsatolás helyett, mert az a kereséskor
 * fókuszban lévő mezőt kicserélné, és a fókusz a lap elejére esne.
 */
export function KeresoBemenet({ id, q, placeholder }: { id: string; q: string; placeholder: string }) {
  const [ertek, setErtek] = useState(q);
  const [elozoQ, setElozoQ] = useState(q);
  if (elozoQ !== q) {
    setElozoQ(q);
    setErtek(q);
  }
  return (
    <Input
      id={id}
      name="q"
      type="search"
      value={ertek}
      onChange={(e) => setErtek(e.target.value)}
      maxLength={KERESES_MAX}
      placeholder={placeholder}
      className="min-w-0 flex-1"
    />
  );
}
```

```tsx
import { SearchIcon } from 'lucide-react';
import Form from 'next/form';
import { Button } from '../../../../components/ui/button';
import { tudastarUrl } from '../../../../lib/routes';
import { KeresoBemenet } from './KeresoBemenet';

/**
 * Keresés a tudástárban: GET űrlap a nyitólapra (`?q=`), a Next `Form`-jával kliens-oldali navigációval. A
 * találati lista így linkelhető, és a Vissza gomb is működik. `kompakt`: a kategória-menü keskeny változata
 * (ikon-gomb).
 */
export function KeresoMezo({ id, q = '', kompakt = false }: { id: string; q?: string; kompakt?: boolean }) {
  return (
    <Form action={tudastarUrl()} role="search" className="flex gap-2">
      <label htmlFor={id} className="sr-only">
        Keresés a tudástárban
      </label>
      <KeresoBemenet id={id} q={q} placeholder={kompakt ? 'Keresés…' : 'Keresés: intézmény, program, kulcsszó…'} />
      {kompakt ? (
        <Button type="submit" variant="outline" size="icon" aria-label="Keresés">
          <SearchIcon aria-hidden />
        </Button>
      ) : (
        <Button type="submit" variant="outline">
          Keresés
        </Button>
      )}
    </Form>
  );
}
```

- [ ] **4. lépés: `app/(app)/tudastar/components/KategoriaCsempek.tsx`**

```tsx
import Link from 'next/link';
import { tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK, type Kartya } from '../../../../lib/tudastar-szotar';
import { SzamJelveny } from './SzamJelveny';

/** A nyitólap: a 9 kategória csempéje (szám, cím, egysoros leírás, kártyaszám), mindegyik a kategória-oldalra visz. */
export function KategoriaCsempek({ kartyak }: { kartyak: readonly Kartya[] }) {
  const darabok = new Map<string, number>();
  for (const k of kartyak) darabok.set(k.kategoria, (darabok.get(k.kategoria) ?? 0) + 1);
  return (
    <section aria-labelledby="tudastar-kategoriak">
      <h2 id="tudastar-kategoriak" className="sr-only">
        Kategóriák
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {TUDASTAR_KATEGORIAK.map((k) => (
          <li key={k.slug}>
            <Link
              href={tudastarUrl(k.slug)}
              className="flex h-full flex-col gap-1.5 rounded-xl bg-card p-4 text-card-foreground no-underline ring-1 ring-foreground/10 transition-shadow hover:no-underline hover:ring-foreground/30 focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none"
            >
              <SzamJelveny szam={k.szam} />
              <span className="text-[15px] leading-snug font-semibold break-words">
                <span className="sr-only">{k.szam}. </span>
                {k.cim}
              </span>
              <span className="text-sm text-muted-foreground">{k.leiras}</span>
              <span className="mt-auto pt-1 text-xs text-muted-foreground">{darabok.get(k.slug) ?? 0} kártya</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **5. lépés: `app/(app)/tudastar/components/KeresesiTalalatok.tsx`**

```tsx
import Link from 'next/link';
import { kartyaUrl, tudastarUrl } from '../../../../lib/routes';
import type { Talalat } from '../../../../lib/tudastar-kereses';
import { TUDASTAR_KATEGORIAK } from '../../../../lib/tudastar-szotar';
import { SzamJelveny } from './SzamJelveny';

/**
 * A nyitólap `?q=`-nál: a találatok kategóriánként csoportosítva, soronként a kártya és a találat helye. A
 * találatszámot a page állandó `role="status"` régiója mondja be (az itt újonnan megjelenő címsort a felolvasó
 * nem olvassa fel magától).
 */
export function KeresesiTalalatok({ q, talalatok }: { q: string; talalatok: readonly Talalat[] }) {
  const csoportok = TUDASTAR_KATEGORIAK.map((k) => ({
    kategoria: k,
    sorok: talalatok.filter((t) => t.kartya.kategoria === k.slug),
  })).filter((c) => c.sorok.length > 0);
  return (
    <section aria-labelledby="tudastar-talalatok" className="flex flex-col gap-5">
      <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <h2 id="tudastar-talalatok" className="min-w-0 text-base font-semibold break-words">
          {talalatok.length === 0 ? `Nincs találat erre: „${q}”.` : `${talalatok.length} találat erre: „${q}”`}
        </h2>
        <Link href={tudastarUrl()} className="text-sm">
          Keresés törlése
        </Link>
      </div>
      {csoportok.map(({ kategoria, sorok }) => (
        <div key={kategoria.slug} className="flex flex-col gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <SzamJelveny szam={kategoria.szam} />
            <Link href={tudastarUrl(kategoria.slug)} className="text-foreground">
              {kategoria.cim}
            </Link>
          </h3>
          <ul className="flex flex-col divide-y divide-border rounded-xl bg-card ring-1 ring-foreground/10">
            {sorok.map(({ kartya, hol, reszlet }) => (
              <li key={kartya.id} className="flex flex-col gap-0.5 px-4 py-2.5">
                <Link href={kartyaUrl(kartya)} className="font-medium">
                  {kartya.nev}
                  {kartya.rovidites && ` (${kartya.rovidites})`}
                </Link>
                <span className="text-sm text-muted-foreground [overflow-wrap:anywhere]">
                  {hol && <span className="text-foreground">{hol}: </span>}
                  {reszlet}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}
```

- [ ] **6. lépés: `app/(app)/tudastar/page.tsx` – teljes csere**

```tsx
import type { Metadata } from 'next';
import { listKartyak } from '../../../db/queries/tudastar';
import type { SearchParams } from '../../../lib/routes';
import { KERESES_MAX, keres } from '../../../lib/tudastar-kereses';
import { requireSession } from '../../../lib/session';
import { KategoriaCsempek } from './components/KategoriaCsempek';
import { KeresesiTalalatok } from './components/KeresesiTalalatok';
import { KeresoMezo } from './components/KeresoMezo';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/** A tudástár nyitólapja: keresőmező és a 9 kategória csempéje; `?q=` esetén a keresési találatok. */
export default async function TudastarPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  await requireSession();
  const { q: nyers } = await searchParams;
  const q = (Array.isArray(nyers) ? nyers[0] : nyers)?.trim().slice(0, KERESES_MAX) ?? '';
  const kartyak = listKartyak();
  const talalatok = q ? keres(kartyak, q) : [];
  return (
    <div className="flex max-w-6xl flex-col gap-5">
      <div className="max-w-2xl">
        <KeresoMezo id="tudastar-kereses" q={q} />
      </div>
      {/* Állandó élő régió: a keresés címet nem vált, ezért a Next útvonal-bemondója hallgat; a page kliens-állapota
          a ?q= változásakor megmarad, így ennek a szövegváltozását a felolvasó bemondja. */}
      <p role="status" className="sr-only">
        {q ? (talalatok.length > 0 ? `${talalatok.length} találat erre: „${q}”` : `Nincs találat erre: „${q}”.`) : ''}
      </p>
      {q ? <KeresesiTalalatok q={q} talalatok={talalatok} /> : <KategoriaCsempek kartyak={kartyak} />}
    </div>
  );
}
```

- [ ] **7. lépés: a régi demóadat törlése**

```bash
git rm lib/knowledge.ts
grep -rn "knowledge" app components lib db --include='*.ts' --include='*.tsx'
```

Várt: a `grep` kimenete üres.

- [ ] **8. lépés: ellenőrzés**

Futtatás: `npx tsc --noEmit && npm run build`
Várt: a tsc üres; a build lefut, a route-listában szerepel a `/tudastar` (ƒ, dinamikus). A build a helyi `data/tet.db`-re alkalmazza a 0012-t – ez szándékos (a felület ezt a táblát olvassa), a DB-t nem commitoljuk.

- [ ] **9. lépés: commit**

```bash
git add lib/navigacio.ts "app/(app)/tudastar/page.tsx" "app/(app)/tudastar/components/SzamJelveny.tsx" "app/(app)/tudastar/components/KeresoBemenet.tsx" "app/(app)/tudastar/components/KeresoMezo.tsx" "app/(app)/tudastar/components/KategoriaCsempek.tsx" "app/(app)/tudastar/components/KeresesiTalalatok.tsx"
git commit -m "feat(tudastar): TéT Tudástár nyitólap – 9 kategória-csempe és keresés; a régi demó (lib/knowledge.ts) törölve

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(A `git rm` már kijelölte a `lib/knowledge.ts` törlését, az is ebbe a commitba kerül.)

---

### Task 5: Kategória-oldal, részletoldal, jobb oldali menü, ↑/↓

**Fájlok:**
- Módosít: `components/form/KuldGomb.tsx` (új opcionális propok; a meglévő hívók – `SzerkesztesGomb` – változatlanul működnek)
- Létrehoz: `app/(app)/tudastar/components/Morzsa.tsx`, `KulsoLink.tsx`, `Szoveg.tsx`, `KategoriaMenu.tsx`, `KategoriaValto.tsx`, `TudastarElrendezes.tsx`, `KartyaLablec.tsx`, `TudastarKartya.tsx`, `IntezmenyReszlet.tsx`; `app/(app)/tudastar/actions.ts` (egyelőre csak a mozgatás); `app/(app)/tudastar/[kategoria]/page.tsx`; `app/(app)/tudastar/[kategoria]/[slug]/page.tsx`

- [ ] **1. lépés: `components/form/KuldGomb.tsx` – teljes csere**

```tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '../ui/button';

type ButtonProps = React.ComponentProps<typeof Button>;

/**
 * Általános submit gomb pending állapottal (useFormStatus): a `<form action>`-t renderelő hívó így
 * Server Component maradhat (pl. a SzerkesztesGomb form-ága, a tudástár ↑/↓ gombjai). A `disabled` a
 * pending mellett tilt (pl. a lista szélén); az `aria-label` az ikon-feliratú gomboké.
 */
export function KuldGomb({
  children, variant, size, disabled, 'aria-label': ariaLabel,
}: {
  children: React.ReactNode;
  variant?: ButtonProps['variant'];
  size?: ButtonProps['size'];
  disabled?: boolean;
  'aria-label'?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant={variant} size={size} disabled={pending || disabled} aria-busy={pending} aria-label={ariaLabel}>
      {children}
    </Button>
  );
}
```

- [ ] **2. lépés: `app/(app)/tudastar/components/Morzsa.tsx`**

```tsx
import Link from 'next/link';

/** Morzsamenü; az utolsó (href nélküli) elem az aktuális oldal. */
export function Morzsa({ elemek }: { elemek: readonly { felirat: string; href?: string }[] }) {
  return (
    <nav aria-label="Morzsamenü" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {elemek.map((e, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>›</span>}
            {e.href ? (
              <Link href={e.href} className="text-muted-foreground hover:text-foreground">
                {e.felirat}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {e.felirat}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
```

- [ ] **3. lépés: `app/(app)/tudastar/components/KulsoLink.tsx`**

```tsx
import { ArrowUpRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { HasznosLink } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';

/**
 * Külső hivatkozás új lapon (`noopener noreferrer`), ↗ jellel és a felolvasónak szóló jelzéssel. Csak
 * http(s) címből lesz link: a validátor mást nem enged be, de a kézzel módosított DB-sor se adhasson
 * `javascript:` hrefet – ilyenkor a felirat sima szövegként jelenik meg.
 */
export function KulsoLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  if (!/^https?:\/\//i.test(href)) return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-baseline gap-0.5', className)}>
      {children}
      <ArrowUpRightIcon aria-hidden className="size-3 shrink-0 self-center" />
      <span className="sr-only"> (új lapon nyílik)</span>
    </a>
  );
}

/** Hasznos linkek egy sorban, tördelve. */
export function LinkLista({ linkek }: { linkek: readonly HasznosLink[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {linkek.map((l, i) => (
        <li key={i}>
          <KulsoLink href={l.url}>{l.felirat}</KulsoLink>
        </li>
      ))}
    </ul>
  );
}

/** Név (linkként, ha van webcím) + rövid leírás soronként: a listakártya sorai és az intézmény programjai. */
export function TetelLista({ sorok }: { sorok: readonly { nev: string; url: string; leiras: string }[] }) {
  return (
    <ul className="divide-y divide-input rounded-lg border border-input">
      {sorok.map((s, i) => (
        <li key={i} className="flex flex-col gap-0.5 px-3 py-2 text-sm sm:flex-row sm:items-baseline sm:gap-3">
          <span className="font-medium sm:w-2/5 sm:shrink-0">{s.url ? <KulsoLink href={s.url}>{s.nev}</KulsoLink> : s.nev}</span>
          {s.leiras && <span className="text-muted-foreground">{s.leiras}</span>}
        </li>
      ))}
    </ul>
  );
}
```

- [ ] **4. lépés: `app/(app)/tudastar/components/Szoveg.tsx`**

```tsx
import { tagolSzoveg } from '../../../../lib/tudastar-szoveg';
import { cn } from '../../../../lib/utils';

/** Sima szöveg bekezdésekre (üres sor) és felsorolásokra („- ” kezdetű sor) bontva; HTML-t nem értelmez. */
export function Szoveg({ szoveg, className }: { szoveg: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 text-sm leading-relaxed', className)}>
      {tagolSzoveg(szoveg).map((b, i) =>
        b.tipus === 'bekezdes' ? (
          <p key={i} className="whitespace-pre-line">
            {b.sorok.join('\n')}
          </p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.elemek.map((e, j) => (
              <li key={j}>{e}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
```

- [ ] **5. lépés: `app/(app)/tudastar/components/KategoriaMenu.tsx`**

```tsx
import Link from 'next/link';
import { kartyaHorgony, kartyaUrl, tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK, type Kartya, type KategoriaSlug } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';
import { KeresoMezo } from './KeresoMezo';

/**
 * A jobb oldali kategória-menü (`xl` fölött, ragadós a fejléc alatt): kis keresőmező, a 9 rövid cím, az
 * aktív kategória alatt a kártyái. A kategória-oldalon a kártya-linkek sima horgonyok (`<a href="#k-<slug>">`:
 * a natív ugrás a fókusz kiindulópontját is a kártyára teszi, a Next `Link` csak görget); a részletoldalon oda
 * visznek, ahol a kártya megjelenik (intézmény: saját oldala, lista: a horgonya), és az aktuális intézmény ki van
 * emelve. A menü a szürke lapon áll, ezért a kiemelés fehér háttér + belső keret (a `bg-muted` itt nem látszana); a
 * görgetődoboz 1-es párnája a fókuszgyűrűknek ad helyet (a görgető elem a szélén levágná őket).
 */
export function KategoriaMenu({
  aktivKategoria, kartyak, aktivSlug,
}: { aktivKategoria: KategoriaSlug; kartyak: readonly Kartya[]; aktivSlug?: string }) {
  return (
    <div className="hidden flex-col gap-3 xl:sticky xl:top-[5.5rem] xl:-m-1 xl:flex xl:max-h-[calc(100dvh-7.5rem)] xl:overflow-y-auto xl:p-1">
      <KeresoMezo id="tudastar-kereses-menu" kompakt />
      <nav aria-label="A tudástár kategóriái">
        <ol className="flex flex-col gap-0.5">
          {TUDASTAR_KATEGORIAK.map((k) => {
            const aktiv = k.slug === aktivKategoria;
            return (
              <li key={k.slug}>
                <Link
                  href={tudastarUrl(k.slug)}
                  aria-current={aktiv && !aktivSlug ? 'page' : undefined}
                  className={cn(
                    'flex gap-2 rounded-md px-2 py-1.5 text-sm text-foreground no-underline hover:bg-foreground/5 hover:no-underline',
                    aktiv && 'bg-background font-medium ring-1 ring-foreground/10 ring-inset hover:bg-background',
                  )}
                >
                  <span className="w-5 shrink-0 text-right text-muted-foreground tabular-nums">{k.szam}.</span>
                  {k.rovidCim}
                </Link>
                {aktiv && kartyak.length > 0 && (
                  <ul className="mt-0.5 mb-1 ml-7 flex flex-col border-l border-input">
                    {kartyak.map((c) => {
                      const sajat = c.slug === aktivSlug;
                      const osztaly = cn(
                        'block truncate py-1 pl-3 text-[13px] text-muted-foreground no-underline hover:text-foreground hover:no-underline',
                        sajat && 'font-medium text-foreground',
                      );
                      return (
                        <li key={c.id}>
                          {aktivSlug ? (
                            <Link href={kartyaUrl(c)} aria-current={sajat ? 'page' : undefined} title={c.nev} className={osztaly}>
                              {c.rovidites ?? c.nev}
                            </Link>
                          ) : (
                            <a href={`#${kartyaHorgony(c.slug)}`} title={c.nev} className={osztaly}>
                              {c.rovidites ?? c.nev}
                            </a>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
```

- [ ] **6. lépés: `app/(app)/tudastar/components/KategoriaValto.tsx`**

```tsx
'use client';

import { useRouter } from 'next/navigation';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Label } from '../../../../components/ui/label';
import { tudastarUrl } from '../../../../lib/routes';
import { TUDASTAR_KATEGORIAK } from '../../../../lib/tudastar-szotar';

/**
 * Keskenyebb ablakban (`xl` alatt) a jobb oldali menü helyett: kategória-választó, váltáskor a kategória-oldalra
 * navigál. Nem vezérelt; a `key` miatt útvonal-váltás után az új kategóriával indul.
 */
export function KategoriaValto({ aktiv }: { aktiv: string }) {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-1.5 xl:hidden">
      <Label htmlFor="tudastar-kategoria">Kategória</Label>
      <NativeSelect
        key={aktiv}
        id="tudastar-kategoria"
        defaultValue={aktiv}
        onChange={(e) => router.push(tudastarUrl(e.target.value))}
      >
        {TUDASTAR_KATEGORIAK.map((k) => (
          <option key={k.slug} value={k.slug}>
            {k.szam}. {k.rovidCim}
          </option>
        ))}
      </NativeSelect>
    </div>
  );
}
```

- [ ] **7. lépés: `app/(app)/tudastar/components/TudastarElrendezes.tsx`**

```tsx
import type { ReactNode } from 'react';
import type { Kartya, KategoriaSlug } from '../../../../lib/tudastar-szotar';
import { KategoriaMenu } from './KategoriaMenu';
import { KategoriaValto } from './KategoriaValto';

/**
 * A kategória- és a részletoldal váza: a tartalom mellett jobb oldalt a kategória-menü (`xl` fölött – szűkebben
 * a 238 px-es oldalsáv mellett a tartalomnak nem maradna hely), keskenyebb ablakban a tartalom fölött a
 * kategória-választó. A `kartyak` az aktív kategóriáéi.
 */
export function TudastarElrendezes({
  aktivKategoria, kartyak, aktivSlug, children,
}: { aktivKategoria: KategoriaSlug; kartyak: readonly Kartya[]; aktivSlug?: string; children: ReactNode }) {
  return (
    <div className="grid max-w-6xl items-start gap-6 xl:grid-cols-[minmax(0,1fr)_16rem]">
      <div className="flex min-w-0 flex-col gap-4">
        <KategoriaValto aktiv={aktivKategoria} />
        {children}
      </div>
      <KategoriaMenu aktivKategoria={aktivKategoria} kartyak={kartyak} aktivSlug={aktivSlug} />
    </div>
  );
}
```

- [ ] **8. lépés: `app/(app)/tudastar/components/KartyaLablec.tsx`**

```tsx
import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { KuldGomb } from '../../../../components/form/KuldGomb';
import { buttonVariants } from '../../../../components/ui/button';
import { CardFooter } from '../../../../components/ui/card';
import { formatDatum } from '../../../../lib/datum';
import { kartyaSzerkesztoUrl } from '../../../../lib/routes';
import type { Kartya } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';

/** Az admin ↑/↓ műveletei (bind-olt `mozgatKartyaAction`); hiányzó irány = a lista szélén, letiltott gomb. */
export interface Mozgatas {
  fel?: () => Promise<void>;
  le?: () => Promise<void>;
}

/**
 * A kártyák közös lábléce: bal oldalt a hívó linkjei (Részletek, honlap), jobb oldalt a „Frissítve” dátum,
 * adminnál a Szerkesztés link és a ↑/↓ gombok (mindkettő külön `<form>`, a `KuldGomb` pendingjével).
 */
export function KartyaLablec({ kartya, mozgatas, children }: { kartya: Kartya; mozgatas?: Mozgatas; children?: ReactNode }) {
  return (
    <CardFooter className="flex-wrap gap-x-4 gap-y-2 text-xs">
      {children}
      <div className="ml-auto flex flex-wrap items-center justify-end gap-x-4 gap-y-2">
        <span className="text-muted-foreground">Frissítve: {formatDatum(kartya.updatedAt)}</span>
        {mozgatas && (
          <div className="flex items-center gap-1">
            <Link href={kartyaSzerkesztoUrl(kartya)} className={cn(buttonVariants({ variant: 'outline', size: 'sm' }))}>
              Szerkesztés<span className="sr-only">: {kartya.nev}</span>
            </Link>
            <form action={mozgatas.fel}>
              <KuldGomb variant="ghost" size="icon-sm" disabled={!mozgatas.fel} aria-label={`Feljebb: ${kartya.nev}`}>
                <ArrowUpIcon aria-hidden />
              </KuldGomb>
            </form>
            <form action={mozgatas.le}>
              <KuldGomb variant="ghost" size="icon-sm" disabled={!mozgatas.le} aria-label={`Lejjebb: ${kartya.nev}`}>
                <ArrowDownIcon aria-hidden />
              </KuldGomb>
            </form>
          </div>
        )}
      </div>
    </CardFooter>
  );
}
```

- [ ] **9. lépés: `app/(app)/tudastar/components/TudastarKartya.tsx`**

```tsx
import Link from 'next/link';
import { Badge } from '../../../../components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { kartyaHorgony, kartyaUrl } from '../../../../lib/routes';
import { TIPUS_CIMKE, type Kartya } from '../../../../lib/tudastar-szotar';
import { megjelenoHoszt } from '../../../../lib/tudastar-szoveg';
import { KartyaLablec, type Mozgatas } from './KartyaLablec';
import { KulsoLink, LinkLista, TetelLista } from './KulsoLink';

/**
 * Egy kártya a kategória-oldalon. Intézmény: összefoglaló, „Részletek →” és honlap. Lista: bevezető, a
 * sorok (név · megjegyzés · link) és a hasznos linkek; részletoldala nincs. Az `id` a menü és a keresési
 * találat horgonya; a `scroll-mt` a ragadós fejléc alá görget.
 */
export function TudastarKartya({ kartya, mozgatas }: { kartya: Kartya; mozgatas?: Mozgatas }) {
  return (
    <Card id={kartyaHorgony(kartya.slug)} className="scroll-mt-24">
      <CardHeader>
        <Badge variant="secondary" className="w-fit">
          {TIPUS_CIMKE[kartya.tipus]}
        </Badge>
        <CardTitle role="heading" aria-level={3}>
          {kartya.nev}
          {kartya.rovidites && <>{' '}<span className="ml-1 font-normal text-muted-foreground">{kartya.rovidites}</span></>}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <p className="text-sm leading-relaxed">{kartya.osszefoglalo}</p>
        {kartya.tipus === 'lista' && (
          <>
            {kartya.tartalom.sorok.length > 0 && (
              <TetelLista sorok={kartya.tartalom.sorok.map((s) => ({ nev: s.nev, url: s.url, leiras: s.megjegyzes }))} />
            )}
            {kartya.tartalom.linkek.length > 0 && <LinkLista linkek={kartya.tartalom.linkek} />}
          </>
        )}
      </CardContent>
      <KartyaLablec kartya={kartya} mozgatas={mozgatas}>
        {kartya.tipus === 'intezmeny' && (
          <Link href={kartyaUrl(kartya)} className="font-medium">
            Részletek<span className="sr-only">: {kartya.nev}</span> <span aria-hidden>→</span>
          </Link>
        )}
        {kartya.honlap && <KulsoLink href={kartya.honlap}>{megjelenoHoszt(kartya.honlap)}</KulsoLink>}
      </KartyaLablec>
    </Card>
  );
}
```

- [ ] **10. lépés: `app/(app)/tudastar/components/IntezmenyReszlet.tsx`**

```tsx
import Link from 'next/link';
import type { ReactNode } from 'react';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../../../components/ui/card';
import { formatDatum } from '../../../../lib/datum';
import { kartyaSzerkesztoUrl } from '../../../../lib/routes';
import type { KartyaTipusu } from '../../../../lib/tudastar-szotar';
import { megjelenoHoszt } from '../../../../lib/tudastar-szoveg';
import { cn } from '../../../../lib/utils';
import { KulsoLink, LinkLista, TetelLista } from './KulsoLink';
import { Szoveg } from './Szoveg';

function Blokk({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <Card size="sm">
      <CardHeader>
        <CardTitle role="heading" aria-level={3}>
          {cim}
        </CardTitle>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

/** Kapcsolat-sor: címke + érték egy rácsban. */
function Adat({ cimke, children }: { cimke: string; children: ReactNode }) {
  return (
    <>
      <dt className="text-muted-foreground">{cimke}</dt>
      <dd className="min-w-0 break-words">{children}</dd>
    </>
  );
}

/**
 * Az intézmény részletoldala: összefoglaló, majd Profil és Kapcsolat, Tevékenység, a szabad szakaszok,
 * Programok, Hasznos linkek – az üres blokk nem jelenik meg.
 */
export function IntezmenyReszlet({ kartya, szerkeszthet }: { kartya: KartyaTipusu<'intezmeny'>; szerkeszthet: boolean }) {
  const t = kartya.tartalom;
  const { email, telefon, cim } = t.kapcsolat;
  const vanKapcsolat = Boolean(kartya.honlap || email || telefon || cim);
  return (
    <article className="flex flex-col gap-4">
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-start gap-3">
          <h2 className="text-xl leading-snug font-semibold">
            {kartya.nev}
            {kartya.rovidites && <>{' '}<span className="ml-1 text-base font-normal text-muted-foreground">{kartya.rovidites}</span></>}
          </h2>
          {szerkeszthet && (
            <Link href={kartyaSzerkesztoUrl(kartya)} className={cn('ml-auto', buttonVariants({ variant: 'outline' }))}>
              Szerkesztés
            </Link>
          )}
        </div>
        <p className="max-w-3xl text-sm leading-relaxed">{kartya.osszefoglalo}</p>
      </header>

      {(t.profil || vanKapcsolat) && (
        <div className={cn('grid items-start gap-4', t.profil && vanKapcsolat && 'xl:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]')}>
          {t.profil && (
            <Blokk cim="Profil">
              <Szoveg szoveg={t.profil} />
            </Blokk>
          )}
          {vanKapcsolat && (
            <Blokk cim="Kapcsolat">
              <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 text-sm">
                {kartya.honlap && (
                  <Adat cimke="Web">
                    <KulsoLink href={kartya.honlap}>{megjelenoHoszt(kartya.honlap)}</KulsoLink>
                  </Adat>
                )}
                {email && (
                  <Adat cimke="E-mail">
                    <a href={`mailto:${email}`}>{email}</a>
                  </Adat>
                )}
                {telefon && <Adat cimke="Telefon">{telefon}</Adat>}
                {cim && <Adat cimke="Cím">{cim}</Adat>}
              </dl>
            </Blokk>
          )}
        </div>
      )}
      {t.tevekenyseg && (
        <Blokk cim="Tevékenység">
          <Szoveg szoveg={t.tevekenyseg} />
        </Blokk>
      )}
      {t.szakaszok.map((sz, i) => (
        <Blokk key={i} cim={sz.cim}>
          <Szoveg szoveg={sz.szoveg} />
        </Blokk>
      ))}
      {t.programok.length > 0 && (
        <Blokk cim="Programok">
          <TetelLista sorok={t.programok} />
        </Blokk>
      )}
      {t.linkek.length > 0 && (
        <Blokk cim="Hasznos linkek">
          <LinkLista linkek={t.linkek} />
        </Blokk>
      )}
      <p className="text-xs text-muted-foreground">Frissítve: {formatDatum(kartya.updatedAt)}</p>
    </article>
  );
}
```

- [ ] **11. lépés: `app/(app)/tudastar/actions.ts` – egyelőre csak a mozgatás**

A 6. task ezt a fájlt a teljes változatra cseréli.

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { unstable_rethrow } from 'next/navigation';
import { mozgatKartya } from '../../../db/queries/tudastar';
import { canEditTudastar } from '../../../lib/tudastar-jog';
import { requireSession } from '../../../lib/session';

/** ↑/↓ a kategória-oldalon (bind-olt `<form action>`): a szomszéddal cserél sorrendet. */
export async function mozgatKartyaAction(id: string, irany: 'fel' | 'le'): Promise<void> {
  const session = await requireSession();
  // A bind-olt argumentumok a kliensen át érkeznek vissza: az irányt futásidőben is ellenőrizzük.
  if (!canEditTudastar(session) || (irany !== 'fel' && irany !== 'le')) return;
  try {
    mozgatKartya(id, irany);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] mozgatás sikertelen:', err);
    return;
  }
  // A kódbázis többi actionjével azonos; a `'/tudastar'` tag a `(app)` route group miatt nem illeszkedne.
  revalidatePath('/', 'layout');
}
```

- [ ] **12. lépés: `app/(app)/tudastar/[kategoria]/page.tsx`**

```tsx
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { buttonVariants } from '../../../../components/ui/button';
import { listKartyak } from '../../../../db/queries/tudastar';
import { tudastarUrl, ujKartyaUrl } from '../../../../lib/routes';
import { canEditTudastar } from '../../../../lib/tudastar-jog';
import { kategoriaBySlug } from '../../../../lib/tudastar-szotar';
import { requireSession } from '../../../../lib/session';
import { cn } from '../../../../lib/utils';
import { mozgatKartyaAction } from '../actions';
import { Morzsa } from '../components/Morzsa';
import { SzamJelveny } from '../components/SzamJelveny';
import { TudastarElrendezes } from '../components/TudastarElrendezes';
import { TudastarKartya } from '../components/TudastarKartya';

// Statikus cím: mindenki mindent olvashat, a dinamikus cím nem védene semmit, és külön lekérdezést kérne.
export const metadata: Metadata = { title: 'TéT Tudástár' };

/** Egy kategória: bevezető és a kártyái sorrendben; adminnak új kártya és ↑/↓. Ismeretlen kategória: 404. */
export default async function KategoriaPage({ params }: { params: Promise<{ kategoria: string }> }) {
  const session = await requireSession();
  const { kategoria: slug } = await params;
  const kategoria = kategoriaBySlug(slug);
  if (!kategoria) notFound();
  const admin = canEditTudastar(session);
  const kartyak = listKartyak().filter((k) => k.kategoria === kategoria.slug);
  return (
    <TudastarElrendezes aktivKategoria={kategoria.slug} kartyak={kartyak}>
      <Morzsa elemek={[{ felirat: 'TéT Tudástár', href: tudastarUrl() }, { felirat: `${kategoria.szam}. ${kategoria.rovidCim}` }]} />
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-3">
          <h2 className="flex items-center gap-2 text-xl leading-snug font-semibold">
            <SzamJelveny szam={kategoria.szam} />
            {kategoria.cim}
          </h2>
          {admin && (
            <div className="ml-auto flex gap-2">
              <Link href={ujKartyaUrl(kategoria.slug, 'intezmeny')} className={cn(buttonVariants({ variant: 'outline' }))}>
                <span aria-hidden>+</span> Új intézmény
              </Link>
              <Link href={ujKartyaUrl(kategoria.slug, 'lista')} className={cn(buttonVariants({ variant: 'outline' }))}>
                <span aria-hidden>+</span> Új lista
              </Link>
            </div>
          )}
        </div>
        <p className="max-w-3xl text-sm leading-relaxed text-muted-foreground">{kategoria.bevezeto}</p>
      </header>
      {kartyak.length === 0 ? (
        <p className="rounded-xl border border-dashed border-input p-6 text-sm text-muted-foreground">
          Ebben a kategóriában még nincs kártya.
        </p>
      ) : (
        kartyak.map((k, i) => (
          <TudastarKartya
            key={k.id}
            kartya={k}
            mozgatas={
              admin
                ? {
                    fel: i > 0 ? mozgatKartyaAction.bind(null, k.id, 'fel') : undefined,
                    le: i < kartyak.length - 1 ? mozgatKartyaAction.bind(null, k.id, 'le') : undefined,
                  }
                : undefined
            }
          />
        ))
      )}
    </TudastarElrendezes>
  );
}
```

- [ ] **13. lépés: `app/(app)/tudastar/[kategoria]/[slug]/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listKartyak } from '../../../../../db/queries/tudastar';
import { tudastarUrl } from '../../../../../lib/routes';
import { canEditTudastar } from '../../../../../lib/tudastar-jog';
import { kategoriaBySlug } from '../../../../../lib/tudastar-szotar';
import { requireSession } from '../../../../../lib/session';
import { IntezmenyReszlet } from '../../components/IntezmenyReszlet';
import { Morzsa } from '../../components/Morzsa';
import { TudastarElrendezes } from '../../components/TudastarElrendezes';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/**
 * Egy intézmény részletoldala. 404: ismeretlen kategória vagy slug, a slug más kategóriáé, vagy a kártya
 * lista (annak nincs részletoldala).
 */
export default async function IntezmenyPage({ params }: { params: Promise<{ kategoria: string; slug: string }> }) {
  const session = await requireSession();
  const { kategoria: kategoriaSlug, slug } = await params;
  const kategoria = kategoriaBySlug(kategoriaSlug);
  if (!kategoria) notFound();
  const kartyak = listKartyak().filter((k) => k.kategoria === kategoria.slug);
  const kartya = kartyak.find((k) => k.slug === slug);
  if (!kartya || kartya.tipus !== 'intezmeny') notFound();
  return (
    <TudastarElrendezes aktivKategoria={kategoria.slug} kartyak={kartyak} aktivSlug={kartya.slug}>
      <Morzsa
        elemek={[
          { felirat: 'TéT Tudástár', href: tudastarUrl() },
          { felirat: `${kategoria.szam}. ${kategoria.rovidCim}`, href: tudastarUrl(kategoria.slug) },
          { felirat: kartya.rovidites ?? kartya.nev },
        ]}
      />
      <IntezmenyReszlet kartya={kartya} szerkeszthet={canEditTudastar(session)} />
    </TudastarElrendezes>
  );
}
```

- [ ] **14. lépés: ellenőrzés**

Futtatás: `npx tsc --noEmit && npm run build`
Várt: a tsc üres; a build route-listájában `/tudastar/[kategoria]` és `/tudastar/[kategoria]/[slug]` (ƒ).

- [ ] **15. lépés: commit**

```bash
git add components/form/KuldGomb.tsx "app/(app)/tudastar/actions.ts" "app/(app)/tudastar/[kategoria]/page.tsx" "app/(app)/tudastar/[kategoria]/[slug]/page.tsx" "app/(app)/tudastar/components/Morzsa.tsx" "app/(app)/tudastar/components/KulsoLink.tsx" "app/(app)/tudastar/components/Szoveg.tsx" "app/(app)/tudastar/components/KategoriaMenu.tsx" "app/(app)/tudastar/components/KategoriaValto.tsx" "app/(app)/tudastar/components/TudastarElrendezes.tsx" "app/(app)/tudastar/components/KartyaLablec.tsx" "app/(app)/tudastar/components/TudastarKartya.tsx" "app/(app)/tudastar/components/IntezmenyReszlet.tsx"
git commit -m "feat(tudastar): kategória-oldal és intézményi részletoldal, jobb oldali kategória-menü, admin ↑/↓

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Szerkesztő (új, szerkesztés, törlés)

**Fájlok:**
- Létrehoz: `app/(app)/tudastar/components/KartyaMezo.tsx`, `UrlapBlokk.tsx`, `SorSzerkeszto.tsx`, `KartyaForm.tsx`, `KartyaTorles.tsx`; `app/(app)/tudastar/[kategoria]/uj/page.tsx`; `app/(app)/tudastar/[kategoria]/[slug]/szerkesztes/page.tsx`
- Módosít: `app/(app)/tudastar/actions.ts` (teljes csere)

- [ ] **1. lépés: `app/(app)/tudastar/components/KartyaMezo.tsx` és `UrlapBlokk.tsx`**

```tsx
'use client';

import { Mezo } from '../../../../components/form/Mezo';
import { leiroAttr } from '../../../../components/form/MezoHiba';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import type { MezoHibak } from '../../../../lib/urlap';

/**
 * A szerkesztő egy szöveges mezője (vezérelt): címke, opcionális látható súgósor, egy- vagy többsoros
 * vezérlő, hibasor. Az `id` = a `name` = a hiba kulcsa (egy űrlap van az oldalon). `szamlalo`: „n/max” a mező alatt
 * (az `aria-describedby` része, a felolvasó fókuszáláskor bemondja).
 */
export function KartyaMezo({
  id, cimke, value, onChange, max, errors, opcionalis, tobbsoros, sorok = 4, sugo, szamlalo, placeholder, inputMode, className,
}: {
  id: string;
  cimke: string;
  value: string;
  onChange: (v: string) => void;
  max: number;
  errors: MezoHibak;
  opcionalis?: boolean;
  tobbsoros?: boolean;
  sorok?: number;
  sugo?: string;
  szamlalo?: boolean;
  placeholder?: string;
  inputMode?: 'url' | 'email' | 'tel';
  className?: string;
}) {
  const szamlaloId = `${id}-szamlalo`;
  const { 'aria-describedby': leirok, ...attr } = leiroAttr(errors, id, Boolean(sugo));
  const describedby = [leirok, szamlalo && szamlaloId].filter(Boolean).join(' ') || undefined;
  return (
    <Mezo id={id} cimke={cimke} opcionalis={opcionalis} sugo={sugo} errors={errors} className={className}>
      {tobbsoros ? (
        <Textarea id={id} name={id} rows={sorok} maxLength={max} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} {...attr} aria-describedby={describedby} />
      ) : (
        <Input id={id} name={id} maxLength={max} autoComplete="off" inputMode={inputMode} placeholder={placeholder} value={value}
          onChange={(e) => onChange(e.target.value)} {...attr} aria-describedby={describedby} />
      )}
      {szamlalo && (
        <p id={szamlaloId} className="text-right text-xs text-muted-foreground tabular-nums">
          {value.length}/{max}
          <span className="sr-only"> karakter</span>
        </p>
      )}
    </Mezo>
  );
}
```

```tsx
import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

/** A szerkesztő egy blokkja: kártya címmel (2-es szint – az oldalon a fejléc h1-je fölötte az egyetlen címsor), opcionális leírással. */
export function UrlapBlokk({ cim, leiras, children }: { cim: string; leiras?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {cim}
        </CardTitle>
        {leiras && <CardDescription>{leiras}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
```

- [ ] **2. lépés: `app/(app)/tudastar/components/SorSzerkeszto.tsx`**

```tsx
'use client';

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { Button } from '../../../../components/ui/button';
import {
  SOR_EGYSEG, SOR_MAX, SOR_MEZOK, SZOVEG_SUGO, type SorLista, type SorMezoSzabaly, type SorTipusok,
} from '../../../../lib/tudastar-szotar';
import type { MezoHibak } from '../../../../lib/urlap';
import { KartyaMezo } from './KartyaMezo';

/** Egy sor az űrlapon; az `_id` stabil kliens-kulcs (a sorok mozognak és törölhetők), a mentésbe nem kerül. */
export type SorAllapot<T> = T & { _id: number };

/** Mentett lista → űrlap-sorok (1-től számozott `_id`-vel). */
export function sorokbol<T>(lista: readonly T[]): SorAllapot<T>[] {
  return lista.map((x, i) => ({ ...x, _id: i + 1 }));
}

/**
 * Egy dinamikus lista (`szakaszok`, `programok`, `linkek`, `sorok`) szerkesztője; a mezők, a korlát és a
 * feliratok a `SOR_MEZOK`/`SOR_MAX`/`SOR_EGYSEG`-ből jönnek, mint a validátornál. A mezők id-ja és neve
 * `<lista>.<i>.<mezo>` (az `i` a sor aktuális pozíciója – a validátor indexenként olvas). A
 * `RendezvenySorok` mintájára: hozzáadás után a fókusz az új sor első mezőjére, törlés után a
 * hozzáadás-gombra kerül; mozgatás után a mozgatott sor gombjára (a DOM-áthelyezés elvenné a fókuszt).
 * Törlés és mozgatás a következő beküldésig elrejti a pozícióhoz kötött sorhibákat (más sorra mutatnának).
 * A korlátnál a hozzáadás-gomb letiltva, mellette szöveges magyarázattal.
 */
export function SorSzerkeszto<L extends SorLista>({
  lista, value, onChange, errors,
}: {
  lista: L;
  value: SorAllapot<SorTipusok[L]>[];
  onChange: (v: SorAllapot<SorTipusok[L]>[]) => void;
  errors: MezoHibak;
}) {
  const hozzaadGomb = useRef<HTMLButtonElement>(null);
  // Két beküldés között az `errors` ugyanaz az objektum: amíg az, a törlés/mozgatás előtti hibák rejtve maradnak.
  const [elavultHibak, setElavultHibak] = useState<MezoHibak | null>(null);
  const hibak = elavultHibak === errors ? {} : errors;
  const mezok = Object.entries(SOR_MEZOK[lista]) as [keyof SorTipusok[L] & string, SorMezoSzabaly][];
  const egyseg = SOR_EGYSEG[lista];
  const max = SOR_MAX[lista];
  const mezoId = (i: number, kulcs: string) => `${lista}.${i}.${kulcs}`;
  // A gombok id-ja nem mezőnév-alakú (`.` helyett `-`), így egy későbbi `fel`/`le` nevű mezővel sem ütközhet.
  const gombId = (i: number, irany: 'fel' | 'le') => `${lista}.${i}-${irany}`;
  // Az egysoros mezők párosával állnak; ha páratlan sok van, az utolsó a teljes szélességet kapja.
  const egysorosak = mezok.filter(([, sz]) => !sz.tobbsoros).map(([kulcs]) => kulcs);
  const szeles = (kulcs: string, sz: SorMezoSzabaly) =>
    sz.tobbsoros || (egysorosak.length % 2 === 1 && kulcs === egysorosak[egysorosak.length - 1]);
  const set = (id: number, kulcs: keyof SorTipusok[L], v: string) =>
    onChange(value.map((s) => (s._id === id ? { ...s, [kulcs]: v } : s)));

  const ujSor = () => {
    // A `SOR_MEZOK` a sortípus minden mezőjét felsorolja, ezért az üres sor teljes.
    const ures = Object.fromEntries(mezok.map(([kulcs]) => [kulcs, ''])) as unknown as SorTipusok[L];
    flushSync(() => onChange([...value, { ...ures, _id: Math.max(0, ...value.map((s) => s._id)) + 1 }]));
    document.getElementById(mezoId(value.length, mezok[0][0]))?.focus();
  };
  const torol = (id: number) => {
    flushSync(() => {
      setElavultHibak(errors);
      onChange(value.filter((s) => s._id !== id));
    });
    hozzaadGomb.current?.focus();
  };
  const mozgat = (i: number, irany: -1 | 1) => {
    const j = i + irany;
    flushSync(() => {
      setElavultHibak(errors);
      const uj = [...value];
      [uj[i], uj[j]] = [uj[j], uj[i]];
      onChange(uj);
    });
    const ugyanaz = document.getElementById(gombId(j, irany < 0 ? 'fel' : 'le')) as HTMLButtonElement | null;
    (ugyanaz && !ugyanaz.disabled ? ugyanaz : document.getElementById(gombId(j, irany < 0 ? 'le' : 'fel')))?.focus();
  };

  return (
    <div className="flex flex-col gap-3">
      {value.map((s, i) => (
        <fieldset key={s._id} className="flex flex-col gap-3 rounded-lg border border-input p-3">
          <legend className="px-1 text-xs text-muted-foreground">
            {i + 1}. {egyseg}
          </legend>
          <div className="grid gap-3 sm:grid-cols-2">
            {mezok.map(([kulcs, sz]) => (
              <KartyaMezo
                key={kulcs}
                id={mezoId(i, kulcs)}
                cimke={sz.cimke}
                value={String(s[kulcs])}
                onChange={(v) => set(s._id, kulcs, v)}
                max={sz.max}
                errors={hibak}
                opcionalis={!sz.kotelezo}
                tobbsoros={sz.tobbsoros}
                sugo={sz.formazott ? SZOVEG_SUGO : undefined}
                placeholder={sz.url ? 'https://…' : undefined}
                inputMode={sz.url ? 'url' : undefined}
                className={szeles(kulcs, sz) ? 'sm:col-span-2' : undefined}
              />
            ))}
          </div>
          <div className="flex gap-1">
            <Button id={gombId(i, 'fel')} type="button" variant="outline" size="icon-sm" disabled={i === 0}
              aria-label={`${i + 1}. ${egyseg} feljebb`} onClick={() => mozgat(i, -1)}>
              <ArrowUpIcon aria-hidden />
            </Button>
            <Button id={gombId(i, 'le')} type="button" variant="outline" size="icon-sm" disabled={i === value.length - 1}
              aria-label={`${i + 1}. ${egyseg} lejjebb`} onClick={() => mozgat(i, 1)}>
              <ArrowDownIcon aria-hidden />
            </Button>
            <Button type="button" variant="outline" size="sm" aria-label={`${i + 1}. ${egyseg} törlése`} onClick={() => torol(s._id)}>
              Törlés
            </Button>
          </div>
        </fieldset>
      ))}
      <div className="flex items-center gap-2">
        <Button ref={hozzaadGomb} type="button" variant="outline" size="sm" disabled={value.length >= max} onClick={ujSor}>
          <span aria-hidden>+</span> Új {egyseg}
        </Button>
        {value.length >= max && (
          <span className="text-xs text-muted-foreground">
            Legfeljebb {max} {egyseg}.
          </span>
        )}
      </div>
    </div>
  );
}
```

- [ ] **3. lépés: `app/(app)/tudastar/components/KartyaTorles.tsx`**

```tsx
'use client';

import { unstable_rethrow } from 'next/navigation';
import { useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { MuveletAction } from '../../../../components/form/useMuveletForm';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Button } from '../../../../components/ui/button';

/**
 * A kártya törlése megerősítéssel (a `RiportTorles` mintája); sikernél az action a kategória-oldalra irányít.
 * `tiltva`: a szerkesztő mentése közben nem indítható (a mentés és a törlés ne versenyezzen).
 */
export function KartyaTorles({ nev, action, tiltva = false }: { nev: string; action: MuveletAction; tiltva?: boolean }) {
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();

  function torol() {
    startTransition(async () => {
      try {
        const res = await action();
        // Sikernél az action redirectel (a Next router követi): ha ide visszatérünk, hiba történt.
        toast.error(res?.errors?.form ?? 'Törlés sikertelen.');
      } catch (err) {
        unstable_rethrow(err);
        toast.error('Törlés sikertelen.');
      }
    });
  }

  return (
    <>
      <Button type="button" variant="destructive" disabled={tiltva} onClick={() => setOpen(true)}>
        Kártya törlése
      </Button>
      <AlertDialog
        open={open}
        onOpenChange={(next, details) => {
          // Futó törlés közben nem záródhat (Escape, kattintás): a művelet nem szakítható meg.
          if (!next && pending) {
            details.cancel();
            return;
          }
          setOpen(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kártya törlése</AlertDialogTitle>
            <AlertDialogDescription>„{nev}” véglegesen törlődik a tudástárból. Ez nem vonható vissza.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            {/* focusableWhenDisabled: törlés közben a fókusz a gombon marad (különben a body-ra esne). Ilyenkor natív
                disabled nincs, csak aria-disabled, ezért a letiltott kinézetet az aria-disabled: osztályok adják. */}
            <AlertDialogAction variant="destructive" disabled={pending} focusableWhenDisabled onClick={torol}
              className="aria-disabled:pointer-events-none aria-disabled:opacity-50">
              {pending ? 'Törlés…' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
```

- [ ] **4. lépés: `app/(app)/tudastar/components/KartyaForm.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { leiroAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm, type FormAction, type MuveletAction } from '../../../../components/form/useMuveletForm';
import { Button, buttonVariants } from '../../../../components/ui/button';
import {
  CIM_MAX, EMAIL_MAX, KARTYA_CIMKEK, NEV_CIMKE, NEV_MAX, OSSZEFOGLALO_CIMKE, OSSZEFOGLALO_MAX, ROVIDITES_MAX,
  SZOVEG_MAX, SZOVEG_SUGO, TELEFON_MAX, TIPUS_CIMKE, TUDASTAR_KATEGORIAK, URL_MAX, uresTartalom,
  type HasznosLink, type Kartya, type KartyaTipus, type ListaSor, type Program, type Szakasz,
} from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';
import { KartyaMezo } from './KartyaMezo';
import { KartyaTorles } from './KartyaTorles';
import { SorSzerkeszto, sorokbol, type SorAllapot } from './SorSzerkeszto';
import { UrlapBlokk } from './UrlapBlokk';

/** Az űrlap vezérelt állapota: mindkét típus mezői (a nem használtak üresek és nem renderelődnek). */
interface Urlap {
  kategoria: string;
  nev: string;
  rovidites: string;
  osszefoglalo: string;
  honlap: string;
  profil: string;
  tevekenyseg: string;
  email: string;
  telefon: string;
  cim: string;
  szakaszok: SorAllapot<Szakasz>[];
  programok: SorAllapot<Program>[];
  sorok: SorAllapot<ListaSor>[];
  linkek: SorAllapot<HasznosLink>[];
}
type SzovegKulcs = { [K in keyof Urlap]: Urlap[K] extends string ? K : never }[keyof Urlap];

function kezdoUrlap(kartya: Kartya | undefined, kategoria: string): Urlap {
  const i = kartya?.tipus === 'intezmeny' ? kartya.tartalom : uresTartalom('intezmeny');
  const l = kartya?.tipus === 'lista' ? kartya.tartalom : uresTartalom('lista');
  return {
    kategoria: kartya?.kategoria ?? kategoria,
    nev: kartya?.nev ?? '',
    rovidites: kartya?.rovidites ?? '',
    osszefoglalo: kartya?.osszefoglalo ?? '',
    honlap: kartya?.honlap ?? '',
    profil: i.profil,
    tevekenyseg: i.tevekenyseg,
    email: i.kapcsolat.email,
    telefon: i.kapcsolat.telefon,
    cim: i.kapcsolat.cim,
    szakaszok: sorokbol(i.szakaszok),
    programok: sorokbol(i.programok),
    sorok: sorokbol(l.sorok),
    linkek: sorokbol(kartya?.tartalom.linkek ?? []),
  };
}

export type KartyaFormProps = { action: FormAction; megseHref: string } & (
  | { mod: 'uj'; tipus: KartyaTipus; kategoria: string; kartya?: undefined; torlesAction?: undefined }
  | { mod: 'szerkesztes'; kartya: Kartya; torlesAction: MuveletAction; tipus?: undefined; kategoria?: undefined }
);

/**
 * A kártya szerkesztője (új és meglévő). Vezérelt mezők (a React 19 a sikeres action után az uncontrolled
 * mezőket alaphelyzetbe állítaná). Rejtett mezők: `tipus` (új), `id` + `verzio` (meglévő: az `updatedAt` ms,
 * a mentés ezzel ismeri fel a közbeni módosítást). Sikernél az action átirányít, ezért nincs siker-toast.
 */
export function KartyaForm(props: KartyaFormProps) {
  const { action, megseHref, kartya } = props;
  const tipus = props.mod === 'uj' ? props.tipus : props.kartya.tipus;
  const [state, formAction, pending] = useMuveletForm(action);
  const errors = state.errors ?? {};
  const [u, setU] = useState(() => kezdoUrlap(kartya, props.kategoria ?? ''));
  // A verzió a tartalommal együtt, a megnyitáskor rögzül: egy helyben újrarenderelt oldal (pl. évváltás a fejlécben)
  // friss `kartya`-t adhat, a mezők viszont a régi tartalmat őrzik – az élő verzió a közbeni módosítást elfedné.
  const [verzio] = useState(() => kartya?.updatedAt.getTime());
  const set = <K extends keyof Urlap>(k: K) => (v: Urlap[K]) => setU((p) => ({ ...p, [k]: v }));
  const mezo = (k: SzovegKulcs) => ({ id: k, value: u[k], onChange: set(k), errors });
  const intezmeny = tipus === 'intezmeny';
  const C = KARTYA_CIMKEK;

  return (
    <form action={formAction} noValidate className="flex max-w-4xl flex-col gap-4">
      {props.mod === 'uj' ? (
        <input type="hidden" name="tipus" value={tipus} />
      ) : (
        <>
          <input type="hidden" name="id" value={props.kartya.id} />
          <input type="hidden" name="verzio" value={verzio} />
        </>
      )}
      <UrlapBlokk
        cim={props.mod === 'uj' ? `Új ${intezmeny ? 'intézménykártya' : 'listakártya'}` : 'Alapadatok'}
        leiras={`${TIPUS_CIMKE[tipus]} · ${intezmeny ? 'a kártyán az összefoglaló látszik, a részletek külön oldalon' : 'a kártyán a bevezető és a sorok látszanak'}`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Mezo id="kategoria" cimke={C.kategoria} errors={errors} className="sm:col-span-2">
            <NativeSelect id="kategoria" name="kategoria" value={u.kategoria} onChange={(e) => set('kategoria')(e.target.value)}
              {...leiroAttr(errors, 'kategoria')}>
              {TUDASTAR_KATEGORIAK.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.szam}. {k.cim}
                </option>
              ))}
            </NativeSelect>
          </Mezo>
          <KartyaMezo {...mezo('nev')} cimke={NEV_CIMKE[tipus]} max={NEV_MAX} className="sm:col-span-2" />
          <KartyaMezo {...mezo('rovidites')} cimke={C.rovidites} opcionalis max={ROVIDITES_MAX} />
          <KartyaMezo {...mezo('honlap')} cimke={C.honlap} opcionalis max={URL_MAX} placeholder="https://…" inputMode="url" />
          <KartyaMezo {...mezo('osszefoglalo')} cimke={OSSZEFOGLALO_CIMKE[tipus]} max={OSSZEFOGLALO_MAX}
            tobbsoros sorok={3} szamlalo sugo="2–3 mondat, ez látszik a kártyán." className="sm:col-span-2" />
        </div>
      </UrlapBlokk>

      {intezmeny ? (
        <>
          <UrlapBlokk cim="Profil és tevékenység" leiras="A részletoldal első két blokkja.">
            <KartyaMezo {...mezo('profil')} cimke={C.profil} opcionalis max={SZOVEG_MAX} tobbsoros sorok={5} sugo={SZOVEG_SUGO} />
            <KartyaMezo {...mezo('tevekenyseg')} cimke={C.tevekenyseg} opcionalis max={SZOVEG_MAX} tobbsoros sorok={5} sugo={SZOVEG_SUGO} />
          </UrlapBlokk>
          <UrlapBlokk cim="Kapcsolat" leiras="Csak intézményi elérhetőség: központi e-mail, telefon, cím.">
            <div className="grid gap-4 sm:grid-cols-2">
              <KartyaMezo {...mezo('email')} cimke={C.email} opcionalis max={EMAIL_MAX} inputMode="email" />
              <KartyaMezo {...mezo('telefon')} cimke={C.telefon} opcionalis max={TELEFON_MAX} inputMode="tel" />
              <KartyaMezo {...mezo('cim')} cimke={C.cim} opcionalis max={CIM_MAX} className="sm:col-span-2" />
            </div>
          </UrlapBlokk>
          <UrlapBlokk cim="Szakaszok" leiras="Címzett szakaszok a részletoldalon, pl. KFI-stratégia, prioritások, aktuális pályázatok.">
            <SorSzerkeszto lista="szakaszok" value={u.szakaszok} onChange={set('szakaszok')} errors={errors} />
          </UrlapBlokk>
          <UrlapBlokk cim="Programok" leiras="Programonként egysoros leírás és link.">
            <SorSzerkeszto lista="programok" value={u.programok} onChange={set('programok')} errors={errors} />
          </UrlapBlokk>
        </>
      ) : (
        <UrlapBlokk cim="Sorok" leiras="A lista szereplői: név, honlap, rövid megjegyzés.">
          <SorSzerkeszto lista="sorok" value={u.sorok} onChange={set('sorok')} errors={errors} />
        </UrlapBlokk>
      )}
      <UrlapBlokk cim="Hasznos linkek" leiras="Pl. pályázatok, hírek, szolgáltatások – az élő hivatalos oldalakra.">
        <SorSzerkeszto lista="linkek" value={u.linkek} onChange={set('linkek')} errors={errors} />
      </UrlapBlokk>

      <div className="flex flex-wrap items-center gap-3">
        {props.mod === 'szerkesztes' && <KartyaTorles nev={props.kartya.nev} action={props.torlesAction} tiltva={pending} />}
        <MezoHiba mezo="form" errors={errors} alert />
        <div className="ml-auto flex gap-2">
          {/* Link + buttonVariants (nem Button render={<Link/>}): a Base UI Button natív <button>-t vár. */}
          <Link
            href={megseHref}
            className={cn(buttonVariants({ variant: 'outline' }), pending && 'pointer-events-none opacity-50')}
            aria-disabled={pending || undefined}
            tabIndex={pending ? -1 : undefined}
            onClick={(e) => {
              if (pending) e.preventDefault();
            }}
          >
            Mégse
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? 'Mentés…' : 'Mentés'}
          </Button>
        </div>
      </div>
    </form>
  );
}
```

- [ ] **5. lépés: `app/(app)/tudastar/actions.ts` – teljes csere**

```ts
'use server';

import { revalidatePath } from 'next/cache';
import { redirect, unstable_rethrow } from 'next/navigation';
import { createKartya, deleteKartya, getKartya, mozgatKartya, updateKartya } from '../../../db/queries/tudastar';
import { kartyaUrl, tudastarUrl } from '../../../lib/routes';
import { slugbol } from '../../../lib/slug';
import { canEditTudastar } from '../../../lib/tudastar-jog';
import { isKartyaTipus } from '../../../lib/tudastar-szotar';
import { validalKartya } from '../../../lib/tudastar-validacio';
import { mezo } from '../../../lib/urlap';
import { requireSession } from '../../../lib/session';
import type { MuveletState } from '../../../components/form/useMuveletForm';

const NINCS_JOG = 'Nincs jogosultságod a tudástár szerkesztéséhez.';
const TOROLVE = 'A kártya közben törlődött.';
const ELAVULT = 'A kártyát közben más módosította – töltsd újra az oldalt.';
// A revalidálás a kódbázis többi actionjével azonos: `revalidatePath('/', 'layout')`. A `'/tudastar'` útvonal-tag
// a `(app)` route group miatt egyetlen oldalra sem illeszkedne (a tag `/(app)/tudastar/…` lenne).

/**
 * Új kártya (nincs `id`, a típus a rejtett `tipus` mezőből) vagy meglévő mentése (`id` + `verzio`, a típus a
 * meglévőé). A jog hiánya, a törölt kártya és az elavult verzió form-szintű hiba (nem 404), hogy a nyitott
 * szerkesztő tartalma ne vesszen el. Siker: átirányítás oda, ahol a kártya megjelenik.
 */
export async function mentKartyaAction(_prev: MuveletState, formData: FormData): Promise<MuveletState> {
  const session = await requireSession();
  if (!canEditTudastar(session)) return { errors: { form: NINCS_JOG } };
  const id = mezo(formData, 'id');
  const meglevo = id ? getKartya(id) : null;
  if (id && !meglevo) return { errors: { form: TOROLVE } };
  const tipus = meglevo ? meglevo.tipus : mezo(formData, 'tipus');
  if (!isKartyaTipus(tipus)) return { errors: { form: 'Hibás kérés: ismeretlen kártyatípus.' } };
  const parsed = validalKartya(formData, tipus);
  if (!parsed.ok) return { errors: parsed.errors };

  let slug: string;
  try {
    if (meglevo) {
      const verzio = Number(mezo(formData, 'verzio'));
      if (!Number.isInteger(verzio) || verzio <= 0) return { errors: { form: 'Hibás kérés: hiányzik a kártya verziója.' } };
      const eredmeny = updateKartya(meglevo.id, parsed.data, verzio, session.userId);
      if (eredmeny === 'nincs') return { errors: { form: TOROLVE } };
      if (eredmeny === 'elavult') return { errors: { form: ELAVULT } };
      slug = meglevo.slug;
    } else {
      // A rövidítésből, ha abból értelmes slug lesz (pl. nem csak írásjel), különben a névből.
      slug = createKartya(parsed.data, slugbol(parsed.data.rovidites ?? '', slugbol(parsed.data.nev)), session.userId);
    }
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] mentés sikertelen:', err);
    return { errors: { form: 'Mentés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/', 'layout');
  redirect(kartyaUrl({ kategoria: parsed.data.kategoria, slug, tipus: parsed.data.tipus }));
}

/** ↑/↓ a kategória-oldalon (bind-olt `<form action>`): a szomszéddal cserél sorrendet. */
export async function mozgatKartyaAction(id: string, irany: 'fel' | 'le'): Promise<void> {
  const session = await requireSession();
  // A bind-olt argumentumok a kliensen át érkeznek vissza: az irányt futásidőben is ellenőrizzük.
  if (!canEditTudastar(session) || (irany !== 'fel' && irany !== 'le')) return;
  try {
    mozgatKartya(id, irany);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] mozgatás sikertelen:', err);
    return;
  }
  revalidatePath('/', 'layout');
}

/** Törlés a szerkesztőből (bind-olt, a dialógus hívja); siker után a kategória-oldalra irányít. */
export async function deleteKartyaAction(id: string): Promise<MuveletState> {
  const session = await requireSession();
  if (!canEditTudastar(session)) return { errors: { form: NINCS_JOG } };
  const meglevo = getKartya(id);
  if (!meglevo) return { errors: { form: TOROLVE } };
  try {
    deleteKartya(id);
  } catch (err) {
    unstable_rethrow(err);
    console.error('[tudastar] törlés sikertelen:', err);
    return { errors: { form: 'Törlés sikertelen, próbáld újra.' } };
  }
  revalidatePath('/', 'layout');
  redirect(tudastarUrl(meglevo.kategoria));
}
```

- [ ] **6. lépés: `app/(app)/tudastar/[kategoria]/uj/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { tudastarUrl, type SearchParams } from '../../../../../lib/routes';
import { isKartyaTipus, kategoriaBySlug } from '../../../../../lib/tudastar-szotar';
import { requireAdmin } from '../../../../../lib/session';
import { mentKartyaAction } from '../../actions';
import { KartyaForm } from '../../components/KartyaForm';
import { Morzsa } from '../../components/Morzsa';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/** Új kártya a kategóriában (`?tipus=intezmeny|lista`). Csak admin; ismeretlen kategória vagy típus: 404. */
export default async function UjKartyaPage({
  params, searchParams,
}: { params: Promise<{ kategoria: string }>; searchParams: Promise<SearchParams> }) {
  await requireAdmin();
  const { kategoria: slug } = await params;
  const { tipus } = await searchParams;
  const kategoria = kategoriaBySlug(slug);
  if (!kategoria || !isKartyaTipus(tipus)) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Morzsa
        elemek={[
          { felirat: 'TéT Tudástár', href: tudastarUrl() },
          { felirat: `${kategoria.szam}. ${kategoria.rovidCim}`, href: tudastarUrl(kategoria.slug) },
          { felirat: 'Új kártya' },
        ]}
      />
      <KartyaForm mod="uj" tipus={tipus} kategoria={kategoria.slug} action={mentKartyaAction} megseHref={tudastarUrl(kategoria.slug)} />
    </div>
  );
}
```

- [ ] **7. lépés: `app/(app)/tudastar/[kategoria]/[slug]/szerkesztes/page.tsx`**

```tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { listKartyak } from '../../../../../../db/queries/tudastar';
import { kartyaUrl, tudastarUrl } from '../../../../../../lib/routes';
import { kategoriaBySlug } from '../../../../../../lib/tudastar-szotar';
import { requireAdmin } from '../../../../../../lib/session';
import { deleteKartyaAction, mentKartyaAction } from '../../../actions';
import { KartyaForm } from '../../../components/KartyaForm';
import { Morzsa } from '../../../components/Morzsa';

export const metadata: Metadata = { title: 'TéT Tudástár' };

/** Meglévő kártya szerkesztője (mindkét típus). Csak admin; ismeretlen vagy más kategóriájú kártya: 404. */
export default async function KartyaSzerkesztesPage({ params }: { params: Promise<{ kategoria: string; slug: string }> }) {
  await requireAdmin();
  const { kategoria: kategoriaSlug, slug } = await params;
  const kategoria = kategoriaBySlug(kategoriaSlug);
  if (!kategoria) notFound();
  const kartya = listKartyak().find((k) => k.kategoria === kategoria.slug && k.slug === slug);
  if (!kartya) notFound();
  return (
    <div className="flex flex-col gap-4">
      <Morzsa
        elemek={[
          { felirat: 'TéT Tudástár', href: tudastarUrl() },
          { felirat: `${kategoria.szam}. ${kategoria.rovidCim}`, href: tudastarUrl(kategoria.slug) },
          { felirat: kartya.rovidites ?? kartya.nev, href: kartyaUrl(kartya) },
          { felirat: 'Szerkesztés' },
        ]}
      />
      <KartyaForm
        mod="szerkesztes"
        kartya={kartya}
        action={mentKartyaAction}
        torlesAction={deleteKartyaAction.bind(null, kartya.id)}
        megseHref={kartyaUrl(kartya)}
      />
    </div>
  );
}
```

- [ ] **8. lépés: ellenőrzés**

Futtatás: `npx tsc --noEmit && npm run build && npx tsx scripts/_proba-tudastar.ts && npx tsx scripts/_proba-tudastar-validacio.ts`
Várt: a tsc üres; a build route-listájában `/tudastar/[kategoria]/uj` és `/tudastar/[kategoria]/[slug]/szerkesztes`; a két script „rendben”.

- [ ] **9. lépés: commit**

```bash
git add "app/(app)/tudastar/actions.ts" "app/(app)/tudastar/[kategoria]/uj/page.tsx" "app/(app)/tudastar/[kategoria]/[slug]/szerkesztes/page.tsx" "app/(app)/tudastar/components/KartyaMezo.tsx" "app/(app)/tudastar/components/UrlapBlokk.tsx" "app/(app)/tudastar/components/SorSzerkeszto.tsx" "app/(app)/tudastar/components/KartyaForm.tsx" "app/(app)/tudastar/components/KartyaTorles.tsx"
git commit -m "feat(tudastar): kártya-szerkesztő – dinamikus sorok, verziós mentés, törlés megerősítéssel

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Dokumentáció (CLAUDE.md, spec), az eldobható scriptek törlése

**Fájlok:**
- Módosít: `CLAUDE.md`, `README.md`, `docs/superpowers/specs/2026-11-02-tet-tudastar-design.md`
- Töröl (nem commitolt fájlok): `scripts/_proba-tudastar.ts`, `scripts/_proba-tudastar-validacio.ts`, `scripts/_proba-tudastar-db.ts`

- [ ] **1. lépés: `CLAUDE.md` – „Mi ez” bekezdés**

Cseréld:

```
A projekt átmeneti állapotban van: a tudástár és a monitoring még a `lib/data.ts` / `lib/knowledge.ts` demóadataiból dolgozik; az országprofil (és vele a térkép), a riportok (információs bejegyzések), a kommunikáció (ticketek) és a felhasználók már DB-ből.
```

erre:

```
A projekt átmeneti állapotban van: a monitoring még a `lib/data.ts` demóadataiból dolgozik; az országprofil (és vele a térkép), a riportok (információs bejegyzések), a kommunikáció (ticketek), a tudástár és a felhasználók már DB-ből.
```

- [ ] **2. lépés: `CLAUDE.md` – új „TéT Tudástár” bekezdés a „Kommunikáció (ticketek)” bekezdés után, a „Demó pontszámlogika” elé**

```
**TéT Tudástár.** A magyar innovációs ökoszisztéma szereplői és kapcsolódó programjai az attaséknak: eligazító összefoglalók és az élő hivatalos oldalakra mutató linkek. A 9 kategória **a kódban** van (`lib/tudastar-szotar.ts` `TUDASTAR_KATEGORIAK`: `slug`, `szam`, `cim`, `rovidCim` – a menübe –, `leiras` – a nyitólap csempéjére –, `bevezeto` – a kategória-oldal tetejére; a szerkezet rögzített, a szövegeket fejlesztő módosítja), a kártyák a DB-ben: `db/schema/tudastar.ts` (`tudastar_kartya`; `tipus` `intezmeny` | `lista`, létrehozás után nem változik; `slug` globálisan egyedi, létrehozáskor a rövidítésből vagy a névből – `lib/slug.ts` `slugbol`/`szabadSlug` –, átnevezéskor és kategóriaváltáskor sem változik; `sorrend` a kategórián belül; a `tartalom` egy JSON-oszlop, típusonként más alakú – `IntezmenyTartalom`: profil, tevékenység, kapcsolat, szabad címzett szakaszok, programok, linkek; `ListaTartalom`: sorok, linkek –, olvasáskor a `normalizalTartalom` egészíti ki, ezért új almezőhöz nem kell migráció, almező átnevezéséhez igen; `szerzo_id` az utolsó módosító; CHECK: `tipus` a két érték egyike, a `tartalom` `json_valid` – hibás JSON-nál a Drizzle `JSON.parse`-a minden tudástár-oldalt eldöntené). Lekérdezések `db/queries/tudastar.ts`: `listKartyak` (React `cache()`; a 9 kategória sorrendjében, azon belül `KATEGORIA_SORREND`: sorrend, név, id; ismeretlen kategóriájú vagy típusú sort logolva kihagy; a visszaadott tömböt ne mutáld), `getKartya`, `createKartya` (a hívó adja a slug-alapot; szabad slug + a kategória végére, egy tranzakcióban), `updateKartya` (csak a tartalmi mezőket írja, explicit felsorolással – a hívó objektumának többi kulcsa, pl. egy régi `updatedAt`, nem kerülhet a DB-be –, a típusváltásra hibát dob; verzióval: a szerkesztő megnyitásakori `updatedAt` ms-ban; eltérésnél `elavult`, törölt kártyánál `nincs`; kategóriaváltáskor az új kategória végére), `deleteKartya`, `mozgatKartya` (csere a szomszéddal a megjelenítés sorrendjében, a kategória 1..n-re újraszámozásával – az azonos `sorrend`-ű kártyák is mozgathatók); az író tranzakciók `immediate`-ek. A szerkesztő és a validátor közös táblái a szótárban: `KARTYA_CIMKEK`, `NEV_CIMKE`/`OSSZEFOGLALO_CIMKE` (típusonként: „Név”/„Lista címe”, „Összefoglaló”/„Bevezető”), `SOR_MEZOK` (a négy dinamikus lista mezői a szerkesztőbeli sorrendben, mezőnév szerint kimerítő – új almező fordítási hiba, amíg nincs szabálya; típusszintű őr: minden sormező szöveg), `SOR_MAX`, `SOR_EGYSEG`, `SZOVEG_SUGO`. Validátor `lib/tudastar-validacio.ts` (`validalKartya(fd, tipus)`, hibakulcs = a mező id-ja = a `name`; a dinamikus sorok `<lista>.<i>.<mezo>` – az index legfeljebb 4 jegyű, a `SOR_MAX`-nál több sort nem olvas –, a teljesen üres sor kimarad, a félig kitöltött hibát kap; egysoros mezőben a sortörés szóköz lesz; hibaüzenet a kódbázis stílusában a `lib/urlap.ts` `nevelovel`-jével („A név kötelező.”); `normalizalUrl`: séma nélkül `https://` elé, csak http(s), felhasználónév/jelszó nélkül, pontot tartalmazó hoszt, a `new URL().href` kerül tárolásra; az `EMAIL_RE` a `lib/urlap.ts`-ben, a felhasználó-kezeléssel közös), jog `lib/tudastar-jog.ts` `canEditTudastar` (admin; olvasni mindenki), keresés `lib/tudastar-kereses.ts` `keres` (ékezet- és kisbetű-érzéketlen, minden szónak ugyanabban a kártyában kell lennie, JS-ben; a találat `hol`/`reszlet` része a legtöbb szót tartalmazó rész, a név helyett), megjelenítés `lib/tudastar-szoveg.ts` (`tagolSzoveg`: üres sor = bekezdés, „- ” vagy „• ” kezdetű sor = felsorolás, HTML-t nem értelmez; `megjelenoHoszt`), útvonalak `lib/routes.ts` (`tudastarUrl`, `kartyaUrl` – intézmény: a részletoldala, lista: a kategória-oldal `#k-<slug>` horgonya –, `kartyaHorgony`, `kartyaSzerkesztoUrl`, `ujKartyaUrl`). Route-ok: `/tudastar` (keresőmező – `next/form` GET, `?q=`; a bemenet a vezérelt `KeresoBemenet`, amely a `q`-hoz render közben igazodik, hogy kereséskor a fókusz megmaradjon – a page kliens-állapota `?q=` változáskor megmarad –, és a találatszámot állandó `role="status"` régió mondja be, mert a cím nem változik – és a 9 csempe; `?q=` esetén a `KeresesiTalalatok` kategóriánként), `/tudastar/[kategoria]` (bevezető + kártyák; adminnak „+ Új intézmény/lista” és ↑/↓), `/tudastar/[kategoria]/[slug]` (csak intézmény; lista vagy más kategóriájú slug: 404), `/tudastar/[kategoria]/[slug]/szerkesztes` és `/tudastar/[kategoria]/uj?tipus=` (`requireAdmin()`). A kategória- és a részletoldal váza a `TudastarElrendezes`: jobb oldalt `xl` fölött a ragadós `KategoriaMenu` (kis kereső, a 9 rövid cím, az aktív kategória kártyái – a kategória-oldalon sima `<a>` horgonyok – a natív ugrás a fókuszt is a kártyához viszi –, a részletoldalon a `kartyaUrl`, az aktuális kiemelve), alatta a `KategoriaValto` natív select. Mindkét típust egy `TudastarKartya` rajzolja, közös `KartyaLablec`-kel („Frissítve”, adminnál Szerkesztés és ↑/↓ – bind-olt `<form action>`, `KuldGomb`); a részletoldal `IntezmenyReszlet` (üres blokk nem jelenik meg). Szerkesztő: `KartyaForm` (vezérelt `Urlap`, rejtett `tipus` vagy `id` + `verzio` – a verzió a tartalommal együtt, a megnyitáskor rögzül `useState`-ben, mert egy helyben újrarenderelt oldal, pl. évváltás a fejlécben, friss `kartya`-t adhat, és az élő verzió a közbeni módosítást elfedné), `UrlapBlokk`, `KartyaMezo`, a generikus `SorSzerkeszto` (a lista nevéből a `SOR_MEZOK`-ra épül; stabil `_id`, ↑/↓/törlés, fókuszkezelés és sorhiba-elrejtés a `RendezvenySorok` mintájára; a gombok id-ja `<lista>.<i>-fel/-le`), `KartyaTorles` (a `RiportTorles` mintája, mentés közben tiltva). Action-ök `app/(app)/tudastar/actions.ts`: `mentKartyaAction` (a jog hiánya, a törölt kártya és az elavult verzió form-szintű hiba, nem 404; siker → `revalidatePath('/', 'layout')` – a `'/tudastar'` tag a `(app)` route group miatt nem illeszkedne – + átirányítás a `kartyaUrl`-re), `mozgatKartyaAction`, `deleteKartyaAction`.

Amire figyelni kell:
- Az `uj` slug foglalt (`FOGLALT_SLUGOK`): a statikus `/tudastar/[kategoria]/uj` szegmens elnyelné az ilyen slugú kártyát. Új statikus szegmens a `[kategoria]` alatt csak a listába felvéve.
- A `mozgatKartya` az `updatedAt`-ot szándékosan **nem** lépteti (``updatedAt: sql`${tudastarKartya.updatedAt}` ``, a `setIntezkedes` mintája): a „Frissítve” dátum a tartalomra vonatkozik, és a nyitott szerkesztő verziója sem avul el a sorrend miatt.
- A kategória-oldal ↑/↓ gombjai után a fókusz nem marad a gombon (a kártya DOM-ja áthelyeződik) – ismert korlát; a szerkesztő `SorSzerkeszto`-ja viszont visszaadja.
- A `metadata` minden tudástár-oldalon statikus („TéT Tudástár”): mindenki mindent olvashat, a dinamikus cím nem védene semmit.
```

- [ ] **3. lépés: `CLAUDE.md` – a két régi hivatkozás**

A „Demó pontszámlogika” bekezdésben cseréld: `A `lib/data`/`lib/score` csak a `/monitoring`-é (a tudástár szókészlete, `FIELDS`, a `lib/knowledge.ts`-ben van): a közös bundle-be ne kerüljön.` → `A `lib/data`/`lib/score` csak a `/monitoring`-é: a közös bundle-be ne kerüljön.`

A „UI és stílus” részben cseréld: `hardcode-olt színekkel (`FIELD_COLORS` a `lib/knowledge.ts`-ben, `PILL_COLORS` a `lib/score.ts`-ben)` → `hardcode-olt színekkel (`PILL_COLORS` a `lib/score.ts`-ben)`.

Ellenőrzés: `grep -n "knowledge" CLAUDE.md` – üres.

- [ ] **3b. lépés: `README.md` – a két régi hivatkozás**

A bevezető bekezdésben cseréld: `A tudástár és a monitoring képernyő még statikus dummy adatokból dolgozik (`lib/data.ts`, `lib/knowledge.ts`); az auth, a felhasználó-kezelés, az országprofil (és a térkép), a jelentések (információs bejegyzések) és a kommunikáció (ticketek) már valódi adatbázisból (lásd lent).` → `A monitoring képernyő még statikus dummy adatokból dolgozik (`lib/data.ts`); az auth, a felhasználó-kezelés, az országprofil (és a térkép), a jelentések (információs bejegyzések), a kommunikáció (ticketek) és a TéT Tudástár már valódi adatbázisból (lásd lent).`

A fájllistában cseréld a `- `lib/knowledge.ts` – tudástár demóadatok: 6 program, 6 ökoszisztéma-elem, 5 együttműködési forma` sort erre: `- `lib/tudastar-szotar.ts` – a TéT Tudástár 9 kategóriája, kártyatípusai, korlátai, közös felirat- és sorszabály-táblái és a normalizáló; a kártyák a `tudastar_kartya` táblában (`db/queries/tudastar.ts`), az oldalak és a szerkesztő az `app/(app)/tudastar/` alatt`.

Ellenőrzés: `grep -n "knowledge" README.md` – üres.

- [ ] **4. lépés: a spec – a terv végi „Eltérések a spectől” szakasz átvezetése**

A spec állapot-sorát cseréld: `Állapot: jóváhagyott terv, megvalósítás előtt` → `Állapot: az A fázis (funkció) megvalósítva; a B fázis (kezdő tartalom) folyamatban`. A spec végére új szakasz `## Tervezéskori pontosítások` címmel, a terv végi „Eltérések a spectől” lista pontjaival (szó szerint átvehető).

- [ ] **5. lépés: az eldobható scriptek törlése**

```bash
rm scripts/_proba-tudastar.ts scripts/_proba-tudastar-validacio.ts scripts/_proba-tudastar-db.ts
git status --short
```

Várt: a `git status` csak a `CLAUDE.md`-t, a `README.md`-t és a spec-et mutatja módosítottként (a `data/tet.db` nem lehet a listában módosítottként – ha mégis, ne add hozzá).

- [ ] **6. lépés: commit**

```bash
git add CLAUDE.md README.md docs/superpowers/specs/2026-11-02-tet-tudastar-design.md
git commit -m "docs(tudastar): CLAUDE.md és README TéT Tudástár szakasz, a spec tervezéskori pontosításai

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Böngészős QA (a vezérlő munkamenet végzi, nem subagent)

A felhasználó **futó** dev szerverén, gstack headless böngészővel (`B=~/.claude/skills/gstack/browse/dist/browse`). Saját dev szervert ne indíts, a futót ne állítsd le. Előtte:

```bash
lsof -nP -iTCP -sTCP:LISTEN | grep -i node            # a figyelő portok
lsof -a -p <pid> -d cwd                               # a port valóban a tet-platform-next-é?
```

Ha nem fut TéT dev szerver: kérdezd meg a felhasználót. Belépés: `$B goto http://localhost:<port>/login`, `$B wait --networkidle`, majd kitöltés; az admin (`admin@niu.hu`) jelszava a `.env.local`-ban, **ne írd ki** (shell-változóba olvasva add át, a kitöltés után ne fusson `snapshot`). Attasé: egy demó attasé (`vezeteknev.keresztnev@demo.test`, jelszó a `.env.example` `DEMO_ATTASE_PASSWORD`-je). A gstack-tippek a memóriában (`riportok-next-step`): daemon-újraindulás → süti elveszik, minden blokk elején ellenőrizd az URL-t; pontot tartalmazó id-hez `[id="szakaszok.0.cim"]` szelektor; a `document.querySelector('form')` az oldalsáv kijelentkezés-űrlapja – a mezőből `closest('form')`.

- [ ] **Admin:**
  1. Az oldalsáv menüpontja „TéT Tudástár”, a fejléc címe és alcíme a specé.
  2. `/tudastar`: 9 csempe „0 kártya” felirattal (üres tábla), a csempe a kategória-oldalra visz.
  3. `/tudastar/finanszirozas`: morzsamenü, bevezető, „Ebben a kategóriában még nincs kártya.”, „+ Új intézmény”, „+ Új lista”; jobb oldalt a menü, a 2. kiemelve.
  4. Új intézmény: név nélkül mentve → „Név megadása kötelező.” és a fókusz a névre ugrik; honlap `javascript:alert(1)` → URL-hiba. Félig kitöltött szakasz (cím szöveg nélkül) → a szöveg mezőn hiba. Helyes kitöltés (név „QA Intézmény”, rövidítés „QA”, honlap `nkfih.gov.hu`, 2 szakasz, 1 program, 1 link) → átirányítás a `/tudastar/finanszirozas/qa` részletoldalra; a blokkok a spec sorrendjében, a honlap `nkfih.gov.hu` ↗, a „- ” sorok felsorolásként.
  5. Új lista („QA Lista”, 3 sor, egyik URL nélkül) → átirányítás a kategória-oldal `#k-qa-lista` horgonyára; a sorok látszanak, a ↗ új lapon nyílik.
  6. ↑/↓: a QA Lista feljebb kerül; a szélső gomb letiltva; a „Frissítve” dátum nem változik.
  7. Szerkesztés: kategóriaváltás `egyetemek`-re → a kártya ott a lista végén; slug változatlan.
  8. Verzióütközés: a szerkesztőt két lapon (`$B newtab`) megnyitva, az egyiken mentve, a másikon mentve → „A kártyát közben más módosította – töltsd újra az oldalt.”, a beírt tartalom megmarad.
  9. Sorszerkesztő: új sor → fókusz az új sor első mezőjén; törlés → fókusz a „+ Új …” gombon; ↑ → a mozgatott sor gombján.
  10. Keresés: `/tudastar?q=qa intezmeny` (ékezet nélkül) → a QA Intézmény a találatok közt, a „Keresés törlése” után a mező üres; találat nélküli kifejezés → „Nincs találat erre: …”. Billentyűzettel (a mezőbe írva, Enter): a fókusz a mezőn marad, a `role="status"` régió szövege a találatszámra vált; a Vissza gomb után a mező a korábbi kifejezést mutatja.
  11. Keskeny ablak (`$B viewport 390x844`): a menü helyett a „Kategória” select, váltáskor navigál.
  11b. Felolvasós szempontból (a kódból és a DOM-ból): a kategória-oldal kis keresőjéből indított keresés a nyitólapra visz (a `role="status"` régió ott már kitöltve jelenik meg, a fókusz a lap elejére esik); a tudástár-oldalak lapcíme egyforma, így az útvonal-bemondó lapváltáskor hallgat. Jegyezd fel a felhasználónak döntésre (dinamikus lapcím vagy fókusz a találati címsorra), ne javítsd kérés nélkül.
  12. Ismeretlen URL-ek: `/tudastar/nincs` 404, `/tudastar/egyetemek/qa-lista` 404 (lista), `/tudastar/egyetemek/uj?tipus=x` 404.
- [ ] **Attasé:** a kategória- és részletoldal olvasható; „+ Új …”, Szerkesztés, ↑/↓ nem látszik; `/tudastar/egyetemek/uj?tipus=lista` és a `…/szerkesztes` 404.
- [ ] **Takarítás:** a QA-kártyák törlése a felületen („Kártya törlése” → megerősítés → vissza a kategória-oldalra), kijelentkezés mindkét fiókkal. A `data/tet.db`-t nem commitoljuk.
- [ ] A talált hibákat a megfelelő task implementerével javíttasd, a javítás után a releváns QA-lépéseket ismételd meg.

---

# B fázis – kezdő tartalom

### Task 9: A tartalom-futtató

**Fájlok:**
- Létrehoz: `scripts/tudastar-tartalom/tipusok.ts`, `scripts/tudastar-tartalom.ts`
- Módosít: `CLAUDE.md` (a Parancsok blokk)

- [ ] **1. lépés: `scripts/tudastar-tartalom/tipusok.ts`**

```ts
/**
 * A tudástár kezdő tartalmának típusai és segédje (a scripts/tudastar-tartalom.ts futtató és a
 * <kategoria-slug>.ts adatfájlok). A kártyák a szerkesztő űrlap-értékeinek alakjában vannak, ezért a futtató
 * ugyanazzal a validátorral ellenőrzi őket, mint a felületet.
 */
import type { KartyaTipus } from '../../lib/tudastar-szotar';

export interface ForrasKartya {
  /** Az URL-azonosító (kisbetű, számjegy, kötőjel); a kártya URL-je ebből épül, utólag nem változik. */
  slug: string;
  tipus: KartyaTipus;
  nev: string;
  rovidites?: string;
  /** Intézménynél az összefoglaló, listánál a bevezető (2–3 mondat). */
  osszefoglalo: string;
  /** A hivatalos honlap, kanonikus alakban (pl. `https://nkfih.gov.hu/`). */
  honlap?: string;
  // Csak intézménynél:
  profil?: string;
  tevekenyseg?: string;
  kapcsolat?: { email?: string; telefon?: string; cim?: string };
  szakaszok?: { cim: string; szoveg: string }[];
  programok?: { nev: string; leiras?: string; url?: string }[];
  // Csak listánál:
  sorok?: { nev: string; megjegyzes?: string; url?: string }[];
  // Mindkettőnél:
  linkek?: { felirat: string; url: string }[];
}

/** Egy kategória-fájl default exportja. */
export interface ForrasKategoria {
  /** A nyitólap csempéjének egysoros leírása (a lib/tudastar-szotar.ts `leiras`-ába kerül át). */
  leiras: string;
  /** A kategória-oldal eligazító bevezetője, 2–4 mondat (a lib/tudastar-szotar.ts `bevezeto`-jébe kerül át). */
  bevezeto: string;
  /** A kártyák a megjelenítés sorrendjében. */
  kartyak: ForrasKartya[];
}

/** A kártya a szerkesztő FormData-jaként, ahogy a böngésző küldené (a sorok `<lista>.<i>.<mezo>` nevekkel). */
export function kartyaFormData(kategoria: string, k: ForrasKartya): FormData {
  const fd = new FormData();
  const tesz = (nev: string, v: string | undefined) => fd.append(nev, v ?? '');
  tesz('kategoria', kategoria);
  tesz('nev', k.nev);
  tesz('rovidites', k.rovidites);
  tesz('osszefoglalo', k.osszefoglalo);
  tesz('honlap', k.honlap);
  tesz('profil', k.profil);
  tesz('tevekenyseg', k.tevekenyseg);
  tesz('email', k.kapcsolat?.email);
  tesz('telefon', k.kapcsolat?.telefon);
  tesz('cim', k.kapcsolat?.cim);
  const sorok = (lista: string, elemek: readonly Record<string, string | undefined>[] | undefined, mezok: readonly string[]) =>
    elemek?.forEach((e, i) => mezok.forEach((m) => tesz(`${lista}.${i}.${m}`, e[m])));
  sorok('szakaszok', k.szakaszok, ['cim', 'szoveg']);
  sorok('programok', k.programok, ['nev', 'leiras', 'url']);
  sorok('sorok', k.sorok, ['nev', 'megjegyzes', 'url']);
  sorok('linkek', k.linkek, ['felirat', 'url']);
  return fd;
}
```

- [ ] **2. lépés: `scripts/tudastar-tartalom.ts`**

```ts
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
```

- [ ] **3. lépés: önellenőrzés egy eldobható próbafájllal**

Hozz létre ideiglenesen `scripts/tudastar-tartalom/egyetemek.ts`-t:

```ts
import type { ForrasKategoria } from './tipusok';

const kategoria: ForrasKategoria = {
  leiras: 'Próba.',
  bevezeto: 'Próba.',
  kartyak: [
    { slug: 'proba', tipus: 'lista', nev: 'Próba', osszefoglalo: 'x', sorok: [{ nev: 'BME', url: 'https://www.bme.hu/' }] },
    { slug: 'uj', tipus: 'lista', nev: ' Szóközös', osszefoglalo: 'x', ismeretlen: 1, sorok: [{ nev: '', url: '' }, { nev: 'A', url: 'bme.hu', extra: 'x' }] } as never,
    { slug: 'proba', tipus: 'intezmeny', nev: 'Dupla', osszefoglalo: 'x', sorok: [] } as never,
  ],
};
export default kategoria;
```

Futtatás: `npx tsx scripts/tudastar-tartalom.ts --csak egyetemek`
Várt (kilépési kód 1), pontosan ez a 8 hiba:

```
8 hiba:
  egyetemek.ts [1] uj: ismeretlen vagy a típushoz nem illő mező: ismeretlen
  egyetemek.ts [1] uj: sorok[0]: teljesen üres sor (a validátor némán eldobná)
  egyetemek.ts [1] uj: sorok[1]: ismeretlen mező: extra
  egyetemek.ts [1] uj: nev: a szöveg szélén szóköz vagy láthatatlan karakter áll
  egyetemek.ts [1] uj: sorok[1].url: nem kanonikus URL (bme.hu → https://bme.hu/)
  egyetemek.ts [1] uj: slug: foglalt útvonal-szegmens (uj)
  egyetemek.ts [2] proba: ismeretlen vagy a típushoz nem illő mező: sorok
  egyetemek.ts [2] proba: a slug már szerepel itt: egyetemek.ts [0] proba
```

Majd: `npx tsx scripts/tudastar-tartalom.ts` (teljes) → a 8 hiba mellett „<slug>.ts: hiányzik” a többi 8 kategóriára; `npx tsx scripts/tudastar-tartalom.ts --csak nincs` → „--csak: ismeretlen kategória: nincs”. Utána **töröld** a próbafájlt: `rm scripts/tudastar-tartalom/egyetemek.ts`.

- [ ] **4. lépés: `CLAUDE.md` – a Parancsok blokkba, a `demo-orszagprofil.ts` sora után**

```
npx tsx scripts/tudastar-tartalom.ts [--csak egyetemek,… | --sql drizzle/<n>_tudastar_kezdo_tartalom.sql]   # a TéT Tudástár kezdő tartalma (scripts/tudastar-tartalom/<kategoria>.ts): alapból mind a 9 fájl szigorú ellenőrzése, a DB-t meg sem nyitja (validalKartya + ismeretlen mező, nem kanonikus URL, teljesen üres sor, szélein szóközös szöveg, slug alakja/foglaltsága/egyedisége); --csak: csak a megadott kategóriák; --sql: a teljes ellenőrzés és a szótár leiras/bevezeto egyezése után megírja az egyszeri migráció INSERT-jeit (a fájlt előbb `npx drizzle-kit generate --custom --name tudastar_kezdo_tartalom` hozza létre)
```

- [ ] **5. lépés: `npx tsc --noEmit`** – várt: üres.

- [ ] **6. lépés: commit**

```bash
git add scripts/tudastar-tartalom/tipusok.ts scripts/tudastar-tartalom.ts CLAUDE.md
git commit -m "feat(tudastar): kezdő tartalom futtatója – szigorú ellenőrzés, --csak, --sql migráció-írás

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Kutatás – a 9 kategória-fájl

Párhuzamosítható: három subagent, mindegyik három kategóriával (pl. 1–3, 4–6, 7–9). Mindegyik csak a saját fájljait írja, és csak a saját kategóriáira futtatja a futtatót (`--csak`). A `lib/tudastar-szotar.ts`-hez **nem nyúlnak** (azt a 11. task frissíti a fájlok `leiras`/`bevezeto` mezőiből).

**Fájlok:** `scripts/tudastar-tartalom/<slug>.ts`, ahol a slug: `szakpolitika`, `finanszirozas`, `innovacios-szolgaltatasok`, `kutatohalozat`, `egyetemek`, `szellemi-tulajdon`, `befektetok`, `vallalatok`, `nemzetkozi-programok`.

**A fájl alakja** (példa, a valódi tartalom kutatásból):

```ts
/**
 * 2. Kutatás-fejlesztési és innovációs finanszírozás – a TéT Tudástár kezdő tartalma.
 *
 * Források (lekérve: 2026-11-0x):
 * - NKFIH, rólunk: https://nkfih.gov.hu/… – feladat- és hatáskör
 * - …
 * ELLENŐRIZENDŐ: <amit a forrás nem fedett le egyértelműen>
 */
import type { ForrasKategoria } from './tipusok';

const kategoria: ForrasKategoria = {
  leiras: '…egy sor, ≤ 120 karakter…',
  bevezeto: '…2–4 mondat, ≤ 900 karakter: kik ezek a szereplők, és mire használhatja őket az attasé…',
  kartyak: [
    {
      slug: 'nkfih',
      tipus: 'intezmeny',
      nev: 'Nemzeti Kutatási, Fejlesztési és Innovációs Hivatal',
      rovidites: 'NKFIH',
      osszefoglalo: '…2–3 mondat…',
      honlap: 'https://nkfih.gov.hu/',
      profil: '…',
      tevekenyseg: '…',
      kapcsolat: { email: '…', telefon: '…', cim: '…' },
      szakaszok: [{ cim: 'Feladat- és hatáskör', szoveg: '…\n\n- …\n- …' }],
      programok: [{ nev: '…', leiras: '…', url: 'https://…' }],
      linkek: [{ felirat: 'Aktuális pályázatok', url: 'https://…' }],
    },
    {
      slug: 'horizont-europa-ncp',
      tipus: 'lista',
      nev: 'Horizont Európa nemzeti kapcsolattartók',
      osszefoglalo: '…',
      sorok: [{ nev: '…', megjegyzes: '…', url: 'https://…' }],
    },
  ],
};
export default kategoria;
```

**Tartalmi szabályok (minden kategóriára):**
- **Csak hivatalos forrás:** az intézmény saját oldala, gov.hu, EU-oldalak (ec.europa.eu, eismea, eit.europa.eu, cost.eu, eurekanetwork.org stb.). Minden állítás forrása szerepeljen a fejkommentben URL-lel és a lekérés napjával. Amit a forrás nem fed le egyértelműen, ne írd bele; ha fontos, a fejkomment „ELLENŐRIZENDŐ” sorába kerüljön.
- **2026-os állapot:** a 2026-os kormányváltás után a minisztériumi struktúra, nevek, felügyeleti viszonyok és URL-ek változhattak – emlékezetből semmit, mindent a mai forrásból (különösen: a Tudományos és Technológiai Minisztérium pontos neve, hatásköre, a NKFIH és a NIÜ felügyelete).
- **Linkek:** a `honlap` és minden `url` a hivatalos oldal kanonikus alakja (`new URL(x).href`, pl. `https://nkfih.gov.hu/`; a futtató a nem kanonikusat hibának veszi). Mélylinket csak akkor, ha a forrásban él.
- **Kapcsolat:** csak intézményi elérhetőség (központi e-mail, központi telefon, postacím). **Magánszemély neve vagy elérhetősége sehol** (NCP-knél is csak a téma és a fogadó szervezet).
- **Szöveg:** magyar, eligazító, tömör; a korlátok (`lib/tudastar-szotar.ts`): név ≤ 200, rövidítés ≤ 40, összefoglaló ≤ 600 (cél: 2–3 mondat), szöveges mező ≤ 5000, szakaszcím ≤ 120, programleírás ≤ 300 (cél: egy sor), megjegyzés ≤ 200. Formázás: üres sor = új bekezdés, „- ” kezdetű sor = felsorolás. Szélein nincs szóköz.
- **Slug:** kisbetű, számjegy, kötőjel; rövidítésből, ha van (`nkfih`, `niu`, `hun-ren`, `sztnh`), különben beszédes (`horizont-europa-ncp`); az `uj` foglalt; a 9 fájl közt egyedi (a 11. task teljes futása ellenőrzi).
- **Sorrend:** elöl a részletes intézménykártya(k), utána a listakártyák a dokumentum szereplőtípusainak sorrendjében.
- **Terjedelem:** kategóriánként kb. 5–8 kártya; a dokumentum minden szereplőtípusa kapjon helyet (külön listakártyán, vagy – ha a típusra kevés a megbízható adat – egy összevont listakártyán, a bevezetőben jelezve).

**Kategóriánkénti elvárás (a spec „A 9 kategória szereplőtípusai” szakasza alapján):**
1. `szakpolitika` – intézmény: a Tudományos és Technológiai Minisztérium, szakaszokkal: „KFI-stratégia”, „Prioritások”, „Kiemelt ágazatok”. Listák: az innovációhoz kapcsolódó ágazati minisztériumok; koordinációs testületek; stratégiai és tanácsadó szervezetek.
2. `finanszirozas` – intézmény: NKFIH, szakaszokkal: „Feladat- és hatáskör”, „Az NKFI Alap programstratégiája”, „Aktuális hazai és nemzetközi pályázatok”, „A pályázatok célcsoportjai”, „Nemzetközi partnerkeresés és társfinanszírozás”, „Kormányzati Önerő Alap és más társfinanszírozási konstrukciók”. Listák: hazai és uniós támogatások kezelői; Horizont Európa nemzeti kapcsolattartók; EUREKA-, Eurostars-, COST- és egyéb programok hazai felelősei.
3. `innovacios-szolgaltatasok` – intézmény: Nemzeti Innovációs Ügynökség, `programok`: XPAND; Enterprise Horizon; Hungarian Startup University Program; HSUP Doctorate; startup- és rendezvénytámogatási programok; technológiatranszferhez kapcsolódó projektek; Science Park és TTC projektek; innovációmenedzsment- és vállalkozásfejlesztési szolgáltatások (egysoros leírás + link). Listák: országos vállalkozásfejlesztési szervezetek; inkubátorok és akcelerátorok; klaszterek; startup- és technológiai szervezetek; vállalati innovációs központok; nyílt innovációs programok működtetői.
4. `kutatohalozat` – intézmény: HUN-REN Magyar Kutatási Hálózat. Listák: HUN-REN kutatóközpontok és -intézetek; támogatott kutatócsoportok; nemzeti laboratóriumok; kutatási infrastruktúrák; önálló állami vagy nonprofit kutatóhelyek.
5. `egyetemek` – listák: kutatóegyetemek; innovációs igazgatóságok; technológiatranszfer-irodák; technológiatranszfer-cégek; egyetemi inkubátorok; kompetenciaközpontok; science parkok; egyetemi kutatási infrastruktúrák; egyetemi spin-off portfóliók (a kevés adatú típusok összevonhatók).
6. `szellemi-tulajdon` – intézmény: Szellemi Tulajdon Nemzeti Hivatala. Listák: szabványosítási szervezetek; akkreditációs és megfelelőségértékelési szervezetek; ágazati hatóságok; szabályozói tesztkörnyezetek; kutatásbiztonsági és technológiabiztonsági kapcsolattartók.
7. `befektetok` – listák: állami és állami hátterű finanszírozók; kockázatitőke-alapok; üzleti angyal hálózatok; banki innovációfinanszírozás; corporate venture capital szereplők; inkubációs és akcelerációs befektetők; deep tech finanszírozók; egyetemi vagy proof-of-concept alapok. Csak címtár jelleggel – nem befektetési tanács, nem értékelés.
8. `vallalatok` – listák: innovatív nagyvállalatok (top 10 – a rangsor forrását a listakártya bevezetője nevezze meg, pl. az EU Industrial R&D Investment Scoreboard magyar szereplői, mint a `scripts/demo-orszagprofil/orszagok/hu.ts`-ben); jelentős KFI-központtal rendelkező vállalatok; nyílt innovációs programokat működtető cégek; kiemelt innovatív kkv-k, startupok és scale-upok; ágazati szövetségek; kamarák; klaszterek.
9. `nemzetkozi-programok` – listák (vagy kulcsprogramnál intézménykártya): Horizont Európa; EIC; EIT és a KIC-ek (az EIT székhelye Budapest – ha a forrás megerősíti); EUREKA; Eurostars; COST; Enterprise Europe Network; EURAXESS; kétoldalú TéT-programok; nemzetközi kutatási infrastruktúrák; EU-partnerségek; Widening-programok – mindegyiknél a magyar kapcsolódási pont (ki a hazai felelős, hol a magyar oldal).

- [ ] **1. lépés:** kutatás és a fájl(ok) megírása a fenti szabályok szerint.
- [ ] **2. lépés:** `npx tsx scripts/tudastar-tartalom.ts --csak <a saját slugok vesszővel>` – várt: „Összesen N kártya rendben.”, kilépési kód 0. Hiba esetén javítás és újrafuttatás.
- [ ] **3. lépés:** `npx tsc --noEmit` – üres.
- [ ] **4. lépés: commit** (csak a saját fájlok):

```bash
git add scripts/tudastar-tartalom/<slug1>.ts scripts/tudastar-tartalom/<slug2>.ts scripts/tudastar-tartalom/<slug3>.ts
git commit -m "feat(tudastar): kezdő tartalom – <kategóriák> (kutatott vázlat)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

A jelentésben sorold fel kategóriánként a kártyákat (slug, típus), és szó szerint az „ELLENŐRIZENDŐ” pontokat.

---

### Task 11: Összesítés – szótár-szövegek, migráció, helyi betöltés

**Fájlok:**
- Módosít: `lib/tudastar-szotar.ts` (a 9 kategória `leiras` és `bevezeto` mezője), `CLAUDE.md` (egy mondat a Tudástár bekezdésbe)
- Létrehoz: `drizzle/0013_tudastar_kezdo_tartalom.sql` és a meta-fájlok (generált)

- [ ] **1. lépés: teljes ellenőrzés**

Futtatás: `npx tsx scripts/tudastar-tartalom.ts`
Várt: 9 sor kategóriánként, „Összesen N kártya rendben.” (a slug-egyediség itt a 9 fájl közt is ellenőrzött).

- [ ] **2. lépés: a szótár szövegei**

A `lib/tudastar-szotar.ts` `TUDASTAR_KATEGORIAK` tömbjében minden kategória `leiras` és `bevezeto` mezőjét cseréld a megfelelő `scripts/tudastar-tartalom/<slug>.ts` `leiras`/`bevezeto` értékére, karakterre pontosan (a `--sql` mód ellenőrzi az egyezést).

- [ ] **3. lépés: a migráció fájlja**

```bash
npx drizzle-kit generate --custom --name tudastar_kezdo_tartalom
npx tsx scripts/tudastar-tartalom.ts --sql drizzle/0013_tudastar_kezdo_tartalom.sql
```

Várt: a drizzle-kit létrehozza a `drizzle/0013_tudastar_kezdo_tartalom.sql`-t (és a naplóbejegyzést); a futtató „Megírva: …/drizzle/0013_tudastar_kezdo_tartalom.sql”. A fájl első sora `-- A TéT Tudástár kezdő tartalma: …`, utána kártyánként egy `INSERT INTO \`tudastar_kartya\` …;`, köztük `--> statement-breakpoint`.

- [ ] **4. lépés: próba DB-másolaton, majd a helyi DB-n**

```bash
T=$(mktemp -d) && cp data/tet.db "$T/proba.db" && DATABASE_URL="$T/proba.db" npx drizzle-kit migrate && sqlite3 "$T/proba.db" "select kategoria, count(*) from tudastar_kartya group by kategoria;" && rm -r "${T:?}"
npm run db:migrate
```

Várt: a másolaton 9 sor a kategóriánkénti darabszámmal; utána a helyi DB-n is lefut (a futó dev szerver mellett a WAL-ban marad – a DB-t ebben a taskban nem commitoljuk).

- [ ] **5. lépés: `CLAUDE.md`** – a „TéT Tudástár” bekezdés végére:

```
A kezdő tartalom forrása a `scripts/tudastar-tartalom/<kategoria>.ts` (kutatott vázlat, a források a fájlok fejkommentjében); a `drizzle/0013_tudastar_kezdo_tartalom.sql` a futtató `--sql`-jével készült. Push után (a hostingon lefutott) ne módosítsd: onnantól a tartalmat az admin gondozza a felületen, a forrásfájlok csak történeti dokumentumok.
```

- [ ] **6. lépés: ellenőrzés**

Futtatás: `npx tsc --noEmit && npm run build`
Várt: tsc üres, build rendben.

- [ ] **7. lépés: commit** (a `data/tet.db` nélkül)

```bash
git add lib/tudastar-szotar.ts CLAUDE.md drizzle/0013_tudastar_kezdo_tartalom.sql drizzle/meta/0013_snapshot.json drizzle/meta/_journal.json
git commit -m "feat(tudastar): kezdő tartalom migrációja (0013), a kategóriák kutatott leírása és bevezetője

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

(Ha a `drizzle-kit generate --custom` nem írt snapshotot, a `git add` a hiányzó fájlra hibát ad – akkor hagyd ki a listából.)

---

### Task 12: Felhasználói átnézés és a demó DB commitja (a vezérlő munkamenet végzi)

- [ ] **1. lépés:** kérd meg a felhasználót, hogy a futó dev szerverén nézze át a tudástárat (a 0013 a helyi DB-ben van). Mondd el: a javításokat **ne a felületen** végezze (az csak a helyi DB-t változtatná, a hostingra a migráció tartalma kerül), hanem jelezze – a forrásfájlokban javítjuk. Adj mellé rövid listát a kutatók „ELLENŐRIZENDŐ” pontjairól.
- [ ] **2. lépés: módosításkérés esetén** – a forrásfájl(ok) javítása, majd a migráció újraírása és helyi újra-alkalmazása:

```bash
npx tsx scripts/tudastar-tartalom.ts --sql drizzle/0013_tudastar_kezdo_tartalom.sql
W=$(node -e "const j=require('./drizzle/meta/_journal.json');console.log(j.entries.find(e=>e.tag==='0013_tudastar_kezdo_tartalom').when)")
sqlite3 data/tet.db "delete from tudastar_kartya; delete from __drizzle_migrations where created_at = $W;"
npm run db:migrate
```

(A drizzle a lefutott migrációt a napló `when` értékével – `created_at` – tartja számon; a sor törlése után a 0013 újra lefut. Csak push előtt szabad: utána a 0013 a hostingon is lefutott, és nem változhat.) Ha a `leiras`/`bevezeto` változott, a szótárban is javítsd. Commit: a forrásfájlok, a migráció, esetleg a szótár.
- [ ] **3. lépés: a jóváhagyás után a demó DB commitja** (a CLAUDE.md eljárása; a `delete from session` a felhasználó helyi böngészős munkamenetét is törli – szólj előre):

```bash
sqlite3 data/tet.db "delete from session; PRAGMA wal_checkpoint(TRUNCATE);"      # elvárt kimenet: 0|0|0
sqlite3 "file:data/tet.db?immutable=1" "select count(*) from tudastar_kartya; select max(id) from __drizzle_migrations;"
git add data/tet.db
K="$(mktemp -d)/kijelolt.db" && git show :data/tet.db > "$K" && sqlite3 "file:$K?immutable=1" "select count(*) from tudastar_kartya;"   # a kijelölt blob is tartalmazza
git commit -m "chore(tudastar): demó DB a tudástár tábláival és kezdő tartalmával (0012, 0013)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **4. lépés:** a spec állapot-sora: „megvalósítva és átnézve”; a spec végére „Megvalósítási eltérések” (ha voltak), külön docs-commitban. Utána: superpowers:finishing-a-development-branch.

---

## Eltérések a spectől (a 7. task átvezeti a specbe)

1. **Egy kártya-komponens:** a kategória-oldal kártyáit egyetlen `TudastarKartya` rajzolja mindkét típusra, közös `KartyaLablec`-kel (a spec `IntezmenyKartya`/`ListaKartya` párja helyett); a megjelenítés a specé.
2. **A jobb menü kártya-linkjei:** a kategória-oldalon horgonyok (`#k-<slug>`); a részletoldalon a kártya helyére visznek (`kartyaUrl`: intézmény → részletoldal, lista → horgony), és az aktuális intézmény kiemelt (`aria-current="page"`).
3. **Foglalt slug:** `FOGLALT_SLUGOK = ['uj']` (`lib/tudastar-szotar.ts`) – a statikus `uj` szegmens elnyelné az ilyen slugú kártyát; a `createKartya` és a tartalom-futtató is kizárja.
4. **`KuldGomb`:** új opcionális propok (`size`, `disabled`, `aria-label`) az ↑/↓ ikon-gombokhoz; a meglévő hívók változatlanok.
5. **Útvonal-segédek** a `lib/routes.ts`-ben (`tudastarUrl`, `kartyaHorgony`, `kartyaUrl`, `kartyaSzerkesztoUrl`, `ujKartyaUrl`), a `csatolmanyUrl` mintájára.
6. **Pótolt korlátok:** e-mail ≤ 200, linkfelirat ≤ 120 karakter (a spec nem nevezte meg).
7. **Futtató:** `--csak <slug,…>` kapcsoló a párhuzamos kutatáshoz; a kategóriák `leiras`/`bevezeto` szövege a kategória-fájlokban készül, és a 11. task viszi át a szótárba (a `--sql` az egyezést ellenőrzi).
8. **A tartalom-migráció az átnézés előtt elkészül** és helyben lefut, hogy a tartalom a felületen nézhető legyen; push előtt a 12. task eljárásával újraírható és újra alkalmazható (a spec szerint „a B fázis végén” készült volna).
9. **Ismert korlát:** a kategória-oldal ↑/↓ gombja után a fókusz nem marad a gombon (a kártya DOM-ja áthelyeződik); a szerkesztő sorszerkesztője visszaadja.
10. **Keresés keskenyebb ablakban:** a kategória- és a részletoldalon a kereső a jobb menüben van; `xl` alatt (≈ 1280 px alatt) ott csak a kategória-választó látszik, a kereséshez a nyitólapra kell lépni (a spec szerint is a menü helyén csak a select áll).
11. **A találat helye (`hol`/`reszlet`):** nem az első egyező rész, hanem a legtöbb keresőszót tartalmazó (holtversenyben a korábbi), a név és a rövidítés helyett – ezek a találati sorban amúgy is látszanak; ha csak azokban talált, a `hol` üres, a `reszlet` az összefoglaló eleje. A szakasz címe és szövege külön rész: címre találva „Szakasz: <cím>”, szövegre „<cím>: <kivágás>”.
12. **Felsorolásjel:** a „- ” mellett a bemásolt szövegekben gyakori „– ” és „• ” kezdetű sor is felsoroláspont; az üres felsorolássor kimarad.
13. **Slug-hossz:** a `-2`, `-3`… utótag a 60 karakteres alapon felül járulhat hozzá; a tartalom-futtató a kézzel írt slug hosszát is ellenőrzi.
14. **Keresés és slug, Unicode:** a keresőszavak szélén álló írásjelek nem számítanak („NKFIH,”, „„XPAND””); az ékezetlenítés NFKD-vel megy, így a PDF-ből másolt ligatúrák („ﬁ”) is kereshetők és slugosíthatók; a kivágás nem vág UTF-16 párt.
15. **Normalizáló:** olvasáskor a teljesen üres sort (szakasz, program, link, listasor) is eldobja, mint a validátor.
16. **URL-szabályok szigorítása:** a hosztnévben pontnak kell lennie (a `valami` így nem lesz `https://valami/`, de az `https://localhost` is hibás); a 500 karakteres korlát a normalizált `href`-re vonatkozik; séma nélküli, portos cím (`nkfih.gov.hu:8080/x`) sémának látszik és hibát kap – mindhárom a biztonságos oldalra hibázik.
17. **Lekérdezések szignatúrái:** `getKartya(id)` (nem slug: az oldalak a `listKartyak()`-ból keresnek slug szerint, az actionök id-vel), `createKartya(adat, alap, szerzoId)` – a slug alapját a hívó képzi (az action: rövidítésből, tartalékként a névből), a függvény a szabad változatot keresi és beszúr; az `updateKartya` egy tranzakcióban olvas, hasonlít és ír (a spec `UPDATE … WHERE updated_at = ?` mintája helyett, azonos eredménnyel); a `listKartyak` az ismeretlen kategóriájú sort is kihagyja és logolja, és a kategórián belül `sorrend`, név, id szerint rendez (a mozgatás is ezt a sorrendet követi). A típus változatlanságát az action (a meglévő kártya típusát adja át) és az `updateKartya` is biztosítja (eltérésnél hibát dob).
18. **A tábla és az írások védelme:** CHECK a `tipus`-ra és a `tartalom` `json_valid`-jára (a kategóriára nem, az a kódban él); az `updateKartya`/`createKartya` csak explicit felsorolt tartalmi mezőket ír, az `updateKartya` típusváltásra hibát dob; az író tranzakciók `immediate`-ek; a `mozgatKartya` a kategóriát 1..n-re számozza újra (az azonos `sorrend`-ű kártyák is mozgathatók); a `mozgatKartyaAction` hibakezelést kap.
19. **Keresés akadálymentesen:** a nyitólapon állandó `role="status"` régió mondja be a találatszámot (a keresés nem vált címet, ezért a Next útvonal-bemondója hallgatna); a keresőmező vezérelt kliens-bemenet (`KeresoBemenet`), amely a `?q=`-hoz render közben igazodik, így Enter után a fókusz a mezőn marad. A csempék fölött rejtett „Kategóriák” címsor áll.
20. **A ↑/↓ action visszajelzés nélkül:** a `mozgatKartyaAction` sima `<form action>` (nincs `useActionState`), ezért jog hiányában vagy DB-hibánál csendben nem csinál semmit (a hibát logolja); a gombok csak adminnak látszanak, és a mozgatás nem veszít adatot.
21. **Komponensek:** az ↑/↓ gombok a `KartyaLablec`-ben vannak (nincs külön `MozgatoGombok`); a spec fájltáblájában nem szereplő, de a terv szerinti komponensek: `Morzsa`, `KulsoLink` (+ `LinkLista`, `TetelLista`), `TudastarElrendezes`, `IntezmenyReszlet`, `KeresoBemenet`, `KartyaMezo`/`UrlapBlokk`.
22. **Revalidálás:** minden tudástár-action `revalidatePath('/', 'layout')`-ot hív (a kódbázis konvenciója); a spec `revalidatePath('/tudastar', 'layout')`-ja a `(app)` route group miatt egyetlen oldalra sem illeszkedne (a tag `/(app)/tudastar/…`), csak a Next mostani durva server-action-revalidálása miatt működne.
23. **A jobb menü `xl`-től:** a 238 px-es oldalsáv mellett `lg`-n a tartalomnak ~450 px maradna, ezért a menü `xl` fölött jelenik meg (alatta a kategória-választó); a Profil/Kapcsolat két hasábja is `xl`-től. A menü kiemelése fehér háttér + keret (a szürke lapon a `bg-muted` nem látszik), a kategória-oldali kártya-linkek sima `<a>` horgonyok.
24. **A szerkesztő apróságai:** a Mentés sima `Button` a `useMuveletForm` pendingjével (a `BlokkForm`/`RiportForm` mintája, nem `KuldGomb`); a formázási súgósor a közös `Mezo` szerint a mező fölött áll; az Alapadatokban a honlap az összefoglaló előtt, a Programok és Sorok mezőiben a webcím a leírás/megjegyzés előtt áll (`SOR_MEZOK` sorrendje); a hozzáadás-gomb felirata listánként „+ Új szakasz / program / link / sor”.
25. **Sortörés egysoros mezőben:** a validátor szóközre cseréli (a szerkesztő `<input>`-ja szóköz nélkül dobná el), a tartalom-futtató hibának veszi; többsoros mező: az összefoglaló/bevezető, a profil, a tevékenység és a szakasz szövege.
