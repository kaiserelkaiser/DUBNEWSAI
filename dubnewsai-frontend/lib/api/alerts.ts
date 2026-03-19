import { apiClient } from "@/lib/api/client"
import type { Alert, AlertCreatePayload } from "@/types"

export async function getAlerts() {
  const response = await apiClient.get<Alert[]>("/alerts/")
  return response.data
}

export async function createAlert(payload: AlertCreatePayload) {
  const response = await apiClient.post<Alert>("/alerts/", payload)
  return response.data
}

export async function toggleAlert(alertId: number) {
  await apiClient.patch(`/alerts/${alertId}/toggle`)
}

export async function deleteAlert(alertId: number) {
  await apiClient.delete(`/alerts/${alertId}`)
}
