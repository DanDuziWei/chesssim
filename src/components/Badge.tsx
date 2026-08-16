import type { Classification, MatchStatus } from "@/lib/types";
import { CLASSIFICATION_META } from "@/lib/classify";

export function ClassificationBadge({
  classification,
  className = "",
}: {
  classification: Classification;
  className?: string;
}) {
  const meta = CLASSIFICATION_META[classification];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold leading-4 ${className}`}
      style={{ backgroundColor: meta.bg, color: meta.fg }}
    >
      {meta.label}
    </span>
  );
}

export function StatusBadge({ status }: { status: MatchStatus }) {
  if (status === "live") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E4F2E9] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#2F7D4F]">
        <span className="relative flex h-1.5 w-1.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#2F7D4F] opacity-60" />
          <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#2F7D4F]" />
        </span>
        Live
      </span>
    );
  }
  return (
    <span className="inline-flex items-center rounded-full bg-[#ECEBE6] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-muted">
      Completed
    </span>
  );
}

export const TAG_LABELS: Record<string, string> = {
  "turning-point": "Turning Point",
  sacrifice: "Sacrifice",
  critical: "Critical",
};

export const TAG_COLORS: Record<string, string> = {
  "turning-point": "#0E8FA6",
  sacrifice: "#6D3FD1",
  critical: "#B02B20",
};

export function TagChip({ tag }: { tag: string }) {
  const label = TAG_LABELS[tag] ?? tag;
  const color = TAG_COLORS[tag] ?? "#6C6458";
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold"
      style={{ backgroundColor: `${color}1A`, color }}
    >
      <span className="h-1 w-1 rounded-full" style={{ backgroundColor: color }} />
      {label}
    </span>
  );
}
