import type { CsatolmanyInput } from '../db/queries/riport';
import type { ElfogadottFajl } from './riport-validacio';

/** A validátor által elfogadott File-ok beolvasása a DB-be írható alakra. */
export async function fajlokCsatolmannya(fajlok: ElfogadottFajl[]): Promise<CsatolmanyInput[]> {
  return Promise.all(
    fajlok.map(async ({ file, mime, nev }) => {
      const tartalom = Buffer.from(await file.arrayBuffer());
      return { fajlnev: nev, mime, meret: tartalom.length, tartalom };
    }),
  );
}
