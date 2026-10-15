'use client';

import { useCallback, useState } from 'react';

/**
 * Dialógus nyitás-állapota nyitásonként új kulccsal: a hívó `key={kulcs}`-csal mountolja a dialógust, így a
 * benne lévő űrlap (mezők, hibák) minden nyitáskor tiszta állapotból indul. `kulcs === 0`: még nem nyílt
 * meg – a hívó addig ne is mountolja (soronként egy dialógus-állapot és useActionState spórolható meg).
 */
export function useNyitas() {
  const [open, setOpen] = useState(false);
  const [kulcs, setKulcs] = useState(0);
  const nyit = useCallback(() => {
    setKulcs((n) => n + 1);
    setOpen(true);
  }, []);
  return { open, setOpen, kulcs, nyit };
}
