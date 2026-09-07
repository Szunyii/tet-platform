import Link from 'next/link';
import { HOME_ROUTE } from '../lib/routes';
import { cn } from '../lib/utils';
import { buttonVariants } from './ui/button';

// A gyökér 404-en ez az egyetlen címsor (h1), az AppShellen belül az h1 a fejléc, ezért h2.
export function NotFoundContent({ heading = 'h2' }: { heading?: 'h1' | 'h2' }) {
  const Heading = heading;
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <Heading className="text-lg font-semibold">Az oldal nem található</Heading>
      <p className="max-w-sm text-sm text-muted-foreground">
        A keresett oldal nem létezik, vagy nincs hozzá jogosultságod.
      </p>
      {/* Link + buttonVariants, nem <Button render={<Link/>}>: a Base UI Button natív
          <button>-t vár, <a>-val hibát logol és type="button"-t tesz a linkre. */}
      <Link
        href={HOME_ROUTE}
        // !text… és !no-underline: a régi globális `a { color }` / `a:hover` szabály
        // (globals.css) rétegen kívüli, ezért csak az important utility nyer felette.
        className={cn(buttonVariants(), '!text-primary-foreground hover:!no-underline')}
      >
        Vissza az Országprofilra
      </Link>
    </div>
  );
}
