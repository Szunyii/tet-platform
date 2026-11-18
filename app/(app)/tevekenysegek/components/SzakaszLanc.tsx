import type { UgyAdat } from '../../../../lib/tevekenyseg-allapot';
import { SZAKASZOK } from '../../../../lib/tevekenyseg-szotar';
import { cn } from '../../../../lib/utils';

type LancAllapot = 'elert' | 'jelenlegi' | 'kert' | 'hatravan';

const OSZTALY: Record<LancAllapot, string> = {
  elert: 'bg-emerald-100 text-emerald-900',
  jelenlegi: 'bg-emerald-800 font-semibold text-white',
  kert: 'border border-dashed border-amber-700 bg-amber-100 font-semibold text-amber-900',
  hatravan: 'bg-muted text-muted-foreground',
};

const JEL: Record<LancAllapot, string> = { elert: '✓', jelenlegi: '●', kert: '…', hatravan: '' };

const FELOLVASO: Record<LancAllapot, string> = {
  elert: 'elért szakasz',
  jelenlegi: 'jelenlegi szakasz',
  kert: 'igazolásra vár',
  hatravan: 'még nem elért szakasz',
};

function lancAllapot(i: number, jelenlegi: number, kert: number): LancAllapot {
  if (i === kert) return 'kert';
  if (i === jelenlegi) return 'jelenlegi';
  return i < jelenlegi ? 'elert' : 'hatravan';
}

/** Az ügy négy szakasza sorban: az állapotot a szín mellett jel és felolvasó-szöveg is mondja. */
export function SzakaszLanc({ ugy }: { ugy: UgyAdat }) {
  const jelenlegi = SZAKASZOK.findIndex((s) => s.kulcs === ugy.szakasz);
  const kert = SZAKASZOK.findIndex((s) => s.kulcs === ugy.kertSzakasz);
  return (
    <ol aria-label="Az ügy szakaszai" className="grid grid-cols-2 gap-0.5 sm:grid-cols-4">
      {SZAKASZOK.map((s, i) => {
        const allapot = lancAllapot(i, jelenlegi, kert);
        return (
          <li key={s.kulcs} className={cn('rounded-[3px] px-1.5 py-1.5 text-center text-[11.5px]', OSZTALY[allapot])}>
            {JEL[allapot] && (
              <span aria-hidden="true" className="mr-1">
                {JEL[allapot]}
              </span>
            )}
            {s.cimke}
            <span className="sr-only"> ({FELOLVASO[allapot]})</span>
          </li>
        );
      })}
    </ol>
  );
}
