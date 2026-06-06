import { cn } from "@/lib/utils";

interface StatusBadgeProps {
  status: "up" | "down" | "unknown";
  className?: string;
  withText?: boolean;
}

export function StatusBadge({ status, className, withText = true }: StatusBadgeProps) {
  const isUp = status === "up";
  const isDown = status === "down";
  const isUnknown = status === "unknown";

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative flex items-center justify-center">
        {/* Pulse effect */}
        {(isUp || isDown) && (
          <div
            className={cn(
              "absolute inset-0 rounded-full animate-ping opacity-75",
              isUp && "bg-green-500",
              isDown && "bg-red-500"
            )}
            style={{ animationDuration: "2s" }}
          />
        )}
        
        {/* Core dot */}
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full z-10",
            isUp && "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]",
            isDown && "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]",
            isUnknown && "bg-gray-500"
          )}
        />
      </div>
      
      {withText && (
        <span className={cn(
          "text-xs font-mono font-medium uppercase tracking-wider",
          isUp && "text-green-500",
          isDown && "text-red-500",
          isUnknown && "text-gray-500"
        )}>
          {status}
        </span>
      )}
    </div>
  );
}
