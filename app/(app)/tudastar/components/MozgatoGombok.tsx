'use client';

import { ArrowDownIcon, ArrowUpIcon } from 'lucide-react';
import { useLayoutEffect, useRef, useState, useTransition } from 'react';
import { Button } from '../../../../components/ui/button';

/** Az admin ↑/↓ műveletei (bind-olt `mozgatKartyaAction`); hiányzó irány = a lista szélén, letiltott gomb. */
export interface Mozgatas {
  fel?: () => Promise<void>;
  le?: () => Promise<void>;
}

type Irany = keyof Mozgatas;

/**
 * Egy kártya ↑/↓ gombpárja a kategória-oldalon; a `KartyaLablec` (Server Component) a bind-olt actionöket adja.
 * Mozgatás után a fókusz a `SorSzerkeszto` szabálya szerint a mozgatott kártya ugyanolyan irányú gombjára kerül,
 * ha az a lista szélén letiltott, az ellentétesre. Két dolog vinné el: a futás alatti tiltás (ezért
 * `focusableWhenDisabled`: natív `disabled` helyett `aria-disabled`, a fókusz marad; a lista szélén natív) és a
 * lejjebb kerülő kártya DOM-jának áthelyezése (a kártyák id szerint kulcsoltak, ez a komponens-példány megmarad).
 *
 * Az időzítés: az action hívása a Next routerének állapotfrissítését ugyanebben a transitionben indítja, és a React
 * az async action alatt indított transition-frissítéseket egy sávba köti vele. Az `isPending` ezért ugyanabban a
 * commitban vált `false`-ra, amelyben az új sorrend megjelenik, és a layout-effekt már az új DOM-on állítja a
 * fókuszt. Sikertelen mozgatásnál (az action csendben nem csinál semmit) a sorrend nem változik, a fókusz a
 * megnyomott gombon marad. Ha közben a felhasználó máshová vitte a fókuszt, nem vesszük el.
 */
export function MozgatoGombok({ nev, mozgatas }: { nev: string; mozgatas: Mozgatas }) {
  const [pending, startTransition] = useTransition();
  const [kert, setKert] = useState<Irany | null>(null);
  const felGomb = useRef<HTMLButtonElement>(null);
  const leGomb = useRef<HTMLButtonElement>(null);

  useLayoutEffect(() => {
    if (pending || kert === null) return;
    setKert(null);
    const aktiv = document.activeElement;
    if (aktiv && aktiv !== document.body && aktiv !== felGomb.current && aktiv !== leGomb.current) return;
    const cel = kert === 'fel' ? (mozgatas.fel ? felGomb : leGomb) : (mozgatas.le ? leGomb : felGomb);
    cel.current?.focus();
  }, [pending, kert, mozgatas.fel, mozgatas.le]);

  function mozgat(irany: Irany) {
    const action = mozgatas[irany];
    if (!action) return;
    setKert(irany);
    startTransition(async () => {
      await action();
    });
  }

  const gomb = (irany: Irany) => {
    const van = Boolean(mozgatas[irany]);
    // A `focusableWhenDisabled` mellett nincs natív disabled, ezért a shadcn `disabled:` stílusainak `aria-disabled:` párja.
    return (
      <Button
        ref={irany === 'fel' ? felGomb : leGomb}
        type="button"
        variant="ghost"
        size="icon-sm"
        disabled={!van || pending}
        focusableWhenDisabled={van}
        className="aria-disabled:pointer-events-none aria-disabled:opacity-50"
        aria-busy={pending && kert === irany}
        aria-label={`${irany === 'fel' ? 'Feljebb' : 'Lejjebb'}: ${nev}`}
        onClick={() => mozgat(irany)}
      >
        {irany === 'fel' ? <ArrowUpIcon aria-hidden /> : <ArrowDownIcon aria-hidden />}
      </Button>
    );
  };

  return (
    <>
      {gomb('fel')}
      {gomb('le')}
    </>
  );
}
