import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

// Ticket: az admin nyitja egy attasénak. A tipus/prio/statusz a lib/ticket-szotar.ts
// kulcsai. Az orszag a címzett nyitáskori országa (pillanatkép), nem követi a user
// későbbi módosítását. A nyitó kérés szövege az első ticket_uzenet sor.
export const ticket = sqliteTable(
  'ticket',
  {
    id: text('id').primaryKey(),
    targy: text('targy').notNull(),
    tipus: text('tipus').notNull(),
    prio: text('prio').notNull(),
    hatarido: text('hatarido'),
    statusz: text('statusz').notNull(),
    cimzettId: text('cimzett_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    orszag: text('orszag').notNull(),
    nyitoId: text('nyito_id').references(() => user.id, { onDelete: 'set null' }),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
    updatedAt: integer('updated_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .$onUpdate(() => new Date())
      .notNull(),
    lezarvaAt: integer('lezarva_at', { mode: 'timestamp_ms' }),
  },
  (t) => [
    index('ticket_cimzett_idx').on(t.cimzettId),
    index('ticket_statusz_idx').on(t.statusz),
    index('ticket_updated_idx').on(t.updatedAt),
  ],
);

// Üzenet. A szerző neve és szerepe pillanatkép: törölt user után is olvasható marad a
// szál, és a buborék oldala (saját / másik fél) a szerep alapján dől el.
export const ticketUzenet = sqliteTable(
  'ticket_uzenet',
  {
    id: text('id').primaryKey(),
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    szerzoId: text('szerzo_id').references(() => user.id, { onDelete: 'set null' }),
    szerzoNev: text('szerzo_nev').notNull(),
    szerzoSzerep: text('szerzo_szerep').notNull(),
    szoveg: text('szoveg').notNull(),
    createdAt: integer('created_at', { mode: 'timestamp_ms' })
      .default(sql`(cast(unixepoch('subsecond') * 1000 as integer))`)
      .notNull(),
  },
  (t) => [index('ticket_uzenet_ticket_idx').on(t.ticketId, t.createdAt)],
);

// Felhasználónként mikor nézte meg utoljára a ticketet: ebből az olvasatlan-jelzés.
export const ticketOlvasas = sqliteTable(
  'ticket_olvasas',
  {
    ticketId: text('ticket_id')
      .notNull()
      .references(() => ticket.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    latottAt: integer('latott_at', { mode: 'timestamp_ms' }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.ticketId, t.userId] })],
);
