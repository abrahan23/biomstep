"use client"

import * as React from "react"
import { motion } from "framer-motion"

import { siteConfig } from "@/config/site"
import { Link } from "@/i18n/routing"
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { SiteLogo } from "@/components/site-logo"

const ease = [0.22, 1, 0.36, 1]

function FootprintSvg({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Heel */}
      <ellipse cx="32" cy="62" rx="14" ry="11" fill="currentColor" opacity="0.9" />
      {/* Arch */}
      <path
        d="M18 56 Q14 44 18 34"
        stroke="currentColor"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.5"
      />
      {/* Ball */}
      <ellipse cx="38" cy="28" rx="12" ry="9" fill="currentColor" opacity="0.85" />
      {/* Toes */}
      <ellipse cx="22" cy="16" rx="4.5" ry="5.5" fill="currentColor" opacity="0.8" />
      <ellipse cx="31" cy="11" rx="4" ry="5" fill="currentColor" opacity="0.75" />
      <ellipse cx="40" cy="10" rx="3.5" ry="4.5" fill="currentColor" opacity="0.7" />
      <ellipse cx="48" cy="13" rx="3" ry="4" fill="currentColor" opacity="0.65" />
      <ellipse cx="54" cy="19" rx="2.5" ry="3.5" fill="currentColor" opacity="0.6" />
    </svg>
  )
}

interface NotFoundSceneProps {
  title: string
  description: string
  homeLabel: string
  catalogLabel: string
}

const item = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0 },
}

export function NotFoundScene({
  title,
  description,
  homeLabel,
  catalogLabel,
}: NotFoundSceneProps) {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#070b12] px-6 text-white">

      {/* Dot-grid background */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />

      {/* Radial teal glow */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/[0.07] blur-[120px]" />
      </div>

      {/* Scan-line sweep */}
      <motion.div
        className="pointer-events-none absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-teal-400/30 to-transparent"
        initial={{ top: "0%" }}
        animate={{ top: "100%" }}
        transition={{ duration: 6, repeat: Infinity, ease: "linear", repeatDelay: 2 }}
      />

      {/* Logo — top left */}
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, ease }}
        className="absolute left-5 top-5 md:left-8 md:top-7"
      >
        <Link href="/" aria-label={siteConfig.name}>
          <SiteLogo className="h-8 w-auto brightness-0 invert" priority />
        </Link>
      </motion.div>

      {/* Main content */}
      <motion.div
        className="relative flex flex-col items-center text-center"
        initial="hidden"
        animate="show"
        variants={{ show: { transition: { staggerChildren: 0.12, delayChildren: 0.15 } } }}
      >

        {/* 404 — outlined giant number */}
        <motion.div variants={item} transition={{ duration: 0.7, ease }}>
          <div className="relative select-none leading-none">
            {/* Background glow layer */}
            <span
              className="absolute inset-0 block font-heading font-black"
              style={{
                fontSize: "clamp(7rem, 28vw, 20rem)",
                color: "transparent",
                WebkitTextStroke: "1px rgba(20,184,166,0.15)",
                filter: "blur(24px)",
                userSelect: "none",
              }}
              aria-hidden="true"
            >
              404
            </span>
            {/* Main outlined text */}
            <span
              className="relative block font-heading font-black"
              style={{
                fontSize: "clamp(7rem, 28vw, 20rem)",
                color: "transparent",
                WebkitTextStroke: "1.5px rgba(255,255,255,0.18)",
                letterSpacing: "-0.03em",
              }}
            >
              404
            </span>
          </div>
        </motion.div>

        {/* Footprint + divider row */}
        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease }}
          className="mb-8 -mt-4 flex items-center gap-4"
        >
          <div className="h-px w-16 bg-gradient-to-r from-transparent to-teal-500/50" />
          <FootprintSvg className="size-5 text-teal-400/70" />
          <div className="h-px w-16 bg-gradient-to-l from-transparent to-teal-500/50" />
        </motion.div>

        {/* Title */}
        <motion.h1
          variants={item}
          transition={{ duration: 0.5, ease }}
          className="mb-3 text-2xl font-bold tracking-tight sm:text-3xl"
        >
          {title}
        </motion.h1>

        {/* Description */}
        <motion.p
          variants={item}
          transition={{ duration: 0.5, ease }}
          className="mb-8 max-w-xs text-pretty text-sm leading-relaxed text-white/45 sm:max-w-sm sm:text-base"
        >
          {description}
        </motion.p>

        {/* CTAs */}
        <motion.div
          variants={item}
          transition={{ duration: 0.5, ease }}
          className="flex flex-col gap-3 sm:flex-row"
        >
          <Link href="/" className={cn(buttonVariants({ size: "lg" }))}>
            {homeLabel}
          </Link>
          <Link
            href="/products"
            className={cn(
              buttonVariants({ variant: "outline", size: "lg" }),
              "border-white/15 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white"
            )}
          >
            {catalogLabel}
          </Link>
        </motion.div>
      </motion.div>

      {/* Bottom brand note */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.2, duration: 0.6 }}
        className="absolute bottom-6 text-[11px] tracking-widest text-white/20 uppercase"
      >
        {siteConfig.name}
      </motion.p>
    </div>
  )
}
