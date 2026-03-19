"use client"

import { motion } from "framer-motion"
import {
  ArrowRight,
  BarChart3,
  Building2,
  CandlestickChart,
  Globe2,
  Radar,
  ShieldCheck,
  Sparkles,
  Waves
} from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

import { LandingOrbitScene } from "@/components/ui/landing-orbit-scene"
import { HeroGeometric } from "@/components/ui/shape-landing-hero"
import { SparklesCore } from "@/components/ui/sparkles"

const commandStats = [
  { label: "Live feeds", value: "20+" },
  { label: "Market lenses", value: "DFM + ADX + Global" },
  { label: "Alert cadence", value: "Near real time" }
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
    title: "News, market structure, macro, FX, and local context in one surface.",
    copy:
      "DUBNEWSAI is built for investors, operators, and advisors who need more than a basic feed. Every signal is layered, ranked, and designed for action.",
    icon: Radar,
    span: "lg:col-span-2"
  },
  {
    eyebrow: "Coverage",
    title: "UAE-first intelligence.",
    copy: "Dubai property, listed developers, macro indicators, currencies, and breaking regional stories without dead gaps.",
    icon: Globe2
  },
  {
    eyebrow: "Quality",
    title: "Provider-aware orchestration.",
    copy: "Fallback logic, deduplication, and source scoring prevent noisy or empty states from taking over the experience.",
    icon: ShieldCheck
  },
  {
    eyebrow: "Market",
    title: "Designed for active monitoring.",
    copy: "Indices, watchlists, FX pairs, and contextual headlines move together so users can understand cause, not just price.",
    icon: CandlestickChart
  },
  {
    eyebrow: "Product",
    title: "Editorial design, not dashboard clutter.",
    copy: "Landing experiences and content surfaces are built to feel premium, calm, and high-trust instead of noisy and template-driven.",
    icon: Sparkles,
    span: "lg:col-span-2"
  }
]

const intelligenceRows = [
  {
    title: "Market pulse ribbon",
    text: "A cinematic header band that can surface movers, FX, DFM/ADX direction, and economic pressure in one glance.",
    icon: Waves
  },
  {
    title: "Editorial news architecture",
    text: "Lead story, secondary story rail, and grouped source coverage so important stories stop looking like a flat card list.",
    icon: Building2
  },
  {
    title: "Research-grade snapshots",
    text: "Short-form executive summaries paired with direct underlying sources for faster reading without sacrificing traceability.",
    icon: BarChart3
  }
] as const

export default function LandingPage() {
  return (
    <div className="bg-[#050506] text-white">
      <LandingNav />

      <HeroGeometric
        badge="Dubai Intelligence Layer"
        title1="Rare signal design"
        title2="for a serious market platform"
        description="A new DUBNEWSAI front door built like a premium product, not a generic dashboard. Multi-source market intelligence, editorial-grade news presentation, and a visual system that looks expensive because it is intentional."
        actions={
          <>
            <Link
              href="/news"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
            >
              Explore live intelligence
            </Link>
            <Link
              href="/register"
              className="inline-flex items-center justify-center rounded-full border border-white/12 bg-white/[0.04] px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.08]"
            >
              Request premium access
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
                  maxSize={1.2}
                  particleDensity={900}
                  className="absolute inset-0 h-full w-full"
                  particleColor="#f8fafc"
                  speed={0.9}
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_35%,rgba(255,255,255,0.24),transparent_18%),linear-gradient(180deg,rgba(8,15,26,0)_0%,rgba(8,15,26,0.85)_90%)]" />
                <div className="absolute inset-x-8 bottom-8">
                  <div className="text-[10px] uppercase tracking-[0.45em] text-cyan-100/50">Signal lattice</div>
                  <h2 className="mt-4 max-w-md text-4xl font-semibold leading-tight tracking-[-0.04em]">
                    Design language that makes data feel collected, not dumped.
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
              <p className="text-[10px] uppercase tracking-[0.45em] text-amber-200/58">Landing direction</p>
              <h2 className="mt-5 max-w-2xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                The new frontend should read like a financial publication and move like a product launch.
              </h2>
              <p className="mt-6 max-w-xl text-base leading-8 text-white/58">
                This first pass resets the public face of the platform: stronger hierarchy, richer motion, a premium palette,
                and a visual system ready to scale into the rest of the app instead of collapsing into template cards.
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
                <p className="text-[10px] uppercase tracking-[0.45em] text-white/46">Phase one shipped</p>
                <h2 className="mt-4 max-w-3xl text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                  Landing page rebuilt around motion, atmosphere, and information hierarchy.
                </h2>
                <p className="mt-5 max-w-2xl text-base leading-8 text-white/56">
                  Next we can carry the same system into the news index, article detail, market overview, dashboards, and
                  premium user flows instead of redesigning page by page without a common visual language.
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
