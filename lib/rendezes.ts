/**
 * Magyar ábécérend (ékezetek, kettős betűk) a felhasználói listákhoz. A SQLite BINARY collation az ékezetes
 * neveket a lista végére tenné, ezért a rendezés JS-ben fut. Egy modulszintű Collator: ugyanazt a sorrendet
 * adja, mint a `localeCompare(…, 'hu')`, de nem épít hívásonként újat.
 */
const HU = new Intl.Collator('hu');

export function huOsszevet(a: string, b: string): number {
  return HU.compare(a, b);
}
