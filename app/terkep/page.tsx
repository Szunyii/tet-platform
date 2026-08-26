'use client';

import Link from 'next/link';
import { useState } from 'react';
import WorldMap from '../../components/WorldMap';
import { FIELD_COLORS, FIELDS, POSTS, type Post } from '../../lib/data';
import { avg, col, fmt, pill } from '../../lib/score';

const METRICS = [
  { k: 'focus', l: 'Fókuszterület' },
  { k: 'activity', l: 'Aktivitás' },
  { k: 'score', l: 'Értékelés' },
] as const;

export default function MapPage() {
  const [metric, setMetric] = useState<'focus' | 'activity' | 'score'>('focus');
  const [field, setField] = useState('');
  const [sel, setSel] = useState<Post | null>(null);

  const filtered = field ? POSTS.filter((p) => p.fokusz.includes(field)) : POSTS;
  const topList = [...POSTS].sort((a, b) => b.riportok - a.riportok).slice(0, 6);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', maxWidth: 1600 }}>
      <div className="card" style={{ overflow: 'hidden', flex: '1 1 560px', minWidth: 0 }}>
        <div className="card-h" style={{ padding: '11px 14px' }}>
          <span className="up">Színezés</span>
          <div style={{ display: 'flex', background: '#f0f2f5', border: '1px solid #dde1e7', borderRadius: 6, padding: 2, gap: 2 }}>
            {METRICS.map((m) => (
              <button key={m.k} onClick={() => setMetric(m.k)} style={{
                border: 0, cursor: 'pointer', padding: '5px 11px', borderRadius: 4,
                fontSize: 11.5, fontWeight: 600,
                background: metric === m.k ? '#1b3a6b' : 'transparent',
                color: metric === m.k ? '#fff' : '#6b7684',
              }}>{m.l}</button>
            ))}
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11.5, color: '#6b7684', marginLeft: 6 }}>
            Tudományterület szűrő
            <select className="input" style={{ minWidth: 220 }} value={field} onChange={(e) => setField(e.target.value)}>
              <option value="">Mind (10 terület)</option>
              {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </label>
          <span className="card-sub" style={{ marginLeft: 'auto' }}>
            {field ? `${filtered.length} poszt fókuszál erre a területre` : '14 poszt · 4 régió'}
          </span>
        </div>
        <WorldMap metric={metric} field={field} selected={sel?.geo ?? ''} onSelect={setSel} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: '1 1 330px', maxWidth: 420, minWidth: 0 }}>
        {sel ? (
          <div className="card">
            <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{sel.orszag}</h3>
                  <div className="card-sub" style={{ marginTop: 2 }}>{sel.attase} · {sel.varos} · {sel.regio}</div>
                </div>
                <button className="btn" onClick={() => setSel(null)} style={{ marginLeft: 'auto', width: 24, height: 24, padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8, marginTop: 12 }}>
                {[
                  { l: 'Riport', v: String(sel.riportok), c: undefined },
                  { l: 'Átlag', v: fmt(avg(sel)), c: col(avg(sel)) },
                  { l: 'Ticket', v: String(sel.nyitott), c: undefined },
                ].map((s) => (
                  <div key={s.l} style={{ background: '#f7f8fa', border: '1px solid #eceff3', borderRadius: 5, padding: '8px 9px' }}>
                    <div className="up" style={{ fontSize: 10 }}>{s.l}</div>
                    <div className="mono" style={{ fontSize: 17, fontWeight: 600, color: s.c }}>{s.v}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
              <div className="up" style={{ marginBottom: 7 }}>Technológiai fókusz</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sel.fokusz.map((t) => (
                  <span key={t} style={{
                    fontSize: 11.5, fontWeight: 500, padding: '3px 9px', borderRadius: 12,
                    background: (FIELD_COLORS[t] || '#1f4e9c') + '18', color: FIELD_COLORS[t] || '#1f4e9c',
                  }}>{t}</span>
                ))}
              </div>
            </div>
            <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
              <div className="up" style={{ marginBottom: 6 }}>K+F helyzetkép</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: '#242c38' }}>{sel.kf}</p>
            </div>
            <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
              <div className="up" style={{ marginBottom: 7 }}>Ajánlott intézmények</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sel.intezmenyek.map((i) => (
                  <div key={i.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{i.n}</div>
                      <div className="card-sub">{i.t} · {i.ter}</div>
                    </div>
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#0f7a68', fontWeight: 600 }}>{i.ny}/5</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
              <div className="up" style={{ marginBottom: 7 }}>Pályázati lehetőségek</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sel.palyazatok.map((p) => (
                  <div key={p.pr} style={{ borderLeft: '2px solid #dde1e7', paddingLeft: 9 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.pr}</div>
                    <div className="card-sub">{p.ki} · {p.keret} · határidő {p.hat}</div>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
              <div className="up" style={{ marginBottom: 7 }}>Szabályozási környezet</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 7 }}>
                <span className="tag" style={{ fontSize: 11, background: '#f0f2f5', color: '#454f5e' }}>Irány: {sel.politika.irany}</span>
                {(() => {
                  const p = pill(sel.politika.kockazat);
                  return <span className="tag" style={{ fontSize: 11, background: p.bg, color: p.fg }}>Kockázat: {p.t}</span>;
                })()}
              </div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: '#242c38' }}>{sel.politika.megj}</p>
            </div>
            <div style={{ padding: '13px 15px' }}>
              <div className="up" style={{ marginBottom: 6 }}>Tanulási javaslat</div>
              <p style={{ margin: '0 0 11px', fontSize: 12.5, lineHeight: 1.6, color: '#242c38' }}>{sel.tanulsag}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/monitoring" className="btn link" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Értékelés</Link>
                <Link href="/kommunikacio" className="btn primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Üzenet / ticket</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 15 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>Válassz országot a térképen</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6b7684', lineHeight: 1.55 }}>
              A pontok a kihelyezett TéT posztokat jelölik. Kattintásra megjelenik az országprofil:
              fókuszterületek, ajánlott intézmények, pályázatok, szabályozási környezet.
            </p>
            <div className="up" style={{ marginBottom: 7 }}>Legaktívabb posztok</div>
            <div>
              {topList.map((p) => (
                <div key={p.id} onClick={() => setSel(p)} style={{
                  padding: '8px 0', borderBottom: '1px solid #f0f2f5', display: 'flex',
                  alignItems: 'center', gap: 9, cursor: 'pointer',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, flex: '0 0 8px', background: FIELD_COLORS[p.fokusz[0]] || '#1f4e9c' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.orszag}</span>
                  <span className="card-sub">{p.attase}</span>
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#454f5e' }}>{p.riportok} riport</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
