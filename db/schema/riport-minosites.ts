import { sql } from 'drizzle-orm';
import { check, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import type { OsszFokozat } from '../../lib/ertekeles-szotar';
import { riport } from './riport';

// A jelentések központi minősítése: jelentésenként legfeljebb egy sor (a riport_id az elsődleges kulcs), a jelentés
// törlésekor a sor is törlődik. Külön tábla, mert a `riport` szülőtábla újraépítése adatvesztéssel járhat (CLAUDE.md),
// és így a minősítés szerkezetileg is elkülönül az attasénak adott adatoktól: csak admin nézethez futó külön
// lekérdezés olvassa (db/queries/riport-minosites.ts). A `szerzo_nev` pillanatkép (nincs FK), mint a
// `riport.intezkedes_szerzo_nev`. Az `updated_at` mentésenként explicit állítódik; a `riport.updated_at`-ot a minősítés
// nem érinti. A fokozat 1–4 (a 0 „nem értékelhető” nem jelentés-fokozat), a CHECK a kézi DB-módosítás ellen véd.
export const riportMinosites = sqliteTable(
  'riport_minosites',
  {
    riportId: text('riport_id')
      .primaryKey()
      .references(() => riport.id, { onDelete: 'cascade' }),
    fokozat: integer('fokozat').$type<OsszFokozat>().notNull(),
    megjegyzes: text('megjegyzes'),
    szerzoNev: text('szerzo_nev').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [check('riport_minosites_fokozat_check', sql`${table.fokozat} between 1 and 4`)],
);
