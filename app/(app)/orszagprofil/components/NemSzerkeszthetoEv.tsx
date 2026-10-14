import Link from 'next/link';
import { SzerkesztesGomb } from '../../../../components/orszagprofil/SzerkesztesGomb';
import { buttonVariants } from '../../../../components/ui/button';
import { Card, CardContent, CardFooter } from '../../../../components/ui/card';

/**
 * A szerkesztő ezt mutatja az űrlapok helyett, ha a fejlécben választott év nem szerkeszthető,
 * de az aktuális igen (relációs vezető attasé múltbeli évvel; a miértjét lásd a szerkesztő
 * page-en). A gomb a SzerkesztesGomb form-ága: a valasztEvAction az aktuális évre állítja a
 * ciklust és a szerkesztőre irányít.
 */
export function NemSzerkeszthetoEv({
  kod, ev, most, action,
}: {
  kod: string;
  /** A választott, nem szerkeszthető év. */
  ev: number;
  most: number;
  action: (formData: FormData) => Promise<void>;
}) {
  return (
    <Card>
      <CardContent>
        <p>
          A(z) {ev}. évi profil csak megtekinthető; szerkeszteni a(z) {most}. évi profilt lehet.
        </p>
      </CardContent>
      <CardFooter className="flex-wrap gap-3">
        <SzerkesztesGomb
          kod={kod}
          most={most}
          szerkeszthetEv={false}
          szerkeszthetMost
          action={action}
          felirat="Vissza a szerkesztéshez"
        />
        <Link href={`/orszagprofil/${kod}`} className={buttonVariants({ variant: 'outline' })}>
          A(z) {ev}. évi profil megtekintése
        </Link>
      </CardFooter>
    </Card>
  );
}
