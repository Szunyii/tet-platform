import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../../components/ui/card';

/** A szerkesztő egy blokkja: kártya címmel (2-es szint – az oldalon a fejléc h1-je fölötte az egyetlen címsor), opcionális leírással. */
export function UrlapBlokk({ cim, leiras, children }: { cim: string; leiras?: string; children: ReactNode }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle role="heading" aria-level={2}>
          {cim}
        </CardTitle>
        {leiras && <CardDescription>{leiras}</CardDescription>}
      </CardHeader>
      <CardContent className="flex flex-col gap-4">{children}</CardContent>
    </Card>
  );
}
