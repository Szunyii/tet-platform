'use client';

import { useState } from 'react';
import { hibaAttr, MezoHiba } from '../../../../components/form/MezoHiba';
import { useMuveletForm, type FormAction } from '../../../../components/form/useMuveletForm';
import { Button } from '../../../../components/ui/button';
import { Label } from '../../../../components/ui/label';
import { Textarea } from '../../../../components/ui/textarea';
import { UZENET_MAX } from '../../../../lib/ticket-szotar';

/**
 * Válasz-mező. Vezérelt textarea: a React 19 a <form action> után reseteli a nem vezérelt
 * mezőket, hibánál viszont meg kell maradnia a szövegnek; sikernél mi ürítjük (onKesz).
 * Ctrl/Cmd+Enter beküld.
 */
export function UzenetUrlap({ action, kuldoNev }: { action: FormAction; kuldoNev: string }) {
  const [szoveg, setSzoveg] = useState('');
  const [state, formAction, pending] = useMuveletForm(action, undefined, () => setSzoveg(''));
  const errors = state.errors ?? {};
  return (
    <form action={formAction} className="flex flex-col gap-2 border-t bg-muted/30 p-3" noValidate>
      <Label htmlFor="valasz" className="sr-only">
        Válasz
      </Label>
      <Textarea
        id="valasz"
        name="valasz"
        value={szoveg}
        onChange={(e) => setSzoveg(e.target.value)}
        onKeyDown={(e) => {
          // IME-alatt (pl. japán/kínai bevitel) az Enter a jelöltet erősíti meg, nem küld.
          if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && !pending && !e.nativeEvent.isComposing) {
            e.preventDefault();
            e.currentTarget.form?.requestSubmit();
          }
        }}
        maxLength={UZENET_MAX}
        rows={3}
        placeholder="Válasz írása… (Ctrl+Enter a küldéshez)"
        className="bg-background"
        {...hibaAttr(errors, 'valasz')}
      />
      <MezoHiba mezo="valasz" errors={errors} />
      <MezoHiba mezo="form" errors={errors} alert />
      <div className="flex items-center gap-2">
        <span className="text-xs text-muted-foreground">Válaszol: {kuldoNev}</span>
        <Button type="submit" size="sm" className="ml-auto" disabled={pending}>
          {pending ? 'Küldés…' : 'Küldés'}
        </Button>
      </div>
    </form>
  );
}
