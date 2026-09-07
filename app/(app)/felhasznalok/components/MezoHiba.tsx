import type { MezoHibak } from '../../../../lib/felhasznalo-validacio';

/** Mezőhiba szövege. Az `id`-t a mező `aria-describedby`-ja hivatkozza (hibaAttr). */
export function MezoHiba({ id, uzenet, alert = false }: { id?: string; uzenet?: string; alert?: boolean }) {
  if (!uzenet) return null;
  return (
    <p id={id} role={alert ? 'alert' : undefined} className="text-xs text-destructive">
      {uzenet}
    </p>
  );
}

/** A hibás mező aria attribútumai: aria-invalid + aria-describedby a `<mezo>-hiba` id-ra. */
export function hibaAttr(errors: MezoHibak, mezo: string) {
  return errors[mezo] ? { 'aria-invalid': true as const, 'aria-describedby': `${mezo}-hiba` } : {};
}
