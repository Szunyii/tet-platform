import AppShell from '../../components/AppShell';
import { listProfilEvek } from '../../db/queries/orszagprofil';
import { countOlvasatlan } from '../../db/queries/ticket';
import { aktualisEv } from '../../lib/datum';
import { EV_MIN } from '../../lib/orszagprofil-szotar';
import { requireSession } from '../../lib/session';
import { getValasztottEv } from '../../lib/valasztott-ev';
import { logoutAction, valasztEvAction } from './actions';
import OldalsavAllapot from './components/OldalsavAllapot';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
//
// Az olvasatlan ticket-számláló, a ciklusválasztó évlistája és az oldalsáv állapot-kártyája
// (OldalsavAllapot) ugyanezért kliens-oldali navigációnál késhet: a ticket-, a profil-mentő,
// a felhasználó- és az évválasztó action-ök revalidatePath('/', 'layout')-tal frissítik.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const olvasatlan = countOlvasatlan(session);
  const most = aktualisEv();
  const ev = await getValasztottEv(most);
  // A fejléc ciklusválasztója. Admin: minden év EV_MIN-től az aktuálisig (új év profilját is
  // létre kell tudnia hozni, a szerkesztőnek nincs saját évválasztója). Attasé: a DB-ben létező
  // profil-évek + az aktuális év, az EV_MIN..most tartományra szűrve, hogy csak olyan évet
  // ajánljunk fel, amit a valasztEvAction is elfogadna. A választott év mindig benne van
  // (ev már validált, most mindig szerepel), hogy a select konzisztens legyen.
  const evek = session.role === 'admin'
    ? Array.from({ length: Math.max(0, most - EV_MIN + 1) }, (_, i) => most - i)
    : [...new Set([most, ev, ...listProfilEvek().filter((e) => e >= EV_MIN && e <= most)])].sort((a, b) => b - a);
  return (
    <AppShell
      user={session}
      logoutAction={logoutAction}
      valasztEvAction={valasztEvAction}
      olvasatlan={olvasatlan}
      ev={ev}
      evek={evek}
      oldalsavAlja={<OldalsavAllapot session={session} ev={ev} most={most} />}
    >
      {children}
    </AppShell>
  );
}
