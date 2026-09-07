import Link from 'next/link';
import { Button } from './ui/button';

export function NotFoundContent() {
  return (
    <div className="flex flex-col items-center gap-3 text-center">
      <p className="font-mono text-sm text-muted-foreground">404</p>
      <h2 className="text-lg font-semibold">Az oldal nem található</h2>
      <p className="max-w-sm text-sm text-muted-foreground">
        A keresett oldal nem létezik, vagy nincs hozzá jogosultságod.
      </p>
      <Button render={<Link href="/terkep" />}>Vissza az Országprofilra</Button>
    </div>
  );
}
