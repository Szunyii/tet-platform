/**
 * Közös, framework-mentes segédek a szerver-oldali FormData validátorokhoz. Nincs
 * React, nincs DB. A form-mintát (`useMuveletForm`, `MezoHiba`) használó minden
 * feature validátora (felhasználó-kezelés, riport) ugyanezt a szöveg-tisztítást és
 * hibatérkép-típust használja.
 */

/** Mezőnév → hibaüzenet. A `form` kulcs az űrlap-szintű (mezőhöz nem köthető) hibáé. */
export type MezoHibak = Record<string, string>;

// Zéró szélességű / láthatatlan karakterek (ZWSP, ZWNJ, ZWJ, BOM): a trim() nem szedi
// le, de nem is látszanak, így könnyen becsempészhető velük pl. üresnek tűnő, valójában
// nem üres mező.
export const LATHATATLAN_RE = /[\u200B-\u200D\uFEFF]/g;

// C0 vezérlőkarakterek a sortörés (LF, \n), kocsivissza (CR, \r) és tabulátor (\t)
// kivételével: ezek a mezőértékben nem hordoznak információt, csak zavart okoznak.
export const VEZERLO_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

/** Láthatatlan és vezérlőkarakterek eltávolítása, majd trim; nem string bemenetre `''`. */
export function tisztitSzoveg(v: unknown): string {
  if (typeof v !== 'string') return '';
  return v.replace(LATHATATLAN_RE, '').replace(VEZERLO_RE, '').trim();
}

/** Egy FormData szöveges mezőjének tisztított értéke (hiányzó vagy fájl érték → ''). */
export function mezo(fd: FormData, key: string): string {
  return tisztitSzoveg(fd.get(key));
}
