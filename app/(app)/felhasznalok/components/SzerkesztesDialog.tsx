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
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { updateFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
import { SzerepkorSelect } from './SzerepkorSelect';
import { useMuveletForm } from './useMuveletForm';

export function SzerkesztesDialog({
  felhasznalo,
  open,
  onOpenChange,
}: {
  felhasznalo: FelhasznaloSor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    updateFelhasznaloAction.bind(null, felhasznalo.id),
    'Felhasználó módosítva.',
    () => onOpenChange(false),
  );
  // Vezérelt mezők: a React 19 a <form action> beküldése után (hibánál is) alaphelyzetbe
  // állítja a nem vezérelt inputokat; a state megőrzi a beírt értékeket.
  const [nev, setNev] = useState(felhasznalo.nev);
  const [szerepkor, setSzerepkor] = useState<Szerepkor>(felhasznalo.szerepkor);
  const [orszag, setOrszag] = useState(felhasznalo.orszag ?? '');
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
          <DialogTitle>Felhasználó szerkesztése</DialogTitle>
          <DialogDescription>{felhasznalo.email}</DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="nev">Név</Label>
            <Input
              id="nev"
              name="nev"
              required
              maxLength={100}
              value={nev}
              onChange={(e) => setNev(e.target.value)}
              {...hibaAttr(errors, 'nev')}
            />
            <MezoHiba id="nev-hiba" uzenet={errors.nev} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
            <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
            <MezoHiba id="szerepkor-hiba" uzenet={errors.szerepkor} />
            {szerepkor === 'admin' && felhasznalo.orszag && (
              <p className="text-xs text-muted-foreground">Adminra váltva az ország törlődik.</p>
            )}
          </div>
          {szerepkor === 'attase' && (
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="orszag">Ország (TéT poszt)</Label>
              <Input
                id="orszag"
                name="orszag"
                required
                maxLength={100}
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
              {pending ? 'Mentés…' : 'Mentés'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
