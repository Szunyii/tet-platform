import { sql } from 'drizzle-orm';
import { index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';
import type {
  Alapadatok, Intezmenyek, Kapcsolatok, KfiRendszer, MagyarErtekeles, Programok, Rendezvenyek, Vallalati,
} from '../../lib/orszagprofil-szotar';

// Országprofil: országonként (ISO-kód, lib/orszagok.ts) és évenként egy sor. Blokkonként
// egy JSON oszlop; null = a blokk még nem lett mentve. A tartalmat olvasáskor a
// lib/orszagprofil-szotar.ts normalizalBlokk() egészíti ki (régi sor, új almező).
export const orszagprofil = sqliteTable(
  'orszagprofil',
  {
    id: text('id').primaryKey(),
    orszagKod: text('orszag_kod').notNull(),
    ev: integer('ev').notNull(),
    szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
    alapadatok: text('alapadatok', { mode: 'json' }).$type<Alapadatok>(),
    kfiRendszer: text('kfi_rendszer', { mode: 'json' }).$type<KfiRendszer>(),
    intezmenyek: text('intezmenyek', { mode: 'json' }).$type<Intezmenyek>(),
    vallalati: text('vallalati', { mode: 'json' }).$type<Vallalati>(),
    programok: text('programok', { mode: 'json' }).$type<Programok>(),
    rendezvenyek: text('rendezvenyek', { mode: 'json' }).$type<Rendezvenyek>(),
    kapcsolatok: text('kapcsolatok', { mode: 'json' }).$type<Kapcsolatok>(),
    magyarErtekeles: text('magyar_ertekeles', { mode: 'json' }).$type<MagyarErtekeles>(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('orszagprofil_kod_ev_idx').on(table.orszagKod, table.ev),
    index('orszagprofil_ev_idx').on(table.ev),
  ],
);
