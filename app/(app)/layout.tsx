import AppShell from '../../components/AppShell';
import { countOlvasatlan } from '../../db/queries/ticket';
import { requireSession } from '../../lib/session';
import { logoutAction } from './actions';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
//
// Az olvasatlan ticket-számláló ugyanezért kliens-oldali navigációnál késhet: a ticket
// action-ök revalidatePath('/', 'layout')-tal frissítik.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  const olvasatlan = countOlvasatlan(session);
  return (
    <AppShell user={session} logoutAction={logoutAction} olvasatlan={olvasatlan}>
      {children}
    </AppShell>
  );
}
