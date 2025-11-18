interface SwapEvent {
  type: "swap";
  timestamp: number;
  user: string;
  tokenIn: string;
  tokenOut: string;
  amountIn: string;
  amountOut: string;
  route: string;
  txHash: string;
  chainId: number;
}

interface BridgeEvent {
  type: "bridge";
  timestamp: number;
  user: string;
  token: string;
  amount: string;
  fromChain: number;
  toChain: number;
  protocol: string;
  txHash: string;
}

type AnalyticsEvent = SwapEvent | BridgeEvent;

const STORAGE_KEY = "defiswap_analytics";
const MAX_EVENTS = 1000;

class AnalyticsService {
  private events: AnalyticsEvent[] = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.events = JSON.parse(stored);
      }
    } catch (error) {
      console.error("Failed to load analytics from storage:", error);
    }
  }

  private saveToStorage() {
    try {
      if (this.events.length > MAX_EVENTS) {
        this.events = this.events.slice(-MAX_EVENTS);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.events));
    } catch (error) {
      console.error("Failed to save analytics to storage:", error);
    }
  }

  trackSwap(data: Omit<SwapEvent, "type" | "timestamp">) {
    const event: SwapEvent = {
      type: "swap",
      timestamp: Date.now(),
      ...data,
    };
    this.events.push(event);
    this.saveToStorage();
    
    console.log("Analytics: Swap tracked", event);
  }

  trackBridge(data: Omit<BridgeEvent, "type" | "timestamp">) {
    const event: BridgeEvent = {
      type: "bridge",
      timestamp: Date.now(),
      ...data,
    };
    this.events.push(event);
    this.saveToStorage();
    
    console.log("Analytics: Bridge tracked", event);
  }

  getStats(period: "24h" | "7d" | "30d" | "all" = "all") {
    const now = Date.now();
    const periodMs = {
      "24h": 24 * 60 * 60 * 1000,
      "7d": 7 * 24 * 60 * 60 * 1000,
      "30d": 30 * 24 * 60 * 60 * 1000,
      "all": Infinity,
    };

    const filteredEvents = this.events.filter(
      (e) => now - e.timestamp < periodMs[period]
    );

    const swaps = filteredEvents.filter((e) => e.type === "swap") as SwapEvent[];
    const bridges = filteredEvents.filter((e) => e.type === "bridge") as BridgeEvent[];

    const totalVolume = swaps.reduce((sum, swap) => {
      const amountOut = parseFloat(swap.amountOut);
      return sum + (isNaN(amountOut) ? 0 : amountOut);
    }, 0);

    const uniqueUsers = new Set([
      ...swaps.map((s) => s.user.toLowerCase()),
      ...bridges.map((b) => b.user.toLowerCase()),
    ]).size;

    const topPairs = this.getTopPairs(swaps);
    const routeDistribution = this.getRouteDistribution(swaps);

    return {
      totalSwaps: swaps.length,
      totalBridges: bridges.length,
      totalVolume,
      uniqueUsers,
      topPairs,
      routeDistribution,
    };
  }

  private getTopPairs(swaps: SwapEvent[]) {
    const pairCounts = new Map<string, number>();
    
    swaps.forEach((swap) => {
      const pair = `${swap.tokenIn}/${swap.tokenOut}`;
      pairCounts.set(pair, (pairCounts.get(pair) || 0) + 1);
    });

    return Array.from(pairCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([pair, count]) => ({ pair, count }));
  }

  private getRouteDistribution(swaps: SwapEvent[]) {
    const routeCounts = new Map<string, number>();
    
    swaps.forEach((swap) => {
      routeCounts.set(swap.route, (routeCounts.get(swap.route) || 0) + 1);
    });

    return Array.from(routeCounts.entries()).map(([route, count]) => ({
      route,
      count,
      percentage: (count / swaps.length) * 100,
    }));
  }

  getRecentActivity(limit = 10): AnalyticsEvent[] {
    return this.events.slice(-limit).reverse();
  }

  clearAnalytics() {
    this.events = [];
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const analytics = new AnalyticsService();
