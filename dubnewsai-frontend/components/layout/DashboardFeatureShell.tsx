"use client"

import type { ReactNode } from "react"
import { useMemo } from "react"
import { usePathname } from "next/navigation"

import { EmptyStatePanel } from "@/components/shared/EmptyStatePanel"
import { useFeatureAccess } from "@/lib/hooks/useEnterprise"
import { useAuthStore } from "@/lib/store/authStore"

const FEATURE_PATHS: Array<{ featureKey: string; prefixes: string[] }> = [
  { featureKey: "dashboard", prefixes: ["/dashboard"] },
  { featureKey: "news", prefixes: ["/news"] },
  { featureKey: "market", prefixes: ["/market"] },
  { featureKey: "portfolios", prefixes: ["/portfolios"] },
  { featureKey: "competitors", prefixes: ["/competitors"] },
  { featureKey: "analytics", prefixes: ["/analytics"] },
  { featureKey: "executive", prefixes: ["/executive"] },
  { featureKey: "teams", prefixes: ["/teams"] },
  { featureKey: "alerts", prefixes: ["/alerts"] },
  { featureKey: "settings", prefixes: ["/settings"] },
  { featureKey: "admin_providers", prefixes: ["/admin/providers"] }
]

function resolveFeatureKey(pathname: string) {
  return FEATURE_PATHS.find((item) => item.prefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)))?.featureKey
}

export function DashboardFeatureShell({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const { data = [] } = useFeatureAccess()
  const { hydrated } = useAuthStore()
  const featureKey = useMemo(() => resolveFeatureKey(pathname), [pathname])
  const feature = data.find((item) => item.feature_key === featureKey)

  if (!hydrated) {
    return <>{children}</>
  }

  if (feature && !feature.has_access) {
    return (
      <EmptyStatePanel
        title={`${feature.label} is not unlocked for this account.`}
        description="This section is controlled through admin access grants. News and Market stay open by default, while advanced workspaces are enabled per user."
      />
    )
  }

  return <>{children}</>
}
