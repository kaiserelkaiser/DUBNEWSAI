import type { ReactNode } from "react"

import { PublicOnly } from "@/components/auth/PublicOnly"

export default function AuthLayout({
  children
}: {
  children: ReactNode
}) {
  return <PublicOnly>{children}</PublicOnly>
}
