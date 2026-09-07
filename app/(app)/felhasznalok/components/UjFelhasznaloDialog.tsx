'use client';

import { useActionState, useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
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
import { createFelhasznaloAction, type MuveletState } from '../actions';
import { MezoHiba } from './MezoHiba';
import { SzerepkorSelect } from './SzerepkorSelect';

function UjFelhasznaloForm({ onKesz }: { onKesz: () => void }) {
  const [state, formAction, pending] = useActionState<MuveletState, FormData>(
    createFelhasznaloAction,
    {},
  );
  const [szerepkor, setSzerepkor] = useState<Szerepkor>('attase');
  const errors = state.errors ?? {};

  useEffect(() => {
    if (state.ok) {
      toast.success('Felhasználó létrehozva.');
      onKesz();
    }
  }, [state.ok, onKesz]);

  return (
    <form action={formAction} className="flex flex-col gap-3" noValidate>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="nev">Név</Label>
        <Input id="nev" name="nev" required maxLength={100} autoComplete="off" />
        <MezoHiba uzenet={errors.nev} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="email">E-mail cím</Label>
        <Input id="email" name="email" type="email" required autoComplete="off" />
        <MezoHiba uzenet={errors.email} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="jelszo">Kezdő jelszó</Label>
        <Input id="jelszo" name="jelszo" type="password" required minLength={8} autoComplete="new-password" />
        <MezoHiba uzenet={errors.jelszo} />
      </div>
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="szerepkor">Szerepkör</Label>
        <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} />
        <MezoHiba uzenet={errors.szerepkor} />
      </div>
      {szerepkor === 'attase' && (
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="orszag">Ország (TéT poszt)</Label>
          <Input id="orszag" name="orszag" required maxLength={100} placeholder="pl. Dél-Korea" />
          <MezoHiba uzenet={errors.orszag} />
        </div>
      )}
      <MezoHiba uzenet={errors.form} />
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onKesz} disabled={pending}>
          Mégse
        </Button>
        <Button type="submit" disabled={pending}>
          {pending ? 'Mentés…' : 'Létrehozás'}
        </Button>
      </DialogFooter>
    </form>
  );
}

export function UjFelhasznaloDialog() {
  const [open, setOpen] = useState(false);
  // Stabil referencia: a form useEffect-je [state.ok, onKesz]-re figyel, egy minden
  // rendernél új callback a záró animáció alatt kétszer futtatná (dupla toast).
  const kesz = useCallback(() => setOpen(false), []);
  return (
    <>
      <Button onClick={() => setOpen(true)}>Új felhasználó</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Új felhasználó</DialogTitle>
            <DialogDescription>
              A felhasználó a megadott e-mail címmel és jelszóval tud bejelentkezni.
            </DialogDescription>
          </DialogHeader>
          <UjFelhasznaloForm onKesz={kesz} />
        </DialogContent>
      </Dialog>
    </>
  );
}
