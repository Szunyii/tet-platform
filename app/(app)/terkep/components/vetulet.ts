import { geoGraticule10, geoNaturalEarth1, geoPath } from 'd3-geo';
import { zoomIdentity, type ZoomTransform } from 'd3-zoom';

// A térkép vetülete és koordinátarendszere (viewBox) – modulszinten, mert rögzített: a poligonok
// path-jai (useVilagAtlasz) és a régió-keretek (regioTranszform) is ebből számolnak.

export const W = 960;
export const H = 505;
export const ZOOM_MAX = 8;
export const PIN_R = 5.5;
export const PIN_BELSO_R = 1.8;

export const proj = geoNaturalEarth1().fitExtent([[6, 6], [W - 6, H - 6]], { type: 'Sphere' });
export const path = geoPath(proj);
export const GOMB_D = path({ type: 'Sphere' }) ?? '';
export const RACS_D = path(geoGraticule10()) ?? '';

/**
 * A régió bbox-ának vetített befoglaló téglalapjára illesztett transzformáció. A `zoom.transform`
 * NEM alkalmazza a d3 constrain-jét és a scaleExtent-et, ezért a k ≥ 1 és a translateExtent
 * ([[0, 0], [W, H]]) korlátját itt tartjuk be – különben a nézet lelógna a térképről, és az első
 * húzásnál ugrana.
 */
export function regioTranszform(bbox: [[number, number], [number, number]]): ZoomTransform {
  const [[ny, d], [k, e]] = bbox;
  const pontok: [number, number][] = [
    [ny, d], [k, d], [ny, e], [k, e], [(ny + k) / 2, d], [(ny + k) / 2, e], [ny, (d + e) / 2], [k, (d + e) / 2],
  ];
  let x0 = Infinity;
  let y0 = Infinity;
  let x1 = -Infinity;
  let y1 = -Infinity;
  for (const p of pontok) {
    const q = proj(p);
    if (!q) continue;
    x0 = Math.min(x0, q[0]);
    y0 = Math.min(y0, q[1]);
    x1 = Math.max(x1, q[0]);
    y1 = Math.max(y1, q[1]);
  }
  const kk = Math.min(ZOOM_MAX, Math.max(1, 0.9 / Math.max((x1 - x0) / W, (y1 - y0) / H)));
  const tx = Math.min(0, Math.max(W - kk * W, W / 2 - (kk * (x0 + x1)) / 2));
  const ty = Math.min(0, Math.max(H - kk * H, H / 2 - (kk * (y0 + y1)) / 2));
  return zoomIdentity.translate(tx, ty).scale(kk);
}
