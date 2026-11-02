/**
 * A tudástár keresése (tiszta függvények): kis- és nagybetűre, valamint ékezetre érzéketlen; több szónál
 * minden szónak szerepelnie kell a kártyában (ÉS). A kártyák száma kicsi (~100), ezért JS-ben szűrünk.
 */
import type { Kartya } from './tudastar-szotar';

export const KERESES_MAX = 200;
const RESZLET_HOSSZ = 120;
const RESZLET_ELOTTE = 40;

/** Ékezet nélküli kisbetűs alak, és minden normalizált karakterhez az eredeti szövegbeli indexe. */
function normalizalTerkeppel(s: string): { norm: string; eredeti: number[] } {
  let norm = '';
  const eredeti: number[] = [];
  let i = 0;
  for (const ch of s) {
    const n = ch.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
    norm += n;
    for (let j = 0; j < n.length; j++) eredeti.push(i);
    i += ch.length;
  }
  return { norm, eredeti };
}

/** Ékezet nélküli kisbetűs alak (az összehasonlításhoz). */
export function normalizal(s: string): string {
  return normalizalTerkeppel(s).norm;
}

/** A keresőkifejezés szavai normalizálva; a kifejezés legfeljebb `KERESES_MAX` karakter. */
export function keresoSzavak(q: string): string[] {
  return normalizal(q.slice(0, KERESES_MAX)).split(/\s+/).filter(Boolean);
}

/** A kártya kereshető részei a megjelenítés sorrendjében; a `hol` a találati sorban jelenik meg. */
function reszek(k: Kartya): { hol: string; szoveg: string }[] {
  const r = [
    { hol: '', szoveg: k.nev },
    { hol: '', szoveg: k.rovidites ?? '' },
    { hol: 'Összefoglaló', szoveg: k.osszefoglalo },
  ];
  if (k.tipus === 'intezmeny') {
    const t = k.tartalom;
    r.push({ hol: 'Profil', szoveg: t.profil }, { hol: 'Tevékenység', szoveg: t.tevekenyseg });
    for (const sz of t.szakaszok) r.push({ hol: sz.cim, szoveg: `${sz.cim}\n${sz.szoveg}` });
    for (const p of t.programok) r.push({ hol: 'Programok', szoveg: p.leiras ? `${p.nev} – ${p.leiras}` : p.nev });
  } else {
    for (const s of k.tartalom.sorok) r.push({ hol: 'Lista', szoveg: s.megjegyzes ? `${s.nev} – ${s.megjegyzes}` : s.nev });
  }
  for (const l of k.tartalom.linkek) r.push({ hol: 'Hasznos linkek', szoveg: l.felirat });
  return r;
}

/** Legfeljebb `RESZLET_HOSSZ` karakteres kivágás az `index` körül, egy sorba vonva, „…” jellel a vágott végeken. */
function kivagas(szoveg: string, index: number): string {
  const kezdet = Math.max(0, index - RESZLET_ELOTTE);
  const veg = Math.min(szoveg.length, kezdet + RESZLET_HOSSZ);
  const resz = szoveg.slice(kezdet, veg).replace(/\s+/g, ' ').trim();
  return `${kezdet > 0 ? '…' : ''}${resz}${veg < szoveg.length ? '…' : ''}`;
}

export interface Talalat {
  kartya: Kartya;
  /** Hol talált (pl. „Programok”, egy szakasz címe); üres, ha csak a névben vagy a rövidítésben. */
  hol: string;
  /** Rövid kivágás a találat körül; ha csak a névben talált, az összefoglaló eleje. */
  reszlet: string;
}

/**
 * A kártyák, amelyekben a kifejezés minden szava előfordul, a bemenet sorrendjében. A `hol`/`reszlet` a
 * legtöbb szót tartalmazó rész (holtversenyben a korábbi); a név és a rövidítés helyett – ezek a találati
 * sorban amúgy is látszanak – a következő legjobb rész, vagy annak híján az összefoglaló eleje.
 */
export function keres(kartyak: readonly Kartya[], q: string): Talalat[] {
  const szavak = keresoSzavak(q);
  if (szavak.length === 0) return [];
  const talalatok: Talalat[] = [];
  for (const kartya of kartyak) {
    const r = reszek(kartya).map((x) => ({ ...x, ...normalizalTerkeppel(x.szoveg) }));
    const egesz = r.map((x) => x.norm).join('\n');
    if (!szavak.every((s) => egesz.includes(s))) continue;
    let legjobb: (typeof r)[number] | null = null;
    let legjobbDb = 0;
    for (const x of r) {
      if (x.hol === '') continue;
      const db = szavak.filter((s) => x.norm.includes(s)).length;
      if (db > legjobbDb) {
        legjobb = x;
        legjobbDb = db;
      }
    }
    if (!legjobb) {
      talalatok.push({ kartya, hol: '', reszlet: kivagas(kartya.osszefoglalo, 0) });
      continue;
    }
    const elsoSzo = szavak.find((s) => legjobb.norm.includes(s)) ?? szavak[0];
    const index = legjobb.eredeti[legjobb.norm.indexOf(elsoSzo)] ?? 0;
    talalatok.push({ kartya, hol: legjobb.hol, reszlet: kivagas(legjobb.szoveg, index) });
  }
  return talalatok;
}
