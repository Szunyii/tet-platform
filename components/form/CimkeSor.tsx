import { Label } from '../ui/label';
import { SugoGomb } from './SugoGomb';

/**
 * Mező-címke és (ha van `magyarazat`) a kérdőjeles `SugoGomb` egy sorban. A gomb a `Label`
 * TESTVÉRE, nem a gyereke: a `<label>`-ben a gombra kattintás a mezőre fókuszálna. Magyarázat
 * nélkül pontosan a puszta `Label` (a többi űrlap kinézete nem változik).
 *
 * Az `id` a címke elem id-ja (a `CimkeValaszto` beviteli mezejének `aria-labelledby`-ja erre mutat).
 */
export function CimkeSor({
  id, htmlFor, cimke, magyarazat, pelda, labelClassName,
}: {
  id?: string; htmlFor: string; cimke: string; magyarazat?: string; pelda?: string; labelClassName?: string;
}) {
  const label = <Label id={id} htmlFor={htmlFor} className={labelClassName}>{cimke}</Label>;
  if (!magyarazat) return label;
  return (
    <div className="flex items-center gap-1">
      {label}
      <SugoGomb cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
    </div>
  );
}
