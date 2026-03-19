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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-12">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(16,185,129,0.12),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(198,147,47,0.16),transparent_35%)]" />
      <div className="panel relative z-10 w-full max-w-lg p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-emerald-500">Premium Access</p>
        <h1 className="mt-3 text-4xl font-display font-semibold text-slate-950 dark:text-white">Create your workspace</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-400">
          Set up your operator account and start tracking live market and news signals.
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
            <span className="text-sm text-slate-600 dark:text-slate-300">Full name</span>
            <input
              type="text"
              required
              minLength={2}
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 dark:bg-slate-950/70"
              placeholder="Your name"
            />
          </label>

          <label className="block space-y-2">
            <span className="text-sm text-slate-600 dark:text-slate-300">Email</span>
            <input
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 dark:bg-slate-950/70"
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
              className="w-full rounded-2xl border border-white/10 bg-white/80 px-4 py-3 text-sm outline-none transition focus:border-emerald-500 dark:bg-slate-950/70"
              placeholder="Minimum 8 characters"
            />
          </label>

          <button
            type="submit"
            disabled={registerPending}
            className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-gold-500 px-4 py-3 text-sm font-semibold text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {registerPending ? "Creating account..." : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 dark:text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-gold-500 hover:text-gold-400">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
