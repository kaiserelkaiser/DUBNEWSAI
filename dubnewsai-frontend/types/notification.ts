export interface NotificationItem {
  id: number
  type: string
  priority: string
  title: string
  message: string
  is_read?: boolean
  article_id?: number | null
  market_symbol?: string | null
  created_at: string
}
