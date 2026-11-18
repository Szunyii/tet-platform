'use client';

import { useEffect, type ReactNode, type Ref } from 'react';
import { leiroAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import type { AdatlapNezet } from '../../../../db/queries/ertekeles';
import { INDOKLAS_MAX, MEGFELEL, type Szempont } from '../../../../lib/ertekeles-szotar';
import { BizonyitekLista } from './BizonyitekLista';
import { ElozoFelevek } from './ElozoFelevek';
import { FokozatValaszto } from './FokozatValaszto';
import type { Piszkozat } from './Munkalap';
import { Meres } from './SzempontSorok';

/** A munkalap oszlopainak közös kerete. */
export const OSZLOP_OSZTALY = 'min-w-0 rounded-xl border border-border bg-card p-3.5';
/** A panel címe: a mentés utáni léptetéskor ide kerül a fókusz. */
export const PANEL_CIM_OSZTALY = 'rounded-sm text-[14px] font-semibold outline-none focus-visible:ring-2 focus-visible:ring-[#1f4e9c] focus-visible:ring-offset-2';
/** A munkalap vezérlőinek jól látható fókusza: a shadcn alap halvány szürke gyűrűje helyett. */
export const FOKUSZ_OSZTALY = 'focus-visible:border-[#1f4e9c] focus-visible:ring-2 focus-visible:ring-[#1f4e9c]';
/** A mező címkéje keskeny helyen tördelhető: az „(opcionális)” jelölés nem lóghat ki. */
export const MEZO_OSZTALY = '[&_label]:flex-wrap';
/** A mentés gombja mentés közben is fókuszálható, hogy a billentyűzetes felhasználó ne veszítse el a helyét. */
export const MENTES_GOMB_OSZTALY = `h-auto min-h-8 w-full py-1.5 whitespace-normal aria-disabled:pointer-events-none aria-disabled:opacity-50 ${FOKUSZ_OSZTALY}`;

/** A panelek közös propjai: a piszkozat és a verzió a `Munkalap` állapota, a panel csak megjeleníti őket. */
export interface PanelProps {
  piszkozat: Piszkozat;
  verzio: number | null;
  onValtozas: (valtozas: Partial<Piszkozat>) => void;
  action: FormAction;
  onFolyamatban: (folyamatban: boolean) => void;
  cimRef: Ref<HTMLHeadingElement>;
}

export function PanelSzakasz({ cim, children }: { cim: string; children: ReactNode }) {
  return (
    <div className="mt-3.5 text-[12.5px]">
      <h4 className="mb-1.5 text-[11px] font-semibold text-muted-foreground">{cim}</h4>
      {children}
    </div>
  );
}

/**
 * Egy szempont minősítése: középen a mutatók, a bizonyítékok és az előző félévek, jobbra a fokozatok a
 * leírásukkal és az indoklás. A szövegek a `Munkalap` piszkozatában élnek, ezért fülváltáskor és sikertelen
 * mentés után is megmaradnak. Az indoklás a „Megfelel” fokozatnál opcionális.
 */
export function SzempontPanel({
  szempont,
  mutatok,
  elozmeny,
  letezoJelentesek,
  letezoTicketek,
  letezoEredmenyek,
  piszkozat,
  verzio,
  onValtozas,
  action,
  onFolyamatban,
  cimRef,
}: PanelProps & { szempont: Szempont } & Pick<
  AdatlapNezet,
  'mutatok' | 'elozmeny' | 'letezoJelentesek' | 'letezoTicketek' | 'letezoEredmenyek'
>) {
  const [state, formAction, pending] = useMuveletForm(action, 'Minősítés mentve.');
  const errors = state.errors ?? {};
  useEffect(() => onFolyamatban(pending), [pending, onFolyamatban]);

  return (
    <>
      <section aria-labelledby="munkalap-panel-cim" className={OSZLOP_OSZTALY}>
        <h3 id="munkalap-panel-cim" ref={cimRef} tabIndex={-1} className={PANEL_CIM_OSZTALY}>
          {szempont.nev}
        </h3>
        <PanelSzakasz cim="A rendszer mérései">
          <Meres szempont={szempont} mutatok={mutatok} />
        </PanelSzakasz>
        <PanelSzakasz cim="Bizonyítékok">
          {mutatok === null ? (
            <p className="text-muted-foreground">Nincs rögzített mutató.</p>
          ) : (
            <BizonyitekLista
              szempont={szempont.kulcs}
              mutatok={mutatok}
              letezoJelentesek={letezoJelentesek}
              letezoTicketek={letezoTicketek}
              letezoEredmenyek={letezoEredmenyek}
              ujLapon
            />
          )}
        </PanelSzakasz>
        <PanelSzakasz cim="Előző félévek">
          <ElozoFelevek elozmeny={elozmeny} ful={szempont.kulcs} />
        </PanelSzakasz>
      </section>

      <form action={formAction} noValidate aria-label={`${szempont.nev}: minősítés`} className={`${OSZLOP_OSZTALY} flex flex-col gap-3`}>
        <input type="hidden" name="szempont" value={szempont.kulcs} />
        <input type="hidden" name="verzio" value={verzio ?? ''} />
        <FokozatValaszto
          legend="Az admin minősítése"
          ertek={piszkozat.fokozat}
          onChange={(fokozat) => onValtozas({ fokozat })}
          leirasok={szempont.fokozatok}
          nemErtekelheto
          errors={errors}
        />
        <Mezo id="indoklas" cimke="Indoklás" opcionalis={piszkozat.fokozat === String(MEGFELEL)} errors={errors} className={MEZO_OSZTALY}>
          <Textarea
            id="indoklas"
            name="indoklas"
            rows={5}
            maxLength={INDOKLAS_MAX}
            className={FOKUSZ_OSZTALY}
            value={piszkozat.indoklas}
            onChange={(e) => onValtozas({ indoklas: e.target.value })}
            {...leiroAttr(errors, 'indoklas')}
          />
        </Mezo>
        <MezoHiba mezo="form" errors={errors} alert />
        <Button type="submit" disabled={pending} focusableWhenDisabled className={MENTES_GOMB_OSZTALY}>
          {pending ? 'Mentés…' : 'Mentés és következő szempont'}
        </Button>
      </form>
    </>
  );
}
