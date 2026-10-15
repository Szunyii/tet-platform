'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { szekhelyKod } from '../../lib/attase-orszag';
import { menuAktiv, menupontok } from '../../lib/navigacio';
import { monogram } from '../../lib/nev';
import { orszagNev } from '../../lib/orszagok';
import type { AppSession } from '../../lib/session';
import { cn } from '../../lib/utils';
import { LogoutForm, type LogoutAction } from './LogoutForm';

/** Attasé: a székhely országa, további (régiós) országoknál „+N" (nem törő szóközzel: a „+N" ne törjön egyedül új sorba). */
function szerepFelirat(user: AppSession): string {
  if (user.role === 'admin') return 'NIÜ admin';
  const szekhely = szekhelyKod(user.orszagok);
  const tovabbi = user.orszagok.length - (szekhely ? 1 : 0);
  return `TéT attasé${szekhely ? ' · ' + orszagNev(szekhely) : ''}${tovabbi > 0 ? ` +${tovabbi}` : ''}`;
}

/**
 * A sötét oldalsáv: márka, menü (az olvasatlan-számlálóval), az `oldalsavAlja` slot (OldalsavAllapot),
 * a felhasználói blokk és a kijelentkezés. `overflow-y-auto`: alacsony ablaknál is elérhető marad a
 * Kijelentkezés. A színek a `--sidebar*` tokenekből jönnek (app/globals.css).
 */
export function Oldalsav({ user, olvasatlan, oldalsavAlja, logoutAction }: {
  user: AppSession;
  olvasatlan: number;
  oldalsavAlja?: ReactNode;
  logoutAction: LogoutAction;
}) {
  const pathname = usePathname();
  return (
    <aside className="sticky top-0 flex h-screen w-[238px] flex-[0_0_238px] flex-col overflow-y-auto bg-sidebar text-sidebar-foreground">
      <div className="border-b border-b-sidebar-border px-[18px] pt-[18px] pb-4">
        <div className="text-[13.5px] font-bold tracking-[.02em]">NIÜ · TéT Platform</div>
        <div className="mt-[3px] text-[11px] text-sidebar-halvany">Belső munkakörnyezet</div>
      </div>
      <nav className="flex flex-col gap-0.5 px-2.5 py-3">
        {menupontok(user.role).map((u) => {
          const on = menuAktiv(pathname, u);
          return (
            <Link
              key={u.href}
              href={u.href}
              aria-current={on ? 'page' : undefined}
              className={cn(
                'flex items-center gap-2.5 rounded-[5px] px-[11px] py-[9px] text-[12.5px] font-medium no-underline',
                on ? 'bg-sidebar-accent text-sidebar-accent-foreground' : 'text-sidebar-menu',
              )}
            >
              <span className="w-4 text-center text-[13px]">{u.menu.ikon}</span>
              {u.menu.felirat}
              {u.href === '/kommunikacio' && olvasatlan > 0 && (
                <>
                  <span aria-hidden className="ml-auto rounded-[9px] bg-sidebar-szamlalo px-1.5 py-px text-[10px] font-semibold text-white">
                    {olvasatlan}
                  </span>
                  <span className="sr-only">{olvasatlan} olvasatlan ticket</span>
                </>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto">
        {oldalsavAlja}
        <div className="border-t border-t-sidebar-border px-[18px] py-3.5">
          <div className="flex items-center gap-[9px]">
            <div
              aria-hidden
              className="flex size-[29px] flex-[0_0_29px] items-center justify-center rounded-[50%] bg-sidebar-primary text-[11px] font-semibold text-sidebar-primary-foreground"
            >
              {monogram(user.name)}
            </div>
            <div className="min-w-0 leading-[1.25]">
              <div className="truncate text-[12px] font-semibold text-sidebar-foreground">{user.name}</div>
              <div className="text-[10.5px] text-sidebar-halvany">{szerepFelirat(user)}</div>
            </div>
          </div>
          <div className="mt-2.5">
            <LogoutForm action={logoutAction} />
          </div>
        </div>
      </div>
    </aside>
  );
}
