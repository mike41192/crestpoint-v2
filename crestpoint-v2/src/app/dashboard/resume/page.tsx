"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"

export default function ResumeBuilderPage() {
  const [resumeId, setResumeId] = useState<string | null>(null)
  const [fullName, setFullName] = useState("")
  const [targetRole, setTargetRole] = useState("")
  const [summary, setSummary] = useState("")
  const [experience, setExperience] = useState("")
  const [skills, setSkills] = useState("")
  const [status, setStatus] = useState("")

  useEffect(() => {
    async function loadResume() {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data } = await supabase
        .from("resumes")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle()

      if (data) {
        setResumeId(data.id)
        setFullName(data.full_name || "")
        setTargetRole(data.target_role || "")
        setSummary(data.summary || "")
        setExperience(data.experience || "")
        setSkills(data.skills || "")
      }
    }

    loadResume()
  }, [])

  async function saveResume() {
    setStatus("Saving...")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setStatus("You must be logged in to save.")
      return
    }

    const payload = {
      user_id: user.id,
      full_name: fullName,
      target_role: targetRole,
      summary,
      experience,
      skills,
      updated_at: new Date().toISOString(),
    }

    const query = resumeId
      ? supabase
          .from("resumes")
          .update(payload)
          .eq("id", resumeId)
          .select()
          .single()
      : supabase
          .from("resumes")
          .insert(payload)
          .select()
          .single()

    const { data, error } = await query

    if (error) {
      setStatus(error.message)
      return
    }

    setResumeId(data.id)
    setStatus("Resume saved successfully.")
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Resume Builder</h1>
        <p className="mt-2 text-slate-400">
          Build and save a real ATS-friendly resume profile.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <h2 className="mb-6 text-2xl font-bold">
            Resume Details
          </h2>

          <div className="space-y-4">
            <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none" placeholder="Full name" value={fullName} onChange={(e) => setFullName(e.target.value)} />

            <input className="w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none" placeholder="Target role" value={targetRole} onChange={(e) => setTargetRole(e.target.value)} />

            <textarea className="min-h-28 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none" placeholder="Professional summary" value={summary} onChange={(e) => setSummary(e.target.value)} />

            <textarea className="min-h-36 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none" placeholder="Experience" value={experience} onChange={(e) => setExperience(e.target.value)} />

            <textarea className="min-h-24 w-full rounded-xl border border-white/10 bg-black/30 p-3 outline-none" placeholder="Skills" value={skills} onChange={(e) => setSkills(e.target.value)} />

            <Button className="w-full" onClick={saveResume}>
              Save Resume Draft
            </Button>

            {status && (
              <p className="text-sm text-slate-400">{status}</p>
            )}
          </div>
        </Card>

        <Card>
          <h2 className="mb-6 text-2xl font-bold">Live Preview</h2>

          <div className="rounded-2xl bg-white p-6 text-black">
            <h1 className="text-3xl font-bold">
              {fullName || "Your Name"}
            </h1>

            <p className="mt-1 font-medium text-slate-700">
              {targetRole || "Target Role"}
            </p>

            <hr className="my-5" />

            <h3 className="font-bold">Professional Summary</h3>
            <p className="mt-2 text-sm text-slate-700">
              {summary || "Your summary will appear here."}
            </p>

            <h3 className="mt-5 font-bold">Experience</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
              {experience || "Your experience will appear here."}
            </p>

            <h3 className="mt-5 font-bold">Skills</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-slate-700">
              {skills || "Your skills will appear here."}
            </p>
          </div>
        </Card>
      </div>
    </motion.div>
  )
}
