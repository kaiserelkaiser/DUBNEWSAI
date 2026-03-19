"use client"

import Link from "next/link"
import { useState } from "react"

import { useAuth } from "@/lib/hooks/useAuth"

export default function LoginPage() {
  const { login, loginPending } = useAuth()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(198,147,47,0.14),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.14),transparent_35%)]" />
      <div className="panel relative z-10 w-full max-w-md p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-cyber-500">Secure Access</p>
        <h1 className="mt-3 text-4xl font-display font-semibold text-slate-950 dark:text-white">Welcome back</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Sign in to monitor Dubai real estate intelligence in real time.
        </p>

        <form
          className="mt-8 space-y-4"
          onSubmit={async (event) => {
            event.preventDefault()
            await login({ email, password })
          }}
        >
          <label className="block space-y-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-gold-500 dark:bg-slate-950/70"
              placeholder="you@company.com"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Password</span>
            <input
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none ring-0 transition focus:border-gold-500 dark:bg-slate-950/70"
              placeholder="Enter your password"
            />
          </label>

          <button
            type="submit"
            disabled={loginPending}
            className="w-full rounded-2xl bg-gradient-to-r from-gold-500 to-cyber-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loginPending ? "Signing in..." : "Sign in"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Need an account?{" "}
          <Link href="/register" className="font-medium text-gold-500 hover:text-gold-400">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
