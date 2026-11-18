'use client';

import { unstable_rethrow } from 'next/navigation';
import { startTransition, useEffect, useRef, useState, useTransition, type ReactNode, type RefObject } from 'react';
import { toast } from 'sonner';
import { useNyitas } from '../../../../components/form/useNyitas';
import type { FormAction, MuveletAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import type { AdatlapNezet, SzempontMinosites } from '../../../../db/queries/ertekeles';
import {
  automatikusOrszagismeret,
  kovetkezoFul,
  type ErtekelesSor,
  type MunkalapFul,
} from '../../../../lib/ertekeles-osszesites';
import { AUTOMATIKUS_ERTEKELO, SZEMPONTOK, szempontByKulcs } from '../../../../lib/ertekeles-szotar';
import { cn } from '../../../../lib/utils';
import type { MentesState } from '../actions';
import { MinositesJelveny } from './FokozatJelveny';
import { KihagyasDialog } from './KihagyasDialog';
import { OsszPanel } from './OsszPanel';
import { FOKUSZ_OSZTALY, PANEL_CIM_OSZTALY, SzempontPanel } from './SzempontPanel';

/** Egy fül be nem mentett tartalma. A fokozat szövegként, üres: még nincs választás. */
export interface Piszkozat {
  fokozat: string;
  indoklas: string;
  fejlesztesiCel: string;
}

type MentesAction = (prev: MentesState, fd: FormData) => Promise<MentesState>;

type MunkalapProps = Pick<
  AdatlapNezet,
  | 'sor'
  | 'osszIndoklas'
  | 'fejlesztesiCel'
  | 'osszVerzio'
  | 'minositesek'
  | 'mutatok'
  | 'elozmeny'
  | 'letezoJelentesek'
  | 'letezoTicketek'
> & {
  szempontAction: MentesAction;
  osszAction: MentesAction;
  kihagyasAction: FormAction;
  visszavetelAction: MuveletAction;
};

/** A megnyitáskori piszkozatok a mentett adatokból. */
function kezdoPiszkozatok(p: MunkalapProps): Record<MunkalapFul, Piszkozat> {
  const szempontbol = (m: SzempontMinosites | undefined): Piszkozat => ({
    fokozat: m === undefined ? '' : String(m.fokozat),
    indoklas: m?.indoklas ?? '',
    fejlesztesiCel: '',
  });
  return {
    tajekoztatas: szempontbol(p.minositesek.tajekoztatas),
    orszagismeret: szempontbol(p.minositesek.orszagismeret),
    kapcsolatepites: szempontbol(p.minositesek.kapcsolatepites),
    eredmenyek: szempontbol(p.minositesek.eredmenyek),
    egyuttmukodes: szempontbol(p.minositesek.egyuttmukodes),
    ossz: {
      fokozat: p.sor.osszFokozat === null ? '' : String(p.sor.osszFokozat),
      indoklas: p.osszIndoklas ?? '',
      fejlesztesiCel: p.fejlesztesiCel ?? '',
    },
  };
}

/** A megnyitáskori verziók; az összminősítés addig `null`, amíg nincs mentett összminősítés. */
function kezdoVerziok(p: MunkalapProps): Record<MunkalapFul, number | null> {
  return {
    tajekoztatas: p.minositesek.tajekoztatas?.verzio ?? null,
    orszagismeret: p.minositesek.orszagismeret?.verzio ?? null,
    kapcsolatepites: p.minositesek.kapcsolatepites?.verzio ?? null,
    eredmenyek: p.minositesek.eredmenyek?.verzio ?? null,
    egyuttmukodes: p.minositesek.egyuttmukodes?.verzio ?? null,
    ossz: p.sor.osszFokozat === null ? null : p.osszVerzio,
  };
}

const FUL_OSZTALY =
  'block w-full rounded-md px-2 py-2 text-left outline-none hover:bg-muted/60 focus-visible:ring-2 focus-visible:ring-[#1f4e9c] focus-visible:ring-inset aria-disabled:cursor-default';

function Ful({
  cim,
  aktiv,
  tiltott,
  onValaszt,
  children,
}: {
  cim: string;
  aktiv: boolean;
  tiltott: boolean;
  onValaszt: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-current={aktiv ? 'step' : undefined}
      aria-disabled={tiltott || undefined}
      onClick={onValaszt}
      className={cn(FUL_OSZTALY, aktiv && 'bg-[#e6edf8] shadow-[inset_3px_0_0_#1f4e9c] hover:bg-[#e6edf8]')}
    >
      <span className="mb-1 block text-[12.5px] font-medium wrap-anywhere">{cim}</span>
      {children}
    </button>
  );
}

/** A nyitott félév munkalapja: bal oldalt a fülek, középen a bizonyítékok, jobbra a minősítés űrlapja. */
function MunkalapTorzs({ fokuszKell, ...props }: MunkalapProps & { fokuszKell: RefObject<boolean> }) {
  const { sor, minositesek, mutatok, elozmeny, letezoJelentesek, letezoTicketek } = props;
  const [aktiv, setAktiv] = useState<MunkalapFul>('tajekoztatas');
  const [piszkozatok, setPiszkozatok] = useState(() => kezdoPiszkozatok(props));
  const [verziok, setVerziok] = useState(() => kezdoVerziok(props));
  const [folyamatban, setFolyamatban] = useState(false);
  const kihagyas = useNyitas();
  const cimRef = useRef<HTMLHeadingElement>(null);

  // A nem vezető attasé Országismerete automatikus, kivéve ha korábban, vezetőként kapott mentett minősítést.
  const mentettOrszagismeret = minositesek.orszagismeret;
  const automatikus =
    automatikusOrszagismeret(sor.orszagok) &&
    (mentettOrszagismeret === undefined || mentettOrszagismeret.ertekeloNev === AUTOMATIKUS_ERTEKELO);
  // Ha nyitott munkalap közben válik automatikussá, a szempont nem marad szerkeszthető fülként aktív.
  const lathato = aktiv === 'orszagismeret' && automatikus ? kovetkezoFul(aktiv, sor.orszagok) : aktiv;

  // A mentés utáni léptetéskor a megnyomott gomb eltűnik: a fókusz az új panel címére kerül.
  useEffect(() => {
    if (!fokuszKell.current) return;
    fokuszKell.current = false;
    cimRef.current?.focus();
  }, [lathato, fokuszKell]);

  function modosit(ful: MunkalapFul, valtozas: Partial<Piszkozat>) {
    setPiszkozatok((p) => ({ ...p, [ful]: { ...p[ful], ...valtozas } }));
  }

  /**
   * A mentés burkolója: sikernél rögzíti az új verziót és továbblép. A `startTransition` az action többi
   * frissítésével egy commitba köti a váltást, így a következő fül már a friss szerveradatot mutatja.
   */
  function mentes(ful: MunkalapFul, action: MentesAction): FormAction {
    return async (prev, fd) => {
      const eredmeny = await action(prev, fd);
      const { verzio } = eredmeny;
      if (eredmeny.ok && verzio !== undefined) {
        const kovetkezo = kovetkezoFul(ful, sor.orszagok);
        if (kovetkezo !== ful) fokuszKell.current = true;
        startTransition(() => {
          setVerziok((v) => ({ ...v, [ful]: verzio }));
          setAktiv(kovetkezo);
        });
      }
      return eredmeny;
    };
  }

  function valt(ful: MunkalapFul) {
    // Mentés közben nem lehet fület váltani: a mentés hibája a saját panelján jelenik meg.
    if (!folyamatban) setAktiv(ful);
  }

  const panelProps = {
    piszkozat: piszkozatok[lathato],
    verzio: verziok[lathato],
    onValtozas: (valtozas: Partial<Piszkozat>) => modosit(lathato, valtozas),
    onFolyamatban: setFolyamatban,
    cimRef,
  };

  return (
    <div className="grid items-start gap-2.5 @[56rem]:grid-cols-[13.5rem_minmax(0,1fr)_19rem]">
      <div className="flex min-w-0 flex-col gap-2.5">
        <nav aria-label="A minősítés szempontjai" className="rounded-xl border border-border bg-card p-1.5">
          <ul className="flex flex-col gap-0.5">
            {SZEMPONTOK.map((s, i) => {
              const cim = `${i + 1}. ${s.nev}`;
              if (s.kulcs === 'orszagismeret' && automatikus) {
                return (
                  <li key={s.kulcs} className="px-2 py-2">
                    <span className="mb-1 block text-[12.5px] font-medium wrap-anywhere text-muted-foreground">{cim}</span>
                    <MinositesJelveny fokozat={0} />
                    <span className="mt-1 block text-[11px] text-muted-foreground">
                      Automatikus, nem szerkeszthető: az attasé nem relációs vezető.
                    </span>
                  </li>
                );
              }
              return (
                <li key={s.kulcs}>
                  <Ful cim={cim} aktiv={lathato === s.kulcs} tiltott={folyamatban} onValaszt={() => valt(s.kulcs)}>
                    <MinositesJelveny fokozat={sor.fokozatok[s.kulcs]} />
                  </Ful>
                </li>
              );
            })}
            <li className="mt-1 border-t border-border pt-1">
              <Ful cim="Összminősítés" aktiv={lathato === 'ossz'} tiltott={folyamatban} onValaszt={() => valt('ossz')}>
                <MinositesJelveny fokozat={sor.osszFokozat ?? undefined} />
              </Ful>
            </li>
          </ul>
        </nav>
        <Button
          type="button"
          variant="outline"
          disabled={folyamatban}
          focusableWhenDisabled
          onClick={kihagyas.nyit}
          className={cn('h-auto min-h-8 py-1.5 text-[12.5px] whitespace-normal aria-disabled:pointer-events-none aria-disabled:opacity-50', FOKUSZ_OSZTALY)}
        >
          Attasé kihagyása a félévből
        </Button>
      </div>

      {lathato === 'ossz' ? (
        <OsszPanel
          key="ossz"
          {...panelProps}
          action={mentes('ossz', props.osszAction)}
          fokozatok={sor.fokozatok}
          minositesek={minositesek}
          elozmeny={elozmeny}
        />
      ) : (
        <SzempontPanel
          key={lathato}
          {...panelProps}
          action={mentes(lathato, props.szempontAction)}
          szempont={szempontByKulcs(lathato)}
          mutatok={mutatok}
          elozmeny={elozmeny}
          letezoJelentesek={letezoJelentesek}
          letezoTicketek={letezoTicketek}
        />
      )}

      {kihagyas.kulcs > 0 && (
        <KihagyasDialog
          key={kihagyas.kulcs}
          open={kihagyas.open}
          onOpenChange={kihagyas.setOpen}
          nev={sor.nev}
          action={props.kihagyasAction}
          onKihagyva={() => {
            fokuszKell.current = true;
          }}
        />
      )}
    </div>
  );
}

/** A kihagyott attasé: a munkalap helyett a kihagyás oka és a visszavétel. */
function Kihagyott({
  sor,
  action,
  fokuszKell,
}: {
  sor: ErtekelesSor;
  action: MuveletAction;
  fokuszKell: RefObject<boolean>;
}) {
  const [pending, inditas] = useTransition();
  const cimRef = useRef<HTMLHeadingElement>(null);

  // A kihagyás után a dialógus gombja eltűnik: a fókusz ide kerül.
  useEffect(() => {
    if (!fokuszKell.current) return;
    fokuszKell.current = false;
    cimRef.current?.focus();
  }, [fokuszKell]);

  function visszavesz() {
    inditas(async () => {
      try {
        const eredmeny = await action();
        if (eredmeny.ok) {
          fokuszKell.current = true;
          toast.success('Az attasé visszakerült az értékelésbe.');
        } else {
          toast.error(eredmeny.errors?.form ?? 'A visszavétel nem sikerült.');
        }
      } catch (err) {
        unstable_rethrow(err);
        toast.error('A visszavétel nem sikerült.');
      }
    });
  }

  return (
    <section aria-labelledby="kihagyott-cim" className="rounded-xl border border-border bg-card p-4">
      <h3 id="kihagyott-cim" ref={cimRef} tabIndex={-1} className={PANEL_CIM_OSZTALY}>
        Ebben a félévben nem értékelt
      </h3>
      <p className="mt-2 text-[11px] font-semibold text-muted-foreground">A kihagyás oka</p>
      <p className="mt-0.5 text-[13px] whitespace-pre-line wrap-anywhere">{sor.kimaradasOka ?? '–'}</p>
      <p className="mt-2 text-[12px] text-muted-foreground">
        A már rögzített minősítések megmaradtak, de amíg az attasé ki van hagyva, nem számítanak bele az összesítésekbe.
      </p>
      <Button
        type="button"
        disabled={pending}
        focusableWhenDisabled
        onClick={visszavesz}
        className={cn('mt-3 h-auto min-h-8 py-1.5 whitespace-normal aria-disabled:pointer-events-none aria-disabled:opacity-50', FOKUSZ_OSZTALY)}
      >
        {pending ? 'Visszavétel…' : 'Visszavétel az értékelésbe'}
      </Button>
    </section>
  );
}

/**
 * A nyitott félév adatlapja. A két nézet külön komponens, így visszavételkor a munkalap a szerver friss adataiból
 * indul: a kihagyás a sor verzióját is lépteti, a régi verzióval az összminősítés mentése elavultnak számítana.
 */
export function Munkalap(props: MunkalapProps) {
  const fokuszKell = useRef(false);
  if (props.sor.kimarad) return <Kihagyott sor={props.sor} action={props.visszavetelAction} fokuszKell={fokuszKell} />;
  return <MunkalapTorzs {...props} fokuszKell={fokuszKell} />;
}
