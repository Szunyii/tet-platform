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
