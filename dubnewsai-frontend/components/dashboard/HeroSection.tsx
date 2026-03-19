"use client"

import { PremiumPageHero } from "@/components/ui/premium-page-hero"

const stats = [
  {
    label: "Signal stack",
    value: "News + Market + Macro",
    hint: "One workspace for market-moving context"
  },
  {
    label: "Operator mode",
    value: "Editorial intelligence",
    hint: "Readable signal surfaces instead of admin widgets"
  },
  {
    label: "Core market",
    value: "Dubai real estate",
    hint: "Focused on local developers and capital flows"
  },
  {
    label: "Design intent",
    value: "Calm + high-conviction",
    hint: "Deliberate hierarchy with motion and clarity"
  }
] as const

export function HeroSection() {
  return (
    <PremiumPageHero
      eyebrow="Dashboard command"
      title="A live intelligence room for Dubai real-estate signals."
      description="The dashboard now opens like a premium product surface: strong narrative hierarchy, richer market context, and cleaner flow between editorial coverage, watchlists, and macro pressure."
      chips={["Realtime feed", "Market context", "Readable stories", "Provider-aware"]}
      stats={[...stats]}
      tone="cyan"
    />
  )
}
