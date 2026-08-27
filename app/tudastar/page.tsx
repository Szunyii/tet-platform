'use client';

import { useMemo, useState } from 'react';
import { FIELDS, FIELD_COLORS } from '../../lib/data';
import { KB_ITEMS, KB_SECTIONS, type KbItem } from '../../lib/knowledge';

function matches(item: KbItem, q: string, field: string): boolean {
  if (field && !item.teruletek.includes(field)) return false;
  if (!q) return true;
  const hay = [item.nev, item.gazda, item.kinek, item.mit, item.kapcsolat,
    ...item.teruletek, ...item.meta.map((m) => `${m.l} ${m.v}`)].join(' ').toLowerCase();
  return hay.includes(q);
}

function Card({ item, color }: { item: KbItem; color: string }) {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      <div className="card-h" style={{ display: 'block', borderTop: `2px solid ${color}`, borderRadius: '5px 5px 0 0' }}>
        <h3 style={{ lineHeight: 1.35 }}>{item.nev}</h3>
        <div className="card-sub" style={{ marginTop: 3 }}>{item.gazda}</div>
      </div>

      <div style={{ padding: '12px 15px', display: 'flex', flexDirection: 'column', gap: 10, flex: 1 }}>
        <div>
          <div className="up">Kinek szól</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 3 }}>{item.kinek}</div>
        </div>
        <div>
          <div className="up">Mit ad</div>
          <div style={{ fontSize: 12.5, lineHeight: 1.55, marginTop: 3 }}>{item.mit}</div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 5, paddingTop: 2 }}>
          {item.meta.map((m) => (
            <div key={m.l} style={{ display: 'flex', gap: 10, alignItems: 'baseline', fontSize: 11.5 }}>
              <span style={{ color: '#8a929e', flex: '0 0 96px' }}>{m.l}</span>
              <span className="mono" style={{ color: '#454f5e', lineHeight: 1.5 }}>{m.v}</span>
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 'auto', paddingTop: 8 }}>
          {item.teruletek.map((t) => (
            <span key={t} className="tag" style={{ background: `${FIELD_COLORS[t]}18`, color: FIELD_COLORS[t] }}>{t}</span>
          ))}
        </div>
      </div>

      <div style={{
        padding: '8px 15px', borderTop: '1px solid #eceff3', fontSize: 11, color: '#6b7684',
        display: 'flex', gap: 6, alignItems: 'baseline',
      }}>
        <span style={{ color: '#8a929e' }}>Kapcsolat</span>
        <span style={{ color: '#454f5e', fontWeight: 600 }}>{item.kapcsolat}</span>
      </div>
    </div>
  );
}

export default function KnowledgePage() {
  const [query, setQuery] = useState('');
  const [field, setField] = useState('');

  const q = query.trim().toLowerCase();
  const sections = useMemo(() => KB_SECTIONS.map((s) => ({
    ...s,
    items: KB_ITEMS.filter((i) => i.sekcio === s.id && matches(i, q, field)),
  })), [q, field]);

  const total = sections.reduce((n, s) => n + s.items.length, 0);

  return (
    <div style={{ maxWidth: 1500 }}>
      <div className="card" style={{
        padding: '12px 15px', display: 'flex', alignItems: 'center', gap: 12,
        flexWrap: 'wrap', marginBottom: 16,
      }}>
        <input
          className="input"
          style={{ minWidth: 260, flex: '1 1 260px' }}
          placeholder="Keresés a tudástárban (program, intézmény, kulcsszó)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <select className="input" value={field} onChange={(e) => setField(e.target.value)}>
          <option value="">Minden technológiai terület</option>
          {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
        {(q || field) && (
          <button className="btn link" onClick={() => { setQuery(''); setField(''); }}>Szűrők törlése</button>
        )}
        <span className="muted" style={{ marginLeft: 'auto' }}>
          {total} találat a {KB_ITEMS.length} elemből
        </span>
      </div>

      {total === 0 && (
        <div className="card" style={{ padding: '28px 15px', textAlign: 'center', color: '#6b7684', fontSize: 12.5 }}>
          Nincs a szűrésnek megfelelő elem.
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 22 }}>
        {sections.filter((s) => s.items.length > 0).map((s) => (
          <section key={s.id}>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
              <span style={{ width: 4, height: 15, background: s.color, borderRadius: 2, alignSelf: 'center' }} />
              <h2 style={{ margin: 0, fontSize: 13.5, fontWeight: 600 }}>{s.nev}</h2>
              <span className="muted">{s.leiras}</span>
              <span className="mono" style={{ marginLeft: 'auto', fontSize: 11.5, color: '#8a929e' }}>{s.items.length} elem</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(300px,1fr))', gap: 14, alignItems: 'stretch' }}>
              {s.items.map((i) => <Card key={i.id} item={i} color={s.color} />)}
            </div>
          </section>
        ))}
      </div>

      <div className="muted" style={{ marginTop: 20 }}>
        Demóadatok – a tudástár tartalma statikus, szerkesztése a jelen demóban nem elérhető.
      </div>
    </div>
  );
}
