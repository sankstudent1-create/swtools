import Link from "next/link";

export default function OfflinePage() {
  return (
    <main className="min-h-screen grid place-items-center px-4">
      <section className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/[0.03] p-8 text-center">
        <p className="text-xs uppercase tracking-[0.2em] text-foreground/50">Offline Mode</p>
        <h1 className="mt-3 text-3xl font-bold">You are offline</h1>
        <p className="mt-3 text-foreground/70">
          SW Tools is available in offline mode for cached pages and assets. Reconnect to access fresh updates and uncached routes.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link href="/" className="ui-btn-primary">Go Home</Link>
          <Link href="/tools" className="ui-btn-secondary">Open Tools</Link>
        </div>
      </section>
    </main>
  );
}
