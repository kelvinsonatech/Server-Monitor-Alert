"use client";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ClientDate } from "@/components/client-date";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const ResponseChart = dynamic(
  () => import("@/components/response-chart").then((m) => m.ResponseChart),
  { ssr: false, loading: () => <div className="h-[160px]" /> }
);
import { ArrowLeft, RefreshCw, Trash2, Activity, Clock, Globe, Pencil, Eraser, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

async function fetchMonitor(id: number) {
  const res = await fetch(`${base}/api/monitors/${id}`);
  if (!res.ok) throw new Error("Not found");
  return res.json();
}

async function fetchChecks(id: number) {
  const res = await fetch(`${base}/api/monitors/${id}/checks`);
  if (!res.ok) throw new Error("Failed");
  return res.json();
}

export default function MonitorDetail() {
  const params = useParams<{ id: string }>();
  const monitorId = Number(params.id);
  const router = useRouter();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mounted, setMounted] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [editInterval, setEditInterval] = useState("");
  const [clearingHistory, setClearingHistory] = useState(false);

  useEffect(() => setMounted(true), []);

  const { data: monitor, isLoading: monitorLoading } = useQuery({
    queryKey: ["monitor", monitorId],
    queryFn: () => fetchMonitor(monitorId),
    enabled: mounted && !!monitorId,
    refetchInterval: 30000,
  });

  const { data: checks, isLoading: checksLoading } = useQuery({
    queryKey: ["checks", monitorId],
    queryFn: () => fetchChecks(monitorId),
    enabled: mounted && !!monitorId,
    refetchInterval: 30000,
  });

  const pingMutation = useMutation({
    mutationFn: () => fetch(`${base}/api/monitors/${monitorId}/ping`, { method: "POST" }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Ping sent", description: "Manual check completed." });
      queryClient.invalidateQueries({ queryKey: ["monitor", monitorId] });
      queryClient.invalidateQueries({ queryKey: ["checks", monitorId] });
    },
    onError: () => toast({ title: "Ping failed", variant: "destructive" }),
  });

  const updateMutation = useMutation({
    mutationFn: (data: { name: string; url: string; intervalMinutes: number }) =>
      fetch(`${base}/api/monitors/${monitorId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }).then((r) => r.json()),
    onSuccess: () => {
      toast({ title: "Monitor updated" });
      queryClient.invalidateQueries({ queryKey: ["monitor", monitorId] });
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      setEditOpen(false);
    },
    onError: () => toast({ title: "Update failed", variant: "destructive" }),
  });

  const deleteMutation = useMutation({
    mutationFn: () => fetch(`${base}/api/monitors/${monitorId}`, { method: "DELETE" }),
    onSuccess: () => {
      toast({ title: "Monitor deleted" });
      queryClient.invalidateQueries({ queryKey: ["monitors"] });
      queryClient.invalidateQueries({ queryKey: ["stats"] });
      router.push("/");
    },
    onError: () => toast({ title: "Delete failed", variant: "destructive" }),
  });

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
      toast({ title: "Invalid input", description: "Name, URL and interval are required.", variant: "destructive" });
      return;
    }
    updateMutation.mutate({ name: editName.trim(), url: editUrl.trim(), intervalMinutes: interval });
  };

  const handleClearHistory = async () => {
    setClearingHistory(true);
    try {
      await fetch(`${base}/api/monitors/${monitorId}/checks`, { method: "DELETE" });
      queryClient.invalidateQueries({ queryKey: ["checks", monitorId] });
      toast({ title: "History cleared" });
    } catch {
      toast({ title: "Failed to clear history", variant: "destructive" });
    } finally {
      setClearingHistory(false);
    }
  };

  if (!mounted || monitorLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-[200px] w-full rounded-xl" />
      </div>
    );
  }

  if (!monitor) return <div className="text-muted-foreground p-8 text-center">Monitor not found.</div>;

  const chartData = checks
    ? [...checks].reverse().map((c: any) => ({
        time: new Date(c.checkedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        ms: c.responseMs ?? null,
        status: c.status,
      }))
    : [];

  const uptimePct = checks && checks.length > 0
    ? Math.round((checks.filter((c: any) => c.status === "up").length / checks.length) * 100)
    : 100;

  const avgMs = (() => {
    if (!checks) return null;
    const valid = checks.filter((c: any) => c.responseMs != null);
    return valid.length > 0 ? Math.round(valid.reduce((a: number, c: any) => a + c.responseMs, 0) / valid.length) : null;
  })();

  const isUp = monitor.status === "up";
  const isDown = monitor.status === "down";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/">
            <Button variant="outline" size="icon" className="h-9 w-9 border-border/70 rounded-lg">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold tracking-tight">{monitor.name}</h1>
              <StatusBadge status={monitor.status} />
            </div>
            <p className="text-muted-foreground mt-0.5 font-mono text-xs flex items-center gap-1.5">
              <Globe className="w-3 h-3" />{monitor.url}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={openEdit} className="gap-2 border-border/70 text-xs">
            <Pencil className="w-3.5 h-3.5" />Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => pingMutation.mutate()}
            disabled={pingMutation.isPending}
            className="gap-2 border-border/70 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${pingMutation.isPending ? "animate-spin" : ""}`} />
            Ping Now
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="icon" className="h-8 w-8 border-border/70 text-muted-foreground hover:text-destructive hover:border-destructive/50">
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="border-border/80 bg-card">
              <AlertDialogHeader>
                <AlertDialogTitle>Delete this monitor?</AlertDialogTitle>
                <AlertDialogDescription>This will permanently delete the monitor and all of its history. This cannot be undone.</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="border-border/70">Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={() => deleteMutation.mutate()} className="bg-destructive hover:bg-destructive/90">
                  Delete Monitor
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-md border-border/80 bg-card">
          <DialogHeader><DialogTitle className="text-lg font-semibold">Edit Monitor</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Name</Label>
              <Input id="edit-name" value={editName} onChange={(e) => setEditName(e.target.value)} className="font-mono bg-background/80 border-border/80 h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-url">URL</Label>
              <Input id="edit-url" value={editUrl} onChange={(e) => setEditUrl(e.target.value)} className="font-mono bg-background/80 border-border/80 h-10" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-interval">Check Interval (minutes)</Label>
              <Input id="edit-interval" type="number" min={1} value={editInterval} onChange={(e) => setEditInterval(e.target.value)} className="font-mono bg-background/80 border-border/80 h-10 w-32" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)} className="border-border/70">Cancel</Button>
            <Button onClick={handleSaveEdit} disabled={updateMutation.isPending} className="shadow-sm shadow-primary/20">
              {updateMutation.isPending ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Check Interval", icon: Activity, value: `${monitor.intervalMinutes}m` },
          { label: "Last Checked", icon: Clock, value: <ClientDate value={monitor.lastCheckedAt} /> },
          { label: "Last Response", icon: Zap, value: monitor.lastResponseMs != null ? `${monitor.lastResponseMs}ms` : "—" },
        ].map(({ label, icon: Icon, value }) => (
          <Card key={label} className="bg-card border-border/60">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-2">
                <Icon className="w-3.5 h-3.5" />{label}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="text-xl font-bold font-mono mt-1">{value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {checks && checks.length > 1 && (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: `UPTIME (${checks.length} CHECKS)`,
                value: `${uptimePct}%`,
                color: uptimePct === 100 ? "text-green-400" : uptimePct > 90 ? "text-yellow-400" : "text-red-400",
              },
              { label: "AVG RESPONSE", value: avgMs != null ? `${avgMs}ms` : "—", color: "text-foreground" },
              { label: "TOTAL CHECKS", value: String(checks.length), color: "text-foreground" },
            ].map(({ label, value, color }) => (
              <Card key={label} className="bg-card border-border/60">
                <CardContent className="pt-4 pb-4 px-4">
                  <p className="text-[10px] text-muted-foreground font-mono tracking-wider mb-1.5">{label}</p>
                  <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-card border-border/60">
            <CardHeader className="pb-1 pt-4 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Response Time</CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <ResponseChart data={chartData} />
            </CardContent>
          </Card>

          <Card className="bg-card border-border/60">
            <CardHeader className="pb-2 pt-4 px-4 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-medium text-muted-foreground uppercase tracking-wider font-mono">Status History</CardTitle>
              <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-mono">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-green-500/80 inline-block" />UP</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-red-500/80 inline-block" />DOWN</span>
              </div>
            </CardHeader>
            <CardContent className="px-4 pb-4">
              <div className="flex gap-0.5">
                {[...checks].reverse().map((c: any, i: number) => (
                  <div
                    key={i}
                    suppressHydrationWarning
                    title={`${c.checkedAt} — ${c.status.toUpperCase()}${c.responseMs != null ? ` (${c.responseMs}ms)` : ""}`}
                    className={`h-6 flex-1 min-w-[6px] max-w-[16px] rounded-sm transition-opacity hover:opacity-60 cursor-default ${c.status === "up" ? "bg-green-500/70" : "bg-red-500/70"}`}
                  />
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground/60 font-mono mt-2">← Oldest · Newest →</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold">Check History</h2>
          {checks && checks.length > 0 && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 border-border/60 text-muted-foreground hover:text-destructive hover:border-destructive/40 text-xs"
                  disabled={clearingHistory}
                >
                  <Eraser className="w-3.5 h-3.5" />
                  {clearingHistory ? "Clearing…" : "Clear History"}
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="border-border/80 bg-card">
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear check history?</AlertDialogTitle>
                  <AlertDialogDescription>This will permanently delete all {checks.length} check records. The monitor keeps running.</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel className="border-border/70">Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearHistory} className="bg-destructive hover:bg-destructive/90">Clear History</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <Card className="bg-card border-border/60">
          {checksLoading ? (
            <div className="p-6 space-y-3">
              {[1,2,3].map(i => <Skeleton key={i} className="h-9 w-full" />)}
            </div>
          ) : !checks || checks.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground text-sm">No check history available yet.</div>
          ) : (
            <div className="relative w-full overflow-auto">
              <table className="w-full text-sm text-left">
                <thead>
                  <tr className="border-b border-border/60">
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Time</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Response</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Code</th>
                    <th className="px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider">Error</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {checks.map((check: any) => (
                    <tr key={check.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-mono text-muted-foreground">
                        <ClientDate value={check.checkedAt} format="datetime" />
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-semibold tracking-wide ${
                          check.status === "up"
                            ? "bg-green-500/10 text-green-400 border border-green-500/20"
                            : "bg-red-500/10 text-red-400 border border-red-500/20"
                        }`}>
                          {check.status.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-sm">{check.responseMs != null ? `${check.responseMs}ms` : "—"}</td>
                      <td className="px-4 py-3 font-mono text-sm text-muted-foreground">{check.statusCode || "—"}</td>
                      <td className="px-4 py-3 text-red-400 text-sm truncate max-w-[200px]">{check.error || "—"}</td>
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
