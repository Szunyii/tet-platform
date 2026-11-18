/**
 * Az automatikus mutatók megjelenítése (spec 5.4.): kártyák, kulcsmutató és bizonyíték-feliratok az adatlaphoz.
 * Tiszta szövegképzés, nincs React és nincs DB hívás: a bemenet a lezáráskor rögzített `ErtekelesMutatok`
 * pillanatkép. A hiányzó érték (`null`) mindenhol „–”, `NaN` nem jelenhet meg. A bizonyítékok dátumai
 * budapesti `YYYY-MM-DD` stringek, ezért `formatNaptariDatum`-mal íródnak ki; az `utolsoMentes` ISO instant.
 */
import { formatDatum, formatNaptariDatum } from './datum';
import type {
  ErtekelesMutatok,
  HataridoBesorolas,
  JelentesBizonyitek,
  TicketBizonyitek,
} from './ertekeles-mutatok';
import type { SzempontKulcs } from './ertekeles-szotar';
import { isKategoriaKulcs, kategoriaByKulcs } from './riport-szotar';

export interface MutatoKartya {
  cimke: string;
  ertek: string;
  megjegyzes: string;
}

/** Az Eredmények szempont üres állapota: az 1. szakaszban a rendszer még nem mér eredményeket. */
export const EREDMENYEK_URES =
  'Az 1. szakaszban a rendszer még nem mér eredményeket. Az indoklás nevezi meg a konkrét eredményeket.';

/** A törölt fiókú attasé mutatói és bizonyítékai helyett álló szöveg (`ErtekelesMutatok.forrasHianyzik`). */
export const FORRAS_HIANYZIK = 'A forrásadatok nem érhetők el, mert az attasé fiókja törlődött.';

const SZAM = new Intl.NumberFormat('hu-HU', { maximumFractionDigits: 1 });

/** Szám legfeljebb egy tizedesre, magyar tizedesvesszővel; hiányzó vagy nem véges érték: „–”. */
export function tizedes(v: number | null): string {
  return v === null || !Number.isFinite(v) ? '–' : SZAM.format(v);
}

function napban(v: number | null): string {
  return v === null ? '–' : `${tizedes(v)} nap`;
}

function kategoriaRovid(kulcs: 'rendezveny' | 'egyuttmukodes' | 'palyazat'): string {
  return kategoriaByKulcs(kulcs).rovid;
}

/** A szempont mutatói kártyákban; az Eredményeknek nincs rendszeradata, ott üres a lista. */
export function mutatoKartyak(szempont: SzempontKulcs, m: ErtekelesMutatok): MutatoKartya[] {
  switch (szempont) {
    case 'tajekoztatas': {
      const t = m.tajekoztatas;
      return [
        { cimke: 'Beadott jelentés', ertek: `${t.jelentesDb} db`, megjegyzes: `előző félév: ${t.elozoFelevDb}` },
        { cimke: 'Lefedett téma', ertek: `${t.lefedettTema} / ${t.temaOsszes}`, megjegyzes: 'jelentéskategória' },
        {
          cimke: 'Leghosszabb szünet',
          ertek: `${t.leghosszabbSzunetNap} nap`,
          megjegyzes: `hálózati medián: ${tizedes(t.halozatiSzunetMedian)}`,
        },
        { cimke: 'Intézkedés nyomán', ertek: `${t.intezkedesDb} jelentés`, megjegyzes: `${t.jelentesDb} jelentésből` },
      ];
    }
    case 'orszagismeret': {
      const o = m.orszagismeret;
      if (o.vezetettDb === 0) {
        return [
          { cimke: 'Vezetett ország', ertek: '0 db', megjegyzes: 'nincs országprofil, amelyet az attasé gondozna' },
        ];
      }
      return [
        {
          cimke: 'Kitöltött blokk',
          ertek: `${o.kitoltottBlokk} / ${o.osszesBlokk}`,
          megjegyzes: `${o.vezetettDb} vezetett ország profiljában`,
        },
        {
          cimke: 'Utolsó mentés',
          ertek: o.utolsoMentes === null ? '–' : formatDatum(new Date(o.utolsoMentes)),
          megjegyzes: 'országprofil',
        },
        { cimke: 'Rögzített rendezvény', ertek: `${o.rendezvenyDb} db`, megjegyzes: 'a profilban' },
        { cimke: 'Vezetett ország', ertek: `${o.vezetettDb} db`, megjegyzes: 'relációs vezetőként' },
      ];
    }
    case 'kapcsolatepites': {
      const k = m.kapcsolatepites;
      return [
        {
          cimke: 'Rendezvénybeszámoló',
          ertek: `${k.rendezvenyBeszamoloDb} db`,
          megjegyzes: `${kategoriaRovid('rendezveny')} kategória`,
        },
        {
          cimke: 'Partnerkeresési jelentés',
          ertek: `${k.partnerkeresesDb} db`,
          megjegyzes: `${kategoriaRovid('egyuttmukodes')} kategória`,
        },
        {
          cimke: 'Részvételi lehetőség',
          ertek: `${k.reszveteliLehetosegDb} db`,
          megjegyzes: `${kategoriaRovid('palyazat')} kategória`,
        },
      ];
    }
    case 'eredmenyek':
      return [];
    case 'egyuttmukodes': {
      const e = m.egyuttmukodes;
      return [
        {
          cimke: 'Első válasz mediánja',
          ertek: napban(e.elsoValaszMedianNap),
          megjegyzes: `munkanap · hálózat: ${tizedes(e.halozatiValaszMedianNap)}`,
        },
        {
          cimke: 'Határidőre teljesítve',
          ertek: e.hataridosDb === 0 ? '–' : `${e.hataridoreDb} / ${e.hataridosDb}`,
          megjegyzes: e.hataridosDb === 0 ? 'nincs határidős ticket' : 'határidős ticket',
        },
        { cimke: 'Válasz nélkül', ertek: `${e.valaszNelkulDb} db`, megjegyzes: `${e.ticketDb} ticketből` },
        { cimke: 'Lejárt, válasz nélkül', ertek: `${e.lejartValaszNelkulDb} db`, megjegyzes: 'határidős ticket' },
        {
          cimke: 'Átlagos késés',
          ertek: napban(e.atlagKesesNap),
          megjegyzes: e.kesettDb === 0 ? 'nincs késett ticket' : `${e.kesettDb} késett ticketnél`,
        },
      ];
    }
  }
}

/** A szempont egysoros kulcsmutatója a lenyitható sor fejlécében. */
export function kulcsMutato(szempont: SzempontKulcs, m: ErtekelesMutatok): string {
  if (m.forrasHianyzik) return 'A forrásadatok nem érhetők el';
  switch (szempont) {
    case 'tajekoztatas':
      return `${m.tajekoztatas.jelentesDb} jelentés, ${m.tajekoztatas.lefedettTema} / ${m.tajekoztatas.temaOsszes} téma`;
    case 'orszagismeret':
      return m.orszagismeret.vezetettDb === 0
        ? 'Nincs vezetett ország'
        : `${m.orszagismeret.kitoltottBlokk} / ${m.orszagismeret.osszesBlokk} blokk kitöltve`;
    case 'kapcsolatepites':
      return `${m.kapcsolatepites.rendezvenyBeszamoloDb} rendezvénybeszámoló, ${m.kapcsolatepites.partnerkeresesDb} partnerkeresés`;
    case 'eredmenyek':
      return 'Az 1. szakaszban nincs rendszeradat';
    case 'egyuttmukodes':
      return m.egyuttmukodes.hataridosDb === 0
        ? 'Nincs határidős ticket'
        : `${m.egyuttmukodes.hataridoreDb} / ${m.egyuttmukodes.hataridosDb} ticket határidőre`;
  }
}

/**
 * A mutatók ismert korlátja röviden (spec 5.4.): ahol a mérés félrevezethet, a felület kiírja. `null`, ha a
 * szempont mutatóihoz nincs ilyen megjegyzés, vagy a korlátozott mutató nem szerepel (vezetett ország nélkül
 * nincs „Utolsó mentés”).
 */
export function mutatoKorlat(szempont: SzempontKulcs, m: ErtekelesMutatok): string | null {
  switch (szempont) {
    case 'orszagismeret':
      return m.orszagismeret.vezetettDb === 0
        ? null
        : 'Az országprofilnak nincs blokkonkénti mentési ideje, ezért az utolsó mentés az admin mentését is tartalmazza.';
    case 'egyuttmukodes':
      return 'A munkanap-számítás nem veszi figyelembe az ünnepnapokat és az időzónákat. Egy puszta visszaigazolás is első válasznak számít, a válasz minőségét az admin ítéli meg.';
    default:
      return null;
  }
}

const BESOROLAS_FELIRAT: Record<HataridoBesorolas, string> = {
  hataridore: 'határidőre teljesítve',
  kesett: 'késett',
  lejart: 'lejárt, válasz nélkül',
  nem_szamit: 'nem számít bele',
};

/** A jelentés-bizonyíték részlete: kategória, a létrehozás napja, és hogy rögzítettek-e intézkedést. */
export function jelentesReszlet(j: JelentesBizonyitek): string {
  const kategoria = isKategoriaKulcs(j.kategoria) ? kategoriaByKulcs(j.kategoria).rovid : 'Ismeretlen kategória';
  return [kategoria, formatNaptariDatum(j.datum), j.intezkedes ? 'intézkedés történt' : null]
    .filter((r) => r !== null)
    .join(' · ');
}

/** A ticket-bizonyíték részlete: határidő, az első válasz napja és a határidős besorolás. */
export function ticketReszlet(t: TicketBizonyitek): string {
  return [
    t.hatarido === null ? 'Nincs határidő' : `Határidő: ${formatNaptariDatum(t.hatarido)}`,
    t.elsoValasz === null ? 'még nincs válasz' : `első válasz: ${formatNaptariDatum(t.elsoValasz)}`,
    t.besorolas === null ? null : BESOROLAS_FELIRAT[t.besorolas],
  ]
    .filter((r) => r !== null)
    .join(' · ');
}
