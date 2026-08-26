'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useState, type ReactNode } from 'react';
import { CYCLES, DEADLINE, DEFAULT_CYCLE, ME_ID, POSTS, TICKETS } from '../lib/data';
import { ini } from '../lib/score';

export type Role = 'admin' | 'attase';

interface AppState {
  role: Role;
  setRole: (r: Role) => void;
  cycle: string;
  setCycle: (c: string) => void;
}

const AppContext = createContext<AppState>({
  role: 'admin', setRole: () => {}, cycle: DEFAULT_CYCLE, setCycle: () => {},
});

export function useApp() {
  return useContext(AppContext);
}

const NAV = [
  { href: '/', icon: '▤', label: 'Áttekintés' },
  { href: '/terkep', icon: '◍', label: 'Térkép és országprofil' },
  { href: '/riportok', icon: '▦', label: 'Riportok és kimutatás' },
  { href: '/uj-riport', icon: '✎', label: 'Új riport kitöltése' },
  { href: '/kommunikacio', icon: '✉', label: 'Kommunikáció' },
  { href: '/monitoring', icon: '◈', label: 'Monitoring és értékelés' },
];

const TITLES: Record<string, [string, string]> = {
  '/': ['Áttekintés', 'A TéT hálózat aktuális állapota'],
  '/terkep': ['Térkép és országprofil', 'Tudományterület, aktivitás és értékelés szerint szűrhető poszthálózat'],
  '/riportok': ['Riportok és aggregált kimutatás', 'A 7 blokkos strukturált riportok listája és összesítése'],
  '/uj-riport': ['Új riport kitöltése', 'Kötött mezők az aggregáláshoz, szöveges kifejtés a részletekhez'],
  '/kommunikacio': ['Kommunikáció', 'Ticket + üzenetszál az adminok és a TéT attasék között'],
  '/monitoring': ['Monitoring és értékelés', '3 kategória, 14 szempont, rögzített adatforrás-metaadatokkal'],
};

export default function AppShell({ children }: { children: ReactNode }) {
  const [role, setRole] = useState<Role>('admin');
  const [cycle, setCycle] = useState(DEFAULT_CYCLE);
  const pathname = usePathname();
  const [title, sub] = TITLES[pathname] || ['TéT Platform', ''];
  const openTickets = TICKETS.filter((t) => t.statusz !== 'Lezárt').length;
  const me = role === 'admin'
    ? { name: 'Sipos Katalin', role: 'NIÜ admin · XPAND' }
    : { name: POSTS.find((p) => p.id === ME_ID)!.attase, role: 'TéT attasé · Szöul' };

  return (
    <AppContext.Provider value={{ role, setRole, cycle, setCycle }}>
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
            {NAV.map((n) => {
              const on = pathname === n.href;
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
              <div style={{ display: 'flex', background: '#f0f2f5', border: '1px solid #dde1e7', borderRadius: 6, padding: 2, gap: 2 }}>
                {(['admin', 'attase'] as Role[]).map((r) => (
                  <button key={r} onClick={() => setRole(r)} style={{
                    border: 0, cursor: 'pointer', padding: '5px 11px', borderRadius: 4,
                    fontSize: 11.5, fontWeight: 600,
                    background: role === r ? '#1b3a6b' : 'transparent',
                    color: role === r ? '#fff' : '#6b7684',
                  }}>
                    {r === 'admin' ? 'Admin (NIÜ)' : 'TéT attasé'}
                  </button>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingLeft: 14, borderLeft: '1px solid #dde1e7' }}>
                <div style={{
                  width: 29, height: 29, borderRadius: '50%', background: '#1b3a6b', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600,
                }}>{ini(me.name)}</div>
                <div style={{ lineHeight: 1.25 }}>
                  <div style={{ fontSize: 12, fontWeight: 600 }}>{me.name}</div>
                  <div style={{ fontSize: 10.5, color: '#6b7684' }}>{me.role}</div>
                </div>
              </div>
            </div>
          </header>
          <main style={{ flex: 1, minWidth: 0, padding: '20px 26px 44px' }}>{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
