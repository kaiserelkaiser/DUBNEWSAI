"use client"

import { motion } from "framer-motion"
import { Activity, ArrowUpRight, Building2, Newspaper } from "lucide-react"

import { useMarketData } from "@/lib/hooks/useMarketData"
import { useNews } from "@/lib/hooks/useNews"
import { formatCompactNumber } from "@/lib/utils/formatters"

const cards = [
  {
    label: "Tracked stocks",
    accent: "from-cyan-300/18 to-transparent",
    icon: Activity,
    caption: "Boards actively watched"
  },
  {
    label: "News volume",
    accent: "from-amber-300/18 to-transparent",
    icon: Newspaper,
    caption: "Indexed multi-source stories"
  },
  {
    label: "Developers watched",
    accent: "from-emerald-300/18 to-transparent",
    icon: Building2,
    caption: "Core companies in rotation"
  }
] as const

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
          <motion.article
            key={card.label}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, delay: index * 0.06 }}
            whileHover={{ y: -8 }}
            className="panel-premium relative overflow-hidden p-5"
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.accent}`} />
            <div className="absolute inset-0 opacity-0 transition duration-300 group-hover:opacity-100" />
            <div className="relative">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[10px] uppercase tracking-[0.3em] text-white/40">{card.label}</p>
                  <p className="mt-4 text-4xl font-semibold text-white">{formatCompactNumber(values[index])}</p>
                  <p className="mt-2 text-sm text-white/46">{card.caption}</p>
                </div>
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 6 + index, repeat: Infinity, ease: "easeInOut" }}
                  className="rounded-full border border-white/10 bg-white/[0.04] p-3 text-white"
                >
                  <Icon className="h-4 w-4" />
                </motion.div>
              </div>
              <div className="mt-8 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-emerald-200/82">
                <ArrowUpRight className="h-3.5 w-3.5" />
                Streaming in real time
              </div>
            </div>
          </motion.article>
        )
      })}
    </section>
  )
}
