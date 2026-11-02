/**
 * A tudástár kezdő tartalmának típusai és segédje (a scripts/tudastar-tartalom.ts futtató és a
 * <kategoria-slug>.ts adatfájlok). A kártyák a szerkesztő űrlap-értékeinek alakjában vannak, ezért a futtató
 * ugyanazzal a validátorral ellenőrzi őket, mint a felületet.
 */
import { SOR_MEZOK, type SorLista } from '../../lib/tudastar-szotar';

interface ForrasAlap {
  /** Az URL-azonosító (kisbetű, számjegy, kötőjel); a kártya URL-je ebből épül, utólag nem változik. */
  slug: string;
  nev: string;
  rovidites?: string;
  /** Intézménynél az összefoglaló, listánál a bevezető (2–3 mondat). */
  osszefoglalo: string;
  /** A hivatalos honlap, kanonikus alakban (pl. `https://nkfih.gov.hu/`). */
  honlap?: string;
  linkek?: { felirat: string; url: string }[];
}

/** Intézménykártya: részletoldala van (profil, tevékenység, kapcsolat, szakaszok, programok). */
export interface ForrasIntezmeny extends ForrasAlap {
  tipus: 'intezmeny';
  profil?: string;
  tevekenyseg?: string;
  kapcsolat?: { email?: string; telefon?: string; cim?: string };
  szakaszok?: { cim: string; szoveg: string }[];
  programok?: { nev: string; leiras?: string; url?: string }[];
}

/** Listakártya: a kategória szereplői soronként (név, megjegyzés, webcím). */
export interface ForrasLista extends ForrasAlap {
  tipus: 'lista';
  sorok?: { nev: string; megjegyzes?: string; url?: string }[];
}

/** Egy kártya; a `tipus` szerinti unió miatt a típushoz nem illő mező már a `tsc`-ben hiba. */
export type ForrasKartya = ForrasIntezmeny | ForrasLista;

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
  const tesz = (nev: string, v: unknown) => fd.append(nev, typeof v === 'string' ? v : '');
  const r = k as unknown as Record<string, unknown>;
  tesz('kategoria', kategoria);
  for (const mezo of ['nev', 'rovidites', 'osszefoglalo', 'honlap', 'profil', 'tevekenyseg']) tesz(mezo, r[mezo]);
  const kapcsolat = (r.kapcsolat ?? {}) as Record<string, unknown>;
  for (const mezo of ['email', 'telefon', 'cim']) tesz(mezo, kapcsolat[mezo]);
  // A sorok mezőnevei a szótár közös `SOR_MEZOK`-jából: egy új almező így a FormData-ba is bekerül.
  for (const lista of Object.keys(SOR_MEZOK) as SorLista[]) {
    const elemek = r[lista];
    if (!Array.isArray(elemek)) continue;
    elemek.forEach((e: Record<string, unknown>, i) => {
      for (const mezo of Object.keys(SOR_MEZOK[lista])) tesz(`${lista}.${i}.${mezo}`, e?.[mezo]);
    });
  }
  return fd;
}
