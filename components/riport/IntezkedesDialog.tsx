'use client';

import { useState } from 'react';
import { INTEZKEDES_MAX } from '../../lib/riport-szotar';
import { hibaAttr, MezoHiba } from '../form/MezoHiba';
import { MuveletDialog } from '../form/MuveletDialog';
import { useMuveletForm, type FormAction } from '../form/useMuveletForm';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';

/**
 * A központ „Megtett intézkedés” szövegének felugró űrlapja. A hívó (IntezkedesSzerkeszto)
 * nyitásonként új `key`-jel mountolja, így a mező mindig a mentett értékből, hiba nélkül indul.
 */
export function IntezkedesDialog({
  targy,
  ertek,
  action,
  open,
  onOpenChange,
}: {
  /** A bejegyzés tárgya, a dialógus leírásába. */
  targy: string;
  /** A most mentett szöveg, vagy `null`. */
  ertek: string | null;
  action: FormAction;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  // Vezérelt mező, hogy hibánál ne ürüljön (React 19 a <form action> után resetel).
  const [szoveg, setSzoveg] = useState(ertek ?? '');
  // Üresen mentve a meglévő intézkedés törlődik: a visszajelzés is ezt mondja.
  const siker = szoveg.trim() || !ertek ? 'Intézkedés mentve.' : 'Intézkedés törölve.';
  const [state, formAction, pending] = useMuveletForm(action, siker, () => onOpenChange(false));
  const errors = state.errors ?? {};

  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Megtett intézkedés"
      leiras={`A(z) „${targy}” jelentéshez. Üresen mentve az intézkedés törlődik.`}
      gomb="Mentés"
      formAction={formAction}
      errors={errors}
      szeles
    >
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="intezkedes">Intézkedés szövege</Label>
        <Textarea
          id="intezkedes"
          name="intezkedes"
          maxLength={INTEZKEDES_MAX}
          rows={6}
          className="max-h-[45dvh] min-h-28 overflow-y-auto"
          value={szoveg}
          onChange={(e) => setSzoveg(e.target.value)}
          {...hibaAttr(errors, 'intezkedes')}
        />
        <p className="text-xs text-muted-foreground">
          {szoveg.length}/{INTEZKEDES_MAX}
        </p>
        <MezoHiba mezo="intezkedes" errors={errors} />
      </div>
    </MuveletDialog>
  );
}
