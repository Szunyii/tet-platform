'use client';

import { useState } from 'react';
import { TICKET_TYPES, TICKETS, type Ticket } from '../../lib/data';
import { ini, pill } from '../../lib/score';

const FILTERS = ['Aktív', 'Magas prioritás', 'Mind'];

export default function CommPage() {
  const [tickets, setTickets] = useState<Ticket[]>(TICKETS);
  const [filter, setFilter] = useState('Aktív');
  const [selId, setSelId] = useState('TKT-2041');
  const [reply, setReply] = useState('');
  const [newType, setNewType] = useState('Adatkérés');
  const [newSubject, setNewSubject] = useState('');

  const list = tickets.filter((t) => {
    if (filter === 'Aktív') return t.statusz !== 'Lezárt';
    if (filter === 'Magas prioritás') return t.prio === 'Magas' && t.statusz !== 'Lezárt';
    return true;
  });
  const tk = tickets.find((t) => t.id === selId) ?? list[0] ?? tickets[0];

  const send = () => {
    if (!reply.trim()) return;
    setTickets((ts) => ts.map((t) => t.id === tk.id
      ? {
          ...t,
          statusz: t.statusz === 'Lezárt' ? t.statusz : 'Folyamatban',
          msgs: [...t.msgs, { ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: 'most', own: true, txt: reply.trim() }],
        }
      : t));
    setReply('');
  };

  const close = () => {
    setTickets((ts) => ts.map((t) => (t.id === tk.id ? { ...t, statusz: 'Lezárt', nyitva: 'lezárva most' } : t)));
  };

  const create = () => {
    if (!newSubject.trim()) return;
    const id = 'TKT-' + (2042 + tickets.length);
    setTickets((ts) => [{
      id, targy: newSubject.trim(), orszag: '—', attase: '—', tipus: newType,
      prio: 'Közepes', statusz: 'Nyitott', hatarido: '2026-09-30', nyitva: 'most',
      msgs: [{ ki: 'Sipos Katalin', role: 'NIÜ · XPAND', ido: 'most', own: true, txt: newSubject.trim() }],
    }, ...ts]);
    setSelId(id);
    setNewSubject('');
  };

  const stPill = pill(tk.statusz);

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', maxWidth: 1500 }}>
      <div className="card" style={{ flex: '1 1 300px', maxWidth: 344, minWidth: 0 }}>
        <div style={{ padding: '11px 13px', borderBottom: '1px solid #eceff3', display: 'flex', gap: 5, flexWrap: 'wrap' }}>
          {FILTERS.map((f) => {
            const on = filter === f;
            return (
              <button key={f} onClick={() => setFilter(f)} style={{
                border: `1px solid ${on ? '#1b3a6b' : '#dde1e7'}`, cursor: 'pointer',
                padding: '4px 10px', borderRadius: 13, fontSize: 11.5, fontWeight: 600,
                background: on ? '#1b3a6b' : '#fff', color: on ? '#fff' : '#6b7684',
              }}>{f}</button>
            );
          })}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', maxHeight: '68vh', overflow: 'auto' }}>
          {list.map((t) => {
            const on = t.id === tk.id;
            const prioColor = t.prio === 'Magas' ? '#b3261e' : t.prio === 'Közepes' ? '#a86a00' : '#c8cfd8';
            return (
              <div key={t.id} onClick={() => setSelId(t.id)} style={{
                padding: '11px 13px', borderBottom: '1px solid #f0f2f5', cursor: 'pointer',
                borderLeft: `3px solid ${prioColor}`, background: on ? '#f4f8ff' : undefined,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="mono" style={{ fontSize: 10.5, color: '#8a929e' }}>{t.id}</span>
                  <span className="tag" style={{ background: '#f0f2f5', color: '#454f5e' }}>{t.tipus}</span>
                  <span className="mono" style={{
                    marginLeft: 'auto', fontSize: 10.5,
                    color: t.prio === 'Magas' ? '#b3261e' : '#8a929e',
                  }}>{t.hatarido}</span>
                </div>
                <div style={{ fontSize: 12.5, fontWeight: 500, marginTop: 5, lineHeight: 1.4 }}>{t.targy}</div>
                <div className="card-sub" style={{ marginTop: 3 }}>{t.orszag} · {t.attase} · {t.msgs.length} üzenet</div>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'flex-start', flex: '1 1 420px', minWidth: 0 }}>
        <div className="card" style={{ display: 'flex', flexDirection: 'column', flex: '1 1 380px', minWidth: 0 }}>
          <div style={{ padding: '13px 16px', borderBottom: '1px solid #eceff3' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
              <span className="mono" style={{ fontSize: 11, color: '#8a929e' }}>{tk.id}</span>
              <span className="tag" style={{ background: stPill.bg, color: stPill.fg }}>{tk.statusz}</span>
            </div>
            <h3 style={{ margin: '6px 0 0', fontSize: 15, fontWeight: 600, lineHeight: 1.35 }}>{tk.targy}</h3>
            <div className="card-sub" style={{ marginTop: 3 }}>{tk.orszag} · {tk.attase} · nyitva {tk.nyitva}</div>
          </div>
          <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12, maxHeight: '46vh', overflow: 'auto' }}>
            {tk.msgs.map((m, i) => (
              <div key={i} style={{ display: 'flex', gap: 10, flexDirection: m.own ? 'row-reverse' : 'row' }}>
                <div style={{
                  width: 27, height: 27, borderRadius: '50%', flex: '0 0 27px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600,
                  background: m.own ? '#1b3a6b' : '#e7ebf1', color: m.own ? '#fff' : '#454f5e',
                }}>{ini(m.ki)}</div>
                <div style={{
                  maxWidth: '76%', background: m.own ? '#eef2f8' : '#fff',
                  border: `1px solid ${m.own ? '#dbe4f2' : '#e5e9ee'}`, borderRadius: 7, padding: '9px 11px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontSize: 11.5, fontWeight: 600 }}>{m.ki}</span>
                    <span style={{ fontSize: 10.5, color: '#8a929e' }}>{m.role}</span>
                    <span className="mono" style={{ marginLeft: 'auto', fontSize: 10.5, color: '#8a929e' }}>{m.ido}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: '#242c38' }}>{m.txt}</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ padding: '13px 16px', borderTop: '1px solid #eceff3', background: '#fbfcfd' }}>
            <textarea className="input" style={{ minHeight: 74, fontSize: 12.5, background: '#fff' }}
              value={reply} onChange={(e) => setReply(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) send(); }}
              placeholder="Válasz írása… (Ctrl+Enter a küldéshez)" />
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 9 }}>
              <span className="muted">Válaszol: Sipos Katalin</span>
              <button className="btn" style={{ marginLeft: 'auto', color: '#0f7a68', fontSize: 12 }} onClick={close}>Lezárás</button>
              <button className="btn primary" style={{ fontSize: 12, padding: '7px 16px' }} onClick={send}>Küldés</button>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, flex: '1 1 236px', maxWidth: 280, minWidth: 0 }}>
          <div className="card">
            <div className="card-h" style={{ padding: '12px 14px' }}><h3 style={{ fontSize: 12.5 }}>Ticket adatlap</h3></div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { l: 'Típus', v: tk.tipus },
                { l: 'Prioritás', v: tk.prio, c: tk.prio === 'Magas' ? '#b3261e' : undefined },
                { l: 'Státusz', v: tk.statusz },
                { l: 'Határidő', v: tk.hatarido },
                { l: 'Érintett poszt', v: `${tk.orszag} · ${tk.attase}` },
              ].map((m) => (
                <div key={m.l}>
                  <div className="up" style={{ fontSize: 10 }}>{m.l}</div>
                  <div style={{ fontSize: 12.5, marginTop: 2, color: m.c }}>{m.v}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="card">
            <div className="card-h" style={{ padding: '12px 14px' }}><h3 style={{ fontSize: 12.5 }}>Új ticket nyitása</h3></div>
            <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 9 }}>
              <select className="input" value={newType} onChange={(e) => setNewType(e.target.value)}>
                {TICKET_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input className="input" value={newSubject} onChange={(e) => setNewSubject(e.target.value)} placeholder="Tárgy" />
              <button className="btn blue" style={{ fontSize: 12 }} onClick={create}>Létrehozás</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
