import { useActionState } from 'react';
import { toast } from 'sonner';
import type { MuveletState } from '../actions';

type FormAction = (prev: MuveletState, formData: FormData) => Promise<MuveletState>;

/**
 * useActionState + siker-toast + záró callback egy helyen. A siker-kezelés az action
 * wrapperben történik, nem useEffect-ben: így pontosan egyszer fut, és nem függ az
 * onKesz referencia-stabilitásától. Visszaad: [state, formAction, pending].
 */
export function useMuveletForm(action: FormAction, siker: string, onKesz: () => void) {
  return useActionState<MuveletState, FormData>(
    async (prev, formData) => {
      const eredmeny = await action(prev, formData);
      if (eredmeny.ok) {
        toast.success(siker);
        onKesz();
      }
      return eredmeny;
    },
    {},
  );
}
