"use client"

import type { ReactNode } from "react"
import { LayoutDashboard } from "lucide-react"

import { EmptyStatePanel } from "@/components/shared/EmptyStatePanel"
import { useFeatureAccess } from "@/lib/hooks/useEnterprise"

interface FeatureGateProps {
  featureKey: string
  title: string
  description: string
  children: ReactNode
}

export function FeatureGate({
  featureKey,
  title,
  description,
  children
}: FeatureGateProps) {
  const { data = [] } = useFeatureAccess()
  const feature = data.find((item) => item.feature_key === featureKey)

  if (feature && !feature.has_access) {
    return (
      <div className="space-y-8">
        <EmptyStatePanel
          icon={LayoutDashboard}
          title={title}
          description={description}
        />
      </div>
    )
  }

  return <>{children}</>
}
