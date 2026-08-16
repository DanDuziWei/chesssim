import type { Agent } from "@/lib/types";

interface AgentAvatarProps {
  agent: Agent;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const sizes = {
  sm: "h-8 w-8 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-lg",
};

export function AgentAvatar({ agent, size = "md", className = "" }: AgentAvatarProps) {
  const accent = agent.accent;
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-lg border font-display font-semibold ${sizes[size]} ${className}`}
      style={{
        backgroundColor: `${accent}14`,
        borderColor: `${accent}40`,
        color: accent,
      }}
      aria-label={agent.name}
    >
      {agent.initials}
    </div>
  );
}
