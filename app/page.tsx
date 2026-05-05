import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-4xl flex-col items-center justify-center gap-8 py-20 px-6 bg-white dark:bg-black sm:items-start">
        <div className="flex flex-col gap-3 text-center sm:text-left">
          <h1 className="text-4xl font-extrabold tracking-tight text-black dark:text-zinc-50">
            MandiLink
          </h1>
          <p className="text-xl leading-8 text-zinc-700 dark:text-zinc-200">
            High-visibility grocery inventory dashboard with quick billing.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <Link
            href="/inventory"
            className="inline-flex items-center justify-center rounded-xl bg-emerald-700 px-6 py-4 text-xl font-bold text-white hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-400/40 w-full sm:w-auto"
          >
            Open Inventory Dashboard
          </Link>
          <a
            href="/manifest.json"
            className="inline-flex items-center justify-center rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-950 px-6 py-4 text-xl font-bold text-zinc-900 dark:text-white hover:bg-zinc-100 dark:hover:bg-zinc-900 focus:outline-none focus:ring-4 focus:ring-emerald-400/30 w-full sm:w-auto"
          >
            App Info (PWA)
          </a>
        </div>

        <div className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 p-5">
          <p className="text-lg text-zinc-800 dark:text-zinc-200">
            Tip: Add this app to your home screen for a full-screen experience.
          </p>
        </div>
      </main>
    </div>
  );
}
