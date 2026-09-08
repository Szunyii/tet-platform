/**
 * A riport (információs bejegyzés) szótárai. Framework-mentes konstansok: a form, a
 * validáció és a lista ugyanebből dolgozik. A címkék a NIÜ megrendelői szövegei.
 */

export const KATEGORIAK = [
  {
    kulcs: 'szabalyozas',
    cimke: 'KFI szabályozási és intézményi környezet',
    rovid: 'Szabályozás',
    leiras: 'Jogszabályi, intézményi és kormányzati KFI-politikai változások.',
    datumKotelezo: false,
    szin: 'bg-sky-100 text-sky-900',
  },
  {
    kulcs: 'finanszirozas',
    cimke: 'KFI finanszírozás, beruházások, támogatások',
    rovid: 'Finanszírozás',
    leiras: 'Költségvetés, alapok, befektetések, támogatási programok.',
    datumKotelezo: false,
    szin: 'bg-emerald-100 text-emerald-900',
  },
  {
    kulcs: 'okoszisztema',
    cimke: 'KFI ökoszisztéma – aktualitások, hírek',
    rovid: 'Ökoszisztéma',
    leiras: 'Szereplők, trendek, hírek az innovációs ökoszisztémából.',
    datumKotelezo: false,
    szin: 'bg-violet-100 text-violet-900',
  },
  {
    kulcs: 'rendezveny',
    cimke: 'Rendezvény, találkozó, delegáció (részvétel külső eseményen / saját szervezés)',
    rovid: 'Rendezvény',
    leiras: 'Esemény, találkozó vagy delegáció; a dátum és a helyszín kötelező.',
    datumKotelezo: true,
    szin: 'bg-amber-100 text-amber-900',
  },
  {
    kulcs: 'palyazat',
    cimke: 'Pályázati felhívás, rendezvény részvételi lehetőség',
    rovid: 'Pályázat',
    leiras: 'Nyitott vagy várható kiírások, részvételi lehetőségek magyar szereplőknek.',
    datumKotelezo: false,
    szin: 'bg-rose-100 text-rose-900',
  },
  {
    kulcs: 'egyuttmukodes',
    cimke: 'Együttműködési lehetőségek (kutatási / technológiai / oktatási / pályázati / üzleti), partnerkeresés',
    rovid: 'Együttműködés',
    leiras: 'Partnerségi és partnerkeresési lehetőségek bármely területen.',
    datumKotelezo: false,
    szin: 'bg-teal-100 text-teal-900',
  },
] as const;

export type Kategoria = (typeof KATEGORIAK)[number];
export type KategoriaKulcs = Kategoria['kulcs'];

export function kategoriaByKulcs(kulcs: KategoriaKulcs): Kategoria {
  return KATEGORIAK.find((k) => k.kulcs === kulcs)!;
}

export function isKategoriaKulcs(v: string): v is KategoriaKulcs {
  return KATEGORIAK.some((k) => k.kulcs === v);
}

export const KULCSSZAVAK = [
  'Innováció',
  'Innovációs ökoszisztéma',
  'Tudomány',
  'Tudományos együttműködés',
  'Technológia',
  'Technológiafejlesztés',
  'Egyetem',
  'Felsőoktatás',
  'Kutatás',
  'K+F / KFI',
  'Startup',
  'Scaleup',
  'Mesterséges intelligencia / AI',
  'Nemzetközi együttműködés',
  'Rendezvény',
  'Konferencia',
  'Látogatás / delegáció',
  'Egyeztetés / megbeszélés',
  'Pályázati felhívás / lehetőség',
  'Programok / kezdeményezések',
  'Innovációs ügynökségek / intézetek',
  'Digitalizáció',
  'Horizon Europe / EU programok',
  'Űrkutatás / space',
  'Stratégia',
  'Szakpolitika',
  'Oktatás',
  'Partnerkapcsolatok / partnerkeresés',
  'Technológiatranszfer',
  'Kutatóintézetek / kutatóközpontok',
  'Summit / szakmai fórum',
  'Nemzetköziesítés / külpiac',
] as const;

export type Kulcsszo = (typeof KULCSSZAVAK)[number];
export const KULCSSZO_MAX = 5;

export function isKulcsszo(v: string): v is Kulcsszo {
  return (KULCSSZAVAK as readonly string[]).includes(v);
}

/** Csatolmány-korlátok. A MIME-t a kiterjesztés alapján rögzítjük (a böngésző néha üreset küld). */
export const CSATOLMANY_LIMIT = {
  maxDarab: 5,
  maxMeret: 8 * 1024 * 1024,
  /** kiterjesztés → tárolt MIME */
  tipusok: {
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    '.ppt': 'application/vnd.ms-powerpoint',
    '.pptx': 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
  } as Record<string, string>,
} as const;

/** A fájlválasztó `accept` attribútumához. */
export const CSATOLMANY_ACCEPT = Object.keys(CSATOLMANY_LIMIT.tipusok).join(',');

export const TARGY_MAX = 200;
export const LEIRAS_MAX = 5000;
export const HELYSZIN_MAX = 200;
export const SZOVEG_MAX = 5000;

/** Fájlnév kiterjesztése kisbetűvel, ponttal (pl. ".pdf"), vagy üres string. */
export function kiterjesztes(fajlnev: string): string {
  const i = fajlnev.lastIndexOf('.');
  return i >= 0 ? fajlnev.slice(i).toLowerCase() : '';
}

export function formatMeret(bajt: number): string {
  if (bajt < 1024) return `${bajt} B`;
  if (bajt < 1024 * 1024) return `${(bajt / 1024).toFixed(0)} KB`;
  return `${(bajt / (1024 * 1024)).toFixed(1)} MB`;
}
