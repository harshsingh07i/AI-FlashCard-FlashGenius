"use client"

import type React from "react"

interface PremiumGateProps {
  feature: string
  description: string
  children?: React.ReactNode
}

export function PremiumGate({ feature, description, children }: PremiumGateProps) {
  // All features are now free - just render the children
  return <>{children}</>
}
