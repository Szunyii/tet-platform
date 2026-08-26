'use client';

import Link from 'next/link';
import { useApp } from '../components/AppShell';
import { BLOCKS, CATS, CRITERIA, DEADLINE, ME_ID, POSTS, SCORE_THRESHOLD, TICKETS } from '../lib/data';
import { avg, blk, blkCount, catAvg, col, fmt, pill, reports } from '../lib/score';

export default function Dashboard() {
  const { role, cycle } = useApp();
  const me = POSTS.find((p) => p.id === ME_ID)!;
  const avgs = POSTS.map((p) => avg(p));
  const netAvg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
  const reps = reports(cycle);
  const submitted = reps.filter((r) => r.st === 'Beadva' || r.st === 'Elfogadva').length;
  const openT = TICKETS.filter((t) => t.statusz !== 'Lezárt');

  const kpis = role === 'admin'
    ? [
        { l: 'Aktív TéT poszt', v: '14', unit: 'ország', sub: '4 régió · 10 tudományterület', c: '#6b7684' },
        { l: 'Beadott riport', v: `${submitted}/14`, unit: '', sub: `határidő: ${DEADLINE}`, c: '#a86a00' },
        { l: 'Nyitott ticket', v: String(openT.length), unit: '', sub: `${openT.filter((t) => t.prio === 'Magas').length} magas prioritású`, c: '#b3261e' },
        { l: 'Hálózati átlag', v: fmt(netAvg), unit: '/ 5', sub: `${avgs.filter((a) => a < SCORE_THRESHOLD).length} poszt a küszöb alatt`, c: '#6b7684' },
      ]
    : [
        { l: 'Saját átlag', v: fmt(avg(me)), unit: '/ 5', sub: `hálózati átlag: ${fmt(netAvg)}`, c: '#6b7684' },
        { l: 'Riport készültség', v: `${blkCount(me)}/7`, unit: 'blokk', sub: `határidő: ${DEADLINE}`, c: '#a86a00' },
        { l: 'Nyitott ticketem', v: String(openT.filter((t) => t.attase === me.attase).length), unit: '', sub: 'admin válaszra vár: 1', c: '#b3261e' },
        { l: 'Idei riportok', v: String(me.riportok), unit: 'db', sub: `utolsó: ${me.utolso}`, c: '#6b7684' },
      ];

  const subRows = [...reps].sort((a, b) => a.blokkok - b.blokkok);

  const catBars = CATS.map((c) => {
    const v = POSTS.map((p) => catAvg(p, c.n)).reduce((a, b) => a + b, 0) / POSTS.length;
    const cnt = CRITERIA.filter((x) => x.kat === c.n).length;
    return { ...c, atl: fmt(v), pct: Math.round((v / 5) * 100), szempontok: cnt, note: v >= netAvg ? 'átlag felett' : 'átlag alatt' };
  });

  const attention = POSTS.map((p) => ({ p, a: avg(p), n: blkCount(p) }))
    .filter((x) => x.a < SCORE_THRESHOLD || x.n < 4)
    .sort((a, b) => a.a - b.a).slice(0, 5);

  const feed = [
    { ido: '08-24 11:05', tag: 'Ticket', txt: 'Sipos Katalin válaszolt a TKT-2041 ügyben (Koreai Köztársaság).' },
    { ido: '08-23 16:41', tag: 'Riport', txt: 'Illés Gábor beadta a 2026 Q2 riportot – 7/7 blokk kitöltve.' },
    { ido: '08-22 09:18', tag: 'Értékelés', txt: 'Nagy Ádám 12. szempontja 5-re módosult NIÜ szakmai visszajelzés alapján.' },
    { ido: '08-21 14:02', tag: 'Riport', txt: 'Deák Orsolya riportja visszaküldve: 3. és 5. blokk hiányos.' },
    { ido: '08-20 14:40', tag: 'Ticket', txt: 'Farkas Judit 11 aktív koreai beszállítót jelölt meg a matchmakinghez.' },
    { ido: '08-19 09:12', tag: 'Ticket', txt: 'Új adatkérés a koreai posztnak: félvezető-beszállítói lista (TKT-2041).' },
  ];
  const tagColors: Record<string, [string, string]> = {
    Ticket: ['#e9eef8', '#1f4e9c'], Riport: ['#e8f1ee', '#0f7a68'], Értékelés: ['#fdf0e6', '#a86a00'],
  };

  const myCriteria = CRITERIA.filter((c) => c.gyakorisag === 'Havi' || c.gyakorisag === 'Negyedéves').slice(0, 4);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 1500 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
        {kpis.map((k) => (
          <div key={k.l} className="card" style={{ padding: '14px 15px' }}>
            <div className="up">{k.l}</div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 7, marginTop: 7 }}>
              <span className="mono" style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-.02em' }}>{k.v}</span>
              <span className="muted">{k.unit}</span>
            </div>
            <div style={{ fontSize: 11.5, color: k.c, marginTop: 5 }}>{k.sub}</div>
          </div>
        ))}
      </div>

      {role === 'admin' ? (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(360px,1fr))', gap: 16, alignItems: 'start' }}>
            <div className="card">
              <div className="card-h">
                <h3>Riportbeadás állapota</h3>
                <span className="muted">{cycle} · 7 kötelező blokk / poszt</span>
                <Link href="/riportok" className="btn link" style={{ marginLeft: 'auto' }}>Összes riport →</Link>
              </div>
              <div style={{ overflow: 'auto' }}>
                <table className="tbl" style={{ minWidth: 600 }}>
                  <thead>
                    <tr>
                      <th style={{ paddingLeft: 15 }}>Attasé / poszt</th>
                      <th>Állapot</th>
                      <th style={{ width: 150 }}>Blokkok</th>
                      <th className="r">Átlag</th>
                      <th className="r" style={{ paddingRight: 15 }}>Utolsó riport</th>
                    </tr>
                  </thead>
                  <tbody>
                    {subRows.map((r) => {
                      const p = pill(r.st);
                      const a = avg(r.post);
                      return (
                        <tr key={r.id} className="click">
                          <td style={{ paddingLeft: 15 }}>
                            <div style={{ fontWeight: 500 }}>{r.attase}</div>
                            <div className="card-sub">{r.orszag} · {r.post.varos}</div>
                          </td>
                          <td><span className="pill" style={{ background: p.bg, color: p.fg }}>{p.t}</span></td>
                          <td>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div className="bar" style={{ flex: 1, height: 6 }}>
                                <div style={{
                                  width: `${Math.round((r.blokkok / 7) * 100)}%`,
                                  background: r.blokkok >= 6 ? '#0f7a68' : r.blokkok >= 4 ? '#a86a00' : '#b3261e',
                                }} />
                              </div>
                              <span className="mono" style={{ fontSize: 11, color: '#6b7684' }}>{r.blokkok}/7</span>
                            </div>
                          </td>
                          <td className="r mono" style={{ color: col(a) }}>{fmt(a)}</td>
                          <td className="r mono" style={{ paddingRight: 15, fontSize: 11.5, color: '#6b7684' }}>{r.post.utolso}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div className="card">
                <div className="card-h"><h3>Kategóriaátlagok · teljes hálózat</h3></div>
                <div style={{ padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 13 }}>
                  {catBars.map((c) => (
                    <div key={c.n}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{c.nev}</span>
                        <span className="mono" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }}>{c.atl}</span>
                        <span style={{ fontSize: 11, color: '#8a929e' }}>/ 5</span>
                      </div>
                      <div className="bar" style={{ height: 8 }}>
                        <div style={{ width: `${c.pct}%`, background: c.color }} />
                      </div>
                      <div className="card-sub" style={{ marginTop: 4 }}>{c.szempontok} szempont · {c.note}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <div className="card-h">
                  <h3>Figyelmet igényel</h3>
                  <span className="card-sub">küszöb alatt vagy késésben</span>
                </div>
                <div>
                  {attention.map((x) => {
                    const dot = x.a < 3 ? '#b3261e' : '#a86a00';
                    return (
                      <Link key={x.p.id} href="/monitoring" style={{
                        padding: '11px 15px', borderBottom: '1px solid #f0f2f5', display: 'flex',
                        alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', flex: '0 0 6px', background: dot }} />
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 500 }}>{x.p.attase} · {x.p.orszag}</div>
                          <div className="card-sub">
                            {x.a < SCORE_THRESHOLD ? `átlag a ${fmt(SCORE_THRESHOLD)} küszöb alatt` : `csak ${x.n}/7 blokk kitöltve`}
                          </div>
                        </div>
                        <span className="mono" style={{ marginLeft: 'auto', fontSize: 12, color: dot }}>{fmt(x.a)}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <div className="card">
            <div className="card-h"><h3>Legutóbbi aktivitás</h3></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))' }}>
              {feed.map((f, i) => {
                const tc = tagColors[f.tag] || ['#f0f2f5', '#6b7684'];
                return (
                  <div key={i} style={{ padding: '11px 15px', borderBottom: '1px solid #f0f2f5', display: 'flex', gap: 11, alignItems: 'flex-start' }}>
                    <span className="mono" style={{ fontSize: 10.5, color: '#8a929e', paddingTop: 2, flex: '0 0 62px' }}>{f.ido}</span>
                    <span className="tag" style={{ background: tc[0], color: tc[1], flex: '0 0 auto' }}>{f.tag}</span>
                    <span style={{ fontSize: 12, color: '#242c38', lineHeight: 1.5 }}>{f.txt}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(340px,1fr))', gap: 16, alignItems: 'start' }}>
          <div className="card">
            <div className="card-h">
              <h3>Az én riportom · {cycle}</h3>
              <span style={{ fontSize: 11.5, color: '#b3261e', fontWeight: 500 }}>határidő: {DEADLINE}</span>
              <Link href="/uj-riport" className="btn primary" style={{ marginLeft: 'auto', textDecoration: 'none' }}>
                Kitöltés folytatása
              </Link>
            </div>
            <div>
              {BLOCKS.map((b, i) => {
                const done = blk(me, i);
                return (
                  <Link key={b.k} href="/uj-riport" style={{
                    padding: '10px 15px', borderBottom: '1px solid #f0f2f5', display: 'flex',
                    alignItems: 'center', gap: 11, textDecoration: 'none', color: 'inherit',
                  }}>
                    <span style={{
                      width: 17, height: 17, borderRadius: 4, display: 'flex', alignItems: 'center',
                      justifyContent: 'center', fontSize: 11, fontWeight: 700, flex: '0 0 17px',
                      background: done ? '#e8f1ee' : '#f0f2f5', color: done ? '#0f7a68' : '#8a929e',
                    }}>{done ? '✓' : i + 1}</span>
                    <span style={{ fontSize: 12.5, fontWeight: 500 }}>{b.nev}</span>
                    <span className="card-sub" style={{ marginLeft: 'auto' }}>{done ? 'kitöltve' : 'hiányzik'}</span>
                  </Link>
                );
              })}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card">
              <div className="card-h"><h3>Esedékes adatbevitel</h3></div>
              <div>
                {myCriteria.map((t) => (
                  <div key={t.id} style={{ padding: '10px 15px', borderBottom: '1px solid #f0f2f5' }}>
                    <div style={{ fontSize: 12.5, fontWeight: 500 }}>{t.szempont}</div>
                    <div className="card-sub" style={{ marginTop: 2 }}>{t.gyakorisag} · {t.adatforras}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card">
              <div className="card-h">
                <h3>Saját pontszámaim</h3>
                <Link href="/monitoring" style={{ marginLeft: 'auto', fontSize: 11.5, fontWeight: 500 }}>Részletek →</Link>
              </div>
              <div style={{ padding: '14px 15px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {CATS.map((c) => {
                  const v = catAvg(me, c.n);
                  return (
                    <div key={c.n}>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 5 }}>
                        <span style={{ fontSize: 12, fontWeight: 500 }}>{c.nev}</span>
                        <span className="mono" style={{ marginLeft: 'auto', fontSize: 13, fontWeight: 600 }}>{fmt(v)}</span>
                      </div>
                      <div className="bar" style={{ height: 8 }}>
                        <div style={{ width: `${Math.round((v / 5) * 100)}%`, background: c.color }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
