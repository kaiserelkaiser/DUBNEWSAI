import { LiveTicker } from "@/components/dashboard/LiveTicker"
import { MarketOverview } from "@/components/dashboard/MarketOverview"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"

export default function MarketPage() {
  return (
    <div className="space-y-8">
      <PremiumPageHero
        eyebrow="Market command"
        title="Track Dubai markets with the context serious decisions require."
        description="Follow UAE-listed names, global real-estate benchmarks, FX, macro indicators, and Dubai weather in one board built to help you brief fast and go deep when needed."
        chips={["UAE boards", "Global real-estate", "Macro signals", "FX + weather"]}
        stats={[
          {
            label: "Primary lens",
            value: "UAE + GCC capital flow",
            hint: "Focused on local developers and the broader capital picture"
          },
          {
            label: "Context layer",
            value: "Macro + FX + weather",
            hint: "The surrounding signals that shape price interpretation"
          },
          {
            label: "Decision speed",
            value: "Brief in seconds",
            hint: "Provider, quality, and fallback visibility stay in the interface"
          },
          {
            label: "Coverage mode",
            value: "Signal, then depth",
            hint: "Start with the snapshot and expand only when necessary"
          }
        ]}
        tone="amber"
      />

      <LiveTicker />
      <MarketOverview />
    </div>
  )
}
