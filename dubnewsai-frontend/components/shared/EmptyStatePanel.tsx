"use client"

import type { LucideIcon } from "lucide-react"
import { Inbox } from "lucide-react"

interface EmptyStatePanelProps {
  title: string
  description: string
  icon?: LucideIcon
}

export function EmptyStatePanel({
  title,
  description,
  icon: Icon = Inbox
}: EmptyStatePanelProps) {
  return (
    <div className="rounded-[1.5rem] border border-dashed border-white/12 bg-white/[0.02] p-6">
      <div className="inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.28em] text-white/38">
        <Icon className="h-3.5 w-3.5 text-white/48" />
        Ready state
      </div>
      <div className="mt-4 text-lg font-semibold text-white">{title}</div>
      <p className="mt-3 max-w-2xl text-sm leading-7 text-white/52">{description}</p>
    </div>
  )
}
