export interface Alert {
  id: number
  name: string
  alert_type: string
  status: string
  symbol?: string | null
  keywords?: string[] | null
  threshold_value?: number | null
  category?: string | null
  frequency: string
  trigger_count: number
  last_triggered_at?: string | null
  is_active: boolean
  created_at: string
}

export interface AlertCreatePayload {
  name: string
  alert_type: string
  symbol?: string | null
  keywords?: string[] | null
  threshold_value?: number | null
  category?: string | null
  conditions?: Record<string, unknown> | null
  frequency?: string
  email_enabled?: boolean
  notification_enabled?: boolean
  webhook_url?: string | null
}
