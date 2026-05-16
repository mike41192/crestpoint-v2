
"use client"

import { motion } from "framer-motion"
import { Navbar } from "@/components/layout/Navbar"
import { Button } from "@/components/ui/Button"
import { Card } from "@/components/ui/Card"

export default function Home() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      <div className="flex flex-col items-center justify-center mt-20 text-center px-6">
        
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-5xl font-bold leading-tight"
        >
          Build Your Career AI Engine
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gray-400 mt-4 max-w-xl"
        >
          Crestpoint automates resumes, ATS optimization, and job applications with intelligent AI workflows.
        </motion.p>

        <motion.div
          className="mt-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          <Button>Get Started</Button>
        </motion.div>
        
        <div className="grid md:grid-cols-3 gap-6 mt-20 w-full max-w-5xl">
          <Card>AI Resume Builder</Card>
          <Card>ATS Optimization</Card>
          <Card>Job Tracking System</Card>
        </div>
      </div>
    </main>
  )
}