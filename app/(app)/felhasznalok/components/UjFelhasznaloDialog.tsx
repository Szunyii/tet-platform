'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { createFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
import { MuveletDialog } from './MuveletDialog';
import { SzerepkorSelect } from './SzerepkorSelect';
import { useMuveletForm } from './useMuveletForm';

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
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket, és az ország is
  // megmarad, ha a szerepkör-váltás ideiglenesen elrejti a mezőt.
  const [nev, setNev] = useState('');
  const [email, setEmail] = useState('');
  const [jelszo, setJelszo] = useState('');
  const [szerepkor, setSzerepkor] = useState<Szerepkor>('attase');
  const [orszag, setOrszag] = useState('');
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
    >
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
        <Label htmlFor="email">E-mail cím</Label>
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
      {szerepkor === 'attase' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orszag">Ország (TéT poszt)</Label>
          <Input
            id="orszag"
            name="orszag"
            required
            maxLength={100}
            autoComplete="off"
            placeholder="pl. Dél-Korea"
            value={orszag}
            onChange={(e) => setOrszag(e.target.value)}
            {...hibaAttr(errors, 'orszag')}
          />
          <MezoHiba mezo="orszag" errors={errors} />
        </div>
      )}
    </MuveletDialog>
  );
}
