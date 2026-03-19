"use client"

import { useQuery } from "@tanstack/react-query"

import { AuthGuard } from "@/components/auth/AuthGuard"
import { TrendingTopics } from "@/components/dashboard/TrendingTopics"
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
    { label: "Positive", value: `${data?.positive_percent ?? 0}%`, accent: "text-emerald-500" },
    { label: "Neutral", value: `${data?.neutral_percent ?? 0}%`, accent: "text-cyber-500" },
    { label: "Negative", value: `${data?.negative_percent ?? 0}%`, accent: "text-red-500" },
    { label: "Articles analyzed", value: `${data?.total ?? 0}`, accent: "text-gold-500" }
  ]

  return (
    <AuthGuard>
      <div className="space-y-6">
      <div>
        <p className="text-sm uppercase tracking-[0.3em] text-cyber-500">Analytics</p>
        <h1 className="text-3xl font-display font-semibold text-slate-950 dark:text-white">AI Signal Monitor</h1>
      </div>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <article key={card.label} className="panel p-5">
            <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
            <p className={`mt-3 text-4xl font-display font-semibold ${card.accent}`}>{card.value}</p>
          </article>
        ))}
      </section>

      <section className="panel p-6">
        <div className="mb-4">
          <p className="text-sm uppercase tracking-[0.25em] text-gold-500">Sentiment Balance</p>
          <h2 className="mt-2 text-2xl font-display font-semibold text-slate-950 dark:text-white">Market mood</h2>
        </div>

        <div className="h-4 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div className="flex h-full w-full">
            <div className="bg-emerald-500" style={{ width: `${data?.positive_percent ?? 0}%` }} />
            <div className="bg-cyber-500" style={{ width: `${data?.neutral_percent ?? 0}%` }} />
            <div className="bg-red-500" style={{ width: `${data?.negative_percent ?? 0}%` }} />
          </div>
        </div>
      </section>

      <TrendingTopics />
    </div>
    </AuthGuard>
  )
}
