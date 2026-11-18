import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';
import type { SzempontKulcs } from '../../lib/ertekeles-szotar';
import type { CelAllapot, Hatokor, TervStatusz } from '../../lib/munkaterv-szotar';

// Éves munkaterv. A szótári értékek a lib/munkaterv-szotar.ts és a lib/ertekeles-szotar.ts kulcsai, a CHECK-ek a
// kézi DB-módosítás ellen védenek.

// Az év központi céljainak közzététele: a sor megléte jelenti, hogy a célok véglegesek, és indulhatnak a tervek.
export const munkatervEv = sqliteTable('munkaterv_ev', {
  ev: integer('ev').primaryKey(),
  kozzeteveAt: integer('kozzeteve_at', { mode: 'timestamp_ms' }).notNull(),
  kozzetetteNev: text('kozzetette_nev').notNull(),
});

// A központ évenkénti céljai. A tervekbe másolat kerül belőlük (munkaterv_cel.kozponti_cel_id).
export const kozpontiCel = sqliteTable(
  'kozponti_cel',
  {
    id: text('id').primaryKey(),
    ev: integer('ev').notNull(),
    megnevezes: text('megnevezes').notNull(),
    szempont: text('szempont').$type<SzempontKulcs>().notNull(),
    merce: text('merce').notNull(),
    hatokor: text('hatokor').$type<Hatokor>().notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('kozponti_cel_ev_idx').on(table.ev),
    check(
      'kozponti_cel_szempont_check',
      sql`${table.szempont} in ('tajekoztatas', 'orszagismeret', 'kapcsolatepites', 'eredmenyek', 'egyuttmukodes')`,
    ),
    check(
      'kozponti_cel_hatokor_check',
      sql`${table.hatokor} in ('halozat', 'europa', 'azsia', 'kozelKelet', 'afrika', 'amerika')`,
    ),
  ],
);

// Attasénként és évenként egy terv. Az `updated_at` a verzióellenőrzés alapja, ezért minden mentés explicit állítja
// (db/queries/munkaterv.ts). A `megjegyzes` a központ nyitott üzenete az attasénak, a `modositasi_kerelem` az attasé
// nyitott kérése a jóváhagyott terv módosítására.
export const munkaterv = sqliteTable(
  'munkaterv',
  {
    id: text('id').primaryKey(),
    attaseId: text('attase_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    ev: integer('ev').notNull(),
    statusz: text('statusz').$type<TervStatusz>().notNull(),
    megjegyzes: text('megjegyzes'),
    modositasiKerelem: text('modositasi_kerelem'),
    jovahagytaNev: text('jovahagyta_nev'),
    jovahagyvaAt: integer('jovahagyva_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('munkaterv_attase_ev_idx').on(table.attaseId, table.ev),
    index('munkaterv_ev_idx').on(table.ev),
    check(
      'munkaterv_statusz_check',
      sql`${table.statusz} in ('piszkozat', 'jovahagyasra_var', 'visszakuldott', 'jovahagyott')`,
    ),
  ],
);

// A terv céljai. A központi célból másolt sornál a `kozponti_cel_id` töltött: annak csak az országa módosítható.
export const munkatervCel = sqliteTable(
  'munkaterv_cel',
  {
    id: text('id').primaryKey(),
    tervId: text('terv_id')
      .notNull()
      .references(() => munkaterv.id, { onDelete: 'cascade' }),
    kozpontiCelId: text('kozponti_cel_id').references(() => kozpontiCel.id, { onDelete: 'restrict' }),
    sorrend: integer('sorrend').notNull(),
    megnevezes: text('megnevezes').notNull(),
    orszagKod: text('orszag_kod').notNull(),
    szempont: text('szempont').$type<SzempontKulcs>().notNull(),
    merce: text('merce').notNull(),
    allapot: text('allapot').$type<CelAllapot>().notNull().default('folyamatban'),
    allapotMegjegyzes: text('allapot_megjegyzes'),
    allapotModositottaNev: text('allapot_modositotta_nev'),
    allapotModositvaAt: integer('allapot_modositva_at', { mode: 'timestamp_ms' }),
    // A központ felülírta az állapotot: ettől kezdve az attasé nem állíthatja, csak a központ írhatja felül újra.
    allapotFelulirva: integer('allapot_felulirva', { mode: 'boolean' }).notNull().default(false),
  },
  (table) => [
    index('munkaterv_cel_terv_sorrend_idx').on(table.tervId, table.sorrend),
    index('munkaterv_cel_kozponti_cel_idx').on(table.kozpontiCelId),
    check(
      'munkaterv_cel_szempont_check',
      sql`${table.szempont} in ('tajekoztatas', 'orszagismeret', 'kapcsolatepites', 'eredmenyek', 'egyuttmukodes')`,
    ),
    check(
      'munkaterv_cel_allapot_check',
      sql`${table.allapot} in ('folyamatban', 'teljesult', 'reszben', 'elmaradt')`,
    ),
  ],
);
