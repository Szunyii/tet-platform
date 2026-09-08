// Determinisztikus dummy pontszámok a doksi logikája szerint (poszt id + szempont id alapján)
import { CRITERIA, SCORE_THRESHOLD, type Post } from './data';

export function sc(p: Post, i: number): number {
  const j = (((p.id * 37 + i * 13) % 9) / 9 - 0.44) * 1.75;
  return Math.max(1, Math.min(5, Math.round(p.base + j)));
}

export function avg(p: Post): number {
  let s = 0;
  for (let i = 1; i <= 14; i++) s += sc(p, i);
  return s / 14;
}

export function catAvg(p: Post, kat: number): number {
  const c = CRITERIA.filter((x) => x.kat === kat);
  let s = 0;
  c.forEach((x) => { s += sc(p, x.id); });
  return s / c.length;
}

// Országjelentésből számolt mutatók (nem adminisztratív, hanem tartalmi)
export function nyitottsag(p: Post): number {
  if (!p.intezmenyek.length) return 0;
  return p.intezmenyek.reduce((s, i) => s + i.ny, 0) / p.intezmenyek.length;
}

export const RISK_COLORS: Record<string, string> = {
  Alacsony: '#0f7a68', Közepes: '#a86a00', Magas: '#b3261e',
};

export function fmt(v: number): string {
  return v.toFixed(1).replace('.', ',');
}

export function col(v: number): string {
  return v >= 4 ? '#0f7a68' : v >= SCORE_THRESHOLD ? '#454f5e' : '#b3261e';
}

export function ini(n: string): string {
  const p = n.split(' ');
  return (p[0][0] + (p[1] ? p[1][0] : '')).toUpperCase();
}

const PILL_COLORS: Record<string, [string, string]> = {
  Beadva: ['#e8f1ee', '#0f7a68'], Elfogadva: ['#e8f1ee', '#0f7a68'],
  Hiányos: ['#fdf0e6', '#a86a00'], Vázlat: ['#f0f2f5', '#6b7684'],
  Visszaküldve: ['#fbeae9', '#b3261e'], 'Nem adta le': ['#fbeae9', '#b3261e'],
  Nyitott: ['#fbeae9', '#b3261e'], Folyamatban: ['#fdf0e6', '#a86a00'],
  'Válaszra vár': ['#e9eef8', '#1f4e9c'], Lezárt: ['#f0f2f5', '#6b7684'],
  Magas: ['#fbeae9', '#b3261e'], Közepes: ['#fdf0e6', '#a86a00'], Alacsony: ['#f0f2f5', '#6b7684'],
};

export function pill(t: string): { t: string; bg: string; fg: string } {
  const c = PILL_COLORS[t] || ['#f0f2f5', '#6b7684'];
  return { t, bg: c[0], fg: c[1] };
}
