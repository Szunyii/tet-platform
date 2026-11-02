import { ArrowUpRightIcon } from 'lucide-react';
import type { ReactNode } from 'react';
import type { HasznosLink } from '../../../../lib/tudastar-szotar';
import { cn } from '../../../../lib/utils';

/**
 * Külső hivatkozás új lapon (`noopener noreferrer`), ↗ jellel és a felolvasónak szóló jelzéssel. Csak
 * http(s) címből lesz link: a validátor mást nem enged be, de a kézzel módosított DB-sor se adhasson
 * `javascript:` hrefet – ilyenkor a felirat sima szövegként jelenik meg.
 */
export function KulsoLink({ href, children, className }: { href: string; children: ReactNode; className?: string }) {
  if (!/^https?:\/\//i.test(href)) return <span className={className}>{children}</span>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={cn('inline-flex items-baseline gap-0.5', className)}>
      {children}
      <ArrowUpRightIcon aria-hidden className="size-3 shrink-0 self-center" />
      <span className="sr-only"> (új lapon nyílik)</span>
    </a>
  );
}

/** Hasznos linkek egy sorban, tördelve. */
export function LinkLista({ linkek }: { linkek: readonly HasznosLink[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
      {linkek.map((l, i) => (
        <li key={i}>
          <KulsoLink href={l.url}>{l.felirat}</KulsoLink>
        </li>
      ))}
    </ul>
  );
}

/** Név (linkként, ha van webcím) + rövid leírás soronként: a listakártya sorai és az intézmény programjai. */
export function TetelLista({ sorok }: { sorok: readonly { nev: string; url: string; leiras: string }[] }) {
  return (
    <ul className="divide-y divide-input rounded-lg border border-input">
      {sorok.map((s, i) => (
        <li key={i} className="flex flex-col gap-0.5 px-3 py-2 text-sm sm:flex-row sm:items-baseline sm:gap-3">
          <span className="font-medium sm:w-2/5 sm:shrink-0">{s.url ? <KulsoLink href={s.url}>{s.nev}</KulsoLink> : s.nev}</span>
          {s.leiras && <span className="text-muted-foreground">{s.leiras}</span>}
        </li>
      ))}
    </ul>
  );
}
