import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { biztonsagosNext } from '../../lib/routes';
import { getSession } from '../../lib/session';
import LoginForm from './components/LoginForm';

export const metadata: Metadata = { title: 'Bejelentkezés' };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = biztonsagosNext((await searchParams).next);
  // Érvényes sessionnel nincs mit keresni itt. Ezt a valódi session dönti el, nem a
  // cookie megléte (lásd proxy.ts kommentjét az elavult cookie-hurokról).
  if (await getSession()) redirect(next);
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>
            <h1 className="text-base font-medium">NIÜ · TéT Platform</h1>
          </CardTitle>
          <CardDescription>Bejelentkezés a belső munkakörnyezetbe</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </main>
  );
}
