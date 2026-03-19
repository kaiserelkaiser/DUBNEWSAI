"use client"

import { useQuery } from "@tanstack/react-query"
import { Flame } from "lucide-react"

import { apiClient } from "@/lib/api/client"

interface TrendItem {
  keyword: string
  count: number
  trend_score: number
}

const fallbackTrends: TrendItem[] = [
  { keyword: "off-plan launches", count: 12, trend_score: 120 },
  { keyword: "mortgage demand", count: 9, trend_score: 90 },
  { keyword: "luxury waterfront", count: 7, trend_score: 70 }
]

export function TrendingTopics() {
  const { data } = useQuery<TrendItem[]>({
    queryKey: ["analytics", "trends"],
    queryFn: async () => {
      const response = await apiClient.get<TrendItem[]>("/analytics/trends", { params: { days: 7 } })
      return response.data
    },
    retry: false
  })

  const trends = data?.length ? data : fallbackTrends

  return (
    <section className="panel p-5">
      <div className="mb-4 flex items-center gap-2">
        <Flame className="h-4 w-4 text-gold-500" />
        <h3 className="text-lg font-display font-semibold text-slate-950 dark:text-white">Trending Topics</h3>
      </div>
      <div className="space-y-3">
        {trends.slice(0, 5).map((trend, index) => (
          <div
            key={trend.keyword}
            className="flex items-center justify-between rounded-2xl border border-white/10 bg-slate-950/5 px-4 py-3 dark:bg-white/5"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-gold-500">0{index + 1}</span>
              <span className="text-sm text-slate-700 dark:text-slate-200">{trend.keyword}</span>
            </div>
            <span className="rounded-full bg-cyber-500/10 px-2 py-1 text-xs font-medium text-cyber-500">
              {trend.count}x
            </span>
          </div>
        ))}
      </div>
    </section>
  )
}
