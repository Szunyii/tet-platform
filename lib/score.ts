// Determinisztikus dummy pontszámok a doksi logikája szerint (poszt id + szempont id alapján)
import { CRITERIA, POSTS, SCORE_THRESHOLD, type Post } from './data';

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

export function blk(p: Post, i: number): boolean {
  return ((p.id * 29 + i * 11) % 10) < Math.round(p.base * 2.05 - 1.2);
}

export function blkCount(p: Post): number {
  let n = 0;
  for (let i = 0; i < 7; i++) if (blk(p, i)) n++;
  return n;
}

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

export function repStatusOf(p: Post): string {
  const n = blkCount(p);
  if (n === 7) return 'Elfogadva';
  if (n >= 5) return 'Beadva';
  if (n >= 3) return 'Hiányos';
  return 'Visszaküldve';
}

export interface Report {
  id: string; post: Post; orszag: string; attase: string;
  ciklus: string; st: string; blokkok: number;
}

export function reports(cycle: string): Report[] {
  return POSTS.map((p) => ({
    id: 'RPT-' + cycle.replace(' ', '') + '-' + (100 + p.id),
    post: p, orszag: p.orszag, attase: p.attase, ciklus: cycle,
    st: repStatusOf(p), blokkok: blkCount(p),
  }));
}
