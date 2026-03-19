"use client"

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import toast from "react-hot-toast"

import { createAlert, deleteAlert, getAlerts, toggleAlert } from "@/lib/api/alerts"
import type { AlertCreatePayload } from "@/types"

export function useAlerts() {
  const queryClient = useQueryClient()

  const alertsQuery = useQuery({
    queryKey: ["alerts"],
    queryFn: getAlerts
  })

  const invalidate = async () => {
    await queryClient.invalidateQueries({ queryKey: ["alerts"] })
  }

  const createMutation = useMutation({
    mutationFn: (payload: AlertCreatePayload) => createAlert(payload),
    onSuccess: async () => {
      toast.success("Alert created")
      await invalidate()
    },
    onError: () => {
      toast.error("Unable to create the alert")
    }
  })

  const toggleMutation = useMutation({
    mutationFn: (alertId: number) => toggleAlert(alertId),
    onSuccess: async () => {
      await invalidate()
    },
    onError: () => {
      toast.error("Unable to update the alert")
    }
  })

  const deleteMutation = useMutation({
    mutationFn: (alertId: number) => deleteAlert(alertId),
    onSuccess: async () => {
      toast.success("Alert deleted")
      await invalidate()
    },
    onError: () => {
      toast.error("Unable to delete the alert")
    }
  })

  return {
    ...alertsQuery,
    createAlert: (payload: AlertCreatePayload) => createMutation.mutateAsync(payload),
    toggleAlert: (alertId: number) => toggleMutation.mutateAsync(alertId),
    deleteAlert: (alertId: number) => deleteMutation.mutateAsync(alertId),
    isCreating: createMutation.isPending
  }
}
