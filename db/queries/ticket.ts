import 'server-only';
import { and, count, desc, eq, ne, sql, type SQL } from 'drizzle-orm';
import { alias } from 'drizzle-orm/sqlite-core';
import { db } from '../index';
import { ticket, ticketOlvasas, ticketUzenet, user } from '../schema';
import type { AppRole } from '../../lib/session';
import type {
  CimzettJelolt,
  PrioKulcs,
  StatuszKulcs,
  TicketSzuro,
  TipusKulcs,
  UzenetSzerep,
} from '../../lib/ticket-szotar';
import type { UjTicketInput } from '../../lib/ticket-validacio';

/** Aki nézi: a láthatósághoz és az olvasatlan-számításhoz kell. Az AppSession megfelel neki. */
export interface Nezo {
  userId: string;
  role: AppRole;
}

/** Az üzenet szerzője (pillanatképnek). */
export interface Szerzo {
  id: string;
  nev: string;
  szerep: UzenetSzerep;
}

export interface TicketListItem {
  id: string;
  targy: string;
  tipus: TipusKulcs;
  prio: PrioKulcs;
  hatarido: string | null;
  statusz: StatuszKulcs;
  cimzettId: string;
  cimzettNev: string;
  orszag: string;
  uzenetSzam: number;
  updatedAt: Date;
  /** A nézőhöz képest: van-e a másik szereptől üzenet a néző utolsó megtekintése után. */
  olvasatlan: boolean;
}

export interface Uzenet {
  id: string;
  szerzoNev: string;
  szerzoSzerep: UzenetSzerep;
  szoveg: string;
  createdAt: Date;
}

export interface TicketDetail extends TicketListItem {
  nyitoNev: string | null;
  createdAt: Date;
  lezarvaAt: Date | null;
  uzenetek: Uzenet[];
}

export type TicketCreate = UjTicketInput & { nyito: Szerzo };

// Van-e a néző szerepétől ELTÉRŐ szereptől üzenet a néző utolsó megtekintése után
// (megtekintés hiányában bármely ilyen üzenet). Szerep-alapú: két admin közül az egyik
// válasza a másiknak nem olvasatlan – elfogadott egyszerűsítés.
function olvasatlanSql(nezo: Nezo): SQL<number> {
  return sql<number>`exists (
    select 1 from ${ticketUzenet} u
    where u.ticket_id = ${ticket.id}
      and u.szerzo_szerep <> ${nezo.role}
      and u.created_at > coalesce(
        (select o.latott_at from ${ticketOlvasas} o where o.ticket_id = ${ticket.id} and o.user_id = ${nezo.userId}),
        0
      )
  )`;
}

const uzenetSzamSql = sql<number>`(select count(*) from ${ticketUzenet} where ${ticketUzenet.ticketId} = ${ticket.id})`;

function listOszlopok(nezo: Nezo) {
  return {
    id: ticket.id,
    targy: ticket.targy,
    tipus: ticket.tipus,
    prio: ticket.prio,
    hatarido: ticket.hatarido,
    statusz: ticket.statusz,
    cimzettId: ticket.cimzettId,
    cimzettNev: user.name,
    orszag: ticket.orszag,
    uzenetSzam: uzenetSzamSql,
    updatedAt: ticket.updatedAt,
    olvasatlan: olvasatlanSql(nezo),
  };
}

/** A `tipusos()` eredménye: a nyers oszlopok a szótár-típusokra cserélve. */
type Tipusositott<T> = Omit<T, 'tipus' | 'prio' | 'statusz' | 'olvasatlan'> & {
  tipus: TipusKulcs;
  prio: PrioKulcs;
  statusz: StatuszKulcs;
  olvasatlan: boolean;
};

/**
 * A DB szöveges kulcsait a szótár típusaira, az exists 0/1-et booleanra alakítja.
 * Az explicit visszatérési típus kell: a generikus spread eredményét a TS nem engedné
 * tovább spreadelni (`getTicket`).
 */
function tipusos<T extends { tipus: string; prio: string; statusz: string; olvasatlan: number }>(
  r: T,
): Tipusositott<T> {
  return {
    ...r,
    tipus: r.tipus as TipusKulcs,
    prio: r.prio as PrioKulcs,
    statusz: r.statusz as StatuszKulcs,
    olvasatlan: r.olvasatlan === 1,
  };
}

/** Láthatósági feltétel: attasé csak a hozzá címzettet látja. */
function lathato(nezo: Nezo): SQL | undefined {
  return nezo.role === 'admin' ? undefined : eq(ticket.cimzettId, nezo.userId);
}

/** Lista a néző jogával és a szűrővel, legutóbb módosított elöl. */
export function listTicketek(nezo: Nezo, szuro: TicketSzuro): TicketListItem[] {
  const felt: SQL[] = [];
  const l = lathato(nezo);
  if (l) felt.push(l);
  if (szuro !== 'mind') felt.push(ne(ticket.statusz, 'lezart'));
  if (szuro === 'magas') felt.push(eq(ticket.prio, 'magas'));
  return db
    .select(listOszlopok(nezo))
    .from(ticket)
    .innerJoin(user, eq(ticket.cimzettId, user.id))
    .where(felt.length ? and(...felt) : undefined)
    .orderBy(desc(ticket.updatedAt))
    .all()
    .map((r) => tipusos(r));
}

/**
 * Egy ticket az üzeneteivel. NEM ellenőrzi a láthatóságot (a hívó `canViewTicket`-tel
 * teszi); a `nezo` az olvasatlan-jelzéshez kell.
 */
export function getTicket(id: string, nezo: Nezo): TicketDetail | null {
  const nyito = alias(user, 'nyito');
  const sor = db
    .select({
      ...listOszlopok(nezo),
      nyitoNev: nyito.name,
      createdAt: ticket.createdAt,
      lezarvaAt: ticket.lezarvaAt,
    })
    .from(ticket)
    .innerJoin(user, eq(ticket.cimzettId, user.id))
    .leftJoin(nyito, eq(ticket.nyitoId, nyito.id))
    .where(eq(ticket.id, id))
    .get();
  if (!sor) return null;
  const uzenetek = db
    .select({
      id: ticketUzenet.id,
      szerzoNev: ticketUzenet.szerzoNev,
      szerzoSzerep: ticketUzenet.szerzoSzerep,
      szoveg: ticketUzenet.szoveg,
      createdAt: ticketUzenet.createdAt,
    })
    .from(ticketUzenet)
    .where(eq(ticketUzenet.ticketId, id))
    .orderBy(ticketUzenet.createdAt, ticketUzenet.id)
    .all()
    .map((u) => ({ ...u, szerzoSzerep: u.szerzoSzerep as UzenetSzerep }));
  return { ...tipusos(sor), uzenetek };
}

/** Tranzakcióban: ticket + nyitó üzenet; a nyitó rögtön olvasottnak jelöli. Visszaadja az id-t. */
export function createTicket(input: TicketCreate): string {
  const id = crypto.randomUUID();
  const most = new Date();
  db.transaction((tx) => {
    tx.insert(ticket)
      .values({
        id,
        targy: input.targy,
        tipus: input.tipus,
        prio: input.prio,
        hatarido: input.hatarido,
        statusz: 'nyitott',
        cimzettId: input.cimzettId,
        orszag: input.orszag,
        nyitoId: input.nyito.id,
      })
      .run();
    tx.insert(ticketUzenet)
      .values({
        id: crypto.randomUUID(),
        ticketId: id,
        szerzoId: input.nyito.id,
        szerzoNev: input.nyito.nev,
        szerzoSzerep: input.nyito.szerep,
        szoveg: input.szoveg,
        createdAt: most,
      })
      .run();
    tx.insert(ticketOlvasas).values({ ticketId: id, userId: input.nyito.id, latottAt: most }).run();
  });
  return id;
}

/** A küldő szerepe szerinti státusz: admin után az attasé következik, és fordítva. */
function statuszKuldoSzerint(szerep: UzenetSzerep): StatuszKulcs {
  return szerep === 'admin' ? 'valaszra_var' : 'folyamatban';
}

/**
 * Új üzenet + státusz + updatedAt egy tranzakcióban. Lezárt vagy hiányzó ticketre dob
 * (az action előtte `canWriteTicket`-tel ellenőriz; ez a versenyhelyzet elleni védőháló).
 * A küldő számára rögtön olvasottnak jelöli a ticketet (azonos időbélyeg, szigorú `>`
 * az olvasatlan-feltételben, így a saját üzenet nem olvasatlan).
 */
export function addUzenet(ticketId: string, szerzo: Szerzo, szoveg: string): void {
  const most = new Date();
  db.transaction((tx) => {
    const t = tx.select({ statusz: ticket.statusz }).from(ticket).where(eq(ticket.id, ticketId)).get();
    if (!t) throw new Error('A ticket nem található.');
    if (t.statusz === 'lezart') throw new Error('A ticket le van zárva.');
    tx.insert(ticketUzenet)
      .values({
        id: crypto.randomUUID(),
        ticketId,
        szerzoId: szerzo.id,
        szerzoNev: szerzo.nev,
        szerzoSzerep: szerzo.szerep,
        szoveg,
        createdAt: most,
      })
      .run();
    // Akkor is fut az update, ha a státusz nem változik: az $onUpdate bumpolja az updatedAt-ot.
    tx.update(ticket).set({ statusz: statuszKuldoSzerint(szerzo.szerep) }).where(eq(ticket.id, ticketId)).run();
    tx.insert(ticketOlvasas)
      .values({ ticketId, userId: szerzo.id, latottAt: most })
      .onConflictDoUpdate({ target: [ticketOlvasas.ticketId, ticketOlvasas.userId], set: { latottAt: most } })
      .run();
  });
}

export function closeTicket(id: string): void {
  db.update(ticket).set({ statusz: 'lezart', lezarvaAt: new Date() }).where(eq(ticket.id, id)).run();
}

/**
 * Újranyitás: a legutolsó üzenet küldője szerinti állapot; ha csak a nyitó üzenet van,
 * `nyitott`. (Azonos ezredmásodpercen belüli két üzenetnél az id-tiebreak véletlen –
 * emberi tempójú beszélgetésnél nem fordul elő, és a következő üzenet korrigálja.)
 */
export function reopenTicket(id: string): void {
  db.transaction((tx) => {
    const utolsok = tx
      .select({ szerep: ticketUzenet.szerzoSzerep })
      .from(ticketUzenet)
      .where(eq(ticketUzenet.ticketId, id))
      .orderBy(desc(ticketUzenet.createdAt), desc(ticketUzenet.id))
      .limit(2)
      .all();
    const statusz: StatuszKulcs =
      utolsok.length <= 1 ? 'nyitott' : statuszKuldoSzerint(utolsok[0].szerep as UzenetSzerep);
    tx.update(ticket).set({ statusz, lezarvaAt: null }).where(eq(ticket.id, id)).run();
  });
}

/** Upsert: a felhasználó most látta a ticketet. Idempotens. */
export function jelolOlvasottnak(ticketId: string, userId: string, mikor = new Date()): void {
  db.insert(ticketOlvasas)
    .values({ ticketId, userId, latottAt: mikor })
    .onConflictDoUpdate({ target: [ticketOlvasas.ticketId, ticketOlvasas.userId], set: { latottAt: mikor } })
    .run();
}

/** Olvasatlan, NEM lezárt ticketek száma a néző számára (menü-számláló). */
export function countOlvasatlan(nezo: Nezo): number {
  const felt: SQL[] = [ne(ticket.statusz, 'lezart'), sql`${olvasatlanSql(nezo)} = 1`];
  const l = lathato(nezo);
  if (l) felt.push(l);
  const sor = db.select({ n: count() }).from(ticket).where(and(...felt)).get();
  return sor?.n ?? 0;
}

/** Az admin új-ticket dialógusához: nem tiltott attasék, akiknek van országa, magyar névsorrendben. */
export function listCimzettJeloltek(): CimzettJelolt[] {
  const most = Date.now();
  return db
    .select({
      id: user.id,
      nev: user.name,
      orszag: user.orszag,
      role: user.role,
      banned: user.banned,
      banExpires: user.banExpires,
    })
    .from(user)
    .all()
    .filter((u) => u.role !== 'admin' && u.orszag && !(u.banned && (!u.banExpires || u.banExpires.getTime() > most)))
    .map((u) => ({ id: u.id, nev: u.nev, orszag: u.orszag as string }))
    .sort((a, b) => a.nev.localeCompare(b.nev, 'hu'));
}
