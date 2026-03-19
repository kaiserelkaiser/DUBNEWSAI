"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"

import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead
} from "@/lib/api/notifications"

export function useNotifications(unreadOnly = false) {
  const queryClient = useQueryClient()

  const notificationsQuery = useQuery({
    queryKey: ["notifications", unreadOnly],
    queryFn: () => getNotifications(unreadOnly)
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["notifications"] })
  }

  const markReadMutation = useMutation({
    mutationFn: (notificationId: number) => markNotificationRead(notificationId),
    onSuccess: invalidate
  })

  const markAllMutation = useMutation({
    mutationFn: markAllNotificationsRead,
    onSuccess: invalidate
  })

  return {
    ...notificationsQuery,
    markRead: (notificationId: number) => markReadMutation.mutateAsync(notificationId),
    markAllRead: () => markAllMutation.mutateAsync(),
    markingAllRead: markAllMutation.isPending
  }
}
