import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-page flex flex-col items-center py-28 text-center">
      <p className="eyebrow">404</p>
      <h1 className="mt-4 font-display text-5xl font-semibold tracking-tight">
        This game was never played
      </h1>
      <p className="mt-4 max-w-md text-sm leading-relaxed text-muted">
        The match you are looking for does not exist — or it has not been
        simulated yet.
      </p>
      <Link
        href="/matches"
        className="mt-8 rounded-full bg-ink px-6 py-2.5 text-sm font-medium text-paper transition-colors hover:bg-bronze"
      >
        Browse all matches
      </Link>
    </div>
  );
}
