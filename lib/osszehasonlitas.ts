/**
 * Az összehasonlítás (a térkép alatti panel) tiszta logikája: az országok színei és a halmaz
 * bővítése, a mutatókártyák sávjainak skálája és helye, és a listák (kiemelt iparágak,
 * KFI-prioritások, tagságok) mátrixa. Framework-mentes: React és DB nélkül.
 */
import { hazaiE } from './orszagok';
import { TERKEP_SZINEK } from './terkep-mutatok';

/**
 * Az összehasonlított országok színei (kék, narancs, lila, rózsa). A halmaz legnagyobb mérete
 * (`VS_MAX`) ebből adódik. Fehér alapon mind legalább 4,5:1, a kis kódfeliratokhoz is.
 */
export const VS_SZINEK = ['#2563eb', '#c2410c', '#9333ea', '#be185d'] as const;
/** Magyarország (a viszonyítási alap) jelölője, rombusza és kártyacsíkja: a térkép kontúrszíne. */
export const HAZAI_SZIN = TERKEP_SZINEK.kontur;
/** A magyar sáv: semleges szürke, a `bg-muted` sávháttérrel kb. 3,4:1 (grafikus elemnél legalább 3:1 kell). */
export const HAZAI_SAV_SZIN = '#7b8494';

/** Az összehasonlítás-halmaz egy eleme: az ország és a színe (`VS_SZINEK`-index). */
export interface VsElem {
  kod: string;
  szin: number;
}

/**
 * Hozzáadás a halmazhoz a legkisebb szabad színnel; a többi elem színe nem változik. Ugyanazt a
 * példányt adja vissza Magyarországnál (mindig viszonyítási alap, a halmazba nem kerül), a már
 * benne lévőnél és a tele (`VS_SZINEK.length` elemű) halmaznál.
 */
export function vsHozzaadElem(v: readonly VsElem[], kod: string): readonly VsElem[] {
  if (hazaiE(kod) || v.some((e) => e.kod === kod) || v.length >= VS_SZINEK.length) return v;
  let szin = 0;
  while (v.some((e) => e.szin === szin)) szin++;
  return [...v, { kod, szin }];
}

/** Egy mutató sávjainak közös skálája; mindig tartalmazza a nullát. */
export interface SavSkala {
  also: number;
  felso: number;
}

/**
 * A mutató közös sáv-skálája: `[min(0, értékek), max(0, felsoHatar, értékek)]`. Nulláról indul,
 * hogy a sáv hossza arányos legyen (negatív értéknél a nulla a skála belsejébe kerül); a
 * `felsoHatar` rögzített maximumot ad (a kitöltöttség 9 blokkja). `null`, ha egyik értéknek sincs
 * értéke.
 */
export function savSkala(ertekek: readonly (number | null)[], felsoHatar?: number): SavSkala | null {
  const szamok = ertekek.filter((v): v is number => v !== null);
  if (szamok.length === 0) return null;
  return { also: Math.min(0, ...szamok), felso: Math.max(0, felsoHatar ?? 0, ...szamok) };
}

/** Az érték helye a skálán 0 és 1 között; üres terjedelemnél (`also === felso`, pl. csupa 0) 0. */
export function skalaHely(v: number, s: SavSkala): number {
  return s.felso === s.also ? 0 : (v - s.also) / (s.felso - s.also);
}

/** A sáv a nulla helyétől az érték helyéig tart (negatív értéknél balra); `bal` és `szel` 0 és 1 között. */
export function savHelye(v: number, s: SavSkala): { bal: number; szel: number } {
  const nulla = skalaHely(0, s);
  const ertek = skalaHely(v, s);
  return { bal: Math.min(nulla, ertek), szel: Math.abs(ertek - nulla) };
}

/** A nullavonal helye, ha a skála negatívba nyúlik; különben `null` (a sávok a bal szélről indulnak). */
export function nullaVonal(s: SavSkala): number | null {
  return s.also < 0 ? skalaHely(0, s) : null;
}

/** A mátrix egy oszlopa: egy kiválasztott ország listája. */
export interface ListaOszlop<T extends string> {
  kod: string;
  /** A teljes név: az 1 országos „Csak <név>” csoport és a „nincs megadva” felsorolás használja. */
  nev: string;
  elemek: readonly T[];
}

export interface ListaSor<T extends string> {
  elem: T;
  /** Oszloponként (az `oszlopok` sorrendjében): szerepel-e az elem az ország listájában. */
  benne: boolean[];
  /** Szerepel-e a magyar listában (magyar rekord nélkül mindig `false`). */
  hazai: boolean;
}

export interface ListaCsoport<T extends string> {
  cimke: string;
  sorok: ListaSor<T>[];
}

export interface ListaMatrixAdat<T extends string> {
  /** Az üres csoportok nélkül; ha egyik listának sincs eleme, üres. */
  csoportok: ListaCsoport<T>[];
  /** Az összegző sor a nulla darabszámú részek nélkül; üres mátrixnál üres string. */
  osszegzes: string;
}

/**
 * Egy lista mátrixa: a kiválasztott országok (`oszlopok`) és Magyarország (`hazai`; `null` = nincs
 * magyar rekord) elemeinek uniója, elemenként egy sor, csoportosítva. Csoporton belül a szótár
 * (`sorrend`) sorrendje; a szótárban nem szereplő elem a csoport végére kerül (a normalizálás után nem
 * fordulhat elő).
 * - 2+ oszlopnál: „Mind a N országban” (N legfeljebb 4, ezért a névelő mindig „a”), „Részben közös”
 *   (előbb a több országban szereplők), „Csak egy országban”, „Csak Magyarország”;
 * - 1 oszlopnál: „Közös Magyarországgal”, „Csak <név>” (alanyesetben, mint a „Csak Magyarország”: a
 *   helyhatározó rag országonként rendhagyó), „Csak Magyarország”.
 * Az üres listájú ország is oszlop (a „Mind a N” így rá is vonatkozik); az összegző sor „nincs
 * megadva” része nevezi meg, mert az adatból nem dönthető el, hogy nincs eleme, vagy nincs kitöltve.
 */
export function listaMatrix<T extends string>(
  sorrend: readonly T[],
  oszlopok: readonly ListaOszlop<T>[],
  hazai: readonly T[] | null,
): ListaMatrixAdat<T> {
  const hazaiHalmaz = new Set<T>(hazai ?? []);
  const hely = (e: T) => {
    const i = sorrend.indexOf(e);
    return i === -1 ? sorrend.length : i;
  };
  const sorok: ListaSor<T>[] = [...new Set<T>([...oszlopok.flatMap((o) => o.elemek), ...hazaiHalmaz])]
    .sort((a, b) => hely(a) - hely(b))
    .map((elem) => ({ elem, benne: oszlopok.map((o) => o.elemek.includes(elem)), hazai: hazaiHalmaz.has(elem) }));
  if (sorok.length === 0) return { csoportok: [], osszegzes: '' };
  const n = oszlopok.length;
  // Oszlop nélkül a panel nem látszik; ha mégis így hívnák, csak a magyar lista marad.
  if (n === 0) return { csoportok: [{ cimke: 'Csak Magyarország', sorok }], osszegzes: '' };

  const db = (s: ListaSor<T>) => s.benne.filter(Boolean).length;
  const reszek: string[] = [];
  let csoportok: ListaCsoport<T>[];
  if (n >= 2) {
    const mind = sorok.filter((s) => db(s) === n);
    // A rendezés stabil: azonos darabszámon belül a szótár sorrendje marad.
    const reszben = sorok.filter((s) => db(s) > 1 && db(s) < n).sort((a, b) => db(b) - db(a));
    const egy = sorok.filter((s) => db(s) === 1);
    csoportok = [
      { cimke: `Mind a ${n} országban`, sorok: mind },
      { cimke: 'Részben közös', sorok: reszben },
      { cimke: 'Csak egy országban', sorok: egy },
      { cimke: 'Csak Magyarország', sorok: sorok.filter((s) => db(s) === 0) },
    ];
    if (mind.length > 0) reszek.push(`${mind.length} közös`);
    if (reszben.length > 0) reszek.push(`${reszben.length} részben közös`);
    if (egy.length > 0) reszek.push(`${egy.length} egyedi`);
  } else {
    csoportok = [
      { cimke: 'Közös Magyarországgal', sorok: sorok.filter((s) => s.benne[0] && s.hazai) },
      { cimke: `Csak ${oszlopok[0].nev}`, sorok: sorok.filter((s) => s.benne[0] && !s.hazai) },
      { cimke: 'Csak Magyarország', sorok: sorok.filter((s) => !s.benne[0]) },
    ];
  }
  if (hazai !== null && hazai.length > 0) {
    reszek.push(`Magyarországgal közös: ${sorok.filter((s) => s.hazai && db(s) > 0).length}`);
  }
  const uresek = oszlopok.filter((o) => o.elemek.length === 0).map((o) => o.nev);
  if (hazai !== null && hazai.length === 0) uresek.push('Magyarország');
  if (uresek.length > 0) reszek.push(`nincs megadva: ${uresek.join(', ')}`);
  return { csoportok: csoportok.filter((cs) => cs.sorok.length > 0), osszegzes: reszek.join(' · ') };
}
