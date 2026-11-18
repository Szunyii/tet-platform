'use client';

import { useEffect } from 'react';
import { leiroAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Textarea } from '../../../../components/ui/textarea';
import type { AdatlapNezet } from '../../../../db/queries/ertekeles';
import type { ErtekelesSor } from '../../../../lib/ertekeles-osszesites';
import { INDOKLAS_MAX, SZEMPONTOK } from '../../../../lib/ertekeles-szotar';
import { ElozoFelevek } from './ElozoFelevek';
import { FokozatValaszto } from './FokozatValaszto';
import { MinositesJelveny } from './FokozatJelveny';
import {
  FOKUSZ_OSZTALY,
  MENTES_GOMB_OSZTALY,
  MEZO_OSZTALY,
  OSZLOP_OSZTALY,
  PANEL_CIM_OSZTALY,
  PanelSzakasz,
  type PanelProps,
} from './SzempontPanel';

/** A fejlesztési cél ezeknél az összminősítéseknél nem kötelező (a validátor szabálya). */
const CEL_OPCIONALIS = ['3', '4'];

/**
 * Az összminősítés: középen a szempontok minősítése és az előző félévek, jobbra a fokozat, az indoklás és a
 * fejlesztési cél. Amíg valamelyik szempont nincs minősítve, az űrlap helyett a hiányzók felsorolása látszik.
 */
export function OsszPanel({
  fokozatok,
  minositesek,
  elozmeny,
  piszkozat,
  verzio,
  onValtozas,
  action,
  onFolyamatban,
  cimRef,
}: PanelProps & { fokozatok: ErtekelesSor['fokozatok'] } & Pick<AdatlapNezet, 'minositesek' | 'elozmeny'>) {
  const [state, formAction, pending] = useMuveletForm(action, 'Összminősítés mentve.');
  const errors = state.errors ?? {};
  useEffect(() => onFolyamatban(pending), [pending, onFolyamatban]);
  const hianyzok = SZEMPONTOK.filter((s) => fokozatok[s.kulcs] === undefined);

  return (
    <>
      <section aria-labelledby="munkalap-panel-cim" className={OSZLOP_OSZTALY}>
        <h3 id="munkalap-panel-cim" ref={cimRef} tabIndex={-1} className={PANEL_CIM_OSZTALY}>
          Összminősítés
        </h3>
        <PanelSzakasz cim="A szempontok minősítése">
          <ul>
            {SZEMPONTOK.map((s) => {
              const indoklas = minositesek[s.kulcs]?.indoklas;
              return (
                <li key={s.kulcs} className="border-b border-border/60 py-1.5 first:pt-0 last:border-b-0">
                  <div className="flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
                    <span className="font-medium wrap-anywhere">{s.nev}</span>
                    <MinositesJelveny fokozat={fokozatok[s.kulcs]} />
                  </div>
                  {indoklas && <p className="mt-1 text-[12px] whitespace-pre-line wrap-anywhere text-muted-foreground">{indoklas}</p>}
                </li>
              );
            })}
          </ul>
        </PanelSzakasz>
        <PanelSzakasz cim="Előző félévek">
          <ElozoFelevek elozmeny={elozmeny} ful="ossz" />
        </PanelSzakasz>
      </section>

      {hianyzok.length > 0 ? (
        <section aria-labelledby="ossz-hianyzok-cim" className={`${OSZLOP_OSZTALY} text-[12.5px]`}>
          <h4 id="ossz-hianyzok-cim" className="mb-1.5 text-[11px] font-semibold text-muted-foreground">
            Az összminősítés még nem adható meg
          </h4>
          <p>Összminősítés csak mind az öt szempont minősítése után adható. Még hiányzik:</p>
          <ul className="mt-1.5 list-disc pl-4">
            {hianyzok.map((s) => (
              <li key={s.kulcs}>{s.nev}</li>
            ))}
          </ul>
        </section>
      ) : (
        <form action={formAction} noValidate aria-label="Összminősítés" className={`${OSZLOP_OSZTALY} flex flex-col gap-3`}>
          <input type="hidden" name="verzio" value={verzio ?? ''} />
          <FokozatValaszto
            legend="Az admin összminősítése"
            ertek={piszkozat.fokozat}
            onChange={(fokozat) => onValtozas({ fokozat })}
            errors={errors}
          />
          <Mezo id="indoklas" cimke="Indoklás" errors={errors}>
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
          <Mezo
            id="fejlesztesiCel"
            cimke="Fejlesztési cél"
            opcionalis={CEL_OPCIONALIS.includes(piszkozat.fokozat)}
            errors={errors}
            className={MEZO_OSZTALY}
          >
            <Textarea
              id="fejlesztesiCel"
              name="fejlesztesiCel"
              rows={3}
              maxLength={INDOKLAS_MAX}
              className={FOKUSZ_OSZTALY}
              value={piszkozat.fejlesztesiCel}
              onChange={(e) => onValtozas({ fejlesztesiCel: e.target.value })}
              {...leiroAttr(errors, 'fejlesztesiCel')}
            />
          </Mezo>
          <MezoHiba mezo="form" errors={errors} alert />
          <Button type="submit" disabled={pending} focusableWhenDisabled className={MENTES_GOMB_OSZTALY}>
            {pending ? 'Mentés…' : 'Összminősítés mentése'}
          </Button>
        </form>
      )}
    </>
  );
}
