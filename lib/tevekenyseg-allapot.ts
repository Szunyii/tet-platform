/**
 * Az eredmény (ügy) állapotgépe: mely műveletek engedettek az ügy pillanatnyi állapotában, mikor zárolt az
 * ügy törzsadata, és melyik félévbe számít egy igazolás. Tiszta logika, nincs DB és nincs React; az író
 * lekérdezések és a felületek is ebből döntenek, hogy ugyanazt a szabályt ne írják le kétszer.
 * A szabályok forrása a terv (spec) 5.3. és 5.4. pontja.
 */
import { bovitettAdatokFelev, futoFelev, megnyithato, type Felev } from './ertekeles-idoszak';
import {
  igazolastKer,
  kovetkezoSzakasz,
  type IgazolasAllapot,
  type Szakasz,
  type UgyAllapot,
} from './tevekenyseg-szotar';

/** Az ügy állapotát meghatározó négy mező (az `eredmeny` tábla azonos nevű oszlopai). */
export interface UgyAdat {
  /** Az érvényes szakasz. */
  szakasz: Szakasz;
  /** A függő igazoláskérés célszakasza; `null`, ha nincs függő kérés. */
  kertSzakasz: Szakasz | null;
  igazolas: IgazolasAllapot;
  allapot: UgyAllapot;
}

/** Az attasé műveletei: a szakaszlépés (`kapcsolatba_lep` azonnali, `igazolast_ker` központi igazolást kér). */
export type AttaseMuvelet = 'kapcsolatba_lep' | 'igazolast_ker' | 'megszakit' | 'ujraindit' | 'modosit' | 'torol';
/** A központ (admin) műveletei. */
export type AdminMuvelet = 'igazol' | 'visszakuld' | 'visszavon' | 'kifogasol' | 'kifogast_visszavon';

/** Az oszlop, amelyben az ügy a táblán látszik: a függő kérés célszakasza, különben az érvényes szakasz. */
export function oszlopSzakasz(u: UgyAdat): Szakasz {
  return u.kertSzakasz ?? u.szakasz;
}

/** Az igazolt „Megállapodás” szakaszban lévő ügy befejezett: nem szakítható meg, csak az igazolás visszavonása változtat rajta. */
export function befejezettE(u: UgyAdat): boolean {
  return u.szakasz === 'megallapodas' && u.igazolas === 'igazolt';
}

/**
 * A megnevezés, az ország, a partner, a magyar szereplő és a hozzájárulás nem módosítható (a leírás igen),
 * ha van függő kérés, vagy az érvényes szakasz az együttműködés vagy a megállapodás: ezekbe csak igazolással
 * lehet eljutni, ezért az igazolt adatok nem változhatnak alatta.
 */
export function mezokZarolvaE(u: UgyAdat): boolean {
  return u.kertSzakasz !== null || igazolastKer(u.szakasz);
}

/**
 * Az attasé engedett műveletei, a megjelenítés sorrendjében: szakaszlépés, megszakítás, módosítás, törlés.
 * A megszakadt ügyen csak az újraindítás engedett. Függő kérés alatt és befejezett ügynél nincs szakaszlépés,
 * befejezett ügynél megszakítás sincs. `torolheto` az adatréteg számítása (nincs igazolt szakasz, függő kérés
 * és lezárt félévbe számító esemény).
 */
export function attaseMuveletek(u: UgyAdat, torolheto: boolean): AttaseMuvelet[] {
  if (u.allapot === 'megszakadt') return ['ujraindit'];
  const muveletek: AttaseMuvelet[] = [];
  const kovetkezo = kovetkezoSzakasz(u.szakasz);
  if (u.kertSzakasz === null && kovetkezo !== null) {
    muveletek.push(igazolastKer(kovetkezo) ? 'igazolast_ker' : 'kapcsolatba_lep');
  }
  if (!befejezettE(u)) muveletek.push('megszakit');
  muveletek.push('modosit');
  if (torolheto) muveletek.push('torol');
  return muveletek;
}

/**
 * A központ engedett műveletei. Függő kérésnél csak a döntés (igazolás vagy visszaküldés); igazolt
 * együttműködés vagy megállapodás szakaszban az igazolás visszavonása; a korai szakaszokban a kifogásolás
 * (`kifogasolt`: van-e már kifogás az ügyön, akkor annak visszavonása). A megszakadt ügyön új döntés (igazolás,
 * visszaküldés, kifogásolás) nincs, de a korrekciók igen: a korábbi igazolás visszavonása (különben a téves
 * igazolás tovább számítana a mutatókba) és a meglévő kifogás visszavonása.
 */
export function adminMuveletek(u: UgyAdat, kifogasolt: boolean): AdminMuvelet[] {
  if (u.allapot === 'megszakadt') {
    if (igazolastKer(u.szakasz)) return ['visszavon'];
    return kifogasolt ? ['kifogast_visszavon'] : [];
  }
  if (u.kertSzakasz !== null) return ['igazol', 'visszakuld'];
  if (igazolastKer(u.szakasz)) return ['visszavon'];
  return [kifogasolt ? 'kifogast_visszavon' : 'kifogasol'];
}

/** A kérés félévének időszak-sora, amennyit a beszámítás tudni akar belőle. */
export interface KertFelevIdoszak {
  /** A sor tárolt `bovitett_adatok` jelzője. */
  bovitettAdatok: boolean;
  /** A félévet legalább egyszer lezárták (az újranyitott félév is ilyen). */
  lezartVolt: boolean;
}

/**
 * Az igazolt szakasz beszámítási féléve (spec 5.4.). A kérés napjának féléve, ha az a félév bővített adatot gyűjt,
 * még soha nem zárták le, és van időszak-sora, vagy az igazolás napján még megnyitható; különben az igazolás napjának
 * féléve. Így az igazolás sem lezárt félév rögzített mutatóit nem érinti, sem olyan félévbe nem kerül, amelynek
 * pillanatképe sosem tartalmazná. Ha van sor, a tárolt jelző dönt, sor nélkül a `bovitettAdatokFelev`.
 * A napok `YYYY-MM-DD` stringek (Europe/Budapest szerint); `idoszak`: a kérés félévének sora, ha van.
 */
export function beszamitasiFelev(kertNap: string, igazolasNap: string, idoszak: KertFelevIdoszak | null): Felev {
  const kertFelev = futoFelev(kertNap);
  const beszamithato = idoszak
    ? idoszak.bovitettAdatok && !idoszak.lezartVolt
    : bovitettAdatokFelev(kertFelev) && megnyithato(kertFelev, igazolasNap);
  return beszamithato ? kertFelev : futoFelev(igazolasNap);
}
