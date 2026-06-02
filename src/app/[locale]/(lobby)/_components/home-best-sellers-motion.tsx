"use client"

import * as React from "react"
import { motion, useScroll, useTransform } from "framer-motion"

interface HomeBestSellersMotionProps {
  children: React.ReactNode
  className?: string
}

/** Solo desplazamiento vertical al entrar en viewport — sin fade. */
export function HomeBestSellersMotion({
  children,
  className,
}: HomeBestSellersMotionProps) {
  const ref = React.useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "start 0.42"],
  })

  const y = useTransform(scrollYProgress, [0, 1], [140, 0])

  return (
    <motion.div ref={ref} style={{ y }} className={className}>
      {children}
    </motion.div>
  )
}
