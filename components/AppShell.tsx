'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useActionState, useContext, useState, type ReactNode } from 'react';
import type { LogoutState } from '../app/(app)/actions';
import { DEADLINE } from '../lib/data';
import { orszagNev } from '../lib/orszagok';
import { ini } from '../lib/score';
import type { AppSession } from '../lib/session';

type LogoutAction = (prev: LogoutState) => Promise<LogoutState>;

interface AppState {
  user: AppSession;
  /** A fejlécben kiválasztott ciklus (év). Kliens-oldali kontextus, a monitoring cím és a sidebar sora mutatja. */
  ev: number;
  setEv: (ev: number) => void;
  /** Olvasatlan, nem lezárt ticketek száma – a Kommunikáció menüpont számlálója. */
  olvasatlan: number;
  /** A /kommunikacio oldal írja felül a saját, frissebb számával (OlvasatlanSzinkron). */
  setOlvasatlan: (n: number) => void;
}

const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() csak az AppShell-en belül használható.');
  return ctx;
}

// Csak megjelenítés: az adminOnly a menüpontot rejti el, a valódi védelem a page/action
// requireAdmin() hívása (lib/session.ts).
// Az alHrefek további útvonal-prefixek, amelyeken a menüpont aktív (pl. /orszagprofil/* → Országprofil).
const NAV: { href: string; icon: string; label: string; adminOnly?: boolean; alHrefek?: string[] }[] = [
  { href: '/terkep', icon: '◍', label: 'Országprofil', alHrefek: ['/orszagprofil'] },
  { href: '/riportok', icon: '▦', label: 'Riportok' },
  { href: '/uj-riport', icon: '✎', label: 'Új bejegyzés' },
  { href: '/kommunikacio', icon: '✉', label: 'Kommunikáció' },
  { href: '/tudastar', icon: '◫', label: 'Tudástár' },
  { href: '/monitoring', icon: '◈', label: 'Monitoring és értékelés' },
  { href: '/felhasznalok', icon: '☺', label: 'Felhasználók', adminOnly: true },
];

const ADMIN_ONLY_HREFS = NAV.filter((n) => n.adminOnly).map((n) => n.href);

const TITLES: Record<string, [string, string]> = {
  '/terkep': ['Országprofil', 'A TéT attasé-posztok térképen, a beküldött országprofilok kivonatával'],
  '/orszagprofil': ['Országprofil', 'Az ország KFI körképe és alapadatai, évenkénti attasé-beadással'],
  '/riportok': ['Riportok', 'A TéT hálózat információs bejegyzései kategóriák és kulcsszavak szerint'],
  '/uj-riport': ['Új bejegyzés', 'Kategória, tárgy, leírás, kulcsszavak – rendezvénynél dátum és helyszín'],
  '/kommunikacio': ['Kommunikáció', 'Ticket + üzenetszál az adminok és a TéT attasék között'],
  '/tudastar': ['Tudástár', 'Magyarországról ajánlható programok, partnerek és együttműködési formák'],
  '/monitoring': ['Monitoring és értékelés', '3 kategória, 14 szempont, rögzített adatforrás-metaadatokkal'],
  '/felhasznalok': ['Felhasználók', 'Admin és TéT attasé fiókok kezelése'],
};

// Pontos egyezés vagy alútvonal (pl. /riportok/abc → /riportok).
function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

// Pontos egyezés, különben a leghosszabb illeszkedő prefix. Admin-only útvonalnál nem
// admin usernek a generikus címet adja: a requireAdmin() 404-e az AppShellben renderelődik,
// és a fejléc nem árulhatja el az oldal létét.
function titleFor(pathname: string, role: AppSession['role']): [string, string] {
  if (role !== 'admin' && ADMIN_ONLY_HREFS.some((h) => isActive(pathname, h))) {
    return ['TéT Platform', ''];
  }
  if (TITLES[pathname]) return TITLES[pathname];
  const key = Object.keys(TITLES)
    .filter((k) => isActive(pathname, k))
    .sort((a, b) => b.length - a.length)[0];
  return key ? TITLES[key] : ['TéT Platform', ''];
}

function LogoutForm({ action }: { action: LogoutAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      {state.error && (
        <span role="alert" style={{ fontSize: 11, color: '#b3261e' }}>{state.error}</span>
      )}
      <button type="submit" className="btn" style={{ fontSize: 11.5 }} disabled={pending}>
        {pending ? 'Kijelentkezés…' : 'Kijelentkezés'}
      </button>
    </form>
  );
}

export default function AppShell({
  user,
  logoutAction,
  olvasatlan: szerverOlvasatlan,
  evek,
  aktualisEv,
  children,
}: {
  user: AppSession;
  logoutAction: LogoutAction;
  /** Olvasatlan, nem lezárt ticketek száma a layoutból – a menü-számláló kiindulópontja. */
  olvasatlan: number;
  /** A ciklusválasztó évei a layoutból: DB profil-évek + aktuális év, csökkenő, nem üres. */
  evek: number[];
  aktualisEv: number;
  children: ReactNode;
}) {
  const [ev, setEv] = useState(aktualisEv);
  // Nem prop-változásra igazítunk (mint az olvasatlan-nál), hanem invariánst tartunk fenn:
  // a kiválasztott év mindig szerepeljen az evek listában, különben az aktuális évre esünk
  // vissza. Az `ev !== aktualisEv` feltétel a kilépést garantálja akkor is, ha a hívó olyan
  // listát adna, amiben az aktuális év nincs benne – enélkül végtelen render-ciklusba futnánk.
  if (!evek.includes(ev) && ev !== aktualisEv) setEv(aktualisEv);
  // A számláló állapotban él, mert a /kommunikacio oldal a saját, frissebb értékével
  // felülírja (a layout a megtekintés-jelölés ELŐTT számol). A szerverről érkező új érték
  // viszont nyer: a layout revalidálásakor (revalidatePath) ez a render-közbeni igazítás
  // frissíti az állapotot – ez a React ajánlott „prop változásra állapot igazítása" mintája.
  const [olvasatlan, setOlvasatlan] = useState(szerverOlvasatlan);
  const [elozoSzerver, setElozoSzerver] = useState(szerverOlvasatlan);
  if (elozoSzerver !== szerverOlvasatlan) {
    setElozoSzerver(szerverOlvasatlan);
    setOlvasatlan(szerverOlvasatlan);
  }
  const pathname = usePathname();
  const [title, sub] = titleFor(pathname, user.role);
  const roleLabel = user.role === 'admin'
    ? 'NIÜ admin'
    : `TéT attasé${user.orszag ? ' · ' + orszagNev(user.orszag) : ''}`;

  return (
    <AppContext.Provider value={{ user, ev, setEv, olvasatlan, setOlvasatlan }}>
      <div style={{ display: 'flex', minHeight: '100vh' }}>
        <aside style={{
          width: 238, flex: '0 0 238px', background: '#131a24', color: '#e7ebf1',
          display: 'flex', flexDirection: 'column', position: 'sticky', top: 0, height: '100vh',
        }}>
          <div style={{ padding: '18px 18px 16px', borderBottom: '1px solid #232c39' }}>
            <div style={{ fontSize: 13.5, fontWeight: 700, letterSpacing: '.02em' }}>NIÜ · TéT Platform</div>
            <div style={{ fontSize: 11, color: '#8d97a5', marginTop: 3 }}>Belső munkakörnyezet</div>
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 10px' }}>
            {NAV.filter((n) => !n.adminOnly || user.role === 'admin').map((n) => {
              const on = isActive(pathname, n.href) || (n.alHrefek ?? []).some((h) => isActive(pathname, h));
              return (
                <Link key={n.href} href={n.href} aria-current={on ? 'page' : undefined} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px',
                  borderRadius: 5, fontSize: 12.5, fontWeight: 500, textDecoration: 'none',
                  background: on ? '#22304a' : 'transparent', color: on ? '#ffffff' : '#a3adbb',
                }}>
                  <span style={{ width: 16, textAlign: 'center', fontSize: 13 }}>{n.icon}</span>
                  {n.label}
                  {n.href === '/kommunikacio' && olvasatlan > 0 && (
                    <>
                      <span aria-hidden style={{
                        marginLeft: 'auto', background: '#b3261e', color: '#fff', fontSize: 10,
                        fontWeight: 600, padding: '1px 6px', borderRadius: 9,
                      }}>{olvasatlan}</span>
                      <span className="sr-only">{olvasatlan} olvasatlan ticket</span>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>
          <div style={{
            marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid #232c39',
            fontSize: 11, color: '#8d97a5', lineHeight: 1.6,
          }}>
            <div style={{ color: '#c3cbd6', fontWeight: 600, fontSize: 11.5 }}>Aktív ciklus: {ev}</div>
            <div>Beadási határidő: {DEADLINE}</div>
            <div style={{ marginTop: 8, padding: '6px 8px', background: '#1b2330', borderRadius: 4, color: '#7f8a99' }}>
              Demóadatok – 14 poszt, 14 értékelési szempont
            </div>
          </div>
        </aside>

        <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          <header style={{
            background: '#fff', borderBottom: '1px solid #dde1e7', padding: '13px 26px',
            display: 'flex', alignItems: 'center', gap: 20, position: 'sticky', top: 0, zIndex: 20,
          }}>
            <div style={{ minWidth: 0 }}>
              <h1 style={{ margin: 0, fontSize: 16, fontWeight: 600, letterSpacing: '-.01em' }}>{title}</h1>
              <div style={{ fontSize: 11.5, color: '#6b7684', marginTop: 2 }}>{sub}</div>
            </div>
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 14 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6b7684' }}>
                Ciklus
                <select className="input" value={ev} onChange={(e) => setEv(Number(e.target.value))}>
                  {evek.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #dde1e7' }}>
                <div style={{
                  width: 29, height: 29, borderRadius: '50%', background: '#1b3a6b', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                }}>{ini(user.name)}</div>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{user.name}</div>
                  <div style={{ fontSize: 10.5, color: '#6b7684' }}>{roleLabel}</div>
                </div>
              </div>
              <LogoutForm action={logoutAction} />
            </div>
          </header>
          <main style={{ flex: 1, minWidth: 0, padding: '20px 26px 44px' }}>{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
