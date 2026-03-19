import axios from "axios"

import { useAuthStore } from "@/lib/store/authStore"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1"

export const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

const refreshClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json"
  }
})

let refreshPromise: Promise<string | null> | null = null

async function refreshAccessToken() {
  if (refreshPromise) {
    return refreshPromise
  }

  const refreshToken = useAuthStore.getState().refreshToken
  if (!refreshToken) {
    return null
  }

  refreshPromise = refreshClient
    .post("/auth/refresh", null, {
      headers: {
        Authorization: `Bearer ${refreshToken}`
      }
    })
    .then((response) => {
      const nextTokens = response.data as { access_token: string; refresh_token: string }
      useAuthStore.getState().setTokens(nextTokens.access_token, nextTokens.refresh_token)
      return nextTokens.access_token
    })
    .catch(() => {
      useAuthStore.getState().clearAuth()
      return null
    })
    .finally(() => {
      refreshPromise = null
    })

  return refreshPromise
}

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }

  return config
})

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as (typeof error.config & { _retry?: boolean }) | undefined
    const requestUrl = String(originalRequest?.url || "")

    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      const isAuthRequest =
        requestUrl.includes("/auth/login") ||
        requestUrl.includes("/auth/register") ||
        requestUrl.includes("/auth/refresh")

      if (!isAuthRequest) {
        originalRequest._retry = true
        const nextAccessToken = await refreshAccessToken()
        if (nextAccessToken) {
          originalRequest.headers = originalRequest.headers ?? {}
          originalRequest.headers.Authorization = `Bearer ${nextAccessToken}`
          return apiClient(originalRequest)
        }
      }
    }

    if (typeof window !== "undefined" && error.response?.status === 401) {
      useAuthStore.getState().clearAuth()
      if (window.location.pathname !== "/login") {
        window.location.href = "/login"
      }
    }

    return Promise.reject(error)
  }
)
