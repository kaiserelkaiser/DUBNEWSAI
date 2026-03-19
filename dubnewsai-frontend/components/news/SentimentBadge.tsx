import { ArrowDownRight, ArrowUpRight, Minus } from "lucide-react"

import { cn } from "@/lib/utils/cn"

export function SentimentBadge({
  sentiment,
  score
}: {
  sentiment: string
  score: number
}) {
  const positive = sentiment === "positive" || score > 0
  const negative = sentiment === "negative" || score < 0

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide backdrop-blur-md",
        positive && "border-emerald-400/30 bg-emerald-500/15 text-emerald-100",
        negative && "border-red-400/30 bg-red-500/15 text-red-100",
        !positive && !negative && "border-cyber-400/30 bg-cyber-500/15 text-cyber-100"
      )}
    >
      {positive ? (
        <ArrowUpRight className="h-3 w-3" />
      ) : negative ? (
        <ArrowDownRight className="h-3 w-3" />
      ) : (
        <Minus className="h-3 w-3" />
      )}
      {score > 0 ? "+" : ""}
      {score}
    </span>
  )
}
