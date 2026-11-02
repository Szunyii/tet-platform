/** A kategória sorszáma négyzetes jelvényben (csempe, címsor, találati csoport). */
export function SzamJelveny({ szam }: { szam: number }) {
  return (
    <span
      aria-hidden
      className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary text-xs font-semibold text-primary-foreground"
    >
      {szam}
    </span>
  );
}
