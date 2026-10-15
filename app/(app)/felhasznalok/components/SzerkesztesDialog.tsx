'use client';

import { useState } from 'react';
import { CimkesSelect } from '../../../../components/form/CimkesSelect';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { Input } from '../../../../components/ui/input';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { OrszagTagok } from '../../../../lib/attase-orszag';
import { NEV_MAX, SZEREPKOR_OPCIOK, szerepkorbol, type Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { updateFelhasznaloAction } from '../actions';
import { ElerhetosegMezok, type ElerhetosegErtekek } from './ElerhetosegMezok';
import { OrszagMezok, orszagErtekek, type OrszagErtekek } from './OrszagMezok';

export function SzerkesztesDialog({
  felhasznalo,
  orszagTagok,
  open,
  onOpenChange,
}: {
  felhasznalo: FelhasznaloSor;
  orszagTagok: OrszagTagok;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    updateFelhasznaloAction.bind(null, felhasznalo.id),
    'Felhasználó módosítva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket, és az ország-adatok is
  // megmaradnak, ha a szerepkör-váltás ideiglenesen elrejti a mezőket (az `OrszagMezok` ilyenkor
  // is mountolva marad, `rejtett`: így a belső állapota sem vész el).
  const [nev, setNev] = useState(felhasznalo.nev);
  const [szerepkor, setSzerepkor] = useState<Szerepkor>(felhasznalo.szerepkor);
  const [elerhetoseg, setElerhetoseg] = useState<ElerhetosegErtekek>({
    telefon: felhasznalo.telefon ?? '',
    kapcsolatEmail: felhasznalo.kapcsolatEmail ?? '',
  });
  const [orszagok, setOrszagok] = useState<OrszagErtekek>(() => orszagErtekek(felhasznalo.orszagok));
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Felhasználó szerkesztése"
      leiras={felhasznalo.email}
      gomb="Mentés"
      formAction={formAction}
      errors={errors}
      szeles
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <Mezo id="nev" cimke="Név" errors={errors}>
          <Input
            id="nev"
            name="nev"
            required
            maxLength={NEV_MAX}
            autoComplete="off"
            value={nev}
            onChange={(e) => setNev(e.target.value)}
            {...hibaAttr(errors, 'nev')}
          />
        </Mezo>
        <CimkesSelect
          id="szerepkor"
          name="szerepkor"
          cimke="Szerepkör"
          value={szerepkor}
          onChange={(v) => setSzerepkor(szerepkorbol(v))}
          opciok={SZEREPKOR_OPCIOK}
          placeholder="Válassz szerepkört"
          errors={errors}
          className="w-full"
        >
          {szerepkor === 'admin' && felhasznalo.orszagok.length > 0 && (
            <p className="text-xs text-muted-foreground">Adminra váltva az országok törlődnek.</p>
          )}
        </CimkesSelect>
      </div>
      <ElerhetosegMezok ertekek={elerhetoseg} onChange={setElerhetoseg} errors={errors} />
      <OrszagMezok
        ertekek={orszagok}
        onChange={setOrszagok}
        errors={errors}
        orszagTagok={orszagTagok}
        sajatId={felhasznalo.id}
        rejtett={szerepkor !== 'attase'}
      />
    </MuveletDialog>
  );
}
