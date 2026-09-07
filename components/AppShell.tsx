'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { CYCLES, DEADLINE, DEFAULT_CYCLE, TICKETS } from '../lib/data';
import { ini } from '../lib/score';
import { signOut } from '../lib/auth-client';
import type { AppSession, AppRole } from '../lib/session';

export type Role = AppRole;

interface AppState {
  role: Role;
  user: AppSession;
  cycle: string;
  setCycle: (c: string) => void;
}

const EMPTY_USER: AppSession = { userId: '', name: '', email: '', role: 'attase', orszag: null };

const AppContext = createContext<AppState>({
  role: 'attase', user: EMPTY_USER, cycle: DEFAULT_CYCLE, setCycle: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

const NAV: { href: string; icon: string; label: string; adminOnly?: boolean }[] = [
  { href: '/terkep', icon: '◍', label: 'Országprofil' },
  { href: '/riportok', icon: '▦', label: 'Riportok' },
  { href: '/uj-riport', icon: '✎', label: 'Új riport kitöltése' },
  { href: '/kommunikacio', icon: '✉', label: 'Kommunikáció' },
  { href: '/tudastar', icon: '◫', label: 'Tudástár' },
  { href: '/monitoring', icon: '◈', label: 'Monitoring és értékelés' },
  { href: '/felhasznalok', icon: '☺', label: 'Felhasználók', adminOnly: true },
];

const TITLES: Record<string, [string, string]> = {
  '/terkep': ['Országprofil', 'A TéT attaséktól beérkező országjelentések térképen és teljes tartalommal'],
  '/riportok': ['Riportok', 'Kimutatás a beérkező országjelentésekből, és a 7 blokkos riportok teljes listája'],
  '/uj-riport': ['Új riport kitöltése', 'Kötött mezők az aggregáláshoz, szöveges kifejtés a részletekhez'],
  '/kommunikacio': ['Kommunikáció', 'Ticket + üzenetszál az adminok és a TéT attasék között'],
  '/tudastar': ['Tudástár', 'Magyarországról ajánlható programok, partnerek és együttműködési formák'],
  '/monitoring': ['Monitoring és értékelés', '3 kategória, 14 szempont, rögzített adatforrás-metaadatokkal'],
  '/felhasznalok': ['Felhasználók', 'Admin és TéT attasé fiókok kezelése'],
};

// Pontos egyezés, különben a leghosszabb prefix (pl. /riportok/abc → /riportok).
function titleFor(pathname: string): [string, string] {
  if (TITLES[pathname]) return TITLES[pathname];
  const key = Object.keys(TITLES)
    .filter((k) => pathname.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0];
  return key ? TITLES[key] : ['TéT Platform', ''];
}

export default function AppShell({ user, children }: { user: AppSession; children: ReactNode }) {
  const [cycle, setCycle] = useState(DEFAULT_CYCLE);
  const pathname = usePathname();
  const router = useRouter();
  const [title, sub] = titleFor(pathname);
  const openTickets = TICKETS.filter((t) => t.statusz !== 'Lezárt').length;
  const roleLabel = user.role === 'admin'
    ? 'NIÜ admin'
    : `TéT attasé${user.orszag ? ' · ' + user.orszag : ''}`;

  async function logout() {
    await signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <AppContext.Provider value={{ role: user.role, user, cycle, setCycle }}>
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
              const on = pathname === n.href || pathname.startsWith(n.href + '/');
              return (
                <Link key={n.href} href={n.href} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px',
                  borderRadius: 5, fontSize: 12.5, fontWeight: 500, textDecoration: 'none',
                  background: on ? '#22304a' : 'transparent', color: on ? '#ffffff' : '#a3adbb',
                }}>
                  <span style={{ width: 16, textAlign: 'center', fontSize: 13 }}>{n.icon}</span>
                  {n.label}
                  {n.href === '/kommunikacio' && (
                    <span style={{
                      marginLeft: 'auto', background: '#b3261e', color: '#fff', fontSize: 10,
                      fontWeight: 600, padding: '1px 6px', borderRadius: 9,
                    }}>{openTickets}</span>
                  )}
                </Link>
              );
            })}
          </nav>
          <div style={{
            marginTop: 'auto', padding: '14px 18px', borderTop: '1px solid #232c39',
            fontSize: 11, color: '#8d97a5', lineHeight: 1.6,
          }}>
            <div style={{ color: '#c3cbd6', fontWeight: 600, fontSize: 11.5 }}>Aktív ciklus: {cycle}</div>
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
                <select className="input" value={cycle} onChange={(e) => setCycle(e.target.value)}>
                  {CYCLES.map((c) => <option key={c} value={c}>{c}</option>)}
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
              <button type="button" onClick={logout} className="btn" style={{ fontSize: 11.5 }}>
                Kijelentkezés
              </button>
            </div>
          </header>
          <main style={{ flex: 1, minWidth: 0, padding: '20px 26px 44px' }}>{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
