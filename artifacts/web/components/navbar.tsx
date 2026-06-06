"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity, Settings } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const isSettings = pathname === `${base}/settings`;

  return (
    <header className="border-b border-border bg-card/30 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Activity className="w-4 h-4 text-primary" />
          </div>
          <span className="font-bold text-sm tracking-tight font-mono">PINGALERT</span>
        </Link>

        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-colors ${
              !isSettings ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Monitors
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-mono font-medium transition-colors ${
              isSettings ? "text-foreground bg-accent" : "text-muted-foreground hover:text-foreground hover:bg-accent/50"
            }`}
          >
            <Settings className="w-3.5 h-3.5" />
            Settings
          </Link>
        </nav>
      </div>
    </header>
  );
}
