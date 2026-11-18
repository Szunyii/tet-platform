'use client';

import { useState } from 'react';
import { leiroAttr } from '../../../../components/form/MezoHiba';
import { Mezo } from '../../../../components/form/Mezo';
import { MuveletDialog } from '../../../../components/form/MuveletDialog';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Textarea } from '../../../../components/ui/textarea';
import { INDOKLAS_MAX } from '../../../../lib/ertekeles-szotar';

/**
 * Az attasé kihagyása a félévből, kötelező indoklással. A mező vezérelt, mert a React 19 a `<form action>` után
 * alaphelyzetbe állítja az űrlapot, és a hibás beküldés után a szöveg elveszne.
 */
export function KihagyasDialog({
  open,
  onOpenChange,
  nev,
  action,
  onKihagyva,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nev: string;
  action: FormAction;
  onKihagyva: () => void;
}) {
  const [oka, setOka] = useState('');
  const [state, formAction, pending] = useMuveletForm(action, 'Az attasé kimaradt ebből a félévből.', () => {
    onKihagyva();
    onOpenChange(false);
  });
  const errors = state.errors ?? {};
  return (
    <MuveletDialog
      open={open}
      onOpenChange={onOpenChange}
      pending={pending}
      cim="Attasé kihagyása a félévből"
      leiras={`${nev} nem kap fokozatot ebben a félévben, és nem számít bele az összesítésekbe. A már rögzített minősítések megmaradnak, a nem mentett szöveg elvész. A kihagyás visszavonható.`}
      gomb="Kihagyás"
      gombFolyamatban="Kihagyás…"
      formAction={formAction}
      errors={errors}
    >
      <Mezo id="kimaradasOka" cimke="A kihagyás indoklása" errors={errors}>
        <Textarea
          id="kimaradasOka"
          name="kimaradasOka"
          rows={4}
          maxLength={INDOKLAS_MAX}
          value={oka}
          onChange={(e) => setOka(e.target.value)}
          {...leiroAttr(errors, 'kimaradasOka')}
        />
      </Mezo>
    </MuveletDialog>
  );
}
