import { LiveTicker } from "@/components/dashboard/LiveTicker"
import { MarketOverview } from "@/components/dashboard/MarketOverview"

export default function MarketPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyber-500">Market</p>
        <h1 className="text-3xl font-display font-semibold text-slate-950 dark:text-white">Realtime Market View</h1>
      </div>
      <LiveTicker />
      <MarketOverview />
    </div>
  )
}
