"use client"

import { PremiumPageHero } from "@/components/ui/premium-page-hero"

const stats = [
  {
    label: "Signal stack",
    value: "News + Equities + FX",
    hint: "The essentials for Dubai market monitoring"
  },
  {
    label: "Coverage lens",
    value: "Dubai first",
    hint: "Local property, listed names, and capital-flow context"
  },
  {
    label: "Update rhythm",
    value: "Minutes, not hours",
    hint: "Built to surface movement while it still matters"
  },
  {
    label: "Operator mode",
    value: "Decision-ready",
    hint: "Read the signal fast, then go deeper only when needed"
  }
] as const

export function HeroSection() {
  return (
    <PremiumPageHero
      eyebrow="Dashboard command"
      title="A faster way to understand what is moving across Dubai."
      description="DUBNEWSAI brings together live market movement, UAE property stories, and macro context in one calm command surface so you can spot change quickly and read with conviction."
      chips={["Realtime feed", "Market context", "Readable stories", "Provider-aware"]}
      stats={[...stats]}
      tone="cyan"
    />
  )
}
