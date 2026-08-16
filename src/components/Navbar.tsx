import Link from "next/link";

const links = [
  { href: "/matches", label: "Matches" },
  { href: "/about", label: "About" },
  { href: "/updates", label: "Updates" },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/85 backdrop-blur-md">
      <nav className="container-page flex h-14 items-center justify-between">
        <Link href="/" className="group flex items-baseline gap-0.5">
          <span className="text-lg font-semibold tracking-tight">
            Chess<span className="text-bronze transition-colors group-hover:text-ink">Sim</span>
          </span>
          <span className="ml-2 hidden rounded-full border border-line bg-surface px-2 py-0.5 text-[10px] font-medium uppercase tracking-widest text-muted sm:inline-block">
            v0.1
          </span>
        </Link>

        <div className="flex items-center gap-1 sm:gap-2">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="rounded-md px-3 py-1.5 text-sm font-medium text-muted transition-colors hover:bg-line/60 hover:text-ink"
            >
              {l.label}
            </Link>
          ))}
          <Link
            href="/matches"
            className="ml-1 rounded-md bg-ink px-3.5 py-1.5 text-sm font-medium text-paper transition-colors hover:bg-bronze"
          >
            Watch
          </Link>
        </div>
      </nav>
    </header>
  );
}
