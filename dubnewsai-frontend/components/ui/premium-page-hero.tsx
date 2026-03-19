"use client"

import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { motion } from "framer-motion"

import { cn } from "@/lib/utils"

type HeroTone = "cyan" | "amber" | "emerald" | "rose" | "violet"

interface HeroStat {
  label: string
  value: string
  hint?: string
}

interface HeroAction {
  label: string
  href: string
  external?: boolean
  variant?: "solid" | "ghost"
}

const toneMap: Record<HeroTone, { glow: string; orb: string; chip: string; line: string; statGlow: string }> = {
  cyan: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(96,165,250,0.12),transparent_24%)]",
    orb: "from-cyan-300/22 via-sky-300/8 to-transparent",
    chip: "border-cyan-300/15 bg-cyan-300/10 text-cyan-100/82",
    line: "from-transparent via-cyan-300/70 to-transparent",
    statGlow: "from-cyan-300/14"
  },
  amber: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(251,191,36,0.14),transparent_24%)]",
    orb: "from-amber-300/24 via-orange-300/10 to-transparent",
    chip: "border-amber-300/15 bg-amber-300/10 text-amber-100/84",
    line: "from-transparent via-amber-300/70 to-transparent",
    statGlow: "from-amber-300/14"
  },
  emerald: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(74,222,128,0.12),transparent_24%)]",
    orb: "from-emerald-300/22 via-green-300/10 to-transparent",
    chip: "border-emerald-300/15 bg-emerald-300/10 text-emerald-100/82",
    line: "from-transparent via-emerald-300/70 to-transparent",
    statGlow: "from-emerald-300/14"
  },
  rose: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(251,113,133,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.12),transparent_24%)]",
    orb: "from-rose-300/22 via-pink-300/10 to-transparent",
    chip: "border-rose-300/15 bg-rose-300/10 text-rose-100/84",
    line: "from-transparent via-rose-300/70 to-transparent",
    statGlow: "from-rose-300/14"
  },
  violet: {
    glow:
      "bg-[radial-gradient(circle_at_top_left,rgba(167,139,250,0.18),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(192,132,252,0.12),transparent_24%)]",
    orb: "from-violet-300/22 via-fuchsia-300/10 to-transparent",
    chip: "border-violet-300/15 bg-violet-300/10 text-violet-100/82",
    line: "from-transparent via-violet-300/70 to-transparent",
    statGlow: "from-violet-300/14"
  }
}

export function PremiumPageHero({
  eyebrow,
  title,
  description,
  stats = [],
  chips = [],
  actions = [],
  tone = "cyan",
  className
}: {
  eyebrow: string
  title: string
  description: string
  stats?: HeroStat[]
  chips?: string[]
  actions?: HeroAction[]
  tone?: HeroTone
  className?: string
}) {
  const theme = toneMap[tone]

  return (
    <section className={cn("panel-premium relative overflow-hidden p-8 sm:p-10 lg:p-12", className)}>
      <div className={cn("absolute inset-0", theme.glow)} />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:32px_32px]" />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, 18, 0], rotate: [0, 6, 0] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className={cn(
          "pointer-events-none absolute -right-24 top-10 h-72 w-72 rounded-full bg-gradient-to-br blur-3xl",
          theme.orb
        )}
      />
      <motion.div
        aria-hidden="true"
        animate={{ y: [0, -12, 0], rotate: [0, -8, 0] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className={cn(
          "pointer-events-none absolute -left-12 bottom-6 h-48 w-48 rounded-full bg-gradient-to-br blur-3xl",
          theme.orb
        )}
      />
      <div className={cn("pointer-events-none absolute inset-x-14 top-0 h-px bg-gradient-to-r", theme.line)} />

      <div className="relative grid gap-10 xl:grid-cols-[minmax(0,1.15fr)_420px] xl:items-end">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="max-w-4xl"
        >
          <div className={cn("inline-flex items-center gap-2 rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.34em]", theme.chip)}>
            {eyebrow}
          </div>
          <h1 className="mt-5 max-w-4xl text-balance font-editorial text-5xl font-semibold leading-[0.94] text-white sm:text-6xl lg:text-7xl">
            {title}
          </h1>
          <p className="mt-6 max-w-3xl text-base leading-8 text-white/60 sm:text-lg">
            {description}
          </p>

          {chips.length ? (
            <div className="mt-7 flex flex-wrap gap-2">
              {chips.map((chip, index) => (
                <motion.span
                  key={chip}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.12 * index, duration: 0.45 }}
                  className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-2 text-xs text-white/72"
                >
                  {chip}
                </motion.span>
              ))}
            </div>
          ) : null}

          {actions.length ? (
            <div className="mt-8 flex flex-wrap gap-3">
              {actions.map((action) => {
                const solid = action.variant !== "ghost"
                return (
                  <Link
                    key={`${action.label}-${action.href}`}
                    href={action.href}
                    target={action.external ? "_blank" : undefined}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition",
                      solid
                        ? "bg-white text-slate-950 hover:bg-white/92"
                        : "border border-white/10 bg-white/[0.04] text-white/78 hover:text-white"
                    )}
                  >
                    {action.label}
                    <ArrowUpRight className="h-4 w-4" />
                  </Link>
                )
              })}
            </div>
          ) : null}
        </motion.div>

        {stats.length ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
            {stats.map((stat, index) => (
              <motion.article
                key={stat.label}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + index * 0.08, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
                className="relative overflow-hidden rounded-[1.8rem] border border-white/10 bg-white/[0.04] p-5 backdrop-blur-2xl"
              >
                <div className={cn("absolute inset-x-0 top-0 h-px bg-gradient-to-r to-transparent", theme.line)} />
                <div className={cn("absolute inset-0 bg-gradient-to-br to-transparent opacity-80", theme.statGlow)} />
                <div className="relative">
                  <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">{stat.label}</div>
                  <div className="mt-4 text-3xl font-semibold text-white">{stat.value}</div>
                  {stat.hint ? <div className="mt-2 text-sm leading-6 text-white/50">{stat.hint}</div> : null}
                </div>
              </motion.article>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
