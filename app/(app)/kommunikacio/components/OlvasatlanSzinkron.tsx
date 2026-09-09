'use client';

import { useEffect } from 'react';
import { useApp } from '../../../../components/AppShell';

/**
 * A menü olvasatlan-számlálóját szinkronban tartja az oldallal. A page a megtekintés
 * olvasottnak jelölése UTÁN számol, a layout viszont előtte; kliens-oldali navigációnál
 * ráadásul a layout nem is fut újra. Ez a komponens nem renderel semmit, csak beírja az
 * oldal frissebb számát az AppShell állapotába.
 */
export function OlvasatlanSzinkron({ ertek }: { ertek: number }) {
  const { setOlvasatlan } = useApp();
  useEffect(() => {
    setOlvasatlan(ertek);
  }, [ertek, setOlvasatlan]);
  return null;
}
