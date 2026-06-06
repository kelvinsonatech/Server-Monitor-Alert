"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { ClientDate } from "@/components/client-date";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus, Activity, ArrowUpRight, ArrowDownRight, HelpCircle,
  Clock, Globe, Zap, Radio, TrendingUp,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function fetchStats() {
  const res = await fetch(`${base}/api/stats`);
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

async function fetchMonitors() {
  const res = await fetch(`${base}/api/monitors`);
  if (!res.ok) throw new Error("Failed to fetch monitors");
  return res.json();
}

async function createMonitor(data: { name: string; url: string; intervalMinutes: number }) {
  const res = await fetch(`${base}/api/monitors`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create monitor");
  return res.json();
}

function AddMonitorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");
  const [interval, setInterval] = useState("5");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: createMonitor,
    onSuccess: (data) => {
      toast({ title: "Monitor added", description: `${data.name} is now being tracked.` });
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      onOpenChange(false);
      setName(""); setUrl("https://"); setInterval("5");
    },
    onError: () => toast({ title: "Failed to create monitor", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intervalNum = parseInt(interval, 10);
    if (!name.trim() || !url.trim() || isNaN(intervalNum) || intervalNum < 1) {
      toast({ title: "Invalid input", description: "All fields are required.", variant: "destructive" });
      return;
    }
    mutation.mutate({ name: name.trim(), url: url.trim(), intervalMinutes: intervalNum });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg border-border/80 bg-card">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            Add New Monitor
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          <div className="space-y-2">
            <Label htmlFor="mon-name" className="text-sm font-medium">Monitor Name</Label>
            <Input
              id="mon-name"
              placeholder="e.g. Production API"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background/80 border-border/80 h-10"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mon-url" className="text-sm font-medium">URL to Monitor</Label>
            <Input
              id="mon-url"
              placeholder="https://example.com/health"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm bg-background/80 border-border/80 h-10"
            />
            <p className="text-xs text-muted-foreground">Works with self-signed HTTPS certificates.</p>
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium">Check Interval</Label>
            <div className="flex gap-2">
              {[1, 5, 10, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setInterval(String(m))}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-all ${
                    interval === String(m)
                      ? "bg-primary/10 text-primary border-primary/40 shadow-sm"
                      : "bg-background/60 border-border/60 text-muted-foreground hover:border-border hover:text-foreground"
                  }`}
                >
                  {m}m
                </button>
              ))}
              <Input
                type="number"
                min={1}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="font-mono text-sm bg-background/80 border-border/80 w-20 h-10"
                placeholder="—"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1 border-border/70" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending}>
              {mutation.isPending ? "Adding…" : "Add Monitor"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function UptimeBar({ pct }: { pct: number }) {
  const color = pct === 100 ? "bg-green-500" : pct >= 90 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="w-full h-1 bg-muted/60 rounded-full overflow-hidden mt-3">
      <div className={`h-full rounded-full transition-all ${color}`} style={{ width: `${pct}%` }} />
    </div>
  );
}

function MonitorCard({ monitor }: { monitor: any }) {
  const isUp = monitor.status === "up";
  const isDown = monitor.status === "down";
  const uptime = monitor.uptimePct != null ? Number(monitor.uptimePct).toFixed(1) : null;

  return (
    <Link href={`/monitors/${monitor.id}`} className="block group">
      <div className={`relative rounded-xl border p-5 transition-all duration-200 hover:shadow-lg hover:shadow-black/20 hover:-translate-y-0.5 ${
        isDown
          ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50 hover:bg-red-500/8"
          : isUp
          ? "border-border/60 bg-card hover:border-border hover:bg-card/80"
          : "border-border/40 bg-card/60 hover:border-border/70"
      }`}>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2.5 mb-1">
              <div className="relative flex-shrink-0">
                {(isUp || isDown) && (
                  <span className={`absolute inset-0 rounded-full animate-ping opacity-60 ${isUp ? "bg-green-500" : "bg-red-500"}`} />
                )}
                <span className={`relative block w-2.5 h-2.5 rounded-full ${isUp ? "bg-green-500" : isDown ? "bg-red-500" : "bg-muted-foreground/50"}`} />
              </div>
              <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">{monitor.name}</h3>
            </div>
            <p className="text-xs text-muted-foreground font-mono truncate flex items-center gap-1.5 ml-5">
              <Globe className="w-3 h-3 shrink-0" />{monitor.url}
            </p>
          </div>
          <span className={`shrink-0 text-xs font-bold tracking-widest px-2 py-0.5 rounded-md border ${
            isUp ? "text-green-400 border-green-500/30 bg-green-500/8"
            : isDown ? "text-red-400 border-red-500/30 bg-red-500/8"
            : "text-muted-foreground border-border/50 bg-muted/30"
          }`}>
            {monitor.status.toUpperCase()}
          </span>
        </div>

        <div className="mt-4 flex items-center gap-4 text-xs text-muted-foreground font-mono">
          <span className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-primary/60" />
            {monitor.lastResponseMs != null ? `${monitor.lastResponseMs}ms` : "—"}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <ClientDate value={monitor.lastCheckedAt} />
          </span>
          <span className="flex items-center gap-1.5 ml-auto">
            <Activity className="w-3.5 h-3.5" />
            every {monitor.intervalMinutes}m
          </span>
        </div>

        {uptime !== null && (
          <div className="mt-2">
            <div className="flex justify-between items-center text-[10px] text-muted-foreground font-mono mb-1">
              <span>UPTIME</span>
              <span className={Number(uptime) === 100 ? "text-green-400" : Number(uptime) >= 90 ? "text-yellow-400" : "text-red-400"}>{uptime}%</span>
            </div>
            <UptimeBar pct={Number(uptime)} />
          </div>
        )}
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [mounted, setMounted] = useState(false);
  const [addOpen, setAddOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["stats"],
    queryFn: fetchStats,
    enabled: mounted,
    refetchInterval: 30000,
  });

  const { data: monitors, isLoading: monitorsLoading } = useQuery({
    queryKey: ["monitors"],
    queryFn: fetchMonitors,
    enabled: mounted,
    refetchInterval: 30000,
  });

  const allUp = monitors?.length > 0 && monitors.every((m: any) => m.status === "up");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            {allUp && (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-400 font-medium bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                All Systems Operational
              </span>
            )}
          </div>
          <h1 className="text-2xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground text-sm mt-0.5">Live overview of your infrastructure.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 shadow-sm shadow-primary/20">
          <Plus className="w-4 h-4" />
          Add Monitor
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-card border-border/60 stat-card-blue">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Uptime</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary/60" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!mounted || statsLoading
              ? <Skeleton className="h-8 w-24 mt-1" />
              : <div className="text-2xl font-bold font-mono mt-1">{stats?.overallUptimePct?.toFixed(2) ?? "0.00"}%</div>
            }
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60 stat-card-green">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Online</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-green-500/70" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!mounted || statsLoading
              ? <Skeleton className="h-8 w-12 mt-1" />
              : <div className="text-2xl font-bold font-mono text-green-400 mt-1">{stats?.upCount ?? 0}</div>
            }
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60 stat-card-red">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Offline</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-500/70" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!mounted || statsLoading
              ? <Skeleton className="h-8 w-12 mt-1" />
              : <div className={`text-2xl font-bold font-mono mt-1 ${(stats?.downCount ?? 0) > 0 ? "text-red-400" : "text-muted-foreground"}`}>{stats?.downCount ?? 0}</div>
            }
          </CardContent>
        </Card>
        <Card className="bg-card border-border/60 stat-card-gray">
          <CardHeader className="flex flex-row items-center justify-between pb-1 pt-4 px-4">
            <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Unknown</CardTitle>
            <HelpCircle className="w-4 h-4 text-muted-foreground/50" />
          </CardHeader>
          <CardContent className="px-4 pb-4">
            {!mounted || statsLoading
              ? <Skeleton className="h-8 w-12 mt-1" />
              : <div className="text-2xl font-bold font-mono text-muted-foreground mt-1">{stats?.unknownCount ?? 0}</div>
            }
          </CardContent>
        </Card>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            Monitors
            {mounted && monitors && monitors.length > 0 && (
              <span className="text-xs font-normal text-muted-foreground bg-muted/60 border border-border/50 px-2 py-0.5 rounded-full font-mono">
                {monitors.length}
              </span>
            )}
          </h2>
        </div>

        {!mounted || monitorsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-36 w-full rounded-xl" />)}
          </div>
        ) : monitors?.length === 0 ? (
          <div
            onClick={() => setAddOpen(true)}
            className="rounded-xl border border-dashed border-border/60 hover:border-primary/40 p-16 text-center flex flex-col items-center justify-center cursor-pointer transition-all group hover:bg-primary/3"
          >
            <div className="w-14 h-14 rounded-2xl bg-muted/60 group-hover:bg-primary/10 border border-border/50 group-hover:border-primary/30 flex items-center justify-center mb-4 transition-all">
              <Radio className="w-6 h-6 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-base font-semibold">No monitors yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm leading-relaxed">
              Add your first server to start monitoring. You'll get instant Telegram alerts when it goes down.
            </p>
            <Button className="mt-5 gap-2 shadow-sm shadow-primary/20" size="sm">
              <Plus className="w-4 h-4" />Add Your First Monitor
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {monitors?.map((monitor: any) => <MonitorCard key={monitor.id} monitor={monitor} />)}
            <button
              onClick={() => setAddOpen(true)}
              className="rounded-xl border border-dashed border-border/50 hover:border-primary/40 p-5 cursor-pointer transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group min-h-[120px]"
            >
              <div className="w-8 h-8 rounded-lg bg-muted/60 group-hover:bg-primary/10 border border-border/50 group-hover:border-primary/30 flex items-center justify-center transition-all">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm font-medium">Add Another Server</span>
            </button>
          </div>
        )}
      </div>

      <AddMonitorDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
