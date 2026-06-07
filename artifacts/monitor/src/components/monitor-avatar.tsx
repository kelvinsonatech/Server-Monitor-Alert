import { cn } from "@/lib/utils";

const BG_COLORS = "b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf,c1f4d4,ffe8a3";

export function avatarUrl(seed: string) {
  return `https://api.dicebear.com/9.x/avataaars/svg?seed=${encodeURIComponent(
    seed
  )}&backgroundColor=${BG_COLORS}&radius=50`;
}

type Status = "up" | "down" | "unknown" | string;

const STATUS_DOT: Record<string, string> = {
  up: "bg-green-500",
  down: "bg-red-500",
  unknown: "bg-gray-500",
};

const RING: Record<string, string> = {
  up: "ring-green-500/40",
  down: "ring-red-500/40",
  unknown: "ring-border",
};

export function MonitorAvatar({
  name,
  size = 48,
  status,
  showStatus = true,
  pulse = false,
  className,
}: {
  name: string;
  size?: number;
  status?: Status;
  showStatus?: boolean;
  pulse?: boolean;
  className?: string;
}) {
  const dotSize = Math.max(8, Math.round(size * 0.28));

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={cn(
          "rounded-full overflow-hidden bg-muted/40 ring-2 ring-offset-1 ring-offset-background transition-colors",
          status ? RING[status] ?? "ring-border" : "ring-border",
          className
        )}
        style={{ width: size, height: size }}
      >
        <img
          src={avatarUrl(name)}
          alt={name}
          width={size}
          height={size}
          className="w-full h-full"
          draggable={false}
        />
      </div>
      {showStatus && status && (
        <div
          className="absolute -bottom-0.5 -right-0.5 flex items-center justify-center"
          style={{ width: dotSize, height: dotSize }}
        >
          {pulse && (status === "up" || status === "down") && (
            <span
              className={cn(
                "absolute inline-flex rounded-full opacity-60 animate-ping",
                status === "up" ? "bg-green-500" : "bg-red-500"
              )}
              style={{ width: dotSize, height: dotSize }}
            />
          )}
          <span
            className={cn(
              "relative inline-flex rounded-full border-2 border-background",
              STATUS_DOT[status] ?? "bg-gray-500"
            )}
            style={{ width: dotSize, height: dotSize }}
          />
        </div>
      )}
    </div>
  );
}
