import AppShell from '../../components/app-shell/AppShell';
import { listProfilEvek } from '../../db/queries/orszagprofil';
import { countOlvasatlan } from '../../db/queries/ticket';
import { aktualisEv } from '../../lib/datum';
import { requireSession } from '../../lib/session';
import { ciklusEvek, getValasztottEv } from '../../lib/valasztott-ev';
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
  const evek = ciklusEvek(session.role, most, ev, listProfilEvek);
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
