import { tagolSzoveg } from '../../../../lib/tudastar-szoveg';
import { cn } from '../../../../lib/utils';

/** Sima szöveg bekezdésekre (üres sor) és felsorolásokra („- ” kezdetű sor) bontva; HTML-t nem értelmez. */
export function Szoveg({ szoveg, className }: { szoveg: string; className?: string }) {
  return (
    <div className={cn('flex flex-col gap-2 text-sm leading-relaxed', className)}>
      {tagolSzoveg(szoveg).map((b, i) =>
        b.tipus === 'bekezdes' ? (
          <p key={i} className="whitespace-pre-line">
            {b.sorok.join('\n')}
          </p>
        ) : (
          <ul key={i} className="list-disc space-y-1 pl-5">
            {b.elemek.map((e, j) => (
              <li key={j}>{e}</li>
            ))}
          </ul>
        ),
      )}
    </div>
  );
}
