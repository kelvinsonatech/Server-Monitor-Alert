import { useState } from "react";
import { useGetStats, useListMonitors, useCreateMonitor, getGetStatsQueryKey, getListMonitorsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Activity, ArrowUpRight, ArrowDownRight, HelpCircle, Clock, Globe, Zap, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function AddMonitorDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  const [name, setName] = useState("");
  const [url, setUrl] = useState("https://");
  const [interval, setInterval] = useState("5");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const createMonitor = useCreateMonitor();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const intervalNum = parseInt(interval, 10);
    if (!name.trim() || !url.trim() || isNaN(intervalNum) || intervalNum < 1) {
      toast({ title: "Invalid input", description: "All fields are required.", variant: "destructive" });
      return;
    }
    createMonitor.mutate(
      { data: { name: name.trim(), url: url.trim(), intervalMinutes: intervalNum } },
      {
        onSuccess: (data) => {
          toast({ title: "Monitor added!", description: `${data.name} is now being tracked.` });
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          onOpenChange(false);
          setName("");
          setUrl("https://");
          setInterval("5");
        },
        onError: () => {
          toast({ title: "Failed to create monitor", variant: "destructive" });
        },
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Plus className="w-4 h-4 text-primary" />
            </div>
            Add New Monitor
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="space-y-2">
            <Label htmlFor="mon-name">Monitor Name</Label>
            <Input
              id="mon-name"
              placeholder="e.g. Production API, My Linode Server"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-background"
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="mon-url">URL to Monitor</Label>
            <Input
              id="mon-url"
              placeholder="https://example.com"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono bg-background"
            />
            <p className="text-xs text-muted-foreground">Works with self-signed HTTPS certificates too.</p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="mon-interval">Check Every (minutes)</Label>
            <div className="flex gap-2">
              {[1, 5, 10, 30].map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setInterval(String(m))}
                  className={`flex-1 py-2 rounded-md text-sm font-mono font-medium border transition-colors ${
                    interval === String(m)
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-background border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m}m
                </button>
              ))}
              <Input
                id="mon-interval"
                type="number"
                min={1}
                value={interval}
                onChange={(e) => setInterval(e.target.value)}
                className="font-mono bg-background w-20"
                placeholder="custom"
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1 font-mono" disabled={createMonitor.isPending}>
              {createMonitor.isPending ? "ADDING..." : "ADD MONITOR"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function MonitorCard({ monitor }: { monitor: any }) {
  const isUp = monitor.status === "up";
  const isDown = monitor.status === "down";

  return (
    <Link href={`/monitors/${monitor.id}`}>
      <div className={`group relative rounded-xl border p-5 cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 ${
        isDown
          ? "border-red-500/30 bg-red-500/5 hover:border-red-500/50"
          : isUp
          ? "border-green-500/20 bg-card/50 hover:border-green-500/40"
          : "border-border bg-card/50 hover:border-border/80"
      }`}>
        {/* Status pulse */}
        <div className="absolute top-4 right-4 flex items-center gap-2">
          <div className="relative flex items-center">
            {isUp && (
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-green-500 opacity-75 animate-ping" />
            )}
            {isDown && (
              <span className="absolute inline-flex h-3 w-3 rounded-full bg-red-500 opacity-75 animate-ping" />
            )}
            <span className={`relative inline-flex h-3 w-3 rounded-full ${
              isUp ? "bg-green-500" : isDown ? "bg-red-500" : "bg-gray-500"
            }`} />
          </div>
          <span className={`text-xs font-mono font-bold ${
            isUp ? "text-green-500" : isDown ? "text-red-500" : "text-gray-500"
          }`}>
            {monitor.status.toUpperCase()}
          </span>
        </div>

        <div className="pr-20">
          <h3 className="font-semibold text-foreground text-base group-hover:text-primary transition-colors truncate">
            {monitor.name}
          </h3>
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate flex items-center gap-1">
            <Globe className="w-3 h-3 shrink-0" />
            {monitor.url}
          </p>
        </div>

        <div className="mt-4 flex items-center gap-5 text-xs text-muted-foreground font-mono">
          <div className="flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5" />
            <span>{monitor.lastResponseMs != null ? `${monitor.lastResponseMs}ms` : "—"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5" />
            <span>{monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleTimeString() : "Never"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5" />
            <span>every {monitor.intervalMinutes}m</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function Dashboard() {
  const [addOpen, setAddOpen] = useState(false);

  const { data: stats, isLoading: statsLoading } = useGetStats({
    query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 },
  });

  const { data: monitors, isLoading: monitorsLoading } = useListMonitors({
    query: { queryKey: getListMonitorsQueryKey(), refetchInterval: 30000 },
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground mt-1">Live overview of your infrastructure.</p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-2 font-mono">
          <Plus className="w-4 h-4" />
          ADD MONITOR
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Uptime</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-24" /> : (
              <div className="text-2xl font-bold font-mono">
                {stats?.overallUptimePct?.toFixed(2) ?? "0.00"}%
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-green-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Online</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold font-mono text-green-500">{stats?.upCount ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-red-500/20">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Offline</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold font-mono text-red-500">{stats?.downCount ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Unknown</CardTitle>
            <HelpCircle className="w-4 h-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? <Skeleton className="h-8 w-16" /> : (
              <div className="text-2xl font-bold font-mono text-gray-500">{stats?.unknownCount ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monitors Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">
            Monitors
            {monitors && monitors.length > 0 && (
              <span className="ml-2 text-sm font-normal text-muted-foreground font-mono">({monitors.length})</span>
            )}
          </h2>
        </div>

        {monitorsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full rounded-xl" />)}
          </div>
        ) : monitors?.length === 0 ? (
          <div
            onClick={() => setAddOpen(true)}
            className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-16 text-center flex flex-col items-center justify-center cursor-pointer transition-colors group"
          >
            <div className="w-14 h-14 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center mb-4 transition-colors">
              <Plus className="w-7 h-7 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <h3 className="text-lg font-semibold">No monitors yet</h3>
            <p className="text-muted-foreground mt-1 max-w-xs text-sm">
              Click here to add your first server. You'll get Telegram alerts the moment it goes down.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {monitors?.map((monitor) => (
              <MonitorCard key={monitor.id} monitor={monitor} />
            ))}
            {/* Add more card */}
            <div
              onClick={() => setAddOpen(true)}
              className="rounded-xl border-2 border-dashed border-border hover:border-primary/50 p-5 cursor-pointer transition-all hover:-translate-y-0.5 flex items-center justify-center gap-3 text-muted-foreground hover:text-primary group min-h-[110px]"
            >
              <div className="w-8 h-8 rounded-full bg-muted group-hover:bg-primary/10 flex items-center justify-center transition-colors">
                <Plus className="w-4 h-4" />
              </div>
              <span className="font-mono text-sm font-medium">ADD ANOTHER SERVER</span>
            </div>
          </div>
        )}
      </div>

      <AddMonitorDialog open={addOpen} onOpenChange={setAddOpen} />
    </div>
  );
}
