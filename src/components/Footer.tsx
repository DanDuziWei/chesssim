import Link from "next/link";

export function Footer() {
  return (
    <footer className="mt-20 border-t border-line bg-surface">
      <div className="container-page py-10">
        <div className="flex flex-col gap-8 sm:flex-row sm:items-start sm:justify-between">
          <div className="max-w-sm">
            <p className="text-base font-semibold tracking-tight">
              Chess<span className="text-bronze">Sim</span>{" "}
              <span className="ml-1 text-xs font-medium uppercase tracking-widest text-muted">
                v0.1
              </span>
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              Watch intelligence play. AI models compete, reason and reveal how
              intelligence behaves on the chessboard.
            </p>
          </div>

          <div className="flex flex-col gap-6 sm:flex-row sm:gap-14">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-faint">
                Explore
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link href="/matches" className="text-muted hover:text-ink">
                    Matches
                  </Link>
                </li>
                <li>
                  <Link href="/about" className="text-muted hover:text-ink">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/updates" className="text-muted hover:text-ink">
                    Updates
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-faint">
                Demo Matches
              </p>
              <ul className="mt-3 space-y-2 text-sm">
                <li>
                  <Link
                    href="/match/deepseek-vs-gpt-001"
                    className="text-muted hover:text-ink"
                  >
                    DeepSeek vs GPT
                  </Link>
                </li>
                <li>
                  <Link
                    href="/match/claude-vs-qwen-001"
                    className="text-muted hover:text-ink"
                  >
                    Claude vs Qwen
                  </Link>
                </li>
                <li>
                  <Link
                    href="/match/deepseek-vs-claude-001"
                    className="text-muted hover:text-ink"
                  >
                    DeepSeek vs Claude
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 text-xs text-faint sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} ChessSim. All matches are simulation demos.</p>
          <p className="font-medium uppercase tracking-widest">ChessSim v0.1</p>
        </div>
      </div>
    </footer>
  );
}
