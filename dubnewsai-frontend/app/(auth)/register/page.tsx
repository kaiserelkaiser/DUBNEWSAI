"use client"

import Link from "next/link"
import { useState } from "react"

import { useAuth } from "@/lib/hooks/useAuth"

export default function RegisterPage() {
  const { register, registerPending } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050506] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(245,158,11,0.12),transparent_22%)]" />
      <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(255,255,255,0.045)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.045)_1px,transparent_1px)] [background-size:72px_72px]" />
      <div className="relative mx-auto grid min-h-screen max-w-7xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
        <div className="flex flex-col justify-between rounded-[2.2rem] border border-white/10 bg-white/[0.03] p-8 backdrop-blur-2xl lg:p-10">
          <div>
            <p className="story-kicker">Premium access</p>
            <h1 className="mt-4 text-balance text-4xl font-semibold leading-tight text-white sm:text-5xl">
              Create your workspace inside the new operator interface.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-8 text-white/58">
              Set up your account to track live market motion, editorial news coverage, and intelligent alerts from one premium workspace.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
            <AuthStat title="Signal" value="News, FX, macro, equities" />
            <AuthStat title="Speed" value="Near real-time workflow" />
            <AuthStat title="Control" value="Provider-aware dashboards" />
          </div>
        </div>

        <div className="panel-premium flex items-center p-6 sm:p-8 lg:p-10">
          <div className="w-full">
            <p className="story-kicker">Create account</p>
            <h2 className="mt-4 font-editorial text-5xl font-semibold leading-none text-white">Open your desk</h2>
            <p className="mt-4 text-sm leading-7 text-white/56">
              Start with a clean workspace built for monitoring Dubai real-estate intelligence.
            </p>

            <form
              className="mt-8 space-y-4"
              onSubmit={async (event) => {
                event.preventDefault()
                await register({
                  full_name: fullName,
                  email,
                  password
                })
              }}
            >
              <label className="block space-y-2">
                <span className="text-sm text-white/70">Full name</span>
                <input
                  type="text"
                  required
                  minLength={2}
                  value={fullName}
                  onChange={(event) => setFullName(event.target.value)}
                  className="w-full rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-emerald-300/30"
                  placeholder="Your name"
                />
              </label>

              <label className="block space-y-2">
                <span className="text-sm text-white/70">Email</span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-cyan-300/30"
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
                  className="w-full rounded-[1.4rem] border border-white/10 bg-white/[0.04] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-amber-300/30"
                  placeholder="Minimum 8 characters"
                />
              </label>

              <button
                type="submit"
                disabled={registerPending}
                className="w-full rounded-full bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/92 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {registerPending ? "Creating account..." : "Create account"}
              </button>
            </form>

            <p className="mt-6 text-sm text-white/56">
              Already have an account?{" "}
              <Link href="/login" className="font-medium text-amber-200 hover:text-amber-100">
                Sign in
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
