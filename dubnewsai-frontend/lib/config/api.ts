const LOCAL_API_URL = "http://localhost:8000/api/v1"
const PRODUCTION_API_URL = "https://dubnewsai-production.up.railway.app/api/v1"
const PRODUCTION_APP_URL = "https://dubnewsai-yuhw.vercel.app"
const LOCAL_WS_URL = "ws://localhost:8000"
const PRODUCTION_WS_URL = "wss://dubnewsai-production.up.railway.app"

function isLocalHostname(hostname: string) {
  return hostname === "localhost" || hostname === "127.0.0.1"
}

export function normalizeApiBaseUrl(value?: string | null) {
  const fallback =
    typeof window !== "undefined" && isLocalHostname(window.location.hostname)
      ? LOCAL_API_URL
      : PRODUCTION_API_URL

  const candidate = (value || fallback).trim()

  try {
    const parsed = new URL(candidate)
    if (
      typeof window !== "undefined" &&
      window.location.protocol === "https:" &&
      parsed.protocol === "http:" &&
      !isLocalHostname(parsed.hostname)
    ) {
      parsed.protocol = "https:"
    }
    return parsed.toString().replace(/\/$/, "")
  } catch {
    return candidate.replace(/\/$/, "")
  }
}

export function getDefaultAppUrl(value?: string | null) {
  return (value || PRODUCTION_APP_URL).trim().replace(/\/$/, "")
}

export function getDefaultWsUrl(value?: string | null) {
  const fallback =
    typeof window !== "undefined" && isLocalHostname(window.location.hostname)
      ? LOCAL_WS_URL
      : PRODUCTION_WS_URL

  const candidate = (value || fallback).trim()

  try {
    const parsed = new URL(candidate.replace(/^ws/, "http"))
    const protocol =
      typeof window !== "undefined" && window.location.protocol === "https:"
        ? "wss://"
        : `${parsed.protocol === "https:" ? "wss" : "ws"}://`

    return `${protocol}${parsed.host}${parsed.pathname}`.replace(/\/$/, "")
  } catch {
    return candidate.replace(/\/$/, "")
  }
}
