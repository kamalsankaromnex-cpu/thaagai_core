import Link from "next/link";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 py-16 text-center">
      <span className="font-brand text-6xl font-bold text-thaagai-wine">404</span>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-thaagai-ink dark:text-white sm:text-3xl">
        Page Not Found
      </h1>
      <p className="mt-2 max-w-md text-sm text-thaagai-ink/70 dark:text-thaagai-inkDark/70">
        The piece or page you are looking for is unavailable, has been moved, or does not exist.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href="/"
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md bg-thaagai-wine px-5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-thaagai-wineHover"
        >
          <Home className="h-4 w-4" />
          <span>Back to Home</span>
        </Link>
        <Link
          href="/shop"
          className="flex h-11 min-h-[44px] items-center gap-2 rounded-md border border-thaagai-line bg-white px-5 text-xs font-semibold text-thaagai-ink transition-colors hover:border-thaagai-wine hover:text-thaagai-wine dark:border-thaagai-line/40 dark:bg-thaagai-cardDark dark:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Browse Catalog</span>
        </Link>
      </div>
    </div>
  );
}
