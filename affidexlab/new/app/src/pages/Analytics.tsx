import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { analytics } from "@/lib/analytics";
import { TrendingUp, Users, ArrowLeftRight, DollarSign, BarChart3 } from "lucide-react";

export default function Analytics() {
  const [period, setPeriod] = useState<"24h" | "7d" | "30d" | "all">("all");
  const [stats, setStats] = useState(analytics.getStats(period));
  const [recentActivity, setRecentActivity] = useState(analytics.getRecentActivity());

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(analytics.getStats(period));
      setRecentActivity(analytics.getRecentActivity());
    }, 5000);

    return () => clearInterval(interval);
  }, [period]);

  useEffect(() => {
    setStats(analytics.getStats(period));
  }, [period]);

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Analytics</h1>
        <div className="flex gap-2">
          {(["24h", "7d", "30d", "all"] as const).map((p) => (
            <Button
              key={p}
              variant={period === p ? "default" : "outline"}
              size="sm"
              onClick={() => setPeriod(p)}
            >
              {p === "all" ? "All Time" : p}
            </Button>
          ))}
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span>Total Volume</span>
          </div>
          <div className="text-3xl font-bold">
            ${stats.totalVolume.toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across all swaps
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <ArrowLeftRight className="h-4 w-4" />
            <span>Total Swaps</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalSwaps}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Completed transactions
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <Users className="h-4 w-4" />
            <span>Unique Users</span>
          </div>
          <div className="text-3xl font-bold">{stats.uniqueUsers}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Active wallets
          </div>
        </Card>

        <Card className="p-6">
          <div className="mb-2 flex items-center gap-2 text-sm text-muted-foreground">
            <TrendingUp className="h-4 w-4" />
            <span>Bridges</span>
          </div>
          <div className="text-3xl font-bold">{stats.totalBridges}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Cross-chain transfers
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Top Trading Pairs</h2>
          </div>
          {stats.topPairs.length > 0 ? (
            <div className="space-y-3">
              {stats.topPairs.map((pair, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="font-medium">{pair.pair}</span>
                  <span className="text-sm text-muted-foreground">{pair.count} swaps</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No trading pairs yet. Start swapping to see analytics!
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="mb-4 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">Route Distribution</h2>
          </div>
          {stats.routeDistribution.length > 0 ? (
            <div className="space-y-3">
              {stats.routeDistribution.map((route, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{route.route}</span>
                    <span className="text-sm text-muted-foreground">
                      {route.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${route.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
              No route data yet. Complete a swap to see routing analytics!
            </div>
          )}
        </Card>
      </div>

      <Card className="mt-6 p-6">
        <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
        {recentActivity.length > 0 ? (
          <div className="space-y-3">
            {recentActivity.map((event, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg border p-3"
              >
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-2">
                    {event.type === "swap" ? (
                      <ArrowLeftRight className="h-4 w-4 text-primary" />
                    ) : (
                      <TrendingUp className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <div>
                    <div className="font-medium">
                      {event.type === "swap" ? (
                        <>
                          {event.tokenIn} → {event.tokenOut}
                        </>
                      ) : (
                        <>
                          Bridge: {event.token}
                        </>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <a
                  href={`https://arbiscan.io/tx/${event.txHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  View Tx →
                </a>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-sm text-muted-foreground py-8">
            No recent activity. Start trading to see your transaction history!
          </div>
        )}
      </Card>

      {stats.totalSwaps > 0 && (
        <div className="mt-6 text-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              if (confirm("Are you sure you want to clear all analytics data?")) {
                analytics.clearAnalytics();
                setStats(analytics.getStats(period));
                setRecentActivity(analytics.getRecentActivity());
              }
            }}
          >
            Clear Analytics Data
          </Button>
        </div>
      )}
    </div>
  );
}
