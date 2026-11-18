/**
 * Az automatikus mutatók megjelenítése (spec 5.4.): kártyák, kulcsmutató és bizonyíték-feliratok az adatlaphoz.
 * Tiszta szövegképzés, nincs React és nincs DB hívás: a bemenet a lezáráskor rögzített `ErtekelesMutatok`
 * pillanatkép. A hiányzó érték (`null`) mindenhol „–”, `NaN` nem jelenhet meg. A bizonyítékok dátumai
 * budapesti `YYYY-MM-DD` stringek, ezért `formatNaptariDatum`-mal íródnak ki; az `utolsoMentes` ISO instant.
 */
import { formatDatum, formatNaptariDatum } from './datum';
import type {
  EredmenyBizonyitek,
  ErtekelesMutatok,
  HataridoBesorolas,
  JelentesBizonyitek,
  TevekenysegBizonyitek,
  TicketBizonyitek,
} from './ertekeles-mutatok';
import { FOKOZATOK, isOsszFokozat, type SzempontKulcs } from './ertekeles-szotar';
import { isKategoriaKulcs, kategoriaByKulcs } from './riport-szotar';
import { hozzajarulasCimke, IGAZOLAS_CIMKE, szakaszCimke, tipusCimke } from './tevekenyseg-szotar';

export interface MutatoKartya {
  cimke: string;
  ertek: string;
  megjegyzes: string;
}

/** A bővített adat nélküli félév jelzése: ott nem volt adatgyűjtés, ezért nulla helyett ez a szöveg áll. */
export const NINCS_TEVEKENYSEGI_ADAT = 'Ehhez a félévhez nincs tevékenységi adat.';

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

function darab(n: number): string {
  return `${n} db`;
}

/**
 * A szempont mutatói kártyákban; bővített adat nélküli félévben az Eredményeknél üres a lista, a Tájékoztatásnál
 * pedig nincs minősítés-kártya.
 */
export function mutatoKartyak(szempont: SzempontKulcs, m: ErtekelesMutatok): MutatoKartya[] {
  switch (szempont) {
    case 'tajekoztatas': {
      const t = m.tajekoztatas;
      const minosites = t.jelentesMinosites;
      return [
        { cimke: 'Beadott jelentés', ertek: `${t.jelentesDb} db`, megjegyzes: `előző félév: ${t.elozoFelevDb}` },
        { cimke: 'Lefedett téma', ertek: `${t.lefedettTema} / ${t.temaOsszes}`, megjegyzes: 'jelentéskategória' },
        {
          cimke: 'Leghosszabb szünet',
          ertek: `${t.leghosszabbSzunetNap} nap`,
          megjegyzes: `hálózati medián: ${tizedes(t.halozatiSzunetMedian)}`,
        },
        { cimke: 'Intézkedés nyomán', ertek: `${t.intezkedesDb} jelentés`, megjegyzes: `${t.jelentesDb} jelentésből` },
        // A bővített adat nélküli félévben nincs `jelentesMinosites`: ott nem nulla kártya áll, hanem nincs kártya.
        ...(minosites === undefined
          ? []
          : [
              {
                cimke: 'Jelentések minősítése',
                ertek: FOKOZATOK.flatMap((f) => (isOsszFokozat(f.ertek) ? [`${minosites[f.ertek]} ${f.rovid}`] : [])).join(' · '),
                megjegyzes: 'központi minősítés',
              },
              { cimke: 'Minősítésre vár', ertek: `${minosites.nincs} jelentés`, megjegyzes: `${t.jelentesDb} jelentésből` },
            ]),
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
      const t = k.tevekenyseg;
      return [
        ...(t === undefined
          ? []
          : [
              { cimke: 'Delegáció', ertek: darab(t.delegacioDb), megjegyzes: 'a félévben' },
              { cimke: 'B2B-találkozó', ertek: darab(t.b2bDb), megjegyzes: 'a félévben' },
              { cimke: 'Partnerközvetítés', ertek: darab(t.partnerkozvetitesDb), megjegyzes: 'a félévben' },
              { cimke: 'Érintett magyar szereplő', ertek: darab(t.magyarSzereploDb), megjegyzes: 'eltérő szereplő' },
              { cimke: 'Kifogásolt', ertek: darab(t.kifogasoltDb), megjegyzes: 'nem számít a mutatókba' },
            ]),
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
    case 'eredmenyek': {
      const e = m.eredmenyek;
      if (e === undefined) return [];
      return [
        { cimke: 'Lehetőség', ertek: darab(e.lehetosegDb), megjegyzes: 'a félévben elért' },
        { cimke: 'Kapcsolat', ertek: darab(e.kapcsolatDb), megjegyzes: 'a félévben elért' },
        { cimke: 'Együttműködés', ertek: darab(e.egyuttmukodesDb), megjegyzes: 'a félévbe számított igazolás' },
        { cimke: 'Megállapodás', ertek: darab(e.megallapodasDb), megjegyzes: 'a félévbe számított igazolás' },
        { cimke: 'Igazolásra vár', ertek: darab(e.igazolasraVarDb), megjegyzes: 'a félév végéig beadott kérés' },
        { cimke: 'Aktív ügy', ertek: darab(e.aktivUgyDb), megjegyzes: 'a számítás időpontjában' },
        { cimke: 'Megszakadt', ertek: darab(e.megszakadtDb), megjegyzes: 'a félévben' },
      ];
    }
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
    case 'kapcsolatepites': {
      const t = m.kapcsolatepites.tevekenyseg;
      return t === undefined
        ? `${m.kapcsolatepites.rendezvenyBeszamoloDb} rendezvénybeszámoló, ${m.kapcsolatepites.partnerkeresesDb} partnerkeresés`
        : `${t.delegacioDb} delegáció, ${t.b2bDb} B2B-találkozó, ${t.partnerkozvetitesDb} partnerközvetítés`;
    }
    case 'eredmenyek':
      return m.eredmenyek === undefined
        ? 'Nincs tevékenységi adat'
        : `${m.eredmenyek.egyuttmukodesDb} együttműködés, ${m.eredmenyek.megallapodasDb} megállapodás`;
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

/** A tevékenység-bizonyíték részlete: típus, dátum, partner, és hogy kifogásolták-e. */
export function tevekenysegReszlet(t: TevekenysegBizonyitek): string {
  return [tipusCimke(t.tipus), formatNaptariDatum(t.datum), t.partner, t.kifogasolt ? 'kifogásolt' : null]
    .filter((r) => r !== null)
    .join(' · ');
}

/** Az ügy-bizonyíték részlete: szakasz, az igazolás állapota (ha igényel igazolást) és a hozzájárulás módja. */
export function eredmenyReszlet(e: EredmenyBizonyitek): string {
  return [
    szakaszCimke(e.szakasz),
    e.igazolas === 'nem_igenyel' ? null : IGAZOLAS_CIMKE[e.igazolas],
    hozzajarulasCimke(e.hozzajarulas),
  ]
    .filter((r) => r !== null)
    .join(' · ');
}
