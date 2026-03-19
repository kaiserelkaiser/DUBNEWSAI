"use client"

import Link from "next/link"
import { useState } from "react"

import { useAuth } from "@/lib/hooks/useAuth"

export default function LoginPage() {
  const { login, loginPending } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050506] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,211,238,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_22%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-between rounded-[2.2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl lg:p-10">
          <div>
            <p className="story-kicker">Secure access</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Sign back into the intelligence room.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/58">
              Access the live Dubai real-estate signal stack, editorial news surfaces, and market boards from one operator workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <AuthStat title="Realtime" value="Connected market layer" />
            <AuthStat title="Editorial" value="Readable on-platform stories" />
            <AuthStat title="Control" value="Alerts and provider context" />
          </div>
        </div>

        <div className="panel-premium flex items-center p-6 sm:p-8 lg:p-10">
          <div className="w-full">
            <p className="story-kicker">Welcome back</p>
            <h2 className="mt-4 font-editorial text-5xl font-semibold leading-none text-white">Operator login</h2>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Sign in to continue monitoring Dubai real-estate intelligence in real time.
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault()
                await login({ email, password })
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-white/30 focus:border-cyan-300/30"
                  placeholder="you@company.com"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-white/70">Password</span>
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none ring-0 transition placeholder:text-white/30 focus:border-amber-300/30"
                  placeholder="Enter your password"
                />
              </label>

              <button
                type="submit"
                disabled={loginPending}
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loginPending ? "Signing in..." : "Sign in"}
              </button>
            </form>

            <p className="mt-6 text-sm text-white/56">
              Need an account?{" "}
              <Link href="/register" className="font-medium text-amber-200 hover:text-amber-100">
                Create one
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

function AuthStat({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[1.4rem] border border-white/10 bg-white/[0.04] p-4">
      <div className="text-[10px] uppercase tracking-[0.28em] text-white/40">{title}</div>
      <div className="mt-3 text-sm font-medium text-white/86">{value}</div>
    </div>
  )
}
