const HU_DATUM = new Intl.DateTimeFormat('hu-HU', {
  timeZone: 'Europe/Budapest',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
});

/** Dátum magyar formában (pl. „2026. 09. 07."), fix Europe/Budapest időzónával. */
export function formatDatum(d: Date): string {
  return HU_DATUM.format(d);
}
