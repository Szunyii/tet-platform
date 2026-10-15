import { Label } from '../ui/label';
import { SugoGomb } from './SugoGomb';

/**
 * Mező-címke és (ha van `magyarazat`) a kérdőjeles `SugoGomb` egy sorban. A gomb a `Label`
 * TESTVÉRE, nem a gyereke: a `<label>`-ben a gombra kattintás a mezőre fókuszálna. Magyarázat
 * nélkül pontosan a puszta `Label` (a többi űrlap kinézete nem változik).
 *
 * Az `id` a címke elem id-ja (a `CimkeValaszto` beviteli mezejének `aria-labelledby`-ja erre mutat).
 * `opcionalis`: a címke után halvány „(opcionális)” (a `SugoGomb` neve a puszta `cimke` marad).
 */
export function CimkeSor({
  id, htmlFor, cimke, opcionalis, magyarazat, pelda, labelClassName,
}: {
  id?: string; htmlFor: string; cimke: string; opcionalis?: boolean; magyarazat?: string; pelda?: string;
  labelClassName?: string;
}) {
  const label = (
    <Label id={id} htmlFor={htmlFor} className={labelClassName}>
      {cimke}
      {opcionalis && <>{' '}<span className="font-normal text-muted-foreground">(opcionális)</span></>}
    </Label>
  );
  if (!magyarazat) return label;
  return (
    <div className="flex items-center gap-1">
      {label}
      <SugoGomb cimke={cimke} magyarazat={magyarazat} pelda={pelda} />
    </div>
  );
}
