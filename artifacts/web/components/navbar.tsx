"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Radio, Settings, LayoutDashboard } from "lucide-react";

export function NavBar() {
  const pathname = usePathname();
  const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

  const isSettings = pathname === `${base}/settings`;

  return (
    <header className="border-b border-border/60 bg-card/40 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-8 h-8 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center group-hover:bg-primary/20 transition-all group-hover:border-primary/40">
            <Radio className="w-4 h-4 text-primary" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full border-2 border-background" />
          </div>
          <div>
            <span className="font-bold text-sm tracking-widest text-foreground">PINGALERT</span>
          </div>
        </Link>

        <nav className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/60">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              !isSettings
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <LayoutDashboard className="w-3.5 h-3.5" />
            Monitors
          </Link>
          <Link
            href="/settings"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
              isSettings
                ? "bg-primary text-primary-foreground shadow-sm shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
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
