'use client';

import { useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import { setJelszoAction } from '../actions';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';

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
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Jelszó-visszaállítás"
      leiras={
        sajat
          ? 'Új jelszót állítasz be a saját fiókodhoz. A jelenlegi bejelentkezésed megmarad.'
          : `${felhasznalo.nev} új jelszót kap. E-mail nem megy ki, add át neki személyesen. A régi bejelentkezései megszűnnek.`
      }
      gomb="Jelszó beállítása"
      formAction={formAction}
      errors={errors}
    >
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
        <MezoHiba mezo="jelszo" errors={errors} />
      </div>
    </MuveletDialog>
  );
}
