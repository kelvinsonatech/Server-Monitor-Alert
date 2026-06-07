import { useState } from "react";
import { useParams, Link, useLocation } from "wouter";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { 
  useGetMonitor, 
  useListChecks, 
  usePingMonitor, 
  useDeleteMonitor,
  useUpdateMonitor,
  getGetMonitorQueryKey,
  getListChecksQueryKey,
  getListMonitorsQueryKey,
  getGetStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Trash2, Activity, Clock, Globe, Pencil, Eraser } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";

export default function MonitorDetail() {
  const { id } = useParams();
  const monitorId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editInterval, setEditInterval] = useState("");
  const [clearingHistory, setClearingHistory] = useState(false);

  const { data: monitor, isLoading: monitorLoading } = useGetMonitor(monitorId, {
    query: { enabled: !!monitorId, queryKey: getGetMonitorQueryKey(monitorId), refetchInterval: 30000 }
  });

  const { data: checks, isLoading: checksLoading } = useListChecks(monitorId, {
    query: { enabled: !!monitorId, queryKey: getListChecksQueryKey(monitorId), refetchInterval: 30000 }
  });

  const pingMonitor = usePingMonitor();
  const deleteMonitor = useDeleteMonitor();
  const updateMonitor = useUpdateMonitor();

  const openEdit = () => {
    if (!monitor) return;
    setEditName(monitor.name);
    setEditUrl(monitor.url);
    setEditInterval(String(monitor.intervalMinutes));
    setEditOpen(true);
  };

  const handleSaveEdit = () => {
    const interval = parseInt(editInterval, 10);
    if (!editName.trim() || !editUrl.trim() || isNaN(interval) || interval < 1) {
      toast({ title: "Invalid input", description: "Name, URL and interval are required. Interval must be ≥ 1 minute.", variant: "destructive" });
      return;
    }
    updateMonitor.mutate(
      { id: monitorId, data: { name: editName.trim(), url: editUrl.trim(), intervalMinutes: interval } },
      {
        onSuccess: () => {
          toast({ title: "Monitor updated" });
          queryClient.invalidateQueries({ queryKey: getGetMonitorQueryKey(monitorId) });
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          setEditOpen(false);
        },
        onError: () => {
          toast({ title: "Update failed", description: "Could not save changes.", variant: "destructive" });
        },
      }
    );
  };

  const handleClearHistory = async () => {
    setClearingHistory(true);
    try {
      await fetch(`/api/monitors/${monitorId}/checks`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: getListChecksQueryKey(monitorId) });
      toast({ title: "History cleared", description: "All check records have been removed." });
    } catch {
      toast({ title: "Failed to clear history", variant: "destructive" });
    } finally {
      setClearingHistory(false);
    }
  };

  const handlePing = () => {
    pingMonitor.mutate(
      { id: monitorId },
      {
        onSuccess: () => {
          toast({ title: "Ping sent", description: "Manual check completed." });
          queryClient.invalidateQueries({ queryKey: getGetMonitorQueryKey(monitorId) });
          queryClient.invalidateQueries({ queryKey: getListChecksQueryKey(monitorId) });
        },
        onError: (err: any) => {
          toast({ title: "Ping failed", description: err.message || "Failed to trigger manual check.", variant: "destructive" });
        }
      }
    );
  };

  const handleDelete = () => {
    deleteMonitor.mutate(
      { id: monitorId },
      {
        onSuccess: () => {
          toast({ title: "Monitor deleted" });
          queryClient.invalidateQueries({ queryKey: getListMonitorsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetStatsQueryKey() });
          setLocation("/");
        },
        onError: (err: any) => {
          toast({ title: "Delete failed", description: err.message || "Failed to delete monitor.", variant: "destructive" });
        }
      }
    );
  };

  if (monitorLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] w-full" />
      </div>
    );
  }

  if (!monitor) {
    return <div>Monitor not found.</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="h-8 w-8 shrink-0">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          {/* Dicebear avatar */}
          <div className="relative shrink-0">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-muted/40 border border-border">
              <img
                src={`https://api.dicebear.com/9.x/bottts/svg?seed=${encodeURIComponent(monitor.name)}`}
                alt={monitor.name}
                width={56}
                height={56}
                className="w-full h-full"
                draggable={false}
              />
            </div>
            <span className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background ${
              monitor.status === "up" ? "bg-green-500" : monitor.status === "down" ? "bg-red-500" : "bg-gray-500"
            }`} />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight">{monitor.name}</h1>
              <StatusBadge status={monitor.status} />
            </div>
            <p className="text-muted-foreground mt-1 font-mono text-sm flex items-center gap-2">
              <Globe className="w-3 h-3" />
              {monitor.url}
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={openEdit} className="font-mono">
            <Pencil className="w-4 h-4 mr-2" />
            EDIT
          </Button>

          <Button 
            variant="outline" 
            onClick={handlePing} 
            disabled={pingMonitor.isPending}
            className="font-mono"
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${pingMonitor.isPending ? 'animate-spin' : ''}`} />
            PING NOW
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="icon">
                <Trash2 className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete the monitor and all of its history.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Delete Monitor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Monitor</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="font-mono bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input
                id="edit-url"
                value={editUrl}
                onChange={(e) => setEditUrl(e.target.value)}
                className="font-mono bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-interval">Check Interval (minutes)</Label>
              <Input
                id="edit-interval"
                type="number"
                min={1}
                value={editInterval}
                onChange={(e) => setEditInterval(e.target.value)}
                className="font-mono bg-background"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMonitor.isPending} className="font-mono">
              {updateMonitor.isPending ? "SAVING..." : "SAVE CHANGES"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Interval
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{monitor.intervalMinutes}m</div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Last Checked
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleTimeString() : "Never"}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Last Response Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">
              {monitor.lastResponseMs != null ? `${monitor.lastResponseMs}ms` : "-"}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {checks && checks.length > 1 && (() => {
        const chartData = [...checks].reverse().map((c) => ({
          time: new Date(c.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          ms: c.responseMs ?? null,
          status: c.status,
        }));

        const uptimePct = checks.length > 0
          ? Math.round((checks.filter((c) => c.status === "up").length / checks.length) * 100)
          : 100;

        const avgMs = (() => {
          const valid = checks.filter((c) => c.responseMs != null);
          return valid.length > 0 ? Math.round(valid.reduce((a, c) => a + (c.responseMs ?? 0), 0) / valid.length) : null;
        })();

        return (
          <div className="space-y-4">
            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground font-mono mb-1">UPTIME (LAST {checks.length} CHECKS)</p>
                  <p className={`text-2xl font-bold font-mono ${uptimePct === 100 ? "text-green-400" : uptimePct > 90 ? "text-yellow-400" : "text-red-400"}`}>
                    {uptimePct}%
                  </p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground font-mono mb-1">AVG RESPONSE</p>
                  <p className="text-2xl font-bold font-mono">{avgMs != null ? `${avgMs}ms` : "—"}</p>
                </CardContent>
              </Card>
              <Card className="bg-card/50 border-border">
                <CardContent className="pt-4 pb-4">
                  <p className="text-xs text-muted-foreground font-mono mb-1">TOTAL CHECKS</p>
                  <p className="text-2xl font-bold font-mono">{checks.length}</p>
                </CardContent>
              </Card>
            </div>

            {/* Response time chart */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground font-mono">RESPONSE TIME (ms)</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                    <defs>
                      <linearGradient id="msGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis
                      dataKey="time"
                      tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }}
                      interval="preserveStartEnd"
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fill: "#6b7280", fontSize: 10, fontFamily: "monospace" }}
                      tickLine={false}
                      axisLine={false}
                      unit="ms"
                    />
                    <Tooltip
                      contentStyle={{ background: "#1a1a2e", border: "1px solid #374151", borderRadius: 8, fontSize: 12, fontFamily: "monospace" }}
                      labelStyle={{ color: "#9ca3af" }}
                      itemStyle={{ color: "#3b82f6" }}
                      formatter={(v: number) => [`${v}ms`, "Response"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="ms"
                      stroke="#3b82f6"
                      strokeWidth={2}
                      fill="url(#msGradient)"
                      connectNulls={false}
                      dot={false}
                      activeDot={{ r: 4, fill: "#3b82f6" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Status heatmap */}
            <Card className="bg-card/50 border-border">
              <CardHeader className="pb-2 flex flex-row items-center justify-between">
                <CardTitle className="text-sm font-medium text-muted-foreground font-mono">STATUS HISTORY</CardTitle>
                <div className="flex items-center gap-3 text-xs text-muted-foreground font-mono">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-500/80 inline-block" /> UP</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500/80 inline-block" /> DOWN</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-1 flex-wrap">
                  {[...checks].reverse().map((c, i) => (
                    <div
                      key={i}
                      title={`${new Date(c.checkedAt).toLocaleString()} — ${c.status.toUpperCase()}${c.responseMs != null ? ` (${c.responseMs}ms)` : ""}`}
                      className={`h-7 flex-1 min-w-[10px] max-w-[20px] rounded-sm transition-opacity hover:opacity-70 cursor-default ${
                        c.status === "up" ? "bg-green-500/75" : "bg-red-500/75"
                      }`}
                    />
                  ))}
                </div>
                <p className="text-[10px] text-muted-foreground font-mono mt-2">← Oldest · Newest →</p>
              </CardContent>
            </Card>
          </div>
        );
      })()}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold tracking-tight">Check History</h2>
          {checks && checks.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="font-mono gap-2 text-muted-foreground hover:text-destructive hover:border-destructive/50" disabled={clearingHistory}>
                  <Eraser className="w-3.5 h-3.5" />
                  {clearingHistory ? "CLEARING..." : "CLEAR HISTORY"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear check history?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all {checks.length} check records for this monitor. The monitor will keep running — only the history is removed.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                    Clear History
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
        <Card className="bg-card/50 border-border">
          {checksLoading ? (
            <div className="p-6 space-y-4">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : !checks || checks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              No check history available yet.
            </div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-left font-mono">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/50">
                  <tr>
                    <th className="px-4 py-3">Time</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Response Time</th>
                    <th className="px-4 py-3">Status Code</th>
                    <th className="px-4 py-3">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {checks.map((check) => (
                    <tr key={check.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 whitespace-nowrap">
                        {new Date(check.checkedAt).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${check.status === 'up' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                          {check.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        {check.responseMs != null ? `${check.responseMs}ms` : "-"}
                      </td>
                      <td className="px-4 py-3">
                        {check.statusCode || "-"}
                      </td>
                      <td className="px-4 py-3 text-red-400 truncate max-w-[200px]">
                        {check.error || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
