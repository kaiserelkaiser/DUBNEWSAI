"use client"

import { motion } from "framer-motion"
import { BarChart3, Bell, Download, Newspaper, TrendingUp, Zap } from "lucide-react"
import Link from "next/link"
import type { ReactNode } from "react"

const featureCards = [
  {
    icon: <Newspaper className="h-8 w-8" />,
    title: "Latest News",
    description: "Access all Dubai real estate news from multiple sources.",
    badge: "Free"
  },
  {
    icon: <TrendingUp className="h-8 w-8" />,
    title: "Market Data",
    description: "Track live stock prices and market indicators across the sector.",
    badge: "Free"
  },
  {
    icon: <Bell className="h-8 w-8" />,
    title: "Smart Alerts",
    description: "Create price, sentiment, and keyword alerts tuned to your strategy.",
    badge: "Premium",
    premium: true
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Live Updates",
    description: "Unlock realtime websocket notifications and streaming market movement.",
    badge: "Premium",
    premium: true
  },
  {
    icon: <BarChart3 className="h-8 w-8" />,
    title: "Advanced Analytics",
    description: "Use AI-driven sentiment, trend, and relevance analysis for decisions.",
    badge: "Premium",
    premium: true
  },
  {
    icon: <Download className="h-8 w-8" />,
    title: "Export Data",
    description: "Export reports and curated insights for your team and clients.",
    badge: "Premium",
    premium: true
  }
] as const

const pricingCards = [
  {
    name: "Free",
    price: "$0",
    period: "/month",
    features: [
      "Unlimited news access",
      "Market overview",
      "Sentiment analysis",
      "Basic search",
      "Community support"
    ],
    cta: "Get Started",
    ctaHref: "/register"
  },
  {
    name: "Premium",
    price: "$9.99",
    period: "/month",
    features: [
      "Everything in Free",
      "Real-time updates",
      "Custom alerts",
      "Advanced analytics",
      "Export data",
      "Priority support",
      "API access"
    ],
    cta: "Start Free Trial",
    ctaHref: "/register?plan=premium",
    featured: true
  },
  {
    name: "Premium Annual",
    price: "$99",
    period: "/year",
    features: [
      "Everything in Premium",
      "2 months free",
      "Early feature access",
      "Dedicated account manager"
    ],
    cta: "Save 17%",
    ctaHref: "/register?plan=yearly"
  }
] as const

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <section className="relative overflow-hidden bg-gradient-to-br from-gold-500 via-gold-600 to-gold-700 py-20 text-white md:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_35%),linear-gradient(135deg,rgba(2,6,23,0.18),transparent_55%)]" />
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] [background-size:52px_52px]" />

        <div className="container relative z-10 mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mx-auto max-w-4xl text-center"
          >
            <div className="mb-6 inline-flex items-center rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.35em] text-gold-50 backdrop-blur-md">
              AI Powered Market Signal Layer
            </div>

            <h1 className="text-5xl font-display font-bold leading-tight md:text-7xl">
              Dubai Real Estate
              <br />
              <span className="text-gold-100">Intelligence Platform</span>
            </h1>

            <p className="mx-auto mt-6 max-w-3xl text-xl text-gold-100 md:text-2xl">
              AI-powered realtime insights for Dubai&apos;s property market, combining news intelligence, market momentum,
              and premium automation.
            </p>

            <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
              <Link
                href="/news"
                className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-gold-700 transition hover:bg-gold-50"
              >
                Explore News (Free)
              </Link>

              <Link
                href="/register"
                className="rounded-2xl bg-cyber-500 px-8 py-4 text-base font-semibold text-white transition hover:bg-cyber-600"
              >
                Get Premium Access
              </Link>
            </div>

            <div className="mt-10 grid gap-4 text-left sm:grid-cols-3">
              <HeroStat label="Coverage" value="24/7 Market Intelligence" />
              <HeroStat label="Signals" value="AI Sentiment + Trends" />
              <HeroStat label="Speed" value="Realtime Alerts & Ticks" />
            </div>
          </motion.div>
        </div>
      </section>

      <section className="bg-white py-20 text-slate-950 dark:bg-slate-900 dark:text-white">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-cyber-500">Platform Access</p>
            <h2 className="mt-4 text-3xl font-display font-bold md:text-4xl">What You Get</h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Start free with public market intelligence, then unlock premium automation and realtime workflows when you
              need deeper control.
            </p>
          </div>

          <div className="mt-12 grid grid-cols-1 gap-8 md:grid-cols-2 xl:grid-cols-3">
            {featureCards.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ delay: index * 0.06 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-slate-50 py-20 dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.35em] text-gold-500">Pricing</p>
            <h2 className="mt-4 text-3xl font-display font-bold text-slate-950 dark:text-white md:text-4xl">
              Choose Your Plan
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-400">
              Start with free public access, or move straight into premium monitoring and automation.
            </p>
          </div>

          <div className="mx-auto mt-12 grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-3">
            {pricingCards.map((plan) => (
              <PricingCard key={plan.name} {...plan} />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function HeroStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/20 bg-white/10 px-5 py-4 backdrop-blur-md">
      <div className="text-xs uppercase tracking-[0.25em] text-gold-100">{label}</div>
      <div className="mt-2 text-sm font-semibold text-white">{value}</div>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
  badge,
  premium
}: {
  icon: ReactNode
  title: string
  description: string
  badge: string
  premium?: boolean
}) {
  return (
    <article className="card-hover rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_60px_-36px_rgba(15,23,42,0.35)] dark:border-white/10 dark:bg-slate-950/70">
      <div className="flex items-start justify-between gap-4">
        <div
          className={`flex h-14 w-14 items-center justify-center rounded-2xl ${
            premium
              ? "bg-gradient-to-br from-cyber-500/20 to-gold-500/20 text-cyber-500"
              : "bg-gradient-to-br from-gold-500/20 to-emerald-500/20 text-gold-500"
          }`}
        >
          {icon}
        </div>
        <span
          className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${
            premium ? "bg-cyber-500/10 text-cyber-500" : "bg-emerald-500/10 text-emerald-500"
          }`}
        >
          {badge}
        </span>
      </div>

      <h3 className="mt-6 text-2xl font-display font-semibold text-slate-950 dark:text-white">{title}</h3>
      <p className="mt-3 text-sm leading-7 text-slate-600 dark:text-slate-400">{description}</p>
    </article>
  )
}

function PricingCard({
  name,
  price,
  period,
  features,
  cta,
  ctaHref,
  featured
}: {
  name: string
  price: string
  period: string
  features: readonly string[]
  cta: string
  ctaHref: string
  featured?: boolean
}) {
  return (
    <article
      className={`relative overflow-hidden rounded-[2rem] border p-8 ${
        featured
          ? "border-gold-400/50 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white shadow-[0_32px_80px_-36px_rgba(198,147,47,0.45)]"
          : "border-slate-200 bg-white text-slate-950 dark:border-white/10 dark:bg-slate-900 dark:text-white"
      }`}
    >
      {featured ? (
        <div className="absolute right-5 top-5 rounded-full bg-gradient-to-r from-gold-400 to-cyber-500 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-950">
          Most Popular
        </div>
      ) : null}

      <div className="text-sm font-semibold uppercase tracking-[0.25em] text-gold-500">{name}</div>
      <div className="mt-5 flex items-end gap-2">
        <span className="text-5xl font-display font-bold">{price}</span>
        <span className="pb-1 text-sm text-slate-500 dark:text-slate-400">{period}</span>
      </div>

      <ul className="mt-8 space-y-3 text-sm">
        {features.map((feature) => (
          <li key={feature} className="flex items-start gap-3">
            <span className="mt-1 h-2.5 w-2.5 rounded-full bg-emerald-400" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <Link
        href={ctaHref}
        className={`mt-8 inline-flex w-full items-center justify-center rounded-2xl px-5 py-4 text-sm font-semibold transition ${
          featured
            ? "bg-gradient-to-r from-gold-500 to-cyber-500 text-slate-950 hover:opacity-90"
            : "bg-slate-950 text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
        }`}
      >
        {cta}
      </Link>
    </article>
  )
}
