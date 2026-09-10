/**
 * FormData → típusos blokk, blokkonként. Nincs React, nincs DB. Minden hibát egy menetben
 * gyűjtünk; a hibakulcs a mező id-ja (a useMuveletForm erre fókuszál). A listás mezők
 * több azonos nevű értékként érkeznek (fd.getAll); a rendezvény-sorok `rendezveny.<i>.<mezo>`.
 */
import { mezo, type MezoHibak } from './urlap';
import {
  EV_MIN, GAZDASAGI_AGAZATOK, IPARAGAK, KFI_PRIORITASOK, MEZO_CIMKEK, OSSZEGZES_MAX, RENDEZVENY_MAX,
  ROVID_MAX, SZOVEG_MAX, TAGSAGOK, TOP_VALLALAT_MAX, rendezvenyTipus,
  type Alapadatok, type BlokkKulcs, type MezoCimke, type Intezmenyek, type Kapcsolatok, type KfiRendszer,
  type MagyarErtekeles, type ProfilBlokkok, type Programok, type Rendezveny,
  type Rendezvenyek, type Vallalati,
} from './orszagprofil-szotar';

export type ValidalasEredmeny<K extends BlokkKulcs> =
  | { ok: true; ertek: ProfilBlokkok[K] }
  | { ok: false; errors: MezoHibak };

function cimke(blokk: BlokkKulcs, kulcs: string): string {
  // A MEZO_CIMKEK típusa mezőnév szerint szigorú; itt stringgel indexelünk, ezért laza nézet.
  return (MEZO_CIMKEK[blokk] as Partial<Record<string, MezoCimke>>)[kulcs]?.cimke ?? kulcs;
}

function szoveg(fd: FormData, blokk: BlokkKulcs, kulcs: string, max: number, errors: MezoHibak): string {
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
function szam(fd: FormData, blokk: BlokkKulcs, kulcs: string, sz: SzamSzabaly, errors: MezoHibak): number | null {
  const raw = mezo(fd, kulcs);
  if (!raw) return null;
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

function lista<T extends string>(fd: FormData, kulcs: string, engedett: readonly T[]): T[] {
  const eng = engedett as readonly string[];
  const ertekek = fd.getAll(kulcs).filter((v): v is string => typeof v === 'string' && eng.includes(v));
  return Array.from(new Set(ertekek)) as T[];
}

function alapadatok(fd: FormData, aktualisEv: number): ValidalasEredmeny<'alapadatok'> {
  const errors: MezoHibak = {};
  const b = 'alapadatok';
  const ertek: Alapadatok = {
    lakossag: szam(fd, b, 'lakossag', { min: 1, max: 10_000_000_000, tizedes: 0 }, errors),
    gdp: szam(fd, b, 'gdp', { min: 0, max: 1_000_000, tizedes: 1 }, errors),
    gdpEgyFore: szam(fd, b, 'gdpEgyFore', { min: 0, max: 10_000_000, tizedes: 0 }, errors),
    gdpNovekedes: szam(fd, b, 'gdpNovekedes', { min: -100, max: 100, tizedes: 1 }, errors),
    adatEv: szam(fd, b, 'adatEv', { min: EV_MIN - 10, max: aktualisEv, tizedes: 0 }, errors),
    forras: szoveg(fd, b, 'forras', ROVID_MAX, errors),
    tagsagok: lista(fd, 'tagsagok', TAGSAGOK),
    tagsagEgyeb: szoveg(fd, b, 'tagsagEgyeb', ROVID_MAX, errors),
    agazatok: lista(fd, 'agazatok', GAZDASAGI_AGAZATOK),
    agazatEgyeb: szoveg(fd, b, 'agazatEgyeb', ROVID_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function kfiRendszer(fd: FormData): ValidalasEredmeny<'kfiRendszer'> {
  const errors: MezoHibak = {};
  const b = 'kfiRendszer';
  const ertek: KfiRendszer = {
    teljesitmeny: szoveg(fd, b, 'teljesitmeny', SZOVEG_MAX, errors),
    gerd: szam(fd, b, 'gerd', { min: 0, max: 100, tizedes: 2 }, errors),
    strategia: szoveg(fd, b, 'strategia', ROVID_MAX, errors),
    prioritasok: lista(fd, 'prioritasok', KFI_PRIORITASOK),
    prioritasEgyeb: szoveg(fd, b, 'prioritasEgyeb', ROVID_MAX, errors),
    kiemeltIparagak: lista(fd, 'kiemeltIparagak', IPARAGAK),
    iparagEgyeb: szoveg(fd, b, 'iparagEgyeb', ROVID_MAX, errors),
    erossegek: szoveg(fd, b, 'erossegek', SZOVEG_MAX, errors),
    kihivasok: szoveg(fd, b, 'kihivasok', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function intezmenyek(fd: FormData): ValidalasEredmeny<'intezmenyek'> {
  const errors: MezoHibak = {};
  const b = 'intezmenyek';
  const ertek: Intezmenyek = {
    iranyitoSzervek: szoveg(fd, b, 'iranyitoSzervek', SZOVEG_MAX, errors),
    egyetemek: szoveg(fd, b, 'egyetemek', SZOVEG_MAX, errors),
    kutatokozpontok: szoveg(fd, b, 'kutatokozpontok', SZOVEG_MAX, errors),
    infrastrukturak: szoveg(fd, b, 'infrastrukturak', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function vallalati(fd: FormData): ValidalasEredmeny<'vallalati'> {
  const errors: MezoHibak = {};
  const b = 'vallalati';
  const sorok = mezo(fd, 'topVallalatok').split('\n').map((s) => s.trim()).filter(Boolean);
  if (sorok.length > TOP_VALLALAT_MAX) errors.topVallalatok = `Legfeljebb ${TOP_VALLALAT_MAX} vállalat adható meg.`;
  else if (sorok.some((s) => s.length > ROVID_MAX)) errors.topVallalatok = `Egy vállalatnév legfeljebb ${ROVID_MAX} karakter.`;
  const ertek: Vallalati = {
    kiemeltAgazatok: lista(fd, 'kiemeltAgazatok', IPARAGAK),
    agazatEgyeb: szoveg(fd, b, 'agazatEgyeb', ROVID_MAX, errors),
    topVallalatok: sorok,
    startupok: szoveg(fd, b, 'startupok', SZOVEG_MAX, errors),
    klaszterek: szoveg(fd, b, 'klaszterek', SZOVEG_MAX, errors),
    technologiatranszfer: szoveg(fd, b, 'technologiatranszfer', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function programok(fd: FormData): ValidalasEredmeny<'programok'> {
  const errors: MezoHibak = {};
  const b = 'programok';
  const ertek: Programok = {
    palyazatok: szoveg(fd, b, 'palyazatok', SZOVEG_MAX, errors),
    tamogatasiProgramok: szoveg(fd, b, 'tamogatasiProgramok', SZOVEG_MAX, errors),
    finanszirozasiEszkozok: szoveg(fd, b, 'finanszirozasiEszkozok', SZOVEG_MAX, errors),
    nemzetkoziReszvetel: szoveg(fd, b, 'nemzetkoziReszvetel', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function rendezvenyek(fd: FormData): ValidalasEredmeny<'rendezvenyek'> {
  const errors: MezoHibak = {};
  const sorok: Rendezveny[] = [];
  for (let i = 0; i < RENDEZVENY_MAX; i++) {
    const p = `rendezveny.${i}.`;
    const nev = mezo(fd, p + 'nev');
    const tipusRaw = mezo(fd, p + 'tipus');
    const idopont = mezo(fd, p + 'idopont');
    const megjegyzes = mezo(fd, p + 'megjegyzes');
    if (!nev && !idopont && !megjegyzes) continue;
    if (!nev) errors[p + 'nev'] = 'A rendezvény neve kötelező.';
    if (nev.length > ROVID_MAX) errors[p + 'nev'] = `A név legfeljebb ${ROVID_MAX} karakter.`;
    if (idopont.length > ROVID_MAX) errors[p + 'idopont'] = `Az időpont legfeljebb ${ROVID_MAX} karakter.`;
    if (megjegyzes.length > ROVID_MAX) errors[p + 'megjegyzes'] = `A megjegyzés legfeljebb ${ROVID_MAX} karakter.`;
    sorok.push({ nev, tipus: rendezvenyTipus(tipusRaw), idopont, megjegyzes });
  }
  const ertek: Rendezvenyek = { lista: sorok };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function kapcsolatok(fd: FormData): ValidalasEredmeny<'kapcsolatok'> {
  const errors: MezoHibak = {};
  const b = 'kapcsolatok';
  const ertek: Kapcsolatok = {
    euMultilateralis: szoveg(fd, b, 'euMultilateralis', SZOVEG_MAX, errors),
    partnerorszagok: szoveg(fd, b, 'partnerorszagok', SZOVEG_MAX, errors),
    egyezmeny: szoveg(fd, b, 'egyezmeny', ROVID_MAX, errors),
    ketoldalu: szoveg(fd, b, 'ketoldalu', SZOVEG_MAX, errors),
    mobilitas: szoveg(fd, b, 'mobilitas', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

function magyarErtekeles(fd: FormData): ValidalasEredmeny<'magyarErtekeles'> {
  const errors: MezoHibak = {};
  const b = 'magyarErtekeles';
  const ertek: MagyarErtekeles = {
    osszegzes: szoveg(fd, b, 'osszegzes', OSSZEGZES_MAX, errors),
    egyuttmukodesiLehetosegek: szoveg(fd, b, 'egyuttmukodesiLehetosegek', SZOVEG_MAX, errors),
    joGyakorlatok: szoveg(fd, b, 'joGyakorlatok', SZOVEG_MAX, errors),
    diplomaciaiPrioritasok: szoveg(fd, b, 'diplomaciaiPrioritasok', SZOVEG_MAX, errors),
  };
  return Object.keys(errors).length ? { ok: false, errors } : { ok: true, ertek };
}

/** Egy blokk validálása. Az `aktualisEv` az adatév felső határa. */
export function validalBlokk<K extends BlokkKulcs>(blokk: K, fd: FormData, aktualisEv: number): ValidalasEredmeny<K> {
  switch (blokk) {
    case 'alapadatok': return alapadatok(fd, aktualisEv) as ValidalasEredmeny<K>;
    case 'kfiRendszer': return kfiRendszer(fd) as ValidalasEredmeny<K>;
    case 'intezmenyek': return intezmenyek(fd) as ValidalasEredmeny<K>;
    case 'vallalati': return vallalati(fd) as ValidalasEredmeny<K>;
    case 'programok': return programok(fd) as ValidalasEredmeny<K>;
    case 'rendezvenyek': return rendezvenyek(fd) as ValidalasEredmeny<K>;
    case 'kapcsolatok': return kapcsolatok(fd) as ValidalasEredmeny<K>;
    default: return magyarErtekeles(fd) as ValidalasEredmeny<K>;
  }
}
