"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  BellRing,
  Building2,
  CandlestickChart,
  Globe2,
  Radar,
  ShieldCheck,
  Waves
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { LandingOrbitScene } from "@/components/ui/landing-orbit-scene"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { SparklesCore } from "@/components/ui/sparkles"

const commandStats = [
  { label: "Live feeds", value: "20+" },
  { label: "Coverage", value: "News + Equities + FX" },
  { label: "Update cycle", value: "Minutes, not hours" }
] as const

const bentoCards: ReadonlyArray<{
  eyebrow: string
  title: string
  copy: string
  icon: typeof Radar
  span?: string
}> = [
  {
    eyebrow: "Signal Density",
    title: "News, listed developers, FX, macro, and market context in one platform.",
    copy:
      "DUBNEWSAI connects the story, the symbol, and the wider market backdrop so users can understand what is happening in Dubai without stitching tools together.",
    icon: Radar,
    span: "lg:col-span-2"
  },
  {
    eyebrow: "Coverage",
    title: "Dubai and UAE market intelligence.",
    copy: "Track property headlines, DFM and ADX names, business updates, and regional context from multiple sources in one flow.",
    icon: Globe2
  },
  {
    eyebrow: "Trust",
    title: "Provider-aware intelligence.",
    copy: "Source context, fallback handling, and enrichment signals help users judge confidence instead of treating every datapoint the same.",
    icon: ShieldCheck
  },
  {
    eyebrow: "Workflow",
    title: "Built for active monitoring.",
    copy: "Watch movers, read the story, and react faster with alerts, on-platform article detail, and market context side by side.",
    icon: BellRing
  },
  {
    eyebrow: "Audience",
    title: "Made for investors, brokers, operators, and advisors.",
    copy: "DUBNEWSAI turns fragmented Dubai market signals into a readable command center that supports faster and more confident decisions.",
    icon: CandlestickChart,
    span: "lg:col-span-2"
  }
]

const intelligenceRows = [
  {
    title: "Live market briefings",
    text: "Follow UAE symbols, indices, FX, and macro pressure without switching between disconnected dashboards.",
    icon: Waves
  },
  {
    title: "Readable news detail",
    text: "Open a story and read the important context directly on DUBNEWSAI before deciding whether you need the original source.",
    icon: Building2
  },
  {
    title: "Decision-ready dashboards",
    text: "See only the most useful market and news signals first, then go deeper into dedicated pages when you need more detail.",
    icon: BarChart3
  }
] as const

export default function LandingPage() {
  return (
    <div className="overflow-x-hidden bg-[#050506] text-white">
      <LandingNav />

      <HeroGeometric
        badge="Dubai Market Intelligence"
        title1="Know Dubai"
        title2="before the market moves"
        description="DUBNEWSAI brings together Dubai market news, listed developers, FX, macro indicators, and live alerts so investors and operators can act with context instead of guesswork."
        actions={
          <>
            <Link
              href="/news"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
            >
              Explore news
            </Link>
            <Link
              href="/market"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              View market
            </Link>
          </>
        }
        meta={
          <div className="grid gap-3 sm:grid-cols-3">
            {commandStats.map((stat) => (
              <div key={stat.label} className="rounded-3xl border border-white/10 bg-white/[0.04] px-5 py-4 backdrop-blur-xl">
                <div className="text-[10px] uppercase tracking-[0.35em] text-white/45">{stat.label}</div>
                <div className="mt-3 text-sm font-medium text-white/88">{stat.value}</div>
              </div>
            ))}
          </div>
        }
      >
        <LandingOrbitScene />
      </HeroGeometric>

      <section className="relative overflow-hidden border-t border-white/10 py-24">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,211,238,0.08),transparent_22%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_30%)]" />
        <div className="mx-auto grid max-w-7xl gap-16 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-[#0a0d12] p-8">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
              <div className="relative h-[23rem] overflow-hidden rounded-[1.5rem] bg-[#020308]">
                <SparklesCore
                  background="transparent"
                  minSize={0.4}
                  maxSize={1}
                  particleDensity={180}
                  className="absolute inset-0 h-full w-full"
                  particleColor="#f8fafc"
                  speed={0.6}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.24),transparent_18%),linear-gradient(180deg,rgba(8,15,26,0)_0%,rgba(8,15,26,0.85)_90%)]" />
                <div className="absolute inset-x-8 bottom-8">
                  <div className="text-[10px] uppercase tracking-[0.45em] text-cyan-100/50">Why DUBNEWSAI</div>
                  <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em]">
                    One place to read the story, track the symbol, and understand the context.
                  </h2>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="grid gap-6 lg:grid-cols-2">
            {bentoCards.map((card, index) => {
              const Icon = card.icon

              return (
                <motion.article
                  key={card.title}
                  initial={{ opacity: 0, y: 26 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.72, delay: index * 0.08 }}
                  className={`rounded-[2rem] border border-white/10 bg-white/[0.03] p-7 backdrop-blur-xl ${card.span || ""}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-[0.35em] text-white/42">{card.eyebrow}</span>
                    <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-cyan-100">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="mt-8 max-w-xl text-2xl font-semibold leading-tight tracking-[-0.03em] text-white">
                    {card.title}
                  </h3>
                  <p className="mt-4 max-w-2xl text-sm leading-7 text-white/58">{card.copy}</p>
                </motion.article>
              )
            })}
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr]">
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-[10px] uppercase tracking-[0.45em] text-amber-200/58">How the platform helps</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Built to help users understand what matters in Dubai, faster.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
                From breaking headlines and developer coverage to FX, macro, and market boards, DUBNEWSAI turns scattered information into one clear operating view.
              </p>
            </motion.div>

            <div className="space-y-4">
              {intelligenceRows.map((row, index) => {
                const Icon = row.icon

                return (
                  <motion.div
                    key={row.title}
                    initial={{ opacity: 0, x: 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.25 }}
                    transition={{ duration: 0.7, delay: index * 0.08 }}
                    className="group rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/20 hover:bg-white/[0.05]"
                  >
                    <div className="flex items-start gap-4">
                      <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-3 text-amber-100">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold tracking-[-0.03em]">{row.title}</h3>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/56">{row.text}</p>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-white/10 py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.8 }}
            className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.06),rgba(255,255,255,0.02))] px-8 py-10 shadow-[0_40px_140px_-50px_rgba(0,0,0,0.85)] sm:px-12"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.1),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.1),transparent_22%)]" />
            <div className="relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
              <div>
                <p className="text-[10px] uppercase tracking-[0.45em] text-white/46">Start from one source of truth</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Follow Dubai real-estate news and market intelligence from one premium platform.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/56">
                  Open the news feed, monitor the market board, and move into deeper analytics or alerts only when you need them. Every page is tuned to stay fast, readable, and useful under real daily use.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/market"
                  className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                >
                  View market
                </Link>
                <Link
                  href="/news"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
                >
                  Open news
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}

function LandingNav() {
  return (
    <div className="fixed inset-x-0 top-0 z-50">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-5 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/30 px-4 py-2 backdrop-blur-xl">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-xs font-bold text-slate-950">D</span>
          <span className="text-xs font-semibold uppercase tracking-[0.42em] text-white/78">DUBNEWSAI</span>
        </Link>

        <div className="hidden items-center gap-3 md:flex">
          <NavLink href="/news">News</NavLink>
          <NavLink href="/market">Market</NavLink>
          <NavLink href="/login">Login</NavLink>
          <Link
            href="/register"
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white px-5 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-white/92"
          >
            Get access
          </Link>
        </div>
      </div>
    </div>
  )
}

function NavLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm font-medium text-white/68 backdrop-blur-xl transition hover:text-white"
    >
      {children}
    </Link>
  )
}
