export const IDOZONA = 'Europe/Budapest';

const HU_DATUM = new Intl.DateTimeFormat('hu-HU', {
  timeZone: IDOZONA,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Dátum magyar formában (pl. „2026. 09. 07."), fix Europe/Budapest időzónával. */
export function formatDatum(d: Date): string {
  return HU_DATUM.format(d);
}

// A falióra-idő (Europe/Budapest) kiolvasásához: a becsült UTC pillanatot visszaformázzuk
// budapesti naptár/óra szerint, és az eltérés (falióra - becslés) adja az aktuális eltolást.
// DST-váltás napján ez egy közelítés (a formatToParts az adott pillanat szerinti eltolást
// adja vissza, nem a nap eleji 00:00-ét), de a hiba legfeljebb az átállás órája.
const FALIORA_FORMATTER = new Intl.DateTimeFormat('en-US', {
  timeZone: IDOZONA,
  hourCycle: 'h23',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

function eltolasEzredmasodperc(becsultInstant: Date): number {
  const parts = FALIORA_FORMATTER.formatToParts(becsultInstant);
  const ertek: Record<string, string> = {};
  for (const p of parts) ertek[p.type] = p.value;
  const faliora = Date.UTC(
    Number(ertek.year),
    Number(ertek.month) - 1,
    Number(ertek.day),
    Number(ertek.hour),
    Number(ertek.minute),
    Number(ertek.second),
  );
  return faliora - becsultInstant.getTime();
}

function napKezdeteSzamokbol(ev: number, ho: number, nap: number): Date {
  const becsles = Date.UTC(ev, ho - 1, nap);
  if (Number.isNaN(becsles)) return new Date(NaN);
  const eltolas = eltolasEzredmasodperc(new Date(becsles));
  return new Date(becsles - eltolas);
}

/** A `YYYY-MM-DD` naptári nap 00:00-ja Europe/Budapest szerint, UTC instantként. */
export function napKezdete(datum: string): Date {
  const [ev, ho, nap] = datum.split('-').map(Number);
  return napKezdeteSzamokbol(ev, ho, nap);
}

/** A következő naptári nap `napKezdete`-je. */
export function kovetkezoNapKezdete(datum: string): Date {
  const [ev, ho, nap] = datum.split('-').map(Number);
  const kovetkezo = new Date(Date.UTC(ev, ho - 1, nap + 1));
  return napKezdeteSzamokbol(kovetkezo.getUTCFullYear(), kovetkezo.getUTCMonth() + 1, kovetkezo.getUTCDate());
}

const DATUM_RE = /^\d{4}-\d{2}-\d{2}$/;

/** `YYYY-MM-DD` naptárilag is érvényes-e (elutasítja pl. a 2026-02-31-et), 2000–2100 évkorláttal. */
export function ervenyesNaptariDatum(d: string): boolean {
  if (!DATUM_RE.test(d)) return false;
  const [evStr, hoStr, napStr] = d.split('-');
  const ev = Number(evStr);
  const ho = Number(hoStr);
  const nap = Number(napStr);
  if (ev < 2000 || ev > 2100) return false;
  const dt = new Date(Date.UTC(ev, ho - 1, nap));
  return dt.getUTCFullYear() === ev && dt.getUTCMonth() === ho - 1 && dt.getUTCDate() === nap;
}
