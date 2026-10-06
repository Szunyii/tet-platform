'use client';

import { XIcon } from 'lucide-react';
import { useRef, useState } from 'react';
import { flushSync } from 'react-dom';
import { hibaAttr, leiroAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { NativeSelect } from '../../../../components/form/NativeSelect';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Textarea } from '../../../../components/ui/textarea';
import {
  alapVezeto, REGIO_MAX, RESZTERULET_MAX, VAROS_MAX, vezetoHelyzet, type AttaseOrszag, type OrszagTagok,
} from '../../../../lib/attase-orszag';
import { ORSZAGOK, orszagNev } from '../../../../lib/orszagok';
import type { MezoHibak } from '../../../../lib/urlap';
import { Blokk } from './Blokk';
import { VezetoJelolo, VezetoSugo } from './VezetoJelolo';

/** Egy régiós sor; az `id` stabil kliens-kulcs (a sorok törölhetők, a pozíció változik). */
export interface RegioSor {
  id: number;
  kod: string;
  vezeto: boolean;
}

/** A dialógusok vezérelt ország-mezői (az űrlap nyers értékei). */
export interface OrszagErtekek {
  szekhely: { kod: string; varos: string; reszterulet: string; vezeto: boolean };
  regio: RegioSor[];
}

export const URES_ORSZAGOK: OrszagErtekek = {
  szekhely: { kod: '', varos: '', reszterulet: '', vezeto: false },
  regio: [],
};

/** Kezdőértékek a meglévő hozzárendelésekből (szerkesztés dialógus). */
export function orszagErtekek(orszagok: readonly AttaseOrszag[]): OrszagErtekek {
  const sz = orszagok.find((o) => o.szekhely);
  return {
    szekhely: { kod: sz?.kod ?? '', varos: sz?.varos ?? '', reszterulet: sz?.reszterulet ?? '', vezeto: sz?.vezeto ?? false },
    regio: orszagok.filter((o) => !o.szekhely).map((o, i) => ({ id: i + 1, kod: o.kod, vezeto: o.vezeto })),
  };
}

function OrszagOpciok() {
  return (
    <>
      <option value="">Válassz országot…</option>
      {ORSZAGOK.map((o) => (
        <option key={o.kod} value={o.kod}>
          {o.nev}
        </option>
      ))}
    </>
  );
}

/**
 * Székhely (ország, poszt városa, részterület, vezető-jelölő) és régiós lefedettség (soronként
 * ország + vezető-jelölő). A mezőnevek a validátoréi (`szekhely.<mezo>`, `regio.<i>.<mezo>`,
 * az `i` a sor aktuális pozíciója); az id = name = hibakulcs. Országválasztáskor a vezető-jelölő
 * alapértéke az `alapVezeto` szerint újraszámolódik. `sajatId`: a szerkesztett felhasználó (új
 * felhasználónál null) – a vezető-helyzet a többi attasé alapján számol. Sor hozzáadása után a
 * fókusz az új sor selectjére, törlése után a hozzáadás-gombra kerül; a törlés a következő
 * beküldésig elrejti a (pozícióhoz kötött) sorhibákat. `rejtett` (adminnál): a komponens
 * mountolva marad – a belső állapota (az elrejtett sorhibák) így túléli a szerepkör-váltást –,
 * de nem renderel mezőt, tehát nem is küld be semmit.
 */
export function OrszagMezok({
  ertekek,
  onChange,
  errors,
  orszagTagok,
  sajatId,
  rejtett = false,
}: {
  ertekek: OrszagErtekek;
  onChange: (ertekek: OrszagErtekek) => void;
  errors: MezoHibak;
  orszagTagok: OrszagTagok;
  sajatId: string | null;
  rejtett?: boolean;
}) {
  const { szekhely, regio } = ertekek;
  const hozzaadGomb = useRef<HTMLButtonElement>(null);
  // A sorhibák pozícióhoz kötöttek (regio.<i>.orszag): sor törlése után más sorra mutatnának,
  // ezért a következő beküldésig elrejtjük őket (két beküldés között az `errors` ugyanaz az objektum).
  const [elavultHibak, setElavultHibak] = useState<MezoHibak | null>(null);
  const sorHibak = elavultHibak === errors ? {} : errors;
  const helyzet = (kod: string) => vezetoHelyzet(kod, sajatId, orszagTagok);
  const setSzekhely = (resz: Partial<OrszagErtekek['szekhely']>) =>
    onChange({ ...ertekek, szekhely: { ...szekhely, ...resz } });
  const setSor = (id: number, resz: Partial<RegioSor>) =>
    onChange({ ...ertekek, regio: regio.map((r) => (r.id === id ? { ...r, ...resz } : r)) });
  // A fókusz a sorral együtt eltűnő ✕-ről a dialógusra esne (a következő Tab a Név mezőre vinne), a
  // hozzáadás-gombon maradó pedig az új sort kihagyná: a DOM frissítése után (flushSync) az új sor
  // selectjére, illetve törlés után a hozzáadás-gombra tesszük.
  const ujSor = () => {
    flushSync(() => {
      onChange({ ...ertekek, regio: [...regio, { id: Math.max(0, ...regio.map((r) => r.id)) + 1, kod: '', vezeto: false }] });
    });
    document.getElementById(`regio.${regio.length}.orszag`)?.focus();
  };
  const torolSor = (id: number) => {
    flushSync(() => {
      setElavultHibak(errors);
      onChange({ ...ertekek, regio: regio.filter((r) => r.id !== id) });
    });
    hozzaadGomb.current?.focus();
  };

  // A hookok után: rejtve nincs mező, de az állapot megmarad (lásd a doc-kommentet).
  if (rejtett) return null;

  return (
    <>
      <Blokk cim="Székhely">
        <div className="grid gap-3 sm:grid-cols-2">
          <Mezo id="szekhely.orszag" cimke="Ország" errors={errors}>
            <NativeSelect
              id="szekhely.orszag"
              name="szekhely.orszag"
              required
              value={szekhely.kod}
              onChange={(e) => setSzekhely({ kod: e.target.value, vezeto: alapVezeto(helyzet(e.target.value)) })}
              {...hibaAttr(errors, 'szekhely.orszag')}
            >
              <OrszagOpciok />
            </NativeSelect>
          </Mezo>
          <Mezo id="szekhely.varos" cimke="Poszt városa" errors={errors}>
            <Input
              id="szekhely.varos"
              name="szekhely.varos"
              maxLength={VAROS_MAX}
              autoComplete="off"
              placeholder="pl. Stuttgart"
              value={szekhely.varos}
              onChange={(e) => setSzekhely({ varos: e.target.value })}
              {...hibaAttr(errors, 'szekhely.varos')}
            />
          </Mezo>
        </div>
        <Mezo
          id="szekhely.reszterulet"
          cimke="Részterület (opcionális)"
          sugo="Ha több attasé dolgozik az országban: a lefedett tartományok, államok."
          errors={errors}
        >
          <Textarea
            id="szekhely.reszterulet"
            name="szekhely.reszterulet"
            rows={2}
            maxLength={RESZTERULET_MAX}
            placeholder="pl. Baden-Württemberg, Hessen"
            value={szekhely.reszterulet}
            onChange={(e) => setSzekhely({ reszterulet: e.target.value })}
            {...leiroAttr(errors, 'szekhely.reszterulet', true)}
          />
        </Mezo>
        {szekhely.kod && (
          <div className="flex flex-col items-start gap-1">
            <VezetoJelolo
              id="szekhely.vezeto"
              name="szekhely.vezeto"
              cimke="Relációs vezető (országprofil-felelős)"
              bejelolve={szekhely.vezeto}
              onChange={(v) => setSzekhely({ vezeto: v })}
              helyzet={helyzet(szekhely.kod)}
            />
            <VezetoSugo id="szekhely.vezeto" helyzet={helyzet(szekhely.kod)} bejelolve={szekhely.vezeto} />
          </div>
        )}
      </Blokk>
      <Blokk cim="Régiós lefedettség">
        {regio.length === 0 && <p className="text-sm text-muted-foreground">Nincs regionálisan lefedett ország.</p>}
        {regio.map((r, i) => {
          const p = `regio.${i}.`;
          return (
            <div key={r.id} className="flex flex-col gap-1">
              <div className="flex items-center gap-3">
                <NativeSelect
                  id={`${p}orszag`}
                  name={`${p}orszag`}
                  aria-label={`Régiós ország (${i + 1}.)`}
                  className="flex-1"
                  value={r.kod}
                  onChange={(e) => setSor(r.id, { kod: e.target.value, vezeto: alapVezeto(helyzet(e.target.value)) })}
                  {...hibaAttr(sorHibak, `${p}orszag`)}
                >
                  <OrszagOpciok />
                </NativeSelect>
                {r.kod && (
                  <VezetoJelolo
                    id={`${p}vezeto`}
                    name={`${p}vezeto`}
                    cimke={
                      <>
                        Vezető<span className="sr-only"> ({orszagNev(r.kod)})</span>
                      </>
                    }
                    bejelolve={r.vezeto}
                    onChange={(v) => setSor(r.id, { vezeto: v })}
                    helyzet={helyzet(r.kod)}
                  />
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={`${i + 1}. régiós ország eltávolítása${r.kod ? ` (${orszagNev(r.kod)})` : ''}`}
                  onClick={() => torolSor(r.id)}
                >
                  <XIcon />
                </Button>
              </div>
              <MezoHiba mezo={`${p}orszag`} errors={sorHibak} />
              {r.kod && <VezetoSugo id={`${p}vezeto`} helyzet={helyzet(r.kod)} bejelolve={r.vezeto} />}
            </div>
          );
        })}
        {/* A korlátnál is kirajzolva marad (letiltva): a törlés utáni fókusz célja így mindig létezik. */}
        <div>
          <Button
            ref={hozzaadGomb}
            type="button"
            variant="outline"
            size="sm"
            disabled={regio.length >= REGIO_MAX}
            onClick={ujSor}
          >
            + Ország hozzáadása
          </Button>
          {regio.length >= REGIO_MAX && (
            <span className="ml-2 text-xs text-muted-foreground">Legfeljebb {REGIO_MAX} régiós ország.</span>
          )}
        </div>
      </Blokk>
    </>
  );
}
