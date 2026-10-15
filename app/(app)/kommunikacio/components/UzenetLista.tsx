'use client';

import { useEffect, useRef, type ReactNode } from 'react';

/**
 * A beszélgetés görgethető üzenetlistája. Új üzenetnél (és ticketváltásnál) a lista aljára görget – csak a
 * listán belül, az oldal görgetési pozícióját nem bántja. Billentyűzettel is fókuszálható, hogy a nyilakkal
 * olvasható legyen. Csak ez a rész kliens-komponens; az üzeneteket a szerver rendereli.
 */
export function UzenetLista({ ticketId, darab, children }: { ticketId: string; darab: number; children: ReactNode }) {
  const lista = useRef<HTMLOListElement>(null);
  useEffect(() => {
    const el = lista.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [ticketId, darab]);
  return (
    <ol
      ref={lista}
      tabIndex={0}
      aria-label="Üzenetek"
      className="flex max-h-[46vh] flex-col gap-3 overflow-auto p-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
    >
      {children}
    </ol>
  );
}
