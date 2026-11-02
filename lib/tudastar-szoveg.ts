/**
 * A tudástár szövegeinek megjelenítési segédei (tiszta függvények). A szöveges mezők sima szövegek két
 * szabállyal: üres sor = új bekezdés, „- ” (vagy „• ”) kezdetű sor = felsoroláspont. HTML-t nem értelmezünk.
 */

export type SzovegBlokk = { tipus: 'bekezdes'; sorok: string[] } | { tipus: 'lista'; elemek: string[] };

const LISTA_SOR = /^\s*[-•]\s+/;

/** A szöveg bekezdésekre és felsorolásokra bontva, a beírás sorrendjében. */
export function tagolSzoveg(s: string): SzovegBlokk[] {
  const blokkok: SzovegBlokk[] = [];
  let aktualis: SzovegBlokk | null = null;
  for (const sor of s.split('\n')) {
    if (sor.trim() === '') {
      aktualis = null;
      continue;
    }
    if (LISTA_SOR.test(sor)) {
      const elem = sor.replace(LISTA_SOR, '').trim();
      if (aktualis?.tipus !== 'lista') {
        aktualis = { tipus: 'lista', elemek: [] };
        blokkok.push(aktualis);
      }
      aktualis.elemek.push(elem);
    } else {
      if (aktualis?.tipus !== 'bekezdes') {
        aktualis = { tipus: 'bekezdes', sorok: [] };
        blokkok.push(aktualis);
      }
      aktualis.sorok.push(sor.trim());
    }
  }
  return blokkok;
}

/** Az URL megjelenő rövid alakja: a hoszt „www.” nélkül (pl. „nkfih.gov.hu”); érvénytelen URL-re maga a szöveg. */
export function megjelenoHoszt(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
