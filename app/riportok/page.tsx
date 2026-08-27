'use client';

import { useMemo, useState } from 'react';
import { useApp } from '../../components/AppShell';
import { BLOCKS, FIELD_COLORS, FIELDS, POSTS, type Post } from '../../lib/data';
import { blk, pill, reports } from '../../lib/score';

const STATUSES = ['Elfogadva', 'Beadva', 'Hiányos', 'Visszaküldve'];

function blockText(p: Post, k: string): string {
  switch (k) {
    case 'kf': return p.kf;
    case 'int': return p.intezmenyek.map((i) => `${i.n} (${i.t}, ${i.ter}, nyitottság ${i.ny}/5)`).join('; ');
    case 'pal': return p.palyazatok.map((x) => `${x.ki} – ${x.pr}, keret ${x.keret}, határidő ${x.hat}`).join('; ');
    case 'tech': return p.fokusz.join(', ');
    case 'ev': return p.esemenyek.map((e) => `${e.n} (${e.t}, ${e.d}, relevancia: ${e.rel})`).join('; ');
    case 'pol': return p.politika.megj;
    case 'tan': return p.tanulsag;
    default: return '';
  }
}

export default function ReportsPage() {
  const { cycle } = useApp();
  const [tab, setTab] = useState<'agg' | 'list'>('agg');
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('');
  const [selId, setSelId] = useState(1);

  const reps = useMemo(() => reports(cycle), [cycle]);
  const rows = reps.filter((r) => {
    const q = query.toLowerCase();
    const matches = !q || r.orszag.toLowerCase().includes(q) || r.attase.toLowerCase().includes(q);
    return matches && (!status || r.st === status);
  });
  const sel = reps.find((r) => r.post.id === selId) ?? reps[0];

  const techAgg = FIELDS.map((f) => ({
    n: f, c: POSTS.filter((p) => p.fokusz.includes(f)).length, color: FIELD_COLORS[f],
  })).sort((a, b) => b.c - a.c);

  const blockAgg = BLOCKS.map((b, i) => {
    const c = POSTS.filter((p) => blk(p, i)).length;
    return { nev: b.nev, c, pct: Math.round((c / 14) * 100), color: c >= 11 ? '#0f7a68' : c >= 8 ? '#a86a00' : '#b3261e' };
  });

  const palAgg = POSTS.flatMap((p) => p.palyazatok.map((x) => ({ ...x, orszag: p.orszag })))
    .sort((a, b) => a.hat.localeCompare(b.hat));
  const intAgg = POSTS.flatMap((p) => p.intezmenyek.map((i) => ({ ...i, orszag: p.orszag })))
    .sort((a, b) => b.ny - a.ny).slice(0, 8);
  const evAgg = POSTS.flatMap((p) => p.esemenyek.map((e) => ({ ...e, orszag: p.orszag })))
    .sort((a, b) => a.d.localeCompare(b.d)).slice(0, 8);

  const aggKpis = [
    { l: 'Pályázati lehetőség', v: String(palAgg.length), sub: 'a riportok 3. blokkjából' },
    { l: 'Ajánlott intézmény', v: String(POSTS.flatMap((p) => p.intezmenyek).length), sub: 'a 2. blokkból gyűjtve' },
    { l: 'Közelgő esemény', v: String(POSTS.flatMap((p) => p.esemenyek).length), sub: 'az 5. blokkból gyűjtve' },
    { l: 'Lefedett terület', v: String(techAgg.filter((t) => t.c > 0).length) + '/10', sub: 'tudományterület a hálózatban' },
  ];

  return (
    <div style={{ maxWidth: 1500 }}>
      <div style={{ display: 'flex', gap: 3, borderBottom: '1px solid #dde1e7', marginBottom: 16 }}>
        {([['agg', 'Kimutatás'], ['list', 'Riportlista']] as const).map(([k, l]) => (
          <button key={k} onClick={() => setTab(k)} style={{
            border: 0, borderBottom: `2px solid ${tab === k ? '#1b3a6b' : 'transparent'}`,
            background: 'transparent', cursor: 'pointer', padding: '8px 14px',
            fontSize: 12.5, fontWeight: 600, color: tab === k ? '#10151d' : '#6b7684',
          }}>{l}</button>
        ))}
      </div>

      {tab === 'agg' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
          {aggKpis.map((k) => (
            <div key={k.l} className="card" style={{ padding: '14px 15px' }}>
              <div className="up">{k.l}</div>
              <div className="mono" style={{ fontSize: 26, fontWeight: 600, marginTop: 7 }}>{k.v}</div>
              <div className="muted" style={{ marginTop: 4 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', gap: 16, alignItems: 'start' }}>
          <div className="card">
            <div className="card-h" style={{ display: 'block' }}>
              <h3>Technológiai fókusz a hálózatban</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>hány posztnál jelenik meg fókuszterületként</div>
            </div>
            <div style={{ padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              {techAgg.map((t) => (
                <div key={t.n}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12 }}>{t.n}</span>
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#454f5e' }}>{t.c} poszt</span>
                  </div>
                  <div className="bar">
                    <div style={{ width: `${Math.round((t.c / 14) * 100)}%`, background: t.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card">
            <div className="card-h" style={{ display: 'block' }}>
              <h3>Blokk-kitöltöttség</h3>
              <div className="card-sub" style={{ marginTop: 2 }}>{cycle} · 14 posztból hány adott le tartalmat</div>
            </div>
            <div style={{ padding: '13px 15px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {blockAgg.map((b) => (
                <div key={b.nev}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 12 }}>{b.nev}</span>
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: b.color, fontWeight: 600 }}>{b.c}/14</span>
                  </div>
                  <div className="bar">
                    <div style={{ width: `${b.pct}%`, background: b.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-h">
            <h3>Aggregált pályázati lehetőségek</h3>
            <span className="card-sub">a riportok 3. blokkjából gyűjtve</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="tbl" style={{ minWidth: 680 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 15 }}>Program</th>
                  <th>Kiíró</th>
                  <th>Ország</th>
                  <th>Keret</th>
                  <th>Határidő</th>
                  <th style={{ paddingRight: 15 }}>Relevancia</th>
                </tr>
              </thead>
              <tbody>
                {palAgg.map((p) => {
                  const r = pill(p.rel);
                  return (
                    <tr key={p.pr + p.orszag}>
                      <td style={{ paddingLeft: 15, fontWeight: 500 }}>{p.pr}</td>
                      <td style={{ fontSize: 12, color: '#454f5e' }}>{p.ki}</td>
                      <td style={{ fontSize: 12, color: '#454f5e' }}>{p.orszag}</td>
                      <td className="mono" style={{ fontSize: 12 }}>{p.keret}</td>
                      <td className="mono" style={{ fontSize: 12, color: '#454f5e' }}>{p.hat}</td>
                      <td style={{ paddingRight: 15 }}>
                        <span className="pill" style={{ background: r.bg, color: r.fg }}>{r.t}</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(330px,1fr))', gap: 16, alignItems: 'start' }}>
          <div className="card">
            <div className="card-h"><h3>Ajánlott intézmények (top)</h3></div>
            <div>
              {intAgg.map((i) => (
                <div key={i.n} style={{ padding: '10px 15px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{i.n}</div>
                    <div className="card-sub">{i.orszag} · {i.ter}</div>
                  </div>
                  <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 600, color: '#0f7a68' }}>{i.ny}/5</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h"><h3>Közelgő események és workshopok</h3></div>
            <div>
              {evAgg.map((e) => {
                const r = pill(e.rel);
                return (
                  <div key={e.n} style={{ padding: '10px 15px', borderBottom: '1px solid #f0f2f5', display: 'flex', alignItems: 'center', gap: 11 }}>
                    <span className="mono" style={{ fontSize: 11, color: '#8a929e', flex: '0 0 74px' }}>{e.d}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 500 }}>{e.n}</div>
                      <div className="card-sub">{e.orszag} · {e.t}</div>
                    </div>
                    <span className="pill" style={{ marginLeft: 'auto', background: r.bg, color: r.fg }}>{r.t}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start' }}>
        <div className="card" style={{ flex: '1 1 480px', minWidth: 0 }}>
          <div className="card-h" style={{ padding: '11px 14px' }}>
            <input className="input" style={{ minWidth: 230, flex: 1 }} value={query}
              onChange={(e) => setQuery(e.target.value)} placeholder="Keresés ország vagy attasé szerint…" />
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="">Minden státusz</option>
              {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
            <span className="muted">{rows.length} találat</span>
          </div>
          <div style={{ overflow: 'auto' }}>
            <table className="tbl" style={{ minWidth: 520 }}>
              <thead>
                <tr>
                  <th style={{ paddingLeft: 14 }}>Azonosító</th>
                  <th>Ország / attasé</th>
                  <th>Ciklus</th>
                  <th>Státusz</th>
                  <th className="r" style={{ paddingRight: 14 }}>Blokk</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => {
                  const p = pill(r.st);
                  const on = r.post.id === sel.post.id;
                  return (
                    <tr key={r.id} className="click" onClick={() => setSelId(r.post.id)}
                      style={{ background: on ? '#f4f8ff' : undefined }}>
                      <td className="mono" style={{ paddingLeft: 14, fontSize: 11.5, color: '#454f5e' }}>{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{r.orszag}</div>
                        <div className="card-sub">{r.attase}</div>
                      </td>
                      <td style={{ fontSize: 12, color: '#454f5e' }}>{r.ciklus}</td>
                      <td><span className="pill" style={{ background: p.bg, color: p.fg }}>{p.t}</span></td>
                      <td className="r mono" style={{ paddingRight: 14, fontSize: 11.5, color: '#6b7684' }}>{r.blokkok}/7</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card" style={{ flex: '1 1 340px', maxWidth: 460, minWidth: 0 }}>
          <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
            <div className="up">Riport részletei</div>
            <h3 style={{ margin: '4px 0 0', fontSize: 14.5, fontWeight: 600 }}>{sel.orszag} · {sel.ciklus}</h3>
            <div className="card-sub" style={{ marginTop: 2 }}>{sel.attase} · {sel.blokkok}/7 blokk · {sel.st}</div>
          </div>
          <div style={{ maxHeight: '60vh', overflow: 'auto' }}>
            {BLOCKS.map((b, i) => {
              const done = blk(sel.post, i);
              return (
                <div key={b.k} style={{ padding: '12px 15px', borderBottom: '1px solid #f0f2f5' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span className="mono" style={{ fontSize: 10.5, color: '#8a929e' }}>B{i + 1}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 600 }}>{b.nev}</span>
                    <span className="tag" style={{
                      marginLeft: 'auto',
                      background: done ? '#e8f1ee' : '#fbeae9', color: done ? '#0f7a68' : '#b3261e',
                    }}>{done ? 'Kitöltve' : 'Hiányzik'}</span>
                  </div>
                  {done && (
                    <p style={{ margin: 0, fontSize: 12, lineHeight: 1.6, color: '#242c38' }}>
                      {blockText(sel.post, b.k)}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
          </div>
        </div>
      )}
    </div>
  );
}
