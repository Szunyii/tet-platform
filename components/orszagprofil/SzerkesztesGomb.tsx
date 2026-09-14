import Link from 'next/link';
import { buttonVariants } from '../ui/button';
import { cn } from '../../lib/utils';
import { KuldGomb } from './KuldGomb';

/**
 * Az országprofil szerkesztőjére vivő gomb a térkép panelén és a profil oldalon.
 * Ha a nézett (választott) év szerkeszthető: sima link. Ha csak az aktuális év szerkeszthető
 * (attasé múltbeli évnézetben): form-gomb, amely a valasztEvAction-nel a ciklust az aktuális
 * évre állítja és a szerkesztőre irányít – a felirat jelzi az évet: „Szerkesztés (2026)".
 * A form-ág feliratára `feliratMost` adható meg külön (pl. a térkép-panelen a nézett év
 * állapotából adódó „Profil kitöltése" a form-ágon félrevezető lenne, hiszen az az aktuális
 * évet szerkeszti); ha nincs megadva, a `felirat` megy oda is.
 * Ha egyik sem szerkeszthető: nem renderel semmit. A jogot a hívó számolja (canEditProfil,
 * ill. a térképen admin || saját kód).
 */
export function SzerkesztesGomb({
  kod, most, szerkeszthetEv, szerkeszthetMost, action, felirat, feliratMost, className,
}: {
  kod: string;
  most: number;
  szerkeszthetEv: boolean;
  szerkeszthetMost: boolean;
  action: (formData: FormData) => Promise<void>;
  felirat: string;
  feliratMost?: string;
  className?: string;
}) {
  if (szerkeszthetEv) {
    return (
      <Link href={`/orszagprofil/${kod}/szerkesztes`} className={cn(buttonVariants(), className)}>{felirat}</Link>
    );
  }
  if (!szerkeszthetMost) return null;
  return (
    <form action={action} className={className}>
      <input type="hidden" name="ev" value={most} />
      <input type="hidden" name="kod" value={kod} />
      <KuldGomb>{feliratMost ?? felirat} ({most})</KuldGomb>
    </form>
  );
}
