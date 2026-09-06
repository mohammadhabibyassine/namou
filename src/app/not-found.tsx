import Link from "next/link";

export default function NotFound() {
  return (
    <main className="technical-grid grid min-h-screen place-items-center p-6 text-center">
      <div className="max-w-3xl">
        <div className="border-line mx-auto grid size-40 place-items-center rounded-full border border-dashed">
          <span className="display-title text-8xl">404</span>
        </div>
        <p className="text-subtle mt-7 font-mono text-[10px] uppercase">
          Error / Object moved
        </p>
        <h1 className="display-title mt-4 text-7xl sm:text-9xl">
          That page moved.
        </h1>
        <p className="text-subtle mx-auto mt-4 max-w-md text-sm leading-6">
          The route you followed is no longer part of this system.
        </p>
        <Link
          href="/"
          className="bg-acid text-ink mt-8 inline-flex rounded-lg px-5 py-3 font-mono text-[10px] uppercase"
        >
          Re-enter system →
        </Link>
      </div>
    </main>
  );
}
