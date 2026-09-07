import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card';
import { HOME_ROUTE } from '../../lib/routes';
import { getSession } from '../../lib/session';
import LoginForm from './components/LoginForm';

export const metadata: Metadata = { title: 'Bejelentkezés' };

// Nyílt átirányítás elleni védelem. A next paramétert a böngészővel azonos URL-parserrel
// értelmezzük, mert a regex kijátszható (pl. "/<TAB>/evil.com" → "//evil.com"): csak akkor
// fogadjuk el, ha a bázis-originre mutat, és nem a /login maga (önhurok). A visszaadott
// útvonal normalizált (vezérlőkarakterek nélkül), így a Location fejlécbe is biztonságos.
function safeNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v) return HOME_ROUTE;
  let u: URL;
  try {
    u = new URL(v, 'http://n.invalid');
  } catch {
    return HOME_ROUTE;
  }
  if (u.origin !== 'http://n.invalid') return HOME_ROUTE;
  const path = u.pathname + u.search;
  if (path === '/login' || path.startsWith('/login/') || path.startsWith('/login?')) return HOME_ROUTE;
  return path;
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
