import Link from 'next/link';

/** Morzsamenü; az utolsó (href nélküli) elem az aktuális oldal. */
export function Morzsa({ elemek }: { elemek: readonly { felirat: string; href?: string }[] }) {
  return (
    <nav aria-label="Morzsamenü" className="text-xs text-muted-foreground">
      <ol className="flex flex-wrap items-center gap-1">
        {elemek.map((e, i) => (
          <li key={i} className="flex items-center gap-1">
            {i > 0 && <span aria-hidden>›</span>}
            {e.href ? (
              <Link href={e.href} className="text-muted-foreground hover:text-foreground">
                {e.felirat}
              </Link>
            ) : (
              <span aria-current="page" className="text-foreground">
                {e.felirat}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
