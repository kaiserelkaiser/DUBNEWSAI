"use client"

import { useQuery } from "@tanstack/react-query"
import { motion } from "framer-motion"
import { Flame, Sparkles } from "lucide-react"

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
    <section className="panel-premium overflow-hidden p-5">
      <div className="mb-5 flex items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] uppercase tracking-[0.28em] text-white/54">
            <Flame className="h-3.5 w-3.5 text-amber-200" />
            Trend radar
          </div>
          <h3 className="mt-3 text-2xl font-semibold text-white">Topics building momentum</h3>
        </div>
        <motion.div animate={{ rotate: [0, 12, 0] }} transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}>
          <Sparkles className="h-4 w-4 text-cyan-100/80" />
        </motion.div>
      </div>
      <div className="space-y-3">
        {trends.slice(0, 5).map((trend, index) => (
          <motion.div
            key={trend.keyword}
            initial={{ opacity: 0, x: -12 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.45, delay: index * 0.06 }}
            whileHover={{ x: 6 }}
            className="flex items-center justify-between rounded-[1.5rem] border border-white/10 bg-white/[0.03] px-4 py-4"
          >
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-amber-200">0{index + 1}</span>
              <div>
                <div className="text-sm font-medium text-white">{trend.keyword}</div>
                <div className="mt-1 text-xs uppercase tracking-[0.2em] text-white/38">Trend score {trend.trend_score}</div>
              </div>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/62">{trend.count}x</span>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
