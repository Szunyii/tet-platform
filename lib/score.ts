// Determinisztikus dummy pontszámok a doksi logikája szerint (poszt id + szempont id alapján)
import { CRITERIA, SCORE_THRESHOLD, type Post } from './data';

export function sc(p: Post, i: number): number {
  const j = (((p.id * 37 + i * 13) % 9) / 9 - 0.44) * 1.75;
  return Math.max(1, Math.min(5, Math.round(p.base + j)));
}

export function avg(p: Post): number {
  return CRITERIA.reduce((s, c) => s + sc(p, c.id), 0) / CRITERIA.length;
}

export function catAvg(p: Post, kat: number): number {
  const c = CRITERIA.filter((x) => x.kat === kat);
  let s = 0;
  c.forEach((x) => { s += sc(p, x.id); });
  return s / c.length;
}

export function fmt(v: number): string {
  return v.toFixed(1).replace('.', ',');
}

export function col(v: number): string {
  return v >= 4 ? '#0f7a68' : v >= SCORE_THRESHOLD ? '#454f5e' : '#b3261e';
}

const PILL_COLORS: Record<string, [string, string]> = {
  Magas: ['#fbeae9', '#b3261e'], Közepes: ['#fdf0e6', '#a86a00'], Alacsony: ['#f0f2f5', '#6b7684'],
};

export function pill(t: string): { t: string; bg: string; fg: string } {
  const c = PILL_COLORS[t] || ['#f0f2f5', '#6b7684'];
  return { t, bg: c[0], fg: c[1] };
}
