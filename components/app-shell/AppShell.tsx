'use client';

import { useMemo, useState, type ReactNode } from 'react';
import type { AppSession } from '../../lib/session';
import { AppContext } from './AppContext';
import type { ValasztEvAction } from './CiklusValaszto';
import { Fejlec } from './Fejlec';
import type { LogoutAction } from './LogoutForm';
import { Oldalsav } from './Oldalsav';

/** A védett oldalak kerete: oldalsáv, fejléc, tartalom, és a `useApp()` context. */
export default function AppShell({
  user, logoutAction, valasztEvAction, olvasatlan: szerverOlvasatlan, ev, evek, oldalsavAlja, children,
}: {
  user: AppSession;
  logoutAction: LogoutAction;
  valasztEvAction: ValasztEvAction;
  /** Olvasatlan, nem lezárt ticketek száma a layoutból – a menü-számláló kiindulópontja. */
  olvasatlan: number;
  /** A választott ciklus (év) a layoutból (cookie); nincs kliens-állapot, a szerver a forrás. */
  ev: number;
  /** A ciklusválasztó évei a layoutból, csökkenő; a layout garantálja, hogy `ev` benne van. */
  evek: number[];
  /** Az oldalsáv aljára szánt szerver-renderelt tartalom (OldalsavAllapot), a felhasználói blokk fölé. */
  oldalsavAlja?: ReactNode;
  children: ReactNode;
}) {
  // A számláló állapotban él, mert a /kommunikacio oldal a saját, frissebb értékével
  // felülírja (a layout a megtekintés-jelölés ELŐTT számol). A szerverről érkező új érték
  // viszont nyer: a layout revalidálásakor (revalidatePath) ez a render-közbeni igazítás
  // frissíti az állapotot – ez a React ajánlott „prop változásra állapot igazítása" mintája.
  const [olvasatlan, setOlvasatlan] = useState(szerverOlvasatlan);
  const [elozoSzerver, setElozoSzerver] = useState(szerverOlvasatlan);
  if (elozoSzerver !== szerverOlvasatlan) {
    setElozoSzerver(szerverOlvasatlan);
    setOlvasatlan(szerverOlvasatlan);
  }
  // A context-érték csak tényleges változásnál új objektum: különben minden AppShell-render a
  // useApp() minden fogyasztóját (pl. a teljes térképnézetet) újrarenderelné. A setter stabil.
  const app = useMemo(() => ({ user, ev, olvasatlan, setOlvasatlan }), [user, ev, olvasatlan]);

  return (
    <AppContext.Provider value={app}>
      <div className="flex min-h-screen">
        <Oldalsav user={user} olvasatlan={olvasatlan} oldalsavAlja={oldalsavAlja} logoutAction={logoutAction} />
        <div className="flex min-w-0 flex-1 flex-col">
          <Fejlec szerep={user.role} ev={ev} evek={evek} valasztEvAction={valasztEvAction} />
          <main className="min-w-0 flex-1 px-[26px] pt-5 pb-11">{children}</main>
        </div>
      </div>
    </AppContext.Provider>
  );
}
