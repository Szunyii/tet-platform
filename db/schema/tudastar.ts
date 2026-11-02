import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';
import type { KartyaTartalom } from '../../lib/tudastar-szotar';

// TéT Tudástár: egy sor = egy kártya. A `kategoria` a lib/tudastar-szotar.ts TUDASTAR_KATEGORIAK slugja,
// a `tipus` 'intezmeny' | 'lista' (létrehozás után nem változik). A `tartalom` típusonként más alakú JSON;
// olvasáskor a normalizalTartalom() egészíti ki (régi sor, új almező). A `szerzo_id` az utolsó módosító.
// A CHECK-ek a kézi DB-módosítás ellen védenek: hibás JSON-nál a Drizzle JSON.parse-a minden tudástár-oldalt
// eldöntené (a normalizáló ezt már nem tudja elkapni). A kategóriára nincs CHECK, mert a lista a kódban él.
export const tudastarKartya = sqliteTable(
  'tudastar_kartya',
  {
    id: text('id').primaryKey(),
    kategoria: text('kategoria').notNull(),
    slug: text('slug').notNull(),
    tipus: text('tipus').notNull(),
    nev: text('nev').notNull(),
    rovidites: text('rovidites'),
    osszefoglalo: text('osszefoglalo').notNull(),
    honlap: text('honlap'),
    sorrend: integer('sorrend').notNull(),
    tartalom: text('tartalom', { mode: 'json' }).$type<KartyaTartalom>().notNull(),
    szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('tudastar_kartya_slug_idx').on(table.slug),
    index('tudastar_kartya_kategoria_idx').on(table.kategoria, table.sorrend),
    check('tudastar_kartya_tipus_check', sql`${table.tipus} in ('intezmeny', 'lista')`),
    check('tudastar_kartya_tartalom_check', sql`json_valid(${table.tartalom})`),
  ],
);
