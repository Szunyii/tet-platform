'use client';

import { useActionState } from 'react';

/**
 * A kijelentkezés szerződése. A megosztott komponens nem importál route-fájlból: az
 * `app/(app)/actions.ts` `logoutAction`-je (LogoutState) strukturálisan felel meg neki.
 */
export type LogoutAction = (prev: { error?: string }) => Promise<{ error?: string }>;

export function LogoutForm({ action }: { action: LogoutAction }) {
  const [state, formAction, pending] = useActionState(action, {});
  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      {state.error && (
        <span role="alert" className="basis-full text-[11px] text-sidebar-hiba">
          {state.error}
        </span>
      )}
      {/* A .btn betűmérete (11,5 px) a régi inline értékkel azonos. */}
      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? 'Kijelentkezés…' : 'Kijelentkezés'}
      </button>
    </form>
  );
}
