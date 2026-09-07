'use client';

import { useState } from 'react';
import { useApp } from '../../../components/AppShell';
import { CATS, CRITERIA, POSTS, SCORE_THRESHOLD } from '../../../lib/data';
import { avg, catAvg, col, fmt, pill, sc } from '../../../lib/score';

export default function MonitoringPage() {
  const { cycle } = useApp();
  const [selId, setSelId] = useState(1);
  const mon = POSTS.find((p) => p.id === selId) ?? POSTS[0];

  const rows = [...POSTS].sort((a, b) => avg(b) - avg(a));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1560 }}>
      <div className="card">
        <div className="card-h">
          <h3>Hálózati rangsor · {cycle}</h3>
          <span className="card-sub">14 szempont, 3 kategória · küszöb {fmt(SCORE_THRESHOLD)}</span>
        </div>
        <div style={{ overflow: 'auto' }}>
          <table className="tbl" style={{ minWidth: 760 }}>
            <thead>
              <tr>
                <th style={{ paddingLeft: 15 }}>Attasé / poszt</th>
                <th className="r">1. Együttműködés</th>
                <th className="r">2. XPAND</th>
                <th className="r">3. Információ</th>
                <th className="r">Összesített</th>
                <th style={{ paddingLeft: 15, width: 190 }}>Eloszlás</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const total = avg(p);
                const on = p.id === mon.id;
                return (
                  <tr key={p.id} className="click" onClick={() => setSelId(p.id)}
                    style={{ background: on ? '#f4f8ff' : undefined }}>
                    <td style={{ paddingLeft: 15 }}>
                      <div style={{ fontWeight: 500 }}>{p.attase}</div>
                      <div className="card-sub">{p.orszag}</div>
                    </td>
                    {CATS.map((c) => (
                      <td key={c.n} className="r mono">{fmt(catAvg(p, c.n))}</td>
                    ))}
                    <td className="r mono" style={{ fontSize: 13, fontWeight: 600, color: col(total) }}>{fmt(total)}</td>
                    <td style={{ paddingLeft: 15 }}>
                      <div style={{ display: 'flex', gap: 2, alignItems: 'flex-end', height: 22 }}>
                        {CRITERIA.map((cr) => {
                          const v = sc(p, cr.id);
                          return (
                            <div key={cr.id} style={{
                              flex: 1, borderRadius: 1, height: v * 4 + 2,
                              background: v >= 4 ? '#0f7a68' : v >= 3 ? '#96b3d8' : '#e0b4b0',
                            }} />
                          );
                        })}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card">
        <div className="card-h" style={{ padding: '13px 15px' }}>
          <div>
            <h3 style={{ fontSize: 14 }}>{mon.attase} · {mon.orszag}</h3>
            <div className="card-sub" style={{ marginTop: 2 }}>14 szempont részletes értékelése · adatforrás és gyakoriság szerint</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span className="muted">Összesített</span>
            <span className="mono" style={{ fontSize: 22, fontWeight: 600, color: col(avg(mon)) }}>{fmt(avg(mon))}</span>
          </div>
        </div>
        {CATS.map((g) => (
          <div key={g.n}>
            <div style={{
              padding: '9px 15px', background: '#f7f8fa', borderBottom: '1px solid #eceff3',
              display: 'flex', alignItems: 'center', gap: 10,
            }}>
              <span style={{ width: 8, height: 8, borderRadius: 2, background: g.color }} />
              <span style={{ fontSize: 12, fontWeight: 600 }}>{g.nev}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 600 }}>{fmt(catAvg(mon, g.n))}</span>
            </div>
            <div style={{ overflow: 'auto' }}>
              <table className="tbl" style={{ minWidth: 560 }}>
                <tbody>
                  {CRITERIA.filter((c) => c.kat === g.n).map((c) => {
                    const v = sc(mon, c.id);
                    const gy = pill(c.gyakorisag === 'Havi' ? 'Magas' : c.gyakorisag === 'Negyedéves' ? 'Közepes' : 'Alacsony');
                    return (
                      <tr key={c.id}>
                        <td style={{ paddingLeft: 15, color: '#242c38', lineHeight: 1.5 }}>
                          <span className="mono" style={{ fontSize: 11, color: '#8a929e', marginRight: 8 }}>{c.id}.</span>
                          {c.szempont}
                        </td>
                        <td style={{ whiteSpace: 'nowrap', width: 150 }}>
                          <span className="tag" style={{ fontSize: 11, background: '#f0f2f5', color: '#454f5e' }}>{c.meres}</span>
                        </td>
                        <td style={{ width: 132 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ display: 'flex', gap: 2 }}>
                              {[1, 2, 3, 4, 5].map((s) => (
                                <span key={s} style={{
                                  width: 11, height: 11, borderRadius: 2, display: 'block',
                                  background: s <= v ? (v >= 4 ? '#0f7a68' : v >= 3 ? '#5f87bd' : '#b3261e') : '#eceff3',
                                }} />
                              ))}
                            </div>
                            <span className="mono" style={{ fontSize: 12.5, fontWeight: 600 }}>{v}</span>
                          </div>
                        </td>
                        <td style={{ fontSize: 11.5, color: '#6b7684', whiteSpace: 'nowrap' }}>{c.adatforras}</td>
                        <td style={{ fontSize: 11.5, color: '#6b7684', whiteSpace: 'nowrap' }}>{c.fajl}</td>
                        <td className="r" style={{ paddingRight: 15, whiteSpace: 'nowrap' }}>
                          <span className="pill" style={{ background: gy.bg, color: gy.fg }}>{c.gyakorisag}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
