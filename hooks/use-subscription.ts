import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { apiGet } from '@/lib/api'

export type SubscriptionPlan = 'free' | 'starter' | 'pro' | 'enterprise'

export interface SubscriptionInfo {
  plan: SubscriptionPlan
  scansUsed: number
  scansLimit: number
  canScanNormal: boolean
  canScanForensic: boolean
  isLoading: boolean
  remainingScans: number
  refresh: () => Promise<void>
}

const PLAN_LIMITS: Record<SubscriptionPlan, { scansLimit: number; forensicAllowed: boolean }> = {
  free:       { scansLimit: 999999, forensicAllowed: false },
  starter:    { scansLimit: 999999, forensicAllowed: false },
  pro:        { scansLimit: 999999, forensicAllowed: true },
  enterprise: { scansLimit: 999999, forensicAllowed: true },
}

export function useSubscription(): SubscriptionInfo {
  const { data: session } = useSession()
  const [plan, setPlan] = useState<SubscriptionPlan>('free')
  const [scansUsed, setScansUsed] = useState(0)
  const [scansLimit, setScansLimit] = useState(999999)
  const [isLoading, setIsLoading] = useState(true)

  const fetchSubscription = async () => {
    if (!session?.backendToken) {
      setIsLoading(false)
      return
    }
    try {
      const profile = await apiGet<{
        subscription_plan?: string
        scans_used?: number
        scans_limit?: number
      }>('/profiles/me', session.backendToken)

      const currentPlan = (profile.subscription_plan || 'free') as SubscriptionPlan
      setPlan(currentPlan)
      setScansUsed(profile.scans_used ?? 0)
      setScansLimit(profile.scans_limit ?? PLAN_LIMITS[currentPlan].scansLimit)
    } catch {
      // Mode dégradé : tout illimité
      setPlan('free')
      setScansUsed(0)
      setScansLimit(999999)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (session?.backendToken) fetchSubscription()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session?.backendToken])

  const remainingScans = Math.max(0, scansLimit - scansUsed)
  const canScanNormal = remainingScans > 0
  const canScanForensic = PLAN_LIMITS[plan].forensicAllowed && remainingScans > 0

  return { plan, scansUsed, scansLimit, canScanNormal, canScanForensic, isLoading, remainingScans, refresh: fetchSubscription }
}

export function getPlanDisplayName(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'free':       return 'Essai gratuit'
    case 'starter':    return 'Starter'
    case 'pro':        return 'Professionnel'
    case 'enterprise': return 'Entreprise'
  }
}

export function getPlanColor(plan: SubscriptionPlan): string {
  switch (plan) {
    case 'free':       return 'bg-slate-500/20 text-slate-400 border-slate-500/50'
    case 'starter':    return 'bg-blue-500/20 text-blue-400 border-blue-500/50'
    case 'pro':        return 'bg-cyan-500/20 text-cyan-400 border-cyan-500/50'
    case 'enterprise': return 'bg-purple-500/20 text-purple-400 border-purple-500/50'
  }
}
