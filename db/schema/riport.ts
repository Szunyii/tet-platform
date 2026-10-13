import { sql } from 'drizzle-orm';
import { blob, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

// Információs bejegyzés. A kulcsszavak JSON tömbként (SQLite json_each-csel szűrhető);
// a kategória a lib/riport-szotar.ts KATEGORIAK kulcsa. Az orszag a beküldéskori
// session-országból másolódik, nem követi a user későbbi módosítását.
export const riport = sqliteTable(
  'riport',
  {
    id: text('id').primaryKey(),
    szerzoId: text('szerzo_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    orszag: text('orszag').notNull(),
    kategoria: text('kategoria').notNull(),
    targy: text('targy').notNull(),
    leiras: text('leiras').notNull(),
    kulcsszavak: text('kulcsszavak', { mode: 'json' }).$type<string[]>().notNull(),
    esemenyDatum: text('esemeny_datum'),
    esemenyHelyszin: text('esemeny_helyszin'),
    joGyakorlat: text('jo_gyakorlat'),
    kapcsolodoFeladat: text('kapcsolodo_feladat'),
    // A központ (admin) „Megtett intézkedése”: a három oszlop együtt null vagy együtt töltött,
    // csak a setIntezkedes írja. A név pillanatkép (nincs FK), mint a ticket_uzenet.szerzo_nev.
    intezkedes: text('intezkedes'),
    intezkedesSzerzoNev: text('intezkedes_szerzo_nev'),
    intezkedesIdopont: integer('intezkedes_idopont', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('riport_szerzo_idx').on(table.szerzoId),
    index('riport_kategoria_idx').on(table.kategoria),
    index('riport_created_idx').on(table.createdAt),
  ],
);

// Csatolmány külön táblában: a lista lekérdezés sosem olvassa a blobot.
export const riportCsatolmany = sqliteTable(
  'riport_csatolmany',
  {
    id: text('id').primaryKey(),
    riportId: text('riport_id')
      .notNull()
      .references(() => riport.id, { onDelete: 'cascade' }),
    fajlnev: text('fajlnev').notNull(),
    mime: text('mime').notNull(),
    meret: integer('meret').notNull(),
    tartalom: blob('tartalom', { mode: 'buffer' }).notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [index('riport_csatolmany_riport_idx').on(table.riportId)],
);
