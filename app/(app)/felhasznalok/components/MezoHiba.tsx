export function MezoHiba({ uzenet }: { uzenet?: string }) {
  if (!uzenet) return null;
  return (
    <p role="alert" className="text-xs text-destructive">
      {uzenet}
    </p>
  );
}
