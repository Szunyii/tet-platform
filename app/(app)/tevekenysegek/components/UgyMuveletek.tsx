'use client';

import { unstable_rethrow } from 'next/navigation';
import { useEffect, useRef, useState, useTransition } from 'react';
import { toast } from 'sonner';
import type { MuveletAction, MuveletState } from '../../../../components/form/useMuveletForm';
import { useNyitas } from '../../../../components/form/useNyitas';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../../../../components/ui/alert-dialog';
import { Button } from '../../../../components/ui/button';
import type { EredmenySor } from '../../../../db/queries/tevekenyseg';
import { attaseMuveletek, befejezettE } from '../../../../lib/tevekenyseg-allapot';
import { kovetkezoSzakasz, szakaszCimke } from '../../../../lib/tevekenyseg-szotar';
import { kapcsolatbaLepAction, megszakitAction, torolEredmenyAction, ujrainditAction } from '../actions';
import { EredmenyDialog } from './EredmenyDialog';
import { IgazolasKeresDialog } from './IgazolasKeresDialog';
import { MegjegyzesDialog } from './MegjegyzesDialog';
import type { RiportOpcio } from './TevekenysegDialog';

/**
 * Az attasé műveletei az ügy adatlapján, az állapotgép szerint. Egy lépés után a kiváltó gomb eltűnhet, ezért a
 * fókusz a szakasz címére kerül, hogy billentyűzettel ne vesszen el.
 */
export function UgyMuveletek({
  ugy,
  orszagok,
  riportOpciok,
}: {
  ugy: EredmenySor;
  orszagok: readonly string[];
  riportOpciok: readonly RiportOpcio[];
}) {
  const muveletek = attaseMuveletek(ugy, ugy.torolheto);
  const kovetkezo = kovetkezoSzakasz(ugy.szakasz);

  const igazolas = useNyitas();
  const megszakitas = useNyitas();
  const modositas = useNyitas();
  const [torlesNyitva, setTorlesNyitva] = useState(false);
  const [pending, startTransition] = useTransition();
  const [hiba, setHiba] = useState<string | null>(null);

  const cim = useRef<HTMLHeadingElement>(null);
  const elozoVerzio = useRef(ugy.verzio);
  // Az új verzió a művelet után érkezik: ekkor már nincs meg a gomb, amelyről a művelet indult. A párbeszédablak
  // bezáródása a kiváltó gombra próbálja visszaadni a fókuszt, ezért a záró animáció után ellenőrzünk, és csak
  // akkor lépünk, ha a fókusz elveszett.
  useEffect(() => {
    if (elozoVerzio.current === ugy.verzio) return;
    elozoVerzio.current = ugy.verzio;
    const idozito = window.setTimeout(() => {
      const aktiv = document.activeElement;
      if (!aktiv || aktiv === document.body || !aktiv.isConnected) cim.current?.focus();
    }, 250);
    return () => window.clearTimeout(idozito);
  }, [ugy.verzio]);

  function futtat(muvelet: () => Promise<MuveletState>, siker: string) {
    setHiba(null);
    startTransition(async () => {
      try {
        const res = await muvelet();
        if (res.ok) toast.success(siker);
        else setHiba(res.errors?.form ?? 'A művelet nem sikerült.');
      } catch (err) {
        unstable_rethrow(err);
        setHiba('A művelet nem futott le. Ellenőrizd a kapcsolatot, és próbáld újra.');
      }
    });
  }

  const torles: MuveletAction = torolEredmenyAction.bind(null, ugy.id);

  function torol() {
    setHiba(null);
    startTransition(async () => {
      try {
        // Sikernél az action a táblára irányít: ha ide visszatérünk, hiba történt.
        const res = await torles();
        setTorlesNyitva(false);
        setHiba(res.errors?.form ?? 'A törlés nem sikerült.');
      } catch (err) {
        unstable_rethrow(err);
        setTorlesNyitva(false);
        setHiba('A törlés nem futott le. Ellenőrizd a kapcsolatot, és próbáld újra.');
      }
    });
  }

  return (
    <section aria-labelledby="ugy-muveletek-cim" className="flex flex-col gap-2">
      <h3 id="ugy-muveletek-cim" ref={cim} tabIndex={-1} className="w-fit rounded-sm text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50">
        Műveletek
      </h3>
      <div className="flex flex-wrap items-center gap-2">
        {muveletek.includes('kapcsolatba_lep') && (
          <Button
            type="button"
            disabled={pending}
            onClick={() => futtat(() => kapcsolatbaLepAction(ugy.id, ugy.verzio), 'Az ügy a Kapcsolat szakaszba lépett.')}
          >
            Továbblépés: Kapcsolat
          </Button>
        )}
        {muveletek.includes('igazolast_ker') && kovetkezo && (
          <Button type="button" disabled={pending} onClick={igazolas.nyit}>
            Igazolás kérése: {szakaszCimke(kovetkezo)}
          </Button>
        )}
        {muveletek.includes('ujraindit') && (
          <Button
            type="button"
            disabled={pending}
            onClick={() => futtat(() => ujrainditAction(ugy.id, ugy.verzio), 'Az ügy újraindult.')}
          >
            Újraindítás
          </Button>
        )}
        {muveletek.includes('modosit') && (
          <Button type="button" variant="outline" disabled={pending} onClick={modositas.nyit}>
            Módosítás
          </Button>
        )}
        {muveletek.includes('megszakit') && (
          <Button type="button" variant="outline" disabled={pending} onClick={megszakitas.nyit}>
            Megszakítás
          </Button>
        )}
        {muveletek.includes('torol') && (
          <Button type="button" variant="destructive" disabled={pending} onClick={() => setTorlesNyitva(true)}>
            Törlés
          </Button>
        )}
      </div>
      {ugy.kertSzakasz && (
        <p className="text-xs text-muted-foreground">A kérés elbírálásáig nem indítható újabb szakaszváltás.</p>
      )}
      {befejezettE(ugy) && (
        <p className="text-xs text-muted-foreground">Az ügy befejeződött: a megállapodást a központ igazolta.</p>
      )}
      {hiba && (
        <p role="alert" className="text-xs text-destructive">
          {hiba}
        </p>
      )}

      {igazolas.kulcs > 0 && kovetkezo && (
        <IgazolasKeresDialog
          key={`igazolas-${igazolas.kulcs}`}
          ugyId={ugy.id}
          verzio={ugy.verzio}
          kertSzakasz={kovetkezo}
          riportOpciok={riportOpciok}
          open={igazolas.open}
          onOpenChange={igazolas.setOpen}
        />
      )}
      {megszakitas.kulcs > 0 && (
        <MegjegyzesDialog
          key={`megszakitas-${megszakitas.kulcs}`}
          action={megszakitAction.bind(null, ugy.id)}
          verzio={ugy.verzio}
          cim="Az ügy megszakítása"
          leiras="Írd le a megszakítás okát. A megszakadt ügy lekerül a tábláról, a szűrővel visszakereshető és újraindítható. A függő igazoláskérés törlődik."
          gomb="Megszakítás"
          siker="Az ügy megszakadt."
          open={megszakitas.open}
          onOpenChange={megszakitas.setOpen}
        />
      )}
      {modositas.kulcs > 0 && (
        <EredmenyDialog
          key={`modositas-${modositas.kulcs}`}
          ugy={ugy}
          orszagok={orszagok}
          open={modositas.open}
          onOpenChange={modositas.setOpen}
        />
      )}

      <AlertDialog
        open={torlesNyitva}
        onOpenChange={(next, details) => {
          // Futó törlés közben nem záródhat: a művelet nem szakítható meg.
          if (!next && pending) {
            details.cancel();
            return;
          }
          setTorlesNyitva(next);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Az ügy törlése</AlertDialogTitle>
            <AlertDialogDescription>
              „{ugy.megnevezes}” véglegesen törlődik. A hozzá kapcsolt tevékenységek megmaradnak, kapcsolat nélkül.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={pending}>Mégse</AlertDialogCancel>
            <AlertDialogAction variant="destructive" disabled={pending} onClick={torol}>
              {pending ? 'Törlés…' : 'Törlés'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
