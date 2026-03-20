"use client"

import { formatDistanceToNow } from "date-fns"
import { useEffect, useState } from "react"

import { formatDateTime } from "@/lib/utils/formatters"

export function RelativeTime({
  value,
  className
}: {
  value: string
  className?: string
}) {
  const [relativeLabel, setRelativeLabel] = useState<string | null>(null)

  useEffect(() => {
    const parsed = new Date(value)
    if (Number.isNaN(parsed.getTime())) {
      setRelativeLabel("Unknown")
      return
    }

    setRelativeLabel(formatDistanceToNow(parsed, { addSuffix: true }))
  }, [value])

  return (
    <span className={className} suppressHydrationWarning>
      {relativeLabel || formatDateTime(value)}
    </span>
  )
}
