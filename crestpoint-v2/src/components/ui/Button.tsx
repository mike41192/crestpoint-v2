"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

export function Button({
  children,
  className,
  ...props
}: any) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.97 }}
      className={cn(
        "px-5 py-2 rounded-xl bg-gradient-to-r from-purple-600 to-cyan-400 text-black font-semibold shadow-glow",
        className
      )}
      {...props}
    >
      {children}
    </motion.button>
  )
}