/**
 * A `/tevekenysegek` oldal URL-paramétereinek tiszta fordítója: `searchParams` → szűrő, és vissza URL-re.
 * Nincs React és nincs DB hívás. Az ismeretlen paraméterértéket eldobja, a kulcs ilyenkor hiányzik.
 * Az év a fejléc ciklusválasztójából jön, ezért nincs évszűrő.
 */
import { parseFelevSzam, type FelevSzam } from './ertekeles-idoszak';
import { ORSZAG_REGIOK, orszagByKod, type RegioKulcs } from './orszagok';
import type { KategoriaKulcs } from './riport-szotar';
import type { SearchParams } from './routes';
import { isSzakasz, type Szakasz } from './tevekenyseg-szotar';

export type TevekenysegFul = 'eredmenyek' | 'tevekenysegek' | 'igazolas';

export interface TevekenysegOldalSzuro {
  /** `null`: nincs (érvényes) `?ful=`, az oldal a szerepkör alapértelmezett fülét veszi. */
  ful: TevekenysegFul | null;
  felev: FelevSzam | null;
  /** A megszakadt ügyek listája látszik a tábla helyett. */
  megszakadt: boolean;
  attase?: string;
  regio?: RegioKulcs;
  orszag?: string;
  szakasz?: Szakasz;
  /** Az új tevékenység párbeszédablaka nyitva érkezik. */
  uj?: 'tevekenyseg';
  /** A jelentés azonosítója, amelyből az új tevékenység indul. */
  riport?: string;
}

/** Az azonosító-paraméterek felső hossza: a formai tisztításhoz elég, a létezést az oldal nézi. */
const AZONOSITO_MAX = 100;

function egy(v: string | string[] | undefined): string {
  const s = Array.isArray(v) ? v[0] : v;
  return (s ?? '').trim();
}

function isFul(v: string): v is TevekenysegFul {
  return v === 'eredmenyek' || v === 'tevekenysegek' || v === 'igazolas';
}

function isRegioKulcs(v: string): v is RegioKulcs {
  return ORSZAG_REGIOK.some((r) => r.kulcs === v);
}

/** URL-paraméterek → szűrő. Ismeretlen vagy érvénytelen értéket eldob. */
export function tevekenysegSzuroFromSearchParams(sp: SearchParams): TevekenysegOldalSzuro {
  const ful = egy(sp.ful);
  const szuro: TevekenysegOldalSzuro = {
    ful: isFul(ful) ? ful : null,
    felev: parseFelevSzam(egy(sp.felev)),
    megszakadt: egy(sp.megszakadt) === '1',
  };

  const attase = egy(sp.attase);
  if (attase) szuro.attase = attase.slice(0, AZONOSITO_MAX);

  const regio = egy(sp.regio);
  if (isRegioKulcs(regio)) szuro.regio = regio;

  // Csak a szótárban ismert kód: a nyers érték a legördülőben nem szerepelhet.
  const orszag = egy(sp.orszag);
  if (orszagByKod(orszag)) szuro.orszag = orszag;

  const szakasz = egy(sp.szakasz);
  if (isSzakasz(szakasz)) szuro.szakasz = szakasz;

  if (egy(sp.uj) === 'tevekenyseg') szuro.uj = 'tevekenyseg';

  const riport = egy(sp.riport);
  if (riport) szuro.riport = riport.slice(0, AZONOSITO_MAX);

  return szuro;
}

/** A szűrő URL-je; a meg nem adott és az alapértékű paraméterek kimaradnak. A `tevekenysegSzuroFromSearchParams` párja. */
export function tevekenysegUrl(s: Partial<TevekenysegOldalSzuro>): string {
  const p = new URLSearchParams();
  if (s.ful) p.set('ful', s.ful);
  if (s.felev) p.set('felev', String(s.felev));
  if (s.megszakadt) p.set('megszakadt', '1');
  if (s.attase) p.set('attase', s.attase);
  if (s.regio) p.set('regio', s.regio);
  if (s.orszag) p.set('orszag', s.orszag);
  if (s.szakasz) p.set('szakasz', s.szakasz);
  if (s.uj) p.set('uj', s.uj);
  if (s.riport) p.set('riport', s.riport);
  const q = p.toString();
  return q ? `/tevekenysegek?${q}` : '/tevekenysegek';
}

/** Tevékenység ezekből a jelentéskategóriákból indítható: a „Rendezvény, találkozó, delegáció” és az „Együttműködési lehetőségek”. */
export function jelentesbolIndithato(kategoria: KategoriaKulcs): boolean {
  return kategoria === 'rendezveny' || kategoria === 'egyuttmukodes';
}
