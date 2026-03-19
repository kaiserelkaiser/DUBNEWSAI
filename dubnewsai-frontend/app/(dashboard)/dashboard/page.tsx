import { AuthGuard } from "@/components/auth/AuthGuard"
import { HeroSection } from "@/components/dashboard/HeroSection"
import { LiveTicker } from "@/components/dashboard/LiveTicker"
import { MarketOverview } from "@/components/dashboard/MarketOverview"
import { QuickStats } from "@/components/dashboard/QuickStats"
import { TrendingTopics } from "@/components/dashboard/TrendingTopics"
import { NewsFeed } from "@/components/news/NewsFeed"

export default function DashboardPage() {
  return (
    <AuthGuard>
      <div className="min-w-0 space-y-8">
        <HeroSection />
        <LiveTicker />
        <QuickStats />

        <div className="grid min-w-0 gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="min-w-0">
            <NewsFeed pageSize={6} compact />
          </div>
          <div className="min-w-0">
            <TrendingTopics />
          </div>
        </div>

        <MarketOverview compact />
      </div>
    </AuthGuard>
  )
}
