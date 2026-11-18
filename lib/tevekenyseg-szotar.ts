/**
 * A tevékenységnapló és az eredmény-nyilvántartás szótárai. Framework-mentes konstansok: az állapotgép,
 * a validáció, a lekérdezések és a felületek ugyanebből dolgoznak. A kulcsok kerülnek a DB-be; a feliratok
 * a terv (spec) 5.1. pontjából valók.
 */

export type TevekenysegTipus = 'delegacio' | 'b2b' | 'partnerkozvetites';
/** Az eredmény (ügy) szakaszai, a kezdettől a megállapodásig. */
export type Szakasz = 'lehetoseg' | 'kapcsolat' | 'egyuttmukodes' | 'megallapodas';
export type Hozzajarulas = 'kozvetlen' | 'kozremukodes';
export type IgazolasAllapot = 'nem_igenyel' | 'igazolasra_var' | 'igazolt' | 'visszakuldott';
export type UgyAllapot = 'aktiv' | 'megszakadt';
export type EsemenyTipus =
  | 'letrehozas'
  | 'szakaszvaltas'
  | 'igazolas_keres'
  | 'igazolas'
  | 'visszakuldes'
  | 'igazolas_visszavonas'
  | 'megszakitas'
  | 'ujrainditas';

export const TEVEKENYSEG_TIPUSOK: readonly { kulcs: TevekenysegTipus; cimke: string }[] = [
  { kulcs: 'delegacio', cimke: 'Delegáció' },
  { kulcs: 'b2b', cimke: 'B2B-találkozó' },
  { kulcs: 'partnerkozvetites', cimke: 'Partnerközvetítés' },
];

/** A szakaszok a folyamat sorrendjében: a `kovetkezoSzakasz` ebből dolgozik. */
export const SZAKASZOK: readonly { kulcs: Szakasz; cimke: string }[] = [
  { kulcs: 'lehetoseg', cimke: 'Lehetőség' },
  { kulcs: 'kapcsolat', cimke: 'Kapcsolat' },
  { kulcs: 'egyuttmukodes', cimke: 'Együttműködés' },
  { kulcs: 'megallapodas', cimke: 'Megállapodás' },
];

export const HOZZAJARULASOK: readonly { kulcs: Hozzajarulas; cimke: string }[] = [
  { kulcs: 'kozvetlen', cimke: 'Közvetlen hozzájárulás' },
  { kulcs: 'kozremukodes', cimke: 'Közreműködés' },
];

export const IGAZOLAS_CIMKE: Record<IgazolasAllapot, string> = {
  nem_igenyel: 'Nem igényel igazolást',
  igazolasra_var: 'Igazolásra vár',
  igazolt: 'Igazolva',
  visszakuldott: 'Visszaküldve',
};

export const UGY_ALLAPOT_CIMKE: Record<UgyAllapot, string> = {
  aktiv: 'Aktív',
  megszakadt: 'Megszakadt',
};

export const ESEMENY_CIMKE: Record<EsemenyTipus, string> = {
  letrehozas: 'Létrehozás',
  szakaszvaltas: 'Szakaszváltás',
  igazolas_keres: 'Igazolás kérése',
  igazolas: 'Igazolás',
  visszakuldes: 'Visszaküldés',
  igazolas_visszavonas: 'Igazolás visszavonása',
  megszakitas: 'Megszakítás',
  ujrainditas: 'Újraindítás',
};

/** Szövegkorlátok (karakter). A megnevezés, a partner és a magyar szereplő mezője 200, a hosszabb szövegeké 2000. */
export const MEGNEVEZES_MAX = 200;
export const PARTNER_MAX = 200;
export const MAGYAR_SZEREPLO_MAX = 200;
/** A leírás, az indoklás, a megjegyzés és a kifogás felső korlátja. */
export const SZOVEG_MAX = 2000;
export const LINK_MAX = 500;

export function isTevekenysegTipus(v: string): v is TevekenysegTipus {
  return TEVEKENYSEG_TIPUSOK.some((t) => t.kulcs === v);
}

export function isSzakasz(v: string): v is Szakasz {
  return SZAKASZOK.some((s) => s.kulcs === v);
}

export function isHozzajarulas(v: string): v is Hozzajarulas {
  return HOZZAJARULASOK.some((h) => h.kulcs === v);
}

export function tipusCimke(k: TevekenysegTipus): string {
  return TEVEKENYSEG_TIPUSOK.find((t) => t.kulcs === k)?.cimke ?? k;
}

export function szakaszCimke(k: Szakasz): string {
  return SZAKASZOK.find((s) => s.kulcs === k)?.cimke ?? k;
}

export function hozzajarulasCimke(k: Hozzajarulas): string {
  return HOZZAJARULASOK.find((h) => h.kulcs === k)?.cimke ?? k;
}

/** A szakasz után következő szakasz; az utolsó (megállapodás) után `null`. */
export function kovetkezoSzakasz(k: Szakasz): Szakasz | null {
  const i = SZAKASZOK.findIndex((s) => s.kulcs === k);
  return SZAKASZOK[i + 1]?.kulcs ?? null;
}

/** A szakaszba lépéshez központi igazolás kell-e: az együttműködéshez és a megállapodáshoz igen. */
export function igazolastKer(cel: Szakasz): boolean {
  return cel === 'egyuttmukodes' || cel === 'megallapodas';
}
