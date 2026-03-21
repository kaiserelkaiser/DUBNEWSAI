import { NextRequest, NextResponse } from "next/server"

import { normalizeApiBaseUrl } from "@/lib/config/api"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BLOCKED_REQUEST_HEADERS = new Set([
  "accept-encoding",
  "connection",
  "content-length",
  "host",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
])

const BLOCKED_RESPONSE_HEADERS = new Set([
  "connection",
  "content-encoding",
  "content-length",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade"
])

function buildTargetUrl(pathSegments: string[], sourceUrl: URL) {
  const backendBase = normalizeApiBaseUrl(
    process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL
  )
  const targetUrl = new URL(`${backendBase.replace(/\/$/, "")}/${pathSegments.join("/")}`)

  sourceUrl.searchParams.forEach((value, key) => {
    targetUrl.searchParams.append(key, value)
  })

  return targetUrl
}

function copyRequestHeaders(request: NextRequest) {
  const headers = new Headers()

  request.headers.forEach((value, key) => {
    if (!BLOCKED_REQUEST_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  return headers
}

function copyResponseHeaders(response: Response) {
  const headers = new Headers()

  response.headers.forEach((value, key) => {
    if (!BLOCKED_RESPONSE_HEADERS.has(key.toLowerCase())) {
      headers.set(key, value)
    }
  })

  return headers
}

async function proxyRequest(request: NextRequest, pathSegments: string[]) {
  try {
    const targetUrl = buildTargetUrl(pathSegments, request.nextUrl)
    const headers = copyRequestHeaders(request)
    const method = request.method.toUpperCase()

    const init: RequestInit = {
      method,
      headers,
      redirect: "follow",
      cache: "no-store"
    }

    if (method !== "GET" && method !== "HEAD") {
      const body = await request.arrayBuffer()
      if (body.byteLength > 0) {
        init.body = body
      }
    }

    const response = await fetch(targetUrl, init)
    const responseHeaders = copyResponseHeaders(response)

    if (method === "HEAD") {
      return new NextResponse(null, {
        status: response.status,
        headers: responseHeaders
      })
    }

    const responseBody = await response.arrayBuffer()

    return new NextResponse(responseBody, {
      status: response.status,
      headers: responseHeaders
    })
  } catch (error) {
    return NextResponse.json(
      {
        detail: "Backend proxy request failed",
        error: error instanceof Error ? error.message : "Unknown proxy error"
      },
      { status: 502 }
    )
  }
}

type RouteContext = {
  params: Promise<{ path: string[] }>
}

export async function GET(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function POST(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  const { path } = await context.params
  return proxyRequest(request, path)
}
