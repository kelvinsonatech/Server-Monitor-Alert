import { useState } from "react";
import {
  useGetStats,
  useListMonitors,
  useCreateMonitor,
  useListChecks,
  getGetStatsQueryKey,
  getListMonitorsQueryKey,
  getListChecksQueryKey,
} from "@workspace/api-client-react";
import type { Stats } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Plus, Activity, ArrowUpRight, ArrowDownRight, HelpCircle, Clock, Globe, Zap, ServerCog, Gauge as GaugeIcon } from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  AreaChart,
  Area,
  ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const STATUS_COLORS = { up: "#22c55e", down: "#ef4444", unknown: "#6b7280" };

function StatusDonut({ stats }: { stats: Stats }) {
  const data = [
    { name: "Online", value: stats.upCount, color: STATUS_COLORS.up },
    { name: "Offline", value: stats.downCount, color: STATUS_COLORS.down },
    { name: "Unknown", value: stats.unknownCount, color: STATUS_COLORS.unknown },
  ].filter((d) => d.value > 0);

  const hasData = data.length > 0;

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono flex items-center gap-2">
          <ServerCog className="w-4 h-4 text-primary" />
          FLEET DISTRIBUTION
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={hasData ? data : [{ name: "None", value: 1, color: "#1f2937" }]}
                dataKey="value"
                innerRadius={58}
                outerRadius={80}
                paddingAngle={hasData ? 3 : 0}
                strokeWidth={0}
                startAngle={90}
                endAngle={-270}
                isAnimationActive={false}
              >
                {(hasData ? data : [{ color: "#1f2937" }]).map((d, i) => (
                  <Cell key={i} fill={d.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold font-mono">{stats.totalMonitors}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Monitors</span>
          </div>
        </div>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs font-mono">
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: STATUS_COLORS.up }} />
            {stats.upCount} up
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: STATUS_COLORS.down }} />
            {stats.downCount} down
          </span>
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: STATUS_COLORS.unknown }} />
            {stats.unknownCount} unknown
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function UptimeGauge({ pct }: { pct: number }) {
  const color = pct >= 99 ? "#22c55e" : pct >= 95 ? "#eab308" : "#ef4444";
  const data = [{ name: "uptime", value: pct, fill: color }];

  return (
    <Card className="bg-card/50 border-border">
      <CardHeader className="pb-1">
        <CardTitle className="text-sm font-medium text-muted-foreground font-mono flex items-center gap-2">
          <GaugeIcon className="w-4 h-4 text-primary" />
          OVERALL UPTIME
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              innerRadius="74%"
              outerRadius="100%"
              data={data}
              startAngle={90}
              endAngle={-270}
            >
              <PolarAngleAxis type="number" domain={[0, 100]} tick={false} axisLine={false} />
              <RadialBar
                background={{ fill: "rgba(255,255,255,0.06)" }}
                dataKey="value"
                cornerRadius={20}
                isAnimationActive={false}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-3xl font-bold font-mono" style={{ color }}>
              {pct.toFixed(1)}%
            </span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-widest">Availability</span>
          </div>
        </div>
        <p className="text-center text-xs text-muted-foreground font-mono mt-2">
          Across all monitored endpoints
        </p>
      </CardContent>
    </Card>
  );
}

function MonitorSparkline({ monitorId, isDown }: { monitorId: number; isDown: boolean }) {
  const { data: checks } = useListChecks(monitorId, {
    query: { queryKey: getListChecksQueryKey(monitorId), refetchInterval: 30000 },
  });

  const data = (checks ?? [])
    .slice(0, 24)
    .reverse()
    .map((c) => ({ ms: c.responseMs ?? null }));

  const points = data.filter((d) => d.ms != null).length;
  if (points < 2) {
    return <div className="h-10 flex items-center text-[10px] text-muted-foreground/40 font-mono">collecting data…</div>;
  }

  const color = isDown ? STATUS_COLORS.down : STATUS_COLORS.up;
  const gradId = `spark-${monitorId}`;

  return (
    <div className="h-10 -mx-1">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 2, left: 2, bottom: 0 }}>
          <defs>
            <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="ms"
            stroke={color}
            strokeWidth={1.5}
            fill={`url(#${gradId})`}
            dot={false}
            connectNulls={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
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

        {/* Response time sparkline */}
        <div className="mt-4">
          <MonitorSparkline monitorId={monitor.id} isDown={isDown} />
        </div>

        <div className="mt-3 flex items-center gap-5 text-xs text-muted-foreground font-mono">
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

  const hasMonitors = !!monitors && monitors.length > 0;

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

      {/* Visual overview */}
      {hasMonitors && (
        statsLoading || !stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Skeleton className="h-[270px] w-full rounded-xl" />
            <Skeleton className="h-[270px] w-full rounded-xl" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <StatusDonut stats={stats} />
            <UptimeGauge pct={stats.overallUptimePct ?? 0} />
          </div>
        )
      )}

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
