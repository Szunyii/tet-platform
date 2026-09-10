'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { createFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { AttaseMezok, URES_ATTASE_MEZOK, type AttaseMezoErtekek } from './AttaseMezok';
import { SzerepkorSelect } from './SzerepkorSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';

export function UjFelhasznaloDialog() {
  const [open, setOpen] = useState(false);
  // Minden nyitás új key: a modal (és benne az űrlap állapota) tisztán újraindul.
  const [nyitas, setNyitas] = useState(0);
  return (
    <>
      <Button
        onClick={() => {
          setNyitas((n) => n + 1);
          setOpen(true);
        }}
      >
        Új felhasználó
      </Button>
      <UjFelhasznaloModal key={nyitas} open={open} onOpenChange={setOpen} />
    </>
  );
}

function UjFelhasznaloModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    createFelhasznaloAction,
    'Felhasználó létrehozva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket, és a poszt-adatok
  // is megmaradnak, ha a szerepkör-váltás ideiglenesen elrejti a mezőket.
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [szerepkor, setSzerepkor] = useState<Szerepkor>('attase');
  const [attase, setAttase] = useState<AttaseMezoErtekek>(URES_ATTASE_MEZOK);
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
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="nev">Név</Label>
          <Input
            id="nev"
            name="nev"
            required
            maxLength={100}
            autoComplete="off"
            value={nev}
            onChange={(e) => setNev(e.target.value)}
            {...hibaAttr(errors, 'nev')}
          />
          <MezoHiba mezo="nev" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">E-mail cím (bejelentkezés)</Label>
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
          <MezoHiba mezo="email" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="jelszo">Kezdő jelszó</Label>
          <Input
            id="jelszo"
            name="jelszo"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={jelszo}
            onChange={(e) => setJelszo(e.target.value)}
            {...hibaAttr(errors, 'jelszo')}
          />
          <MezoHiba mezo="jelszo" errors={errors} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
          <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
          <MezoHiba mezo="szerepkor" errors={errors} />
        </div>
      </div>
      <AttaseMezok ertekek={attase} onChange={setAttase} szerepkor={szerepkor} errors={errors} />
    </MuveletDialog>
  );
}
