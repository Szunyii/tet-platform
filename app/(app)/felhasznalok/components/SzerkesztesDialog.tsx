'use client';

import { useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import type { FelhasznaloSor } from '../../../../db/queries/felhasznalo';
import type { Szerepkor } from '../../../../lib/felhasznalo-validacio';
import { updateFelhasznaloAction } from '../actions';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { MuveletDialog } from './MuveletDialog';
import { SzerepkorSelect } from './SzerepkorSelect';
import { useMuveletForm } from '../../../../components/form/useMuveletForm';

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
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Felhasználó szerkesztése"
      leiras={felhasznalo.email}
      gomb="Mentés"
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
        <Label id="szerepkor-label" htmlFor="szerepkor">Szerepkör</Label>
        <SzerepkorSelect value={szerepkor} onChange={setSzerepkor} invalid={Boolean(errors.szerepkor)} />
        <MezoHiba mezo="szerepkor" errors={errors} />
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
            autoComplete="off"
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
