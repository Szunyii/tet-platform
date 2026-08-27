'use client';

import Link from 'next/link';
import { useState } from 'react';
import WorldMap, { type MapMetric } from '../../components/WorldMap';
import { FIELD_COLORS, FIELDS, POSTS, type Post } from '../../lib/data';
import { RISK_COLORS, fmt, nyitottsag, pill } from '../../lib/score';

const METRICS: { k: MapMetric; l: string }[] = [
  { k: 'focus', l: 'Fókuszterület' },
  { k: 'risk', l: 'Szabályozási kockázat' },
  { k: 'open', l: 'Intézményi nyitottság' },
];

const SEC: React.CSSProperties = { padding: '13px 15px', borderBottom: '1px solid #eceff3' };

// Az esemény NIÜ-relevanciája nem kockázat, ezért nem a piros-sárga skálát használja
const REL: Record<string, [string, string]> = {
  Magas: ['#e9eef8', '#1f4e9c'], Közepes: ['#f0f2f5', '#454f5e'], Alacsony: ['#f7f8fa', '#6b7684'],
};

export default function CountryProfilePage() {
  const [metric, setMetric] = useState<MapMetric>('focus');
  const [field, setField] = useState('');
  const [sel, setSel] = useState<Post | null>(null);

  const filtered = field ? POSTS.filter((p) => p.fokusz.includes(field)) : POSTS;
  const legutobbi = [...POSTS].sort((a, b) => b.utolso.localeCompare(a.utolso)).slice(0, 6);

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
            {field ? `${filtered.length} országjelentés érinti ezt a területet` : '14 országjelentés · 4 régió'}
          </span>
        </div>
        <WorldMap metric={metric} field={field} selected={sel?.geo ?? ''} onSelect={setSel} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: '1 1 330px', maxWidth: 420, minWidth: 0 }}>
        {sel ? (
          <div className="card">
            <div style={SEC}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <div style={{ minWidth: 0 }}>
                  <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{sel.orszag}</h3>
                  <div className="card-sub" style={{ marginTop: 2 }}>{sel.attase} · {sel.varos} · {sel.regio}</div>
                </div>
                <button className="btn" onClick={() => setSel(null)} style={{ marginLeft: 'auto', width: 24, height: 24, padding: 0, fontSize: 13, lineHeight: 1 }}>×</button>
              </div>
              <div className="card-sub" style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: '2px 8px' }}>
                <span>{sel.ciklus} országjelentés</span>
                <span>·</span>
                <span>beküldve {sel.utolso}</span>
                <span>·</span>
                <span>7 blokk</span>
              </div>
            </div>

            <div style={{ ...SEC, background: '#f7f8fa' }}>
              <div className="up" style={{ marginBottom: 6 }}>A jelentés fő megállapítása</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: '#10151d', fontWeight: 500 }}>{sel.megallapitas}</p>
            </div>

            <div style={SEC}>
              <div className="up" style={{ marginBottom: 7 }}>1. Technológiai fókusz</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {sel.fokusz.map((t) => (
                  <span key={t} style={{
                    fontSize: 11.5, fontWeight: 500, padding: '3px 9px', borderRadius: 12,
                    background: (FIELD_COLORS[t] || '#1f4e9c') + '18', color: FIELD_COLORS[t] || '#1f4e9c',
                  }}>{t}</span>
                ))}
              </div>
            </div>

            <div style={SEC}>
              <div className="up" style={{ marginBottom: 6 }}>2. K+F helyzetkép</div>
              <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: '#242c38' }}>{sel.kf}</p>
            </div>

            <div style={SEC}>
              <div className="up" style={{ marginBottom: 7, display: 'flex', alignItems: 'center', gap: 8 }}>
                3. Ajánlott intézmények
                <span className="mono" style={{ marginLeft: 'auto', textTransform: 'none', letterSpacing: 0, fontSize: 11, color: '#6b7684' }}>
                  nyitottság {fmt(nyitottsag(sel))}/5
                </span>
              </div>
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

            <div style={SEC}>
              <div className="up" style={{ marginBottom: 7 }}>4. Pályázati lehetőségek</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sel.palyazatok.map((p) => (
                  <div key={p.pr} style={{ borderLeft: '2px solid #dde1e7', paddingLeft: 9 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{p.pr}</div>
                    <div className="card-sub">{p.ki} · {p.keret} · határidő {p.hat}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={SEC}>
              <div className="up" style={{ marginBottom: 7 }}>5. Események, ahol magyar jelenlét indokolt</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {sel.esemenyek.map((e) => (
                  <div key={e.n} style={{ display: 'flex', alignItems: 'flex-start', gap: 9 }}>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.n}</div>
                      <div className="card-sub">{e.t} · {e.d}</div>
                    </div>
                    {(() => {
                      const [bg, fg] = REL[e.rel] || REL.Alacsony;
                      return <span className="tag" style={{ marginLeft: 'auto', fontSize: 11, background: bg, color: fg }}>{e.rel} relevancia</span>;
                    })()}
                  </div>
                ))}
              </div>
            </div>

            <div style={SEC}>
              <div className="up" style={{ marginBottom: 7 }}>6. Szabályozási környezet</div>
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
              <div className="up" style={{ marginBottom: 6 }}>7. Tanulási javaslat</div>
              <p style={{ margin: '0 0 11px', fontSize: 12.5, lineHeight: 1.6, color: '#242c38' }}>{sel.tanulsag}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href="/riportok" className="btn link" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Teljes jelentés</Link>
                <Link href="/kommunikacio" className="btn primary" style={{ flex: 1, textAlign: 'center', textDecoration: 'none' }}>Üzenet a poszttal</Link>
              </div>
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 15 }}>
            <h3 style={{ margin: '0 0 4px', fontSize: 13, fontWeight: 600 }}>Válassz országot a térképen</h3>
            <p style={{ margin: '0 0 14px', fontSize: 12, color: '#6b7684', lineHeight: 1.55 }}>
              A pontok azokat az országokat jelölik, ahonnan TéT attasé jelentést küld. Kattintásra megnyílik
              a poszt legutóbbi országjelentése: fő megállapítás, K+F helyzetkép, ajánlott intézmények,
              pályázatok, események, szabályozási környezet és tanulságok.
            </p>
            <div className="up" style={{ marginBottom: 7 }}>Legutóbb beérkezett országjelentések</div>
            <div>
              {legutobbi.map((p) => (
                <div key={p.id} onClick={() => setSel(p)} style={{
                  padding: '8px 0', borderBottom: '1px solid #f0f2f5', display: 'flex',
                  alignItems: 'center', gap: 9, cursor: 'pointer',
                }}>
                  <span style={{ width: 8, height: 8, borderRadius: 2, flex: '0 0 8px', background: FIELD_COLORS[p.fokusz[0]] || '#1f4e9c' }} />
                  <span style={{ fontSize: 12.5, fontWeight: 500 }}>{p.orszag}</span>
                  <span className="card-sub">{p.attase}</span>
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#454f5e' }}>{p.utolso}</span>
                </div>
              ))}
            </div>
            <div style={{ marginTop: 12, paddingTop: 11, borderTop: '1px solid #f0f2f5' }}>
              <div className="up" style={{ marginBottom: 7 }}>Szabályozási kockázat a jelentések szerint</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {(['Alacsony', 'Közepes', 'Magas'] as const).map((k) => {
                  const n = POSTS.filter((p) => p.politika.kockazat === k).length;
                  return (
                    <div key={k} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, flex: '0 0 8px', background: RISK_COLORS[k] }} />
                      <span style={{ fontSize: 12 }}>{k}</span>
                      <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#6b7684' }}>{n} ország</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
