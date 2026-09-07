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
import { setJelszoAction } from '../actions';
import { hibaAttr, MezoHiba } from './MezoHiba';
import { useMuveletForm } from './useMuveletForm';

export function JelszoDialog({
  felhasznalo,
  sajat,
  open,
  onOpenChange,
}: {
  felhasznalo: FelhasznaloSor;
  sajat: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useMuveletForm(
    setJelszoAction.bind(null, felhasznalo.id),
    'Jelszó beállítva.',
    () => onOpenChange(false),
  );
  // Vezérelt mező, hogy hibánál ne ürüljön (React 19 a <form action> után resetel).
  const [jelszo, setJelszo] = useState('');
  const errors = state.errors ?? {};

  return (
    <Dialog
      open={open}
      onOpenChange={(next, details) => {
        if (!next && pending) {
          details.cancel();
          return;
        }
        onOpenChange(next);
      }}
    >
      <DialogContent showCloseButton={!pending}>
        <DialogHeader>
          <DialogTitle>Jelszó-visszaállítás</DialogTitle>
          <DialogDescription>
            {sajat
              ? 'Új jelszót állítasz be a saját fiókodhoz. A jelenlegi bejelentkezésed megmarad.'
              : `${felhasznalo.nev} új jelszót kap. E-mail nem megy ki, add át neki személyesen. A régi bejelentkezései megszűnnek.`}
          </DialogDescription>
        </DialogHeader>
        <form action={formAction} className="flex flex-col gap-3" noValidate>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="jelszo">Új jelszó</Label>
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
          <MezoHiba id="form-hiba" uzenet={errors.form} alert />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={pending}>
              Mégse
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? 'Mentés…' : 'Jelszó beállítása'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
