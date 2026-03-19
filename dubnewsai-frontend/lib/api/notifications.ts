import { apiClient } from "@/lib/api/client"
import type { NotificationItem } from "@/types"

export async function getNotifications(unreadOnly = false) {
  const response = await apiClient.get<NotificationItem[]>("/notifications/", {
    params: { unread_only: unreadOnly }
  })
  return response.data
}

export async function markNotificationRead(notificationId: number) {
  await apiClient.post(`/notifications/${notificationId}/read`)
}

export async function markAllNotificationsRead() {
  await apiClient.post("/notifications/read-all")
}
