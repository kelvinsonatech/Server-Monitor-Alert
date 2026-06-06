import { useParams, Link, useLocation } from "wouter";
import { 
  useGetMonitor, 
  useListChecks, 
  usePingMonitor, 
  useDeleteMonitor,
  getGetMonitorQueryKey,
  getListChecksQueryKey,
  getListMonitorsQueryKey,
  getGetStatsQueryKey
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ArrowLeft, RefreshCw, Trash2, Activity, Clock, Globe } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";
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

export default function MonitorDetail() {
  const { id } = useParams();
  const monitorId = Number(id);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: monitor, isLoading: monitorLoading } = useGetMonitor(monitorId, {
    query: { enabled: !!monitorId, queryKey: getGetMonitorQueryKey(monitorId), refetchInterval: 30000 }
  });

  const { data: checks, isLoading: checksLoading } = useListChecks(monitorId, {
    query: { enabled: !!monitorId, queryKey: getListChecksQueryKey(monitorId), refetchInterval: 30000 }
  });

  const pingMonitor = usePingMonitor();
  const deleteMonitor = useDeleteMonitor();

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
          toast({ 
            title: "Ping failed", 
            description: err.message || "Failed to trigger manual check.",
            variant: "destructive" 
          });
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
          toast({ 
            title: "Delete failed", 
            description: err.message || "Failed to delete monitor.",
            variant: "destructive" 
          });
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
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
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

      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Check History</h2>
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
