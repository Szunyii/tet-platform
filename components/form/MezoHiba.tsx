import type { MezoHibak } from '../../lib/urlap';

/**
 * Egy mező hibaüzenete. Az elem id-ja `<mezo>-hiba`, erre mutat a mező aria-describedby-ja
 * (hibaAttr). Az űrlap-szintű hiba (`mezo="form"`) role="alert"-tel jelenik meg.
 */
export function MezoHiba({ mezo, errors, alert = false }: { mezo: string; errors: MezoHibak; alert?: boolean }) {
  const uzenet = errors[mezo];
  if (!uzenet) return null;
  return (
    <p id={`${mezo}-hiba`} role={alert ? 'alert' : undefined} className="text-xs text-destructive">
      {uzenet}
    </p>
  );
}

/** A hibás mező aria attribútumai: aria-invalid + aria-describedby a `<mezo>-hiba` id-ra. */
export function hibaAttr(errors: MezoHibak, mezo: string) {
  return errors[mezo] ? { 'aria-invalid': true as const, 'aria-describedby': `${mezo}-hiba` } : {};
}

/** aria-invalid + aria-describedby: a súgó (`<mezo>-sugo`, ha van) és a hiba (`<mezo>-hiba`, ha van) együtt. */
export function leiroAttr(errors: MezoHibak, mezo: string, vanSugo = false) {
  const ids = [vanSugo && `${mezo}-sugo`, errors[mezo] && `${mezo}-hiba`].filter(Boolean).join(' ');
  return { ...(errors[mezo] ? { 'aria-invalid': true as const } : {}), ...(ids ? { 'aria-describedby': ids } : {}) };
}
