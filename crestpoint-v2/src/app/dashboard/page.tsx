"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { StatCard } from "@/components/dashboard/StatCard"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [resumeCount, setResumeCount] = useState("0")
  const [jobCount, setJobCount] = useState("0")
  const [atsStatus, setAtsStatus] = useState("--")

  useEffect(() => {
    async function loadDashboard() {
      const devPreview =
        process.env.NEXT_PUBLIC_DEV_PREVIEW === "true"

      if (devPreview) {
        setLoading(false)
        return
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        router.push("/login")
        return
      }

      const { count: resumes } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      const { count: jobs } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      setResumeCount(String(resumes ?? 0))
      setJobCount(String(jobs ?? 0))
      setAtsStatus("Ready")
      setLoading(false)
    }

    loadDashboard()
  }, [router])

  if (loading) {
    return <div>Loading dashboard...</div>
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-10 flex flex-col justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-4xl font-bold">Dashboard</h1>
          <p className="mt-2 text-slate-400">
            Your AI-powered career growth system.
          </p>
        </div>

        <Link href="/dashboard/resume">
          <Button>Start Resume Optimization</Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Saved Resumes"
          value={resumeCount}
          subtitle="Loaded from your Supabase resume records"
        />

        <StatCard
          title="ATS Engine"
          value={atsStatus}
          subtitle="Score appears only after analysis"
        />

        <StatCard
          title="Applications Tracked"
          value={jobCount}
          subtitle="Loaded from your Supabase job records"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">Resume Builder</h2>
          <p className="mt-3 text-slate-400">
            Build, store, and improve resumes with AI-assisted workflows.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">ATS Optimization</h2>
          <p className="mt-3 text-slate-400">
            Uses transparent scoring rules based on keyword alignment and structure checks.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Job Tracker</h2>
          <p className="mt-3 text-slate-400">
            Track saved applications, statuses, deadlines, and notes.
          </p>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Automation Center</h2>
          <p className="mt-3 text-slate-400">
            Email, CRM, and workflow automation modules will connect later.
          </p>
        </Card>
      </div>
    </motion.div>
  )
}