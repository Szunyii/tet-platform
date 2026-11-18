/**
 * A hálózati nézet (hőtérkép) és a munkalap tiszta összesítő logikája: szűrés, csoportosítás, haladás,
 * változás. Nincs React és nincs DB hívás: a `db/queries/ertekeles.ts` adja a sorokat. Fokozatot és
 * összminősítést kód nem számol, itt csak az admin által adott értékeket összegezzük. Rangsor és pontszám
 * szerinti rendezés nincs.
 */
import type { ErtekelesSzuro } from './ertekeles-szuro';
import {
  SZEMPONT_KULCSOK,
  type Fokozat,
  type OsszFokozat,
  type RogzitettOrszag,
  type SzempontKulcs,
} from './ertekeles-szotar';
import { ORSZAG_REGIOK, orszagRegio, type RegioKulcs } from './orszagok';
import { huOsszevet } from './rendezes';

/** Az összminősítés változása az előző lezárt félévhez képest; `null`: még nincs összminősítés. */
export type Valtozas = 'javult' | 'romlott' | 'azonos' | 'uj';

/** A munkalap fülei: az öt szempont, majd az összminősítés. */
export type MunkalapFul = SzempontKulcs | 'ossz';

/**
 * A hálózati nézet egy sora (egy attasé egy félévben). A `fokozatok` a megjelenítendő (hatékony) értékek:
 * nyitott félévben a `hatekonyFokozatok` eredménye, lezártban a rögzített sorok.
 */
export interface ErtekelesSor {
  ertekelesId: string;
  attaseId: string;
  nev: string;
  szekhelyKod: string;
  varos: string | null;
  orszagok: RogzitettOrszag[];
  kimarad: boolean;
  kimaradasOka: string | null;
  fokozatok: Partial<Record<SzempontKulcs, Fokozat>>;
  osszFokozat: OsszFokozat | null;
  valtozas: Valtozas | null;
}

export interface Osszesito {
  /** A teljesen minősített (öt szempont és összminősítés) sorok száma, a kihagyottak nélkül. */
  kesz: number;
  /** A nem kihagyott sorok száma. */
  osszes: number;
  /** Az összminősítéssel rendelkező, nem kihagyott sorok fokozatonként. */
  megoszlas: Record<OsszFokozat, number>;
  javult: number;
  romlott: number;
}

/**
 * Az Országismeret automatikusan „nem értékelhető”, ha az attasé egyetlen országnak sem relációs vezetője
 * (az ország nélküli attasé is ilyen). A profilt a vezető gondozza, ezért másnak nincs mit minősíteni.
 */
export function automatikusOrszagismeret(orszagok: readonly RogzitettOrszag[]): boolean {
  return !orszagok.some((o) => o.vezeto);
}

/**
 * A nyitott félévben megjelenő fokozatok: a mentett minősítések, kiegészítve a nem vezető attasé automatikus
 * 0-s Országismeretével. Ha az attasé korábban vezető volt, és az Országismeretére már van mentett minősítés,
 * az megmarad (a spec 5.3.), ezért az automatikus érték csak a hiányzó helyére kerül. A bemenetet nem módosítja.
 */
export function hatekonyFokozatok(
  fokozatok: ErtekelesSor['fokozatok'],
  orszagok: readonly RogzitettOrszag[],
): ErtekelesSor['fokozatok'] {
  if (!automatikusOrszagismeret(orszagok)) return { ...fokozatok };
  return { ...fokozatok, orszagismeret: fokozatok.orszagismeret ?? 0 };
}

/** Az összminősítés változása; ha nincs összminősítés, `null`, ha nincs korábbi lezárt félév, `uj`. */
export function valtozasSzamol(aktualis: OsszFokozat | null, elozo: OsszFokozat | null): Valtozas | null {
  if (aktualis === null) return null;
  if (elozo === null) return 'uj';
  if (aktualis > elozo) return 'javult';
  if (aktualis < elozo) return 'romlott';
  return 'azonos';
}

/** A sor haladása a szempontokon: a minősített szempontok száma az összesből (az összminősítés nélkül). */
export function haladas(sor: ErtekelesSor): { kesz: number; osszes: number } {
  const kesz = SZEMPONT_KULCSOK.filter((k) => sor.fokozatok[k] !== undefined).length;
  return { kesz, osszes: SZEMPONT_KULCSOK.length };
}

/** Mind az öt szempont minősítve van, és az összminősítés is megvan. */
export function teljesE(sor: ErtekelesSor): boolean {
  const { kesz, osszes } = haladas(sor);
  return kesz === osszes && sor.osszFokozat !== null;
}

/**
 * A szűrő a sorokra (a félévet a lekérdezés már kiválasztotta, az itt nem számít). A régió a székhely szerint
 * szűr, az ország az attasé bármely lefedett országára. Szempont és minősítés együtt: akik az adott szemponton
 * az adott fokozatot kapták; csak minősítés: az összminősítés; csak szempont: nem szűr (az oszlop kiemelése a
 * felület dolga). Minősítésre szűrve a kihagyott sor kimarad: nem kap fokozatot akkor sem, ha korábban
 * rögzítettek neki. A sorrendet megtartja.
 */
export function szurSorok(sorok: readonly ErtekelesSor[], szuro: ErtekelesSzuro): ErtekelesSor[] {
  return sorok.filter((sor) => {
    if (szuro.regio !== undefined && orszagRegio(sor.szekhelyKod) !== szuro.regio) return false;
    if (szuro.orszag !== undefined && !sor.orszagok.some((o) => o.kod === szuro.orszag)) return false;
    if (szuro.attase !== undefined && sor.attaseId !== szuro.attase) return false;
    if (szuro.minosites !== undefined) {
      if (sor.kimarad) return false;
      const fokozat = szuro.szempont !== undefined ? sor.fokozatok[szuro.szempont] : sor.osszFokozat;
      if (fokozat !== szuro.minosites) return false;
    }
    return true;
  });
}

/** Az összesítő kártyák számai. A kihagyott sorokat figyelmen kívül hagyja. */
export function osszesit(sorok: readonly ErtekelesSor[]): Osszesito {
  const o: Osszesito = { kesz: 0, osszes: 0, megoszlas: { 4: 0, 3: 0, 2: 0, 1: 0 }, javult: 0, romlott: 0 };
  for (const sor of sorok) {
    if (sor.kimarad) continue;
    o.osszes += 1;
    if (teljesE(sor)) o.kesz += 1;
    if (sor.osszFokozat !== null) o.megoszlas[sor.osszFokozat] += 1;
    if (sor.valtozas === 'javult') o.javult += 1;
    else if (sor.valtozas === 'romlott') o.romlott += 1;
  }
  return o;
}

/**
 * A sorok a székhely régiója szerint csoportosítva, az `ORSZAG_REGIOK` sorrendjében; az üres régiót kihagyja,
 * a csoporton belül magyar névsor. A szótárban nem szereplő székhely-kódú sor kimarad (a felhasználó-kezelő
 * csak szótárbeli országot enged, így ilyen sor nem keletkezik).
 */
export function regionkent(
  sorok: readonly ErtekelesSor[],
): { regio: RegioKulcs; cimke: string; sorok: ErtekelesSor[] }[] {
  return ORSZAG_REGIOK.map((r) => ({
    regio: r.kulcs,
    cimke: r.cimke,
    sorok: sorok.filter((s) => orszagRegio(s.szekhelyKod) === r.kulcs).sort((x, y) => huOsszevet(x.nev, y.nev)),
  })).filter((csoport) => csoport.sorok.length > 0);
}

/** A még nem teljesen minősített, nem kihagyott attasék nevei magyar névsorban (a lezárás tiltásának oka). */
export function hianyzoAttasek(sorok: readonly ErtekelesSor[]): string[] {
  return sorok
    .filter((s) => !s.kimarad && !teljesE(s))
    .map((s) => s.nev)
    .sort(huOsszevet);
}

/** A munkalap fülei sorrendben. */
const FULEK: readonly MunkalapFul[] = [...SZEMPONT_KULCSOK, 'ossz'];

/**
 * A „Mentés és következő szempont” utáni fül: a következő szempont, az utolsó után az összminősítés (ott marad).
 * Az automatikusan „nem értékelhető” Országismeretet átugorja, mert nincs mit szerkeszteni rajta.
 */
export function kovetkezoFul(aktiv: MunkalapFul, orszagok: readonly RogzitettOrszag[]): MunkalapFul {
  const kihagyando = automatikusOrszagismeret(orszagok) ? 'orszagismeret' : null;
  const kovetkezok = FULEK.slice(FULEK.indexOf(aktiv) + 1).filter((f) => f !== kihagyando);
  return kovetkezok[0] ?? 'ossz';
}
