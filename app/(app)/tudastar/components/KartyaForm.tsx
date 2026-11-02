'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Mezo } from '../../../../components/form/Mezo';
import { leiroAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { useMuveletForm, type FormAction, type MuveletAction } from '../../../../components/form/useMuveletForm';
import { Button, buttonVariants } from '../../../../components/ui/button';
import {
  CIM_MAX, EMAIL_MAX, KARTYA_CIMKEK, NEV_CIMKE, NEV_MAX, OSSZEFOGLALO_CIMKE, OSSZEFOGLALO_MAX, ROVIDITES_MAX,
  SZOVEG_MAX, TELEFON_MAX, TIPUS_CIMKE, TUDASTAR_KATEGORIAK, URL_MAX, uresTartalom,
  type HasznosLink, type Kartya, type KartyaTipus, type ListaSor, type Program, type Szakasz,
} from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';
import { KartyaMezo, SZOVEG_SUGO, UrlapBlokk } from './KartyaMezo';
import { KartyaTorles } from './KartyaTorles';
import { SorSzerkeszto, sorokbol, type SorAllapot } from './SorSzerkeszto';

/** Az űrlap vezérelt állapota: mindkét típus mezői (a nem használtak üresek és nem renderelődnek). */
interface Urlap {
  kategoria: string;
  nev: string;
  rovidites: string;
  osszefoglalo: string;
  honlap: string;
  profil: string;
  tevekenyseg: string;
  email: string;
  telefon: string;
  cim: string;
  szakaszok: SorAllapot<Szakasz>[];
  programok: SorAllapot<Program>[];
  sorok: SorAllapot<ListaSor>[];
  linkek: SorAllapot<HasznosLink>[];
}
type SzovegKulcs = { [K in keyof Urlap]: Urlap[K] extends string ? K : never }[keyof Urlap];

function kezdoUrlap(kartya: Kartya | undefined, kategoria: string): Urlap {
  const i = kartya?.tipus === 'intezmeny' ? kartya.tartalom : uresTartalom('intezmeny');
  const l = kartya?.tipus === 'lista' ? kartya.tartalom : uresTartalom('lista');
  return {
    kategoria: kartya?.kategoria ?? kategoria,
    nev: kartya?.nev ?? '',
    rovidites: kartya?.rovidites ?? '',
    osszefoglalo: kartya?.osszefoglalo ?? '',
    honlap: kartya?.honlap ?? '',
    profil: i.profil,
    tevekenyseg: i.tevekenyseg,
    email: i.kapcsolat.email,
    telefon: i.kapcsolat.telefon,
    cim: i.kapcsolat.cim,
    szakaszok: sorokbol(i.szakaszok),
    programok: sorokbol(i.programok),
    sorok: sorokbol(l.sorok),
    linkek: sorokbol(kartya?.tartalom.linkek ?? []),
  };
}

export type KartyaFormProps = { action: FormAction; megseHref: string } & (
  | { mod: 'uj'; tipus: KartyaTipus; kategoria: string; kartya?: undefined; torlesAction?: undefined }
  | { mod: 'szerkesztes'; kartya: Kartya; torlesAction: MuveletAction; tipus?: undefined; kategoria?: undefined }
);

/**
 * A kártya szerkesztője (új és meglévő). Vezérelt mezők (a React 19 a sikeres action után az uncontrolled
 * mezőket alaphelyzetbe állítaná). Rejtett mezők: `tipus` (új), `id` + `verzio` (meglévő: az `updatedAt` ms,
 * a mentés ezzel ismeri fel a közbeni módosítást). Sikernél az action átirányít, ezért nincs siker-toast.
 */
export function KartyaForm(props: KartyaFormProps) {
  const { action, megseHref, kartya } = props;
  const tipus = props.mod === 'uj' ? props.tipus : props.kartya.tipus;
  const [state, formAction, pending] = useMuveletForm(action);
  const errors = state.errors ?? {};
  const [u, setU] = useState(() => kezdoUrlap(kartya, props.kategoria ?? ''));
  const set = <K extends keyof Urlap>(k: K) => (v: Urlap[K]) => setU((p) => ({ ...p, [k]: v }));
  const mezo = (k: SzovegKulcs) => ({ id: k, value: u[k], onChange: set(k), errors });
  const intezmeny = tipus === 'intezmeny';
  const C = KARTYA_CIMKEK;

  return (
    <form action={formAction} noValidate className="flex max-w-4xl flex-col gap-4">
      {props.mod === 'uj' ? (
        <input type="hidden" name="tipus" value={tipus} />
      ) : (
        <>
          <input type="hidden" name="id" value={props.kartya.id} />
          <input type="hidden" name="verzio" value={props.kartya.updatedAt.getTime()} />
        </>
      )}
      <UrlapBlokk
        cim={props.mod === 'uj' ? `Új ${intezmeny ? 'intézménykártya' : 'listakártya'}` : 'Alapadatok'}
        leiras={`${TIPUS_CIMKE[tipus]} · ${intezmeny ? 'a kártyán az összefoglaló látszik, a részletek külön oldalon' : 'a kártyán a bevezető és a sorok látszanak'}`}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Mezo id="kategoria" cimke={C.kategoria} errors={errors} className="sm:col-span-2">
            <NativeSelect id="kategoria" name="kategoria" value={u.kategoria} onChange={(e) => set('kategoria')(e.target.value)}
              {...leiroAttr(errors, 'kategoria')}>
              {TUDASTAR_KATEGORIAK.map((k) => (
                <option key={k.slug} value={k.slug}>
                  {k.szam}. {k.cim}
                </option>
              ))}
            </NativeSelect>
          </Mezo>
          <KartyaMezo {...mezo('nev')} cimke={NEV_CIMKE[tipus]} max={NEV_MAX} className="sm:col-span-2" />
          <KartyaMezo {...mezo('rovidites')} cimke={C.rovidites} opcionalis max={ROVIDITES_MAX} />
          <KartyaMezo {...mezo('honlap')} cimke={C.honlap} opcionalis max={URL_MAX} placeholder="https://…" inputMode="url" />
          <KartyaMezo {...mezo('osszefoglalo')} cimke={OSSZEFOGLALO_CIMKE[tipus]} max={OSSZEFOGLALO_MAX}
            tobbsoros sorok={3} szamlalo sugo="2–3 mondat, ez látszik a kártyán." className="sm:col-span-2" />
        </div>
      </UrlapBlokk>

      {intezmeny ? (
        <>
          <UrlapBlokk cim="Profil és tevékenység" leiras="A részletoldal első két blokkja.">
            <KartyaMezo {...mezo('profil')} cimke={C.profil} opcionalis max={SZOVEG_MAX} tobbsoros sorok={5} sugo={SZOVEG_SUGO} />
            <KartyaMezo {...mezo('tevekenyseg')} cimke={C.tevekenyseg} opcionalis max={SZOVEG_MAX} tobbsoros sorok={5} sugo={SZOVEG_SUGO} />
          </UrlapBlokk>
          <UrlapBlokk cim="Kapcsolat" leiras="Csak intézményi elérhetőség: központi e-mail, telefon, cím.">
            <div className="grid gap-4 sm:grid-cols-2">
              <KartyaMezo {...mezo('email')} cimke={C.email} opcionalis max={EMAIL_MAX} inputMode="email" />
              <KartyaMezo {...mezo('telefon')} cimke={C.telefon} opcionalis max={TELEFON_MAX} inputMode="tel" />
              <KartyaMezo {...mezo('cim')} cimke={C.cim} opcionalis max={CIM_MAX} className="sm:col-span-2" />
            </div>
          </UrlapBlokk>
          <UrlapBlokk cim="Szakaszok" leiras="Címzett szakaszok a részletoldalon, pl. KFI-stratégia, prioritások, aktuális pályázatok.">
            <SorSzerkeszto lista="szakaszok" value={u.szakaszok} onChange={set('szakaszok')} errors={errors} />
          </UrlapBlokk>
          <UrlapBlokk cim="Programok" leiras="Programonként egysoros leírás és link.">
            <SorSzerkeszto lista="programok" value={u.programok} onChange={set('programok')} errors={errors} />
          </UrlapBlokk>
        </>
      ) : (
        <UrlapBlokk cim="Sorok" leiras="A lista szereplői: név, honlap, rövid megjegyzés.">
          <SorSzerkeszto lista="sorok" value={u.sorok} onChange={set('sorok')} errors={errors} />
        </UrlapBlokk>
      )}
      <UrlapBlokk cim="Hasznos linkek" leiras="Pl. pályázatok, hírek, szolgáltatások – az élő hivatalos oldalakra.">
        <SorSzerkeszto lista="linkek" value={u.linkek} onChange={set('linkek')} errors={errors} />
      </UrlapBlokk>

      <div className="flex flex-wrap items-center gap-3">
        {props.mod === 'szerkesztes' && <KartyaTorles nev={props.kartya.nev} action={props.torlesAction} />}
        <MezoHiba mezo="form" errors={errors} alert />
        <div className="ml-auto flex gap-2">
          {/* Link + buttonVariants (nem Button render={<Link/>}): a Base UI Button natív <button>-t vár. */}
          <Link
            href={megseHref}
            className={cn(buttonVariants({ variant: 'outline' }), pending && 'pointer-events-none opacity-50')}
            aria-disabled={pending || undefined}
            tabIndex={pending ? -1 : undefined}
            onClick={(e) => {
              if (pending) e.preventDefault();
            }}
          >
            Mégse
          </Link>
          <Button type="submit" disabled={pending}>
            {pending ? 'Mentés…' : 'Mentés'}
          </Button>
        </div>
      </div>
    </form>
  );
}
