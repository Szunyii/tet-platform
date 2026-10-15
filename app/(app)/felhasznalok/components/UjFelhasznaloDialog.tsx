'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import type { OrszagTagok } from '../../../../lib/attase-orszag';
import {
  JELSZO_MIN, NEV_MAX, SZEREPKOR_OPCIOK, szerepkorbol, type Szerepkor,
} from '../../../../lib/felhasznalo-validacio';
import { createFelhasznaloAction } from '../actions';
import { CimkesSelect } from '../../../../components/form/CimkesSelect';
import { Mezo } from '../../../../components/form/Mezo';
import { hibaAttr } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { ElerhetosegMezok, URES_ELERHETOSEG, type ElerhetosegErtekek } from './ElerhetosegMezok';
import { OrszagMezok, URES_ORSZAGOK, type OrszagErtekek } from './OrszagMezok';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';
import { useNyitas } from '../../../../components/form/useNyitas';

export function UjFelhasznaloDialog({ orszagTagok }: { orszagTagok: OrszagTagok }) {
  const { open, setOpen, kulcs, nyit } = useNyitas();
  return (
    <>
      <Button onClick={nyit}>Új felhasználó</Button>
      {kulcs > 0 && <UjFelhasznaloModal key={kulcs} open={open} onOpenChange={setOpen} orszagTagok={orszagTagok} />}
    </>
  );
}

function UjFelhasznaloModal({
  open,
  onOpenChange,
  orszagTagok,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orszagTagok: OrszagTagok;
}) {
  const [state, formAction, pending] = useMuveletForm(
    createFelhasznaloAction,
    'Felhasználó létrehozva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket, és az ország-adatok is
  // megmaradnak, ha a szerepkör-váltás ideiglenesen elrejti a mezőket (az `OrszagMezok` ilyenkor
  // is mountolva marad, `rejtett`: így a belső állapota sem vész el).
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [szerepkor, setSzerepkor] = useState<Szerepkor>('attase');
  const [elerhetoseg, setElerhetoseg] = useState<ElerhetosegErtekek>(URES_ELERHETOSEG);
  const [orszagok, setOrszagok] = useState<OrszagErtekek>(URES_ORSZAGOK);
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Új felhasználó"
      leiras="A felhasználó a megadott e-mail címmel és jelszóval tud bejelentkezni."
      gomb="Létrehozás"
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
        <Mezo id="email" cimke="E-mail cím (bejelentkezés)" errors={errors}>
          <Input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="off"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            {...hibaAttr(errors, 'email')}
          />
        </Mezo>
        <Mezo id="jelszo" cimke="Kezdő jelszó" errors={errors}>
          <Input
            id="jelszo"
            name="jelszo"
            type="password"
            required
            minLength={JELSZO_MIN}
            autoComplete="new-password"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            {...hibaAttr(errors, 'jelszo')}
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
        />
      </div>
      <ElerhetosegMezok ertekek={elerhetoseg} onChange={setElerhetoseg} errors={errors} />
      <OrszagMezok
        ertekek={orszagok}
        onChange={setOrszagok}
        errors={errors}
        orszagTagok={orszagTagok}
        sajatId={null}
        rejtett={szerepkor !== 'attase'}
      />
    </MuveletDialog>
  );
}
