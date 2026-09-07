'use client';

import { useState } from 'react';
import { useApp } from '../../../components/AppShell';
import { BLOCKS, FIELDS, ME_ID, POSTS } from '../../../lib/data';

interface Draft {
  selects: Record<string, string>;
  chips: string[];
  rows: Record<string, string[][]>;
  txt: Record<string, string>;
}

const emptyDraft = (): Draft => ({
  selects: {},
  chips: [],
  rows: { int: [['', '', '', '']], pal: [['', '', '', '']], ev: [['', '', '', '']] },
  txt: {},
});

function blockDone(d: Draft, k: string): boolean {
  if (k === 'tech') return d.chips.length > 0;
  return Boolean(d.txt[k]?.trim());
}

export default function NewReportPage() {
  const { cycle } = useApp();
  const me = POSTS.find((p) => p.id === ME_ID)!;
  const [ix, setIx] = useState(0);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [toast, setToast] = useState('');

  const b = BLOCKS[ix];
  const doneCount = BLOCKS.filter((x) => blockDone(draft, x.k)).length;

  const setSelect = (label: string, v: string) =>
    setDraft((d) => ({ ...d, selects: { ...d.selects, [b.k + '|' + label]: v } }));
  const toggleChip = (f: string) =>
    setDraft((d) => ({ ...d, chips: d.chips.includes(f) ? d.chips.filter((x) => x !== f) : [...d.chips, f] }));
  const setCell = (ri: number, ci: number, v: string) =>
    setDraft((d) => {
      const rows = d.rows[b.k].map((row, i) => (i === ri ? row.map((c, j) => (j === ci ? v : c)) : row));
      return { ...d, rows: { ...d.rows, [b.k]: rows } };
    });
  const addRow = () =>
    setDraft((d) => ({ ...d, rows: { ...d.rows, [b.k]: [...d.rows[b.k], ['', '', '', '']] } }));
  const delRow = (ri: number) =>
    setDraft((d) => ({ ...d, rows: { ...d.rows, [b.k]: d.rows[b.k].filter((_, i) => i !== ri) } }));
  const setTxt = (v: string) => setDraft((d) => ({ ...d, txt: { ...d.txt, [b.k]: v } }));

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', maxWidth: 1400 }}>
      {toast && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, zIndex: 50, background: '#10151d', color: '#fff',
          padding: '10px 16px', borderRadius: 6, fontSize: 12.5, boxShadow: '0 6px 18px rgba(0,0,0,.28)',
        }}>{toast}</div>
      )}

      <div className="card" style={{ flex: '1 1 260px', maxWidth: 300, minWidth: 0 }}>
        <div style={{ padding: '13px 15px', borderBottom: '1px solid #eceff3' }}>
          <div className="up">Riport · {cycle}</div>
          <h3 style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 600 }}>{me.orszag}</h3>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
            <div className="bar" style={{ flex: 1 }}>
              <div style={{ width: `${Math.round((doneCount / 7) * 100)}%`, background: '#0f7a68' }} />
            </div>
            <span className="mono" style={{ fontSize: 11, color: '#6b7684' }}>{doneCount}/7</span>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', padding: 6 }}>
          {BLOCKS.map((x, i) => {
            const on = i === ix;
            const done = blockDone(draft, x.k);
            return (
              <button key={x.k} onClick={() => setIx(i)} style={{
                display: 'flex', alignItems: 'center', gap: 9, textAlign: 'left', border: 0,
                cursor: 'pointer', padding: '9px 10px', borderRadius: 5, fontSize: 12, fontWeight: 500,
                background: on ? '#eef2f8' : 'transparent', color: on ? '#10151d' : '#454f5e',
              }}>
                <span style={{
                  width: 17, height: 17, borderRadius: 4, display: 'flex', alignItems: 'center',
                  justifyContent: 'center', fontSize: 10, fontWeight: 700, flex: '0 0 17px',
                  background: done ? '#e8f1ee' : '#f0f2f5', color: done ? '#0f7a68' : '#8a929e',
                }}>{done ? '✓' : i + 1}</span>
                {x.nev}
              </button>
            );
          })}
        </div>
        <div style={{ padding: '12px 15px', borderTop: '1px solid #eceff3', display: 'flex', gap: 8 }}>
          <button className="btn" style={{ flex: 1 }} onClick={() => flash('Vázlat elmentve (dummy).')}>Mentés</button>
          <button className="btn primary" style={{ flex: 1 }} onClick={() => flash(`Riport beadva (dummy) – ${doneCount}/7 blokk.`)}>Beadás</button>
        </div>
      </div>

      <div className="card" style={{ flex: '1 1 420px', minWidth: 0 }}>
        <div style={{ padding: '14px 16px', borderBottom: '1px solid #eceff3' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 9 }}>
            <span className="mono" style={{ fontSize: 11, color: '#8a929e' }}>BLOKK {ix + 1}/7</span>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 600 }}>{b.nev}</h3>
          </div>
          <p style={{ margin: '6px 0 0', fontSize: 12, color: '#6b7684', lineHeight: 1.55 }}>{b.hint}</p>
        </div>

        {b.selects && (
          <div style={{
            padding: '15px 16px', borderBottom: '1px solid #f0f2f5',
            display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(190px,1fr))', gap: 13,
          }}>
            {b.selects.map((s) => (
              <label key={s.l} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#454f5e' }}>{s.l}</span>
                <select className="input" style={{ padding: '7px 9px', fontSize: 12.5 }}
                  value={draft.selects[b.k + '|' + s.l] || ''}
                  onChange={(e) => setSelect(s.l, e.target.value)}>
                  <option value="">— válassz —</option>
                  {s.o.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </label>
            ))}
          </div>
        )}

        {b.chips && (
          <div style={{ padding: '15px 16px', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#454f5e', marginBottom: 8 }}>
              Válaszd ki az érintett területeket (több is lehet)
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 7 }}>
              {FIELDS.map((f) => {
                const on = draft.chips.includes(f);
                return (
                  <button key={f} onClick={() => toggleChip(f)} style={{
                    border: `1px solid ${on ? '#1b3a6b' : '#dde1e7'}`, cursor: 'pointer',
                    padding: '5px 11px', borderRadius: 14, fontSize: 12, fontWeight: 500,
                    background: on ? '#1b3a6b' : '#fff', color: on ? '#fff' : '#454f5e',
                  }}>{f}</button>
                );
              })}
            </div>
          </div>
        )}

        {b.cols && (
          <div style={{ padding: '15px 16px', borderBottom: '1px solid #f0f2f5' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: '#454f5e' }}>Strukturált bejegyzések</span>
              <button className="btn link" style={{ marginLeft: 'auto', padding: '4px 10px' }} onClick={addRow}>
                + Sor hozzáadása
              </button>
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  {b.cols.map((c) => (
                    <th key={c} style={{
                      textAlign: 'left', padding: '6px 8px', fontSize: 10.5, fontWeight: 600,
                      letterSpacing: '.05em', textTransform: 'uppercase', color: '#8a929e',
                      borderBottom: '1px solid #dde1e7',
                    }}>{c}</th>
                  ))}
                  <th style={{ width: 34, borderBottom: '1px solid #dde1e7' }} />
                </tr>
              </thead>
              <tbody>
                {draft.rows[b.k]?.map((row, ri) => (
                  <tr key={ri}>
                    {row.map((cell, ci) => (
                      <td key={ci} style={{ padding: '5px 4px', borderBottom: '1px solid #f0f2f5' }}>
                        <input value={cell} onChange={(e) => setCell(ri, ci, e.target.value)}
                          placeholder={b.rowPh?.[ci]} style={{
                            width: '100%', border: '1px solid #e5e9ee', borderRadius: 4,
                            padding: '6px 8px', fontSize: 12.5, background: '#fbfcfd',
                          }} />
                      </td>
                    ))}
                    <td style={{ padding: '5px 4px', borderBottom: '1px solid #f0f2f5', textAlign: 'center' }}>
                      <button onClick={() => delRow(ri)} style={{
                        border: 0, background: 'transparent', cursor: 'pointer',
                        color: '#b3261e', fontSize: 13, lineHeight: 1,
                      }}>×</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div style={{ padding: '15px 16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 7 }}>
            <span style={{ fontSize: 11, fontWeight: 600, color: '#454f5e' }}>Szöveges kifejtés</span>
            <span className="mono" style={{ marginLeft: 'auto', fontSize: 11, color: '#8a929e' }}>
              {(draft.txt[b.k] || '').length} karakter
            </span>
          </div>
          <textarea className="input" style={{ minHeight: 132, fontSize: 12.5 }}
            value={draft.txt[b.k] || ''} onChange={(e) => setTxt(e.target.value)} placeholder={b.ph} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12 }}>
            <span className="muted">A kötött mezők kerülnek az aggregált kimutatásba, a szöveg csak a részletes nézetben látszik.</span>
            <button className="btn" style={{ marginLeft: 'auto', fontSize: 12 }} disabled={ix === 0}
              onClick={() => setIx((i) => Math.max(0, i - 1))}>← Előző</button>
            <button className="btn primary" style={{ fontSize: 12 }} disabled={ix === BLOCKS.length - 1}
              onClick={() => setIx((i) => Math.min(BLOCKS.length - 1, i + 1))}>Következő blokk →</button>
          </div>
        </div>
      </div>
    </div>
  );
}
