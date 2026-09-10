/**
 * FormData → típusos blokk, blokkonként. Nincs React, nincs DB. Minden hibát egy menetben
 * gyűjtünk; a hibakulcs a mező neve (az action elé fűzi a `<blokk>.` prefixet, hogy az
 * input id-ja legyen). A listás mezők több azonos nevű értékként érkeznek (fd.getAll);
 * a rendezvény-sorok `rendezveny.<i>.<mezo>`.
 */
import { mezo, type MezoHibak } from './urlap';
import {
  EV_MIN, GAZDASAGI_AGAZATOK, IPARAGAK, KFI_PRIORITASOK, MEZO_CIMKEK, OSSZEGZES_MAX, RENDEZVENY_MAX,
  ROVID_MAX, SZOVEG_MAX, TAGSAGOK, TOP_VALLALAT_MAX, rendezvenyTipus, szurtLista,
  type BlokkKulcs, type ProfilBlokkok, type Rendezveny,
} from './orszagprofil-szotar';

export type ValidalasEredmeny<K extends BlokkKulcs> =
  | { ok: true; ertek: ProfilBlokkok[K] }
  | { ok: false; errors: MezoHibak };

function cimke<K extends BlokkKulcs>(blokk: K, kulcs: keyof ProfilBlokkok[K] & string): string {
  return MEZO_CIMKEK[blokk][kulcs].cimke;
}

function szoveg<K extends BlokkKulcs>(
  fd: FormData, blokk: K, kulcs: keyof ProfilBlokkok[K] & string, max: number, errors: MezoHibak,
): string {
  const v = mezo(fd, kulcs);
  if (v.length > max) errors[kulcs] = `${cimke(blokk, kulcs)} legfeljebb ${max} karakter.`;
  return v;
}

interface SzamSzabaly {
  min: number;
  max: number;
  tizedes: number;
}

/** Üres → null. Szóköz/NBSP és ezreselválasztó pont kiszedve, tizedesvessző → pont. */
function szam<K extends BlokkKulcs>(
  fd: FormData, blokk: K, kulcs: keyof ProfilBlokkok[K] & string, sz: SzamSzabaly, errors: MezoHibak,
): number | null {
  const raw = mezo(fd, kulcs);
  if (!raw) return null;
  // A pont csak akkor ezreselválasztó, ha pontosan 3 számjegy követi; egyik mező sem enged 3 tizedest.
  const norm = raw.replace(/[\u0020\u00A0\u202F]/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.');
  const leiras = sz.tizedes === 0 ? 'egész szám' : `szám, legfeljebb ${sz.tizedes} tizedesjeggyel`;
  if (!/^-?\d+(\.\d+)?$/.test(norm)) {
    errors[kulcs] = `${cimke(blokk, kulcs)}: ${leiras} legyen.`;
    return null;
  }
  const [, tizedesek = ''] = norm.split('.');
  const n = Number(norm);
  if (tizedesek.length > sz.tizedes || n < sz.min || n > sz.max) {
    errors[kulcs] = `${cimke(blokk, kulcs)}: ${leiras}, ${sz.min} és ${sz.max} között.`;
    return null;
  }
  return n;
}

/** `topVallalatok`: soronkénti névlista, sortörésre bontva. */
function topVallalatokSorok(fd: FormData, errors: MezoHibak): string[] {
  const sorok = mezo(fd, 'topVallalatok').split('\n').map((s) => s.trim()).filter(Boolean);
  if (sorok.length > TOP_VALLALAT_MAX) errors.topVallalatok = `Legfeljebb ${TOP_VALLALAT_MAX} vállalat adható meg.`;
  else if (sorok.some((s) => s.length > ROVID_MAX)) errors.topVallalatok = `Egy vállalatnév legfeljebb ${ROVID_MAX} karakter.`;
  return sorok;
}

/** A rendezvény-sorok `rendezveny.<i>.<mezo>` prefixű mezőkből épülnek; teljesen üres sor átugorva. */
function rendezvenySorok(fd: FormData, errors: MezoHibak): Rendezveny[] {
  const sorok: Rendezveny[] = [];
  for (let i = 0; i < RENDEZVENY_MAX; i++) {
    const p = `rendezveny.${i}.`;
    const nev = mezo(fd, p + 'nev');
    const tipusRaw = mezo(fd, p + 'tipus');
    const idopont = mezo(fd, p + 'idopont');
    const megjegyzes = mezo(fd, p + 'megjegyzes');
    if (!nev && !idopont && !megjegyzes) continue;
    if (!nev) errors[p + 'nev'] = 'A rendezvény neve kötelező.';
    else if (nev.length > ROVID_MAX) errors[p + 'nev'] = `A név legfeljebb ${ROVID_MAX} karakter.`;
    if (idopont.length > ROVID_MAX) errors[p + 'idopont'] = `Az időpont legfeljebb ${ROVID_MAX} karakter.`;
    if (megjegyzes.length > ROVID_MAX) errors[p + 'megjegyzes'] = `A megjegyzés legfeljebb ${ROVID_MAX} karakter.`;
    sorok.push({ nev, tipus: rendezvenyTipus(tipusRaw), idopont, megjegyzes });
  }
  return sorok;
}

/**
 * Blokkonkénti validáló: a `NORMALIZALOK` mintáját követi (`lib/orszagprofil-szotar.ts`),
 * kimerítő a `BlokkKulcs` unión, ezért `validalBlokk` cast nélkül, típusbiztosan indexelhet bele.
 */
const VALIDALOK: { [K in BlokkKulcs]: (fd: FormData, errors: MezoHibak, aktualisEv: number) => ProfilBlokkok[K] } = {
  alapadatok: (fd, errors, aktualisEv) => {
    const b = 'alapadatok';
    return {
      lakossag: szam(fd, b, 'lakossag', { min: 1, max: 10_000_000_000, tizedes: 0 }, errors),
      gdp: szam(fd, b, 'gdp', { min: 0, max: 1_000_000, tizedes: 1 }, errors),
      gdpEgyFore: szam(fd, b, 'gdpEgyFore', { min: 0, max: 10_000_000, tizedes: 0 }, errors),
      gdpNovekedes: szam(fd, b, 'gdpNovekedes', { min: -100, max: 100, tizedes: 1 }, errors),
      adatEv: szam(fd, b, 'adatEv', { min: EV_MIN - 10, max: aktualisEv, tizedes: 0 }, errors),
      forras: szoveg(fd, b, 'forras', ROVID_MAX, errors),
      tagsagok: szurtLista(fd.getAll('tagsagok'), TAGSAGOK),
      tagsagEgyeb: szoveg(fd, b, 'tagsagEgyeb', ROVID_MAX, errors),
      agazatok: szurtLista(fd.getAll('agazatok'), GAZDASAGI_AGAZATOK),
      agazatEgyeb: szoveg(fd, b, 'agazatEgyeb', ROVID_MAX, errors),
    };
  },
  kfiRendszer: (fd, errors) => {
    const b = 'kfiRendszer';
    return {
      teljesitmeny: szoveg(fd, b, 'teljesitmeny', SZOVEG_MAX, errors),
      gerd: szam(fd, b, 'gerd', { min: 0, max: 100, tizedes: 2 }, errors),
      strategia: szoveg(fd, b, 'strategia', ROVID_MAX, errors),
      prioritasok: szurtLista(fd.getAll('prioritasok'), KFI_PRIORITASOK),
      prioritasEgyeb: szoveg(fd, b, 'prioritasEgyeb', ROVID_MAX, errors),
      kiemeltIparagak: szurtLista(fd.getAll('kiemeltIparagak'), IPARAGAK),
      iparagEgyeb: szoveg(fd, b, 'iparagEgyeb', ROVID_MAX, errors),
      erossegek: szoveg(fd, b, 'erossegek', SZOVEG_MAX, errors),
      kihivasok: szoveg(fd, b, 'kihivasok', SZOVEG_MAX, errors),
    };
  },
  intezmenyek: (fd, errors) => {
    const b = 'intezmenyek';
    return {
      iranyitoSzervek: szoveg(fd, b, 'iranyitoSzervek', SZOVEG_MAX, errors),
      egyetemek: szoveg(fd, b, 'egyetemek', SZOVEG_MAX, errors),
      kutatokozpontok: szoveg(fd, b, 'kutatokozpontok', SZOVEG_MAX, errors),
      infrastrukturak: szoveg(fd, b, 'infrastrukturak', SZOVEG_MAX, errors),
    };
  },
  vallalati: (fd, errors) => {
    const b = 'vallalati';
    return {
      kiemeltAgazatok: szurtLista(fd.getAll('kiemeltAgazatok'), IPARAGAK),
      agazatEgyeb: szoveg(fd, b, 'agazatEgyeb', ROVID_MAX, errors),
      topVallalatok: topVallalatokSorok(fd, errors),
      startupok: szoveg(fd, b, 'startupok', SZOVEG_MAX, errors),
      klaszterek: szoveg(fd, b, 'klaszterek', SZOVEG_MAX, errors),
      technologiatranszfer: szoveg(fd, b, 'technologiatranszfer', SZOVEG_MAX, errors),
    };
  },
  programok: (fd, errors) => {
    const b = 'programok';
    return {
      palyazatok: szoveg(fd, b, 'palyazatok', SZOVEG_MAX, errors),
      tamogatasiProgramok: szoveg(fd, b, 'tamogatasiProgramok', SZOVEG_MAX, errors),
      finanszirozasiEszkozok: szoveg(fd, b, 'finanszirozasiEszkozok', SZOVEG_MAX, errors),
      nemzetkoziReszvetel: szoveg(fd, b, 'nemzetkoziReszvetel', SZOVEG_MAX, errors),
    };
  },
  rendezvenyek: (fd, errors) => ({ lista: rendezvenySorok(fd, errors) }),
  kapcsolatok: (fd, errors) => {
    const b = 'kapcsolatok';
    return {
      euMultilateralis: szoveg(fd, b, 'euMultilateralis', SZOVEG_MAX, errors),
      partnerorszagok: szoveg(fd, b, 'partnerorszagok', SZOVEG_MAX, errors),
      egyezmeny: szoveg(fd, b, 'egyezmeny', ROVID_MAX, errors),
      ketoldalu: szoveg(fd, b, 'ketoldalu', SZOVEG_MAX, errors),
      mobilitas: szoveg(fd, b, 'mobilitas', SZOVEG_MAX, errors),
    };
  },
  magyarErtekeles: (fd, errors) => {
    const b = 'magyarErtekeles';
    return {
      osszegzes: szoveg(fd, b, 'osszegzes', OSSZEGZES_MAX, errors),
      egyuttmukodesiLehetosegek: szoveg(fd, b, 'egyuttmukodesiLehetosegek', SZOVEG_MAX, errors),
      joGyakorlatok: szoveg(fd, b, 'joGyakorlatok', SZOVEG_MAX, errors),
      diplomaciaiPrioritasok: szoveg(fd, b, 'diplomaciaiPrioritasok', SZOVEG_MAX, errors),
    };
  },
};

/** Egy blokk validálása. Az `aktualisEv` az adatév felső határa. */
export function validalBlokk<K extends BlokkKulcs>(blokk: K, fd: FormData, aktualisEv: number): ValidalasEredmeny<K> {
  const errors: MezoHibak = {};
  const ertek = VALIDALOK[blokk](fd, errors, aktualisEv);
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}
