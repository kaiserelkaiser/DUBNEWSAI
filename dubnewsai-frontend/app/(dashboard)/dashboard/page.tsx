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
      <div className="space-y-8">
        <HeroSection />
        <LiveTicker />
        <QuickStats />

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div>
            <NewsFeed pageSize={8} />
          </div>
          <div>
            <TrendingTopics />
          </div>
        </div>

        <MarketOverview />
      </div>
    </AuthGuard>
  )
}
