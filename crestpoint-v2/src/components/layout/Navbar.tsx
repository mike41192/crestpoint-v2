"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/Button"

export function Navbar() {
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="flex justify-between items-center p-6"
    >
      <div className="text-xl font-bold">
        Crestpoint
      </div>

      <div className="flex gap-4">
        
      <Button
        onClick={() =>
          window.location.href = "/login"
        }
      >
        Login
      </Button>

      </div>
    </motion.div>
  )
}