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
  const [debugMessage, setDebugMessage] = useState("")

  const [resumeCount, setResumeCount] = useState("0")
  const [jobCount, setJobCount] = useState("0")
  const [atsScore, setAtsScore] = useState("--")
  const [analysisCount, setAnalysisCount] = useState("0")

  useEffect(() => {
    loadDashboard()
  }, [])

  async function loadDashboard() {
    try {
      setDebugMessage("")

      const devPreview =
        process.env.NEXT_PUBLIC_DEV_PREVIEW === "true"

      if (devPreview) {
        setDebugMessage("Dev preview is ON, so live Supabase metrics are skipped.")
        setLoading(false)
        return
      }

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser()

      if (userError) {
        setDebugMessage(userError.message)
        setLoading(false)
        return
      }

      if (!user) {
        router.push("/login")
        return
      }

      const { count: resumes, error: resumeError } = await supabase
        .from("resumes")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (resumeError) {
        setDebugMessage(`Resume metric error: ${resumeError.message}`)
      }

      const { count: jobs, error: jobError } = await supabase
        .from("jobs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (jobError) {
        setDebugMessage(`Job metric error: ${jobError.message}`)
      }

      const { count: analyses, error: analysisCountError } = await supabase
        .from("ats_analyses")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)

      if (analysisCountError) {
        setDebugMessage(`ATS count error: ${analysisCountError.message}`)
      }

      const { data: latestAnalysis, error: latestAnalysisError } =
        await supabase
          .from("ats_analyses")
          .select("score, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle()

      if (latestAnalysisError) {
        setDebugMessage(`Latest ATS error: ${latestAnalysisError.message}`)
      }

      setResumeCount(String(resumes ?? 0))
      setJobCount(String(jobs ?? 0))
      setAnalysisCount(String(analyses ?? 0))

      setAtsScore(
        latestAnalysis?.score !== undefined &&
          latestAnalysis?.score !== null
          ? `${latestAnalysis.score}/100`
          : "--"
      )
    } catch (error) {
      console.error("Dashboard load error:", error)
      setDebugMessage("Dashboard failed to load metrics. Check console.")
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24 text-slate-400">
        Loading dashboard...
      </div>
    )
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

        <button
          onClick={loadDashboard}
          className="rounded-xl border border-white/10 px-5 py-3 text-sm text-slate-300 transition hover:bg-white/10 hover:text-white"
        >
          Refresh Metrics
        </button>
      </div>

      {debugMessage && (
        <div className="mb-6 rounded-xl border border-yellow-500/20 bg-yellow-500/10 p-4 text-sm text-yellow-200">
          {debugMessage}
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-3">
        <StatCard
          title="Saved Resumes"
          value={resumeCount}
          subtitle="Loaded from your resume records"
        />

        <StatCard
          title="Latest ATS Score"
          value={atsScore}
          subtitle={`${analysisCount} ATS analyses saved`}
        />

        <StatCard
          title="Applications Tracked"
          value={jobCount}
          subtitle="Loaded from your tracked jobs"
        />
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="text-xl font-bold">Resume Builder</h2>
          <p className="mt-3 text-slate-400">
            Build, save, rewrite, and export resumes with AI-assisted workflows.
          </p>
          <Link href="/dashboard/resume">
            <Button className="mt-5">Open Resume Builder</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">ATS Optimization</h2>
          <p className="mt-3 text-slate-400">
            Uses transparent scoring rules and saves historical ATS analyses.
          </p>
          <Link href="/dashboard/ats">
            <Button className="mt-5">Open ATS Engine</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Job Tracker</h2>
          <p className="mt-3 text-slate-400">
            Track applications, statuses, deadlines, and notes.
          </p>
          <Link href="/dashboard/jobs">
            <Button className="mt-5">Open Job Tracker</Button>
          </Link>
        </Card>

        <Card>
          <h2 className="text-xl font-bold">Automation Center</h2>
          <p className="mt-3 text-slate-400">
            CRM, email automation, outreach systems, and AI workflows will connect later.
          </p>
        </Card>
      </div>
    </motion.div>
  )
}