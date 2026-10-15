'use client';

import { createContext, useContext } from 'react';
import type { AppSession } from '../../lib/session';

export interface AppState {
  user: AppSession;
  /** A fejlécben kiválasztott ciklus (év) – a tet-ev cookie-ból, a layout adja. Váltani a fejléc selectje tud (valasztEvAction). */
  ev: number;
  /** Olvasatlan, nem lezárt ticketek száma – a Kommunikáció menüpont számlálója. */
  olvasatlan: number;
  /** A /kommunikacio oldal írja felül a saját, frissebb számával (OlvasatlanSzinkron). */
  setOlvasatlan: (n: number) => void;
}

export const AppContext = createContext<AppState | null>(null);

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp() csak az AppShell-en belül használható.');
  return ctx;
}
