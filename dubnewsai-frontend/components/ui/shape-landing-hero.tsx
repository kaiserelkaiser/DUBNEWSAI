"use client"

import type { ReactNode } from "react"
import { motion } from "framer-motion"
import { ArrowUpRight, Circle } from "lucide-react"

import { cn } from "@/lib/utils"

function ElegantShape({
  className,
  delay = 0,
  width = 400,
  height = 100,
  rotate = 0,
  gradient = "from-white/[0.08]"
}: {
  className?: string
  delay?: number
  width?: number
  height?: number
  rotate?: number
  gradient?: string
}) {
  return (
    <motion.div
      initial={{
        opacity: 0,
        y: -150,
        rotate: rotate - 15
      }}
      animate={{
        opacity: 1,
        y: 0,
        rotate
      }}
      transition={{
        duration: 2.4,
        delay,
        ease: [0.23, 0.86, 0.39, 0.96],
        opacity: { duration: 1.2 }
      }}
      className={cn("absolute", className)}
    >
      <motion.div
        animate={{
          y: [0, 15, 0]
        }}
        transition={{
          duration: 12,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut"
        }}
        style={{
          width,
          height
        }}
        className="relative"
      >
        <div
          className={cn(
            "absolute inset-0 rounded-full",
            "bg-gradient-to-r to-transparent",
            gradient,
            "backdrop-blur-[2px] border-2 border-white/[0.15]",
            "shadow-[0_8px_32px_0_rgba(255,255,255,0.1)]",
            "after:absolute after:inset-0 after:rounded-full",
            "after:bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.2),transparent_70%)]"
          )}
        />
      </motion.div>
    </motion.div>
  )
}

type HeroGeometricProps = {
  badge?: string
  title1?: string
  title2?: string
  description?: string
  actions?: ReactNode
  meta?: ReactNode
  children?: ReactNode
}

export function HeroGeometric({
  badge = "Dubai Market Intelligence",
  title1 = "Know Dubai",
  title2 = "before the market moves",
  description = "Track Dubai market news, listed developers, FX, and macro context in one premium intelligence platform.",
  actions,
  meta,
  children
}: HeroGeometricProps) {
  const fadeUpVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        duration: 1,
        delay: 0.45 + i * 0.16,
        ease: [0.25, 0.4, 0.25, 1]
      }
    })
  }

  return (
    <section className="relative min-h-screen w-full overflow-hidden bg-[#050506] text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(45,212,191,0.08),transparent_28%),radial-gradient(circle_at_top_right,rgba(245,158,11,0.08),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.02),transparent_24%)]" />
      <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:72px_72px]" />

      <div className="absolute inset-0 overflow-hidden">
        <ElegantShape
          delay={0.3}
          width={660}
          height={170}
          rotate={12}
          gradient="from-cyan-400/[0.14]"
          className="left-[-10%] top-[13%]"
        />
        <ElegantShape
          delay={0.5}
          width={540}
          height={140}
          rotate={-15}
          gradient="from-amber-400/[0.14]"
          className="right-[-8%] top-[68%]"
        />
        <ElegantShape
          delay={0.4}
          width={320}
          height={88}
          rotate={-8}
          gradient="from-white/[0.12]"
          className="left-[8%] bottom-[7%]"
        />
        <ElegantShape
          delay={0.6}
          width={210}
          height={64}
          rotate={20}
          gradient="from-emerald-400/[0.12]"
          className="right-[14%] top-[10%]"
        />
        <ElegantShape
          delay={0.7}
          width={180}
          height={52}
          rotate={-25}
          gradient="from-orange-300/[0.12]"
          className="left-[26%] top-[7%]"
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl items-center px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,1.05fr)_minmax(420px,0.95fr)] lg:items-center">
          <div className="max-w-3xl">
            <motion.div
              custom={0}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5"
            >
              <Circle className="h-2 w-2 fill-amber-400 text-amber-400" />
              <span className="text-xs uppercase tracking-[0.35em] text-white/62">{badge}</span>
            </motion.div>

            <motion.div custom={1} variants={fadeUpVariants} initial="hidden" animate="visible">
              <h1 className="mt-8 text-5xl font-bold tracking-[-0.04em] sm:text-6xl lg:text-7xl xl:text-[5.5rem]">
                <span className="block bg-gradient-to-b from-white via-white to-white/72 bg-clip-text text-transparent">
                  {title1}
                </span>
                <span className="block bg-gradient-to-r from-cyan-200 via-white to-amber-200 bg-clip-text text-transparent">
                  {title2}
                </span>
              </h1>
            </motion.div>

            <motion.p
              custom={2}
              variants={fadeUpVariants}
              initial="hidden"
              animate="visible"
              className="mt-7 max-w-2xl text-base leading-8 text-white/58 sm:text-lg"
            >
              {description}
            </motion.p>

            {actions ? (
              <motion.div
                custom={3}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="mt-10 flex flex-col gap-4 sm:flex-row"
              >
                {actions}
              </motion.div>
            ) : null}

            {meta ? (
              <motion.div
                custom={4}
                variants={fadeUpVariants}
                initial="hidden"
                animate="visible"
                className="mt-10"
              >
                {meta}
              </motion.div>
            ) : null}
          </div>

          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 1.15, ease: [0.23, 1, 0.32, 1] }}
            className="relative"
          >
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-cyan-400/16 via-transparent to-amber-300/16 blur-3xl" />
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/[0.03] p-2 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              <div className="rounded-[2rem] border border-white/10 bg-[#090b10]">
                {children || (
                  <div className="flex aspect-[4/5] items-center justify-center text-sm uppercase tracking-[0.4em] text-white/35">
                    <ArrowUpRight className="mr-3 h-4 w-4" />
                    Visual Slot
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#050506] via-transparent to-[#050506]/70" />
    </section>
  )
}
