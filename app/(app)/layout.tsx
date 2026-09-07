import AppShell from '../../components/AppShell';
import { requireSession } from '../../lib/session';

// Minden védett oldal ebben a route groupban van. A requireSession() itt egy helyen
// kényszeríti ki a bejelentkezést (elavult cookie esetén is: a proxy átengedi, ez
// viszont /login-ra irányít). A /login a gyökér layout alatt marad.
//
// Ez NEM helyettesíti az oldalankénti és action-önkénti ellenőrzést: kliens-oldali
// navigációnál a layout nem fut újra, a server action-ök pedig egyáltalán nem
// renderelnek layoutot. Minden szerver-oldali adatot olvasó page és minden action
// maga hívja a requireSession()/requireAdmin()-t.
export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const session = await requireSession();
  return <AppShell user={session}>{children}</AppShell>;
}
