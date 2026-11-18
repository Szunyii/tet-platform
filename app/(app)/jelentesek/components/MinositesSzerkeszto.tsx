'use client';

import { fokozatNev, type OsszFokozat } from '../../../../lib/ertekeles-szotar';
import { cn } from '../../../../lib/utils';
import type { FormAction } from '../../../../components/form/useMuveletForm';
import { useNyitas } from '../../../../components/form/useNyitas';
import { buttonVariants } from '../../../../components/ui/button';
import { FokozatJelveny } from '../../monitoring/components/FokozatJelveny';
import { MinositesDialog } from './MinositesDialog';

/**
 * A jelentés központi minősítésének kiváltó eleme és a dialógus nyitás-állapota; csak a központnak renderelődik.
 * `cella`: a lista cellája – a meglévő fokozat színes jelvénye maga a gomb, minősítés nélkül „Minősítés”.
 * `gomb`: a részletoldal kártyájának gombja. A kliensnek csak egyszerű értékek jönnek (fokozat, megjegyzés),
 * a minősítés többi adata (szerző, időpont) nem: azt a Server Component írja ki.
 */
export function MinositesSzerkeszto({
  targy,
  fokozat,
  megjegyzes,
  action,
  valtozat,
}: {
  targy: string;
  fokozat: OsszFokozat | null;
  megjegyzes: string | null;
  action: FormAction;
  valtozat: 'cella' | 'gomb';
}) {
  const { open, setOpen, kulcs, nyit } = useNyitas();
  const jelveny = valtozat === 'cella' && fokozat !== null;

  return (
    <>
      {/* Egyetlen natív <button> minden állapotra: ha a minősítés megadásakor vagy törlésekor másik elemtípusra
          váltana, a React új DOM-elemet tenne a helyére, és a dialógus bezárásakor a fókusz nem tudna visszatérni
          a kiváltó elemre. */}
      <button
        type="button"
        aria-haspopup="dialog"
        // A lista soronkénti gombja: a MinositesFokusz ebből találja meg a szomszédos sort (a részletoldalén nincs).
        data-minosites-cella={valtozat === 'cella' ? '' : undefined}
        onClick={nyit}
        title={jelveny ? 'Minősítés módosítása' : undefined}
        // A listában soronként van ilyen gomb: a név a tárggyal együtt egyedi (a látható szöveget tartalmazza). A
        // részletoldalon a „Módosítás” felirat az Intézkedés kártya gombjával azonos volna, ezért ott is kap nevet.
        aria-label={
          valtozat === 'cella'
            ? fokozat === null
              ? `Minősítés megadása: ${targy}`
              : `${fokozatNev(fokozat)}, minősítés módosítása: ${targy}`
            : fokozat === null
              ? undefined
              : 'Minősítés módosítása'
        }
        className={cn(
          jelveny
            ? 'cursor-pointer rounded-[10px] align-middle outline-none hover:opacity-80 focus-visible:ring-3 focus-visible:ring-ring/50'
            : buttonVariants({ variant: 'outline', size: 'sm' }),
        )}
      >
        {jelveny ? (
          <FokozatJelveny fokozat={fokozat} />
        ) : valtozat === 'cella' ? (
          'Minősítés'
        ) : fokozat === null ? (
          'Minősítés megadása'
        ) : (
          'Módosítás'
        )}
      </button>
      {/* Az első nyitásig nincs mit mountolni (soronként egy dialógus-állapot és useActionState). */}
      {kulcs > 0 && (
        <MinositesDialog
          key={kulcs}
          targy={targy}
          fokozat={fokozat}
          megjegyzes={megjegyzes}
          action={action}
          open={open}
          onOpenChange={setOpen}
        />
      )}
    </>
  );
}
