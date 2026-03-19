"use client"

import { Activity, ArrowUpRight, Building2, Newspaper } from "lucide-react"

import { useMarketData } from "@/lib/hooks/useMarketData"
import { useNews } from "@/lib/hooks/useNews"
import { formatCompactNumber } from "@/lib/utils/formatters"

const cards = [
  {
    label: "Tracked Stocks",
    accent: "from-cyber-500/20 to-cyber-500/5",
    icon: Activity
  },
  {
    label: "News Volume",
    accent: "from-gold-500/20 to-gold-500/5",
    icon: Newspaper
  },
  {
    label: "Developers Watched",
    accent: "from-emerald-500/20 to-emerald-500/5",
    icon: Building2
  }
]

export function QuickStats() {
  const { data: stocks } = useMarketData(20)
  const { data: news } = useNews({ page: 1, page_size: 12 })

  const values = [
    stocks?.length || 0,
    news?.total || 0,
    Math.max(6, Math.round((stocks?.length || 0) / 2))
  ]

  return (
    <section className="grid gap-4 md:grid-cols-3">
      {cards.map((card, index) => {
        const Icon = card.icon
        return (
          <div
            key={card.label}
            className={`panel overflow-hidden bg-gradient-to-br ${card.accent} p-5`}
          >
            <div className="mb-6 flex items-start justify-between">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">{card.label}</p>
                <p className="mt-2 text-3xl font-display font-semibold text-slate-950 dark:text-white">
                  {formatCompactNumber(values[index])}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-slate-950 p-3 text-white">
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-emerald-600 dark:text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span>Streaming in real time</span>
            </div>
          </div>
        )
      })}
    </section>
  )
}
