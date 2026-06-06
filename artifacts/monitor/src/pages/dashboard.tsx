import { useGetStats, useListMonitors, getGetStatsQueryKey, getListMonitorsQueryKey } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Plus, Activity, ArrowUpRight, ArrowDownRight, HelpCircle, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatusBadge } from "@/components/status-badge";
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useGetStats({
    query: { queryKey: getGetStatsQueryKey(), refetchInterval: 30000 }
  });
  
  const { data: monitors, isLoading: monitorsLoading } = useListMonitors({
    query: { queryKey: getListMonitorsQueryKey(), refetchInterval: 30000 }
  });

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">System Status</h1>
          <p className="text-muted-foreground mt-1">Live overview of your infrastructure.</p>
        </div>
        <Link href="/monitors/new">
          <Button className="gap-2 font-mono">
            <Plus className="w-4 h-4" />
            ADD MONITOR
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overall Uptime</CardTitle>
            <Activity className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <div className="text-2xl font-bold font-mono">
                {stats?.overallUptimePct?.toFixed(2) ?? "0.00"}%
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Up</CardTitle>
            <ArrowUpRight className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono text-green-500">{stats?.upCount ?? 0}</div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-card/50 border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Down</CardTitle>
            <ArrowDownRight className="w-4 h-4 text-red-500" />
          </CardHeader>
          <CardContent>
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
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
            {statsLoading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <div className="text-2xl font-bold font-mono text-gray-500">{stats?.unknownCount ?? 0}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Monitors List */}
      <div>
        <h2 className="text-xl font-bold tracking-tight mb-4">Monitors</h2>
        
        <div className="bg-card/50 rounded-lg border border-border overflow-hidden">
          {monitorsLoading ? (
            <div className="p-8 space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          ) : monitors?.length === 0 ? (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
                <Activity className="w-6 h-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium">No monitors configured</h3>
              <p className="text-muted-foreground mt-2 mb-6 max-w-sm">
                Add your first monitor to start tracking uptime and receive alerts when services go offline.
              </p>
              <Link href="/monitors/new">
                <Button>Add First Monitor</Button>
              </Link>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-muted/50 font-mono">
                <tr>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Name</th>
                  <th className="px-6 py-4 font-medium">Target</th>
                  <th className="px-6 py-4 font-medium text-right">Response</th>
                  <th className="px-6 py-4 font-medium text-right">Last Checked</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {monitors?.map((monitor) => (
                  <tr key={monitor.id} className="hover:bg-muted/50 transition-colors group cursor-pointer" onClick={() => window.location.href = `/monitors/${monitor.id}`}>
                    <td className="px-6 py-4">
                      <StatusBadge status={monitor.status} />
                    </td>
                    <td className="px-6 py-4 font-medium text-foreground">
                      <Link href={`/monitors/${monitor.id}`} onClick={e => e.stopPropagation()}>
                        <span className="hover:underline">{monitor.name}</span>
                      </Link>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-mono text-xs truncate max-w-[200px]">
                      {monitor.url}
                    </td>
                    <td className="px-6 py-4 text-right font-mono text-xs">
                      {monitor.lastResponseMs != null ? (
                        <span className={monitor.lastResponseMs > 1000 ? "text-yellow-500" : ""}>
                          {monitor.lastResponseMs}ms
                        </span>
                      ) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right text-muted-foreground flex items-center justify-end gap-1 font-mono text-xs">
                      <Clock className="w-3 h-3" />
                      {monitor.lastCheckedAt ? new Date(monitor.lastCheckedAt).toLocaleTimeString() : "Never"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
