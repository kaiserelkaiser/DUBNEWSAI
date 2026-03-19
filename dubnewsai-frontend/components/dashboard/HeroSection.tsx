"use client"

import { motion } from "framer-motion"
import { Activity, DollarSign, TrendingUp } from "lucide-react"
import type { ReactNode } from "react"

export function HeroSection() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-gold-500 via-gold-600 to-gold-700 p-8 text-white shadow-gold"
    >
      <div className="absolute inset-0 opacity-15">
        <div className="absolute inset-0 bg-[url('/patterns/grid.svg')] bg-center [mask-image:radial-gradient(white,transparent_70%)]" />
      </div>
      <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-cyber-400/20 blur-3xl" />
      <div className="absolute bottom-0 left-0 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl" />

      <div className="relative z-10">
        <motion.h1
          className="mb-2 text-4xl font-display font-bold md:text-5xl"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.15 }}
        >
          Dubai Real Estate Market
        </motion.h1>
        <motion.p
          className="mb-6 max-w-2xl text-lg text-gold-100"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.25 }}
        >
          Premium AI signals, live market motion, and fast-moving storylines for the city shaping tomorrow.
        </motion.p>

        <div className="flex flex-wrap gap-4">
          <StatBadge
            icon={<TrendingUp className="h-4 w-4" />}
            label="Market Trend"
            value="+12.5%"
            positive
          />
          <StatBadge icon={<Activity className="h-4 w-4" />} label="Live Updates" value="247" />
          <StatBadge icon={<DollarSign className="h-4 w-4" />} label="Avg. Price" value="AED 1.2M" />
        </div>
      </div>
    </motion.div>
  )
}

function StatBadge({
  icon,
  label,
  value,
  positive
}: {
  icon: ReactNode
  label: string
  value: string
  positive?: boolean
}) {
  return (
    <div className="rounded-2xl bg-white/20 px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center gap-3">
        <div className={positive ? "text-emerald-300" : "text-white"}>{icon}</div>
        <div>
          <div className="text-xs uppercase tracking-widest text-gold-100">{label}</div>
          <div className={positive ? "font-semibold text-emerald-300" : "font-semibold text-white"}>
            {value}
          </div>
        </div>
      </div>
    </div>
  )
}
