"use client"

import { useQuery } from "@tanstack/react-query"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { TrendingTopics } from "@/components/dashboard/TrendingTopics"
import { PremiumPageHero } from "@/components/ui/premium-page-hero"
import { apiClient } from "@/lib/api/client"

interface SentimentDistribution {
  positive: number
  neutral: number
  negative: number
  total: number
  positive_percent: number
  neutral_percent: number
  negative_percent: number
}

export default function AnalyticsPage() {
  const { data } = useQuery<SentimentDistribution>({
    queryKey: ["analytics", "sentiment-distribution"],
    queryFn: async () => {
      const response = await apiClient.get<SentimentDistribution>("/analytics/sentiment-distribution")
      return response.data
    }
  })

  const cards = [
    { label: "Positive", value: `${data?.positive_percent ?? 0}%`, accent: "text-emerald-300" },
    { label: "Neutral", value: `${data?.neutral_percent ?? 0}%`, accent: "text-cyan-200" },
    { label: "Negative", value: `${data?.negative_percent ?? 0}%`, accent: "text-red-300" },
    { label: "Articles analyzed", value: `${data?.total ?? 0}`, accent: "text-amber-200" }
  ]

  return (
    <AuthGuard>
      <div className="space-y-8">
        <PremiumPageHero
          eyebrow="Analytics command"
          title="Sentiment should read like an intelligence brief, not a math exercise."
          description="The analytics layer now turns raw percentages into a clearer narrative surface, so the user can understand mood, pressure, and topic direction without bouncing between disconnected widgets."
          chips={["Sentiment balance", "Topic momentum", "Narrative context", "Readable ratios"]}
          stats={[
            {
              label: "Positive share",
              value: `${data?.positive_percent ?? 0}%`,
              hint: "Constructive tone across the article pool"
            },
            {
              label: "Neutral share",
              value: `${data?.neutral_percent ?? 0}%`,
              hint: "Informational coverage without clear directional bias"
            },
            {
              label: "Negative share",
              value: `${data?.negative_percent ?? 0}%`,
              hint: "Stress stories and pressure signals"
            },
            {
              label: "Analyzed pool",
              value: `${data?.total ?? 0}`,
              hint: "Stories currently feeding the model layer"
            }
          ]}
          tone="emerald"
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <article key={card.label} className="panel-premium p-5">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{card.label}</p>
              <p className={`mt-4 text-4xl font-semibold ${card.accent}`}>{card.value}</p>
            </article>
          ))}
        </section>

        <section className="panel-premium p-6 sm:p-8">
          <div className="mb-5">
            <p className="story-kicker">Sentiment balance</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Market mood in one continuous band</h2>
          </div>

          <div className="overflow-hidden rounded-full border border-white/10 bg-white/[0.04]">
            <div className="flex h-6 w-full">
              <div className="bg-emerald-400" style={{ width: `${data?.positive_percent ?? 0}%` }} />
              <div className="bg-cyan-400" style={{ width: `${data?.neutral_percent ?? 0}%` }} />
              <div className="bg-red-400" style={{ width: `${data?.negative_percent ?? 0}%` }} />
            </div>
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/68">Positive stories currently represent the strongest share of the analyzed pool.</div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/68">Neutral coverage captures informational updates without directional market pressure.</div>
            <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.03] px-4 py-4 text-sm text-white/68">Negative signals remain visible so stress stories are not buried under volume.</div>
          </div>
        </section>

        <TrendingTopics />
      </div>
    </AuthGuard>
  )
}
