import { sql } from 'drizzle-orm';
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { user } from './auth';

// Attasé–ország hozzárendelés (lib/attase-orszag.ts): soronként egy (felhasználó, ország) pár.
// A székhely a poszt országa – felhasználónként pontosan egy (a validátor követeli meg, az
// index legfeljebb egyet enged) –, a többi sor regionális lefedettség. A vezető a relációs
// vezető, az országprofil felelőse: országonként legfeljebb egy. A város és a részterület csak
// a székhely-sornál töltött. A szabályokat a db/queries/attase-orszag.ts tartja.
export const attaseOrszag = sqliteTable(
  'attase_orszag',
  {
    userId: text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    orszagKod: text('orszag_kod').notNull(),
    szekhely: integer('szekhely', { mode: 'boolean' }).notNull().default(false),
    vezeto: integer('vezeto', { mode: 'boolean' }).notNull().default(false),
    varos: text('varos'),
    reszterulet: text('reszterulet'),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.orszagKod] }),
    uniqueIndex('attase_orszag_vezeto_idx').on(table.orszagKod).where(sql`${table.vezeto} = 1`),
    uniqueIndex('attase_orszag_szekhely_idx').on(table.userId).where(sql`${table.szekhely} = 1`),
    index('attase_orszag_orszag_idx').on(table.orszagKod),
  ],
);
