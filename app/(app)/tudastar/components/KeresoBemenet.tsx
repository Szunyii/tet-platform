'use client';

import { useState } from 'react';
import { Input } from '../../../../components/ui/input';
import { KERESES_MAX } from '../../../../lib/tudastar-kereses';

/**
 * A keresőmező vezérelt beviteli eleme. Az oldal kliens-állapota a `?q=` változásakor megmarad (a Next
 * állapot-kulcsában nincs benne a keresési paraméter), ezért a mező a szerverről jövő `q`-hoz render közben
 * igazodik (a „Keresés törlése” és a Vissza gomb után is): `key`-es újracsatolás helyett, mert az a kereséskor
 * fókuszban lévő mezőt kicserélné, és a fókusz a lap elejére esne.
 */
export function KeresoBemenet({ id, q, placeholder }: { id: string; q: string; placeholder: string }) {
  const [ertek, setErtek] = useState(q);
  const [elozoQ, setElozoQ] = useState(q);
  if (elozoQ !== q) {
    setElozoQ(q);
    setErtek(q);
  }
  return (
    <Input
      id={id}
      name="q"
      type="search"
      value={ertek}
      onChange={(e) => setErtek(e.target.value)}
      maxLength={KERESES_MAX}
      placeholder={placeholder}
      className="min-w-0 flex-1"
    />
  );
}
