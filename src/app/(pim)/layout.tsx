import Link from "next/link";

/** Shared chrome for the PIM admin area; public DPP pages don't use it */
export default function PimLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <header className="border-b border-stone-200 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-bold text-white">
              DP
            </span>
            <span className="text-lg font-semibold tracking-tight">
              DPP PIM
            </span>
          </Link>
          <nav className="flex items-center gap-4 text-sm">
            <Link
              href="/"
              className="text-stone-600 transition hover:text-stone-900"
            >
              Products
            </Link>
            <Link
              href="/products/new"
              className="rounded-lg bg-emerald-600 px-3 py-1.5 font-medium text-white transition hover:bg-emerald-700"
            >
              + New Product
            </Link>
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </>
  );
}
