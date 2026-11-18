import { sql } from 'drizzle-orm';
import { check, index, integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth';
import { riport } from './riport';
import type {
  EsemenyTipus, Hozzajarulas, IgazolasAllapot, Szakasz, TevekenysegTipus, UgyAllapot,
} from '../../lib/tevekenyseg-szotar';

// Tevékenységnapló: az attasé delegációi, B2B-találkozói és partnerközvetítései. A szótári értékek a
// lib/tevekenyseg-szotar.ts kulcsai, a CHECK-ek a kézi DB-módosítás ellen védenek. A `kifogas` és társai az
// admin megjegyzése: együtt null vagy együtt töltött. Az `updated_at` a verzióellenőrzés alapja, ezért minden
// mentés explicit állítja (db/queries/tevekenyseg.ts).
export const tevekenyseg = sqliteTable(
  'tevekenyseg',
  {
    id: text('id').primaryKey(),
    attaseId: text('attase_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    tipus: text('tipus').$type<TevekenysegTipus>().notNull(),
    // Naptári nap (`YYYY-MM-DD`, Europe/Budapest): ez dönti el, melyik félévbe számít.
    datum: text('datum').notNull(),
    orszagKod: text('orszag_kod').notNull(),
    megnevezes: text('megnevezes').notNull(),
    partner: text('partner').notNull(),
    magyarSzereplo: text('magyar_szereplo'),
    leiras: text('leiras'),
    riportId: text('riport_id').references(() => riport.id, { onDelete: 'set null' }),
    eredmenyId: text('eredmeny_id').references(() => eredmeny.id, { onDelete: 'set null' }),
    kifogas: text('kifogas'),
    kifogasSzerzoNev: text('kifogas_szerzo_nev'),
    kifogasAt: integer('kifogas_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('tevekenyseg_attase_idx').on(table.attaseId),
    index('tevekenyseg_datum_idx').on(table.datum),
    index('tevekenyseg_eredmeny_idx').on(table.eredmenyId),
    check('tevekenyseg_tipus_check', sql`${table.tipus} in ('delegacio', 'b2b', 'partnerkozvetites')`),
  ],
);

// Eredmény (ügy): több félévig tartó folyamat. A `szakasz` az érvényes szakasz, a `kert_szakasz` a függő
// igazoláskérés célja (null, ha nincs). Az állapotgép a lib/tevekenyseg-allapot.ts-ben van.
export const eredmeny = sqliteTable(
  'eredmeny',
  {
    id: text('id').primaryKey(),
    attaseId: text('attase_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    megnevezes: text('megnevezes').notNull(),
    orszagKod: text('orszag_kod').notNull(),
    partner: text('partner').notNull(),
    magyarSzereplo: text('magyar_szereplo'),
    hozzajarulas: text('hozzajarulas').$type<Hozzajarulas>().notNull(),
    leiras: text('leiras'),
    szakasz: text('szakasz').$type<Szakasz>().notNull(),
    kertSzakasz: text('kert_szakasz').$type<Szakasz>(),
    igazolas: text('igazolas').$type<IgazolasAllapot>().notNull(),
    allapot: text('allapot').$type<UgyAllapot>().notNull(),
    kifogas: text('kifogas'),
    kifogasSzerzoNev: text('kifogas_szerzo_nev'),
    kifogasAt: integer('kifogas_at', { mode: 'timestamp_ms' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
  },
  (table) => [
    index('eredmeny_attase_idx').on(table.attaseId),
    check('eredmeny_hozzajarulas_check', sql`${table.hozzajarulas} in ('kozvetlen', 'kozremukodes')`),
    check(
      'eredmeny_szakasz_check',
      sql`${table.szakasz} in ('lehetoseg', 'kapcsolat', 'egyuttmukodes', 'megallapodas')`,
    ),
    check(
      'eredmeny_kert_szakasz_check',
      sql`${table.kertSzakasz} is null or ${table.kertSzakasz} in ('egyuttmukodes', 'megallapodas')`,
    ),
    check(
      'eredmeny_igazolas_check',
      sql`${table.igazolas} in ('nem_igenyel', 'igazolasra_var', 'igazolt', 'visszakuldott')`,
    ),
    check('eredmeny_allapot_check', sql`${table.allapot} in ('aktiv', 'megszakadt')`),
  ],
);

// Az ügy előzményei. A szerző neve és szerepe pillanatkép (nincs FK). A `beszamitasi_ev`/`_felev` azoknál az
// eseményeknél töltött, amelyek félévbe számítanak (létrehozás, szakaszváltás, igazolás); az igazolásé az
// igazoláskor rögzül, és később nem változik.
export const eredmenyEsemeny = sqliteTable(
  'eredmeny_esemeny',
  {
    id: text('id').primaryKey(),
    eredmenyId: text('eredmeny_id')
      .notNull()
      .references(() => eredmeny.id, { onDelete: 'cascade' }),
    tipus: text('tipus').$type<EsemenyTipus>().notNull(),
    szakasz: text('szakasz').$type<Szakasz>(),
    szoveg: text('szoveg'),
    link: text('link'),
    riportId: text('riport_id').references(() => riport.id, { onDelete: 'set null' }),
    szerzoNev: text('szerzo_nev').notNull(),
    szerzoSzerep: text('szerzo_szerep').$type<'admin' | 'attase'>().notNull(),
    beszamitasiEv: integer('beszamitasi_ev'),
    beszamitasiFelev: integer('beszamitasi_felev'),
    visszavonva: integer('visszavonva', { mode: 'boolean' }).notNull().default(false),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (table) => [
    index('eredmeny_esemeny_eredmeny_idx').on(table.eredmenyId, table.createdAt),
    check(
      'eredmeny_esemeny_tipus_check',
      sql`${table.tipus} in ('letrehozas', 'szakaszvaltas', 'igazolas_keres', 'igazolas', 'visszakuldes', 'igazolas_visszavonas', 'megszakitas', 'ujrainditas')`,
    ),
    check(
      'eredmeny_esemeny_szakasz_check',
      sql`${table.szakasz} is null or ${table.szakasz} in ('lehetoseg', 'kapcsolat', 'egyuttmukodes', 'megallapodas')`,
    ),
    check('eredmeny_esemeny_szerzo_szerep_check', sql`${table.szerzoSzerep} in ('admin', 'attase')`),
    check(
      'eredmeny_esemeny_beszamitasi_felev_check',
      sql`${table.beszamitasiFelev} is null or ${table.beszamitasiFelev} in (1, 2)`,
    ),
  ],
);
