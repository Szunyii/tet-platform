'use client';

import { unstable_rethrow } from 'next/navigation';
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useTransition,
  type ComponentProps,
  type FocusEvent,
} from 'react';
import { toast } from 'sonner';
import type { FormAction, MuveletAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import type { EredmenySor } from '../../../../db/queries/tevekenyseg';
import { adminMuveletek } from '../../../../lib/tevekenyseg-allapot';
import { cn } from '../../../../lib/utils';
import {
  igazolAction,
  kifogasolEredmenyAction,
  visszakuldAction,
  visszavonAction,
  visszavonEredmenyKifogasAction,
} from '../actions';
import { MegjegyzesDialog } from './MegjegyzesDialog';

/** A párbeszédablak záró animációja: ennyi idő után dől el, hogy a fókusz visszatalált-e a helyére. */
const ZARO_ANIMACIO_MS = 250;

/**
 * A fókusz megőrzése az admin listáin és az adatlapon. Egy döntés után a kiváltó gomb vagy az egész sor eltűnhet (az
 * igazolt kérés lekerül a sorból): ilyenkor a fókusz a helyére lépő sorra, sor hiányában a konténerre kerül. A
 * sorokat `data-sor` jelöli, és `tabIndex={-1}`-gyel fókuszálhatók. `valtozas`: a lista tartalmát azonosító szöveg.
 */
export function useListaFokusz(valtozas: string) {
  const kontener = useRef<HTMLDivElement>(null);
  const utolsoSor = useRef(0);
  const idozito = useRef<number | undefined>(undefined);
  const elozo = useRef(valtozas);

  const ellenoriz = useCallback(() => {
    window.clearTimeout(idozito.current);
    idozito.current = window.setTimeout(() => {
      const aktiv = document.activeElement;
      if (aktiv && aktiv !== document.body && aktiv.isConnected) return;
      const sorok = kontener.current?.querySelectorAll<HTMLElement>('[data-sor]');
      const cel = sorok?.[Math.min(utolsoSor.current, sorok.length - 1)] ?? kontener.current;
      cel?.focus();
    }, ZARO_ANIMACIO_MS);
  }, []);

  useEffect(() => {
    if (elozo.current === valtozas) return;
    elozo.current = valtozas;
    ellenoriz();
  }, [valtozas, ellenoriz]);

  useEffect(() => () => window.clearTimeout(idozito.current), []);

  const onFocusCapture = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const sor = e.target.closest('[data-sor]');
    if (!sor || !kontener.current) return;
    utolsoSor.current = [...kontener.current.querySelectorAll('[data-sor]')].indexOf(sor);
  }, []);

  return { kontener, onFocusCapture, ellenoriz };
}

export interface MegjegyzesKeres {
  action: FormAction;
  verzio: number;
  cim: string;
  leiras: string;
  gomb: string;
  siker: string;
}

/**
 * Egy lista közös megjegyzés-ablaka. A sorokon kívül él, mert a döntés után a sor eltűnhet: ha egy másik admin
 * közben döntött, az ablak így nyitva marad, és megmutatja az elavult hibát.
 */
export function useMegjegyzesDialog(onZart: () => void) {
  const [keres, setKeres] = useState<(MegjegyzesKeres & { kulcs: number }) | null>(null);
  const [open, setOpen] = useState(false);

  const nyit = useCallback((uj: MegjegyzesKeres) => {
    setKeres((elozo) => ({ ...uj, kulcs: (elozo?.kulcs ?? 0) + 1 }));
    setOpen(true);
  }, []);

  const elem = keres && (
    <MegjegyzesDialog
      key={keres.kulcs}
      action={keres.action}
      verzio={keres.verzio}
      cim={keres.cim}
      leiras={keres.leiras}
      gomb={keres.gomb}
      siker={keres.siker}
      open={open}
      onOpenChange={(kovetkezo) => {
        setOpen(kovetkezo);
        if (!kovetkezo) onZart();
      }}
    />
  );

  return { nyit, elem };
}

/** Megerősítés nélküli művelet. A hiba toastban jelenik meg, mert a frissítés után a sor már eltűnhetett. */
export function useAzonnaliMuvelet() {
  const [pending, startTransition] = useTransition();

  function futtat(muvelet: MuveletAction, siker: string) {
    startTransition(async () => {
      try {
        const res = await muvelet();
        if (res.ok) toast.success(siker);
        else toast.error(res.errors?.form ?? 'A művelet nem sikerült.');
      } catch (err) {
        unstable_rethrow(err);
        toast.error('A művelet nem futott le. Ellenőrizd a kapcsolatot, és próbáld újra.');
      }
    });
  }

  return { pending, futtat };
}

/**
 * Az azonnali művelet gombja futás közben is fókuszban marad, hogy sikertelen műveletnél a billentyűzetes felhasználó
 * ne veszítse el a helyét. Ilyenkor nincs natív `disabled`, ezért kell az `aria-disabled:` stílus.
 */
export function AzonnaliGomb({ pending, className, ...props }: ComponentProps<typeof Button> & { pending: boolean }) {
  return (
    <Button
      type="button"
      size="sm"
      disabled={pending}
      focusableWhenDisabled
      aria-busy={pending}
      className={cn('aria-disabled:pointer-events-none aria-disabled:opacity-50', className)}
      {...props}
    />
  );
}

const MEGJEGYZES_SZOVEG = {
  visszakuld: {
    gomb: 'Visszaküldés',
    cim: 'A kérés visszaküldése',
    leiras: 'Az ügy az érvényes szakaszában marad, „Visszaküldve” jelzéssel. Az attasé látja a megjegyzést, és új kérést indíthat.',
    siker: 'A kérés visszaküldve.',
  },
  visszavon: {
    gomb: 'Igazolás visszavonása',
    cim: 'Az igazolás visszavonása',
    leiras: 'Az ügy az előző szakaszba kerül, „Visszaküldve” jelzéssel. A már lezárt félévek rögzített mutatói nem változnak.',
    siker: 'Az igazolás visszavonva.',
  },
  kifogasol: {
    gomb: 'Kifogásolás',
    cim: 'Az ügy kifogásolása',
    leiras: 'Kifogás alatt az ügy korai szakaszai nem számítanak a mutatókba. Az attasé látja a megjegyzést. A kifogás megszűnik, ha az attasé módosítja az ügyet, vagy ha visszavonod.',
    siker: 'A kifogás rögzítve.',
  },
} as const;

/** Az ügy központi műveletei az állapotgép szerint: csak az `adminMuveletek` által engedettek látszanak. */
export function AdminUgyGombok({ ugy, nyit }: { ugy: EredmenySor; nyit: (keres: MegjegyzesKeres) => void }) {
  const { pending, futtat } = useAzonnaliMuvelet();
  const muveletek = adminMuveletek(ugy, ugy.kifogas !== null);

  const megjegyzesGomb = (muvelet: keyof typeof MEGJEGYZES_SZOVEG, action: FormAction) => (
    <Button
      type="button"
      variant="outline"
      size="sm"
      disabled={pending}
      aria-label={`${MEGJEGYZES_SZOVEG[muvelet].gomb}: ${ugy.megnevezes}`}
      onClick={() => nyit({ ...MEGJEGYZES_SZOVEG[muvelet], action, verzio: ugy.verzio })}
    >
      {MEGJEGYZES_SZOVEG[muvelet].gomb}
    </Button>
  );

  return (
    <>
      {muveletek.includes('visszakuld') && megjegyzesGomb('visszakuld', visszakuldAction.bind(null, ugy.id))}
      {muveletek.includes('igazol') && (
        <AzonnaliGomb
          pending={pending}
          aria-label={`Igazolás: ${ugy.megnevezes}`}
          onClick={() => futtat(() => igazolAction(ugy.id, ugy.verzio), 'A kérés igazolva.')}
        >
          Igazolás
        </AzonnaliGomb>
      )}
      {muveletek.includes('visszavon') && megjegyzesGomb('visszavon', visszavonAction.bind(null, ugy.id))}
      {muveletek.includes('kifogasol') && megjegyzesGomb('kifogasol', kifogasolEredmenyAction.bind(null, ugy.id))}
      {muveletek.includes('kifogast_visszavon') && (
        <AzonnaliGomb
          pending={pending}
          variant="outline"
          aria-label={`Kifogás visszavonása: ${ugy.megnevezes}`}
          onClick={() => futtat(() => visszavonEredmenyKifogasAction(ugy.id, ugy.verzio), 'A kifogás visszavonva.')}
        >
          Kifogás visszavonása
        </AzonnaliGomb>
      )}
    </>
  );
}

/** A központ műveletei az ügy adatlapján. */
export function AdminAdatlapMuveletek({ ugy }: { ugy: EredmenySor }) {
  const fokusz = useListaFokusz(String(ugy.verzio));
  const dialog = useMegjegyzesDialog(fokusz.ellenoriz);
  const vanMuvelet = adminMuveletek(ugy, ugy.kifogas !== null).length > 0;

  return (
    <section aria-labelledby="ugy-muveletek-cim">
      <div
        ref={fokusz.kontener}
        tabIndex={-1}
        className="flex flex-col gap-2 rounded-sm outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <h3 id="ugy-muveletek-cim" className="text-sm font-semibold">
          Műveletek
        </h3>
        {vanMuvelet ? (
          <div className="flex flex-wrap items-center gap-2">
            <AdminUgyGombok ugy={ugy} nyit={dialog.nyit} />
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">Ezen az ügyön most nincs elérhető központi művelet.</p>
        )}
      </div>
      {dialog.elem}
    </section>
  );
}
