"use client"

import { create } from "zustand"

import type { NotificationItem } from "@/types"

interface NotificationState {
  items: NotificationItem[]
  upsert: (notification: NotificationItem) => void
  hydrate: (notifications: NotificationItem[]) => void
}

export const useNotificationStore = create<NotificationState>((set) => ({
  items: [],
  upsert: (notification) =>
    set((state) => {
      const existing = state.items.find((item) => item.id === notification.id)
      if (existing) {
        return {
          items: state.items.map((item) => (item.id === notification.id ? notification : item))
        }
      }

      return {
        items: [notification, ...state.items].slice(0, 100)
      }
    }),
  hydrate: (notifications) =>
    set({
      items: notifications
    })
}))
