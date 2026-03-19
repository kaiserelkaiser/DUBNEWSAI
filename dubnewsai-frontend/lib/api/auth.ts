import { apiClient } from "@/lib/api/client"
import type { AuthTokens, CurrentUser, LoginPayload, RegisterPayload } from "@/types"

export async function registerUser(payload: RegisterPayload) {
  const response = await apiClient.post<CurrentUser>("/auth/register", payload)
  return response.data
}

export async function loginUser(payload: LoginPayload) {
  const response = await apiClient.post<AuthTokens>("/auth/login", payload)
  return response.data
}

export async function getCurrentUser() {
  const response = await apiClient.get<CurrentUser>("/auth/me")
  return response.data
}
