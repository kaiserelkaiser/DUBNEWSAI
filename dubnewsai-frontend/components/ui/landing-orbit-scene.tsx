"use client"

import { motion } from "framer-motion"
import { ArrowUpRight, BarChart3, Building2, Globe2, Newspaper, RadioTower, TrendingUp } from "lucide-react"

const watchlist = [
  { symbol: "EMAAR", move: "+1.84%", tone: "text-emerald-300" },
  { symbol: "ALDAR", move: "+0.92%", tone: "text-emerald-300" },
  { symbol: "DAMAC", move: "Watch", tone: "text-amber-200" }
] as const

const coverage = [
  { label: "News", value: "Dubai, UAE, GCC" },
  { label: "Markets", value: "DFM, ADX, FX" },
  { label: "Context", value: "Macro, sentiment, weather" }
] as const

export function LandingOrbitScene() {
  return (
    <div className="relative aspect-[4/5] min-h-[420px] w-full overflow-hidden rounded-[2rem] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_34%),linear-gradient(180deg,#091018_0%,#07080d_100%)] p-4 sm:p-5">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(34,211,238,0.15),transparent_20%),radial-gradient(circle_at_80%_80%,rgba(245,158,11,0.12),transparent_24%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] [background-size:26px_26px]" />

      <div className="relative flex h-full flex-col gap-4 rounded-[1.6rem] border border-white/10 bg-[#05070c]/78 p-4 backdrop-blur-2xl">
        <div className="flex items-center justify-between rounded-[1.2rem] border border-white/10 bg-white/[0.03] px-4 py-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.35em] text-white/40">Live briefing</div>
            <div className="mt-2 text-sm font-semibold text-white">Dubai market intelligence</div>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/15 bg-emerald-300/10 px-3 py-1 text-[10px] uppercase tracking-[0.24em] text-emerald-100/82">
            <RadioTower className="h-3.5 w-3.5" />
            Realtime
          </div>
        </div>

        <div className="grid flex-1 gap-4 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.32em] text-white/40">Market pulse</div>
                <div className="mt-2 font-editorial text-3xl font-semibold leading-tight text-white">Track the symbols, the stories, and the wider signal.</div>
              </div>
              <TrendingUp className="h-6 w-6 text-cyan-100" />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-3">
              {coverage.map((item) => (
                <div key={item.label} className="rounded-[1.1rem] border border-white/10 bg-white/[0.03] px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.24em] text-white/36">{item.label}</div>
                  <div className="mt-2 text-sm font-medium text-white/82">{item.value}</div>
                </div>
              ))}
            </div>

            <div className="mt-5 rounded-[1.3rem] border border-white/10 bg-[linear-gradient(135deg,rgba(34,211,238,0.1),rgba(255,255,255,0.03))] p-4">
              <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.28em] text-white/40">
                <span>Top story</span>
                <span>Updated now</span>
              </div>
              <div className="mt-3 flex items-start gap-3">
                <Newspaper className="mt-1 h-4 w-4 text-amber-200" />
                <div>
                  <div className="text-base font-semibold text-white">Dubai property, capital flows, and listed developers in one feed.</div>
                  <div className="mt-2 text-sm leading-7 text-white/56">Read the full article on-platform first, then jump to the original source only if you need more.</div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
                <Building2 className="h-3.5 w-3.5 text-cyan-200" />
                UAE watchlist
              </div>
              <div className="mt-4 space-y-3">
                {watchlist.map((item, index) => (
                  <motion.div
                    key={item.symbol}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.12 * index, duration: 0.45 }}
                    className="flex items-center justify-between rounded-[1rem] border border-white/10 bg-white/[0.03] px-3 py-3"
                  >
                    <span className="text-sm font-semibold text-white">{item.symbol}</span>
                    <span className={`text-xs font-medium ${item.tone}`}>{item.move}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.32em] text-white/40">
                <Globe2 className="h-3.5 w-3.5 text-amber-200" />
                Signal stack
              </div>
              <div className="mt-4 space-y-3 text-sm text-white/66">
                <div className="flex items-center justify-between rounded-[1rem] border border-white/10 px-3 py-3">
                  <span>Provider-aware coverage</span>
                  <ArrowUpRight className="h-4 w-4 text-white/42" />
                </div>
                <div className="flex items-center justify-between rounded-[1rem] border border-white/10 px-3 py-3">
                  <span>FX and macro context</span>
                  <BarChart3 className="h-4 w-4 text-white/42" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
