import { useLocation, Link } from "wouter";
import { Activity, LayoutDashboard, Settings, Bell, ChevronRight, Menu, X, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useGetStats, useListMonitors, getGetStatsQueryKey, getListMonitorsQueryKey } from "@workspace/api-client-react";

interface LayoutProps {
  children: React.ReactNode;
}

function StatusDot({ color }: { color: "green" | "red" | "gray" }) {
  const map = { green: "bg-green-500", red: "bg-red-500", gray: "bg-gray-500" };
  return <span className={`inline-block w-2 h-2 rounded-full ${map[color]}`} />;
}

export function Layout({ children }: LayoutProps) {
  const [location] = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const { data: stats } = useGetStats({
    query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 },
  });
  const { data: monitors } = useListMonitors({
    query: { queryKey: getListMonitorsQueryKey(), refetchInterval: 30000 },
  });

  const navItems = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/settings", label: "Settings", icon: Settings },
  ];

  const isActive = (href: string) =>
    href === "/" ? location === "/" : location.startsWith(href);

  const breadcrumbs = (() => {
    if (location === "/") return [{ label: "Dashboard" }];
    if (location === "/settings") return [{ label: "Dashboard", href: "/" }, { label: "Settings" }];
    if (location.startsWith("/monitors/new")) return [{ label: "Dashboard", href: "/" }, { label: "Add Monitor" }];
    if (location.startsWith("/monitors/")) {
      const monitor = monitors?.find((m) => String(m.id) === location.split("/")[2]);
      return [{ label: "Dashboard", href: "/" }, { label: monitor?.name ?? "Monitor" }];
    }
    return [{ label: "Dashboard", href: "/" }];
  })();

  const allUp = stats && stats.downCount === 0 && stats.totalMonitors > 0;
  const anyDown = stats && stats.downCount > 0;

  const SidebarContent = () => (
    <>
      {/* Logo */}
      <div className="px-4 py-3.5 flex items-center gap-2.5 border-b border-border/60">
        <div className="relative w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_16px_rgba(59,130,246,0.4)]">
          <Activity className="w-4 h-4 text-primary-foreground" />
          {anyDown && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-background animate-pulse" />
          )}
        </div>
        <div className="leading-tight">
          <span className="font-mono font-bold text-base tracking-tight">PING<span className="text-primary">ALERT</span></span>
          <p className="text-[9px] text-muted-foreground font-mono tracking-wider">SERVER MONITOR</p>
        </div>
      </div>

      {/* Overall status banner */}
      {stats && stats.totalMonitors > 0 && (
        <div className={cn(
          "mx-3 mt-3 rounded-md px-2.5 py-2 flex items-center gap-2.5 text-xs font-mono",
          allUp
            ? "bg-green-500/10 border border-green-500/20 text-green-400"
            : "bg-red-500/10 border border-red-500/20 text-red-400"
        )}>
          <div className="relative flex items-center">
            <span className={cn(
              "absolute inline-flex h-2.5 w-2.5 rounded-full opacity-75 animate-ping",
              allUp ? "bg-green-500" : "bg-red-500"
            )} />
            <span className={cn("relative inline-flex h-2.5 w-2.5 rounded-full", allUp ? "bg-green-500" : "bg-red-500")} />
          </div>
          {allUp ? "All systems operational" : `${stats.downCount} server${stats.downCount > 1 ? "s" : ""} offline`}
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-3 flex flex-col gap-0.5">
        <p className="text-[9px] font-mono text-muted-foreground/50 px-2.5 mb-1.5 uppercase tracking-widest">Navigation</p>
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}>
              <div className={cn(
                "flex items-center gap-2.5 px-2.5 py-1.5 rounded-md text-[13px] font-medium transition-all cursor-pointer group",
                active
                  ? "bg-primary/15 text-primary border border-primary/20"
                  : "text-muted-foreground hover:bg-muted/80 hover:text-foreground"
              )}>
                <item.icon className={cn("w-4 h-4 transition-transform group-hover:scale-110", active && "text-primary")} />
                {item.label}
                {active && <ChevronRight className="w-3 h-3 ml-auto text-primary/60" />}
              </div>
            </Link>
          );
        })}

        {/* Monitor list in sidebar */}
        {monitors && monitors.length > 0 && (
          <div className="mt-3">
            <p className="text-[9px] font-mono text-muted-foreground/50 px-2.5 mb-1.5 uppercase tracking-widest">Monitors</p>
            <div className="flex flex-col gap-0.5">
              {monitors.map((m) => (
                <Link key={m.id} href={`/monitors/${m.id}`} onClick={() => setMobileOpen(false)}>
                  <div className={cn(
                    "flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs cursor-pointer transition-all group",
                    location === `/monitors/${m.id}`
                      ? "bg-muted text-foreground"
                      : "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  )}>
                    <StatusDot color={m.status === "up" ? "green" : m.status === "down" ? "red" : "gray"} />
                    <span className="truncate font-medium">{m.name}</span>
                    {m.lastResponseMs != null && (
                      <span className="ml-auto font-mono text-[10px] text-muted-foreground/60 shrink-0">{m.lastResponseMs}ms</span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-border/60">
        <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-md bg-muted/40">
          <Shield className="w-3.5 h-3.5 text-muted-foreground/60" />
          <div className="leading-tight">
            <p className="text-[10px] font-mono text-muted-foreground/80">PingAlert v1.0</p>
            <p className="text-[9px] text-muted-foreground/50">Auto-refresh every 30s</p>
          </div>
          <div className="ml-auto">
            <Bell className="w-3.5 h-3.5 text-primary/60" />
          </div>
        </div>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-background text-foreground dark">
      {/* Mobile header */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-card/80 backdrop-blur sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center">
            <Activity className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-mono font-bold tracking-tight">PING<span className="text-primary">ALERT</span></span>
        </div>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="p-2 rounded-lg hover:bg-muted transition-colors"
        >
          {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {/* Mobile drawer overlay */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-background/95 backdrop-blur flex flex-col" style={{ top: "53px" }}>
          <SidebarContent />
        </div>
      )}

      <div className="flex">
        {/* Desktop sidebar */}
        <aside className="hidden md:flex w-52 min-h-screen border-r border-border bg-card/40 flex-col sticky top-0 self-start">
          <SidebarContent />
        </aside>

        {/* Main content */}
        <main className="flex-1 min-w-0">
          {/* Top bar with breadcrumbs */}
          <div className="hidden md:flex items-center gap-2 px-6 py-3 border-b border-border/60 bg-background/60 backdrop-blur sticky top-0 z-10">
            {breadcrumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-2 text-sm">
                {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />}
                {crumb.href ? (
                  <Link href={crumb.href}>
                    <span className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">{crumb.label}</span>
                  </Link>
                ) : (
                  <span className="text-foreground font-medium">{crumb.label}</span>
                )}
              </span>
            ))}

            {/* Live indicator */}
            <div className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground font-mono">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-green-500" />
              </span>
              LIVE
            </div>
          </div>

          <div className="max-w-6xl mx-auto p-6 md:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
