import { sql } from 'drizzle-orm';
import { check, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import type { RogzitettOrszag } from '../../lib/ertekeles-szotar';

// Szakmai értékelés (monitoring): félévenként egy időszak, időszakonként és attasénként egy értékelés,
// értékelésenként és szempontonként egy minősítés. A szempont kulcsa a lib/ertekeles-szotar.ts
// SZEMPONTOK-ból való (nincs rá CHECK, mert a lista a kódban él). A CHECK-ek a kézi DB-módosítás ellen
// védenek: hibás JSON-nál a Drizzle JSON.parse-a az egész nézetet eldöntené.
export const ertekelesiIdoszak = sqliteTable(
  'ertekelesi_idoszak',
  {
    id: text('id').primaryKey(),
    ev: integer('ev').notNull(),
    felev: integer('felev').notNull(),
    statusz: text('statusz').notNull(),
    // Az utolsó lezárás ideje és a lezáró nevének pillanatképe (nincs FK: a név a felhasználó törlése után is marad).
    lezarvaAt: integer('lezarva_at', { mode: 'timestamp_ms' }),
    lezartaNev: text('lezarta_nev'),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('ertekelesi_idoszak_ev_felev_idx').on(table.ev, table.felev),
    check('ertekelesi_idoszak_felev_check', sql`${table.felev} in (1, 2)`),
    check('ertekelesi_idoszak_statusz_check', sql`${table.statusz} in ('nyitott', 'lezart')`),
  ],
);

// Az `attase_id` SZÁNDÉKOSAN nem FK: az értékelés a felhasználó törlése után is megmarad és megnyitható.
// Az `attase_nev`, `szekhely_kod`, `varos`, `orszagok` pillanatkép: nyitott félévben a felület az élő
// hozzárendelést használja, lezáráskor ezek az oszlopok frissülnek. A `mutatok` az automatikus mutatók
// JSON pillanatképe lezáráskor (nyitott félévben null). Az összminősítést és a fokozatokat csak admin adja.
export const attaseErtekeles = sqliteTable(
  'attase_ertekeles',
  {
    id: text('id').primaryKey(),
    idoszakId: text('idoszak_id')
      .notNull()
      .references(() => ertekelesiIdoszak.id, { onDelete: 'cascade' }),
    attaseId: text('attase_id').notNull(),
    attaseNev: text('attase_nev').notNull(),
    szekhelyKod: text('szekhely_kod').notNull(),
    varos: text('varos'),
    orszagok: text('orszagok', { mode: 'json' }).$type<RogzitettOrszag[]>().notNull(),
    kimarad: integer('kimarad', { mode: 'boolean' }).notNull().default(false),
    kimaradasOka: text('kimaradas_oka'),
    osszFokozat: integer('ossz_fokozat'),
    osszIndoklas: text('ossz_indoklas'),
    fejlesztesiCel: text('fejlesztesi_cel'),
    ertekeloNev: text('ertekelo_nev'),
    minositveAt: integer('minositve_at', { mode: 'timestamp_ms' }),
    // Az ErtekelesMutatok típust a lib/ertekeles-mutatok.ts adja majd (2. feladat); addig unknown.
    mutatok: text('mutatok', { mode: 'json' }).$type<unknown>(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    uniqueIndex('attase_ertekeles_idoszak_attase_idx').on(table.idoszakId, table.attaseId),
    check(
      'attase_ertekeles_ossz_fokozat_check',
      sql`${table.osszFokozat} is null or ${table.osszFokozat} between 1 and 4`,
    ),
    check('attase_ertekeles_orszagok_check', sql`json_valid(${table.orszagok})`),
    check('attase_ertekeles_mutatok_check', sql`${table.mutatok} is null or json_valid(${table.mutatok})`),
  ],
);

// A szempontonkénti minősítés. Az `updated_at` a verzióellenőrzés alapja (két admin ugyanazt a szempontot
// menti: a második elavult verziót kap), ezért a mentés explicit állítja.
export const szempontMinosites = sqliteTable(
  'szempont_minosites',
  {
    ertekelesId: text('ertekeles_id')
      .notNull()
      .references(() => attaseErtekeles.id, { onDelete: 'cascade' }),
    szempont: text('szempont').notNull(),
    fokozat: integer('fokozat').notNull(),
    indoklas: text('indoklas'),
    ertekeloNev: text('ertekelo_nev').notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.ertekelesId, table.szempont] }),
    check('szempont_minosites_fokozat_check', sql`${table.fokozat} between 0 and 4`),
  ],
);
