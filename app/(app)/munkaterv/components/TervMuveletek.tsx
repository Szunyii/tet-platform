'use client';

import { unstable_rethrow } from 'next/navigation';
import { useEffect, useRef, useState, useTransition, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { FormAction, MuveletAction } from '../../../../components/form/useMuveletForm';
import { useNyitas } from '../../../../components/form/useNyitas';
import { Button } from '../../../../components/ui/button';
import type { TervNezet } from '../../../../db/queries/munkaterv';
import { CEL_MAX, CEL_MIN, szerkeszthetoTerv } from '../../../../lib/munkaterv-szotar';
import {
  bekuldAction,
  elutasitModositastAction,
  jovahagyAction,
  kerModositastAction,
  kezdTervAction,
  visszakuldTervAction,
  visszanyitAction,
} from '../actions';
import { TervMegjegyzesDialog } from './TervMegjegyzesDialog';

/** A párbeszédablak záró animációja: ennyi idő után dől el, hogy a fókusz visszatalált-e a helyére. */
const ZARO_ANIMACIO_MS = 250;

/**
 * Az azonnali művelet gombja futás közben is fókuszban marad, hogy sikertelen műveletnél a billentyűzetes felhasználó
 * ne veszítse el a helyét. Ilyenkor nincs natív `disabled`, ezért kell az `aria-disabled:` stílus.
 */
const AZONNALI_GOMB = 'aria-disabled:pointer-events-none aria-disabled:opacity-50';

/** Az azonnali művelet futtatása: a hiba a gombok alatt marad, amíg a felhasználó újat nem indít. */
function useAzonnali() {
  const [pending, startTransition] = useTransition();
  const [hiba, setHiba] = useState<string | null>(null);

  function futtat(muvelet: MuveletAction, siker: string, utana?: () => void) {
    setHiba(null);
    startTransition(async () => {
      try {
        const res = await muvelet();
        if (res.ok) {
          toast.success(siker);
          utana?.();
        } else setHiba(res.errors?.form ?? 'A művelet nem sikerült.');
      } catch (err) {
        unstable_rethrow(err);
        setHiba('A művelet nem futott le. Ellenőrizd a kapcsolatot, és próbáld újra.');
      }
    });
  }

  return { pending, hiba, futtat };
}

/**
 * A műveletek szakasza. Egy lépés után a kiváltó gomb eltűnhet, ezért ha a fókusz elveszett, a szakasz címére kerül.
 */
function MuveletSzakasz({ verzio, hiba, children }: { verzio: number; hiba: string | null; children: ReactNode }) {
  const cim = useRef<HTMLHeadingElement>(null);
  const elozoVerzio = useRef(verzio);

  useEffect(() => {
    if (elozoVerzio.current === verzio) return;
    elozoVerzio.current = verzio;
    const idozito = window.setTimeout(() => {
      const aktiv = document.activeElement;
      if (!aktiv || aktiv === document.body || !aktiv.isConnected) cim.current?.focus();
    }, ZARO_ANIMACIO_MS);
    return () => window.clearTimeout(idozito);
  }, [verzio]);

  return (
    <section aria-labelledby="terv-muveletek-cim" className="flex flex-col gap-2">
      <h3
        id="terv-muveletek-cim"
        ref={cim}
        tabIndex={-1}
        className="w-fit rounded-sm text-sm font-semibold outline-none focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        Műveletek
      </h3>
      {children}
      {hiba && (
        <p role="alert" className="text-xs text-destructive">
          {hiba}
        </p>
      )}
    </section>
  );
}

function Megjegyzes({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

/** A beküldés feltétele szövegesen: hány cél hiányzik, vagy hány van a megengedett keretből. */
function celSzamSzoveg(celDb: number): string {
  if (celDb < CEL_MIN) return `Még ${CEL_MIN - celDb} cél hiányzik a beküldéshez (legalább ${CEL_MIN} kell).`;
  return `${celDb} cél van a tervben (${CEL_MIN}–${CEL_MAX} lehet).`;
}

/** „Munkaterv elkezdése”: a létrejövő tervbe a rá vonatkozó központi célok is bekerülnek. */
export function TervKezdesGomb({ ev }: { ev: number }) {
  const { pending, hiba, futtat } = useAzonnali();

  function fokuszACimre() {
    // A gomb a tervvel együtt eltűnik: a fókusz a terv címére kerül.
    window.setTimeout(() => {
      const aktiv = document.activeElement;
      if (!aktiv || aktiv === document.body || !aktiv.isConnected) document.getElementById('terv-cim')?.focus();
    }, ZARO_ANIMACIO_MS);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <Button
        type="button"
        disabled={pending}
        focusableWhenDisabled
        aria-busy={pending}
        className={AZONNALI_GOMB}
        onClick={() => futtat(() => kezdTervAction(ev), 'A munkaterv elkészült.', fokuszACimre)}
      >
        {pending ? 'Létrehozás…' : 'Munkaterv elkezdése'}
      </Button>
      {hiba && (
        <p role="alert" className="text-xs text-destructive">
          {hiba}
        </p>
      )}
    </div>
  );
}

/** Az attasé műveletei a saját tervén, a terv állapota szerint. */
export function AttaseTervMuveletek({ terv, tartalomNyitva }: { terv: TervNezet; tartalomNyitva: boolean }) {
  const { pending, hiba, futtat } = useAzonnali();
  const modositas = useNyitas();

  const celDb = terv.celok.length;
  const bekuldheto = celDb >= CEL_MIN && celDb <= CEL_MAX;
  const szerkesztheto = tartalomNyitva && szerkeszthetoTerv(terv.statusz);
  const kerheto = tartalomNyitva && terv.statusz === 'jovahagyott' && terv.modositasiKerelem === null;

  return (
    <MuveletSzakasz verzio={terv.verzio} hiba={hiba}>
      {szerkesztheto && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5">
          <Button
            type="button"
            disabled={pending || !bekuldheto}
            focusableWhenDisabled
            aria-busy={pending}
            aria-describedby="terv-celszam"
            className={AZONNALI_GOMB}
            onClick={() => futtat(() => bekuldAction(terv.id, terv.verzio), 'A terv jóváhagyásra elküldve.')}
          >
            {pending ? 'Beküldés…' : 'Beküldés jóváhagyásra'}
          </Button>
          <Megjegyzes id="terv-celszam">{celSzamSzoveg(celDb)}</Megjegyzes>
        </div>
      )}
      {kerheto && (
        <div>
          <Button type="button" variant="outline" onClick={modositas.nyit}>
            Módosítás kérése
          </Button>
        </div>
      )}
      {terv.statusz === 'jovahagyasra_var' && <Megjegyzes>A terv a központ jóváhagyására vár, addig nem szerkeszthető.</Megjegyzes>}
      {terv.statusz === 'jovahagyott' && terv.modositasiKerelem !== null && (
        <Megjegyzes>A módosítási kérésed a központ döntésére vár.</Megjegyzes>
      )}
      {!tartalomNyitva && <Megjegyzes>A múltbeli terv tartalma már nem módosítható.</Megjegyzes>}

      {modositas.kulcs > 0 && (
        <TervMegjegyzesDialog
          key={modositas.kulcs}
          action={kerModositastAction.bind(null, terv.id, terv.verzio)}
          cim="Módosítás kérése"
          leiras="Írd le, mit és miért módosítanál. A terv a központ döntéséig jóváhagyott marad."
          gomb="Kérés elküldése"
          siker="A módosítási kérés elküldve."
          open={modositas.open}
          onOpenChange={modositas.setOpen}
        />
      )}
    </MuveletSzakasz>
  );
}

const DONTES_SZOVEG = {
  visszakuld: {
    cim: 'A terv visszaküldése',
    leiras: 'Az attasé látja a megjegyzést, javítja a tervet, majd újra beküldi.',
    gomb: 'Visszaküldés',
    siker: 'A terv visszaküldve.',
  },
  elutasit: {
    cim: 'A módosítási kérés elutasítása',
    leiras: 'A terv jóváhagyott marad, az attasé látja a megjegyzést.',
    gomb: 'Elutasítás',
    siker: 'A módosítási kérés elutasítva.',
  },
  visszanyit: {
    cim: 'A terv visszanyitása szerkesztésre',
    leiras: 'Az attasé újra szerkesztheti és beküldheti a tervet. A célok állapota megmarad.',
    gomb: 'Visszanyitás',
    siker: 'A terv visszanyitva.',
  },
} as const;

/** A központ döntései a terven, a terv állapota szerint. */
export function AdminTervMuveletek({ terv, tartalomNyitva }: { terv: TervNezet; tartalomNyitva: boolean }) {
  const { pending, hiba, futtat } = useAzonnali();
  const dialog = useNyitas();
  const [dontes, setDontes] = useState<keyof typeof DONTES_SZOVEG>('visszakuld');

  const actionok: Record<keyof typeof DONTES_SZOVEG, FormAction> = {
    visszakuld: visszakuldTervAction.bind(null, terv.id, terv.verzio),
    elutasit: elutasitModositastAction.bind(null, terv.id, terv.verzio),
    visszanyit: visszanyitAction.bind(null, terv.id, terv.verzio),
  };

  function nyit(d: keyof typeof DONTES_SZOVEG) {
    setDontes(d);
    dialog.nyit();
  }

  const varJovahagyasra = terv.statusz === 'jovahagyasra_var';
  const vanKerelem = terv.statusz === 'jovahagyott' && terv.modositasiKerelem !== null;

  return (
    <MuveletSzakasz verzio={terv.verzio} hiba={hiba}>
      {varJovahagyasra || vanKerelem ? (
        <div className="flex flex-wrap items-center gap-2">
          {varJovahagyasra && (
            <Button
              type="button"
              disabled={pending}
              focusableWhenDisabled
              aria-busy={pending}
              className={AZONNALI_GOMB}
              onClick={() => futtat(() => jovahagyAction(terv.id, terv.verzio), 'A terv jóváhagyva.')}
            >
              {pending ? 'Jóváhagyás…' : 'Jóváhagyás'}
            </Button>
          )}
          {varJovahagyasra && tartalomNyitva && (
            <Button type="button" variant="outline" disabled={pending} onClick={() => nyit('visszakuld')}>
              Visszaküldés
            </Button>
          )}
          {vanKerelem && (
            <Button type="button" variant="outline" onClick={() => nyit('elutasit')}>
              Módosítási kérés elutasítása
            </Button>
          )}
          {vanKerelem && tartalomNyitva && (
            <Button type="button" onClick={() => nyit('visszanyit')}>
              Visszanyitás szerkesztésre
            </Button>
          )}
        </div>
      ) : (
        <Megjegyzes>Ezen a terven most nincs elérhető központi döntés.</Megjegyzes>
      )}

      {dialog.kulcs > 0 && (
        <TervMegjegyzesDialog
          key={dialog.kulcs}
          action={actionok[dontes]}
          {...DONTES_SZOVEG[dontes]}
          open={dialog.open}
          onOpenChange={dialog.setOpen}
        />
      )}
    </MuveletSzakasz>
  );
}
