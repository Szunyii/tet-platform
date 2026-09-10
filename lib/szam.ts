/** Magyar számformázás (ezreselválasztó szóköz, tizedesvessző). A profil olvasó nézet és a térkép-panel is ezt használja. */
const HU = new Intl.NumberFormat('hu-HU');

/** `null` → „–"; az `utotag` közvetlenül a szám után kerül (pl. `' %'`). */
export function formatSzam(n: number | null, utotag = ''): string {
  return n === null ? '–' : `${HU.format(n)}${utotag}`;
}
