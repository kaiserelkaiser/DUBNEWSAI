import { LiveTicker } from "@/components/dashboard/LiveTicker"
import { MarketOverview } from "@/components/dashboard/MarketOverview"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"

export default function MarketPage() {
  return (
    <div className="space-y-8">
      <PremiumPageHero
        eyebrow="Market command"
        title="A market board should feel like a capital desk, not a dashboard template."
        description="Core UAE boards, global real-estate names, macro pressure, FX, and Dubai weather now sit in one command surface designed for reading conviction quickly."
        chips={["UAE boards", "Global real-estate", "Macro signals", "FX + weather"]}
        stats={[
          {
            label: "Primary lens",
            value: "UAE + GCC capital flow",
            hint: "Built around local real-estate and adjacent finance names"
          },
          {
            label: "Context layer",
            value: "Macro + FX + weather",
            hint: "More than price tiles, less than a cluttered terminal"
          },
          {
            label: "Decision speed",
            value: "Brief in seconds",
            hint: "Clear provider, quality, and fallback visibility"
          },
          {
            label: "Experience",
            value: "Boardroom terminal",
            hint: "Premium depth without noisy complexity"
          }
        ]}
        tone="amber"
      />

      <LiveTicker />
      <MarketOverview />
    </div>
  )
}
