import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { getSession } from '../../lib/session';
import LoginForm from './components/LoginForm';

// Csak relatív, egy perjellel kezdődő útvonalat fogadunk el (nyílt átirányítás ellen):
// nem "//" és nem "/\" (a böngészők a backslash-t perjelre normalizálják), és nem a
// /login maga (önhurok).
function safeNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (v && /^\/(?![/\\])/.test(v) && !v.startsWith('/login')) return v;
  return '/terkep';
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const next = safeNext((await searchParams).next);
  // Érvényes sessionnel nincs mit keresni itt. Ezt a valódi session dönti el, nem a
  // cookie megléte (lásd proxy.ts kommentjét az elavult cookie-hurokról).
  if (await getSession()) redirect(next);
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>NIÜ · TéT Platform</CardTitle>
          <CardDescription>Bejelentkezés a belső munkakörnyezetbe</CardDescription>
        </CardHeader>
        <CardContent>
          <LoginForm next={next} />
        </CardContent>
      </Card>
    </main>
  );
}
