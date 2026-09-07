'use client';

import { useState } from 'react';
import { Button } from '../../../../components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../../components/ui/dialog';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { createFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
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
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        // Beküldés közben nem zárható (Esc, háttér, X), különben az eredmény elveszne.
        if (!next && pending) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Új felhasználó</DialogTitle>
          <DialogDescription>
            A felhasználó a megadott e-mail címmel és jelszóval tud bejelentkezni.
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
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
            <MezoHiba id="nev-hiba" uzenet={errors.nev} />
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
            <MezoHiba id="email-hiba" uzenet={errors.email} />
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
            <MezoHiba id="jelszo-hiba" uzenet={errors.jelszo} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
            <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
            <MezoHiba id="szerepkor-hiba" uzenet={errors.szerepkor} />
          </div>
          {szerepkor === 'attase' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orszag">Ország (TéT poszt)</Label>
              <Input
                id="orszag"
                name="orszag"
                required
                maxLength={100}
                placeholder="pl. Dél-Korea"
                value={orszag}
                onChange={(e) => setOrszag(e.target.value)}
                {...hibaAttr(errors, 'orszag')}
              />
              <MezoHiba id="orszag-hiba" uzenet={errors.orszag} />
            </div>
          )}
          <MezoHiba id="form-hiba" uzenet={errors.form} alert />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Mégse
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Létrehozás'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
